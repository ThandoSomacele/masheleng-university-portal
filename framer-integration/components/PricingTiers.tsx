import { useState, useEffect } from "react"
import { MashelengAPI } from "../api_client"
import { API_URL } from "../config"

/**
 * PricingTiers - Matches Masheleng Design System
 * Based on design: Screenshot 2025-12-17 at 20.32.01.png
 */

export default function PricingTiers() {
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [billingCycle, setBillingCycle] = useState("monthly")

    useEffect(() => {
        loadTiers()
    }, [])

    const loadTiers = async () => {
        try {
            const api = new MashelengAPI(API_URL)
            const data = await api.getSubscriptionTiers()
            setTiers(data)
            setLoading(false)
        } catch (err) {
            console.error("Failed to load tiers:", err)
            setError(err.message)
            setLoading(false)
        }
    }

    const handleSubscribe = async (tierId) => {
        try {
            const api = new MashelengAPI(API_URL)
            const token = localStorage.getItem("masheleng_token")

            if (!token) {
                window.location.href = "/login"
                return
            }

            await api.subscribe({ tier_id: tierId })
            alert("Subscription successful! Redirecting to dashboard...")
            window.location.href = "/dashboard"

        } catch (err) {
            console.error("Subscription failed:", err)
            alert(`Subscription failed: ${err.message}`)
        }
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading pricing...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <h2>Error Loading Pricing</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Get All Access Pass Today!</h1>
                <p style={styles.subtitle}>
                    Choose the plan that's right for you and start learning today.
                </p>

                {/* Billing Toggle */}
                <div style={styles.billingToggle}>
                    <span style={styles.toggleLabel}>
                        Save 50% when billed yearly!
                    </span>
                    <div style={styles.toggleButtons}>
                        <button
                            style={{
                                ...styles.toggleButton,
                                ...(billingCycle === "monthly" && styles.toggleButtonActive),
                            }}
                            onClick={() => setBillingCycle("monthly")}
                        >
                            Monthly
                        </button>
                        <button
                            style={{
                                ...styles.toggleButton,
                                ...(billingCycle === "yearly" && styles.toggleButtonActive),
                            }}
                            onClick={() => setBillingCycle("yearly")}
                        >
                            Yearly
                        </button>
                    </div>
                    <span style={styles.toggleBadge}>
                        💰 Billed Monthly
                    </span>
                </div>
            </div>

            {/* Pricing Grid */}
            <div style={styles.grid}>
                {tiers.map((tier, index) => (
                    <PricingCard
                        key={tier.id}
                        tier={tier}
                        isPopular={index === 1}
                        onSubscribe={handleSubscribe}
                    />
                ))}
            </div>
        </div>
    )
}

function PricingCard({ tier, isPopular, onSubscribe }) {
    // Format price
    const formatPrice = (price) => {
        return `R${parseFloat(price || 0).toFixed(0)}`
    }

    // Get tier label
    const getTierLabel = (name) => {
        if (name?.toLowerCase().includes("basic")) return "BASIC"
        if (name?.toLowerCase().includes("pro")) return "PRO"
        if (name?.toLowerCase().includes("premium")) return "PREMIUM"
        return name?.toUpperCase() || "PLAN"
    }

    // Default features if not provided
    const defaultFeatures = [
        "Access All Courses",
        "Unlimited Access",
        "Access Future Courses",
        "Low Priority Support",
        "Access Courses Early",
        "Join Members-only Classes",
    ]

    const features = tier.features || defaultFeatures

    return (
        <div style={{
            ...styles.card,
            ...(isPopular && styles.cardPopular),
        }}>
            {isPopular && (
                <div style={styles.popularBadge}>
                    MOST POPULAR
                </div>
            )}

            {/* Header */}
            <div style={styles.cardHeader}>
                <div style={styles.tierLabel}>
                    {getTierLabel(tier.name)}
                </div>
                <div style={styles.priceSection}>
                    <span style={styles.price}>
                        {formatPrice(tier.monthly_price)}
                    </span>
                    <span style={styles.pricePeriod}> / month</span>
                </div>
                <p style={styles.tierDescription}>
                    {tier.description || "Basic Plan gives you access to our current & future courses, on a monthly basis."}
                </p>
            </div>

            {/* Features */}
            <div style={styles.featureList}>
                {features.map((feature, index) => (
                    <div key={index} style={styles.featureItem}>
                        <span style={styles.checkmark}>✓</span>
                        <span style={styles.featureText}>{feature}</span>
                    </div>
                ))}
            </div>

            {/* CTA Button */}
            <button
                style={{
                    ...styles.ctaButton,
                    ...(isPopular && styles.ctaButtonPopular),
                }}
                onClick={() => onSubscribe(tier.id)}
            >
                Start Now
            </button>
        </div>
    )
}

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 20px",
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
    },
    header: {
        textAlign: "center",
        marginBottom: "60px",
    },
    title: {
        fontSize: "40px",
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: "16px",
        marginTop: "0",
        lineHeight: "1.2",
    },
    subtitle: {
        fontSize: "18px",
        color: "#999999",
        marginBottom: "40px",
        marginTop: "0",
        lineHeight: "1.5",
    },
    billingToggle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
    },
    toggleLabel: {
        fontSize: "14px",
        color: "#999999",
    },
    toggleButtons: {
        display: "flex",
        gap: "8px",
        backgroundColor: "#1A1A1A",
        padding: "4px",
        borderRadius: "8px",
        border: "1px solid #333333",
    },
    toggleButton: {
        backgroundColor: "transparent",
        color: "#999999",
        padding: "8px 20px",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    toggleButtonActive: {
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
    },
    toggleBadge: {
        fontSize: "14px",
        color: "#FFFFFF",
        backgroundColor: "#1A1A1A",
        padding: "8px 16px",
        borderRadius: "20px",
        border: "1px solid #333333",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
    },
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: "12px",
        padding: "32px 24px",
        border: "1px solid #333333",
        position: "relative",
        transition: "all 0.2s ease",
    },
    cardPopular: {
        border: "2px solid #0066FF",
        transform: "scale(1.05)",
    },
    popularBadge: {
        position: "absolute",
        top: "-12px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        padding: "4px 16px",
        fontSize: "11px",
        fontWeight: "700",
        borderRadius: "12px",
        letterSpacing: "0.5px",
    },
    cardHeader: {
        textAlign: "center",
        marginBottom: "32px",
        paddingBottom: "24px",
        borderBottom: "1px solid #333333",
    },
    tierLabel: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#999999",
        marginBottom: "16px",
        letterSpacing: "1px",
    },
    priceSection: {
        marginBottom: "16px",
    },
    price: {
        fontSize: "40px",
        fontWeight: "700",
        color: "#FFFFFF",
    },
    pricePeriod: {
        fontSize: "16px",
        color: "#999999",
    },
    tierDescription: {
        fontSize: "14px",
        color: "#999999",
        lineHeight: "1.6",
        marginTop: "0",
        marginBottom: "0",
    },
    featureList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "32px",
    },
    featureItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    checkmark: {
        color: "#22C55E",
        fontSize: "16px",
        fontWeight: "700",
    },
    featureText: {
        fontSize: "14px",
        color: "#FFFFFF",
    },
    ctaButton: {
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        padding: "14px 24px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "none",
        width: "100%",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    },
    ctaButtonPopular: {
        backgroundColor: "#0052CC",
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
}
