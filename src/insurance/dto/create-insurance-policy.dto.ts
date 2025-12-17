import {
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InsuranceType } from '../entities/insurance-policy.entity';

class BeneficiaryDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}

class MedicalInfoDto {
  @IsBoolean()
  hasPreExistingConditions: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];
}

export class CreateInsurancePolicyDto {
  @IsEnum(InsuranceType)
  type: InsuranceType;

  @IsNumber()
  @Min(0)
  premium: number;

  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeneficiaryDto)
  beneficiaries?: BeneficiaryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInfoDto)
  medicalInfo?: MedicalInfoDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
