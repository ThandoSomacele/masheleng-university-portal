-- =====================================================
-- Quick Sample Course Data for Masheleng University Portal
-- Corrected to match actual database schema
-- =====================================================

-- Clear existing data (CAUTION: This will delete all course data!)
TRUNCATE TABLE course_lessons CASCADE;
TRUNCATE TABLE course_modules CASCADE;
TRUNCATE TABLE courses CASCADE;

-- =====================================================
-- COURSE 1: Introduction to TypeScript
-- =====================================================

INSERT INTO courses (
  id, title, description, short_description, thumbnail_url, duration_minutes,
  required_tier_level, status, sort_order, instructor_name,
  enrollment_count, is_featured, created_at, updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Introduction to TypeScript',
  'Learn TypeScript from scratch and build type-safe applications. Perfect for JavaScript developers looking to level up their skills with static typing and modern development practices.',
  'Learn TypeScript fundamentals and build type-safe applications',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  480,
  1,
  'published'::courses_status_enum,
  1,
  'Tech Academy',
  0,
  true,
  NOW(),
  NOW()
);

-- Module 1: Getting Started
INSERT INTO course_modules (
  id, course_id, title, description, sort_order,
  duration_minutes, created_at, updated_at
)
VALUES (
  '11111111-2222-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Getting Started with TypeScript',
  'Introduction to TypeScript, setup, and basic concepts',
  0,
  60,
  NOW(),
  NOW()
);

-- Lessons for Module 1
INSERT INTO course_lessons (
  id, module_id, title, content, lesson_type, video_url,
  duration_minutes, sort_order, is_preview, created_at, updated_at
)
VALUES
  (
    '11111111-3333-1111-1111-111111111111',
    '11111111-2222-1111-1111-111111111111',
    'What is TypeScript?',
    NULL,
    'video'::course_lessons_lesson_type_enum,
    '76979871',
    7,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-3333-2222-1111-111111111111',
    '11111111-2222-1111-1111-111111111111',
    'Setting Up Your Development Environment',
    E'# Setting Up TypeScript\n\n## Installation Steps\n\n1. Install Node.js from nodejs.org\n2. Install TypeScript globally:\n   ```\n   npm install -g typescript\n   ```\n3. Verify installation:\n   ```\n   tsc --version\n   ```\n\n## VS Code Setup\n\n- Install the official TypeScript extension\n- Enable auto-imports\n- Configure your tsconfig.json',
    'video'::course_lessons_lesson_type_enum,
    '347119375',
    10,
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    '11111111-3333-3333-1111-111111111111',
    '11111111-2222-1111-1111-111111111111',
    'Understanding Type Annotations',
    E'# Type Annotations in TypeScript\n\nType annotations are one of the core features of TypeScript. They allow you to explicitly specify the type of a variable, parameter, or return value.\n\n## Basic Types\n\n### String\n```typescript\nlet name: string = "John Doe";\n```\n\n### Number\n```typescript\nlet age: number = 25;\nlet price: number = 19.99;\n```\n\n### Boolean\n```typescript\nlet isActive: boolean = true;\n```',
    'text'::course_lessons_lesson_type_enum,
    NULL,
    15,
    2,
    false,
    NOW(),
    NOW()
  );

-- Module 2: Advanced TypeScript
INSERT INTO course_modules (
  id, course_id, title, description, sort_order,
  duration_minutes, created_at, updated_at
)
VALUES (
  '11111111-2222-2222-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Advanced TypeScript Features',
  'Interfaces, generics, and advanced type features',
  1,
  120,
  NOW(),
  NOW()
);

