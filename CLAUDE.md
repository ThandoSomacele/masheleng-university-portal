# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Masheleng University Portal** is an educational platform backend built with NestJS, featuring integrated insurance products for Botswana and South Africa. It uses a three-tier subscription model (Entry/Premium/Premium+) with location-based access controls and insurance integration for Premium+ subscribers.

**Tech Stack:**
- NestJS 10+ with TypeScript 5+
- PostgreSQL 16 (primary database)
- Redis 7 (caching and queues)
- Bull (Redis-based job queues)
- TypeORM (database ORM)
- JWT with Passport (authentication)
- Docker Compose (local infrastructure)

## Development Commands

### Infrastructure & Setup
```bash
# Start PostgreSQL and Redis containers
docker-compose up -d

# Check container status
docker-compose ps

# Stop containers
docker-compose down

# Install dependencies
npm install
```

### Development Server
```bash
# Start development server with hot-reload
npm run start:dev

# Start with debugging enabled
npm run start:debug

# Production build and start
npm run build
npm run start:prod
```

### Database Migrations
```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration file
npm run migration:create -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Seed database with sample data
npm run seed
npm run seed:courses  # Course-specific seeding
```

### Testing
```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Development Tunnel (ngrok)
```bash
# Start ngrok tunnel for Framer frontend integration
./scripts/start-dev-tunnel.sh

# Update API URL in Framer components after ngrok restart
./scripts/update-api-url.sh
```

## Architecture Overview

### SOLID Principles Implementation

This codebase strictly follows SOLID principles:

- **Single Responsibility:** Controllers handle HTTP only, Services contain business logic, Repositories manage data access
- **Open/Closed:** Payment provider abstraction allows adding new providers without modifying existing code
- **Liskov Substitution:** Payment providers and storage providers are interchangeable
- **Interface Segregation:** Focused DTOs for each operation, specialized guards/interceptors/filters
- **Dependency Inversion:** NestJS dependency injection throughout, abstractions over concrete implementations

### Module Structure

```
src/
├── auth/                 # Authentication & authorization
│   ├── decorators/       # @CurrentUser, @Public, @Roles
│   ├── guards/           # JwtAuthGuard, RolesGuard
│   ├── strategies/       # JWT strategy
│   └── dto/              # Login/Register DTOs
├── users/                # User management
├── subscriptions/        # Three-tier subscription logic
│   ├── decorators/       # @RequiresTier
│   └── guards/           # TierAccessGuard
├── payments/             # Multi-provider payment abstraction
├── insurance/            # Insurance integration (Premium+ only)
├── courses/              # Course management & curriculum
├── webinars/             # Webinar system
├── analytics/            # DAU/WAU/MAU tracking
└── database/
    ├── migrations/       # TypeORM migrations
    └── seeds/            # Database seed scripts
