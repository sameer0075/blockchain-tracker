import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PostgreStatusCode from 'src/common/enums/ErrorCodes';
import { BaseService } from 'src/common/services/base.service';
import { EmailService } from 'src/common/services/mailer.service';
import {
  getBtcPriceInUsd,
  getHistoricalBlock,
  getTokenPrice,
} from 'src/common/strategies/moralise.strategy';
import { Chain } from 'src/shared/entities/chain.entity';
import { Price } from 'src/shared/entities/price.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PriceTrackerService {
  private chainRep: BaseService<Chain>;
  private priceRep: BaseService<Price>;

  constructor(
    @InjectRepository(Chain)
    private chainRepository: Repository<Chain>,
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private readonly emailService: EmailService,
  ) {
    this.chainRep = new BaseService<Chain>(this.chainRepository, Chain.name);

    this.priceRep = new BaseService<Price>(this.priceRepository, Price.name);
  }

  /**
   * Compare the current price with the historical price and send an email
   * if the price has increased by more than 3%.
   * @param currentEthPrice The current price of Ethereum.
   * @param currentPolygonPrice The current price of Polygon.
   */
  async comparePrice(currentEthPrice: number, currentPolygonPrice: number) {
    const ethBlock: any = await getHistoricalBlock(
      '0x1',
      process.env.ETH_ADDRESS,
    );
    const polygonBlock: any = await getHistoricalBlock(
      '0x1',
      process.env.POLYGON_ADDRESS,
    );
    const historicalEthPrice = ethBlock.jsonResponse.usdPrice;
    const historicalPolygonPrice = polygonBlock.jsonResponse.usdPrice;

    // Calculate the price change percentage
    const ethPriceChangePercentage =
      ((currentEthPrice - historicalEthPrice) / historicalEthPrice) * 100;
    const polygonPriceChangePercentage =
      ((currentPolygonPrice - historicalPolygonPrice) /
        historicalPolygonPrice) *
      100;

    // Check if Ethereum price increased by more than 3%
    if (ethPriceChangePercentage > 3) {
      // Send an email if the price has increased by more than 3%
      await this.emailService.sendPlainTextEmail(
        process.env.ALERT_ADDRESS,
        'Ethereum Price Alert',
        `Ethereum price has increased by more than 3% (${ethPriceChangePercentage.toFixed(
          2,
        )}%) from $${historicalEthPrice.toFixed(
          2,
        )} to $${currentEthPrice.toFixed(2)}.`,
      );
    }

    // Check if Polygon price increased by more than 3%
    if (polygonPriceChangePercentage > 3) {
      // Send an email if the price has increased by more than 3%
      await this.emailService.sendPlainTextEmail(
        process.env.ALERT_ADDRESS,
        'Polygon Price Alert',
        `Polygon price has increased by more than 3% (${polygonPriceChangePercentage.toFixed(
          2,
        )}%) from $${historicalPolygonPrice.toFixed(
          2,
        )} to $${currentPolygonPrice.toFixed(2)}.`,
      );
    }
  }

  /**
   * Fetches the current price of Ethereum and Polygon and saves them to the database.
   * It also checks if the price has increased by more than 3% and sends an email alert.
   * @returns The saved price records.
   */
  async fetchPrices() {
    Logger.log('fetching prices');
    try {
      // Check if Ethereum and Polygon exist in the database
      let ethereumExist = await this.chainRep.findOne({
        where: { symbol: 'WETH' },
      });
      let polygonExist = await this.chainRep.findOne({
        where: { symbol: 'POL' },
      });

      // If Ethereum doesn't exist, create it
      if (!ethereumExist) {
        ethereumExist = await this.chainRep.save({
          name: 'Ethereum',
          symbol: 'WETH',
        });
      }

      // If Polygon doesn't exist, create it
      if (!polygonExist) {
        polygonExist = await this.chainRep.save({
          name: 'Polygon',
          symbol: 'POL',
        });
      }

      // Get the current price of Ethereum and Polygon
      const etheriumData = await getTokenPrice(
        '0x1',
        'percent_change',
        process.env.ETH_ADDRESS,
      );
      const polygonData = await getTokenPrice(
        '0x1',
        'percent_change',
        process.env.POLYGON_ADDRESS,
      );

      // If the prices are valid, create price records and save them to the database
      if (etheriumData && polygonData) {
        const ethereumPrice = {
          chain: ethereumExist,
          price: etheriumData.jsonResponse.usdPrice,
          timestamp: new Date(),
        };

        const polygonPrice = {
          chain: polygonExist,
          price: polygonData.jsonResponse.usdPrice,
          timestamp: new Date(),
        };

        // Check if the price has increased by more than 3%
        await this.comparePrice(
          etheriumData.jsonResponse.usdPrice,
          polygonData.jsonResponse.usdPrice,
        );

        // Save the price records to the database
        return await this.priceRep.save([ethereumPrice, polygonPrice]);
      }
    } catch (error) {
      // If there's an error, log it and throw a 500 error
      Logger.log(error);
      throw new HttpException(
        error.message,
        PostgreStatusCode.InternalServerError,
      );
    }
  }

  /**
   * Find the hourly prices for the past 24 hours for Ethereum and Polygon
   * @returns an object with two properties: ethereumPrices and polygonPrices
   * Each property is an array of objects with two properties: timestamp and price
   */
  async findHourlyPrices() {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      const ethereumExist = await this.chainRep.findOne({
        where: { symbol: 'WETH' },
      });
      const polygonExist = await this.chainRep.findOne({
        where: { symbol: 'POL' },
      });

      // Find the prices for Ethereum in the past 24 hours
      const ethereumPastData = await this.priceRepository
        .createQueryBuilder('price')
        .select('price.*')
        .where('price.timestamp >= :pastDate', { pastDate })
        .andWhere('price.timestamp <= :now', { now })
        .andWhere('price.chainId = :chainId', { chainId: ethereumExist.id })
        .orderBy('price.timestamp', 'ASC')
        .getRawMany();

      // Find the prices for Polygon in the past 24 hours
      const polygonPastData = await this.priceRepository
        .createQueryBuilder('price')
        .select('price.*')
        .where('price.timestamp >= :pastDate', { pastDate })
        .andWhere('price.timestamp <= :now', { now })
        .andWhere('price.chainId = :chainId', { chainId: polygonExist.id })
        .orderBy('price.timestamp', 'ASC')
        .getRawMany();

      // Map the prices to the desired format
      const ethereumPrices = ethereumPastData.map((price) => ({
        timestamp: price.timestamp,
        ethereumPrice: price.price,
      }));

      const polygonPrices = polygonPastData.map((price) => ({
        timestamp: price.timestamp,
        polygonPrice: price.price,
      }));

      return {
        ethereumPrices,
        polygonPrices,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        PostgreStatusCode.InternalServerError,
      );
    }
  }

  async swapRate(ethAmount: number) {
    const btcUsdPrice = await getBtcPriceInUsd();
    const etheriumData = await getTokenPrice(
      '0x1',
      'percent_change',
      process.env.ETH_ADDRESS,
    );

    const ethUsdPrice = etheriumData.jsonResponse.usdPrice;
    const btcAmount = (ethAmount * ethUsdPrice) / btcUsdPrice;

    // Calculate the total fee (3%)
    const feePercentage = 0.03;
    const totalFeeEth = ethAmount * feePercentage;
    const totalFeeUsd = totalFeeEth * ethUsdPrice;

    return {
      btcAmount: btcAmount,
      totalFeeEth: totalFeeEth,
      totalFeeUsd: totalFeeUsd,
    };
  }
}
