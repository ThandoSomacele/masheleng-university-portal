# Database Seeds

This directory contains seed data for testing the Masheleng University platform.

---

## Development Subscription Scripts

Use these scripts to quickly switch the demo user's subscription tier for testing upgrade flows.

### Available Scripts

| Script | Description | Command |
|--------|-------------|---------|
| `dev-subscription-none.sql` | Remove subscription (test full flow) | `psql -d masheleng_portal -f database/seeds/dev-subscription-none.sql` |
| `dev-subscription-entry.sql` | Set to Entry tier (BWP 99/mo) | `psql -d masheleng_portal -f database/seeds/dev-subscription-entry.sql` |
| `dev-subscription-premium.sql` | Set to Premium tier (BWP 180/mo) | `psql -d masheleng_portal -f database/seeds/dev-subscription-premium.sql` |
| `dev-subscription-premium-plus.sql` | Set to Premium+ tier (BWP 250/mo) | `psql -d masheleng_portal -f database/seeds/dev-subscription-premium-plus.sql` |
| `demo-user-data.sql` | Full demo setup (subscription + payment + insurance + enrollments) | `psql -d masheleng_portal -f database/seeds/demo-user-data.sql` |

### Quick Commands (with auth)

```bash
# Remove subscription (test from scratch)
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal -f database/seeds/dev-subscription-none.sql

# Set to Entry tier
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal -f database/seeds/dev-subscription-entry.sql

# Set to Premium tier
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal -f database/seeds/dev-subscription-premium.sql

# Set to Premium+ tier (full access)
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal -f database/seeds/dev-subscription-premium-plus.sql

# Full reset with all demo data
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal -f database/seeds/demo-user-data.sql
```

### Testing Upgrade Flow

1. Start with no subscription: `dev-subscription-none.sql`
2. User sees pricing page, selects Entry tier
3. Switch to Entry: `dev-subscription-entry.sql`
4. User tries to access Premium course, sees upgrade prompt
5. Switch to Premium: `dev-subscription-premium.sql`
6. User tries to access insurance (Premium+ only)
7. Switch to Premium+: `dev-subscription-premium-plus.sql`

---

# Sample Course Data Seeds

## What's Included

### 📚 3 Sample Courses:

1. **Introduction to TypeScript** (Entry Tier)
   - 2 modules, 5 lessons
   - Mix of video and text lessons
   - Duration: 8 hours

2. **Web Development Fundamentals** (Entry Tier)
   - 2 modules, 3 lessons
   - HTML and CSS content
   - Duration: 12 hours

3. **Business Management Basics** (Premium Tier)
   - 1 module, 2 lessons
   - Business principles
   - Duration: 6 hours

### 🎥 Vimeo Videos

The seed data uses these public Vimeo video IDs:
- `76979871` - Educational sample
- `347119375` - Tutorial content
- `391466947` - Learning demonstration

**Important:** These are placeholder public videos. Replace with your own Vimeo content for production.

## How to Run

### Option 1: SQL File (Recommended for Quick Setup)

```bash
# Using psql
psql -U postgres -d masheleng_university -f database/seeds/sample-courses.sql

# Or using npm script (if configured)
npm run seed:sql
```

### Option 2: TypeScript Seeder

```bash
# Using ts-node
npx ts-node src/database/seeds/run-seed.ts

# Or using npm script
npm run seed
```

### Option 3: From NestJS App

```typescript
import { seedCourseData } from './database/seeds/course-data.seed';

// In your app or migration
await seedCourseData(dataSource);
```

## Environment Setup

Make sure your database connection is configured:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=masheleng_university
```

## What Gets Created

- ✅ 3 Courses with descriptions, thumbnails, requirements
- ✅ 5 Course Modules (sections) across all courses
- ✅ 11 Lessons total:
  - 6 Video lessons (Vimeo)
  - 3 Text lessons (Markdown)
  - 2 Video+Text lessons
- ✅ Preview lessons marked (for non-enrolled users)
- ✅ Sample resources attached to some lessons

## Testing the Data

After seeding:

1. **View Courses**
   ```bash
   GET http://localhost:3000/api/v1/courses
   ```

2. **Get Course Details**
   ```bash
   GET http://localhost:3000/api/v1/courses/{course_id}
   ```

3. **Get Curriculum**
   ```bash
   GET http://localhost:3000/api/v1/courses/{course_id}/curriculum
   ```

4. **Enroll in Course** (requires authentication)
   ```bash
   POST http://localhost:3000/api/v1/courses/{course_id}/enroll
   ```

5. **Watch Lesson** (requires enrollment)
   ```bash
   GET http://localhost:3000/api/v1/courses/{course_id}/lessons/{lesson_id}
   ```

## Vimeo Setup

To use your own videos:

1. **Upload videos to Vimeo**
   - Create a Vimeo account
   - Upload your educational videos
   - Set privacy to "Unlisted" or use domain restrictions

2. **Get Video IDs**
   - The video ID is in the URL: `https://vimeo.com/123456789`
   - Use `123456789` in the `video_url` field

3. **Update Seed Data**
   - Replace the video IDs in the seed files
   - Update duration_minutes to match your videos

## Clearing Data

**Warning:** This will delete ALL course data!

```sql
TRUNCATE TABLE course_lessons CASCADE;
TRUNCATE TABLE course_modules CASCADE;
TRUNCATE TABLE courses CASCADE;
```

Or use the seeder (it clears data before inserting).

## Customizing Content

Edit `src/database/seeds/course-data.seed.ts` to:
- Add more courses
- Change lesson content
- Add more modules
- Update video IDs
- Modify course metadata

## Troubleshooting

### "relation does not exist" error
- Run migrations first: `npm run migration:run`
- Ensure database exists

### "duplicate key value" error
- Data already exists
- Clear existing data or remove `TRUNCATE` statements

### Vimeo videos not loading
- Check video privacy settings
- Verify video IDs are correct
- Ensure Vimeo Player API is loaded in frontend

## Next Steps

After seeding:
1. Test enrollment flow
2. Watch video lessons
3. Track progress
4. Test lesson navigation
5. Verify completion tracking

## Production Deployment

Before going live:
- [ ] Replace all Vimeo video IDs with your content
- [ ] Remove `TRUNCATE` statements
- [ ] Update course descriptions and images
- [ ] Set appropriate tier requirements
- [ ] Test all lessons thoroughly
- [ ] Add proper course thumbnails
- [ ] Create lesson resources (PDFs, code files, etc.)
