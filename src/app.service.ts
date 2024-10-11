import { Injectable } from '@nestjs/common';
import { getTokenPrice } from './common/strategies/moralise.strategy';

@Injectable()
export class AppService {
  async getHello() {
    const etheriumData = await getTokenPrice("0x1", "percent_change",process.env.ETH_ADDRESS);
    const polygonData = await getTokenPrice("0x1", "percent_change",process.env.POLYGON_ADDRESS);
    return { etheriumData, polygonData }
  }
}
