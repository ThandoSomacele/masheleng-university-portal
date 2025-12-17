import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { UserCourseEnrollment, EnrollmentStatus } from './entities/user-course-enrollment.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(UserCourseEnrollment)
    private readonly enrollmentRepository: Repository<UserCourseEnrollment>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepository: Repository<UserSubscription>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(userId?: string): Promise<Course[]> {
    let userTierLevel = 1; // Default to Entry level

    if (userId) {
      const subscription = await this.subscriptionRepository.findOne({
        where: { user_id: userId, status: 'active' as any },
        relations: ['tier'],
      });

      if (subscription) {
        userTierLevel = subscription.tier.access_level;
      }
    }

    // Return all published courses that user has access to
    return await this.courseRepository.find({
      where: { status: CourseStatus.PUBLISHED },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check if user has access to this course
    if (userId) {
      await this.checkCourseAccess(userId, course);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async enroll(userId: string, courseId: string): Promise<UserCourseEnrollment> {
    // Check if course exists
    const course = await this.findOne(courseId);

    // Check if user has required tier access
    await this.checkCourseAccess(userId, course);

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = this.enrollmentRepository.create({
      user_id: userId,
      course_id: courseId,
      status: EnrollmentStatus.ACTIVE,
      progress_percentage: 0,
      last_accessed_at: new Date(),
    });

    // Increment enrollment count
    course.enrollment_count += 1;
    await this.courseRepository.save(course);

    return await this.enrollmentRepository.save(enrollment);
  }

  async getMyEnrollments(userId: string): Promise<UserCourseEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { user_id: userId },
      relations: ['course'],
      order: { enrolled_at: 'DESC' },
    });
  }

  async getEnrollmentById(enrollmentId: string): Promise<UserCourseEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  private async checkCourseAccess(userId: string, course: Course): Promise<void> {
    // Get user's active subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId, status: 'active' as any },
      relations: ['tier'],
    });

    if (!subscription) {
      throw new ForbiddenException(
        'You need an active subscription to access this course',
      );
    }

    // Check if user's tier level meets course requirement
    if (subscription.tier.access_level < course.required_tier_level) {
      throw new ForbiddenException(
        `This course requires ${this.getTierName(course.required_tier_level)} subscription or higher`,
      );
    }
  }

  private getTierName(level: number): string {
    switch (level) {
      case 1:
        return 'Entry';
      case 2:
        return 'Premium';
      case 3:
        return 'Premium+';
      default:
        return 'Unknown';
    }
  }
}
