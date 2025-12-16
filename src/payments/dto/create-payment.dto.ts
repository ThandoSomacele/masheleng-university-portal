import { IsUUID, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-subscription' })
  @IsUUID()
  subscription_id: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'BWP' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.MANUAL })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Payment for January 2025' })
  @IsOptional()
  @IsString()
  notes?: string;
}
