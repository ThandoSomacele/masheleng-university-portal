import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { CoursesModule } from './courses/courses.module';
import { InsuranceModule } from './insurance/insurance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    SubscriptionsModule,
    PaymentsModule,
    CoursesModule,
    InsuranceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
