import { useState, useEffect } from "react"
import { MashelengAPI } from "./api_client.js"
import { API_URL } from "./config.js"

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [enrollments, setEnrollments] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const api = new MashelengAPI(API_URL)

            // Check if user is logged in
            const token = localStorage.getItem("masheleng_token")
            if (!token) {
                window.location.href = "/login"
                return
            }

            // Load user data
            const userData = await api.getCurrentUser()
            setUser(userData)

            // Load subscription (may not exist yet)
            try {
                const subData = await api.getMySubscription()
                setSubscription(subData)
            } catch (err) {
                console.log("No active subscription:", err.message)
            }

            // Load enrollments
            try {
                const enrollmentData = await api.getMyEnrollments()
                setEnrollments(enrollmentData)
            } catch (err) {
                console.log("No enrollments yet:", err.message)
            }

            setLoading(false)
        } catch (err) {
            console.error("Dashboard load error:", err)
            setError(err.message)
            setLoading(false)

            // If unauthorized, redirect to login
            if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                setTimeout(() => {
                    window.location.href = "/login"
                }, 2000)
            }
        }
    }

    const handleLogout = () => {
        const api = new MashelengAPI(API_URL)
        api.logout()
        window.location.href = "/login"
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading your dashboard...</div>
            </div>
        )
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
        )
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.welcome}>
                        Welcome back, {user?.first_name}!
                    </h1>
                    <p style={styles.subtitle}>{user?.email}</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>

            {/* Subscription Status */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Subscription Status</h2>
                {subscription ? (
                    <div style={styles.subscriptionActive}>
                        <div style={styles.badge}>
                            {subscription.tier?.name || "Active"}
                        </div>
                        <p style={styles.cardText}>
                            Status: <strong>{subscription.status}</strong>
                        </p>
                        {subscription.current_period_end && (
                            <p style={styles.cardText}>
                                Renews:{" "}
                                {new Date(subscription.current_period_end).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <div style={styles.noSubscription}>
                        <p style={styles.cardText}>
                            You don't have an active subscription yet.
                        </p>
                        <a href="/pricing" style={styles.primaryLink}>
                            View Pricing Plans →
                        </a>
                    </div>
                )}
            </div>

            {/* Enrolled Courses */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>My Courses</h2>
                {enrollments && enrollments.length > 0 ? (
                    <div style={styles.courseList}>
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} style={styles.courseItem}>
                                <div>
                                    <h3 style={styles.courseName}>
                                        {enrollment.course?.name || "Course"}
                                    </h3>
                                    <p style={styles.courseDescription}>
                                        {enrollment.course?.description ||
                                            "No description available"}
                                    </p>
                                </div>
                                <div style={styles.courseProgress}>
                                    <div style={styles.progressLabel}>
                                        Progress: {enrollment.progress || 0}%
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div
                                            style={{
                                                ...styles.progressFill,
                                                width: `${enrollment.progress || 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.noCourses}>
                        <p style={styles.cardText}>
                            You haven't enrolled in any courses yet.
                        </p>
                        <a href="/courses" style={styles.primaryLink}>
                            Browse Courses →
                        </a>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Quick Actions</h2>
                <div style={styles.actionGrid}>
                    <a href="/courses" style={styles.actionButton}>
                        Browse Courses
                    </a>
                    <a href="/pricing" style={styles.actionButton}>
                        View Plans
                    </a>
                    {subscription && (
                        <a href="/account/settings" style={styles.actionButton}>
                            Manage Subscription
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px",
    },
    welcome: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#1a1a1a",
        margin: "0 0 8px 0",
    },
    subtitle: {
        fontSize: "16px",
        color: "#666",
        margin: "0",
    },
    logoutButton: {
        padding: "10px 20px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        color: "#666",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "32px",
        marginBottom: "24px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
    },
    cardTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: "20px",
        marginTop: "0",
    },
    cardText: {
        fontSize: "16px",
        color: "#666",
        margin: "8px 0",
    },
    badge: {
        display: "inline-block",
        padding: "6px 16px",
        backgroundColor: "#E6F4EA",
        color: "#1E8E3E",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "600",
        marginBottom: "16px",
    },
    subscriptionActive: {},
    noSubscription: {},
    noCourses: {},
    primaryLink: {
        color: "#0066FF",
        textDecoration: "none",
        fontSize: "16px",
        fontWeight: "600",
        display: "inline-block",
        marginTop: "12px",
    },
    courseList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    courseItem: {
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
    },
    courseName: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#1a1a1a",
        marginTop: "0",
        marginBottom: "8px",
    },
    courseDescription: {
        fontSize: "14px",
        color: "#666",
        margin: "0 0 12px 0",
    },
    courseProgress: {
        marginTop: "12px",
    },
    progressLabel: {
        fontSize: "14px",
        color: "#666",
        marginBottom: "8px",
    },
    progressBar: {
        width: "100%",
        height: "8px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#0066FF",
        transition: "width 0.3s ease",
    },
    actionGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
    },
    actionButton: {
        display: "block",
        padding: "16px",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        border: "1px solid #e9ecef",
        borderRadius: "8px",
        color: "#0066FF",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "14px",
        transition: "all 0.2s",
    },
    loading: {
        textAlign: "center",
        padding: "100px 20px",
        fontSize: "18px",
        color: "#666",
    },
    error: {
        textAlign: "center",
        padding: "100px 20px",
        color: "#C33",
    },
}
