import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseModule as CourseModuleEntity } from './entities/course-module.entity';
import { CourseLesson } from './entities/course-lesson.entity';
import { UserCourseEnrollment } from './entities/user-course-enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { CoursesService } from './courses.service';
import { LessonsService } from './lessons.service';
import { CoursesController } from './courses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseModuleEntity,
      CourseLesson,
      UserCourseEnrollment,
      LessonProgress,
      UserSubscription,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, LessonsService],
  exports: [CoursesService, LessonsService],
})
export class CoursesModule {}
