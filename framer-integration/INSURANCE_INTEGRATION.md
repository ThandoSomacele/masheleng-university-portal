# Insurance Integration Guide

**Version:** 1.0.0
**Status:** ✅ Complete
**Last Updated:** December 2025

---

## Overview

The Masheleng University platform now includes comprehensive insurance integration, allowing students to apply for and manage education insurance policies. The system includes backend API endpoints, database schema, underwriter integration, and frontend components.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Framer)                   │
│  - InsuranceApplication Component                    │
│  - Policy Management Dashboard                       │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS API Calls
                   ↓
┌──────────────────────────────────────────────────────┐
│              NestJS Backend API                       │
│  - InsuranceController (REST endpoints)               │
│  - InsuranceService (Business logic)                 │
│  - InsurancePolicy Entity (Database model)           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─────→ PostgreSQL Database
                   │        (insurance_policies table)
                   │
                   └─────→ External Underwriter API
                            (Policy review & approval)
```

---

## Backend Implementation

### Database Schema

**Table:** `insurance_policies`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users table |
| type | ENUM | Insurance type (life, health, education, disability) |
| policy_number | VARCHAR(50) | Unique policy identifier (generated after approval) |
| status | ENUM | Policy status (pending, active, expired, cancelled, rejected) |
| premium | DECIMAL(10,2) | Monthly premium amount |
| coverage_amount | DECIMAL(12,2) | Total coverage amount |
| start_date | DATE | Policy start date |
| end_date | DATE | Policy end date |
| beneficiaries | JSONB | List of beneficiaries with percentages |
| medical_info | JSONB | Medical history and conditions |
| underwriter_data | JSONB | Data from underwriter review |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_insurance_policies_user_id` on `user_id`
- `idx_insurance_policies_status` on `status`
- `idx_insurance_policies_type` on `type`

### API Endpoints

#### Student Endpoints (Requires Authentication)

**Create Insurance Policy**
```http
POST /api/v1/insurance/policies
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "education",
  "premium": 250,
  "coverageAmount": 50000,
  "beneficiaries": [
    {
      "name": "John Doe",
      "relationship": "Father",
      "percentage": 100
    }
  ],
  "medicalInfo": {
    "hasPreExistingConditions": false,
    "conditions": [],
    "medications": []
  },
  "notes": "Optional notes"
}
```

**Get My Insurance Policies**
```http
GET /api/v1/insurance/policies/my
Authorization: Bearer {token}
```

**Get Policy by ID**
```http
GET /api/v1/insurance/policies/:id
Authorization: Bearer {token}
```

**Cancel Policy**
```http
PATCH /api/v1/insurance/policies/:id/cancel
Authorization: Bearer {token}
```

#### Admin Endpoints (Requires Admin Role)

**Get All Policies**
```http
GET /api/v1/insurance/admin/policies
Authorization: Bearer {admin_token}
```

**Get Pending Policies**
```http
GET /api/v1/insurance/admin/policies/pending
Authorization: Bearer {admin_token}
```

**Approve Policy**
```http
PATCH /api/v1/insurance/admin/policies/:id/approve
Authorization: Bearer {admin_token}
```

**Reject Policy**
```http
PATCH /api/v1/insurance/admin/policies/:id/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Reason for rejection"
}
```

**Get Statistics**
```http
GET /api/v1/insurance/admin/statistics
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "totalPolicies": 150,
  "activePolicies": 120,
  "pendingPolicies": 20,
  "totalPremiums": 30000.00
}
```

### Business Logic

#### Policy Creation Flow
1. User submits insurance application
2. System validates data and checks for existing active policy of same type
3. Policy created with `status: 'pending'`
4. Application automatically submitted to external underwriter API
5. Underwriter data stored in `underwriter_data` JSON field
6. Admin reviews and approves/rejects policy
7. Upon approval:
   - Policy number generated (format: `TYPE-TIMESTAMP-RANDOM`)
   - Status changed to `active`
   - Start and end dates set
   - User notified

#### Policy Number Generation
Format: `{TYPE}-{TIMESTAMP}-{RANDOM}`
- Example: `EDU-12345678-123`

#### Underwriter Integration
The system integrates with an external underwriter API configured via environment variables:

```env
UNDERWRITER_API_URL=http://localhost:4000/api
UNDERWRITER_API_KEY=dev_underwriter_key_12345
UNDERWRITER_NOTIFICATION_EMAIL=underwriter@test.local
```

When a policy is submitted, the system POSTs to `{UNDERWRITER_API_URL}/policies/review` with policy details for risk assessment.

---

## Frontend Implementation

### Components Created

#### 1. InsuranceApplication.tsx
**Purpose:** Allow students to apply for insurance coverage

**Features:**
- Multi-step form for policy application
- Coverage amount and premium selection
- Beneficiary management (add/remove multiple)
- Medical information disclosure
- Form validation
- Success confirmation screen

**Usage in Framer:**
1. Insert → Code → Code Component
2. Name: `InsuranceApplication`
3. Copy code from `/framer-integration/components/InsuranceApplication.tsx`
4. Place on `/insurance/apply` page

**Props:** None (uses API_URL from config)

---

## API Client Methods

The `api-client.js` file has been extended with insurance methods:

