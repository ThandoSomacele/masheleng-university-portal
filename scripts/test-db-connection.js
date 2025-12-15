const { Client } = require('pg');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'masheleng',
  password: process.env.DATABASE_PASSWORD || 'masheleng_dev_password_2024',
  database: process.env.DATABASE_NAME || 'masheleng_portal',
});

console.log('Testing PostgreSQL connection with:');
console.log('Host:', client.host);
console.log('Port:', client.port);
console.log('User:', client.user);
console.log('Database:', client.database);
console.log('');

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to PostgreSQL!');
    return client.query('SELECT current_user, current_database(), version()');
  })
  .then(result => {
    console.log('\nConnection details:');
    console.log('User:', result.rows[0].current_user);
    console.log('Database:', result.rows[0].current_database);
    console.log('Version:', result.rows[0].version.split('\n')[0]);
    return client.end();
  })
  .then(() => {
    console.log('\n✅ Connection test passed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Connection failed:');
    console.error(err.message);
    process.exit(1);
  });
