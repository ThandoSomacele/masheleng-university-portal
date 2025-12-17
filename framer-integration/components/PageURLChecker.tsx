/**
 * PageURLChecker - Diagnostic Tool
 *
 * Add this component to any page in Framer to see the current URL structure.
 * This helps you find the correct URLs for navigation/redirects.
 */

export default function PageURLChecker() {
    const currentURL = typeof window !== 'undefined' ? window.location.href : 'N/A'
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : 'N/A'
    const origin = typeof window !== 'undefined' ? window.location.origin : 'N/A'
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'N/A'

    // Check if logged in
    const hasToken = typeof window !== 'undefined'
        ? localStorage.getItem('masheleng_token') !== null
        : false

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>🔍 Page URL Checker</h2>
                <p style={styles.description}>
                    This component shows you the current page's URL structure.
                    Use this to find the correct paths for your navigation links.
                </p>

                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <div style={styles.label}>Current Full URL:</div>
                        <div style={styles.value}>{currentURL}</div>
                    </div>

                    <div style={styles.infoItem}>
                        <div style={styles.label}>Path (use this for links):</div>
                        <div style={{...styles.value, ...styles.highlight}}>{currentPath}</div>
                    </div>

                    <div style={styles.infoItem}>
                        <div style={styles.label}>Origin:</div>
                        <div style={styles.value}>{origin}</div>
                    </div>

                    <div style={styles.infoItem}>
                        <div style={styles.label}>Hostname:</div>
                        <div style={styles.value}>{hostname}</div>
                    </div>

                    <div style={styles.infoItem}>
                        <div style={styles.label}>Login Status:</div>
                        <div style={styles.value}>
                            {hasToken ? '✅ Logged in (token found)' : '❌ Not logged in'}
                        </div>
                    </div>
                </div>

                <div style={styles.instructions}>
                    <h3 style={styles.instructionsTitle}>📝 How to use this:</h3>
                    <ol style={styles.list}>
                        <li>Add this component to each of your pages (temporarily)</li>
                        <li>Preview each page and note the <strong>Path</strong> value</li>
                        <li>Update your navigation links to use these exact paths</li>
                        <li>Remove this component when done</li>
                    </ol>
                </div>

                <div style={styles.exampleSection}>
                    <h3 style={styles.instructionsTitle}>💡 Example:</h3>
                    <div style={styles.example}>
                        <p>If this page shows:</p>
                        <code style={styles.code}>Path: /student-dashboard</code>
                        <p style={styles.exampleText}>Then use this in your login redirect:</p>
                        <code style={styles.code}>window.location.href = "/student-dashboard"</code>
                    </div>
                </div>

                <div style={styles.testLinks}>
                    <h3 style={styles.instructionsTitle}>🔗 Test These Links:</h3>
                    <p style={styles.testNote}>Click these to see if they work. If they 404, the page doesn't exist or has a different path.</p>
                    <div style={styles.linkGrid}>
                        <a href="/dashboard" style={styles.testLink}>
                            /dashboard
                        </a>
                        <a href="/account" style={styles.testLink}>
                            /account
                        </a>
                        <a href="/student-dashboard" style={styles.testLink}>
                            /student-dashboard
                        </a>
                        <a href="/profile" style={styles.testLink}>
                            /profile
                        </a>
                        <a href="/courses" style={styles.testLink}>
                            /courses
                        </a>
                        <a href="/login" style={styles.testLink}>
                            /login
                        </a>
                        <a href="/register" style={styles.testLink}>
                            /register
                        </a>
                        <a href="/pricing" style={styles.testLink}>
                            /pricing
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: "12px",
        marginTop: "0",
    },
    description: {
        fontSize: "16px",
        color: "#666",
        marginBottom: "32px",
        lineHeight: "1.6",
    },
    infoGrid: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "32px",
    },
    infoItem: {
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
    },
    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#666",
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    value: {
        fontSize: "15px",
        color: "#1a1a1a",
        fontFamily: "monospace",
        wordBreak: "break-all",
        padding: "8px 12px",
        backgroundColor: "#fff",
        borderRadius: "6px",
    },
    highlight: {
        backgroundColor: "#fff3cd",
        fontWeight: "600",
        color: "#856404",
    },
    instructions: {
        marginTop: "32px",
        padding: "24px",
        backgroundColor: "#e7f3ff",
        borderRadius: "8px",
        border: "1px solid #b3d9ff",
    },
    instructionsTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: "0",
        marginBottom: "16px",
    },
    list: {
        margin: "0",
        paddingLeft: "24px",
        fontSize: "15px",
        color: "#333",
        lineHeight: "1.8",
    },
    exampleSection: {
        marginTop: "24px",
        padding: "24px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
    },
    example: {
        fontSize: "14px",
        color: "#333",
        lineHeight: "1.8",
    },
    exampleText: {
        margin: "12px 0",
    },
    code: {
        display: "block",
        padding: "12px 16px",
        backgroundColor: "#1a1a1a",
        color: "#22C55E",
        borderRadius: "6px",
        fontFamily: "monospace",
        fontSize: "14px",
        margin: "8px 0",
    },
    testLinks: {
        marginTop: "32px",
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "2px dashed #e9ecef",
    },
    testNote: {
        fontSize: "14px",
        color: "#666",
        marginBottom: "16px",
        fontStyle: "italic",
    },
    linkGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "12px",
    },
    testLink: {
        display: "block",
        padding: "12px 16px",
        backgroundColor: "#0066FF",
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        textAlign: "center",
        transition: "background-color 0.2s",
    },
}
