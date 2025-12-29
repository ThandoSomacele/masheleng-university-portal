# Masheleng University - Course Platform Implementation Plan

## Overview
Building a custom course platform with Vimeo integration for video hosting, supporting video lessons, text lessons, and mixed content. Future expansion includes quizzes and assignments.

---

## Phase 1: Core Course Viewing (Week 1-2)

### Backend Tasks

#### 1.1 Database Schema
```sql
-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  section_id UUID REFERENCES course_sections(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_type VARCHAR(50) NOT NULL CHECK (lesson_type IN ('video', 'text', 'video_text', 'quiz', 'assignment')),

  -- Video content (when lesson_type includes video)
  vimeo_video_id VARCHAR(255),
  video_duration_seconds INTEGER,

  -- Text content (when lesson_type includes text)
  text_content TEXT,

  -- Common fields
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,
  resources JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course sections (for organizing lessons into modules/chapters)
CREATE TABLE course_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson progress tracking
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,

  -- Progress tracking
  is_completed BOOLEAN DEFAULT FALSE,
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

-- Course progress rollup
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Overall progress
  completion_percentage INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_sections_course_id ON course_sections(course_id);
CREATE INDEX idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX idx_course_progress_user_course ON course_progress(user_id, course_id);
```

#### 1.2 Backend Endpoints

**Courses Module:**
```typescript
GET    /courses                           // List all courses (already exists?)
GET    /courses/:id                       // Get course details with curriculum
GET    /courses/:id/curriculum            // Get structured curriculum (sections + lessons)
POST   /courses/:id/enroll                // Enroll in course
GET    /courses/:id/progress              // Get user's progress in course
```

**Lessons Module:**
```typescript
GET    /courses/:courseId/lessons/:id     // Get single lesson content
POST   /courses/:courseId/lessons/:id/progress  // Update lesson progress
POST   /courses/:courseId/lessons/:id/complete  // Mark lesson complete
GET    /courses/:courseId/lessons/:id/next      // Get next lesson
GET    /courses/:courseId/lessons/:id/previous  // Get previous lesson
```

**Resources:**
```typescript
GET    /courses/:courseId/lessons/:id/resources    // List downloadable resources
GET    /courses/:courseId/lessons/:id/resources/:resourceId  // Download resource
```

#### 1.3 Backend Entities

**Lesson Entity:**
```typescript
@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  course_id: string;

  @Column({ type: 'uuid', nullable: true })
  section_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['video', 'text', 'video_text', 'quiz', 'assignment']
  })
  lesson_type: 'video' | 'text' | 'video_text' | 'quiz' | 'assignment';

  @Column({ type: 'varchar', length: 255, nullable: true })
  vimeo_video_id: string;

  @Column({ type: 'integer', nullable: true })
  video_duration_seconds: number;

  @Column({ type: 'text', nullable: true })
  text_content: string;

  @Column({ type: 'integer', default: 0 })
  order_index: number;

  @Column({ type: 'boolean', default: false })
  is_preview: boolean;

  @Column({ type: 'jsonb', default: [] })
  resources: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Course, course => course.lessons)
  course: Course;

  @ManyToOne(() => CourseSection, section => section.lessons)
  section: CourseSection;

  @OneToMany(() => LessonProgress, progress => progress.lesson)
  progress: LessonProgress[];
}
```

**LessonProgress Entity:**
```typescript
@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  lesson_id: string;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'integer', default: 0 })
  watch_time_seconds: number;

  @Column({ type: 'integer', default: 0 })
  last_position_seconds: number;

  @Column({ type: 'integer', default: 0 })
  completion_percentage: number;

  @CreateDateColumn()
  started_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Lesson, lesson => lesson.progress)
  lesson: Lesson;
}
```

### Frontend Tasks

#### 1.4 Components to Build

**Priority Order:**
1. `CourseDetail.tsx` - Course overview and curriculum
2. `CoursePlayer.tsx` - Main lesson viewing component
3. `LessonContent.tsx` - Renders video/text/both
4. `CourseSidebar.tsx` - Curriculum navigation
5. `LessonResources.tsx` - Downloadable materials

#### 1.5 Component Details

**CourseDetail.tsx:**
- Course header (title, description, instructor, duration)
- Course stats (lessons, duration, level)
- Enrollment button (if not enrolled)
- "Continue Learning" button (if enrolled)
- Curriculum preview (sections and lessons)
- Course requirements
- What you'll learn
- Reviews (future)

**CoursePlayer.tsx:**
- Two-column layout:
  - Left: Course sidebar (curriculum)
  - Right: Lesson content area
- Top progress bar
- Lesson title and description
- Video player (Vimeo) or text content or both
- Resources section
- "Mark as Complete" button
- Next/Previous lesson buttons
- Notes section (future)

**LessonContent.tsx:**
- Handles three types:
  - Video only: Full-width Vimeo player
  - Text only: Formatted text content (markdown?)
  - Video + Text: Video on top, text below
