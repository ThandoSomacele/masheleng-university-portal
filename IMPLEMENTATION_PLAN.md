# Masheleng University Portal - Backend API Implementation Plan

## Executive Summary

Building a **NestJS + TypeScript + PostgreSQL** backend API for an educational platform with integrated insurance products. The system supports three subscription tiers (Entry/Free, Premium, Premium+) with location-based restrictions, payment processing, insurance enrollment for Botswana citizens, and comprehensive analytics.

**Key Technical Decisions:**
- **Framework:** NestJS (best DX, you're familiar with Express, enterprise-grade patterns)
- **Database:** PostgreSQL 16 (robust, excellent JSON support, compliance-ready)
- **Payment:** Abstraction layer (swap providers easily, multi-currency support)
- **Insurance:** REST API for underwriter integration with 5% threshold monitoring

---

## Technology Stack

### Core
- **Runtime:** Node.js 20 LTS
- **Framework:** NestJS 10+
- **Language:** TypeScript 5+
- **Database:** PostgreSQL 16
- **ORM:** TypeORM 0.3+
- **Caching:** Redis 7
- **Queue:** Bull (Redis-based)
- **Authentication:** JWT (Passport)

### Key Packages
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@nestjs/bull": "^10.0.0",
  "@nestjs/schedule": "^4.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.0",
  "redis": "^4.6.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "helmet": "^7.1.0"
}
```

---

## Database Schema Overview

### Core Tables (20 tables total)

**User Management:**
- `users` - User accounts with tier-specific fields
- `refresh_tokens` - JWT refresh token management

**Subscriptions:**
- `subscription_tiers` - Master data (Entry, Premium, Premium+)
- `user_subscriptions` - User subscription records
- `subscription_change_logs` - Track changes for 5% threshold

**Payments:**
- `payments` - Payment transactions
- `payment_webhook_logs` - Webhook processing logs

**Insurance (Premium+ only):**
- `insurance_enrollments` - Policy records
- `beneficiaries` - Beneficiary information (encrypted IDs)
- `underwriter_notifications` - 5% threshold alerts

**Content:**
- `courses` - Course catalog
- `course_categories` - Course organization
- `course_modules` - Course structure
- `course_lessons` - Lesson content
- `user_course_enrollments` - User progress
- `user_lesson_progress` - Detailed tracking

**Webinars:**
- `webinars` - Webinar scheduling
- `webinar_registrations` - User registrations (credit tracking)

**Tools & Analytics:**
- `digital_tools` - Downloadable resources
- `user_analytics_events` - Event tracking
- `daily_user_activity` - Materialized view (DAU/WAU/MAU)

**Security & Admin:**
- `api_keys` - Underwriter API access
- `audit_logs` - Compliance trail

### Critical Database Features

1. **Encryption:** Botswana ID numbers encrypted at rest (AES-256-GCM)
2. **Indexes:** Composite indexes on high-traffic queries
3. **Partitioning:** Analytics events partitioned by month
4. **Constraints:** Beneficiary allocation must equal 100%
5. **Triggers:** Auto-update subscription change logs

---

## Project Structure

```
masheleng-university-portal/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                    # Configuration modules
│   ├── common/                    # Shared utilities
│   │   ├── decorators/           # @Roles(), @TierAccess()
│   │   ├── guards/               # JWT, RBAC, Tier access
│   │   ├── filters/              # Exception handling
│   │   ├── interceptors/         # Logging, transform
│   │   ├── pipes/                # Validation
│   │   └── utils/                # Encryption, pagination
│   ├── auth/                     # Authentication
│   ├── users/                    # User management
│   ├── subscriptions/            # Core subscription logic
│   ├── payments/                 # Payment abstraction
│   │   └── providers/           # Stripe, PayStack, Peach
│   ├── insurance/                # Insurance integration
│   │   ├── underwriter/         # Underwriter API
│   │   └── notifications/       # 5% threshold monitor
│   ├── beneficiaries/           # Beneficiary management
│   ├── courses/                 # Course management
│   │   ├── modules/
│   │   ├── lessons/
│   │   ├── enrollments/
│   │   └── progress/
│   ├── webinars/                # Webinar system
│   ├── digital-tools/           # Tool downloads
│   ├── analytics/               # Analytics & reports
│   ├── notifications/           # Email notifications
│   ├── storage/                 # File storage abstraction
│   ├── jobs/                    # Background jobs (Bull)
│   │   ├── processors/
│   │   └── schedulers/
│   └── database/
│       ├── migrations/
│       └── seeds/
├── test/
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## API Endpoint Structure