### Student Methods
```javascript
// Create insurance policy
await api.createInsurancePolicy({
  type: "education",
  premium: 250,
  coverageAmount: 50000,
  beneficiaries: [...],
  medicalInfo: {...},
  notes: "..."
})

// Get my policies
const policies = await api.getMyInsurancePolicies()

// Get specific policy
const policy = await api.getInsurancePolicyById(policyId)

// Cancel policy
await api.cancelInsurancePolicy(policyId)
```

### Admin Methods
```javascript
// Get all policies
const allPolicies = await api.getAllInsurancePolicies()

// Get pending policies
const pending = await api.getPendingInsurancePolicies()

// Approve policy
await api.approveInsurancePolicy(policyId)

// Reject policy
await api.rejectInsurancePolicy(policyId, "Reason")

// Get statistics
const stats = await api.getInsuranceStatistics()
```

---

## Testing

### Manual Testing Steps

1. **Create Policy:**
   ```bash
   # Login first
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'

   # Create policy (use token from login)
   curl -X POST http://localhost:3000/api/v1/insurance/policies \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "type": "education",
       "premium": 250,
       "coverageAmount": 50000,
       "beneficiaries": [
         {"name": "John Doe", "relationship": "Father", "percentage": 100}
       ]
     }'
   ```

2. **Get My Policies:**
   ```bash
   curl http://localhost:3000/api/v1/insurance/policies/my \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Admin Approval:**
   ```bash
   curl -X PATCH http://localhost:3000/api/v1/insurance/admin/policies/{POLICY_ID}/approve \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

---

## Configuration

### Environment Variables

Add to `.env.development` or `.env.production`:

```env
# Insurance Underwriter (Development)
UNDERWRITER_API_URL=http://localhost:4000/api
UNDERWRITER_API_KEY=dev_underwriter_key_12345
UNDERWRITER_NOTIFICATION_EMAIL=underwriter@test.local
```

### Framer Configuration

Update `config.js` if needed (already includes API_URL for insurance endpoints).

---

## Database Migration

**Migration File:** `src/database/migrations/1702000000002-CreateInsurancePoliciesTable.ts`

To run the migration:
```bash
npm run migration:run
```

To revert:
```bash
npm run migration:revert
```

---

## Security Considerations

1. **Authentication Required:** All endpoints except admin routes require valid JWT token
2. **Role-Based Access:** Admin endpoints restricted to ADMIN and SUPER_ADMIN roles
3. **Data Validation:** All inputs validated using class-validator DTOs
4. **Privacy:** Medical information stored securely in JSONB fields
5. **Policy Ownership:** Users can only access their own policies

---

## Future Enhancements

### Planned Features
- [ ] Email notifications on policy status changes
- [ ] PDF policy document generation
- [ ] Premium payment reminders
- [ ] Claims management system
- [ ] Policy renewal automation
- [ ] Integration with payment gateway for premium collection
- [ ] Mobile app support
- [ ] Multi-currency support
- [ ] Family/group insurance policies

### Integration Opportunities
- **Payment System:** Link insurance premiums to payment module
- **Subscription System:** Bundle insurance with course subscriptions
- **Analytics:** Track policy conversion rates and claims
- **CRM:** Send targeted insurance offers to eligible students

---

## Troubleshooting

### Common Issues

**Issue:** Migration fails with "relation already exists"
```bash
# Solution: Drop the table if it exists
psql -U masheleng -d masheleng_portal -c "DROP TABLE IF EXISTS insurance_policies CASCADE;"
npm run migration:run
```

**Issue:** Underwriter API not responding
```bash
# Solution: Check if UNDERWRITER_API_URL is configured
echo $UNDERWRITER_API_URL

# The system will continue without underwriter if API fails (logged as warning)
```

**Issue:** Can't create policy - "already have active policy"
```bash
# Solution: Cancel existing policy first
curl -X PATCH http://localhost:3000/api/v1/insurance/policies/{EXISTING_POLICY_ID}/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For questions or issues:
- Check backend logs: `tail -f /tmp/nest-server.log`
- Check browser console for frontend errors
- Review API responses for detailed error messages
- Verify database schema: `\d insurance_policies` in psql

---

## Compliance & Legal

**Important:** Insurance is a regulated industry. Before deploying to production:

1. ✅ Obtain necessary insurance licenses
2. ✅ Comply with local insurance regulations
3. ✅ Partner with licensed underwriters
4. ✅ Implement proper KYC/AML procedures
5. ✅ Add terms & conditions
6. ✅ Implement data privacy compliance (POPIA, GDPR)
7. ✅ Set up proper claims handling procedures

---

**Version History:**
- v1.0.0 (December 2025) - Initial insurance integration release

---

## Quick Reference

**Key Files:**
- Backend Entity: `src/insurance/entities/insurance-policy.entity.ts`
- Backend Service: `src/insurance/insurance.service.ts`
- Backend Controller: `src/insurance/insurance.controller.ts`
- Migration: `src/database/migrations/1702000000002-CreateInsurancePoliciesTable.ts`
- Frontend Component: `framer-integration/components/InsuranceApplication.tsx`
- API Client: `framer-integration/api-client.js` (insurance methods added)

**Database:**
- Table: `insurance_policies`
- Foreign Key: `user_id` → `users.id`

**API Base:** `/api/v1/insurance/*`

---

**Need Help?** Review the design system guide at `/framer-integration/DESIGN_SYSTEM.md` for styling consistency.
