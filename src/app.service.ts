import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      apiVersion: 'v1',
      name: 'Masheleng University Portal API',
      description: 'Educational platform backend with integrated insurance products',
    };
  }
}
