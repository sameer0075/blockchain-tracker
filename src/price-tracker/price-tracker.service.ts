import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PostgreStatusCode from 'src/common/enums/ErrorCodes';
import { BaseService } from 'src/common/services/base.service';
import { EmailService } from 'src/common/services/mailer.service';
import { getHistoricalBlock, getTokenPrice } from 'src/common/strategies/moralise.strategy';
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
    private readonly emailService: EmailService
  ) {
    this.chainRep = new BaseService<Chain>(
      this.chainRepository,
      Chain.name,
    );

    this.priceRep = new BaseService<Price>(
      this.priceRepository,
      Price.name,
    );
  }

  // COmparing 3 percent price
  async comparePrice(currentEthPrice: number, currentPolygonPrice: number) {
    const ethBlock: any = await getHistoricalBlock("0x1",process.env.ETH_ADDRESS);
    const polygonBlock: any = await getHistoricalBlock("0x1",process.env.POLYGON_ADDRESS);
    const historicalEthPrice = ethBlock.jsonResponse.usdPrice;
    const historicalPolygonPrice = polygonBlock.jsonResponse.usdPrice;
    const ethPriceChangePercentage = ((currentEthPrice - historicalEthPrice) / historicalEthPrice) * 100;
    const polygonPriceChangePercentage = ((currentPolygonPrice - historicalPolygonPrice) / historicalPolygonPrice) * 100;
      // Check if Ethereum price increased by more than 3%
      if (ethPriceChangePercentage > 3) {
        await this.emailService.sendPlainTextEmail(process.env.ALERT_ADDRESS, "Ethereum Price Alert", "Ethereum price has increased by more than 3%.");
    }

    // Check if Polygon price increased by more than 3%
    if (polygonPriceChangePercentage > 3) {
        await this.emailService.sendPlainTextEmail(process.env.ALERT_ADDRESS, "Polygon Price Alert", "Polygon price has increased by more than 3%.");
    }
  }
  
  async fetchPrices() {
    console.log('fetching prices')
    try {
      let ethereumExist = await this.chainRep.findOne({
        where: { symbol: 'WETH' },
      })
      let polygonExist = await this.chainRep.findOne({
        where: { symbol: 'POL' },
      })
      if(!ethereumExist) {
        ethereumExist = await this.chainRep.save({
          name: 'Ethereum',
          symbol: 'WETH',
        })
      }
  
      if(!polygonExist) {
        polygonExist = await this.chainRep.save({
          name: 'Polygon',
          symbol: 'POL',
        })
      }
  
      const etheriumData = await getTokenPrice("0x1", "percent_change",process.env.ETH_ADDRESS);
      const polygonData = await getTokenPrice("0x1", "percent_change",process.env.POLYGON_ADDRESS);

      if(etheriumData && polygonData) {
        const ethereumPrice = {
          chain: ethereumExist,
          price: etheriumData.jsonResponse.usdPrice,
          timestamp: new Date()
        };
    
        const polygonPrice = {
          chain: polygonExist,
          price: polygonData.jsonResponse.usdPrice,
          timestamp: new Date()
        }; 

        await this.comparePrice(etheriumData.jsonResponse.usdPrice,polygonData.jsonResponse.usdPrice)
  
        return await this.priceRep.save([ethereumPrice, polygonPrice]);
      }
    } catch(error) {
      console.log(error)
      throw new HttpException(error.message, PostgreStatusCode.InternalServerError)
    }
  }

  async findHourlyPrices() {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      let ethereumExist = await this.chainRep.findOne({
        where: { symbol: 'WETH' },
      })
      let polygonExist = await this.chainRep.findOne({
        where: { symbol: 'POL' },
      })
      const ethereumPastData = await this.priceRepository.createQueryBuilder('price')
        .select("price.*")
        .where('price.timestamp >= :pastDate', { pastDate })
        .andWhere('price.timestamp <= :now', { now })
        .andWhere("price.chainId = :chainId", { chainId:ethereumExist.id })
        .orderBy('price.timestamp', 'ASC')
        .getRawMany();

        console.log('ethereumPastData',ethereumPastData)
  
        const polygonPastData = await this.priceRepository.createQueryBuilder('price')
        .select("price.*")
        .where('price.timestamp >= :pastDate', { pastDate })
        .andWhere('price.timestamp <= :now', { now })
        .andWhere("price.chainId = :chainId", { chainId:polygonExist.id })
        .orderBy('price.timestamp', 'ASC')
        .getRawMany();
  
        const ethereumPrices = ethereumPastData.map(price => ({
          timestamp: price.timestamp,
          polygonPrice: price.price,
        }));
  
        const polygonPrices = polygonPastData.map(price => ({
          timestamp: price.timestamp,
          polygonPrice: price.price,
        }));
  
        return { 
          ethereumPrices,
          polygonPrices
         }
    } catch(error) {
      throw new HttpException(error.message, PostgreStatusCode.InternalServerError)
    }
  }
}
