import { Controller, Post, Body } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseTags } from 'src/common/helper/decorators/api-response-tags.decorator';
import { AlertDto } from './dto/request.dto';

@ApiTags('Alerts')
@ApiResponseTags()
@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  create(@Body() createAlertDto: AlertDto) {
    return this.alertService.create(createAlertDto);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAlerts() {
    await this.alertService.checkAlerts();
  }
}
