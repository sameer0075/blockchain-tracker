import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import PostgreStatusCode from 'src/common/enums/ErrorCodes';
import { BaseService } from 'src/common/services/base.service';
import { EmailService } from 'src/common/services/mailer.service';
import { getTokenPrice } from 'src/common/strategies/moralise.strategy';
import { Alert } from 'src/shared/entities/alert.entity';
import { Chain } from 'src/shared/entities/chain.entity';

@Injectable()
export class AlertService {
  private alertRep: BaseService<Alert>;
  private chainRep: BaseService<Chain>;
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,

    @InjectRepository(Chain)
    private chainRepository: Repository<Chain>,
    private readonly emailService: EmailService,
  ) {
    this.alertRep = new BaseService<Alert>(this.alertRepository, Alert.name);

    this.chainRep = new BaseService<Chain>(this.chainRepository, Chain.name);
  }

  /**
   * Create a new alert. If the alert already exists, it will be updated.
   * @param body The data to create the alert with.
   * @returns The created or updated alert.
   */
  async create(body) {
    const { chain, target_price, email } = body;

    // Check if the alert already exists
    const alertExist = await this.alertRepository
      .createQueryBuilder('alert')
      .select('*')
      .where('alert.chain = :chain', { chain })
      .andWhere('alert.email = :email', { email })
      .getRawOne();

    let alertData;
    if (alertExist) {
      // If the alert exists, update it
      alertExist.target_price = target_price;
      alertData = await this.alertRepository.save(alertExist);
    } else {
      // If the alert doesn't exist, create it
      const alert = this.alertRepository.create({
        chain,
        target_price,
        email,
      });

      alertData = await this.alertRep.save(alert);
    }
    return alertData;
  }

  /**
   * Checks all the alerts and triggers the ones that should be triggered.
   * An alert should be triggered if the current price of the chain is greater than or equal to the target price.
   */
  async checkAlerts(): Promise<void> {
    /**
     * Find all the alerts that haven't been triggered yet.
     * We include the chain in the query because we need it to fetch the current price.
     */
    const alerts: any = await this.alertRep.findAll({
      where: { is_triggered: false },
      relations: ['chain'],
    });

    /**
     * Loop through each alert and check if it should be triggered.
     */
    for (const alert of alerts) {
      /**
       * Fetch the current price of the chain.
       * We use the getCurrentPrice function to implement this.
       */
      const currentPrice = await this.getCurrentPrice(alert.chain.id);

      /**
       * If the current price is greater than or equal to the target price, trigger the alert.
       */
      if (currentPrice >= alert.target_price) {
        await this.triggerAlert(alert, alert.chain.name);
      }
    }
  }

  /**
   * Gets the current price for a given chain.
   * @param chainId The id of the chain to get the current price for.
   * @returns The current price of the chain.
   * @throws HttpException if the chain is not found.
   */
  async getCurrentPrice(chainId: number): Promise<number> {
    const chain = await this.chainRep.findOne({ where: { id: chainId } });
    if (chain.symbol === 'WETH') {
      // Get the current price of Ethereum
      const etheriumData = await getTokenPrice(
        '0x1',
        'percent_change',
        process.env.ETH_ADDRESS,
      );
      return etheriumData.jsonResponse.usdPrice;
    } else if (chain.symbol === 'POL') {
      // Get the current price of Polygon
      const polygonData = await getTokenPrice(
        '0x1',
        'percent_change',
        process.env.POLYGON_ADDRESS,
      );
      return polygonData.jsonResponse.usdPrice;
    } else {
      // Chain not found, throw an error
      throw new HttpException(
        'Chain not found!',
        PostgreStatusCode.NotFoundError,
      );
    }
  }

  /**
   * Trigger an alert by sending an email to the user and updating the alert's status.
   * @param alert The alert to trigger.
   * @param chainName The name of the chain that triggered the alert.
   * @returns A promise that resolves when the alert is triggered.
   */
  async triggerAlert(alert: Alert, chainName: string): Promise<void> {
    // Mark alert as triggered
    alert.is_triggered = true;
    // Update the alert in the database
    await this.alertRep.update(alert.id, alert);
    // Send email notification
    // TODO: This should use a template and not a plain text email
    await this.emailService.sendPlainTextEmail(
      alert.email,
      'Price Alert Triggered',
      `The price for ${chainName} has reached your target of $${alert.target_price}.`,
    );
  }
}
