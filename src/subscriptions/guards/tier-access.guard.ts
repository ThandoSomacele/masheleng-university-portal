import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../subscriptions.service';

export const REQUIRED_TIER = 'requiredTier';

@Injectable()
export class TierAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccessLevel = this.reflector.getAllAndOverride<number>(
      REQUIRED_TIER,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAccessLevel) {
      return true; // No tier requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's active subscription
    const subscription = await this.subscriptionsService.getUserActiveSubscription(
      user.id,
    );

    if (!subscription) {
      throw new ForbiddenException(
        'No active subscription. Please subscribe to access this resource.',
      );
    }

    // Check if user's tier meets the required access level
    if (subscription.tier.access_level < requiredAccessLevel) {
      throw new ForbiddenException(
        `This resource requires ${this.getTierName(requiredAccessLevel)} subscription or higher.`,
      );
    }

    return true;
  }

  private getTierName(accessLevel: number): string {
    switch (accessLevel) {
      case 1:
        return 'Entry';
      case 2:
        return 'Premium';
      case 3:
        return 'Premium+';
      default:
        return 'Unknown';
    }
  }
}
