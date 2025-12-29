-- =====================================================
-- Sample Course Data for Masheleng University Portal
-- =====================================================
-- This script creates 3 sample courses with modules and lessons
-- Including video lessons (Vimeo) and text lessons
-- =====================================================

-- Clear existing data (CAUTION: This will delete all course data!)
-- Comment out these lines if you want to keep existing data
TRUNCATE TABLE course_lessons CASCADE;
TRUNCATE TABLE course_modules CASCADE;
TRUNCATE TABLE courses CASCADE;

-- =====================================================
-- COURSE 1: Introduction to TypeScript
-- =====================================================

INSERT INTO courses (id, name, description, thumbnail_url, duration_hours, level, required_tier_level, status, sort_order, what_youll_learn, requirements, enrollment_count, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Introduction to TypeScript',
  'Learn TypeScript from scratch and build type-safe applications. Perfect for JavaScript developers looking to level up their skills with static typing and modern development practices.',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  8,
  'beginner',
  1, -- Entry tier
  'published',
  1,
  E'Master TypeScript fundamentals and syntax\nBuild type-safe applications with confidence\nUnderstand advanced TypeScript features\nIntegrate TypeScript with React and Node.js\nWrite cleaner, more maintainable code',
  'Basic JavaScript knowledge, A code editor (VS Code recommended), Node.js installed',
  0,
  NOW(),
  NOW()
)
RETURNING id AS course_1_id \gset

-- Module 1: Getting Started
INSERT INTO course_modules (id, course_id, title, description, sort_order, duration_minutes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'course_1_id',
  'Getting Started with TypeScript',
  'Introduction to TypeScript, setup, and basic concepts',
  0,
  60,
  NOW(),
  NOW()
)
RETURNING id AS module_1_1_id \gset

-- Lessons for Module 1
INSERT INTO course_lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, sort_order, is_preview, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    :'module_1_1_id',
    'What is TypeScript?',
    NULL,
    'video',
    '76979871', -- Public Vimeo video ID
    7,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    :'module_1_1_id',
    'Setting Up Your Development Environment',
    E'# Setting Up TypeScript\n\n## Installation Steps\n\n1. Install Node.js from nodejs.org\n2. Install TypeScript globally:\n   ```\n   npm install -g typescript\n   ```\n3. Verify installation:\n   ```\n   tsc --version\n   ```\n\n## VS Code Setup\n\n- Install the official TypeScript extension\n- Enable auto-imports\n- Configure your tsconfig.json',
    'video',
    '347119375',
    10,
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    :'module_1_1_id',
    'Understanding Type Annotations',
    E'# Type Annotations in TypeScript\n\nType annotations are one of the core features of TypeScript. They allow you to explicitly specify the type of a variable, parameter, or return value.\n\n## Basic Types\n\n### String\n```typescript\nlet name: string = "John Doe";\n```\n\n### Number\n```typescript\nlet age: number = 25;\nlet price: number = 19.99;\n```\n\n### Boolean\n```typescript\nlet isActive: boolean = true;\n```',
    'text',
    NULL,
    15,
    2,
    false,
    NOW(),
    NOW()
  );

-- Module 2: Advanced TypeScript
INSERT INTO course_modules (id, course_id, title, description, sort_order, duration_minutes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'course_1_id',
  'Advanced TypeScript Features',
  'Interfaces, generics, and advanced type features',
  1,
  120,
  NOW(),
  NOW()
)
RETURNING id AS module_1_2_id \gset

INSERT INTO course_lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, sort_order, is_preview, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    :'module_1_2_id',
    'Interfaces and Type Aliases',
    NULL,
    'video',
    '391466947',
    12,
    0,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    :'module_1_2_id',
    'Generics in TypeScript',
    E'# Generics in TypeScript\n\nGenerics allow you to write reusable, type-safe code that works with multiple types.\n\n## Basic Generic Function\n\n```typescript\nfunction identity<T>(value: T): T {\n  return value;\n}\n\nconst num = identity<number>(42);\nconst str = identity<string>("Hello");\n```',
    'video',
    '76979871',
    15,
    1,
    false,
    NOW(),
    NOW()
  );

-- =====================================================
-- COURSE 2: Web Development Fundamentals
-- =====================================================

