import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailService } from 'src/common/services/mailer.service';
import { Alert } from 'src/shared/entities/alert.entity';
import { Chain } from 'src/shared/entities/chain.entity';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Chain])],
  controllers: [AlertController],
  providers: [AlertService, EmailService],
})
export class AlertModule {}
