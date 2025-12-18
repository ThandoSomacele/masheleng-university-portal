import { useState } from "react"
import { MashelengAPI } from "./api_client.js"
import { API_URL } from "./config.js"

export default function CustomRegisterForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        surname: "",
        country_code: "BW",
    })
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

            // Auto-login after registration
            setTimeout(() => {
                const dashboardURL = window.location.origin + "/dashboard"
                window.location.href = dashboardURL
            }, 1500)

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
                <div style={styles.successMessage}>
                    <h2 style={styles.successTitle}>✓ Account Created!</h2>
                    <p style={styles.successText}>Welcome to Masheleng University. Redirecting...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Create Account</h2>

                {error && (
                    <div style={styles.error}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div style={styles.row}>
                    <div style={styles.field}>
                        <label style={styles.label}>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Surname</label>
                        <input
                            type="text"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="you@example.com"
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Country</label>
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
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="At least 8 characters"
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Re-enter your password"
                        style={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {}),
                    }}
                >
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p style={styles.footer}>
                    Already have an account? <a href="/login" style={styles.link}>Sign in</a>
                </p>
            </form>
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        padding: "40px 20px",
    },
    form: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "40px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "24px",
        textAlign: "center",
        color: "#1a1a1a",
    },
    row: {
        display: "flex",
        gap: "16px",
        marginBottom: "20px",
    },
    field: {
        marginBottom: "20px",
        flex: "1",
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        fontSize: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxSizing: "border-box",
    },
    select: {
        width: "100%",
        padding: "12px 16px",
        fontSize: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxSizing: "border-box",
        backgroundColor: "#fff",
    },
    button: {
        width: "100%",
        padding: "14px",
        fontSize: "16px",
        fontWeight: "600",
        color: "#ffffff",
        backgroundColor: "#0066FF",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "8px",
    },
    buttonDisabled: {
        backgroundColor: "#99BBFF",
        cursor: "not-allowed",
    },
    error: {
        backgroundColor: "#FEE",
        color: "#C33",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "14px",
        border: "1px solid #FCC",
    },
    successMessage: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "60px 40px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    successTitle: {
        fontSize: "32px",
        color: "#22C55E",
        marginBottom: "16px",
    },
    successText: {
        fontSize: "16px",
        color: "#666",
    },
    footer: {
        marginTop: "24px",
        textAlign: "center",
        fontSize: "14px",
        color: "#666",
    },
    link: {
        color: "#0066FF",
        textDecoration: "none",
        fontWeight: "600",
    },
}