- Responsive design

---

## Phase 2: Progress Tracking & Completion (Week 3)

### Backend Tasks

#### 2.1 Progress Tracking
- Auto-calculate course completion percentage
- Trigger on lesson completion
- Update course_progress table
- Send completion notifications

#### 2.2 Resume Playback
- Store last video position
- Return resume point on lesson load
- Auto-resume when returning to lesson

### Frontend Tasks

#### 2.3 Progress UI
- Progress bar in dashboard
- "Continue where you left off"
- Course completion badges
- Lesson checkmarks in sidebar

---

## Phase 3: Certificates & Achievements (Week 4)

### Backend Tasks

#### 3.1 Certificate Generation
- PDF certificate generation
- Course completion triggers
- Certificate storage
- Download endpoint

#### 3.2 Database Schema
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  certificate_number VARCHAR(50) UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url VARCHAR(500)
);
```

### Frontend Tasks

#### 3.3 Certificate UI
- Certificate download button
- Certificate showcase in profile
- Share certificate feature

---

## Phase 4: Quizzes (Week 5-6)

### Backend Tasks

#### 4.1 Database Schema
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id),
  title VARCHAR(255),
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  attempts_allowed INTEGER DEFAULT -1 -- -1 = unlimited
);

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id),
  question_text TEXT,
  question_type VARCHAR(50), -- multiple_choice, true_false, short_answer
  points INTEGER DEFAULT 1,
  order_index INTEGER,
  options JSONB, -- For multiple choice
  correct_answer TEXT
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  quiz_id UUID REFERENCES quizzes(id),
  score INTEGER,
  passed BOOLEAN,
  answers JSONB,
  started_at TIMESTAMP,
  submitted_at TIMESTAMP
);
```

#### 4.2 Quiz Endpoints
```typescript
GET    /courses/:courseId/lessons/:lessonId/quiz
POST   /courses/:courseId/lessons/:lessonId/quiz/start
POST   /courses/:courseId/lessons/:lessonId/quiz/submit
GET    /courses/:courseId/lessons/:lessonId/quiz/attempts
```

### Frontend Tasks

#### 4.3 Quiz Components
- `QuizStart.tsx` - Quiz instructions and start
- `QuizQuestion.tsx` - Individual question display
- `QuizResults.tsx` - Score and review
- `QuizAttempts.tsx` - Past attempts list

---

## Phase 5: Assignments (Week 7-8)

### Backend Tasks

#### 5.1 Database Schema
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id),
  title VARCHAR(255),
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMP,
  max_score INTEGER DEFAULT 100,
  submission_type VARCHAR(50) -- text, file, url
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  assignment_id UUID REFERENCES assignments(id),
  content TEXT,
  file_url VARCHAR(500),
  submitted_at TIMESTAMP,
  grade INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP,
  graded_by UUID REFERENCES users(id)
);
```

#### 5.2 Assignment Endpoints
```typescript
GET    /courses/:courseId/lessons/:lessonId/assignment
POST   /courses/:courseId/lessons/:lessonId/assignment/submit
GET    /courses/:courseId/lessons/:lessonId/assignment/submission
POST   /assignments/:id/grade -- Admin only
```

### Frontend Tasks

#### 5.3 Assignment Components
- `AssignmentView.tsx` - Assignment details
- `AssignmentSubmit.tsx` - Submission form
- `AssignmentFeedback.tsx` - View grades/feedback

---

## Phase 6: Discussion & Community (Week 9-10)

### Backend Tasks

#### 6.1 Database Schema
```sql
CREATE TABLE lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  parent_comment_id UUID REFERENCES lesson_comments(id),
  content TEXT,
  video_timestamp INTEGER, -- For video-specific comments
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Frontend Tasks

#### 6.2 Discussion Components
- `LessonComments.tsx` - Comments section
- `CommentThread.tsx` - Threaded replies
- `VideoTimestampComment.tsx` - Time-linked comments

---

## Technical Specifications

### Vimeo Integration

#### Video Embed
```typescript
// Vimeo Player component
import Player from '@vimeo/player';

const VimeoPlayer = ({ videoId, onProgress, onComplete }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    const player = new Player(playerRef.current);

    // Track progress every 5 seconds
    player.on('timeupdate', (data) => {
      onProgress({
        currentTime: data.seconds,
        duration: data.duration,
        percentage: (data.seconds / data.duration) * 100
      });
    });

    // Track completion
    player.on('ended', () => {
      onComplete();
    });

    return () => player.destroy();
  }, [videoId]);

  return (
    <iframe
      ref={playerRef}
      src={`https://player.vimeo.com/video/${videoId}`}
      width="100%"
      height="100%"
      frameBorder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
};
```

#### Vimeo API (Backend)
```typescript
// Upload video to Vimeo (admin function)
import Vimeo from 'vimeo';

