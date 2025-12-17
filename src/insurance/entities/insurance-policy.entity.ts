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

export enum InsuranceStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum InsuranceType {
  LIFE = 'life',
  HEALTH = 'health',
  EDUCATION = 'education',
  DISABILITY = 'disability',
}

@Entity('insurance_policies')
export class InsurancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: InsuranceType,
    default: InsuranceType.EDUCATION,
  })
  type: InsuranceType;

  @Column({ name: 'policy_number', unique: true, nullable: true })
  policyNumber: string;

  @Column({
    type: 'enum',
    enum: InsuranceStatus,
    default: InsuranceStatus.PENDING,
  })
  status: InsuranceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premium: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'coverage_amount' })
  coverageAmount: number;

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  beneficiaries: {
    name: string;
    relationship: string;
    percentage: number;
  }[];

  @Column({ type: 'jsonb', nullable: true, name: 'medical_info' })
  medicalInfo: {
    hasPreExistingConditions: boolean;
    conditions?: string[];
    medications?: string[];
  };

  @Column({ type: 'jsonb', nullable: true, name: 'underwriter_data' })
  underwriterData: {
    underwriterId?: string;
    riskScore?: number;
    notes?: string;
    approvedBy?: string;
    approvedAt?: Date;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
