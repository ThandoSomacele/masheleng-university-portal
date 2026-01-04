/**
 * Masheleng University API Configuration
 * Update the API URLs as needed for development and production
 *
 * IMPORTANT: When ngrok restarts (free tier), you MUST update DEV_API_URL
 * with the new ngrok URL that appears in your terminal.
 *
 * Version: 1.0.0
 * Last Updated: December 2025
 */

// ==================================================================
// DEVELOPMENT: Update this with your ngrok URL when it changes
// ==================================================================
const DEV_API_URL = 'https://566517f62a69.ngrok-free.app/api/v1';

// ==================================================================
// PRODUCTION: This will be your actual backend URL when deployed
// ==================================================================
const PROD_API_URL = 'https://api.masheleng.com/api/v1';

// ==================================================================
// AUTO-DETECT ENVIRONMENT
// ==================================================================
// TEMPORARY: Force development mode until production API is ready
const isProduction = false;
// const isProduction = typeof window !== 'undefined' && window.location.hostname === 'university.masheleng.com';

// Export the correct API URL based on environment
export const API_URL = isProduction ? PROD_API_URL : DEV_API_URL;

// Export environment info for debugging
export const config = {
  apiUrl: API_URL,
  environment: isProduction ? 'production' : 'development',
  version: '1.0.0',
};

// ==================================================================
// DEBUGGING (Remove this in production)
// ==================================================================
if (!isProduction && typeof console !== 'undefined') {
  console.log('🔧 Masheleng API Config:', config);
  console.log('📝 To update ngrok URL:');
  console.log('   1. Run: ./scripts/start-dev-tunnel.sh');
  console.log('   2. Copy the ngrok URL from terminal');
  console.log('   3. Update DEV_API_URL in this file');
}

// ==================================================================
// QUICK REFERENCE
// ==================================================================
// ngrok free tier: URL changes on restart (upgrade for stable subdomain)
// ngrok paid tier ($8/mo): Get a stable subdomain like https://masheleng.ngrok-free.app
// ==================================================================
