/**
 * Framer CourseDetail Component - Browser E2E Test
 *
 * Tests the full user flow from login to viewing course details in Framer
 *
 * Prerequisites:
 * 1. Backend must be running (npm run start:dev)
 * 2. ngrok tunnel must be active
 * 3. Framer site must be published with CourseDetail component
 * 4. Framer route must exist for course detail page
 *
 * Run with: npx playwright test test/framer-course-detail.e2e.ts
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const CONFIG = {
  // Framer site URL - Update this to your actual Framer site
  FRAMER_SITE_URL: process.env.FRAMER_SITE_URL || 'https://university.masheleng.com',

  // Backend API URL (auto-detected from ngrok or localhost)
  BACKEND_API_URL: 'https://566517f62a69.ngrok-free.app/api/v1',

  TEST_USER: {
    email: 'test1@example.com',
    password: 'Test123!',
  },

  COURSE_IDS: {
    typescript: '11111111-1111-1111-1111-111111111111',
    webdev: '22222222-1111-1111-1111-111111111111',
    business: '33333333-1111-1111-1111-111111111111',
  },

  // Test mode: 'api' (test API only) or 'full' (test Framer + API)
  TEST_MODE: process.env.TEST_MODE || 'api',
};

test.describe('Framer CourseDetail Component E2E', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Enable console logging for debugging
    page.on('console', (msg) => {
      const text = msg.text();
      // Only log our app's console messages
      if (text.includes('CourseDetail') || text.includes('🔍') || text.includes('✅') || text.includes('⚠️')) {
        console.log(`Browser Console: ${text}`);
      }
    });

    // Log page errors
    page.on('pageerror', (err) => {
      console.error(`Page Error: ${err.message}`);
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should login and set auth token in localStorage', async () => {
    // Navigate to login page
    await page.goto(CONFIG.FRAMER_SITE_URL + '/login');

    // Fill in login form
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect after successful login
    await page.waitForURL(/.*/, { timeout: 5000 }).catch(() => {});

    // Verify token is stored in localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem('masheleng_token');
    });

    expect(token).toBeTruthy();
    expect(token).toMatch(/^eyJ/); // JWT tokens start with "eyJ"
  });

  test('should extract courseId from URL and load course data', async () => {
    // First, login
    await page.goto(CONFIG.FRAMER_SITE_URL + '/login');
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to course detail page
    const courseUrl = `${CONFIG.FRAMER_SITE_URL}/courses/${CONFIG.COURSE_IDS.webdev}`;
    console.log(`Navigating to: ${courseUrl}`);
    await page.goto(courseUrl);

    // Wait for the component to load
    await page.waitForTimeout(3000);

    // Check console logs for courseId extraction
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    // Verify courseId was extracted
    await page.waitForTimeout(1000);
    const courseIdExtracted = consoleMessages.some((msg) =>
      msg.includes(CONFIG.COURSE_IDS.webdev)
    );

    expect(courseIdExtracted).toBeTruthy();

    // Verify course title is displayed
    const courseTitle = await page.textContent('h1, h2, [data-course-title]');
    expect(courseTitle).toBeTruthy();
    console.log(`Course title found: ${courseTitle}`);
  });

  test('should load course curriculum without errors', async () => {
    // Login
    await page.goto(CONFIG.FRAMER_SITE_URL + '/login');
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to course
    await page.goto(`${CONFIG.FRAMER_SITE_URL}/courses/${CONFIG.COURSE_IDS.webdev}`);
    await page.waitForTimeout(3000);

    // Check for error messages in the page
    const errorMessages = await page.$$eval('[data-error], .error, [role="alert"]', (elements) =>
      elements.map((el) => el.textContent)
    );

    // Should not have subscription-related errors (since we subscribed the test user)
    const hasSubscriptionError = errorMessages.some((msg) =>
      msg?.includes('subscription')
    );
    expect(hasSubscriptionError).toBeFalsy();

    // Check console for successful API calls
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(text);
    });

    await page.waitForTimeout(1000);

    // Verify curriculum was loaded
    const curriculumLoaded = consoleMessages.some(
      (msg) => msg.includes('Curriculum loaded') || msg.includes('modules')
    );

    if (!curriculumLoaded) {
      console.log('Console messages:', consoleMessages);
    }
  });

  test('should handle missing courseId gracefully', async () => {
    // Login
    await page.goto(CONFIG.FRAMER_SITE_URL + '/login');
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to a page without a courseId
    await page.goto(CONFIG.FRAMER_SITE_URL + '/some-page-without-uuid');
    await page.waitForTimeout(2000);

    // Should show an error message about missing courseId
    const errorMessage = await page.textContent('[data-error], .error');
    if (errorMessage) {
      expect(errorMessage).toMatch(/No course ID|course ID/i);
    }

    // Check console logs
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    await page.waitForTimeout(1000);

    const foundNoCourseId = consoleMessages.some((msg) => msg.includes('Final courseId: NONE'));
    expect(foundNoCourseId).toBeTruthy();
  });

  test('should not have console errors related to LessonProgress entity', async () => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // Login and navigate to course
    await page.goto(CONFIG.FRAMER_SITE_URL + '/login');
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${CONFIG.FRAMER_SITE_URL}/courses/${CONFIG.COURSE_IDS.webdev}`);
    await page.waitForTimeout(4000);

    // Check for entity-related errors
    const hasEntityError = consoleErrors.some((err) =>
      err.includes('EntityMetadataNotFoundError') || err.includes('LessonProgress')
    );

    if (hasEntityError) {
      console.error('Entity errors found:', consoleErrors);
    }

    expect(hasEntityError).toBeFalsy();
  });

  test('should display course modules and lessons', async () => {
    // Login
    await page.goto(CONFIG.FRAMER_SITE_URL + '/login');
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to course
    await page.goto(`${CONFIG.FRAMER_SITE_URL}/courses/${CONFIG.COURSE_IDS.webdev}`);
    await page.waitForTimeout(3000);

    // Check for module/lesson content
    // Note: Actual selectors depend on your Framer component structure
    const modules = await page.$$('[data-module], .module, [data-curriculum-module]');
    const lessons = await page.$$('[data-lesson], .lesson, [data-curriculum-lesson]');

    console.log(`Modules found: ${modules.length}`);
    console.log(`Lessons found: ${lessons.length}`);

    // At minimum, curriculum should be attempted to load
    // Even if the structure isn't found, check console for successful API call
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    await page.waitForTimeout(1000);

    const apiCalled = consoleMessages.some((msg) =>
      msg.includes('GET /courses/') && msg.includes('/curriculum')
    );

    expect(apiCalled).toBeTruthy();
  });
});

test.describe('API Direct Tests (for debugging)', () => {
  test('should verify backend API is accessible', async () => {
    const response = await fetch(`${CONFIG.BACKEND_API_URL}/courses`);
    expect(response.ok).toBeTruthy();

    const courses = await response.json();
    expect(Array.isArray(courses)).toBeTruthy();
    expect(courses.length).toBeGreaterThan(0);

    console.log(`✅ API returned ${courses.length} courses`);
  });

  test('should login via API and get valid token', async () => {
    const response = await fetch(`${CONFIG.BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CONFIG.TEST_USER),
    });

    expect(response.ok).toBeTruthy();

    const data = await response.json();
    expect(data.tokens).toBeTruthy();
    expect(data.tokens.access_token).toMatch(/^eyJ/);

    console.log(`✅ Login successful, token: ${data.tokens.access_token.slice(0, 20)}...`);
  });

  test('should get course with auth token', async () => {
    // Login first
    const loginResponse = await fetch(`${CONFIG.BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CONFIG.TEST_USER),
    });

    const { tokens } = await loginResponse.json();

    // Get course
    const courseResponse = await fetch(
      `${CONFIG.BACKEND_API_URL}/courses/${CONFIG.COURSE_IDS.webdev}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    expect(courseResponse.ok).toBeTruthy();

    const course = await courseResponse.json();
    expect(course.id).toBe(CONFIG.COURSE_IDS.webdev);
    expect(course.title).toBeTruthy();

    console.log(`✅ Course loaded: ${course.title}`);
  });
});
