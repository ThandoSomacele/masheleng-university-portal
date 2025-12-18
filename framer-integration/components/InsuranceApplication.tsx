import { useState } from 'react';
import { MashelengAPI } from '../api-client.js';
import { API_URL } from '../config.js';

/**
 * InsuranceActivation - Matches Masheleng Design System
 * Activates automatic funeral cover for students
 */

export default function InsuranceActivation() {
  const [formData, setFormData] = useState({
    type: 'funeral',
    coverageAmount: 50000,
    premium: 250,
    beneficiaries: [{ name: '', relationship: '', percentage: 100 }],
    acknowledgeHealth: false,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [policyId, setPolicyId] = useState('');

  const MAX_BENEFICIARIES = 4;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('beneficiary_')) {
      const [_, index, field] = name.split('_');
      const newBeneficiaries = [...formData.beneficiaries];
      newBeneficiaries[index] = {
        ...newBeneficiaries[index],
        [field]: field === 'percentage' ? parseInt(value) || 0 : value,
      };
      setFormData({ ...formData, beneficiaries: newBeneficiaries });
    } else if (name === 'acknowledgeHealth') {
      setFormData({
        ...formData,
        acknowledgeHealth: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const addBeneficiary = () => {
    if (formData.beneficiaries.length < MAX_BENEFICIARIES) {
      setFormData({
        ...formData,
        beneficiaries: [...formData.beneficiaries, { name: '', relationship: '', percentage: 0 }],
      });
    }
  };

  const removeBeneficiary = index => {
    const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
    setFormData({ ...formData, beneficiaries: newBeneficiaries });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validate beneficiaries percentages total 100
    const totalPercentage = formData.beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
    if (totalPercentage !== 100) {
      setError('Beneficiary percentages must total 100%');
      return;
    }

    setLoading(true);

    try {
      const api = new MashelengAPI(API_URL);
      const token = localStorage.getItem('masheleng_token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await api.createInsurancePolicy(formData);
      console.log('✅ Insurance application submitted:', response);
      setPolicyId(response.id);
      setSuccess(true);
    } catch (err) {
      console.error('❌ Application failed:', err);
      setError(err.message || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.card}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.successTitle}>Funeral Cover Activated!</h2>
        <p style={styles.successText}>
          Your funeral cover has been activated successfully. You and your beneficiaries are now covered.
        </p>
        <div style={styles.policyInfo}>
          <strong>Policy ID:</strong> {policyId}
        </div>
        <div style={styles.successActions}>
          <a href='/dashboard' style={styles.primaryButton}>
            Go to Dashboard
          </a>
          <a href='/insurance/policies' style={styles.secondaryButton}>
            View My Policies
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* Error Message */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Coverage Info - Read Only */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Your Funeral Cover</h3>
          <div style={styles.coverageInfoBox}>
            <div style={styles.coverageItem}>
              <span style={styles.coverageLabel}>Coverage Amount</span>
              <span style={styles.coverageValue}>P{formData.coverageAmount.toLocaleString()}</span>
            </div>
            <div style={styles.coverageItem}>
              <span style={styles.coverageLabel}>Monthly Premium</span>
              <span style={styles.coverageValue}>P{formData.premium}</span>
            </div>
            <div style={styles.coverageItem}>
              <span style={styles.coverageLabel}>Insurance Type</span>
              <span style={styles.coverageValue}>Funeral Cover</span>
            </div>
          </div>
          <p style={styles.coverageNote}>
            This funeral cover is automatically included with your student account at no additional cost.
          </p>
        </div>

        {/* Beneficiaries Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              Beneficiaries ({formData.beneficiaries.length}/{MAX_BENEFICIARIES})
            </h3>
            <button
              type='button'
              onClick={addBeneficiary}
              style={{
                ...styles.addButton,
                ...(formData.beneficiaries.length >= MAX_BENEFICIARIES && styles.addButtonDisabled),
              }}
              disabled={loading || formData.beneficiaries.length >= MAX_BENEFICIARIES}>
              + Add Beneficiary
            </button>
          </div>

          {formData.beneficiaries.map((beneficiary, index) => (
            <div key={index} style={styles.beneficiaryCard}>
              <div style={styles.beneficiaryHeader}>
                <h4 style={styles.beneficiaryTitle}>Beneficiary {index + 1}</h4>
                {formData.beneficiaries.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeBeneficiary(index)}
                    style={styles.removeButton}
                    disabled={loading}>
                    Remove
                  </button>
                )}
              </div>
              <div style={styles.beneficiaryFields}>
                <input
                  type='text'
                  name={`beneficiary_${index}_name`}
                  value={beneficiary.name}
                  onChange={handleChange}
                  placeholder='Full Name'
                  required
                  disabled={loading}
                  style={styles.input}
                />
                <div style={styles.beneficiaryRow}>
                  <input
                    type='text'
                    name={`beneficiary_${index}_relationship`}
                    value={beneficiary.relationship}
                    onChange={handleChange}
                    placeholder='Relationship'
                    required
                    disabled={loading}
                    style={styles.input}
                  />
                  <input
                    type='number'
                    name={`beneficiary_${index}_percentage`}
                    value={beneficiary.percentage}
                    onChange={handleChange}
                    placeholder='%'
                    required
                    disabled={loading}
                    min='0'
                    max='100'
                    style={{ ...styles.input, maxWidth: '100px' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Health Acknowledgment Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Health Acknowledgment</h3>

          <div style={styles.checkboxField}>
            <input
              type='checkbox'
              id='acknowledgeHealth'
              name='acknowledgeHealth'
              checked={formData.acknowledgeHealth}
              onChange={handleChange}
              disabled={loading}
              required
              style={styles.checkbox}
            />
            <label htmlFor='acknowledgeHealth' style={styles.checkboxLabel}>
              I acknowledge that I am in good health and understand the terms of this funeral cover policy.
            </label>
          </div>
        </div>

        {/* Additional Notes */}
        <div style={styles.section}>
          <div style={styles.field}>
            <label style={styles.label}>Additional Notes (Optional)</label>
            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              placeholder='Any additional information...'
              disabled={loading}
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={loading}
          style={{
            ...styles.submitButton,
            ...(loading && styles.submitButtonDisabled),
          }}>
          {loading ? 'Activating Cover...' : 'Activate Funeral Cover'}
        </button>

        <p style={styles.disclaimer}>
          By activating this cover, you agree to our terms and conditions. Your funeral cover will be active immediately upon submission.
        </p>
      </form>
    </div>
  );
}

const styles = {
  card: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '32px 20px',
    border: '1px solid #333333',
  } as React.CSSProperties,
  errorBox: {
    backgroundColor: '#FEE',
    color: '#C33',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '1px solid #FCC',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  },
  coverageInfoBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  coverageItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  coverageLabel: {
    fontSize: '14px',
    color: '#999999',
    fontWeight: '600' as const,
  },
  coverageValue: {
    fontSize: '18px',
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  coverageNote: {
    fontSize: '13px',
    color: '#22C55E',
    marginTop: '12px',
    marginBottom: '0',
    lineHeight: '1.6',
  },
  section: {
    paddingBottom: '24px',
    borderBottom: '1px solid #333333',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: '0',
    marginBottom: '16px',
  },
  field: {
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  beneficiaryFields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  beneficiaryRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#999999',
    marginBottom: '8px',
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #404040',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #404040',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  textarea: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #404040',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    minHeight: '100px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  checkboxField: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    marginTop: '2px',
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: '15px',
    color: '#FFFFFF',
    cursor: 'pointer',
    lineHeight: '1.6',
  },
  beneficiaryCard: {
    backgroundColor: '#2A2A2A',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  beneficiaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  beneficiaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    margin: '0',
  },
  addButton: {
    backgroundColor: 'transparent',
    color: '#0066FF',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '8px',
    border: '1px solid #0066FF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  addButtonDisabled: {
    backgroundColor: 'transparent',
    color: '#4D4D4D',
    border: '1px solid #4D4D4D',
    cursor: 'not-allowed',
  },
  removeButton: {
    backgroundColor: 'transparent',
    color: '#EF4444',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
  },
  submitButtonDisabled: {
    backgroundColor: '#4D4D4D',
    cursor: 'not-allowed',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#999999',
    textAlign: 'center' as const,
    marginTop: '8px',
    lineHeight: '1.6',
    marginBottom: '0',
  },
  // Success screen
  successIcon: {
    fontSize: '64px',
    color: '#22C55E',
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: '12px',
    marginTop: '0',
  },
  successText: {
    fontSize: '16px',
    color: '#999999',
    textAlign: 'center' as const,
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  policyInfo: {
    backgroundColor: '#2A2A2A',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  successActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  primaryButton: {
    display: 'block',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600' as const,
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    display: 'block',
    backgroundColor: 'transparent',
    color: '#0066FF',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600' as const,
    borderRadius: '8px',
    border: '1px solid #0066FF',
    textDecoration: 'none',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
  },
};
