import React from 'react';

/**
 * Payment Failed Component
 *
 * Displays error message and options after failed payment
 *
 * Usage in Framer:
 * <PaymentFailed
 *   errorMessage="Insufficient funds"
 *   paymentId="uuid-here"
 *   amount={150}
 *   currency="BWP"
 *   onRetry={() => console.log('Retry payment')}
 *   onContactSupport={() => console.log('Contact support')}
 * />
 */

interface PaymentFailedProps {
  errorMessage: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  onChangePlan?: () => void;
}

export default function PaymentFailed({
  errorMessage,
  paymentId,
  amount,
  currency,
  paymentMethod,
  onRetry,
  onContactSupport,
  onChangePlan,
}: PaymentFailedProps) {
  const getErrorSuggestion = (error: string) => {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('insufficient') || lowerError.includes('balance')) {
      return {
        title: 'Insufficient Funds',
        suggestion: 'Please ensure you have sufficient balance in your account and try again.',
        tips: [
          'Check your account balance',
          'Try a different payment method',
          'Contact your bank for assistance',
        ],
      };
    }

    if (lowerError.includes('expired') || lowerError.includes('expiry')) {
      return {
        title: 'Card Expired',
        suggestion: 'Your card has expired. Please use a different card.',
        tips: [
          'Use a different payment card',
          'Update your card details',
          'Try an alternative payment method',
        ],
      };
    }

    if (lowerError.includes('declined') || lowerError.includes('rejected')) {
      return {
        title: 'Payment Declined',
        suggestion: 'Your payment was declined by your bank or payment provider.',
        tips: [
          'Contact your bank to authorize the transaction',
          'Verify your card details are correct',
          'Try a different payment method',
        ],
      };
    }

    if (lowerError.includes('network') || lowerError.includes('timeout')) {
      return {
        title: 'Network Error',
        suggestion: 'There was a network issue during payment processing.',
        tips: [
          'Check your internet connection',
          'Try again in a few minutes',
          'Contact support if the issue persists',
        ],
      };
    }

    return {
      title: 'Payment Failed',
      suggestion: 'We could not process your payment. Please try again.',
      tips: [
        'Verify your payment details are correct',
        'Try a different payment method',
        'Contact our support team for assistance',
      ],
    };
  };

  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'N/A';
    return method
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const errorInfo = getErrorSuggestion(errorMessage);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Error Icon */}
        <div style={styles.iconContainer}>
          <div style={styles.errorIcon}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="40" fill="#F44336" />
              <path
                d="M30 30L50 50M50 30L30 50"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 style={styles.title}>{errorInfo.title}</h1>
        <p style={styles.subtitle}>{errorInfo.suggestion}</p>

        {/* Error Details */}
        {(amount || paymentId) && (
          <div style={styles.detailsCard}>
            <h3 style={styles.detailsTitle}>Transaction Details</h3>

            {amount && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount:</span>
                <span style={styles.detailValue}>
                  {currency} {amount.toFixed(2)}
                </span>
              </div>
            )}

            {paymentMethod && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Payment Method:</span>
                <span style={styles.detailValue}>
                  {formatPaymentMethod(paymentMethod)}
                </span>
              </div>
            )}

            {paymentId && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Transaction ID:</span>
                <span style={styles.detailValue}>{paymentId.slice(0, 16)}...</span>
              </div>
            )}

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Error:</span>
              <span style={styles.detailValueError}>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Suggestions Box */}
        <div style={styles.suggestionsBox}>
          <h4 style={styles.suggestionsTitle}>What you can do:</h4>
          <ul style={styles.suggestionsList}>
            {errorInfo.tips.map((tip, index) => (
              <li key={index} style={styles.suggestionItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          {onRetry && (
            <button style={styles.primaryButton} onClick={onRetry}>
              Try Again
            </button>
          )}

          {onChangePlan && (
            <button style={styles.secondaryButton} onClick={onChangePlan}>
              Change Payment Method
            </button>
          )}

          {onContactSupport && (
            <button style={styles.outlineButton} onClick={onContactSupport}>
              Contact Support
            </button>
          )}
        </div>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <p style={styles.helpText}>
            Need immediate assistance? Email us at{' '}
            <a href="mailto:support@masheleng.edu" style={styles.link}>
              support@masheleng.edu
            </a>{' '}
            or call +267 123 4567
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
  errorIcon: {
    animation: 'shake 0.5s ease-out',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#F44336',
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
  detailValueError: {
    color: '#F44336',
    fontWeight: '600',
  },
  suggestionsBox: {
    backgroundColor: '#E65100',
    border: '1px solid #FF9800',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '32px',
    textAlign: 'left' as const,
  },
  suggestionsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#E65100',
    marginBottom: '12px',
  },
  suggestionsList: {
    margin: 0,
    paddingLeft: '20px',
  },
  suggestionItem: {
    fontSize: '14px',
    color: '#E65100',
    marginBottom: '8px',
    lineHeight: '1.6',
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
    backgroundColor: '#F44336',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  secondaryButton: {
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#FF9800',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  outlineButton: {
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#A0A0A0',
    backgroundColor: 'transparent',
    border: '2px solid #666',
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
    lineHeight: '1.6',
  },
  link: {
    color: '#F44336',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
