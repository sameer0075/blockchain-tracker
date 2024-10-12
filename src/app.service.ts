import { Injectable } from '@nestjs/common';
import { getHistoricalBlock, getTokenPrice } from './common/strategies/moralise.strategy';

@Injectable()
export class AppService {
  async getHello() {
    const ethBlock: any = await getHistoricalBlock("0x1",process.env.ETH_ADDRESS);
    const polygonBlock: any = await getHistoricalBlock("0x1",process.env.POLYGON_ADDRESS);
    const etheriumData = await getTokenPrice("0x1", "percent_change",process.env.ETH_ADDRESS);
    const polygonData = await getTokenPrice("0x1", "percent_change",process.env.POLYGON_ADDRESS);
    console.log("ethBlock",ethBlock.jsonResponse.usdPrice)
    console.log("polygonBlock",polygonBlock.jsonResponse.usdPrice)

    console.log("new ethBlock",etheriumData.jsonResponse.usdPrice)
    console.log("new polygonBlock",polygonData.jsonResponse.usdPrice)
    return {
      ethBlock,
      polygonBlock
    };
  }
}