INSERT INTO courses (id, name, description, thumbnail_url, duration_hours, level, required_tier_level, status, sort_order, what_youll_learn, requirements, enrollment_count, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Web Development Fundamentals',
  'Master the essentials of web development including HTML, CSS, and JavaScript. Build responsive websites from scratch and understand how the web works.',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  12,
  'beginner',
  1,
  'published',
  2,
  E'HTML5 semantic markup\nCSS styling and layouts\nResponsive web design\nJavaScript fundamentals\nDOM manipulation\nBuilding real-world projects',
  'A computer with internet access, A modern web browser, Enthusiasm to learn!',
  0,
  NOW(),
  NOW()
)
RETURNING id AS course_2_id \gset

-- Module 1: HTML Essentials
INSERT INTO course_modules (id, course_id, title, description, sort_order, duration_minutes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'course_2_id',
  'HTML Essentials',
  'Learn the building blocks of web pages',
  0,
  90,
  NOW(),
  NOW()
)
RETURNING id AS module_2_1_id \gset

INSERT INTO course_lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, sort_order, is_preview, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    :'module_2_1_id',
    'Introduction to HTML',
    NULL,
    'video',
    '347119375',
    8,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    :'module_2_1_id',
    'HTML Elements and Structure',
    E'# HTML Elements and Structure\n\nHTML (HyperText Markup Language) is the standard language for creating web pages.\n\n## Basic Structure\n\nEvery HTML document follows this basic structure:\n\n```html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My First Webpage</title>\n</head>\n<body>\n  <h1>Welcome to My Website</h1>\n  <p>This is a paragraph.</p>\n</body>\n</html>\n```',
    'text',
    NULL,
    12,
    1,
    false,
    NOW(),
    NOW()
  );

-- =====================================================
-- COURSE 3: Business Management Basics
-- =====================================================

INSERT INTO courses (id, name, description, thumbnail_url, duration_hours, level, required_tier_level, status, sort_order, what_youll_learn, requirements, enrollment_count, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Business Management Basics',
  'Learn essential business management principles, leadership skills, and organizational strategies. Perfect for aspiring entrepreneurs and managers.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  6,
  'beginner',
  2, -- Premium tier required
  'published',
  3,
  E'Fundamental business principles\nEffective leadership strategies\nTeam management techniques\nFinancial planning basics\nStrategic decision making',
  'No prior business knowledge required, Willingness to learn and apply concepts',
  0,
  NOW(),
  NOW()
)
RETURNING id AS course_3_id \gset

-- Module 1: Introduction to Business Management
INSERT INTO course_modules (id, course_id, title, description, sort_order, duration_minutes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'course_3_id',
  'Introduction to Business Management',
  'Understanding the role of a manager',
  0,
  75,
  NOW(),
  NOW()
)
RETURNING id AS module_3_1_id \gset

INSERT INTO course_lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, sort_order, is_preview, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    :'module_3_1_id',
    'What is Business Management?',
    NULL,
    'video',
    '76979871',
    9,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    :'module_3_1_id',
    'Key Management Functions',
    E'# Key Management Functions\n\nManagement involves coordinating and overseeing the work activities of others to accomplish organizational goals efficiently and effectively.\n\n## The Four Functions of Management\n\n### 1. Planning\n- Setting objectives\n- Developing strategies\n- Creating action plans\n\n### 2. Organizing\n- Determining resources needed\n- Assigning tasks\n- Establishing structure',
    'text',
    NULL,
    12,
    1,
    false,
    NOW(),
    NOW()
  );

-- =====================================================
-- Display Summary
-- =====================================================

SELECT
  'Sample data created successfully!' AS message,
  (SELECT COUNT(*) FROM courses) AS total_courses,
  (SELECT COUNT(*) FROM course_modules) AS total_modules,
  (SELECT COUNT(*) FROM course_lessons) AS total_lessons;

-- =====================================================
-- Vimeo Video IDs Used (Public Educational Content)
-- =====================================================
-- 76979871  - Educational sample video
-- 347119375 - Tutorial/learning content
-- 391466947 - Educational demonstration
--
-- Note: Replace these with your own Vimeo videos for production
-- =====================================================
