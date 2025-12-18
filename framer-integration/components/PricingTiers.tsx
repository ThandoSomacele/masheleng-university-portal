import { useEffect, useState } from 'react';
import { MashelengAPI } from '../api_client.js';
import { API_URL } from '../config.js';

/**
 * PricingTiers - Matches Masheleng Design System
 * Responsive component for displaying subscription tiers
 */

export default function PricingTiers() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('ZAR');

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const api = new MashelengAPI(API_URL);
      const data = await api.getSubscriptionTiers();
      setTiers(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tiers:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    try {
      const api = new MashelengAPI(API_URL);
      const token = localStorage.getItem('masheleng_token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      await api.subscribe({
        tier_id: tierId,
        payment_frequency: billingCycle === 'monthly' ? 'monthly' : 'annual',
        currency: currency,
      });
      alert('Subscription successful! Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Subscription failed:', err);
      alert(`Subscription failed: ${(err as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={styles.loading}>Loading pricing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={styles.error}>
          <h2>Error Loading Pricing</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.component}>
      {/* Controls */}
      <div style={styles.header}>
        {/* Currency and Billing Toggle */}
        <div style={styles.controlsContainer}>
          <div style={styles.currencyToggle}>
            <button
              style={{
                ...styles.currencyButton,
                ...(currency === 'BWP' && styles.currencyButtonActive),
              }}
              onClick={() => setCurrency('BWP')}>
              BWP
            </button>
            <button
              style={{
                ...styles.currencyButton,
                ...(currency === 'ZAR' && styles.currencyButtonActive),
              }}
              onClick={() => setCurrency('ZAR')}>
              ZAR
            </button>
          </div>

          <div style={styles.billingToggle}>
            <span style={styles.toggleLabel}>Save 10% when billed yearly!</span>
            <div style={styles.toggleButtons}>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(billingCycle === 'monthly' && styles.toggleButtonActive),
                }}
                onClick={() => setBillingCycle('monthly')}>
                Monthly
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(billingCycle === 'yearly' && styles.toggleButtonActive),
                }}
                onClick={() => setBillingCycle('yearly')}>
                Yearly
              </button>
            </div>
            <span style={styles.toggleBadge}>
              {billingCycle === 'monthly' ? '💰 Billed Monthly' : '🎉 Billed Yearly'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div style={styles.grid}>
        {tiers.map((tier, index) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            isPopular={index === 1}
            billingCycle={billingCycle}
            currency={currency}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  isPopular,
  billingCycle,
  currency,
  onSubscribe,
}: {
  tier: any;
  isPopular: boolean;
  billingCycle: string;
  currency: string;
  onSubscribe: (id: string) => void;
}) {
  // Get base monthly price based on currency
  const getMonthlyPrice = () => {
    const price = currency === 'BWP' ? tier.price_bwp : tier.price_zar;
    return parseFloat(price || 0);
  };

  // Calculate price based on billing cycle
  const getDisplayPrice = () => {
    const monthlyPrice = getMonthlyPrice();
    if (billingCycle === 'yearly') {
      // Annual price with 10% discount
      return (monthlyPrice * 12 * 0.9).toFixed(0);
    }
    return monthlyPrice.toFixed(0);
  };

  // Format price with currency symbol
  const formatPrice = (price: string) => {
    const symbol = currency === 'BWP' ? 'P' : 'R';
    return `${symbol}${price}`;
  };

  // Get tier label
  const getTierLabel = (name: string) => {
    if (name?.toLowerCase().includes('entry')) return 'ENTRY';
    if (name?.toLowerCase().includes('premium+')) return 'PREMIUM+';
    if (name?.toLowerCase().includes('premium')) return 'PREMIUM';
    return name?.toUpperCase() || 'PLAN';
  };

  // Default features if not provided
  const defaultFeatures = [
    'Access All Courses',
    'Unlimited Access',
    'Access Future Courses',
    'Low Priority Support',
    'Access Courses Early',
    'Join Members-only Classes',
  ];

  const features = tier.features || defaultFeatures;

  return (
    <div
      style={{
        ...styles.card,
        ...(isPopular && styles.cardPopular),
      }}>
      {isPopular && <div style={styles.popularBadge}>MOST POPULAR</div>}

      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.tierLabel}>{getTierLabel(tier.tier_name)}</div>
        <div style={styles.priceSection}>
          <span style={styles.price}>{formatPrice(getDisplayPrice())}</span>
          <span style={styles.pricePeriod}>{billingCycle === 'monthly' ? ' / month' : ' / year'}</span>
        </div>
        {billingCycle === 'yearly' && getMonthlyPrice() > 0 && (
          <div style={styles.savingsText}>Save {formatPrice((getMonthlyPrice() * 12 * 0.1).toFixed(0))} per year!</div>
        )}
        <p style={styles.tierDescription}>{tier.description || 'Access to courses and learning materials.'}</p>
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
        onClick={() => onSubscribe(tier.id)}>
        Start Now
      </button>
    </div>
  );
}

const styles = {
  component: {
    width: '100%',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
  },
  currencyToggle: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#1A1A1A',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #333333',
  },
  currencyButton: {
    backgroundColor: 'transparent',
    color: '#999999',
    padding: '8px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  currencyButtonActive: {
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
  },
  billingToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
    padding: '0 10px',
  },
  toggleLabel: {
    fontSize: '13px',
    color: '#999999',
    textAlign: 'center' as const,
  },
  toggleButtons: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#1A1A1A',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #333333',
  },
  toggleButton: {
    backgroundColor: 'transparent',
    color: '#999999',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  toggleButtonActive: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
  },
  toggleBadge: {
    fontSize: '13px',
    color: '#FFFFFF',
    backgroundColor: '#1A1A1A',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #333333',
    whiteSpace: 'nowrap' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '24px 20px',
    border: '1px solid #333333',
    position: 'relative' as const,
    transition: 'all 0.2s ease',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardPopular: {
    border: '2px solid #0066FF',
  },
  popularBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '4px 16px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '12px',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap' as const,
  },
  cardHeader: {
    textAlign: 'center' as const,
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333333',
  },
  tierLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#999999',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  priceSection: {
    marginBottom: '12px',
  },
  price: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: '15px',
    color: '#999999',
  },
  tierDescription: {
    fontSize: '13px',
    color: '#999999',
    lineHeight: '1.6',
    marginTop: '0',
    marginBottom: '0',
  },
  savingsText: {
    fontSize: '13px',
    color: '#22C55E',
    fontWeight: '600',
    marginTop: '8px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '24px',
    flex: '1',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  checkmark: {
    color: '#22C55E',
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.4',
  },
  featureText: {
    fontSize: '13px',
    color: '#FFFFFF',
    lineHeight: '1.4',
  },
  ctaButton: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  ctaButtonPopular: {
    backgroundColor: '#0052CC',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    fontSize: '16px',
    color: '#999999',
  },
  error: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#EF4444',
  },
};
