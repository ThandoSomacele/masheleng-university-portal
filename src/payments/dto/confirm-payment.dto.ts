import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiPropertyOptional({ example: 'TXN123456789' })
  @IsOptional()
  @IsString()
  external_transaction_id?: string;

  @ApiPropertyOptional({ example: 'Payment confirmed via bank transfer' })
  @IsOptional()
  @IsString()
  notes?: string;
}
