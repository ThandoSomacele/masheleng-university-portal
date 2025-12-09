# Masheleng University Portal - Backend API

Educational platform backend with integrated insurance products for Botswana and South Africa.

## Features

- **Three-Tier Subscription Model**: Entry (Free), Premium (P150/month), Premium+ (P250/month)
- **Location-Based Access**: Premium+ restricted to Botswana citizens
- **Insurance Integration**: Funeral & Life cover for Premium+ subscribers
- **Payment Processing**: Multi-currency support (BWP, ZAR) with provider abstraction
- **Content Management**: Courses, webinars, and digital tools
- **Analytics Tracking**: DAU/WAU/MAU metrics
- **Underwriter API**: Real-time insurance enrollment data access

## Technology Stack

- **Framework**: NestJS 10+ with TypeScript 5+
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Queue**: Bull (Redis-based)
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose
- npm 9+

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Check services are running
docker-compose ps
```

### 3. Run Database Migrations

```bash
# Run migrations
npm run migration:run
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start in debug mode

# Build
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:e2e           # Run end-to-end tests

# Database Migrations
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:create -- src/database/migrations/MigrationName
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## Database Schema

The system uses 20 tables organized into:

- **User Management**: users, refresh_tokens
- **Subscriptions**: subscription_tiers, user_subscriptions, subscription_change_logs
- **Payments**: payments, payment_webhook_logs
- **Insurance**: insurance_enrollments, beneficiaries, underwriter_notifications
- **Content**: courses, course_categories, course_modules, course_lessons, user_course_enrollments, user_lesson_progress
- **Webinars**: webinars, webinar_registrations
- **Tools & Analytics**: digital_tools, user_analytics_events, daily_user_activity
- **Security**: api_keys, audit_logs

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Current user profile

### Subscriptions
- `GET /api/v1/subscriptions/tiers` - List subscription tiers
- `POST /api/v1/subscriptions/subscribe` - Create subscription
- `POST /api/v1/subscriptions/upgrade` - Upgrade tier
- `GET /api/v1/subscriptions/current` - Current subscription

### Payments
- `POST /api/v1/payments/create-intent` - Create payment
- `GET /api/v1/payments/history` - Payment history
- `POST /webhooks/stripe` - Stripe webhook (no auth)

### Insurance
- `GET /api/v1/insurance/enrollment` - Current enrollment
- `POST /api/v1/insurance/enroll` - Enroll (Premium+ only)
- `GET /api/v1/insurance/underwriter/enrollments` - Underwriter API

### Courses
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses/:id/enroll` - Enroll in course
- `POST /api/v1/lessons/:id/progress` - Update progress

Full API documentation available at `/api/docs` when server is running.

## Environment Variables

Copy `.env.example` to `.env.development` and configure:

```bash
# Required
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=masheleng_portal
DATABASE_USER=masheleng
DATABASE_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_32_chars
ENCRYPTION_KEY=your_encryption_key_32_bytes

# Optional (add when needed)
STRIPE_SECRET_KEY=sk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

## Security

- **Encryption**: Botswana ID numbers encrypted with AES-256-GCM
- **Authentication**: JWT with 15-minute access tokens, 7-day refresh tokens
- **Rate Limiting**: 100 requests/minute per IP
- **Input Validation**: class-validator on all endpoints
- **Security Headers**: Helmet.js protection
- **Audit Trail**: All sensitive operations logged

## Compliance

- **POPIA** (South Africa): Data protection compliance
- **Botswana Data Protection**: Regional hosting, encrypted sensitive data
- **Insurance Regulations**: 5% enrollment threshold monitoring

## Development

### Project Structure

```
src/
├── auth/                 # Authentication module
├── users/                # User management
├── subscriptions/        # Subscription logic
├── payments/             # Payment abstraction
├── insurance/            # Insurance integration
├── courses/              # Course management
├── webinars/            # Webinar system
├── analytics/           # Analytics tracking
├── common/              # Shared utilities
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   └── utils/
└── database/
    ├── migrations/
    └── seeds/
```

### Adding a New Module

```bash
nest g module users
nest g controller users
nest g service users
```

### Database Migrations

```bash
# Generate migration from entities
npm run migration:generate -- src/database/migrations/AddNewTable

# Create empty migration
npm run migration:create -- src/database/migrations/CustomMigration

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

### Docker Production Build

```bash
# Build image
docker build -t masheleng-api:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production masheleng-api:latest
```

### Database Migration in Production

```bash
# Run migrations before deploying new version
npm run migration:run
```

## Monitoring

- Health checks: `/health`, `/health/db`, `/health/redis`
- Metrics: Prometheus format (to be configured)
- Logs: Winston structured JSON logs

## Support

For issues and questions, please contact the development team.

## License

Proprietary - Masheleng University