### Authentication (`/api/v1/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - Login with JWT
- `POST /auth/refresh` - Refresh access token
- `POST /auth/verify-email` - Email verification
- `GET /auth/me` - Current user profile

### Subscriptions (`/api/v1/subscriptions`)
- `GET /subscriptions/tiers` - List available tiers
- `GET /subscriptions/current` - Current subscription
- `POST /subscriptions/subscribe` - Create subscription
- `POST /subscriptions/upgrade` - Upgrade tier
- `POST /subscriptions/cancel` - Cancel subscription
- `GET /subscriptions/webinar-credits` - Check credits

### Payments (`/api/v1/payments`)
- `POST /payments/create-intent` - Create payment
- `GET /payments/history` - Payment history
- `POST /webhooks/stripe` - Stripe webhook
- `POST /webhooks/paystack` - PayStack webhook

### Insurance (`/api/v1/insurance`)
**User-facing:**
- `GET /insurance/enrollment` - Current enrollment
- `POST /insurance/enroll` - Enroll (Premium+ only)
- `GET /insurance/eligibility` - Check eligibility

**Underwriter API (API key auth):**
- `GET /insurance/underwriter/enrollments` - List enrollments
- `GET /insurance/underwriter/export` - Export data (CSV/JSON)
- `GET /insurance/underwriter/changes` - Subscription changes
- `POST /insurance/underwriter/acknowledge/:id` - Acknowledge notification

### Courses (`/api/v1/courses`)
- `GET /courses` - List courses (tier-filtered)
- `GET /courses/:slug` - Course details
- `POST /courses/:id/enroll` - Enroll in course
- `GET /courses/enrolled` - User's courses
- `POST /lessons/:id/progress` - Update progress

### Webinars (`/api/v1/webinars`)
- `GET /webinars` - List upcoming webinars
- `POST /webinars/:id/register` - Register (uses credit)
- `GET /webinars/registered` - User's registrations

### Analytics (`/api/v1/analytics`)
- `GET /analytics/users/active` - DAU/WAU/MAU (admin)
- `GET /analytics/my-progress` - User progress stats

---

## Critical Implementation Components

### 1. Three-Tier Subscription Model

**Tier Definitions:**
```typescript
Entry Package (Free):
- Price: P0
- Access Level: 1
- Features: Course briefs, short videos, digital tools
- No insurance, no webinar credits

Premium Package (P150/month):
- Price: P150 (BWP) / P180 (ZAR)
- Access Level: 2
- Available to: ALL users globally
- Features: Full courses + 4 webinar credits/year + discounts
- No insurance

Premium+ Package (P250/month):
- Price: P250 (BWP) / P300 (ZAR)
- Access Level: 3
- Available to: BOTSWANA CITIZENS ONLY
- Features: Everything in Premium + insurance coverage
- Insurance: P50,000 funeral + P250,000 life cover
```

**Location-Based Restriction:**
```typescript
// Premium+ eligibility check
async canSubscribeToPremiumPlus(userId: string): Promise<boolean> {
  const user = await this.usersRepository.findOne(userId);

  if (user.countryCode !== 'BW') {
    throw new ForbiddenException(
      'Premium+ subscription is only available for Botswana citizens'
    );
  }

  // Must have all required fields
  const requiredFields = [
    'gender', 'dateOfBirth', 'phone', 'botswanaId'
  ];

  for (const field of requiredFields) {
    if (!user[field]) {
      throw new BadRequestException(
        `Premium+ requires: ${requiredFields.join(', ')}`
      );
    }
  }

  return true;
}
```

### 2. Subscription Auto-Cancellation

