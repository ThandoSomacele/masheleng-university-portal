import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('subscription_tiers')
export class SubscriptionTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  tier_code: string;

  @Column({ type: 'varchar', length: 100 })
  tier_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_bwp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_zar: number;

  @Column({ type: 'int' })
  access_level: number;

  @Column({ type: 'boolean', default: false })
  requires_botswana_citizenship: boolean;

  @Column({ type: 'int', default: 0 })
  webinars_per_year: number;

  @Column({ type: 'boolean', default: false })
  includes_insurance: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  funeral_cover_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  life_cover_amount: number;

  @Column({ type: 'int', nullable: true })
  mentorship_discount_percent: number;

  @Column({ type: 'int', nullable: true })
  consultation_discount_percent: number;

  @Column({ type: 'int', nullable: true })
  seminar_discount_percent: number;

  @Column({ type: 'text', nullable: true })
  features_json: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