INSERT INTO course_lessons (
  id, module_id, title, content, lesson_type, video_url,
  duration_minutes, sort_order, is_preview, created_at, updated_at
)
VALUES
  (
    '11111111-3333-4444-1111-111111111111',
    '11111111-2222-2222-1111-111111111111',
    'Interfaces and Type Aliases',
    NULL,
    'video'::course_lessons_lesson_type_enum,
    '391466947',
    12,
    0,
    false,
    NOW(),
    NOW()
  ),
  (
    '11111111-3333-5555-1111-111111111111',
    '11111111-2222-2222-1111-111111111111',
    'Generics in TypeScript',
    E'# Generics in TypeScript\n\nGenerics allow you to write reusable, type-safe code that works with multiple types.\n\n## Basic Generic Function\n\n```typescript\nfunction identity<T>(value: T): T {\n  return value;\n}\n\nconst num = identity<number>(42);\nconst str = identity<string>("Hello");\n```',
    'video'::course_lessons_lesson_type_enum,
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

INSERT INTO courses (
  id, title, description, short_description, thumbnail_url, duration_minutes,
  required_tier_level, status, sort_order, instructor_name,
  enrollment_count, is_featured, created_at, updated_at
)
VALUES (
  '22222222-1111-1111-1111-111111111111',
  'Web Development Fundamentals',
  'Master the essentials of web development including HTML, CSS, and JavaScript. Build responsive websites from scratch and understand how the web works.',
  'Master HTML, CSS, and JavaScript fundamentals',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  720,
  1,
  'published'::courses_status_enum,
  2,
  'Web Dev Academy',
  0,
  true,
  NOW(),
  NOW()
);

-- Module 1: HTML Essentials
INSERT INTO course_modules (
  id, course_id, title, description, sort_order,
  duration_minutes, created_at, updated_at
)
VALUES (
  '22222222-2222-1111-1111-111111111111',
  '22222222-1111-1111-1111-111111111111',
  'HTML Essentials',
  'Learn the building blocks of web pages',
  0,
  90,
  NOW(),
  NOW()
);

INSERT INTO course_lessons (
  id, module_id, title, content, lesson_type, video_url,
  duration_minutes, sort_order, is_preview, created_at, updated_at
)
VALUES
  (
    '22222222-3333-1111-1111-111111111111',
    '22222222-2222-1111-1111-111111111111',
    'Introduction to HTML',
    NULL,
    'video'::course_lessons_lesson_type_enum,
    '347119375',
    8,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    '22222222-3333-2222-1111-111111111111',
    '22222222-2222-1111-1111-111111111111',
    'HTML Elements and Structure',
    E'# HTML Elements and Structure\n\nHTML (HyperText Markup Language) is the standard language for creating web pages.\n\n## Basic Structure\n\nEvery HTML document follows this basic structure:\n\n```html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My First Webpage</title>\n</head>\n<body>\n  <h1>Welcome to My Website</h1>\n  <p>This is a paragraph.</p>\n</body>\n</html>\n```',
    'text'::course_lessons_lesson_type_enum,
    NULL,
    12,
    1,
    false,
    NOW(),
    NOW()
  );

-- Module 2: CSS Fundamentals
INSERT INTO course_modules (
  id, course_id, title, description, sort_order,
  duration_minutes, created_at, updated_at
)
VALUES (
  '22222222-2222-2222-1111-111111111111',
  '22222222-1111-1111-1111-111111111111',
  'CSS Fundamentals',
  'Style your web pages with CSS',
  1,
  120,
  NOW(),
  NOW()
);

INSERT INTO course_lessons (
  id, module_id, title, content, lesson_type, video_url,
  duration_minutes, sort_order, is_preview, created_at, updated_at
)
VALUES
  (
    '22222222-3333-3333-1111-111111111111',
    '22222222-2222-2222-1111-111111111111',
    'CSS Basics',
    NULL,
    'video'::course_lessons_lesson_type_enum,
    '391466947',
    10,
    0,
    false,
    NOW(),
    NOW()
  );

-- =====================================================
-- COURSE 3: Business Management Basics
-- =====================================================

INSERT INTO courses (
  id, title, description, short_description, thumbnail_url, duration_minutes,
  required_tier_level, status, sort_order, instructor_name,
  enrollment_count, is_featured, created_at, updated_at
)
VALUES (
  '33333333-1111-1111-1111-111111111111',
  'Business Management Basics',
  'Learn essential business management principles, leadership skills, and organizational strategies. Perfect for aspiring entrepreneurs and managers.',
  'Learn business management and leadership essentials',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  360,
  2,
  'published'::courses_status_enum,
  3,
  'Business School',
  0,
  false,
  NOW(),
  NOW()
);

-- Module 1: Introduction to Business Management
INSERT INTO course_modules (
  id, course_id, title, description, sort_order,
  duration_minutes, created_at, updated_at
)
VALUES (
  '33333333-2222-1111-1111-111111111111',
  '33333333-1111-1111-1111-111111111111',
  'Introduction to Business Management',
  'Understanding the role of a manager',
  0,
  75,
  NOW(),
  NOW()
);

INSERT INTO course_lessons (
  id, module_id, title, content, lesson_type, video_url,
  duration_minutes, sort_order, is_preview, created_at, updated_at
)
VALUES
  (
    '33333333-3333-1111-1111-111111111111',
    '33333333-2222-1111-1111-111111111111',
    'What is Business Management?',
    NULL,
    'video'::course_lessons_lesson_type_enum,
    '76979871',
    9,
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-2222-1111-111111111111',
    '33333333-2222-1111-1111-111111111111',
    'Key Management Functions',
    E'# Key Management Functions\n\nManagement involves coordinating and overseeing the work activities of others to accomplish organizational goals efficiently and effectively.\n\n## The Four Functions of Management\n\n### 1. Planning\n- Setting objectives\n- Developing strategies\n- Creating action plans\n\n### 2. Organizing\n- Determining resources needed\n- Assigning tasks\n- Establishing structure',
    'text'::course_lessons_lesson_type_enum,
    NULL,
    12,
    1,
    false,
    NOW(),
    NOW()
  );

-- Display Summary
SELECT
  'Sample data created successfully!' AS message,
  (SELECT COUNT(*) FROM courses) AS total_courses,
  (SELECT COUNT(*) FROM course_modules) AS total_modules,
  (SELECT COUNT(*) FROM course_lessons) AS total_lessons;