**Business Rule:** Cancel after 3 months (90 days) of non-payment

```typescript
// Cron job runs daily at 2 AM
@Cron('0 2 * * *')
async checkExpiredSubscriptions() {
  const threeMonthsAgo = subMonths(new Date(), 3);

  const overdueSubscriptions = await this.subscriptionsRepository.find({
    where: {
      consecutiveFailedPayments: MoreThanOrEqual(3),
      lastPaymentAttemptAt: LessThan(threeMonthsAgo),
      status: In(['ACTIVE', 'SUSPENDED'])
    },
    relations: ['user', 'tier', 'insuranceEnrollment']
  });

  for (const subscription of overdueSubscriptions) {
    // Cancel subscription
    subscription.status = 'CANCELLED';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = 'Auto-cancelled: 3 months non-payment';

    // Cancel insurance if Premium+
    if (subscription.insuranceEnrollmentId) {
      await this.insuranceService.cancelPolicy(
        subscription.insuranceEnrollmentId,
        'Subscription cancelled due to non-payment'
      );
    }

    await this.subscriptionsRepository.save(subscription);

    // Notify user
    await this.notificationService.send({
      userId: subscription.userId,
      type: 'SUBSCRIPTION_CANCELLED',
      data: { reason: 'non-payment' }
    });
  }
}
```

### 3. Payment Abstraction Layer

**Provider Interface:**
```typescript
interface PaymentProvider {
  name: string;
  supportedCurrencies: string[];

  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent>;
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
  handleWebhookEvent(event: any): Promise<WebhookResult>;
}

// Factory selects provider based on currency
class PaymentProviderFactory {
  getProviderForCurrency(currency: 'BWP' | 'ZAR'): PaymentProvider {
    // BWP -> Peach Payments (Southern Africa focus)
    // ZAR -> PayStack or Stripe
  }
}
```

### 4. Insurance Underwriter Integration

**5% Threshold Monitoring:**
```typescript
@Cron('0 */6 * * *') // Every 6 hours
async monitorEnrollmentChanges() {
  // Get baseline (24-48 hours ago)
  const baseline = await this.getEnrollmentCount(
    subHours(new Date(), 48),
    subHours(new Date(), 24)
  );

  // Get current (last 24 hours)
  const current = await this.getEnrollmentCount(
    subHours(new Date(), 24),
    new Date()
  );

  const changePercentage = ((current - baseline) / baseline) * 100;

  if (Math.abs(changePercentage) >= 5) {
    await this.notifyUnderwriters({
      triggerType: 'THRESHOLD_EXCEEDED',
      baselineCount: baseline,
      currentCount: current,
      changePercentage,
      periodStart: subHours(new Date(), 24),
      periodEnd: new Date()
    });
  }
}
```

**Underwriter API Authentication:**
```typescript
// API key in header: Authorization: Bearer underwriter_key_xxx
@UseGuards(ApiKeyGuard)
@Controller('insurance/underwriter')
export class UnderwriterController {
  @Get('enrollments')
  async listEnrollments(
    @Query() filters: EnrollmentFiltersDto
  ): Promise<PaginatedResponse<InsuranceEnrollment>> {
    // Return all Premium+ enrollments with full user details
  }

  @Get('export')
  async exportEnrollments(
    @Query('format') format: 'csv' | 'json'
  ): Promise<StreamableFile> {
    // Export all enrollment data for underwriter processing
  }
}
```

### 5. Data Encryption

**Sensitive Data Protection:**
```typescript
class EncryptionService {
  private algorithm = 'aes-256-gcm';

  async encryptId(id: string, keyId: string): Promise<string> {
    const key = await this.getEncryptionKey(keyId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(id, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  async decryptId(encrypted: string, keyId: string): Promise<string> {
    const key = await this.getEncryptionKey(keyId);
    const [ivHex, encryptedHex, authTagHex] = encrypted.split(':');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Store encrypted in database
user.botswanaIdEncrypted = await this.encryption.encryptId(
  user.botswanaId,
  'key_v1'
);
```

### 6. Tier-Based Access Control

