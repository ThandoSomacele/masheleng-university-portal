import { useState, useEffect } from "react"
import { MashelengAPI } from "./api_client.js"
import { API_URL } from "./config.js"

/**
 * CourseCatalog - Matches Masheleng Design System
 * Based on design: Screenshot 2025-12-17 at 20.26.19.png
 */

export default function CourseCatalog() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filter, setFilter] = useState("all")

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            const api = new MashelengAPI(API_URL)
            const data = await api.getCourses()
            setCourses(data)
            setLoading(false)
        } catch (err) {
            console.error("Failed to load courses:", err)
            setError(err.message)
            setLoading(false)
        }
    }

    const handleEnroll = async (courseId) => {
        try {
            const api = new MashelengAPI(API_URL)
            const token = localStorage.getItem("masheleng_token")

            if (!token) {
                window.location.href = "/login"
                return
            }

            await api.enrollInCourse(courseId)
            alert("Successfully enrolled in course!")

        } catch (err) {
            console.error("Enrollment failed:", err)
            alert(`Enrollment failed: ${err.message}`)
        }
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading courses...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <h2>Error Loading Courses</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Featured Courses</h1>
                <div style={styles.filterGroup}>
                    <button
                        style={{
                            ...styles.filterButton,
                            ...(filter === "all" && styles.filterButtonActive),
                        }}
                        onClick={() => setFilter("all")}
                    >
                        All Courses
                    </button>
                    <button
                        style={{
                            ...styles.filterButton,
                            ...(filter === "investing" && styles.filterButtonActive),
                        }}
                        onClick={() => setFilter("investing")}
                    >
                        Investing
                    </button>
                    <button
                        style={{
                            ...styles.filterButton,
                            ...(filter === "wealth" && styles.filterButtonActive),
                        }}
                        onClick={() => setFilter("wealth")}
                    >
                        Wealth Creation
                    </button>
                </div>
            </div>

            {/* Course Grid */}
            <div style={styles.grid}>
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onEnroll={handleEnroll}
                    />
                ))}
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
                <div style={styles.empty}>
                    <p>No courses available yet. Check back soon!</p>
                </div>
            )}
        </div>
    )
}

function CourseCard({ course, onEnroll }) {
    const [imageLoaded, setImageLoaded] = useState(false)

    // Format price
    const formatPrice = (price) => {
        return `R${parseFloat(price || 0).toLocaleString()}`
    }

    // Calculate rating display
    const renderStars = (rating = 0) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? "#F59E0B" : "#404040" }}>
                    ★
                </span>
            )
        }
        return stars
    }

    return (
        <div style={styles.card}>
            {/* Image */}
            <div style={styles.imageContainer}>
                {!imageLoaded && (
                    <div style={styles.imagePlaceholder}>
                        <span>📚</span>
                    </div>
                )}
                {course.thumbnail_url && (
                    <img
                        src={course.thumbnail_url}
                        alt={course.name}
                        style={{
                            ...styles.image,
                            display: imageLoaded ? "block" : "none",
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(false)}
                    />
                )}

                {/* Badge */}
                <div style={styles.badge}>
                    {course.category || "Course"}
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {/* Rating and Price Row */}
                <div style={styles.topRow}>
                    <div style={styles.rating}>
                        {renderStars(4)}
                        <span style={styles.ratingText}>Rated 5 Stars</span>
                    </div>
                    <div style={styles.price}>
                        {formatPrice(course.base_price || 1000)}
                    </div>
                </div>

                {/* Title */}
                <h3 style={styles.courseTitle}>{course.name}</h3>

                {/* Instructor */}
                <div style={styles.instructor}>
                    <div style={styles.instructorAvatar}>
                        {course.instructor_name?.charAt(0) || "I"}
                    </div>
                    <span style={styles.instructorName}>
                        {course.instructor_name || "Seotla Ratshaoa"}
                    </span>
                </div>

                {/* Description */}
                <p style={styles.description}>
                    {course.description || "Master the fundamentals. Learn smart money management, budgeting, and financial strategies that set a lasting foundation."}
                </p>

                {/* Footer */}
                <div style={styles.footer}>
                    <div style={styles.meta}>
                        <span style={styles.metaItem}>
                            ⏱️ {course.duration_hours || 1}h {course.duration_minutes || 0}min
                        </span>
                        <span style={styles.metaItem}>
                            📄 {course.total_lessons || 5} Lessons
                        </span>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    style={styles.ctaButton}
                    onClick={() => onEnroll(course.id)}
                >
                    View Course
                </button>
            </div>
        </div>
    )
}

const styles = {
    container: {
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 20px",
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
    },
    header: {
        marginBottom: "40px",
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: "24px",
        marginTop: "0",
    },
    filterGroup: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
    },
    filterButton: {
        backgroundColor: "transparent",
        color: "#999999",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "1px solid #404040",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    filterButtonActive: {
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        borderColor: "#0066FF",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "24px",
    },
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #333333",
        transition: "all 0.2s ease",
        cursor: "pointer",
    },
    imageContainer: {
        position: "relative",
        aspectRatio: "16/9",
        overflow: "hidden",
        backgroundColor: "#2A2A2A",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
        backgroundColor: "#2A2A2A",
    },
    badge: {
        position: "absolute",
        top: "12px",
        left: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#FFFFFF",
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: "600",
        borderRadius: "6px",
        backdropFilter: "blur(4px)",
        textTransform: "capitalize",
    },
    content: {
        padding: "20px",
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    rating: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "14px",
    },
    ratingText: {
        color: "#999999",
        fontSize: "12px",
        marginLeft: "8px",
    },
    price: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#FFFFFF",
    },
    courseTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: "12px",
        marginTop: "0",
        lineHeight: "1.3",
    },
    instructor: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
    },
    instructorAvatar: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "600",
    },
    instructorName: {
        fontSize: "14px",
        color: "#999999",
    },
    description: {
        fontSize: "14px",
        color: "#999999",
        lineHeight: "1.6",
        marginBottom: "16px",
        marginTop: "0",
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    footer: {
        marginBottom: "16px",
    },
    meta: {
        display: "flex",
        gap: "16px",
    },
    metaItem: {
        fontSize: "13px",
        color: "#999999",
    },
    ctaButton: {
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "none",
        width: "100%",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    },
    loading: {
        textAlign: "center",
        padding: "100px 20px",
        fontSize: "18px",
        color: "#999999",
    },
    error: {
        textAlign: "center",
        padding: "100px 20px",
        color: "#EF4444",
    },
    empty: {
        textAlign: "center",
        padding: "100px 20px",
        fontSize: "16px",
        color: "#999999",
    },
}
