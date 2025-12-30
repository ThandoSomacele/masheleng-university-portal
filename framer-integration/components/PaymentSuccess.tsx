import React from 'react';

/**
 * PaymentSuccess - Matches Masheleng Design System
 * Based on design: Dark theme with blue accent (#0066FF)
 *
 * Displays success message and payment details after successful payment
 *
 * Usage in Framer:
 * <PaymentSuccess
 *   paymentId="uuid-here"
 *   amount={150}
 *   currency="BWP"
 *   paymentMethod="card"
 *   onContinue={() => window.location.href = '/dashboard'}
 * />
 */

interface PaymentSuccessProps {
  paymentId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  transactionReference?: string;
  paidAt?: string;
  onContinue?: () => void;
  onViewReceipt?: () => void;
}

export default function PaymentSuccess({
  paymentId = 'preview-payment-id',
  amount = 150,
  currency = 'BWP',
  paymentMethod = 'card',
  transactionReference,
  paidAt,
  onContinue,
  onViewReceipt,
}: PaymentSuccessProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleString();
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentMethod = (method: string) => {
    return method
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Success Icon */}
        <div style={styles.iconContainer}>
          <div style={styles.successIcon}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="40" fill="#4CAF50" />
              <path
                d="M25 40L35 50L55 30"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.subtitle}>
          Thank you for your payment. Your transaction has been completed successfully.
        </p>

        {/* Payment Details */}
        <div style={styles.detailsCard}>
          <h3 style={styles.detailsTitle}>Payment Details</h3>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Amount Paid:</span>
            <span style={styles.detailValue}>
              {currency} {amount.toFixed(2)}
            </span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Payment Method:</span>
            <span style={styles.detailValue}>{formatPaymentMethod(paymentMethod)}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Transaction ID:</span>
            <span style={styles.detailValue}>{paymentId.slice(0, 16)}...</span>
          </div>

          {transactionReference && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Reference:</span>
              <span style={styles.detailValue}>{transactionReference}</span>
            </div>
          )}

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Date:</span>
            <span style={styles.detailValue}>{formatDate(paidAt)}</span>
          </div>
        </div>

        {/* Confirmation Notice */}
        <div style={styles.noticeBox}>
          <span style={styles.noticeIcon}>📧</span>
          <p style={styles.noticeText}>
            A confirmation email has been sent to your registered email address with the payment receipt.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          {onViewReceipt && (
            <button style={styles.secondaryButton} onClick={onViewReceipt}>
              Download Receipt
            </button>
          )}

          <button
            style={styles.primaryButton}
            onClick={onContinue || (() => (window.location.href = '/dashboard'))}
          >
            Continue to Dashboard
          </button>
        </div>

        {/* Additional Info */}
        <div style={styles.helpSection}>
          <p style={styles.helpText}>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@masheleng.edu" style={styles.link}>
              support@masheleng.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    padding: '20px',
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: '#252525',
    borderRadius: '16px',
    padding: '48px 32px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    textAlign: 'center' as const,
  },
  iconContainer: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'center',
  },
  successIcon: {
    animation: 'scaleIn 0.5s ease-out',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#A0A0A0',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  detailsCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'left' as const,
  },
  detailsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #333333',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '15px',
  },
  detailLabel: {
    color: '#A0A0A0',
    fontWeight: '500',
  },
  detailValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noticeBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#1B5E20',
    border: '1px solid #4CAF50',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '32px',
  },
  noticeIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  noticeText: {
    fontSize: '14px',
    color: '#2E7D32',
    margin: 0,
    lineHeight: '1.6',
    textAlign: 'left' as const,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '24px',
  },
  primaryButton: {
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  secondaryButton: {
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: 'transparent',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  helpSection: {
    paddingTop: '20px',
    borderTop: '1px solid #333333',
  },
  helpText: {
    fontSize: '14px',
    color: '#A0A0A0',
    margin: 0,
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
