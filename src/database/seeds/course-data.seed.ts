import { DataSource } from 'typeorm';
import { Course, CourseStatus } from '../../courses/entities/course.entity';
import { CourseModule } from '../../courses/entities/course-module.entity';
import { CourseLesson, LessonType } from '../../courses/entities/course-lesson.entity';

/**
 * Seed Sample Course Data for Testing
 * Run with: npm run seed
 */
export async function seedCourseData(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);
  const moduleRepository = dataSource.getRepository(CourseModule);
  const lessonRepository = dataSource.getRepository(CourseLesson);

  console.log('🌱 Seeding course data...');

  // Clear existing data (optional - comment out in production)
  await lessonRepository.delete({});
  await moduleRepository.delete({});
  await courseRepository.delete({});

  // ======================
  // COURSE 1: Introduction to TypeScript
  // ======================
  const tseCourse = courseRepository.create({
    name: 'Introduction to TypeScript',
    description:
      'Learn TypeScript from scratch and build type-safe applications. Perfect for JavaScript developers looking to level up their skills with static typing and modern development practices.',
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    duration_hours: 8,
    level: 'beginner',
    required_tier_level: 1, // Entry tier
    status: CourseStatus.PUBLISHED,
    sort_order: 1,
    what_youll_learn: `Master TypeScript fundamentals and syntax
Build type-safe applications with confidence
Understand advanced TypeScript features
Integrate TypeScript with React and Node.js
Write cleaner, more maintainable code`,
    requirements: 'Basic JavaScript knowledge, A code editor (VS Code recommended), Node.js installed',
    enrollment_count: 0,
  });
  await courseRepository.save(tseCourse);

  // Module 1: Getting Started
  const tsModule1 = moduleRepository.create({
    course_id: tseCourse.id,
    title: 'Getting Started with TypeScript',
    description: 'Introduction to TypeScript, setup, and basic concepts',
    sort_order: 0,
    duration_minutes: 60,
  });
  await moduleRepository.save(tsModule1);

  // Lessons for Module 1
  await lessonRepository.save([
    lessonRepository.create({
      module_id: tsModule1.id,
      title: 'What is TypeScript?',
      lesson_type: LessonType.VIDEO,
      vimeo_video_id: '76979871', // Public sample video
      video_duration_seconds: 420,
      content: null,
      sort_order: 0,
      is_preview: true,
      duration_minutes: 7,
    }),
    lessonRepository.create({
      module_id: tsModule1.id,
      title: 'Setting Up Your Development Environment',
      lesson_type: LessonType.VIDEO_TEXT,
      vimeo_video_id: '347119375',
      video_duration_seconds: 600,
      content: `# Setting Up TypeScript

## Installation Steps

1. Install Node.js from nodejs.org
2. Install TypeScript globally:
   \`\`\`
   npm install -g typescript
   \`\`\`
3. Verify installation:
   \`\`\`
   tsc --version
   \`\`\`

## VS Code Setup

- Install the official TypeScript extension
- Enable auto-imports
- Configure your tsconfig.json

## Your First TypeScript File

Create a file called \`hello.ts\`:

\`\`\`typescript
const message: string = "Hello, TypeScript!";
console.log(message);
\`\`\`

Compile and run:
\`\`\`
tsc hello.ts
node hello.js
\`\`\``,
      sort_order: 1,
      is_preview: true,
      duration_minutes: 10,
      resources: [
        {
          id: 'res1',
          name: 'TypeScript Cheat Sheet.pdf',
          type: 'pdf',
          url: 'https://example.com/typescript-cheat-sheet.pdf',
          size: 524288,
        },
      ],
    }),
    lessonRepository.create({
      module_id: tsModule1.id,
      title: 'Understanding Type Annotations',
      lesson_type: LessonType.TEXT,
      content: `# Type Annotations in TypeScript

Type annotations are one of the core features of TypeScript. They allow you to explicitly specify the type of a variable, parameter, or return value.

## Basic Types

### String
\`\`\`typescript
let name: string = "John Doe";
\`\`\`

### Number
\`\`\`typescript
let age: number = 25;
let price: number = 19.99;
\`\`\`

### Boolean
\`\`\`typescript
let isActive: boolean = true;
\`\`\`

### Array
\`\`\`typescript
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];
\`\`\`

## Function Types

You can annotate function parameters and return types:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const add = (a: number, b: number): number => {
  return a + b;
};
\`\`\`

## Best Practices

- Use type inference when the type is obvious
- Be explicit when it improves code clarity
- Avoid using \`any\` unless absolutely necessary`,
      sort_order: 2,
      duration_minutes: 15,
    }),
  ]);

  // Module 2: Advanced TypeScript
  const tsModule2 = moduleRepository.create({
    course_id: tseCourse.id,
    title: 'Advanced TypeScript Features',
    description: 'Interfaces, generics, and advanced type features',
    sort_order: 1,
    duration_minutes: 120,
  });
  await moduleRepository.save(tsModule2);

  await lessonRepository.save([
    lessonRepository.create({
      module_id: tsModule2.id,
      title: 'Interfaces and Type Aliases',
      lesson_type: LessonType.VIDEO,
      vimeo_video_id: '391466947',
      video_duration_seconds: 720,
      sort_order: 0,
      duration_minutes: 12,
    }),
    lessonRepository.create({
      module_id: tsModule2.id,
      title: 'Generics in TypeScript',
      lesson_type: LessonType.VIDEO_TEXT,
      vimeo_video_id: '76979871',
      video_duration_seconds: 900,
      content: `# Generics in TypeScript

Generics allow you to write reusable, type-safe code that works with multiple types.

## Basic Generic Function

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>("Hello");
\`\`\`

## Generic Interfaces

\`\`\`typescript
interface Container<T> {
  value: T;
  getValue(): T;
}

class Box<T> implements Container<T> {
  constructor(public value: T) {}

  getValue(): T {
    return this.value;
  }
}
\`\`\`

## Generic Constraints

\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): void {
  console.log(item.length);
}
\`\`\``,
      sort_order: 1,
      duration_minutes: 15,
    }),
  ]);

  console.log(`✅ Created course: ${tseCourse.name}`);

  // ======================
  // COURSE 2: Web Development Fundamentals
  // ======================
  const webDevCourse = courseRepository.create({
    name: 'Web Development Fundamentals',
    description:
      'Master the essentials of web development including HTML, CSS, and JavaScript. Build responsive websites from scratch and understand how the web works.',
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    duration_hours: 12,
    level: 'beginner',
    required_tier_level: 1,
    status: CourseStatus.PUBLISHED,
    sort_order: 2,
    what_youll_learn: `HTML5 semantic markup
CSS styling and layouts
Responsive web design
JavaScript fundamentals
DOM manipulation
Building real-world projects`,
    requirements: 'A computer with internet access, A modern web browser, Enthusiasm to learn!',
    enrollment_count: 0,
  });
  await courseRepository.save(webDevCourse);

  const webModule1 = moduleRepository.create({
    course_id: webDevCourse.id,
    title: 'HTML Essentials',
    description: 'Learn the building blocks of web pages',
    sort_order: 0,
    duration_minutes: 90,
  });
  await moduleRepository.save(webModule1);

  await lessonRepository.save([
    lessonRepository.create({
      module_id: webModule1.id,
      title: 'Introduction to HTML',
      lesson_type: LessonType.VIDEO,
      vimeo_video_id: '347119375',
      video_duration_seconds: 480,
      sort_order: 0,
      is_preview: true,
      duration_minutes: 8,
    }),
    lessonRepository.create({
      module_id: webModule1.id,
      title: 'HTML Elements and Structure',
      lesson_type: LessonType.TEXT,
      content: `# HTML Elements and Structure

HTML (HyperText Markup Language) is the standard language for creating web pages.

## Basic Structure

Every HTML document follows this basic structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Webpage</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>This is a paragraph.</p>
</body>
</html>
\`\`\`

## Common Elements

### Headings
HTML provides 6 levels of headings:
- \`<h1>\` - Most important
- \`<h2>\` to \`<h6>\` - Decreasing importance

### Paragraphs
Use \`<p>\` tags for paragraphs of text.

### Links
\`\`\`html
<a href="https://example.com">Click here</a>
\`\`\`

### Images
\`\`\`html
<img src="image.jpg" alt="Description">
\`\`\`

## Semantic HTML

Use semantic elements to give meaning to your content:

- \`<header>\` - Page or section header
- \`<nav>\` - Navigation links
- \`<main>\` - Main content
- \`<article>\` - Self-contained content
- \`<section>\` - Thematic grouping
- \`<footer>\` - Page or section footer`,
      sort_order: 1,
      duration_minutes: 12,
      resources: [
        {
          id: 'res2',
          name: 'HTML5 Reference Guide.pdf',
          type: 'pdf',
          url: 'https://example.com/html5-reference.pdf',
          size: 1048576,
        },
      ],
    }),
  ]);

  const webModule2 = moduleRepository.create({
    course_id: webDevCourse.id,
    title: 'CSS Styling',
    description: 'Make your websites beautiful with CSS',
    sort_order: 1,
    duration_minutes: 100,
  });
  await moduleRepository.save(webModule2);

  await lessonRepository.save([
    lessonRepository.create({
      module_id: webModule2.id,
      title: 'CSS Fundamentals',
      lesson_type: LessonType.VIDEO_TEXT,
      vimeo_video_id: '391466947',
      video_duration_seconds: 660,
      content: `# CSS Fundamentals

CSS (Cascading Style Sheets) controls the presentation of your HTML.

## Basic Syntax

\`\`\`css
selector {
  property: value;
}
\`\`\`

## Common Selectors

### Element Selector
\`\`\`css
p {
  color: blue;
}
\`\`\`

### Class Selector
\`\`\`css
.highlight {
  background-color: yellow;
}
\`\`\`

### ID Selector
\`\`\`css
#header {
  font-size: 24px;
}
\`\`\`

## The Box Model

Every element in CSS is a box with:
- Content
- Padding
- Border
- Margin`,
      sort_order: 0,
      duration_minutes: 11,
    }),
  ]);

  console.log(`✅ Created course: ${webDevCourse.name}`);

  // ======================
  // COURSE 3: Business Management Basics
  // ======================
  const businessCourse = courseRepository.create({
    name: 'Business Management Basics',
    description:
      'Learn essential business management principles, leadership skills, and organizational strategies. Perfect for aspiring entrepreneurs and managers.',
    thumbnail_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    duration_hours: 6,
    level: 'beginner',
    required_tier_level: 2, // Premium tier
    status: CourseStatus.PUBLISHED,
    sort_order: 3,
    what_youll_learn: `Fundamental business principles
Effective leadership strategies
Team management techniques
Financial planning basics
Strategic decision making`,
    requirements: 'No prior business knowledge required, Willingness to learn and apply concepts',
    enrollment_count: 0,
  });
  await courseRepository.save(businessCourse);

  const bizModule1 = moduleRepository.create({
    course_id: businessCourse.id,
    title: 'Introduction to Business Management',
    description: 'Understanding the role of a manager',
    sort_order: 0,
    duration_minutes: 75,
  });
  await moduleRepository.save(bizModule1);

  await lessonRepository.save([
    lessonRepository.create({
      module_id: bizModule1.id,
      title: 'What is Business Management?',
      lesson_type: LessonType.VIDEO,
      vimeo_video_id: '76979871',
      video_duration_seconds: 540,
      sort_order: 0,
      is_preview: true,
      duration_minutes: 9,
    }),
    lessonRepository.create({
      module_id: bizModule1.id,
      title: 'Key Management Functions',
      lesson_type: LessonType.TEXT,
      content: `# Key Management Functions

Management involves coordinating and overseeing the work activities of others to accomplish organizational goals efficiently and effectively.

## The Four Functions of Management

### 1. Planning
- Setting objectives
- Developing strategies
- Creating action plans

### 2. Organizing
- Determining resources needed
- Assigning tasks
- Establishing structure

### 3. Leading
- Motivating employees
- Directing activities
- Communicating effectively

### 4. Controlling
- Monitoring performance
- Comparing results to goals
- Taking corrective action

## Skills Every Manager Needs

- Communication skills
- Decision-making ability
- Problem-solving skills
- Time management
- Emotional intelligence

## Levels of Management

### Top Management
CEOs, Presidents, VPs - Set overall direction

### Middle Management
Department heads, Division managers - Implement strategies

### First-Line Management
Supervisors, Team leaders - Direct daily operations`,
      sort_order: 1,
      duration_minutes: 12,
    }),
  ]);

  console.log(`✅ Created course: ${businessCourse.name}`);

  // ======================
  // Summary
  // ======================
  const totalCourses = await courseRepository.count();
  const totalModules = await moduleRepository.count();
  const totalLessons = await lessonRepository.count();

  console.log('\n📊 Seed Summary:');
  console.log(`   Courses created: ${totalCourses}`);
  console.log(`   Modules created: ${totalModules}`);
  console.log(`   Lessons created: ${totalLessons}`);
  console.log('\n✨ Sample data seeded successfully!');
  console.log('\n🎥 Vimeo Videos Used:');
  console.log('   - 76979871 (Educational sample)');
  console.log('   - 347119375 (Tutorial video)');
  console.log('   - 391466947 (Learning content)');
  console.log('\n💡 Note: These are public Vimeo video IDs for testing.');
  console.log('   Replace with your own videos for production.\n');

  return {
    courses: totalCourses,
    modules: totalModules,
    lessons: totalLessons,
  };
}
