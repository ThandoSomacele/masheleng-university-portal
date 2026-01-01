import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CourseLesson } from './course-lesson.entity';

@Entity('user_lesson_progress')
@Index(['user_id', 'lesson_id'], { unique: true })
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  lesson_id: string;

  @ManyToOne(() => CourseLesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'int', default: 0 })
  watch_time_seconds: number;

  @Column({ type: 'int', default: 0 })
  last_position_seconds: number;

  @Column({ type: 'int', default: 0 })
  completion_percentage: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  started_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
