import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentFrequency } from '../entities/user-subscription.entity';

export class SubscribeDto {
  @ApiProperty({ example: 'uuid-of-subscription-tier' })
  @IsUUID()
  tier_id: string;

  @ApiPropertyOptional({ enum: PaymentFrequency, default: PaymentFrequency.MONTHLY })
  @IsOptional()
  @IsEnum(PaymentFrequency)
  payment_frequency?: PaymentFrequency;

  @ApiPropertyOptional({ example: 'BWP', description: 'Currency code (BWP or ZAR)' })
  @IsOptional()
  currency?: string;
}
