import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseLesson } from './entities/course-lesson.entity';
import { CourseModule } from './entities/course-module.entity';
import { UserCourseEnrollment } from './entities/user-course-enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(CourseLesson)
    private readonly lessonRepository: Repository<CourseLesson>,
    @InjectRepository(CourseModule)
    private readonly moduleRepository: Repository<CourseModule>,
    @InjectRepository(UserCourseEnrollment)
    private readonly enrollmentRepository: Repository<UserCourseEnrollment>,
    @InjectRepository(LessonProgress)
    private readonly progressRepository: Repository<LessonProgress>,
  ) {}

  /**
   * Get course curriculum with modules and lessons
   */
  async getCourseCurriculum(courseId: string, userId?: string) {
    const modules = await this.moduleRepository.find({
      where: { course_id: courseId },
      relations: ['lessons'],
      order: { sort_order: 'ASC' },
    });

    // Get user's progress for each lesson if authenticated
    if (userId) {
      const progressData = await this.progressRepository.find({
        where: { user_id: userId },
      });

      const progressMap = new Map();
      progressData.forEach((p) => {
        progressMap.set(p.lesson_id, p);
      });

      // Attach progress to lessons
      modules.forEach((module) => {
        if (module.lessons) {
          module.lessons.sort((a, b) => a.sort_order - b.sort_order);
          module.lessons = module.lessons.map((lesson) => {
            const progress = progressMap.get(lesson.id);
            return {
              ...lesson,
              progress: progress || null,
              is_completed: progress?.is_completed || false,
            };
          });
        }
      });
    } else {
      // Just sort lessons
      modules.forEach((module) => {
        if (module.lessons) {
          module.lessons.sort((a, b) => a.sort_order - b.sort_order);
        }
      });
    }

    return modules;
  }

  /**
   * Get single lesson with content
   */
  async getLesson(
    courseId: string,
    lessonId: string,
    userId: string,
  ): Promise<any> {
    // Check if user is enrolled in the course
    const enrollment = await this.enrollmentRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You must be enrolled in this course to access lessons',
      );
    }

    // Get the lesson
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Verify lesson belongs to the course
    if (lesson.module.course_id !== courseId) {
      throw new ForbiddenException('Lesson does not belong to this course');
    }

    // Get user's progress for this lesson
    let progress = await this.progressRepository.findOne({
      where: { user_id: userId, lesson_id: lessonId },
    });

    // Create progress record if doesn't exist
    if (!progress) {
      progress = this.progressRepository.create({
        user_id: userId,
        lesson_id: lessonId,
        is_completed: false,
        watch_time_seconds: 0,
        last_position_seconds: 0,
        completion_percentage: 0,
      });
      await this.progressRepository.save(progress);
    }

    // Update last accessed time for enrollment
    enrollment.last_accessed_at = new Date();
    await this.enrollmentRepository.save(enrollment);

    // Get navigation (next/previous lessons)
    const navigation = await this.getLessonNavigation(lesson);

    return {
      ...lesson,
      progress,
      navigation,
    };
  }

  /**
   * Update lesson progress
   */
  async updateProgress(
    userId: string,
    lessonId: string,
    updateProgressDto: UpdateLessonProgressDto,
  ): Promise<LessonProgress> {
    let progress = await this.progressRepository.findOne({
      where: { user_id: userId, lesson_id: lessonId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        user_id: userId,
        lesson_id: lessonId,
      });
    }

    // Update progress fields
    if (updateProgressDto.watch_time_seconds !== undefined) {
      progress.watch_time_seconds = updateProgressDto.watch_time_seconds;
    }

    if (updateProgressDto.last_position_seconds !== undefined) {
      progress.last_position_seconds = updateProgressDto.last_position_seconds;
    }

    if (updateProgressDto.completion_percentage !== undefined) {
      progress.completion_percentage = updateProgressDto.completion_percentage;
    }

    if (updateProgressDto.is_completed !== undefined) {
      progress.is_completed = updateProgressDto.is_completed;
      if (updateProgressDto.is_completed && !progress.completed_at) {
        progress.completed_at = new Date();
      }
    }

    await this.progressRepository.save(progress);

    // Update course enrollment progress
    await this.updateCourseProgress(userId, lessonId);

    return progress;
  }

  /**
   * Mark lesson as complete
   */
  async completeLesson(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress> {
    return await this.updateProgress(userId, lessonId, {
      is_completed: true,
      completion_percentage: 100,
    });
  }

  /**
   * Get next and previous lessons
   */
  private async getLessonNavigation(lesson: CourseLesson) {
    // Get all lessons in the same module
    const moduleLessons = await this.lessonRepository.find({
      where: { module_id: lesson.module_id },
      order: { sort_order: 'ASC' },
    });

    const currentIndex = moduleLessons.findIndex((l) => l.id === lesson.id);

    let previousLesson: { id: string; title: string } | null = null;
    let nextLesson: { id: string; title: string } | null = null;

    if (currentIndex > 0) {
      previousLesson = {
        id: moduleLessons[currentIndex - 1].id,
        title: moduleLessons[currentIndex - 1].title,
      };
    }

    if (currentIndex < moduleLessons.length - 1) {
      nextLesson = {
        id: moduleLessons[currentIndex + 1].id,
        title: moduleLessons[currentIndex + 1].title,
      };
    } else {
      // Check if there's a next module
      const modules = await this.moduleRepository.find({
        where: { course_id: lesson.module.course_id },
        order: { sort_order: 'ASC' },
        relations: ['lessons'],
      });

      const currentModuleIndex = modules.findIndex(
        (m) => m.id === lesson.module_id,
      );

      if (currentModuleIndex < modules.length - 1) {
        const nextModule = modules[currentModuleIndex + 1];
        if (nextModule.lessons && nextModule.lessons.length > 0) {
          const sortedLessons = nextModule.lessons.sort(
            (a, b) => a.sort_order - b.sort_order,
          );
          nextLesson = {
            id: sortedLessons[0].id,
            title: sortedLessons[0].title,
          };
        }
      }
    }

    return {
      previous: previousLesson,
      next: nextLesson,
    };
  }

  /**
   * Update overall course progress based on completed lessons
   */
  private async updateCourseProgress(userId: string, lessonId: string) {
    // Get the lesson to find course_id
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module'],
    });

    if (!lesson) return;

    const courseId = lesson.module.course_id;

    // Get all lessons in the course
    const allLessons = await this.lessonRepository.find({
      where: { module: { course_id: courseId } },
      relations: ['module'],
    });

    const totalLessons = allLessons.length;

    if (totalLessons === 0) return;

    // Get user's progress for all lessons in this course
    const lessonIds = allLessons.map((l) => l.id);
    const completedProgress = await this.progressRepository.find({
      where: {
        user_id: userId,
        is_completed: true,
      },
    });

    const completedLessonsInCourse = completedProgress.filter((p) =>
      lessonIds.includes(p.lesson_id),
    );

    const completedCount = completedLessonsInCourse.length;
    const progressPercentage = Math.round(
      (completedCount / totalLessons) * 100,
    );

    // Update enrollment
    const enrollment = await this.enrollmentRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment) {
      enrollment.progress_percentage = progressPercentage;

      // Mark course as completed if all lessons done
      if (progressPercentage === 100 && !enrollment.completed_at) {
        enrollment.completed_at = new Date();
        enrollment.status = 'completed' as any;
      }

      await this.enrollmentRepository.save(enrollment);
    }
  }
}
