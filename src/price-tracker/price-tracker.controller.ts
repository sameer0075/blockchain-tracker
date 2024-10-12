import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PriceTrackerService } from './price-tracker.service';
import { Cron, CronExpression } from '@nestjs/schedule';


@Controller('price-tracker')
export class PriceTrackerController {
  constructor(private readonly priceTrackerService: PriceTrackerService) {}

  @Cron(CronExpression.EVERY_5_MINUTES) 
  async fetchPrices() {
    await this.priceTrackerService.fetchPrices();
  }

  @Get('hourly')
  async getHourlyPrices() {
    return await this.priceTrackerService.findHourlyPrices();
  }
}
