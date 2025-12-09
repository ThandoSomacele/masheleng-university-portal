#!/bin/bash

# Database Setup Script
echo "🔧 Setting up Masheleng University Portal Database..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec masheleng-postgres pg_isready -U masheleng -d masheleng_portal > /dev/null 2>&1; do
  echo "   Waiting for database connection..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
  echo "✅ Database migrations completed successfully!"
  echo ""
  echo "🎉 Setup complete! You can now run:"
  echo "   npm run start:dev"
else
  echo "❌ Migration failed. Check the error above."
  exit 1
fi
