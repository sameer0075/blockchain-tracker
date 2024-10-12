import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  create(@Body() createAlertDto) {
    return this.alertService.create(createAlertDto);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.alertService.checkAlerts();
  }
}