const vimeoClient = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

async function uploadVideo(filePath: string, title: string) {
  return new Promise((resolve, reject) => {
    vimeoClient.upload(
      filePath,
      {
        name: title,
        privacy: {
          view: 'unlisted', // or 'password' with domain restriction
        },
      },
      (uri) => {
        const videoId = uri.split('/').pop();
        resolve(videoId);
      },
      (err) => reject(err)
    );
  });
}
```

### Text Content

#### Markdown Support
```typescript
// Use marked or react-markdown for text lessons
import ReactMarkdown from 'react-markdown';

const TextContent = ({ content }) => {
  return (
    <div className="prose prose-dark max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
```

### File Structure

```
src/
├── courses/
│   ├── entities/
│   │   ├── course.entity.ts
│   │   ├── course-section.entity.ts
│   │   ├── lesson.entity.ts
│   │   ├── lesson-progress.entity.ts
│   │   └── course-progress.entity.ts
│   ├── dto/
│   │   ├── create-lesson.dto.ts
│   │   ├── update-progress.dto.ts
│   │   └── enroll-course.dto.ts
│   ├── controllers/
│   │   ├── courses.controller.ts
│   │   └── lessons.controller.ts
│   ├── services/
│   │   ├── courses.service.ts
│   │   ├── lessons.service.ts
│   │   └── progress.service.ts
│   └── courses.module.ts
│
└── quizzes/ (Phase 4)
    └── assignments/ (Phase 5)
```

```
framer-integration/components/
├── CourseDetail.tsx
├── CoursePlayer.tsx
├── LessonContent.tsx
├── CourseSidebar.tsx
├── LessonResources.tsx
├── VimeoPlayer.tsx
├── TextLesson.tsx
└── ProgressBar.tsx
```

---

## API Response Examples

### Get Course with Curriculum
```json
{
  "id": "uuid",
  "name": "Introduction to TypeScript",
  "description": "Learn TypeScript from scratch",
  "instructor": {
    "id": "uuid",
    "name": "John Doe"
  },
  "thumbnail_url": "https://...",
  "duration_hours": 10,
  "level": "beginner",
  "sections": [
    {
      "id": "uuid",
      "title": "Getting Started",
      "order_index": 0,
      "lessons": [
        {
          "id": "uuid",
          "title": "What is TypeScript?",
          "lesson_type": "video_text",
          "video_duration_seconds": 300,
          "is_preview": true,
          "order_index": 0,
          "is_completed": false
        }
      ]
    }
  ],
  "total_lessons": 45,
  "enrollment": {
    "enrolled": true,
    "progress": 35,
    "last_lesson_id": "uuid"
  }
}
```

### Get Lesson Content
```json
{
  "id": "uuid",
  "title": "Understanding TypeScript Types",
  "description": "Deep dive into TypeScript type system",
  "lesson_type": "video_text",
  "vimeo_video_id": "123456789",
  "video_duration_seconds": 720,
  "text_content": "# TypeScript Types\n\nTypeScript provides...",
  "resources": [
    {
      "id": "uuid",
      "name": "Cheat Sheet.pdf",
      "type": "pdf",
      "url": "https://...",
      "size": 1024000
    }
  ],
  "navigation": {
    "previous_lesson_id": "uuid",
    "next_lesson_id": "uuid"
  },
  "progress": {
    "is_completed": false,
    "watch_time_seconds": 120,
    "last_position_seconds": 120,
    "completion_percentage": 16
  }
}
```

---

## Environment Variables

```env
# Vimeo API
VIMEO_CLIENT_ID=your_client_id
VIMEO_CLIENT_SECRET=your_client_secret
VIMEO_ACCESS_TOKEN=your_access_token

# Video Settings
VIMEO_DOMAIN_WHITELIST=university.masheleng.com
VIDEO_QUALITY_DEFAULT=1080p
```

---

## Deployment Checklist

### Phase 1 Launch
- [ ] Database migrations run
- [ ] Vimeo API configured
- [ ] Course seeding script
- [ ] Frontend components deployed
- [ ] Progress tracking tested
- [ ] Mobile responsive verified

### Future Phases
- [ ] Quiz system tested
- [ ] Assignment grading workflow
- [ ] Certificate generation
- [ ] Discussion moderation

---

## Success Metrics

### Phase 1
- Students can view video lessons
- Students can read text lessons
- Progress tracking works
- Resume playback functions
- Mobile experience is smooth

### Phase 2-3
- Completion rate tracked
- Certificates issued
- User satisfaction > 4/5

### Phase 4-6
- Quiz pass rates tracked
- Assignment submission rate > 80%
- Community engagement active

---

**Next Immediate Steps:**
1. Create database migrations
2. Build Course and Lesson entities
3. Implement course/lesson endpoints
4. Build CourseDetail component
5. Build CoursePlayer component
6. Test end-to-end flow