**Guard Implementation:**
```typescript
@Injectable()
export class TierAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredTierLevel = this.reflector.get<number>(
      'tierLevel',
      context.getHandler()
    );

    if (!requiredTierLevel) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check active subscription
    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      throw new ForbiddenException('Active subscription required');
    }

    // Check tier level
    if (user.subscription.tier.accessLevel < requiredTierLevel) {
      throw new ForbiddenException(
        `This feature requires ${this.getTierName(requiredTierLevel)} subscription`
      );
    }

    return true;
  }
}

// Usage in controller
@Get('full-courses')
@TierAccess(2) // Requires Premium or above
@UseGuards(JwtAuthGuard, TierAccessGuard)
async getFullCourses() {
  // Only Premium/Premium+ users can access
}
```

---

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure (Week 1)

**Tasks:**
1. Initialize NestJS project
2. Set up Docker Compose (PostgreSQL, Redis)
3. Configure TypeORM with migrations
4. Implement database schema (all 20 tables)
5. Set up environment configuration
6. Configure Swagger/OpenAPI docs
7. Implement health checks

**Deliverables:**
- Working local development environment
- Database fully migrated
- API documentation endpoint (`/api/docs`)

**Critical Files:**
- `src/main.ts` - Application bootstrap
- `src/database/migrations/001_create_initial_schema.ts` - Complete schema
- `docker-compose.yml` - Local services
- `.env.example` - Configuration template

### Phase 2: Authentication & User Management (Week 2)

**Tasks:**
1. Implement JWT authentication (access + refresh tokens)
2. Build user registration with validation
3. Create login/logout endpoints
4. Implement email verification flow
5. Build user profile management
6. Set up password reset flow
7. Implement RBAC guards

**Deliverables:**
- Complete auth flow
- User CRUD operations
- Role-based access control

**Critical Files:**
- `src/auth/auth.service.ts` - Auth logic
- `src/auth/strategies/jwt.strategy.ts` - JWT validation
- `src/users/users.service.ts` - User management
- `src/common/guards/jwt-auth.guard.ts` - Route protection

### Phase 3: Subscription System (Week 3)

**Tasks:**
1. Implement subscription tier management
2. Build subscription creation/upgrade/downgrade
3. Create tier-based access guards
4. Implement webinar credit tracking
5. Build subscription lifecycle service
6. Create auto-cancellation job
7. Implement location-based Premium+ restriction

**Deliverables:**
- Working subscription system
- Tier-based content access
- Auto-cancellation cron job

**Critical Files:**
- `src/subscriptions/subscriptions.service.ts` - Core logic
- `src/subscriptions/subscription-lifecycle.service.ts` - Auto-cancel
- `src/common/guards/tier-access.guard.ts` - Access control
- `src/jobs/processors/subscription-lifecycle.processor.ts` - Background job

### Phase 4: Payment Integration (Week 4)

**Tasks:**
1. Design payment provider abstraction
2. Implement Stripe provider (initial)
3. Build payment intent creation
4. Implement webhook handling
5. Create payment retry logic
6. Build payment history endpoints
7. Implement multi-currency support

**Deliverables:**
- Payment processing
- Webhook handlers
- Payment retry system

**Critical Files:**
- `src/payments/providers/payment-provider.interface.ts` - Abstraction
- `src/payments/providers/stripe.provider.ts` - Stripe integration
- `src/payments/webhooks/webhooks.service.ts` - Webhook processing
- `src/payments/webhooks/webhook-handlers/stripe-webhook.handler.ts`

### Phase 5: Insurance Integration (Week 5)

**Tasks:**
1. Implement insurance enrollment for Premium+
2. Build beneficiary management with encryption
3. Create underwriter API endpoints
4. Implement 5% threshold monitoring
5. Build notification system
6. Create data export functionality
7. Implement API key authentication

**Deliverables:**
- Insurance enrollment system
- Underwriter API
- Threshold monitoring
- Beneficiary management

**Critical Files:**
- `src/insurance/insurance.service.ts` - Enrollment logic
- `src/insurance/underwriter/underwriter.controller.ts` - API
- `src/insurance/notifications/threshold-monitor.service.ts` - Monitoring
- `src/beneficiaries/beneficiaries.service.ts` - Beneficiary CRUD
- `src/common/utils/encryption.util.ts` - ID encryption

