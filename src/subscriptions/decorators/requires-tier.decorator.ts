import { SetMetadata } from '@nestjs/common';
import { REQUIRED_TIER } from '../guards/tier-access.guard';

export enum TierLevel {
  ENTRY = 1,
  PREMIUM = 2,
  PREMIUM_PLUS = 3,
}

export const RequiresTier = (accessLevel: TierLevel) =>
  SetMetadata(REQUIRED_TIER, accessLevel);
