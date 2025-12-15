import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  surname: string;

  @Column({ type: 'varchar', length: 2 })
  country_code: string;

  // Premium+ specific fields (nullable)
  @Column({ type: 'varchar', length: 20, nullable: true })
  gender?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  botswana_id_encrypted?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  encryption_key_id?: string;

  // Account status
  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