### Phase 6: Content Management (Week 6-7)

**Tasks:**
1. Implement course management
2. Build course modules and lessons
3. Create course enrollment system
4. Implement progress tracking
5. Build webinar management
6. Create webinar registration with credit deduction
7. Implement digital tools management

**Deliverables:**
- Complete course system
- Progress tracking
- Webinar system
- Digital tools

**Critical Files:**
- `src/courses/courses.service.ts` - Course management
- `src/courses/enrollments/enrollments.service.ts` - Enrollment
- `src/courses/progress/progress.service.ts` - Progress tracking
- `src/webinars/webinars.service.ts` - Webinar management

### Phase 7: Analytics & Reporting (Week 8)

**Tasks:**
1. Implement event tracking system
2. Build analytics aggregation jobs
3. Create DAU/WAU/MAU calculations
4. Implement conversion funnel tracking
5. Build admin dashboard endpoints
6. Create materialized view refresh jobs

**Deliverables:**
- Analytics tracking
- Admin reports
- User activity metrics

**Critical Files:**
- `src/analytics/event-tracker.service.ts` - Event tracking
- `src/analytics/reports/reports.service.ts` - Calculations
- `src/jobs/processors/analytics-aggregation.processor.ts` - Aggregation

### Phase 8: Testing & Security Hardening (Week 9)

**Tasks:**
1. Write unit tests for critical services
2. Create E2E tests for main flows
3. Implement rate limiting
4. Add security headers (Helmet)
5. Perform security audit
6. Implement audit logging
7. Add input sanitization

**Deliverables:**
- 70%+ test coverage
- Security hardening complete
- Audit trail implementation

### Phase 9: Deployment & Monitoring (Week 10)

**Tasks:**
1. Set up CI/CD pipeline
2. Create production Docker images
3. Configure production database (Africa region)
4. Set up Redis cluster
5. Implement application monitoring
6. Configure alerting
7. Deploy to production

**Deliverables:**
- Production deployment
- Monitoring dashboards
- Automated deployments

---

## Critical Security Considerations

### 1. Data Protection (POPIA/Botswana Compliance)

**Encrypted Fields:**
- Botswana ID numbers (users + beneficiaries)
- Use AES-256-GCM with key rotation support

**Required Measures:**
- Audit trail for all data access
- Data subject rights implementation (export, delete)
- Consent tracking
- Regional hosting (AWS af-south-1 or Azure South Africa)

### 2. Authentication Security

- JWT access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry, stored in DB
- Failed login tracking (lock after 5 attempts)
- Device tracking for security
- Token rotation on refresh

### 3. API Security

**Rate Limiting:**
- 100 requests/minute per IP (general)
- 5 login attempts per 15 minutes
- Redis-based rate limiter

**Input Validation:**
- class-validator on all DTOs
- SQL injection prevention (TypeORM parameterized queries)
- XSS protection (class-transformer sanitization)

**Security Headers:**
```typescript
helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true
})
```

### 4. Payment Security

- Never store card details (use provider tokenization)
- Webhook signature verification
- Idempotency keys for payment retries
- PCI DSS compliance via payment providers

---

## Testing Strategy

### Unit Tests
- All service methods
- Guard logic
- Utility functions
- Encryption/decryption
- Target: 70%+ coverage

### Integration Tests
- Database operations
- Redis caching
- Queue processing
- Payment provider integration

### E2E Tests (Priority Flows)
1. User registration → email verification → login
2. Free tier → upgrade to Premium → payment → activation
3. Premium+ enrollment → insurance enrollment → beneficiary add
4. Course enrollment → lesson progress → completion
5. Webinar registration → credit deduction
6. Payment failure → retry → auto-cancellation
7. Underwriter API → enrollment export

---

## Monitoring & Observability

### Application Metrics
- Request duration (Prometheus histogram)
- Active subscriptions by tier (Gauge)
- Payment success/failure rate (Counter)
- API endpoint response times

