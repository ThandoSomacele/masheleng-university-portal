import React, { useState } from 'react';
import { MashelengAPI } from '../api_client';

/**
 * Payment Form Component
 *
 * Handles payment submission for subscriptions
 * Supports different payment methods with appropriate form fields
 *
 * Usage in Framer:
 * <PaymentForm
 *   subscriptionId="uuid-here"
 *   amount={150}
 *   currency="BWP"
 *   paymentMethod="card"
 *   onSuccess={(payment) => console.log(payment)}
 *   onError={(error) => console.log(error)}
 * />
 */

const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';

interface PaymentFormProps {
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({
  subscriptionId,
  amount,
  currency,
  paymentMethod,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    bankName: '',
    mobileNumber: '',
    mobileProvider: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const api = new MashelengAPI(API_URL);

      // Prepare payment data based on method
      const paymentData: any = {
        subscription_id: subscriptionId,
        amount,
        currency,
        payment_method: paymentMethod,
      };

      // Add method-specific notes
      if (paymentMethod === 'card') {
        paymentData.notes = `Card payment: ${formData.cardName} - ${formData.cardNumber.slice(-4)}`;
      } else if (paymentMethod === 'bank_transfer') {
        paymentData.notes = `Bank Transfer: ${formData.bankName} - Account ${formData.accountNumber}`;
      } else if (paymentMethod === 'mobile_money') {
        paymentData.notes = `Mobile Money: ${formData.mobileProvider} - ${formData.mobileNumber}`;
      } else {
        paymentData.notes = formData.notes;
      }

      const payment = await api.createPayment(paymentData);

      if (onSuccess) {
        onSuccess(payment);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Payment failed. Please try again.';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCardForm = () => (
    <>
      <div style={styles.formGroup}>
        <label style={styles.label}>Card Number</label>
        <input
          type="text"
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={(e) =>
            handleInputChange('cardNumber', formatCardNumber(e.target.value))
          }
          maxLength={19}
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Cardholder Name</label>
        <input
          type="text"
          style={styles.input}
          placeholder="JOHN DOE"
          value={formData.cardName}
          onChange={(e) =>
            handleInputChange('cardName', e.target.value.toUpperCase())
          }
          required
        />
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Expiry Date</label>
          <input
            type="text"
            style={styles.input}
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChange={(e) =>
              handleInputChange('expiryDate', formatExpiryDate(e.target.value))
            }
            maxLength={5}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>CVV</label>
          <input
            type="text"
            style={styles.input}
            placeholder="123"
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            maxLength={4}
            required
          />
        </div>
      </div>
    </>
  );

  const renderBankForm = () => (
    <>
      <div style={styles.formGroup}>
        <label style={styles.label}>Bank Name</label>
        <input
          type="text"
          style={styles.input}
          placeholder="First National Bank"
          value={formData.bankName}
          onChange={(e) => handleInputChange('bankName', e.target.value)}
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Account Number</label>
        <input
          type="text"
          style={styles.input}
          placeholder="1234567890"
          value={formData.accountNumber}
          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
          required
        />
      </div>

      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>Bank Transfer Instructions:</strong><br />
          1. Transfer {currency} {amount.toFixed(2)} to our account<br />
          2. Use your subscription ID as reference: {subscriptionId.slice(0, 8)}<br />
          3. Payment will be verified within 24 hours
        </p>
      </div>
    </>
  );

  const renderMobileMoneyForm = () => (
    <>
      <div style={styles.formGroup}>
        <label style={styles.label}>Mobile Provider</label>
        <select
          style={styles.input}
          value={formData.mobileProvider}
          onChange={(e) => handleInputChange('mobileProvider', e.target.value)}
          required
        >
          <option value="">Select Provider</option>
          <option value="Orange Money">Orange Money</option>
          <option value="MTN Mobile Money">MTN Mobile Money</option>
          <option value="Mascom MyZaka">Mascom MyZaka</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Mobile Number</label>
        <input
          type="tel"
          style={styles.input}
          placeholder="+267 7X XXX XXX"
          value={formData.mobileNumber}
          onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
          required
        />
      </div>

      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>Mobile Money Instructions:</strong><br />
          1. You will receive a payment prompt on your phone<br />
          2. Enter your PIN to authorize the payment<br />
          3. You will receive a confirmation SMS
        </p>
      </div>
    </>
  );

  const renderManualForm = () => (
    <>
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>Manual Payment Instructions:</strong><br />
          Visit any of our campus offices to make your payment in person. Please bring a copy of this payment reference: {subscriptionId.slice(0, 8)}
        </p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Additional Notes (Optional)</label>
        <textarea
          style={{ ...styles.input, minHeight: '100px', resize: 'vertical' as const }}
          placeholder="Any additional information..."
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>
    </>
  );

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.paymentSummary}>
        <h3 style={styles.summaryTitle}>Payment Summary</h3>
        <div style={styles.summaryRow}>
          <span>Amount:</span>
          <strong>
            {currency} {amount.toFixed(2)}
          </strong>
        </div>
        <div style={styles.summaryRow}>
          <span>Method:</span>
          <strong style={{ textTransform: 'capitalize' }}>
            {paymentMethod.replace('_', ' ')}
          </strong>
        </div>
      </div>

      {paymentMethod === 'card' && renderCardForm()}
      {paymentMethod === 'bank_transfer' && renderBankForm()}
      {paymentMethod === 'mobile_money' && renderMobileMoneyForm()}
      {paymentMethod === 'manual' && renderManualForm()}

      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.submitButton,
          ...(loading ? styles.submitButtonDisabled : {}),
        }}
      >
        {loading ? 'Processing...' : `Pay ${currency} ${amount.toFixed(2)}`}
      </button>

      <p style={styles.disclaimer}>
        By completing this payment, you agree to our terms and conditions.
        Your payment will be processed securely.
      </p>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  paymentSummary: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1a1a1a',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '16px',
    color: '#333',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box' as const,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196F3',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  infoText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#1565C0',
    margin: 0,
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '16px',
    lineHeight: '1.5',
  },
};
