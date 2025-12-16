import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { SubscriptionTier } from '../subscriptions/entities/subscription-tier.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const sslEnabled = configService.get<boolean>('DATABASE_SSL', false);
        const host = configService.get('DATABASE_HOST');
        const port = configService.get<number>('DATABASE_PORT');
        const username = configService.get('DATABASE_USER');
        const password = configService.get('DATABASE_PASSWORD');
        const database = configService.get('DATABASE_NAME');

        // Use connection URL with explicit sslmode parameter
        const url = `postgresql://${username}:${password}@${host}:${port}/${database}${!sslEnabled ? '?sslmode=disable' : ''}`;

        return {
          type: 'postgres',
          url,
          entities: [User, SubscriptionTier, UserSubscription, Payment],
          migrations: [],
          synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', false),
          logging: configService.get('NODE_ENV') === 'development',
          extra: {
            max: 100, // Maximum connections in pool
            min: 20, // Minimum connections in pool
            idleTimeoutMillis: 30000, // Close idle connections after 30s
            connectionTimeoutMillis: 5000, // Timeout connection after 5s
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
