import React, { useState, useEffect } from 'react';
import { MashelengAPI } from './api_client.js';
import { API_URL } from './config.js';
import VimeoPlayer from './VimeoPlayer';
import TextLesson from './TextLesson';

interface CoursePlayerProps {
  courseId: string;
  initialLessonId?: string;
}

export default function CoursePlayer({ courseId, initialLessonId }: CoursePlayerProps) {
  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    if (initialLessonId && curriculum.length > 0) {
      loadLesson(initialLessonId);
    } else if (curriculum.length > 0 && !currentLesson) {
      // Load first lesson if no lesson specified
      const firstLesson = curriculum[0]?.lessons?.[0];
      if (firstLesson) {
        loadLesson(firstLesson.id);
      }
    }
  }, [curriculum, initialLessonId]);

  const loadCourseData = async () => {
    try {
      const api = new MashelengAPI(API_URL);
      const curriculumData = await api.getCourseCurriculum(courseId);
      setCurriculum(curriculumData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading curriculum:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const loadLesson = async (lessonId: string) => {
    try {
      const api = new MashelengAPI(API_URL);
      const lessonData = await api.getLesson(courseId, lessonId);
      setCurrentLesson(lessonData);

      // Update URL without page reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('lesson', lessonId);
        window.history.pushState({}, '', url);
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError((err as Error).message);
    }
  };

  const handleVideoProgress = async (progressData: {
    currentTime: number;
    duration: number;
    percentage: number;
  }) => {
    if (!currentLesson) return;

    try {
      const api = new MashelengAPI(API_URL);
      await api.updateLessonProgress(courseId, currentLesson.id, {
        watch_time_seconds: Math.floor(progressData.currentTime),
        last_position_seconds: Math.floor(progressData.currentTime),
        completion_percentage: Math.floor(progressData.percentage),
      });

      // Update local progress
      setCurrentLesson({
        ...currentLesson,
        progress: {
          ...currentLesson.progress,
          watch_time_seconds: Math.floor(progressData.currentTime),
          last_position_seconds: Math.floor(progressData.currentTime),
          completion_percentage: Math.floor(progressData.percentage),
        },
      });
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleVideoComplete = async () => {
    if (!currentLesson) return;

    try {
      const api = new MashelengAPI(API_URL);
      await api.completeLesson(courseId, currentLesson.id);

      // Update local state
      setCurrentLesson({
        ...currentLesson,
        progress: {
          ...currentLesson.progress,
          is_completed: true,
          completion_percentage: 100,
        },
      });

      // Reload curriculum to update completion status
      await loadCourseData();
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || completing) return;

    try {
      setCompleting(true);
      await handleVideoComplete();
      setCompleting(false);
    } catch (err) {
      setCompleting(false);
    }
  };

  const goToNextLesson = () => {
    if (currentLesson?.navigation?.next) {
      loadLesson(currentLesson.navigation.next.id);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLesson?.navigation?.previous) {
      loadLesson(currentLesson.navigation.previous.id);
    }
  };

  const calculateCourseProgress = () => {
    let total = 0;
    let completed = 0;

    curriculum.forEach((module) => {
      module.lessons?.forEach((lesson: any) => {
        total++;
        if (lesson.is_completed) completed++;
      });
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
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

  const courseProgress = calculateCourseProgress();

  return (
    <div style={styles.container}>
      {/* Top Progress Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button style={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <a href={`/courses/${courseId}`} style={styles.backLink}>
            ← Back to Course
          </a>
        </div>
        <div style={styles.progressContainer}>
          <span style={styles.progressText}>{courseProgress}% Complete</span>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBar, width: `${courseProgress}%` }} />
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Course Content</h3>
            <div style={styles.curriculumList}>
              {curriculum.map((module, moduleIndex) => (
                <div key={module.id} style={styles.moduleSection}>
                  <div style={styles.moduleTitleBar}>
                    <span style={styles.moduleNumber}>Module {moduleIndex + 1}</span>
                    <h4 style={styles.moduleTitle}>{module.title}</h4>
                  </div>
                  <div style={styles.lessonsList}>
                    {module.lessons?.map((lesson: any, lessonIndex: number) => (
                      <div
                        key={lesson.id}
                        style={{
                          ...styles.lessonItemSidebar,
                          ...(currentLesson?.id === lesson.id && styles.lessonItemActive),
                        }}
                        onClick={() => loadLesson(lesson.id)}>
                        <div style={styles.lessonLeft}>
                          <span style={styles.lessonNumberSmall}>{lessonIndex + 1}</span>
                          <span style={styles.lessonTitleSmall}>{lesson.title}</span>
                        </div>
                        {lesson.is_completed && <span style={styles.checkmark}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={styles.contentArea}>
          {currentLesson ? (
            <>
              {/* Lesson Header */}
              <div style={styles.lessonHeader}>
                <h1 style={styles.lessonTitle}>{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p style={styles.lessonDescription}>{currentLesson.description}</p>
                )}
              </div>

              {/* Lesson Content */}
              <div style={styles.lessonContent}>
                {/* Video Content */}
                {(currentLesson.lesson_type === 'video' ||
                  currentLesson.lesson_type === 'video_text') &&
                  currentLesson.vimeo_video_id && (
                    <div style={styles.videoContainer}>
                      <VimeoPlayer
                        videoId={currentLesson.vimeo_video_id}
                        onProgress={handleVideoProgress}
                        onComplete={handleVideoComplete}
                        startTime={currentLesson.progress?.last_position_seconds || 0}
                      />
                    </div>
                  )}

                {/* Text Content */}
                {(currentLesson.lesson_type === 'text' ||
                  currentLesson.lesson_type === 'video_text') &&
                  currentLesson.content && (
                    <div style={styles.textContainer}>
                      <TextLesson content={currentLesson.content} />
                    </div>
                  )}

                {/* Resources */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div style={styles.resourcesSection}>
                    <h3 style={styles.resourcesTitle}>Downloadable Resources</h3>
                    <div style={styles.resourcesList}>
                      {currentLesson.resources.map((resource: any) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          download
                          style={styles.resourceItem}
                          target="_blank"
                          rel="noopener noreferrer">
                          <span style={styles.resourceIcon}>📎</span>
                          <span style={styles.resourceName}>{resource.name}</span>
                          <span style={styles.resourceSize}>
                            {(resource.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Footer with Navigation */}
              <div style={styles.lessonFooter}>
                <div style={styles.navigationButtons}>
                  <button
                    onClick={goToPreviousLesson}
                    disabled={!currentLesson.navigation?.previous}
                    style={{
                      ...styles.navButton,
                      ...(!currentLesson.navigation?.previous && styles.navButtonDisabled),
                    }}>
                    ← Previous
                  </button>

                  {!currentLesson.progress?.is_completed && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={completing}
                      style={{
                        ...styles.completeButton,
                        ...(completing && styles.completeButtonDisabled),
                      }}>
                      {completing ? 'Marking...' : '✓ Mark as Complete'}
                    </button>
                  )}

                  {currentLesson.progress?.is_completed && (
                    <div style={styles.completedBadge}>✓ Completed</div>
                  )}

                  <button
                    onClick={goToNextLesson}
                    disabled={!currentLesson.navigation?.next}
                    style={{
                      ...styles.navButton,
                      ...(!currentLesson.navigation?.next && styles.navButtonDisabled),
                    }}>
                    Next →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.noLesson}>
              <p>Select a lesson from the sidebar to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0A0A0A',
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#1A1A1A',
    borderBottom: '1px solid #333333',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  menuButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  backLink: {
    color: '#0066FF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600' as const,
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    maxWidth: '300px',
  },
  progressText: {
    fontSize: '13px',
    color: '#999999',
    whiteSpace: 'nowrap' as const,
  },
  progressBarContainer: {
    flex: 1,
    height: '6px',
    backgroundColor: '#2A2A2A',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066FF',
    transition: 'width 0.3s ease',
  },
  mainContent: {
    display: 'flex',
    height: 'calc(100vh - 60px)',
  },
  sidebar: {
    width: '320px',
    backgroundColor: '#1A1A1A',
    borderRight: '1px solid #333333',
    overflowY: 'auto' as const,
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    padding: '20px 20px 16px 20px',
    margin: '0',
    borderBottom: '1px solid #333333',
  },
  curriculumList: {
    padding: '0',
  },
  moduleSection: {
    borderBottom: '1px solid #2A2A2A',
  },
  moduleTitleBar: {
    padding: '16px 20px 12px 20px',
    backgroundColor: '#1A1A1A',
  },
  moduleNumber: {
    fontSize: '11px',
    color: '#999999',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: '4px',
  },
  moduleTitle: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    margin: '0',
  },
  lessonsList: {
    // Container for lessons
  },
  lessonItemSidebar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderLeft: '3px solid transparent',
  },
  lessonItemActive: {
    backgroundColor: '#2A2A2A',
    borderLeftColor: '#0066FF',
  },
  lessonLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  lessonNumberSmall: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#2A2A2A',
    color: '#999999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600' as const,
    flexShrink: 0,
  },
  lessonTitleSmall: {
    fontSize: '13px',
    color: '#CCCCCC',
  },
  checkmark: {
    color: '#22C55E',
    fontSize: '16px',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto' as const,
    backgroundColor: '#0A0A0A',
  },
  lessonHeader: {
    padding: '32px 40px 24px 40px',
    borderBottom: '1px solid #333333',
  },
  lessonTitle: {
    fontSize: '28px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    margin: '0 0 12px 0',
  },
  lessonDescription: {
    fontSize: '16px',
    color: '#999999',
    lineHeight: '1.6',
    margin: '0',
  },
  lessonContent: {
    padding: '32px 40px',
  },
  videoContainer: {
    marginBottom: '32px',
  },
  textContainer: {
    marginBottom: '32px',
  },
  resourcesSection: {
    marginTop: '40px',
    padding: '24px',
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    border: '1px solid #333333',
  },
  resourcesTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: '16px',
    marginTop: '0',
  },
  resourcesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease',
  },
  resourceIcon: {
    fontSize: '20px',
  },
  resourceName: {
    flex: 1,
    fontSize: '14px',
    color: '#FFFFFF',
  },
  resourceSize: {
    fontSize: '12px',
    color: '#999999',
  },
  lessonFooter: {
    padding: '24px 40px 40px 40px',
    borderTop: '1px solid #333333',
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  navButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  completeButton: {
    padding: '12px 24px',
    backgroundColor: '#22C55E',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  completeButtonDisabled: {
    backgroundColor: '#4D4D4D',
    cursor: 'not-allowed',
  },
  completedBadge: {
    padding: '12px 24px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #22C55E',
    borderRadius: '8px',
    color: '#22C55E',
    fontSize: '14px',
    fontWeight: '600' as const,
  },
  noLesson: {
    padding: '100px 40px',
    textAlign: 'center' as const,
    color: '#999999',
  },
};
