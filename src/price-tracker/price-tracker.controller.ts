import { Controller, Get, Post, Body } from '@nestjs/common';
import { PriceTrackerService } from './price-tracker.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseTags } from 'src/common/helper/decorators/api-response-tags.decorator';
import { PriceEndpoints } from 'src/shared/endpoints';

@ApiTags('Price Tracker')
@ApiResponseTags()
@Controller('price-tracker')
export class PriceTrackerController {
  constructor(private readonly priceTrackerService: PriceTrackerService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchPrices() {
    await this.priceTrackerService.fetchPrices();
  }

  @Get(PriceEndpoints.getHourlyPrice())
  async getHourlyPrices() {
    return await this.priceTrackerService.findHourlyPrices();
  }

  @Post(PriceEndpoints.swapRate())
  async swapRate(@Body() data: { ethAmount: number }) {
    return await this.priceTrackerService.swapRate(data.ethAmount);
  }
}
