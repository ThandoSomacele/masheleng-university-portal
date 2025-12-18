import React, { useState, useEffect } from 'react';
import { MashelengAPI } from './api_client.js';
import { API_URL } from './config.js';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [insurancePolicy, setInsurancePolicy] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const api = new MashelengAPI(API_URL);

      // Check if user is logged in
      const token = localStorage.getItem('masheleng_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Load user data
      const userData = await api.getCurrentUser();
      setUser(userData);

      // Load subscription (may not exist yet)
      try {
        const subData = await api.getMySubscription();
        setSubscription(subData);
      } catch (err) {
        console.log('No active subscription:', err.message);
      }

      // Load enrollments
      try {
        const enrollmentData = await api.getMyEnrollments();
        setEnrollments(enrollmentData);
      } catch (err) {
        console.log('No enrollments yet:', err.message);
      }

      // Load insurance policy
      try {
        const policyData = await api.getMyInsurancePolicy();
        setInsurancePolicy(policyData);
      } catch (err) {
        console.log('No insurance policy:', err.message);
      }

      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message);
      setLoading(false);

      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  };

  const handleLogout = () => {
    const api = new MashelengAPI(API_URL);
    api.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const completedCourses = enrollments?.filter((e) => e.progress >= 100).length || 0;
  const inProgressCourses = enrollments?.filter((e) => e.progress > 0 && e.progress < 100).length || 0;
  const totalCourses = enrollments?.length || 0;
  const averageProgress =
    totalCourses > 0 ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.welcome}>Welcome back, {user?.first_name}!</h1>
          <p style={styles.subtitle}>{user?.email}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{totalCourses}</div>
            <div style={styles.statLabel}>Total Courses</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{inProgressCourses}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{completedCourses}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{averageProgress}%</div>
            <div style={styles.statLabel}>Avg Progress</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Subscription Status */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Subscription Status</h2>
              {subscription && <div style={styles.activeBadge}>Active</div>}
            </div>
            {subscription ? (
              <div>
                <div style={styles.subscriptionInfo}>
                  <div style={styles.tierBadge}>{subscription.tier?.tier_name || 'Premium'}</div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Status</span>
                    <span style={styles.infoValue}>{subscription.status}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Next Payment</span>
                    <span style={styles.infoValue}>
                      {subscription.current_period_end
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Payment Frequency</span>
                    <span style={styles.infoValue}>{subscription.payment_frequency || 'Monthly'}</span>
                  </div>
                </div>
                <a href='/account/subscription' style={styles.cardLink}>
                  Manage Subscription →
                </a>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>You don't have an active subscription yet.</p>
                <a href='/pricing' style={styles.primaryButton}>
                  View Pricing Plans
                </a>
              </div>
            )}
          </div>

          {/* Insurance Coverage */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Insurance Coverage</h2>
              {insurancePolicy && <div style={styles.activeBadge}>Active</div>}
            </div>
            {insurancePolicy ? (
              <div>
                <div style={styles.insuranceInfo}>
                  <div style={styles.coverageBox}>
                    <div style={styles.coverageIcon}>🛡️</div>
                    <div>
                      <div style={styles.coverageAmount}>P50,000</div>
                      <div style={styles.coverageType}>Funeral Cover</div>
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Policy ID</span>
                    <span style={styles.infoValue}>{insurancePolicy.id?.substring(0, 8)}...</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Beneficiaries</span>
                    <span style={styles.infoValue}>{insurancePolicy.beneficiaries?.length || 0}</span>
                  </div>
                </div>
                <a href='/insurance/policies' style={styles.cardLink}>
                  View Policy Details →
                </a>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>Activate your free funeral cover.</p>
                <a href='/insurance/activate' style={styles.primaryButton}>
                  Activate Now
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Quick Actions</h2>
            <div style={styles.actionList}>
              <a href='/courses' style={styles.actionItem}>
                <span style={styles.actionIcon}>📖</span>
                <span style={styles.actionText}>Browse Courses</span>
                <span style={styles.actionArrow}>→</span>
              </a>
              <a href='/pricing' style={styles.actionItem}>
                <span style={styles.actionIcon}>💰</span>
                <span style={styles.actionText}>View Plans</span>
                <span style={styles.actionArrow}>→</span>
              </a>
              <a href='/account/settings' style={styles.actionItem}>
                <span style={styles.actionIcon}>⚙️</span>
                <span style={styles.actionText}>Account Settings</span>
                <span style={styles.actionArrow}>→</span>
              </a>
              <a href='/support' style={styles.actionItem}>
                <span style={styles.actionIcon}>💬</span>
                <span style={styles.actionText}>Get Support</span>
                <span style={styles.actionArrow}>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* My Courses */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>My Courses</h2>
              <a href='/courses' style={styles.headerLink}>
                View All
              </a>
            </div>
            {enrollments && enrollments.length > 0 ? (
              <div style={styles.courseList}>
                {enrollments.slice(0, 5).map((enrollment) => (
                  <div key={enrollment.id} style={styles.courseCard}>
                    <div style={styles.courseHeader}>
                      <h3 style={styles.courseName}>{enrollment.course?.name || 'Course'}</h3>
                      <div style={styles.courseProgress}>{enrollment.progress || 0}%</div>
                    </div>
                    <p style={styles.courseDescription}>
                      {enrollment.course?.description?.substring(0, 80) || 'No description available'}
                      {enrollment.course?.description?.length > 80 && '...'}
                    </p>
                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${enrollment.progress || 0}%`,
                        }}
                      />
                    </div>
                    <div style={styles.courseFooter}>
                      <a href={`/courses/${enrollment.course?.id}`} style={styles.continueButton}>
                        Continue Learning
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📚</div>
                <p style={styles.emptyText}>You haven't enrolled in any courses yet.</p>
                <a href='/courses' style={styles.primaryButton}>
                  Browse Courses
                </a>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Activity</h2>
            <div style={styles.activityList}>
              <div style={styles.activityItem}>
                <div style={styles.activityIcon}>🎓</div>
                <div style={styles.activityContent}>
                  <div style={styles.activityTitle}>Welcome to Masheleng University!</div>
                  <div style={styles.activityTime}>Just now</div>
                </div>
              </div>
              {enrollments && enrollments.length > 0 && (
                <div style={styles.activityItem}>
                  <div style={styles.activityIcon}>✅</div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>Enrolled in {enrollments.length} courses</div>
                    <div style={styles.activityTime}>Recently</div>
                  </div>
                </div>
              )}
              {subscription && (
                <div style={styles.activityItem}>
                  <div style={styles.activityIcon}>💳</div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>Subscription activated</div>
                    <div style={styles.activityTime}>
                      {subscription.created_at
                        ? new Date(subscription.created_at).toLocaleDateString()
                        : 'Recently'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Account Information</h2>
            <div style={styles.accountInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Name</span>
                <span style={styles.infoValue}>
                  {user?.first_name} {user?.surname}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{user?.email}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Country</span>
                <span style={styles.infoValue}>{user?.country_code === 'BW' ? 'Botswana' : 'South Africa'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Member Since</span>
                <span style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <a href='/account/settings' style={styles.cardLink}>
              Edit Profile →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 20px',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  welcome: {
    fontSize: '32px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#999999',
    margin: '0',
  },
  logoutButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    transition: 'all 0.2s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #333333',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#999999',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 400px) 1fr',
    gap: '24px',
  } as React.CSSProperties,
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #333333',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    margin: '0',
  },
  activeBadge: {
    padding: '4px 12px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  headerLink: {
    color: '#0066FF',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '600' as const,
  },
  subscriptionInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  tierBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600' as const,
    marginBottom: '8px',
    width: 'fit-content',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #2A2A2A',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#999999',
  },
  infoValue: {
    fontSize: '14px',
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  insuranceInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  coverageBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  coverageIcon: {
    fontSize: '32px',
  },
  coverageAmount: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  coverageType: {
    fontSize: '13px',
    color: '#999999',
  },
  cardLink: {
    display: 'block',
    color: '#0066FF',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    marginTop: '16px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '32px 16px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#999999',
    marginBottom: '16px',
  },
  primaryButton: {
    display: 'inline-block',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease',
  },
  actionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease',
  },
  actionIcon: {
    fontSize: '20px',
  },
  actionText: {
    flex: 1,
    fontSize: '14px',
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  actionArrow: {
    fontSize: '16px',
    color: '#999999',
  },
  courseList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  courseCard: {
    padding: '20px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    border: '1px solid #333333',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '12px',
  },
  courseName: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    margin: '0',
    flex: 1,
  },
  courseProgress: {
    fontSize: '14px',
    fontWeight: '700' as const,
    color: '#22C55E',
  },
  courseDescription: {
    fontSize: '13px',
    color: '#999999',
    marginBottom: '12px',
    lineHeight: '1.6',
  },
  progressBarContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: '#1A1A1A',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066FF',
    transition: 'width 0.3s ease',
  },
  courseFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  continueButton: {
    fontSize: '13px',
    color: '#0066FF',
    textDecoration: 'none',
    fontWeight: '600' as const,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
  },
  activityIcon: {
    fontSize: '20px',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '14px',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  activityTime: {
    fontSize: '12px',
    color: '#999999',
  },
  accountInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
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
  },
};
