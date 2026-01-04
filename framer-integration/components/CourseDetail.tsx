import React, { useState, useEffect } from 'react';
import { MashelengAPI } from './api_client.js';
import { API_URL } from './config.js';

/**
 * CourseDetail Component
 *
 * Displays detailed course information including curriculum, enrollment status, and progress.
 *
 * FRAMER SETUP:
 * 1. Add this as a Code Component in Framer
 * 2. Create a dynamic route: /courses/:courseId
 * 3. Pass the courseId prop from the route parameter
 *
 * Example usage in Framer:
 * <CourseDetail courseId={router.params.courseId} />
 */

interface CourseDetailProps {
  courseId?: string;
  style?: React.CSSProperties;
}

export default function CourseDetail({ courseId: courseIdProp, style }: CourseDetailProps) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    // Extract courseId from prop or URL
    let extractedCourseId = courseIdProp;

    console.log('🔍 CourseDetail - Debugging courseId extraction:');
    console.log('  - courseIdProp:', courseIdProp);
    console.log('  - window.location.pathname:', typeof window !== 'undefined' ? window.location.pathname : 'N/A (SSR)');
    console.log('  - API_URL:', API_URL);

    if (!extractedCourseId && typeof window !== 'undefined') {
      // UUID validation pattern
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Try to extract from URL path
      const pathSegments = window.location.pathname.split('/').filter(s => s.length > 0);
      console.log('  - Path segments:', pathSegments);

      // Strategy 1: Look for /courses/:courseId pattern
      const coursesIndex = pathSegments.indexOf('courses');
      if (coursesIndex !== -1 && pathSegments[coursesIndex + 1]) {
        extractedCourseId = pathSegments[coursesIndex + 1];
        console.log('✅ Strategy 1: Extracted courseId from /courses/ path:', extractedCourseId);
      }

      // Strategy 2: If not found, search for any UUID-like segment in the path
      if (!extractedCourseId) {
        for (const segment of pathSegments) {
          if (uuidRegex.test(segment)) {
            extractedCourseId = segment;
            console.log('✅ Strategy 2: Found UUID in path:', extractedCourseId);
            break;
          }
        }
      }

      // Validate UUID format
      if (extractedCourseId && !uuidRegex.test(extractedCourseId)) {
        console.warn('⚠️ Invalid UUID format:', extractedCourseId);
        extractedCourseId = undefined;
      }
    }

    console.log('🎯 Final courseId:', extractedCourseId || 'NONE');
    setCourseId(extractedCourseId || null);
  }, [courseIdProp]);

  useEffect(() => {
    // Check authentication status
    const token = typeof window !== 'undefined' ? localStorage.getItem('masheleng_token') : null;
    setIsAuthenticated(!!token);

    if (courseId) {
      console.log('✅ Loading course data for ID:', courseId);
      loadCourseData();
    } else {
      setError('No course ID provided. Please ensure this component is used on a course detail page with a valid course ID in the URL (e.g., /courses/11111111-1111-1111-1111-111111111111).');
      setLoading(false);
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const api = new MashelengAPI(API_URL);
      const token = typeof window !== 'undefined' ? localStorage.getItem('masheleng_token') : null;

      console.log('🔐 Authentication status:', token ? 'Logged in' : 'Guest');
      console.log('📡 Fetching course:', courseId);

      if (token) {
        // Authenticated user - load full course details
        try {
          console.log('📥 API Call: GET /courses/' + courseId);
          const courseData = await api.getCourse(courseId!);
          console.log('✅ Course data loaded:', courseData.title);
          setCourse(courseData);

          // Check enrollment status
          console.log('📥 API Call: GET /courses/enrollments/my');
          const enrollments = await api.getMyEnrollments();
          const userEnrollment = enrollments.find((e: any) => e.course_id === courseId);
          console.log('📝 Enrollment status:', userEnrollment ? 'Enrolled' : 'Not enrolled');
          setEnrollment(userEnrollment);

          // Load curriculum (may fail if server error, but course details still work)
          try {
            console.log('📥 API Call: GET /courses/' + courseId + '/curriculum');
            const curriculumData = await api.getCourseCurriculum(courseId!);
            console.log('✅ Curriculum loaded:', curriculumData.length, 'modules');
            setCurriculum(curriculumData);

            // Expand first module by default
            if (curriculumData.length > 0) {
              setExpandedModules(new Set([curriculumData[0].id]));
            }
          } catch (currErr: any) {
            console.warn('⚠️ Failed to load curriculum:', currErr.message);
            // Continue anyway - user can still see course details and enroll
          }
        } catch (err: any) {
          // If auth fails or subscription required, show specific error
          console.error('❌ Course load failed:', err.message);

          if (err.message.includes('subscription')) {
            setError('This course requires an active subscription. Please subscribe to access course details.');
          } else if (err.message.includes('Forbidden')) {
            setError('You do not have access to this course. Please check your subscription tier.');
          } else {
            // Fall back to public course list
            console.log('Attempting to load public course data...');
            await loadPublicCourseData();
          }
        }
      } else {
        // Not authenticated - load from public course list
        console.log('Guest user - loading public course data');
        await loadPublicCourseData();
      }

      setLoading(false);
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const loadPublicCourseData = async () => {
    try {
      const api = new MashelengAPI(API_URL);
      // Fetch from public courses endpoint
      const courses = await fetch(`${API_URL}/courses`).then(res => res.json());
      const courseData = courses.find((c: any) => c.id === courseId);

      if (courseData) {
        setCourse(courseData);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Public course load error:', err);
      setError('Unable to load course details');
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = `/login?redirect=/courses/${courseId}`;
      }
      return;
    }

    try {
      setEnrolling(true);
      const api = new MashelengAPI(API_URL);
      await api.enrollInCourse(courseId!);

      // Reload data to show enrolled state
      await loadCourseData();
      setEnrolling(false);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(err.message || 'Enrollment failed. Please try again.');
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
      if (typeof window !== 'undefined') {
        window.location.href = `/courses/${courseId}/learn?lesson=${firstLesson.id}`;
      }
    }
  };

  const continueFromLastLesson = () => {
    // Find the last incomplete lesson
    for (const module of curriculum) {
      for (const lesson of module.lessons || []) {
        if (!lesson.is_completed) {
          if (typeof window !== 'undefined') {
            window.location.href = `/courses/${courseId}/learn?lesson=${lesson.id}`;
          }
          return;
        }
      }
    }
    // If all complete, go to first lesson
    startLearning();
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, ...style }}>
        <div style={styles.loading}>Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, ...style }}>
        <div style={styles.error}>{error}</div>
        {!isAuthenticated && (
          <button
            onClick={() => typeof window !== 'undefined' && (window.location.href = '/login')}
            style={styles.primaryButton}
          >
            Login to View Full Details
          </button>
        )}
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ ...styles.container, ...style }}>
        <div style={styles.error}>Course not found</div>
      </div>
    );
  }

  const totalLessons = curriculum.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
  const completedLessons = curriculum.reduce(
    (sum, mod) => sum + (mod.lessons?.filter((l: any) => l.is_completed).length || 0),
    0
  );

  const getTierName = (level: number) => {
    switch (level) {
      case 1: return 'Entry';
      case 2: return 'Premium';
      case 3: return 'Premium+';
      default: return 'Entry';
    }
  };

  return (
    <div style={{ ...styles.container, ...style }}>
      {/* Course Header */}
      <div style={styles.header}>
        {course.thumbnail_url && (
          <div style={styles.thumbnail}>
            <img src={course.thumbnail_url} alt={course.title} style={styles.thumbnailImage} />
          </div>
        )}
        <div style={styles.headerContent}>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.description}>{course.description}</p>

          {/* Course Stats */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📚</span>
              <span style={styles.statText}>{totalLessons || 'Multiple'} Lessons</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>⏱️</span>
              <span style={styles.statText}>{Math.floor((course.duration_minutes || 0) / 60)}h Duration</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>🎓</span>
              <span style={styles.statText}>{course.instructor_name || 'Masheleng Academy'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>👥</span>
              <span style={styles.statText}>{course.enrollment_count || 0} Students</span>
            </div>
          </div>

          {/* Enrollment Status & Actions */}
          {isAuthenticated ? (
            enrollment ? (
              <div style={styles.enrolledSection}>
                <div style={styles.progressInfo}>
                  <span style={styles.progressLabel}>Your Progress:</span>
                  <span style={styles.progressPercentage}>{enrollment.progress_percentage || 0}%</span>
                </div>
                <div style={styles.progressBarContainer}>
                  <div style={{ ...styles.progressBar, width: `${enrollment.progress_percentage || 0}%` }} />
                </div>
                <div style={styles.enrolledActions}>
                  <button onClick={continueFromLastLesson} style={styles.primaryButton}>
                    {(enrollment.progress_percentage || 0) > 0 ? 'Continue Learning' : 'Start Learning'}
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
                  Requires {getTierName(course.required_tier_level)} tier or higher
                </p>
              </div>
            )
          ) : (
            <div style={styles.enrollSection}>
              <button onClick={handleEnroll} style={styles.primaryButton}>
                Login to Enroll
              </button>
              <p style={styles.enrollNote}>
                Requires {getTierName(course.required_tier_level)} tier subscription
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Curriculum - Only show if authenticated and have curriculum data */}
      {isAuthenticated && curriculum.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Course Curriculum</h2>
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
        </div>
      )}

      {!isAuthenticated && (
        <div style={styles.section}>
          <div style={styles.loginPrompt}>
            <h3 style={styles.loginPromptTitle}>Want to see the full curriculum?</h3>
            <p style={styles.loginPromptText}>Login to view all course modules and lessons</p>
            <button
              onClick={() => typeof window !== 'undefined' && (window.location.href = `/login?redirect=/courses/${courseId}`)}
              style={styles.secondaryButton}
            >
              Login Now
            </button>
          </div>
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
    padding: '40px 20px',
    color: '#EF4444',
    fontSize: '18px',
    marginBottom: '20px',
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
  headerContent: {},
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
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '8px',
    border: '1px solid #333333',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
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
  lessonCount: {},
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
  lessonType: {},
  lessonDuration: {},
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
  loginPrompt: {
    backgroundColor: '#1A1A1A',
    padding: '40px',
    borderRadius: '12px',
    border: '1px solid #333333',
    textAlign: 'center' as const,
  },
  loginPromptTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: '12px',
    marginTop: '0',
  },
  loginPromptText: {
    fontSize: '14px',
    color: '#999999',
    marginBottom: '24px',
  },
};
