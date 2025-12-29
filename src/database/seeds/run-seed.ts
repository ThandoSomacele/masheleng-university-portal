import { DataSource } from 'typeorm';
import { seedCourseData } from './course-data.seed';

/**
 * Run Database Seeders
 * Usage: npx ts-node src/database/seeds/run-seed.ts
 */

async function runSeeders() {
  console.log('🚀 Starting database seed...\n');

  // Create a data source (update with your actual database config)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'masheleng_university',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run course data seeder
    await seedCourseData(dataSource);

    console.log('\n🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run if executed directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };
