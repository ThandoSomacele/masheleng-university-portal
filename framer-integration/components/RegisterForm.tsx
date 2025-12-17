import { useState } from "react"
import { MashelengAPI } from "../api_client"
import { API_URL } from "../config"

/**
 * RegisterForm - Matches Masheleng Design System
 */

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        surname: "",
        country_code: "BW",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // Validate password length
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        setLoading(true)

        try {
            const api = new MashelengAPI(API_URL)
            const userData = {
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                surname: formData.surname,
                country_code: formData.country_code,
            }

            const response = await api.register(userData)
            console.log("✅ Registration successful:", response)
            setSuccess(true)

        } catch (err) {
            console.error("❌ Registration failed:", err)
            setError(err.message || "Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={styles.successTitle}>Account Created!</h2>
                    <p style={styles.successText}>
                        Welcome to Masheleng University. You're all set!
                    </p>
                    <div style={styles.successActions}>
                        <a href="/dashboard" style={styles.primaryButton}>
                            Go to Dashboard
                        </a>
                        <a href="/courses" style={styles.secondaryButton}>
                            Browse Courses
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logo}>
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <text x="0" y="30" fill="#0066FF" fontSize="24" fontWeight="bold">
                            Masheleng
                        </text>
                        <text x="0" y="38" fill="#0066FF" fontSize="10">
                            University
                        </text>
                    </svg>
                </div>

                {/* Title */}
                <h1 style={styles.title}>Create your Account</h1>
                <p style={styles.subtitle}>
                    Join Masheleng® University and start your learning journey today.
                </p>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Name Row */}
                    <div style={styles.row}>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{...styles.input, ...styles.halfInput}}
                        />
                        <input
                            type="text"
                            name="surname"
                            placeholder="Surname"
                            value={formData.surname}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{...styles.input, ...styles.halfInput}}
                        />
                    </div>

                    {/* Email Field */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={styles.input}
                    />

                    {/* Country Field */}
                    <select
                        name="country_code"
                        value={formData.country_code}
                        onChange={handleChange}
                        disabled={loading}
                        style={styles.select}
                    >
                        <option value="BW">Botswana</option>
                        <option value="ZA">South Africa</option>
                    </select>

                    {/* Password Field */}
                    <div style={styles.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={styles.input}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.passwordToggle}
                            disabled={loading}
                        >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>

                    {/* Confirm Password Field */}
                    <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={styles.input}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitButton,
                            ...(loading && styles.submitButtonDisabled),
                        }}
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                {/* Footer */}
                <div style={styles.footer}>
                    <span style={styles.footerText}>Already have an account?</span>
                    {" "}
                    <a href="/login" style={styles.footerLink}>
                        Sign In →
                    </a>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#0A0A0A",
    },
    card: {
        width: "100%",
        maxWidth: "500px",
        backgroundColor: "#1A1A1A",
        borderRadius: "12px",
        padding: "40px",
        border: "1px solid #333333",
    },
    logo: {
        marginBottom: "32px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: "12px",
        marginTop: "0",
        lineHeight: "1.2",
    },
    subtitle: {
        fontSize: "16px",
        color: "#999999",
        marginBottom: "32px",
        marginTop: "0",
        lineHeight: "1.5",
    },
    errorBox: {
        backgroundColor: "#FEE",
        color: "#C33",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "14px",
        border: "1px solid #FCC",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    row: {
        display: "flex",
        gap: "12px",
    },
    input: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        padding: "14px 16px",
        fontSize: "16px",
        fontWeight: "400",
        border: "1px solid #404040",
        borderRadius: "8px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s ease",
    },
    halfInput: {
        flex: "1",
    },
    select: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        padding: "14px 16px",
        fontSize: "16px",
        fontWeight: "400",
        border: "1px solid #404040",
        borderRadius: "8px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
    },
    passwordWrapper: {
        position: "relative",
    },
    passwordToggle: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        color: "#999999",
        fontSize: "20px",
        cursor: "pointer",
        padding: "4px",
    },
    submitButton: {
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        padding: "14px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        marginTop: "8px",
        transition: "background-color 0.2s ease",
    },
    submitButtonDisabled: {
        backgroundColor: "#4D4D4D",
        cursor: "not-allowed",
    },
    footer: {
        marginTop: "24px",
        textAlign: "center",
        fontSize: "14px",
        borderTop: "1px solid #333333",
        paddingTop: "24px",
    },
    footerText: {
        color: "#999999",
    },
    footerLink: {
        color: "#FFFFFF",
        textDecoration: "none",
        fontWeight: "600",
        transition: "color 0.2s ease",
    },
    // Success screen styles
    successIcon: {
        fontSize: "64px",
        color: "#22C55E",
        textAlign: "center",
        marginBottom: "16px",
    },
    successTitle: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: "12px",
    },
    successText: {
        fontSize: "16px",
        color: "#999999",
        textAlign: "center",
        marginBottom: "32px",
    },
    successActions: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    primaryButton: {
        display: "block",
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        padding: "14px 24px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        textDecoration: "none",
        textAlign: "center",
        transition: "background-color 0.2s ease",
    },
    secondaryButton: {
        display: "block",
        backgroundColor: "transparent",
        color: "#0066FF",
        padding: "14px 24px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "1px solid #0066FF",
        textDecoration: "none",
        textAlign: "center",
        transition: "all 0.2s ease",
    },
}
