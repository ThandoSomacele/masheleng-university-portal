import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Courses E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;

  const TEST_USER = {
    email: 'test-e2e@example.com',
    password: 'Test123!',
    first_name: 'E2E',
    surname: 'Test',
    country_code: 'BW',
  };

  // Valid course UUIDs from seed data
  const COURSE_IDS = {
    typescript: '11111111-1111-1111-1111-111111111111',
    webdev: '22222222-1111-1111-1111-111111111111',
    business: '33333333-1111-1111-1111-111111111111',
    invalid: 'invalid-uuid',
    nonExistent: '99999999-9999-9999-9999-999999999999',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });

    await app.init();

    // Register and login test user
    try {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(TEST_USER);

      if (registerResponse.status === 201) {
        authToken = registerResponse.body.tokens.access_token;
        testUserId = registerResponse.body.user.id;
      } else {
        // User might already exist, try login
        const loginResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: TEST_USER.email,
            password: TEST_USER.password,
          });

        authToken = loginResponse.body.tokens.access_token;
        testUserId = loginResponse.body.user.id;
      }
    } catch (error) {
      console.error('Failed to setup test user:', error);
    }

    // Subscribe test user to Entry tier
    const tiersResponse = await request(app.getHttpServer())
      .get('/api/v1/subscriptions/tiers')
      .expect(200);

    const entryTier = tiersResponse.body.find((t: any) => t.access_level === 1);

    if (entryTier) {
      await request(app.getHttpServer())
        .post('/api/v1/subscriptions/subscribe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tier_id: entryTier.id,
          payment_frequency: 'monthly',
        });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/courses', () => {
    it('should return all published courses (public endpoint)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('status', 'published');
        });
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}`)
        .expect(401);
    });

    it('should return 400 with invalid UUID format', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.invalid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('uuid');
        });
    });

    it('should return 404 with non-existent course UUID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.nonExistent}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    it('should return course with valid auth and UUID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', COURSE_IDS.webdev);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('required_tier_level');
        });
    });

    it('should return 403 if user has no subscription', async () => {
      // Create a new user without subscription
      const noSubUser = {
        email: 'nosub-' + Date.now() + '@example.com',
        password: 'Test123!',
        first_name: 'NoSub',
        surname: 'User',
        country_code: 'BW',
      };

      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(noSubUser);

      const noSubToken = registerRes.body.tokens.access_token;

      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}`)
        .set('Authorization', `Bearer ${noSubToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('subscription');
        });
    });
  });

  describe('GET /api/v1/courses/:id/curriculum', () => {
    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}/curriculum`)
        .expect(401);
    });

    it('should return curriculum with modules and lessons', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}/curriculum`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('lessons');
            expect(Array.isArray(res.body[0].lessons)).toBe(true);
          }
        });
    });

    it('should include progress data for authenticated user', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}/curriculum`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0 && res.body[0].lessons.length > 0) {
            // Progress might be null if user hasn't started
            expect(res.body[0].lessons[0]).toHaveProperty('progress');
            expect(res.body[0].lessons[0]).toHaveProperty('is_completed');
          }
        });
    });

    it('should not crash with LessonProgress entity error', async () => {
      // This test verifies the LessonProgress entity is properly registered
      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/${COURSE_IDS.webdev}/curriculum`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should not return 500 Internal Server Error
      expect(response.status).not.toBe(500);

      // If there's an error, it should be a client error (4xx), not server error
      if (response.status >= 400) {
        expect(response.status).toBeLessThan(500);
      }
    });
  });

  describe('POST /api/v1/courses/:id/enroll', () => {
    it('should enroll user in course', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/courses/${COURSE_IDS.typescript}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('course_id', COURSE_IDS.typescript);
          expect(res.body).toHaveProperty('user_id', testUserId);
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should return enrollment if already enrolled', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/courses/${COURSE_IDS.typescript}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // Should return existing enrollment (200 or 201)
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('course_id', COURSE_IDS.typescript);
        });
    });
  });

  describe('GET /api/v1/courses/enrollments/my', () => {
    it('should return user enrollments', () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses/enrollments/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // User should have at least the enrollment from previous test
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('course_id');
          expect(res.body[0]).toHaveProperty('progress_percentage');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses/enrollments/my')
        .expect(401);
    });
  });
});
