import React, { useState } from 'react';
import { MashelengAPI } from './ap_client.js';
import { API_URL } from './config.js';

/**
 * LoginForm - Matches Masheleng Design System
 * Based on design: Screenshot 2025-12-17 at 20.17.26.png
 */

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const api = new MashelengAPI(API_URL);
      const response = await api.login(email, password);

      console.log('✅ Login successful:', response);
      setUserData(response.user);
      setSuccess(true);
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Welcome back!</h2>
          <p style={styles.successText}>Successfully logged in as {userData?.first_name}</p>
          <div style={styles.successActions}>
            <a href='/dashboard' style={styles.primaryButton}>
              Go to Dashboard
            </a>
            <a href='/courses' style={styles.secondaryButton}>
              Browse Courses
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <svg width='120' height='40' viewBox='0 0 120 40' fill='none'>
            <text x='0' y='30' fill='#0066FF' fontSize='24' fontWeight='bold'>
              Masheleng
            </text>
            <text x='0' y='38' fill='#0066FF' fontSize='10'>
              University
            </text>
          </svg>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Log in to your Account</h1>
        <p style={styles.subtitle}>
          Login to your Masheleng® University Account to get instant access to Our Courses and start learning.
        </p>

        {/* Error Message */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Forgot Password Link */}
          <a href='/forgot-password' style={styles.forgotLink}>
            Forgot Password?
          </a>

          {/* Email Field */}
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={styles.input}
          />

          {/* Password Field */}
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={styles.input}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
              disabled={loading}>
              {showPassword ? 'Hide' : 'Show'}
              {showPassword ? <span style={styles.forgotLink}>Hide</span> : <span style={styles.forgotLink}>Show</span>}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading && styles.submitButtonDisabled),
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Haven't Activated License Yet?</span>{' '}
          <a href='/activate' style={styles.footerLink}>
            Activate Now →
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#0A0A0A',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '40px',
    border: '1px solid #333333',
  },
  logo: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '12px',
    marginTop: '0',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '16px',
    color: '#999999',
    marginBottom: '32px',
    marginTop: '0',
    lineHeight: '1.5',
  },
  errorBox: {
    backgroundColor: '#FEE',
    color: '#C33',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #FCC',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  forgotLink: {
    color: '#999999',
    fontSize: '14px',
    textDecoration: 'none',
    alignSelf: 'flex-start',
    marginBottom: '4px',
    transition: 'color 0.2s ease',
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    padding: '14px 16px',
    fontSize: '16px',
    fontWeight: '400',
    border: '1px solid #404040',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#999999',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s ease',
  },
  submitButtonDisabled: {
    backgroundColor: '#4D4D4D',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    borderTop: '1px solid #333333',
    paddingTop: '24px',
  },
  footerText: {
    color: '#999999',
  },
  footerLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease',
  },
  // Success screen styles
  successIcon: {
    fontSize: '64px',
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#999999',
    textAlign: 'center',
    marginBottom: '32px',
  },
  successActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    display: 'block',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    display: 'block',
    backgroundColor: 'transparent',
    color: '#0066FF',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: '1px solid #0066FF',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
};
