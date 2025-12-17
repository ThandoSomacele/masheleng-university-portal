/**
 * Masheleng University API Client
 * Beginner-friendly API client for Framer Code Components
 *
 * USAGE IN FRAMER:
 * 1. Copy this entire file into a Code File in Framer
 * 2. Import: import { MashelengAPI } from './api-client'
 * 3. Initialize: const api = new MashelengAPI(API_URL)
 * 4. Use methods like: api.login(email, password)
 *
 * Version: 1.0.0
 * Last Updated: December 2025
 */

class MashelengAPI {
  constructor(baseURL) {
    this.baseURL = baseURL || 'https://8dff51bd1178.ngrok-free.app/api/v1';
    this.tokenKey = 'masheleng_token';
    this.refreshTokenKey = 'masheleng_refresh_token';
  }

  // ======================
  // HELPER METHODS
  // ======================

  /**
   * Get stored auth token from localStorage
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored refresh token from localStorage
   */
  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Store auth tokens in localStorage
   */
  setTokens(accessToken, refreshToken) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Clear auth tokens from localStorage (logout)
   */
  clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Make authenticated API request
   * @private
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.getRefreshToken()) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${this.getToken()}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return this.handleResponse(retryResponse);
        } else {
          // Refresh failed, logout user
          this.clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Handle API response
   * @private
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  // ======================
  // AUTHENTICATION
  // ======================

  /**
   * Register new user
   * @param {Object} userData - { email, password, first_name, surname, country_code }
   * @returns {Promise<{user, tokens}>}
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.tokens && response.tokens.access_token) {
      this.setTokens(response.tokens.access_token, response.tokens.refresh_token);
    }

    return response;
  }

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, tokens}>}
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.tokens && response.tokens.access_token) {
      this.setTokens(response.tokens.access_token, response.tokens.refresh_token);
    }

    return response;
  }

  /**
   * Logout user (client-side only - clears tokens)
   */
  logout() {
    this.clearTokens();
  }

  /**
   * Refresh access token using refresh token
   * @private
   * @returns {Promise<boolean>}
   */
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.tokens && response.tokens.access_token) {
        this.setTokens(response.tokens.access_token, response.tokens.refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<User>}
   */
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ======================
  // SUBSCRIPTIONS
  // ======================

  /**
   * Get all subscription tiers (public endpoint)
   * @returns {Promise<SubscriptionTier[]>}
   */
  async getSubscriptionTiers() {
    return this.request('/subscriptions/tiers');
  }

  /**
   * Get specific tier by ID (public endpoint)
   * @param {string} tierId
   * @returns {Promise<SubscriptionTier>}
   */
  async getTierById(tierId) {
    return this.request(`/subscriptions/tiers/${tierId}`);
  }

  /**
   * Subscribe to a tier (requires authentication)
   * @param {Object} subscriptionData - { tier_id, payment_frequency?, currency? }
   * @returns {Promise<UserSubscription>}
   */
  async subscribe(subscriptionData) {
    return this.request('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  /**
   * Get user's active subscription (requires authentication)
   * @returns {Promise<UserSubscription>}
   */
  async getMySubscription() {
    return this.request('/subscriptions/my-subscription');
  }

  /**
   * Get subscription history (requires authentication)
   * @returns {Promise<UserSubscription[]>}
   */
  async getSubscriptionHistory() {
    return this.request('/subscriptions/my-history');
  }

  /**
   * Cancel active subscription (requires authentication)
   * @returns {Promise<UserSubscription>}
   */
  async cancelSubscription() {
    return this.request('/subscriptions/cancel', {
      method: 'DELETE',
    });
  }

  /**
   * Confirm payment for subscription (admin/manual)
   * @param {string} subscriptionId
   * @returns {Promise<UserSubscription>}
   */
  async confirmSubscriptionPayment(subscriptionId) {
    return this.request(`/subscriptions/confirm-payment/${subscriptionId}`, {
      method: 'POST',
    });
  }

  // ======================
  // COURSES
  // ======================

  /**
   * Get all published courses (public endpoint)
   * @returns {Promise<Course[]>}
   */
  async getCourses() {
    return this.request('/courses');
  }

  /**
   * Get course by ID (requires authentication, checks tier access)
   * @param {string} courseId
   * @returns {Promise<Course>}
   */
  async getCourseById(courseId) {
    return this.request(`/courses/${courseId}`);
  }

  /**
   * Create new course (requires authentication)
   * @param {Object} courseData
   * @returns {Promise<Course>}
   */
  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  /**
   * Update course (requires authentication)
   * @param {string} courseId
   * @param {Object} updateData
   * @returns {Promise<Course>}
   */
  async updateCourse(courseId, updateData) {
    return this.request(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Delete course (requires authentication)
   * @param {string} courseId
   * @returns {Promise<void>}
   */
  async deleteCourse(courseId) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Enroll in a course (requires authentication)
   * @param {string} courseId
   * @returns {Promise<UserCourseEnrollment>}
   */
  async enrollInCourse(courseId) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  /**
   * Get user's course enrollments (requires authentication)
   * @returns {Promise<UserCourseEnrollment[]>}
   */
  async getMyEnrollments() {
    return this.request('/courses/enrollments/my');
  }

  // ======================
  // PAYMENTS
  // ======================

  /**
   * Create payment intent (requires authentication)
   * @param {Object} paymentData - { subscription_id, amount, currency, payment_method }
   * @returns {Promise<Payment>}
   */
  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Confirm payment (requires authentication)
   * @param {string} paymentId
   * @param {Object} confirmData - Optional confirmation details
   * @returns {Promise<Payment>}
   */
  async confirmPayment(paymentId, confirmData = {}) {
    return this.request(`/payments/${paymentId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(confirmData),
    });
  }

  /**
   * Get user's payment history (requires authentication)
   * @returns {Promise<Payment[]>}
   */
  async getPaymentHistory() {
    return this.request('/payments');
  }

  /**
   * Get pending payments (requires authentication)
   * @returns {Promise<Payment[]>}
   */
  async getPendingPayments() {
    return this.request('/payments/pending');
  }

  /**
   * Get payment by ID (requires authentication)
   * @param {string} paymentId
   * @returns {Promise<Payment>}
   */
  async getPaymentById(paymentId) {
    return this.request(`/payments/${paymentId}`);
  }

  /**
   * Get payments for a specific subscription (requires authentication)
   * @param {string} subscriptionId
   * @returns {Promise<Payment[]>}
   */
  async getSubscriptionPayments(subscriptionId) {
    return this.request(`/payments/subscription/${subscriptionId}`);
  }

  // ======================
  // USERS
  // ======================

  /**
   * Get all users (admin endpoint, requires authentication)
   * @returns {Promise<User[]>}
   */
  async getUsers() {
    return this.request('/users');
  }

  /**
   * Get user by ID (requires authentication)
   * @param {string} userId
   * @returns {Promise<User>}
   */
  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  /**
   * Update user profile (requires authentication)
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<User>}
   */
  async updateUser(userId, updateData) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Delete user (requires authentication)
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

// Export for use in Framer
export { MashelengAPI };

// Also export a singleton instance for convenience
export const api = new MashelengAPI();
