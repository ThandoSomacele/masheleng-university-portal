# Framer Pages Setup Guide (2026)
## Creating Course Detail Pages for Masheleng University Portal

**Last Updated:** January 4, 2026
**Based on:** [Framer Help: Using Pages](https://www.framer.com/help/articles/how-to-use-pages/)

---

## 📚 Understanding Framer Page Types

Framer offers **3 page types**:

### 1. **Web Pages** (Standard Pages) ✅ Use This
- Best for static pages with custom URLs
- Full control over URL path
- Desktop breakpoints, effects, and links
- **Use for:** Course detail pages, login, register, dashboard

### 2. **CMS Pages** (Dynamic Content) ⚠️ Limitations
- Generated from CMS collections
- Automatic page generation from content
- **Limitation:** Slugs cannot contain "/" - cannot use `/courses/:id` pattern
- **Use for:** Blog posts, portfolio items (not suitable for course UUIDs)

### 3. **Design Pages** (Mockups)
- Not published on the web
- For design and asset storage

---

## 🎯 Recommended Approach for Course Pages

Since our course UUIDs don't fit CMS slug limitations (no "/" allowed), we'll use **Web Pages** with UUID-based URLs.

### Option A: Create Individual Web Pages (Recommended)

Create separate Web Pages for each course:

**Steps:**
1. In Framer, open the **Pages panel** (left sidebar)
2. Click the **"+"** button to add a new page
3. Select **"Web Page"**
4. Double-click the page name to set the URL
5. Enter the course UUID as the path

**Example URLs:**
```
/11111111-1111-1111-1111-111111111111  (TypeScript course)
/22222222-1111-1111-1111-111111111111  (Web Dev course)
/33333333-1111-1111-1111-111111111111  (Business course)
```

**On each page:**
- Add the `CourseDetail` component
- The component will auto-extract the UUID from the URL
- No props needed - it reads `window.location.pathname`

### Option B: Create a Courses Landing Page + Individual Course Pages

1. Create `/courses` page with `CourseCatalog` component
2. Create individual course pages:
   - `/courses-11111111-1111-1111-1111-111111111111`
   - `/courses-22222222-1111-1111-1111-111111111111`
   - `/courses-33333333-1111-1111-1111-111111111111`

(Note: Use `-` instead of `/` since Framer slugs can't contain slashes)

Our `CourseDetail` component will still extract the UUID correctly.

---

## 📝 Step-by-Step: Creating a Course Detail Page

### Step 1: Create New Web Page

1. Open your Framer project
2. In the **Pages panel** (left sidebar), click **"+"**
3. Select **"Web Page"** from the page type menu
4. Framer creates a new page with default name

### Step 2: Set the Page URL

1. **Double-click** the page name in the Pages panel
2. Enter your desired path (the UUID):
   ```
   22222222-1111-1111-1111-111111111111
   ```
3. Press Enter

**Note:** Framer automatically adds the leading `/`, so just type the UUID

### Step 3: Add CourseDetail Component

1. From the **Components panel**, find `CourseDetail`
2. Drag it onto the page canvas
3. **Do NOT** set any props - the component auto-extracts the courseId

### Step 4: Test in Preview

1. Click **Preview** (top right)
2. Open browser DevTools (F12)
3. Look for console logs:
   ```
   🔍 CourseDetail - Debugging courseId extraction:
   ✅ Found UUID in path: 22222222-1111-1111-1111-111111111111
   🎯 Final courseId: 22222222-1111-1111-1111-111111111111
   ```

### Step 5: Publish

1. Click **Publish** when ready
2. Your course page will be live at:
   ```
   https://university.masheleng.com/22222222-1111-1111-1111-111111111111
   ```

---

## 🔧 How Our CourseDetail Component Works

Our component is **smart** and works with ANY URL structure:

### URL Detection Strategy

```typescript
// Strategy 1: Look for /courses/:uuid pattern
if (pathSegments.indexOf('courses') !== -1) {
  extractedCourseId = pathSegments[coursesIndex + 1];
}

// Strategy 2: Find ANY UUID in the path
for (const segment of pathSegments) {
  if (uuidRegex.test(segment)) {
    extractedCourseId = segment;
    break;
  }
}
```

### Supported URL Patterns

✅ All of these work:
```
/22222222-1111-1111-1111-111111111111
/courses-22222222-1111-1111-1111-111111111111
/course/22222222-1111-1111-1111-111111111111/details
/learn/22222222-1111-1111-1111-111111111111
/anything/22222222-1111-1111-1111-111111111111/anything
```

The component searches for a valid UUID pattern anywhere in the path.

---

## 🚀 Quick Setup (3 Course Pages)

Create these three Web Pages:

| Page Name | URL Path | Component |
|-----------|----------|-----------|
| TypeScript Course | `11111111-1111-1111-1111-111111111111` | CourseDetail |
| Web Dev Course | `22222222-1111-1111-1111-111111111111` | CourseDetail |
| Business Course | `33333333-1111-1111-1111-111111111111` | CourseDetail |

**Time:** ~3 minutes for all three pages

---

## 🔍 Verifying It Works

### In Framer Preview:

1. Navigate to the course page
2. Open DevTools (F12)
3. Check console for:
   ```
   🔧 Masheleng API Config: {apiUrl: '...', environment: 'development'}
   🔍 CourseDetail - Debugging courseId extraction:
     - courseIdProp: undefined
     - window.location.pathname: /22222222-1111-1111-1111-111111111111
     - Path segments: ["22222222-1111-1111-1111-111111111111"]
   ✅ Strategy 2: Found UUID in path: 22222222-1111-1111-1111-111111111111
   🎯 Final courseId: 22222222-1111-1111-1111-111111111111
   🔐 Authentication status: Logged in
   📡 Fetching course: 22222222-1111-1111-1111-111111111111
   📥 API Call: GET /courses/22222222-1111-1111-1111-111111111111
   ✅ Course data loaded: Web Development Fundamentals
   ```

### Expected Behavior:

- ✅ Course title displays
- ✅ Course description shows
- ✅ Curriculum modules visible
- ✅ No errors in console
- ✅ No "courseId is undefined" messages

---

## ⚠️ Common Issues & Solutions

### Issue: "No course ID provided"

**Cause:** Component can't find UUID in URL

**Fix:**
1. Check the page URL in Framer Pages panel
2. Ensure it contains a valid UUID
3. Test with: `22222222-1111-1111-1111-111111111111`

### Issue: "Validation failed (uuid is expected)"

**Cause:** UUID format is invalid

**Fix:**
Use exact UUIDs from seed data:
- `11111111-1111-1111-1111-111111111111`
- `22222222-1111-1111-1111-111111111111`
- `33333333-1111-1111-1111-111111111111`

### Issue: Old ngrok URL in config

**Cause:** Cached config.js file

**Fix:**
1. Update `config.js` in Framer Code Files
2. Get current ngrok URL: `curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'`
3. Update `DEV_API_URL` in config.js
4. Hard refresh: Cmd+Shift+R

---

## 📊 Framer Limitations (2026)

### What Works:
- ✅ Custom URL paths for Web Pages
- ✅ Multiple pages with different URLs
- ✅ UUID-based paths (our solution)
- ✅ JavaScript-based URL parsing

### What Doesn't Work:
- ❌ Route parameters as props (no `params.courseId`)
- ❌ CMS slugs with "/" (can't use `/courses/:id`)
- ❌ Nested dynamic routes (like Next.js)
- ❌ Automatic route param extraction

**Our Workaround:** JavaScript extracts UUID from `window.location.pathname` ✅

---

## 🎓 Alternative: Using Framer CMS (Not Recommended for UUIDs)

If you wanted to use CMS (we don't recommend it for course UUIDs):

1. Create a CMS Collection called "Courses"
2. Add fields: `slug`, `title`, `courseId`
3. Create CMS Page bound to "Courses" collection
4. Each course gets a page: `/courses/slug-name`
5. In component, extract courseId from CMS data (not URL)

**Why we don't use this:**
- Extra complexity
- Slugs are human-readable strings, not UUIDs
- Our UUIDs are the source of truth
- URL-based routing is more flexible

---

## 📁 Files to Update in Framer

### 1. config.js
Location: Code Files
```javascript
const DEV_API_URL = 'https://566517f62a69.ngrok-free.app/api/v1';
```

### 2. CourseDetail.tsx
Location: Code Components
- Already has smart UUID extraction
- No changes needed
- Just copy latest version from repo

---

## ✅ Checklist

- [ ] Create 3 Web Pages in Framer (one per course)
- [ ] Set URL paths to course UUIDs
- [ ] Add CourseDetail component to each page
- [ ] Update config.js with current ngrok URL
- [ ] Test in Framer Preview
- [ ] Check console logs for UUID extraction
- [ ] Verify course data loads
- [ ] Publish to production

---

## 🔗 Resources

- [Framer Help: Using Pages](https://www.framer.com/help/articles/how-to-use-pages/)
- [Framer Academy: CMS Pages & Dynamic Content](https://www.framer.com/academy/lessons/cms-pages-dynamic-content)
- [Types of Pages in Framer](https://janeui.com/articles/pages-in-framer)

---

**Next:** After creating pages, run Playwright tests to validate end-to-end flow
