import React, { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentForm from './PaymentForm';
import PaymentSuccess from './PaymentSuccess';
import PaymentFailed from './PaymentFailed';

/**
 * Payment Workflow Component
 *
 * Complete payment flow orchestrator
 * Handles: Method Selection → Payment Form → Success/Failed
 *
 * Usage in Framer:
 * <PaymentWorkflow
 *   subscriptionId="uuid-here"
 *   amount={150}
 *   currency="BWP"
 *   tierName="Entry Tier"
 *   onComplete={() => console.log('Payment complete')}
 * />
 */

interface PaymentWorkflowProps {
  subscriptionId: string;
  amount: number;
  currency: string;
  tierName?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

type PaymentStep = 'method' | 'form' | 'success' | 'failed';

export default function PaymentWorkflow({
  subscriptionId,
  amount,
  currency,
  tierName,
  onComplete,
  onCancel,
}: PaymentWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleContinueToPayment = () => {
    setCurrentStep('form');
  };

  const handlePaymentSuccess = (payment: any) => {
    setPaymentResult(payment);
    setCurrentStep('success');
  };

  const handlePaymentError = (error: string) => {
    setErrorMessage(error);
    setCurrentStep('failed');
  };

  const handleRetryPayment = () => {
    setCurrentStep('method');
    setErrorMessage('');
  };

  const handleChangeMethod = () => {
    setCurrentStep('method');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@masheleng.edu?subject=Payment Issue';
  };

  const handleCompletionContinue = () => {
    if (onComplete) {
      onComplete();
    } else {
      window.location.href = '/dashboard';
    }
  };

  // Progress Bar Component
  const ProgressBar = () => {
    const steps = [
      { id: 'method', label: 'Payment Method' },
      { id: 'form', label: 'Payment Details' },
      { id: 'success', label: 'Confirmation' },
    ];

    const getCurrentStepIndex = () => {
      if (currentStep === 'success' || currentStep === 'failed') return 2;
      if (currentStep === 'form') return 1;
      return 0;
    };

    const currentIndex = getCurrentStepIndex();

    return (
      <div style={styles.progressContainer}>
        {steps.map((step, index) => (
          <div key={step.id} style={styles.progressStep}>
            <div
              style={{
                ...styles.progressDot,
                ...(index <= currentIndex ? styles.progressDotActive : {}),
              }}
            >
              {index < currentIndex ? (
                <span style={styles.checkmark}>✓</span>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              style={{
                ...styles.progressLabel,
                ...(index <= currentIndex ? styles.progressLabelActive : {}),
              }}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                style={{
                  ...styles.progressLine,
                  ...(index < currentIndex ? styles.progressLineActive : {}),
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'method':
        return (
          <div>
            <PaymentMethodSelector
              onMethodSelect={handleMethodSelect}
              selectedMethod={selectedMethod}
            />
            <div style={styles.buttonRow}>
              {onCancel && (
                <button style={styles.cancelButton} onClick={onCancel}>
                  Cancel
                </button>
              )}
              <button
                style={styles.continueButton}
                onClick={handleContinueToPayment}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        );

      case 'form':
        return (
          <div>
            <div style={styles.backButton} onClick={() => setCurrentStep('method')}>
              ← Back to Payment Methods
            </div>
            <PaymentForm
              subscriptionId={subscriptionId}
              amount={amount}
              currency={currency}
              paymentMethod={selectedMethod}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        );

      case 'success':
        return (
          <PaymentSuccess
            paymentId={paymentResult?.id || ''}
            amount={amount}
            currency={currency}
            paymentMethod={selectedMethod}
            transactionReference={paymentResult?.payment_reference}
            paidAt={paymentResult?.paid_at}
            onContinue={handleCompletionContinue}
          />
        );

      case 'failed':
        return (
          <PaymentFailed
            errorMessage={errorMessage}
            amount={amount}
            currency={currency}
            paymentMethod={selectedMethod}
            onRetry={handleRetryPayment}
            onContactSupport={handleContactSupport}
            onChangePlan={handleChangeMethod}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header - only show for method and form steps */}
      {(currentStep === 'method' || currentStep === 'form') && (
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Complete Your Payment</h1>
          {tierName && (
            <p style={styles.headerSubtitle}>
              {tierName} - {currency} {amount.toFixed(2)} per month
            </p>
          )}
        </div>
      )}

      {/* Progress Bar - only show for method and form steps */}
      {(currentStep === 'method' || currentStep === 'form') && <ProgressBar />}

      {/* Main Content */}
      <div style={styles.content}>{renderStep()}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1A1A1A',
    paddingBottom: '60px',
  },
  header: {
    backgroundColor: '#252525',
    padding: '40px 20px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #333333',
  },
  headerTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  headerSubtitle: {
    fontSize: '18px',
    color: '#A0A0A0',
    margin: 0,
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#252525',
    borderBottom: '1px solid #333333',
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
  },
  progressDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#404040',
    color: '#707070',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    marginRight: '12px',
    transition: 'all 0.3s ease',
  },
  progressDotActive: {
    backgroundColor: '#0066FF',
    color: '#fff',
  },
  checkmark: {
    fontSize: '20px',
  },
  progressLabel: {
    fontSize: '14px',
    color: '#707070',
    marginRight: '20px',
    transition: 'color 0.3s ease',
  },
  progressLabelActive: {
    color: '#0066FF',
    fontWeight: '600',
  },
  progressLine: {
    width: '80px',
    height: '2px',
    backgroundColor: '#404040',
    marginRight: '20px',
    transition: 'background-color 0.3s ease',
  },
  progressLineActive: {
    backgroundColor: '#0066FF',
  },
  content: {
    padding: '20px',
  },
  backButton: {
    display: 'inline-block',
    fontSize: '14px',
    color: '#0066FF',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '8px 0',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '40px',
    maxWidth: '900px',
    margin: '40px auto 0',
  },
  cancelButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#A0A0A0',
    backgroundColor: 'transparent',
    border: '2px solid #666',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  continueButton: {
    padding: '14px 48px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#0066FF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};
