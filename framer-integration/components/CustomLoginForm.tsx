import { useState } from "react"
import { MashelengAPI } from "../api_client"
import { API_URL } from "../config"

export default function CustomLoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const api = new MashelengAPI(API_URL)
            const response = await api.login(email, password)

            console.log("✅ Login successful:", response)
            setSuccess(true)

            // Redirect after short delay - adjust URL to match your Framer pages
            setTimeout(() => {
                // Try to redirect to dashboard page if it exists, otherwise stay on login
                const dashboardURL = window.location.origin + "/dashboard"
                window.location.href = dashboardURL
            }, 1000)

        } catch (err) {
            console.error("❌ Login failed:", err)
            setError(err.message || "Login failed. Please check your credentials.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.successMessage}>
                    <h2 style={styles.successTitle}>✓ Login Successful!</h2>
                    <p style={styles.successText}>Redirecting to your dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Sign In</h2>

                {error && (
                    <div style={styles.error}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div style={styles.field}>
                    <label style={styles.label}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="you@example.com"
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Enter your password"
                        style={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {})
                    }}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <p style={styles.footer}>
                    Don't have an account? <a href="/register" style={styles.link}>Sign up</a>
                </p>
            </form>
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        maxWidth: "400px",
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
    field: {
        marginBottom: "20px",
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
        transition: "border-color 0.2s",
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
        transition: "background-color 0.2s",
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
