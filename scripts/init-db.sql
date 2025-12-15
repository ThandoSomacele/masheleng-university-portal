-- Initialize database for Masheleng University Portal

-- Create user if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'masheleng') THEN
    CREATE USER masheleng WITH PASSWORD 'masheleng_dev_password_2024';
  END IF;
END
$$;

-- Create database if doesn't exist
SELECT 'CREATE DATABASE masheleng_portal OWNER masheleng'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'masheleng_portal')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE masheleng_portal TO masheleng;