### Health Checks
- `/health` - Application status
- `/health/db` - Database connectivity
- `/health/redis` - Redis connectivity

### Logging
- Structured JSON logs (Winston)
- Log levels: error, warn, info, debug
- Correlation IDs for request tracking
- Sensitive data redaction

### Alerts
- Database connection failures
- Payment webhook failures
- High error rates (>5%)
- Subscription cancellation spikes
- Insurance threshold breaches

---

## Critical Files to Implement First

### 1. Database Schema
**File:** `src/database/migrations/001_create_initial_schema.ts`
**Priority:** HIGHEST
**Why:** Foundation for everything else

### 2. Subscription Service
**File:** `src/subscriptions/subscriptions.service.ts`
**Priority:** HIGHEST
**Why:** Core business logic, location restrictions, tier verification

### 3. Payment Abstraction
**File:** `src/payments/providers/payment-provider.interface.ts`
**Priority:** HIGH
**Why:** Enables payment flexibility, multi-currency

### 4. Threshold Monitor
**File:** `src/insurance/notifications/threshold-monitor.service.ts`
**Priority:** HIGH
**Why:** Critical business requirement for insurance compliance

### 5. Encryption Utility
**File:** `src/common/utils/encryption.util.ts`
**Priority:** HIGH
**Why:** Required for POPIA/Botswana compliance, must be done early

### 6. Tier Access Guard
**File:** `src/common/guards/tier-access.guard.ts`
**Priority:** MEDIUM
**Why:** Controls content access throughout the system

### 7. Subscription Lifecycle
**File:** `src/subscriptions/subscription-lifecycle.service.ts`
**Priority:** MEDIUM
**Why:** Auto-cancellation business rule

---

## Environment Configuration

### Development
```bash
NODE_ENV=development
DATABASE_URL=postgresql://masheleng:password@localhost:5432/masheleng_portal
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_jwt_secret_min_32_chars_long_string
FRONTEND_URL=http://localhost:3001
```

### Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.af-south-1.rds.amazonaws.com:5432/masheleng
REDIS_URL=redis://prod-redis.cache.amazonaws.com:6379
JWT_SECRET=<strong-secret-from-secrets-manager>
ENCRYPTION_KEY=<32-byte-key-from-secrets-manager>
FRONTEND_URL=https://masheleng.edu
```

---

## Success Metrics

### Technical
- API response time < 200ms (p95)
- Database query time < 50ms (p95)
- 99.9% uptime
- Zero data breaches
- < 1% payment failure rate

### Business
- Support 100,000+ users
- Handle 1,000+ concurrent requests
- Process payments in BWP and ZAR
- < 5 minute webhook processing
- Real-time insurance threshold detection

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment provider downtime | HIGH | Multi-provider abstraction, retry logic |
| 3-month non-payment tracking failure | HIGH | Robust cron job, monitoring, alerts |
| Data breach of Botswana IDs | CRITICAL | Encryption at rest, audit logs, access controls |
| 5% threshold false positives | MEDIUM | Tunable threshold, manual review process |
| Database performance at scale | MEDIUM | Partitioning, read replicas, caching |
| Premium+ restriction bypass | HIGH | Server-side validation, audit trail |

---

## Next Steps After Plan Approval

1. **Initialize project structure**
   - `nest new masheleng-university-portal`
   - Install dependencies
   - Configure TypeORM

2. **Set up Docker Compose**
   - PostgreSQL 16
   - Redis 7
   - Local development environment

3. **Implement database schema**
   - Create migration with all 20 tables
   - Add indexes and constraints
   - Test locally

4. **Build authentication module**
   - JWT strategy
   - User registration
   - Login/logout

5. **Proceed with Phase 2-9**
   - Follow implementation phases
   - Test incrementally
   - Deploy progressively

---

## Questions Before Implementation

None at this time. All critical decisions have been clarified:
✅ Tech stack: NestJS + TypeScript + PostgreSQL
✅ Payment: Abstraction layer for flexibility
✅ Insurance: API endpoints for underwriter
✅ Database: PostgreSQL with proper indexing

Ready to proceed with implementation.
