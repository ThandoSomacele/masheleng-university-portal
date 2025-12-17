import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { InsurancePolicy } from './entities/insurance-policy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsurancePolicy]),
    HttpModule,
  ],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
