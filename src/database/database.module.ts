import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', false),
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get<boolean>('DATABASE_SSL', false),
        extra: {
          max: 100, // Maximum connections in pool
          min: 20, // Minimum connections in pool
          idleTimeoutMillis: 30000, // Close idle connections after 30s
          connectionTimeoutMillis: 5000, // Timeout connection after 5s
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
