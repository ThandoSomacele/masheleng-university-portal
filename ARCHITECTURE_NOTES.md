# Architecture Notes & Decisions

## SOLID Principles Adherence

Our NestJS architecture follows SOLID principles:

### Single Responsibility Principle (SRP) ✅
- Each module has one clear purpose
- Controllers: HTTP handling only
- Services: Business logic only
- Repositories: Data access only

### Open/Closed Principle (OCP) ✅
- Payment provider abstraction allows new providers without modifying existing code
- Tier-based access extensible through configuration
- Strategy patterns for business rules

### Liskov Substitution Principle (LSP) ✅
- Payment providers are interchangeable
- Storage providers can be swapped

### Interface Segregation Principle (ISP) ✅
- Focused DTOs for each operation
- Specialized guards, interceptors, filters

### Dependency Inversion Principle (DIP) ✅
- NestJS dependency injection throughout
- Abstractions over concrete implementations

## Frontend Integration Strategy

### Why NestJS for Framer

**Decision:** Use NestJS despite heavier weight because:
1. Complex business logic requires structure
2. Insurance/payment integrations need enterprise patterns
3. Scalability requirements (100k+ users)
4. Compliance needs (POPIA, audit logging)

### Framer Integration Approach

**REST API First:**
```javascript
// Framer Code Component Example
export default function SubscriptionTiers() {
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    fetch('https://api.masheleng.edu/api/v1/subscriptions/tiers')
      .then(res => res.json())
      .then(data => setTiers(data))
  }, [])

  return (
    <div>
      {tiers.map(tier => (
        <TierCard key={tier.id} {...tier} />
      ))}
    </div>
  )
}
```

**Enhancements for Better DX:**

1. **SDK Generation**
   - Generate TypeScript SDK from Swagger
   - Distribute as npm package for Framer developers

2. **GraphQL Layer (Optional)**
   - Add `@nestjs/graphql` if Framer needs flexible queries
   - Reduces over-fetching

3. **Webhook Support**
   - Real-time updates via webhooks
   - Framer can subscribe to events

4. **Response Transformation**
   - Use interceptors to format responses for Framer
   - Consistent error handling
   - Pagination helpers

## Alternative Architectures Considered

### Next.js API Routes
**Pros:** Simpler, same React ecosystem, better SSR
**Cons:** Less structure for complex business logic
**Decision:** ❌ Not suitable for our complexity

### Supabase/Firebase
**Pros:** No-code backend, instant APIs
**Cons:** Vendor lock-in, limited business logic control
**Decision:** ❌ Can't handle insurance integration complexity

### NestJS + tRPC
**Pros:** End-to-end type safety
**Cons:** Framer may not support, requires TypeScript on frontend
**Decision:** ⏸️ Consider for custom frontend later

### NestJS + GraphQL
**Pros:** Flexible queries, reduces over-fetching
**Cons:** More complex than REST for simple cases
**Decision:** ⏸️ Add later if Framer needs it

## API Design Principles for Frontend Integration

### 1. RESTful + Pragmatic
- Use REST for CRUD operations
- Add custom endpoints for complex operations
- Example: `POST /subscriptions/upgrade` instead of `PATCH /subscriptions/:id`

### 2. Consistent Response Format
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

### 3. Versioning Strategy
- URL versioning: `/api/v1/...`
- Breaking changes → new version
- Deprecation warnings in headers

### 4. Pagination Standard
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

### 5. Error Handling
```typescript
{
  success: false,
  error: {
    code: 'SUBSCRIPTION_TIER_RESTRICTED',
    message: 'Premium+ is only available for Botswana citizens',
    details: {
      required: 'BW',
      provided: 'ZA'
    }
  }
}
```

## Performance Optimizations for Frontend

### Caching Strategy
1. **API Level:** Redis cache for frequently accessed data
2. **HTTP Level:** Cache-Control headers
3. **CDN:** Static content via CDN

### Response Optimization
1. **Field Selection:** `?fields=id,name,price` (optional)
2. **Compression:** gzip/brotli enabled
3. **Pagination:** Limit default page size

### Real-time Updates (Future)
1. **WebSockets:** For live subscription status
2. **Server-Sent Events:** For notifications
3. **Webhooks:** For external integrations

## Security for Frontend Integration

### CORS Configuration
```typescript
{
  origin: [
    'https://masheleng.framer.app',
    'https://www.masheleng.edu',
    'http://localhost:3000' // Dev
  ],
  credentials: true
}
```

### Rate Limiting
- Public endpoints: 100 requests/minute
- Authenticated: 1000 requests/minute
- Premium+: 5000 requests/minute

### Authentication Flow
1. **Login:** `POST /auth/login` → JWT tokens
2. **Refresh:** `POST /auth/refresh` → New access token
3. **Logout:** `POST /auth/logout` → Invalidate tokens

## Deployment Strategy

### Backend (NestJS)
- **Hosting:** Railway, Render, or AWS ECS
- **Database:** Managed PostgreSQL (AWS RDS, Digital Ocean)
- **Redis:** Managed Redis (Upstash, Redis Cloud)
- **Region:** Africa (af-south-1) for compliance

### Frontend (Framer)
- **Hosting:** Framer built-in hosting
- **Custom Domain:** masheleng.edu → Framer site
- **API Calls:** masheleng.edu/api → NestJS backend

### DNS Configuration
```
masheleng.edu          → Framer site
www.masheleng.edu      → Framer site
api.masheleng.edu      → NestJS backend
docs.api.masheleng.edu → Swagger docs
```

## Future Enhancements

### Phase 2-3: Core Features
- Authentication system
- Subscription management
- Payment integration

### Phase 4: Developer Experience
- **TypeScript SDK:** Auto-generated from Swagger
- **Playground:** Interactive API testing
- **Webhooks Dashboard:** Monitor integrations

### Phase 5: Advanced Features
- **GraphQL:** If Framer needs flexible queries
- **Real-time:** WebSockets for live updates
- **Analytics SDK:** Track user behavior from Framer

### Phase 6: Mobile Support
- **React Native:** Same API, mobile app
- **PWA:** Progressive web app from Framer

## Conclusion

**NestJS is the RIGHT choice** for this project because:
1. ✅ Complex business logic requires structure
2. ✅ SOLID principles naturally enforced
3. ✅ Scalability built-in
4. ✅ Framer integration is straightforward (REST + Swagger)
5. ✅ Future-proof (can add GraphQL, WebSockets, mobile later)

The **slight DX overhead** compared to Next.js is worth it for the **enterprise-grade architecture** we need for insurance integration, compliance, and scale.
