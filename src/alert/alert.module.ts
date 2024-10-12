import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { EmailService } from 'src/common/services/mailer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from 'src/shared/entities/alert.entity';
import { Chain } from 'src/shared/entities/chain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Chain])],
  controllers: [AlertController],
  providers: [AlertService, EmailService],
})
export class AlertModule {}
