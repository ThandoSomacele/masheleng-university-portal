import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionTier } from './subscription-tier.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING_PAYMENT = 'pending_payment',
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  ANNUALLY = 'annually',
}

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  tier_id: string;

  @ManyToOne(() => SubscriptionTier)
  @JoinColumn({ name: 'tier_id' })
  tier: SubscriptionTier;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp with time zone' })
  start_date: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  end_date: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  next_billing_date: Date;

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    default: PaymentFrequency.MONTHLY,
  })
  payment_frequency: PaymentFrequency;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'int', default: 0 })
  months_unpaid: number;

  @Column({ type: 'int', default: 0 })
  webinar_credits_remaining: number;

  @Column({ type: 'boolean', default: true })
  auto_renew: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