```

### Key Design Patterns

**Payment Provider Abstraction:**
The payment module uses a provider abstraction pattern to support multiple payment gateways (Stripe, Paystack, Peach Payments) without coupling business logic to specific implementations.

**Tier-Based Access Control:**
Uses custom `@RequiresTier()` decorator and `TierAccessGuard` to enforce subscription tier requirements on endpoints. Premium+ features (like insurance) are automatically restricted to eligible users.

**Location-Based Restrictions:**
Premium+ subscriptions are restricted to Botswana citizens. The system validates citizenship via Botswana ID number (encrypted with AES-256-GCM).

**Insurance Integration:**
Insurance enrollments are queued (Bull) and sent to underwriter APIs. The system monitors a 5% enrollment threshold for regulatory compliance.

### Database Architecture

**20 Tables organized into:**
- User Management: users, refresh_tokens
- Subscriptions: subscription_tiers, user_subscriptions, subscription_change_logs
- Payments: payments, payment_webhook_logs
- Insurance: insurance_enrollments, beneficiaries, underwriter_notifications
- Content: courses, course_categories, course_modules, course_lessons, user_course_enrollments, user_lesson_progress
- Webinars: webinars, webinar_registrations
- Tools & Analytics: digital_tools, user_analytics_events, daily_user_activity
- Security: api_keys, audit_logs

**Migration Strategy:**
- `synchronize: false` always (even in development)
- All schema changes via TypeORM migrations
- Environment-specific config loaded from `.env.{NODE_ENV}`

## Framer Frontend Integration

### Component Architecture

The `framer-integration/` directory contains React components designed for Framer integration:

**Page-Level Components:**
- `LoginForm.tsx` - `/login` page
- `RegisterForm.tsx` - `/register` page
- `StudentDashboard.tsx` - `/dashboard` page (protected)
- `PricingTiers.tsx` - `/pricing` page
- `CourseCatalog.tsx` - `/courses` page
- `CourseDetail.tsx` - `/courses/:id` page (dynamic route)
- `CoursePlayer.tsx` - `/courses/:id/learn` page (dynamic route + query params)
- `PaymentWorkflow.tsx` - `/payment` page
- `InsuranceApplication.tsx` - `/insurance/activate` page (Premium+ only)

**Sub-Components:**
- `PaymentMethodSelector.tsx`, `PaymentForm.tsx`, `PaymentSuccess.tsx`, `PaymentFailed.tsx` - Used within PaymentWorkflow
- `VimeoPlayer.tsx`, `TextLesson.tsx` - Used within CoursePlayer

### API Configuration

All Framer components use centralized configuration from `framer-integration/config.js`:

```javascript
const DEV_API_URL = 'https://YOUR-NGROK-URL.ngrok-free.app/api/v1';
const PROD_API_URL = 'https://api.masheleng.com/api/v1';
```

**IMPORTANT:** When using ngrok (free tier), the URL changes on each restart. You MUST update `DEV_API_URL` in `config.js` after each ngrok restart. Use `./scripts/start-dev-tunnel.sh` to start ngrok and get the new URL.

### Authentication Flow

All Framer components use localStorage-based authentication:
- Token stored as `masheleng_token` in localStorage after successful login/registration
- Protected components check for token and redirect to `/login` if missing
- Token sent as `Bearer {token}` in Authorization header for API calls

### Component Navigation Flow

Key navigation patterns in Framer components:
- Login/Register → `/dashboard` or `/courses` (on success)
- `/pricing` → `/login` (if not authenticated) → `/payment` (after tier selection)
- `/courses/:id` → `/login` (if enrolling without auth) → `/courses/:id/learn?lesson=:lessonId` (start learning)
- `/dashboard` → Quick actions to `/courses`, `/pricing`, `/insurance/activate`, `/account/*`
- Logout → `/login`

See `FRAMER_PAGE_MAPPING.md` for complete Framer setup documentation.

## API Design Conventions

### Versioning
- URL versioning: `/api/v1/*`
- Global prefix: `/api`
- Default version: `v1`

### Response Format
All endpoints should follow consistent response structure:
```typescript
{
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId: string
  }
}
```

### Pagination
Standard pagination format:
```typescript
{
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
}
```

### Authentication
- JWT access tokens: 15-minute expiry
- JWT refresh tokens: 7-day expiry
- Protected routes use `@UseGuards(JwtAuthGuard)`
- Public routes use `@Public()` decorator
- Role-based access uses `@Roles()` decorator + `RolesGuard`

### CORS Configuration
CORS supports multiple frontend origins (configured via `FRONTEND_URL` env variable):
- Framer sites (e.g., `https://masheleng.framer.app`)
- ngrok tunnels (wildcards supported: `https://*.ngrok-free.app`)
- Local development (`http://localhost:3001`)

## Security & Compliance

### Data Protection
- **Encryption:** Botswana ID numbers encrypted with AES-256-GCM (ENCRYPTION_KEY in env)
- **Password Hashing:** bcrypt with salt rounds
- **Rate Limiting:** 100 requests/minute for public endpoints, 1000/minute for authenticated users
- **Security Headers:** Helmet.js enabled
- **Input Validation:** class-validator on all DTOs with whitelist + forbidNonWhitelisted

### Audit & Compliance
- **Audit Trail:** All sensitive operations logged to `audit_logs` table
- **POPIA Compliance:** (South Africa) Data protection measures
- **Botswana Data Protection:** Regional hosting requirements, encrypted sensitive data
- **Insurance Regulations:** 5% enrollment threshold monitoring for underwriter notifications

### Environment Variables
Never commit secrets to version control. Use `.env.{NODE_ENV}` files:
- `.env.development` - Local development
- `.env.production` - Production deployment
- `.env.example` - Template with placeholder values

Required secrets:
- `JWT_SECRET` (min 32 chars)
- `JWT_REFRESH_SECRET` (min 32 chars)
- `ENCRYPTION_KEY` (32 bytes)
- `DATABASE_PASSWORD`
- Payment provider keys (when enabled)

## Common Development Patterns

### Creating a New Module
```bash
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

### Adding Protected Endpoints
```typescript
@Controller('feature')
@UseGuards(JwtAuthGuard)  // Protect entire controller
export class FeatureController {
  @Get()
  @RequiresTier('premium')  // Additional tier restriction
  async getFeature(@CurrentUser() user: User) {
    // Access current user via @CurrentUser decorator
  }
}
```

### Creating Database Migrations
```bash
# 1. Modify entity files (*.entity.ts)
# 2. Generate migration
npm run migration:generate -- src/database/migrations/DescriptiveChangeName
# 3. Review generated migration file
# 4. Run migration
npm run migration:run
```

### Working with TypeORM Entities
Entities are located in `src/*/entities/*.entity.ts`. When modifying:
1. Update the entity class
2. Generate migration (never rely on `synchronize: true`)
3. Review and test migration
4. Run migration in all environments

## Testing Guidelines

### E2E Testing
Follow the comprehensive test plan in `E2E_TEST_PLAN.md` which covers:
- User registration and authentication
- Subscription and payment flows
- Course enrollment and viewing
- Insurance activation
- Dashboard functionality

### Unit Testing
- Test files: `*.spec.ts` next to source files
- Coverage reports: `npm run test:cov` → `coverage/` directory
- Use NestJS testing utilities for dependency injection mocking

## Known Development Workflows

### Updating ngrok URL for Framer
When ngrok URL changes (free tier restarts):
1. Run `./scripts/start-dev-tunnel.sh` to start ngrok
2. Copy the new ngrok URL from terminal output
3. Update `DEV_API_URL` in `framer-integration/config.js`
4. Optionally run `./scripts/update-api-url.sh` to automate this

### Database Reset (Development Only)
```bash
# Stop containers
docker-compose down

# Remove volumes (deletes all data)
docker volume rm masheleng-university-portal_postgres_data

# Restart containers
docker-compose up -d

# Run migrations
npm run migration:run

# Seed sample data
npm run seed
```

### Adding New Payment Provider
1. Create provider service implementing payment abstraction interface in `src/payments/`
2. Add provider configuration to environment variables
3. Register provider in payments module
4. No changes needed to business logic (Open/Closed principle)

## API Documentation

Swagger documentation available at:
- Local: http://localhost:3000/api/docs
- Production: https://api.masheleng.com/api/docs

Documentation is auto-generated from:
- Controller decorators (`@ApiTags`, `@ApiOperation`, etc.)
- DTO validation decorators
- Entity definitions

## Important File References

- `ARCHITECTURE_NOTES.md` - Detailed architectural decisions and alternatives considered
- `FRAMER_PAGE_MAPPING.md` - Complete Framer component setup and navigation flow
- `E2E_TEST_PLAN.md` - Comprehensive end-to-end testing procedures
- `COURSE_PLATFORM_IMPLEMENTATION.md` - Course system implementation details
- `IMPLEMENTATION_PLAN.md` - Original system implementation plan
- `.env.example` - Environment variable template
- `docker-compose.yml` - Local infrastructure setup
- `src/database/data-source.ts` - TypeORM configuration
- `src/main.ts` - Application bootstrap and global configuration

## URLs & Endpoints

**Development:**
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

**Production (Planned):**
- Frontend: https://masheleng.edu (Framer)
- Backend API: https://api.masheleng.edu
- API Docs: https://docs.api.masheleng.edu

## Module-Specific Notes

### Payments Module
Supports multiple providers through abstraction. Configure provider via environment variables. Webhook endpoints are public (no JWT) but verified via provider signatures.

### Insurance Module
Only available to Premium+ subscribers who are Botswana citizens. Requires valid Botswana ID number (encrypted). Beneficiary management follows specific business rules (minimum 1, maximum 5 beneficiaries).

### Courses Module
Supports video lessons (Vimeo) and text lessons. Progress tracking per lesson. Curriculum structure: Course → Modules → Lessons. Enrollment required before accessing content.

### Analytics Module
Tracks DAU/WAU/MAU metrics. Events logged via `user_analytics_events` table. Daily aggregation via scheduled jobs (NestJS @Cron).

### Subscriptions Module
Three tiers with different access levels:
- Entry (Free): Basic course access
- Premium (P150/month): Full course access + webinars
- Premium+ (P250/month): Everything + insurance (Botswana only)

Tier changes logged in `subscription_change_logs` for audit trail.
