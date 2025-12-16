import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionTier } from './entities/subscription-tier.entity';
import {
  UserSubscription,
  SubscriptionStatus,
  PaymentFrequency,
} from './entities/user-subscription.entity';
import { User } from '../users/entities/user.entity';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionTier)
    private readonly tierRepository: Repository<SubscriptionTier>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllTiers(): Promise<SubscriptionTier[]> {
    return await this.tierRepository.find({
      where: { is_active: true },
      order: { access_level: 'ASC' },
    });
  }

  async getTierById(id: string): Promise<SubscriptionTier> {
    const tier = await this.tierRepository.findOne({ where: { id } });
    if (!tier) {
      throw new NotFoundException(`Subscription tier with ID ${id} not found`);
    }
    return tier;
  }

  async getTierByCode(code: string): Promise<SubscriptionTier> {
    const tier = await this.tierRepository.findOne({
      where: { tier_code: code },
    });
    if (!tier) {
      throw new NotFoundException(`Subscription tier ${code} not found`);
    }
    return tier;
  }

  async subscribe(
    userId: string,
    subscribeDto: SubscribeDto,
  ): Promise<UserSubscription> {
    // Get user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get tier
    const tier = await this.getTierById(subscribeDto.tier_id);

    // Check location-based restriction for Premium+
    if (tier.requires_botswana_citizenship && user.country_code !== 'BW') {
      throw new ForbiddenException(
        'Premium+ subscription is only available to Botswana citizens',
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        'User already has an active subscription. Please cancel existing subscription first.',
      );
    }

    // Determine currency and amount
    const currency = subscribeDto.currency || (user.country_code === 'BW' ? 'BWP' : 'ZAR');
    const amount = Number(currency === 'BWP' ? tier.price_bwp : tier.price_zar);

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      user_id: userId,
      tier_id: tier.id,
      status: amount === 0 ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING_PAYMENT,
      start_date: new Date(),
      payment_frequency: subscribeDto.payment_frequency || PaymentFrequency.MONTHLY,
      currency,
      amount,
      webinar_credits_remaining: tier.webinars_per_year,
      auto_renew: true,
      months_unpaid: 0,
    });

    // Calculate next billing date
    if (amount > 0) {
      const nextBilling = new Date();
      if (subscription.payment_frequency === PaymentFrequency.MONTHLY) {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      } else {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }
      subscription.next_billing_date = nextBilling;
    }

    return await this.subscriptionRepository.save(subscription);
  }

  async getUserActiveSubscription(userId: string): Promise<UserSubscription | null> {
    return await this.subscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['tier'],
    });
  }

  async getUserSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
    return await this.subscriptionRepository.find({
      where: { user_id: userId },
      relations: ['tier'],
      order: { created_at: 'DESC' },
    });
  }

  async cancelSubscription(userId: string): Promise<UserSubscription> {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.end_date = new Date();
    subscription.auto_renew = false;

    return await this.subscriptionRepository.save(subscription);
  }

  async confirmPayment(subscriptionId: string): Promise<UserSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.months_unpaid = 0;

    return await this.subscriptionRepository.save(subscription);
  }
}
