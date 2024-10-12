import { Module } from '@nestjs/common';
import { PriceTrackerService } from './price-tracker.service';
import { PriceTrackerController } from './price-tracker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from 'src/shared/entities/price.entity';
import { Chain } from 'src/shared/entities/chain.entity';
import { EmailService } from 'src/common/services/mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price, Chain])],
  controllers: [PriceTrackerController],
  providers: [PriceTrackerService, EmailService],
  exports: [PriceTrackerService],
})
export class PriceTrackerModule {}
