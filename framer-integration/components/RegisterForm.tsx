import React, { useState } from 'react';
import { MashelengAPI } from '../api_client.js';
import { API_URL } from '../config.js';

/**
 * RegisterForm - Matches Masheleng Design System
 * Cleaned up version - just the form card (titles/logos in Framer design)
 */

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    surname: '',
    country_code: 'BW',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const api = new MashelengAPI(API_URL);
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        surname: formData.surname,
        country_code: formData.country_code,
      };

      const response = await api.register(userData);
      console.log('✅ Registration successful:', response);
      setSuccess(true);
    } catch (err) {
      console.error('❌ Registration failed:', err);
      setError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.card}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.successTitle}>Account Created!</h2>
        <p style={styles.successText}>Welcome to Masheleng University. You're all set!</p>
        <div style={styles.successActions}>
          <a href='/dashboard' style={styles.primaryButton}>
            Go to Dashboard
          </a>
          <a href='/courses' style={styles.secondaryButton}>
            Browse Courses
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
        {/* Name Row */}
        <div style={styles.row}>
          <input
            type='text'
            name='first_name'
            placeholder='First Name'
            value={formData.first_name}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ ...styles.input, ...styles.halfInput }}
          />
          <input
            type='text'
            name='surname'
            placeholder='Surname'
            value={formData.surname}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ ...styles.input, ...styles.halfInput }}
          />
        </div>

        {/* Email Field */}
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        {/* Country Field */}
        <select
          name='country_code'
          value={formData.country_code}
          onChange={handleChange}
          disabled={loading}
          style={styles.select}>
          <option value='BW'>Botswana</option>
          <option value='ZA'>South Africa</option>
        </select>

        {/* Password Field */}
        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
            disabled={loading}>
            {showPassword ? <span style={styles.forgotLink}>Hide</span> : <span style={styles.forgotLink}>Show</span>}
          </button>
        </div>

        {/* Confirm Password Field */}
        <input
          type={showPassword ? 'text' : 'password'}
          name='confirmPassword'
          placeholder='Confirm Password'
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        {/* Submit Button */}
        <button
          type='submit'
          disabled={loading}
          style={{
            ...styles.submitButton,
            ...(loading && styles.submitButtonDisabled),
          }}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '40px',
    border: '1px solid #333333',
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
  row: {
    display: 'flex',
    gap: '12px',
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
  halfInput: {
    flex: '1',
  },
  select: {
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
    cursor: 'pointer',
  },
  forgotLink: {
    color: '#999999',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
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
