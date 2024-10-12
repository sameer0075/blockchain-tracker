import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PostgreStatusCode from 'src/common/enums/ErrorCodes';
import { BaseService } from 'src/common/services/base.service';
import { EmailService } from 'src/common/services/mailer.service';
import { getTokenPrice } from 'src/common/strategies/moralise.strategy';
import { Alert } from 'src/shared/entities/alert.entity';
import { Chain } from 'src/shared/entities/chain.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AlertService {
  private alertRep: BaseService<Alert>;
  private chainRep: BaseService<Chain>;
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,

    @InjectRepository(Chain)
    private chainRepository: Repository<Chain>,
    private readonly emailService: EmailService
  ) {
    this.alertRep = new BaseService<Alert>(
      this.alertRepository,
      Alert.name,
    );

    this.chainRep = new BaseService<Chain>(
      this.chainRepository,
      Chain.name,
    );
  }

  async create(body) {
    const { chain,target_price,email } = body;

    const alertExist = await this.alertRepository.createQueryBuilder('alert')
    .select("*")
    .where("alert.chain = :chain", { chain })
    .andWhere("alert.email = :email", { email })
    .getRawOne();

    let alertData
    if(alertExist) {
      alertExist.target_price = target_price;
      alertData = await this.alertRepository.save(alertExist)
    } else {
      const alert = this.alertRepository.create({
        chain,
        target_price,
        email,
      });

      alertData = await this.alertRep.save(alert);
    }
    return alertData
  }

  async checkAlerts(): Promise<void> {
    const alerts: any = await this.alertRep.findAll({ where: { is_triggered: false }, relations: ['chain'] });
    for (const alert of alerts) {
      const currentPrice = await this.getCurrentPrice(alert.chain.id); // Implement this function to fetch the current price
      if (currentPrice >= alert.target_price) {
        await this.triggerAlert(alert,alert.chain.name);
      }
    }
  }

  async getCurrentPrice(chainId: number){
    const chain = await this.chainRep.findOne({ where: { id: chainId } });
    if(chain.symbol === 'WETH') {
      const etheriumData = await getTokenPrice("0x1", "percent_change",process.env.ETH_ADDRESS);
      return etheriumData.jsonResponse.usdPrice
    } else if(chain.symbol === 'POL') {
      const polygonData = await getTokenPrice("0x1", "percent_change",process.env.POLYGON_ADDRESS);
      return polygonData.jsonResponse.usdPrice
    } else {
      throw new HttpException('Chain not ound!', PostgreStatusCode.NotFoundError)
    }
  }

  async triggerAlert(alert: Alert,chainName: string): Promise<void> {
    // Mark alert as triggered
    alert.is_triggered = true;
    await this.alertRep.update(alert.id,alert);
    // Send email notification
    await this.emailService.sendPlainTextEmail(alert.email, "Price Alert Triggered", `The price for ${chainName} has reached your target of $${alert.target_price}.`)
  }
}
