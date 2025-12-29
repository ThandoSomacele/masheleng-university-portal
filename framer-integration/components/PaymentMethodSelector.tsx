import React, { useState } from 'react';

/**
 * PaymentMethodSelector - Matches Masheleng Design System
 * Based on design: Dark theme with blue accent (#0066FF)
 *
 * Allows users to select their preferred payment method
 * Supports: Card, Bank Transfer, Mobile Money, Manual
 *
 * Usage in Framer:
 * <PaymentMethodSelector
 *   onMethodSelect={(method) => console.log(method)}
 *   selectedMethod="card"
 * />
 */

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: string) => void;
  selectedMethod?: string;
}

export default function PaymentMethodSelector({
  onMethodSelect,
  selectedMethod = 'card',
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState(selectedMethod);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay instantly with your card',
      icon: '💳',
      popular: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer (EFT)',
      icon: '🏦',
      popular: false,
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Orange Money, MTN, etc.',
      icon: '📱',
      popular: true,
    },
    {
      id: 'manual',
      name: 'Manual Payment',
      description: 'Pay in person or via other methods',
      icon: '💵',
      popular: false,
    },
  ];

  const handleSelect = (methodId: string) => {
    setSelected(methodId);
    onMethodSelect(methodId);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Select Payment Method</h2>
      <p style={styles.subtitle}>
        Choose how you would like to make your payment
      </p>

      <div style={styles.methodsGrid}>
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handleSelect(method.id)}
            style={{
              ...styles.methodCard,
              ...(selected === method.id ? styles.methodCardSelected : {}),
            }}
          >
            {method.popular && (
              <div style={styles.popularBadge}>Popular</div>
            )}

            <div style={styles.methodIcon}>{method.icon}</div>

            <h3 style={styles.methodName}>{method.name}</h3>
            <p style={styles.methodDescription}>{method.description}</p>

            <div style={styles.radioContainer}>
              <div
                style={{
                  ...styles.radio,
                  ...(selected === method.id ? styles.radioSelected : {}),
                }}
              >
                {selected === method.id && (
                  <div style={styles.radioInner} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.securityNote}>
        <span style={styles.lockIcon}>🔒</span>
        <p style={styles.securityText}>
          All payments are secure and encrypted. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '16px',
    color: '#A0A0A0',
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  methodsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  methodCard: {
    position: 'relative' as const,
    padding: '30px 20px',
    border: '2px solid #333333',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    backgroundColor: '#252525',
  },
  methodCardSelected: {
    borderColor: '#0066FF',
    backgroundColor: '#252525',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
  },
  popularBadge: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    backgroundColor: '#FF9800',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  methodIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  methodName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  methodDescription: {
    fontSize: '14px',
    color: '#A0A0A0',
    marginBottom: '16px',
    minHeight: '40px',
  },
  radioContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px',
  },
  radio: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #404040',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  radioSelected: {
    borderColor: '#0066FF',
  },
  radioInner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#0066FF',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#252525',
    border: '1px solid #333333',
    padding: '16px 20px',
    borderRadius: '8px',
    marginTop: '30px',
  },
  lockIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  securityText: {
    fontSize: '14px',
    color: '#A0A0A0',
    margin: 0,
    lineHeight: '1.6',
  },
};
