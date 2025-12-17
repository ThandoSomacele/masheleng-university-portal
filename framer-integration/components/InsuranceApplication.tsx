import { useState } from "react"
import { MashelengAPI } from "../api_client"
import { API_URL } from "../config"

/**
 * InsuranceApplication - Matches Masheleng Design System
 * Allows students to apply for education insurance coverage
 */

export default function InsuranceApplication() {
    const [formData, setFormData] = useState({
        type: "education",
        coverageAmount: 50000,
        premium: 250,
        beneficiaries: [
            { name: "", relationship: "", percentage: 100 }
        ],
        medicalInfo: {
            hasPreExistingConditions: false,
            conditions: [],
            medications: [],
        },
        notes: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [policyId, setPolicyId] = useState("")

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (name.startsWith("beneficiary_")) {
            const [_, index, field] = name.split("_")
            const newBeneficiaries = [...formData.beneficiaries]
            newBeneficiaries[index] = {
                ...newBeneficiaries[index],
                [field]: field === "percentage" ? parseInt(value) || 0 : value,
            }
            setFormData({ ...formData, beneficiaries: newBeneficiaries })
        } else if (name === "hasPreExistingConditions") {
            setFormData({
                ...formData,
                medicalInfo: {
                    ...formData.medicalInfo,
                    hasPreExistingConditions: checked,
                },
            })
        } else {
            setFormData({
                ...formData,
                [name]: type === "number" ? parseFloat(value) || 0 : value,
            })
        }
    }

    const addBeneficiary = () => {
        setFormData({
            ...formData,
            beneficiaries: [
                ...formData.beneficiaries,
                { name: "", relationship: "", percentage: 0 },
            ],
        })
    }

    const removeBeneficiary = (index) => {
        const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index)
        setFormData({ ...formData, beneficiaries: newBeneficiaries })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        // Validate beneficiaries percentages total 100
        const totalPercentage = formData.beneficiaries.reduce(
            (sum, b) => sum + (b.percentage || 0),
            0
        )
        if (totalPercentage !== 100) {
            setError("Beneficiary percentages must total 100%")
            return
        }

        setLoading(true)

        try {
            const api = new MashelengAPI(API_URL)
            const token = localStorage.getItem("masheleng_token")

            if (!token) {
                window.location.href = "/login"
                return
            }

            const response = await api.createInsurancePolicy(formData)
            console.log("✅ Insurance application submitted:", response)
            setPolicyId(response.id)
            setSuccess(true)

        } catch (err) {
            console.error("❌ Application failed:", err)
            setError(err.message || "Application failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={styles.successTitle}>Application Submitted!</h2>
                    <p style={styles.successText}>
                        Your insurance application has been submitted for review.
                        You will be notified once it's been processed.
                    </p>
                    <div style={styles.policyInfo}>
                        <strong>Application ID:</strong> {policyId}
                    </div>
                    <div style={styles.successActions}>
                        <a href="/dashboard" style={styles.primaryButton}>
                            Go to Dashboard
                        </a>
                        <a href="/insurance/policies" style={styles.secondaryButton}>
                            View My Policies
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Education Insurance Application</h1>
                    <p style={styles.subtitle}>
                        Protect your education investment with comprehensive coverage
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Coverage Section */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Coverage Details</h3>

                        <div style={styles.field}>
                            <label style={styles.label}>Insurance Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                disabled={loading}
                                style={styles.select}
                            >
                                <option value="education">Education Insurance</option>
                                <option value="life">Life Insurance</option>
                                <option value="health">Health Insurance</option>
                                <option value="disability">Disability Insurance</option>
                            </select>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Coverage Amount (BWP)</label>
                                <input
                                    type="number"
                                    name="coverageAmount"
                                    value={formData.coverageAmount}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    min="10000"
                                    step="1000"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Monthly Premium (BWP)</label>
                                <input
                                    type="number"
                                    name="premium"
                                    value={formData.premium}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    min="100"
                                    step="10"
                                    style={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Beneficiaries Section */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h3 style={styles.sectionTitle}>Beneficiaries</h3>
                            <button
                                type="button"
                                onClick={addBeneficiary}
                                style={styles.addButton}
                                disabled={loading}
                            >
                                + Add Beneficiary
                            </button>
                        </div>

                        {formData.beneficiaries.map((beneficiary, index) => (
                            <div key={index} style={styles.beneficiaryCard}>
                                <div style={styles.beneficiaryHeader}>
                                    <h4 style={styles.beneficiaryTitle}>Beneficiary {index + 1}</h4>
                                    {formData.beneficiaries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeBeneficiary(index)}
                                            style={styles.removeButton}
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div style={styles.row}>
                                    <input
                                        type="text"
                                        name={`beneficiary_${index}_name`}
                                        value={beneficiary.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        required
                                        disabled={loading}
                                        style={{...styles.input, flex: 2}}
                                    />
                                    <input
                                        type="text"
                                        name={`beneficiary_${index}_relationship`}
                                        value={beneficiary.relationship}
                                        onChange={handleChange}
                                        placeholder="Relationship"
                                        required
                                        disabled={loading}
                                        style={{...styles.input, flex: 1}}
                                    />
                                    <input
                                        type="number"
                                        name={`beneficiary_${index}_percentage`}
                                        value={beneficiary.percentage}
                                        onChange={handleChange}
                                        placeholder="%"
                                        required
                                        disabled={loading}
                                        min="0"
                                        max="100"
                                        style={{...styles.input, flex: 0.5}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Medical Information Section */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Medical Information</h3>

                        <div style={styles.checkboxField}>
                            <input
                                type="checkbox"
                                id="hasPreExistingConditions"
                                name="hasPreExistingConditions"
                                checked={formData.medicalInfo.hasPreExistingConditions}
                                onChange={handleChange}
                                disabled={loading}
                                style={styles.checkbox}
                            />
                            <label htmlFor="hasPreExistingConditions" style={styles.checkboxLabel}>
                                I have pre-existing medical conditions
                            </label>
                        </div>

                        {formData.medicalInfo.hasPreExistingConditions && (
                            <div style={styles.field}>
                                <label style={styles.label}>
                                    Please describe your conditions (optional)
                                </label>
                                <textarea
                                    name="conditions"
                                    placeholder="List any pre-existing conditions..."
                                    disabled={loading}
                                    style={styles.textarea}
                                />
                            </div>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div style={styles.section}>
                        <div style={styles.field}>
                            <label style={styles.label}>Additional Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional information..."
                                disabled={loading}
                                style={styles.textarea}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitButton,
                            ...(loading && styles.submitButtonDisabled),
                        }}
                    >
                        {loading ? "Submitting Application..." : "Submit Application"}
                    </button>

                    <p style={styles.disclaimer}>
                        By submitting this application, you agree to our terms and conditions.
                        Your application will be reviewed by our underwriters within 2-3 business days.
                    </p>
                </form>
            </div>
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#0A0A0A",
    },
    card: {
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#1A1A1A",
        borderRadius: "12px",
        padding: "40px",
        border: "1px solid #333333",
    },
    header: {
        marginBottom: "32px",
        textAlign: "center",
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: "12px",
        marginTop: "0",
    },
    subtitle: {
        fontSize: "16px",
        color: "#999999",
        marginTop: "0",
    },
    errorBox: {
        backgroundColor: "#FEE",
        color: "#C33",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "24px",
        fontSize: "14px",
        border: "1px solid #FCC",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "32px",
    },
    section: {
        paddingBottom: "24px",
        borderBottom: "1px solid #333333",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: "0",
        marginBottom: "16px",
    },
    field: {
        marginBottom: "16px",
    },
    row: {
        display: "flex",
        gap: "12px",
    },
    label: {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#999999",
        marginBottom: "8px",
    },
    input: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        padding: "12px 16px",
        fontSize: "16px",
        border: "1px solid #404040",
        borderRadius: "8px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
    },
    select: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        padding: "12px 16px",
        fontSize: "16px",
        border: "1px solid #404040",
        borderRadius: "8px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
    },
    textarea: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        padding: "12px 16px",
        fontSize: "16px",
        border: "1px solid #404040",
        borderRadius: "8px",
        outline: "none",
        width: "100%",
        minHeight: "100px",
        boxSizing: "border-box",
        fontFamily: "inherit",
        resize: "vertical",
    },
    checkboxField: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
    },
    checkbox: {
        width: "20px",
        height: "20px",
        cursor: "pointer",
    },
    checkboxLabel: {
        fontSize: "16px",
        color: "#FFFFFF",
        cursor: "pointer",
    },
    beneficiaryCard: {
        backgroundColor: "#2A2A2A",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
    },
    beneficiaryHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    beneficiaryTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#FFFFFF",
        margin: "0",
    },
    addButton: {
        backgroundColor: "transparent",
        color: "#0066FF",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "1px solid #0066FF",
        cursor: "pointer",
    },
    removeButton: {
        backgroundColor: "transparent",
        color: "#EF4444",
        padding: "6px 12px",
        fontSize: "13px",
        fontWeight: "600",
        border: "none",
        cursor: "pointer",
    },
    submitButton: {
        backgroundColor: "#0066FF",
        color: "#FFFFFF",
        padding: "16px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        marginTop: "8px",
    },
    submitButtonDisabled: {
        backgroundColor: "#4D4D4D",
        cursor: "not-allowed",
    },
    disclaimer: {
        fontSize: "12px",
        color: "#999999",
        textAlign: "center",
        marginTop: "8px",
        lineHeight: "1.6",
    },
    // Success screen
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
        marginBottom: "24px",
        lineHeight: "1.6",
    },
    policyInfo: {
        backgroundColor: "#2A2A2A",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px",
        fontSize: "14px",
        color: "#FFFFFF",
        textAlign: "center",
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
    },
}
