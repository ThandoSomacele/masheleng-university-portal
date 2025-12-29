import React, { useState, useEffect } from 'react';
import { MashelengAPI } from './api_client.js';
import { API_URL } from './config.js';

export default function CourseDetail({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const api = new MashelengAPI(API_URL);
      const token = localStorage.getItem('masheleng_token');

      // Load course details
      const courseData = await api.getCourse(courseId);
      setCourse(courseData);

      // Load curriculum if user is authenticated
      if (token) {
        try {
          const curriculumData = await api.getCourseCurriculum(courseId);
          setCurriculum(curriculumData);

          // Check if user is enrolled
          const enrollments = await api.getMyEnrollments();
          const userEnrollment = enrollments.find((e: any) => e.course_id === courseId);
          setEnrollment(userEnrollment);

          // Expand first module by default
          if (curriculumData.length > 0) {
            setExpandedModules(new Set([curriculumData[0].id]));
          }
        } catch (err) {
          console.log('User not logged in or enrollment error:', err);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Course load error:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const api = new MashelengAPI(API_URL);
      await api.enrollInCourse(courseId);

      // Reload data to show enrolled state
      await loadCourseData();
      setEnrolling(false);
    } catch (err) {
      console.error('Enrollment error:', err);
      setError((err as Error).message);
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const startLearning = () => {
    if (curriculum.length > 0 && curriculum[0].lessons?.length > 0) {
      const firstLesson = curriculum[0].lessons[0];
      window.location.href = `/courses/${courseId}/learn?lesson=${firstLesson.id}`;
    }
  };

  const continueFromLastLesson = () => {
    // Find the last incomplete lesson
    for (const module of curriculum) {
      for (const lesson of module.lessons || []) {
        if (!lesson.is_completed) {
          window.location.href = `/courses/${courseId}/learn?lesson=${lesson.id}`;
          return;
        }
      }
    }
    // If all complete, go to first lesson
    startLearning();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Course not found</div>
      </div>
    );
  }

  const totalLessons = curriculum.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
  const completedLessons = curriculum.reduce(
    (sum, mod) => sum + (mod.lessons?.filter((l: any) => l.is_completed).length || 0),
    0
  );

  return (
    <div style={styles.container}>
      {/* Course Header */}
      <div style={styles.header}>
        {course.thumbnail_url && (
          <div style={styles.thumbnail}>
            <img src={course.thumbnail_url} alt={course.name} style={styles.thumbnailImage} />
          </div>
        )}
        <div style={styles.headerContent}>
          <h1 style={styles.title}>{course.name}</h1>
          <p style={styles.description}>{course.description}</p>

          {/* Course Stats */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📚</span>
              <span style={styles.statText}>{totalLessons} Lessons</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>⏱️</span>
              <span style={styles.statText}>{course.duration_hours || 0}h Duration</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📊</span>
              <span style={styles.statText}>{course.level || 'All Levels'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>👥</span>
              <span style={styles.statText}>{course.enrollment_count || 0} Students</span>
            </div>
          </div>

          {/* Enrollment Status & Actions */}
          {enrollment ? (
            <div style={styles.enrolledSection}>
              <div style={styles.progressInfo}>
                <span style={styles.progressLabel}>Your Progress:</span>
                <span style={styles.progressPercentage}>{enrollment.progress_percentage}%</span>
              </div>
              <div style={styles.progressBarContainer}>
                <div style={{ ...styles.progressBar, width: `${enrollment.progress_percentage}%` }} />
              </div>
              <div style={styles.enrolledActions}>
                <button onClick={continueFromLastLesson} style={styles.primaryButton}>
                  {enrollment.progress_percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                </button>
                <div style={styles.completionInfo}>
                  {completedLessons} of {totalLessons} lessons completed
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.enrollSection}>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                style={{
                  ...styles.primaryButton,
                  ...(enrolling && styles.buttonDisabled),
                }}>
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
              <p style={styles.enrollNote}>
                Requires {course.required_tier_level === 1 ? 'Entry' : course.required_tier_level === 2 ? 'Premium' : 'Premium+'} tier or higher
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Curriculum */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Course Curriculum</h2>
        {curriculum.length === 0 ? (
          <p style={styles.emptyText}>No lessons available yet.</p>
        ) : (
          <div style={styles.curriculum}>
            {curriculum.map((module, index) => (
              <div key={module.id} style={styles.moduleCard}>
                <div
                  style={styles.moduleHeader}
                  onClick={() => toggleModule(module.id)}>
                  <div style={styles.moduleHeaderLeft}>
                    <span style={styles.moduleIcon}>
                      {expandedModules.has(module.id) ? '▼' : '▶'}
                    </span>
                    <div>
                      <h3 style={styles.moduleTitle}>
                        Module {index + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p style={styles.moduleDescription}>{module.description}</p>
                      )}
                    </div>
                  </div>
                  <div style={styles.moduleMeta}>
                    <span style={styles.lessonCount}>
                      {module.lessons?.length || 0} lessons
                    </span>
                  </div>
                </div>

                {expandedModules.has(module.id) && module.lessons && (
                  <div style={styles.lessonList}>
                    {module.lessons.map((lesson: any, lessonIndex: number) => (
                      <div key={lesson.id} style={styles.lessonItem}>
                        <div style={styles.lessonLeft}>
                          <span style={styles.lessonNumber}>{lessonIndex + 1}</span>
                          <div>
                            <div style={styles.lessonTitle}>{lesson.title}</div>
                            <div style={styles.lessonMeta}>
                              <span style={styles.lessonType}>
                                {lesson.lesson_type === 'video' && '🎥 Video'}
                                {lesson.lesson_type === 'text' && '📝 Reading'}
                                {lesson.lesson_type === 'video_text' && '🎥 Video + Text'}
                                {lesson.lesson_type === 'quiz' && '✏️ Quiz'}
                              </span>
                              {lesson.duration_minutes > 0 && (
                                <span style={styles.lessonDuration}>
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={styles.lessonRight}>
                          {lesson.is_preview && <span style={styles.previewBadge}>Preview</span>}
                          {enrollment && lesson.is_completed && (
                            <span style={styles.completedBadge}>✓ Completed</span>
                          )}
                          {enrollment && !lesson.is_completed && lesson.progress && (
                            <span style={styles.inProgressBadge}>In Progress</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What You'll Learn */}
      {course.what_youll_learn && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What You'll Learn</h2>
          <div style={styles.learningPoints}>
            {course.what_youll_learn.split('\n').map((point: string, i: number) => (
              <div key={i} style={styles.learningPoint}>
                <span style={styles.checkIcon}>✓</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Requirements</h2>
          <p style={styles.requirementsText}>{course.requirements}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '100px 20px',
    fontSize: '18px',
    color: '#999999',
  },
  error: {
    textAlign: 'center' as const,
    padding: '100px 20px',
    color: '#EF4444',
    fontSize: '18px',
  },
  header: {
    marginBottom: '48px',
  },
  thumbnail: {
    width: '100%',
    height: '400px',
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  headerContent: {
    // Content styles
  },
  title: {
    fontSize: '36px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '16px',
    marginTop: '0',
  },
  description: {
    fontSize: '18px',
    color: '#CCCCCC',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '24px',
    marginBottom: '32px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statText: {
    fontSize: '14px',
    color: '#999999',
  },
  enrolledSection: {
    backgroundColor: '#1A1A1A',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #333333',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  progressLabel: {
    fontSize: '14px',
    color: '#999999',
  },
  progressPercentage: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: '#22C55E',
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#2A2A2A',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066FF',
    transition: 'width 0.3s ease',
  },
  enrolledActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  completionInfo: {
    fontSize: '13px',
    color: '#999999',
    textAlign: 'center' as const,
  },
  enrollSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    alignItems: 'flex-start',
  },
  enrollNote: {
    fontSize: '13px',
    color: '#999999',
    margin: '0',
  },
  primaryButton: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600' as const,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    width: '100%',
    maxWidth: '300px',
  },
  buttonDisabled: {
    backgroundColor: '#4D4D4D',
    cursor: 'not-allowed',
  },
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '24px',
    marginTop: '0',
  },
  curriculum: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  moduleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    border: '1px solid #333333',
    overflow: 'hidden',
  },
  moduleHeader: {
    padding: '20px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
  },
  moduleHeaderLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    flex: 1,
  },
  moduleIcon: {
    fontSize: '14px',
    color: '#999999',
    marginTop: '4px',
  },
  moduleTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    margin: '0 0 8px 0',
  },
  moduleDescription: {
    fontSize: '14px',
    color: '#999999',
    margin: '0',
  },
  moduleMeta: {
    fontSize: '13px',
    color: '#999999',
  },
  lessonCount: {
    // Style for lesson count
  },
  lessonList: {
    borderTop: '1px solid #333333',
  },
  lessonItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #2A2A2A',
  },
  lessonLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  lessonNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#2A2A2A',
    color: '#999999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600' as const,
    flexShrink: 0,
  },
  lessonTitle: {
    fontSize: '15px',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  lessonMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#999999',
  },
  lessonType: {
    // Lesson type style
  },
  lessonDuration: {
    // Duration style
  },
  lessonRight: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  previewBadge: {
    padding: '4px 12px',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600' as const,
  },
  completedBadge: {
    padding: '4px 12px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600' as const,
  },
  inProgressBadge: {
    padding: '4px 12px',
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600' as const,
  },
  emptyText: {
    color: '#999999',
    fontSize: '14px',
  },
  learningPoints: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  learningPoint: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    fontSize: '14px',
    color: '#CCCCCC',
  },
  checkIcon: {
    color: '#22C55E',
    fontSize: '16px',
    flexShrink: 0,
  },
  requirementsText: {
    fontSize: '14px',
    color: '#CCCCCC',
    lineHeight: '1.6',
  },
};
