#!/bin/bash

# Comprehensive E2E Test Script
# Based on E2E_TEST_PLAN.md
# Tests the complete user journey from registration to course completion

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)
if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
  NGROK_URL="http://localhost:3000"
fi
API_BASE="${NGROK_URL}/api/v1"

# Test user data
TEST_USER_EMAIL="e2e-test-$(date +%s)@example.com"
TEST_USER_PASSWORD="Test123!"
TEST_USER_NAME="E2E Test User"
TEST_USER_PHONE="+267 71 234 567"

# Global variables
USER_TOKEN=""
USER_ID=""
SUBSCRIPTION_ID=""
PAYMENT_ID=""
COURSE_ID="22222222-1111-1111-1111-111111111111"
TIER_ID=""

# Functions
print_header() {
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo -e "${BLUE}$1${NC}"
  echo "════════════════════════════════════════════════════════════"
  echo ""
}

print_test() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "${YELLOW}Test $TOTAL_TESTS: $1${NC}"
}

print_pass() {
  PASSED_TESTS=$((PASSED_TESTS + 1))
  echo -e "${GREEN}✓ PASS: $1${NC}"
}

print_fail() {
  FAILED_TESTS=$((FAILED_TESTS + 1))
  echo -e "${RED}✗ FAIL: $1${NC}"
  echo -e "${RED}  Error: $2${NC}"
}

# Start tests
print_header "MASHELENG UNIVERSITY PORTAL - COMPREHENSIVE E2E TESTS"
echo "API Base URL: $API_BASE"
echo "Test User: $TEST_USER_EMAIL"
echo "Test Time: $(date)"
echo ""

# ═══════════════════════════════════════════════════════════════
# 1. USER REGISTRATION & AUTHENTICATION
# ═══════════════════════════════════════════════════════════════
print_header "1. USER REGISTRATION & AUTHENTICATION"

# Test 1.1: Register new user
print_test "Register new user"
REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "email": "$TEST_USER_EMAIL",
  "password": "$TEST_USER_PASSWORD",
  "first_name": "E2E",
  "surname": "Test User",
  "country_code": "BW"
}
EOF
)

if echo "$REGISTER_RESPONSE" | jq -e '.tokens.access_token' > /dev/null 2>&1; then
  USER_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.tokens.access_token')
  USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
  print_pass "User registered successfully (ID: ${USER_ID:0:8}...)"
else
  print_fail "User registration failed" "$(echo $REGISTER_RESPONSE | jq -r '.message')"
  exit 1
fi

# Test 1.2: Login with credentials
print_test "Login with credentials"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "email": "$TEST_USER_EMAIL",
  "password": "$TEST_USER_PASSWORD"
}
EOF
)

if echo "$LOGIN_RESPONSE" | jq -e '.tokens.access_token' > /dev/null 2>&1; then
  print_pass "Login successful"
else
  print_fail "Login failed" "$(echo $LOGIN_RESPONSE | jq -r '.message')"
fi

# Test 1.3: Get current user profile
print_test "Get current user profile"
PROFILE_RESPONSE=$(curl -s "${API_BASE}/auth/me" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$PROFILE_RESPONSE" | jq -e '.email' > /dev/null 2>&1; then
  print_pass "Profile retrieved successfully"
else
  print_fail "Get profile failed" "$(echo $PROFILE_RESPONSE | jq -r '.message')"
fi

# ═══════════════════════════════════════════════════════════════
# 2. SUBSCRIPTION & PAYMENT FLOW
# ═══════════════════════════════════════════════════════════════
print_header "2. SUBSCRIPTION & PAYMENT FLOW"

# Test 2.1: Get subscription tiers
print_test "Get all subscription tiers"
TIERS_RESPONSE=$(curl -s "${API_BASE}/subscriptions/tiers")

if echo "$TIERS_RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
  TIER_COUNT=$(echo "$TIERS_RESPONSE" | jq '. | length')
  TIER_ID=$(echo "$TIERS_RESPONSE" | jq -r '.[0].id')  # Get Entry tier
  print_pass "Retrieved $TIER_COUNT tiers (Entry tier: ${TIER_ID:0:8}...)"
else
  print_fail "Get tiers failed" "$(echo $TIERS_RESPONSE | jq -r '.message')"
fi

# Test 2.2: Subscribe to Entry tier
print_test "Subscribe to Entry tier"
SUBSCRIBE_RESPONSE=$(curl -s -X POST "${API_BASE}/subscriptions/subscribe" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "tier_id": "$TIER_ID",
  "payment_frequency": "monthly"
}
EOF
)

if echo "$SUBSCRIBE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SUBSCRIPTION_ID=$(echo "$SUBSCRIBE_RESPONSE" | jq -r '.id')
  print_pass "Subscription created (ID: ${SUBSCRIPTION_ID:0:8}...)"
else
  print_fail "Subscription failed" "$(echo $SUBSCRIBE_RESPONSE | jq -r '.message')"
fi

# Test 2.3: Get my subscription
print_test "Get my active subscription"
MY_SUB_RESPONSE=$(curl -s "${API_BASE}/subscriptions/my-subscription" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$MY_SUB_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SUB_STATUS=$(echo "$MY_SUB_RESPONSE" | jq -r '.status')
  print_pass "My subscription retrieved (Status: $SUB_STATUS)"
else
  print_fail "Get my subscription failed" "$(echo $MY_SUB_RESPONSE | jq -r '.message')"
fi

# Test 2.4: Create payment (Card)
print_test "Create card payment"
PAYMENT_RESPONSE=$(curl -s -X POST "${API_BASE}/payments" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "subscription_id": "$SUBSCRIPTION_ID",
  "amount": 150.00,
  "currency": "BWP",
  "payment_method": "card",
  "notes": "Card payment: E2E Test - 9010"
}
EOF
)

if echo "$PAYMENT_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id')
  print_pass "Payment created (ID: ${PAYMENT_ID:0:8}...)"
else
  print_fail "Payment creation failed" "$(echo $PAYMENT_RESPONSE | jq -r '.message')"
fi

# Test 2.5: Get payment history
print_test "Get payment history"
PAYMENT_HISTORY=$(curl -s "${API_BASE}/payments" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$PAYMENT_HISTORY" | jq -e '.[0].id' > /dev/null 2>&1; then
  PAYMENT_COUNT=$(echo "$PAYMENT_HISTORY" | jq '. | length')
  print_pass "Retrieved $PAYMENT_COUNT payment(s)"
else
  print_fail "Get payment history failed" "$(echo $PAYMENT_HISTORY | jq -r '.message')"
fi

# Test 2.6: Confirm payment (simulating admin confirmation)
print_test "Confirm payment"
CONFIRM_RESPONSE=$(curl -s -X POST "${API_BASE}/payments/${PAYMENT_ID}/confirm" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$CONFIRM_RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
  PAYMENT_STATUS=$(echo "$CONFIRM_RESPONSE" | jq -r '.status')
  print_pass "Payment confirmed (Status: $PAYMENT_STATUS)"
else
  print_fail "Payment confirmation failed" "$(echo $CONFIRM_RESPONSE | jq -r '.message')"
fi

# ═══════════════════════════════════════════════════════════════
# 3. COURSE BROWSING & DISCOVERY
# ═══════════════════════════════════════════════════════════════
print_header "3. COURSE BROWSING & DISCOVERY"

# Test 3.1: Get all courses (public)
print_test "Get all published courses"
COURSES_RESPONSE=$(curl -s "${API_BASE}/courses")

if echo "$COURSES_RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
  COURSE_COUNT=$(echo "$COURSES_RESPONSE" | jq '. | length')
  print_pass "Retrieved $COURSE_COUNT course(s)"
else
  print_fail "Get courses failed" "$(echo $COURSES_RESPONSE | jq -r '.message')"
fi

# ═══════════════════════════════════════════════════════════════
# 4. COURSE DETAIL & ENROLLMENT
# ═══════════════════════════════════════════════════════════════
print_header "4. COURSE DETAIL & ENROLLMENT"

# Test 4.1: Get course by ID (requires auth)
print_test "Get course detail by ID"
COURSE_DETAIL=$(curl -s "${API_BASE}/courses/${COURSE_ID}" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$COURSE_DETAIL" | jq -e '.id' > /dev/null 2>&1; then
  COURSE_TITLE=$(echo "$COURSE_DETAIL" | jq -r '.title')
  print_pass "Course retrieved: $COURSE_TITLE"
else
  print_fail "Get course detail failed" "$(echo $COURSE_DETAIL | jq -r '.message')"
fi

# Test 4.2: Get course curriculum
print_test "Get course curriculum"
CURRICULUM_RESPONSE=$(curl -s "${API_BASE}/courses/${COURSE_ID}/curriculum" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$CURRICULUM_RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
  MODULE_COUNT=$(echo "$CURRICULUM_RESPONSE" | jq '. | length')
  LESSON_COUNT=$(echo "$CURRICULUM_RESPONSE" | jq '[.[].lessons | length] | add')
  print_pass "Curriculum retrieved: $MODULE_COUNT modules, $LESSON_COUNT lessons"
else
  print_fail "Get curriculum failed" "$(echo $CURRICULUM_RESPONSE | jq -r '.message')"
fi

# Test 4.3: Enroll in course
print_test "Enroll in course"
ENROLL_RESPONSE=$(curl -s -X POST "${API_BASE}/courses/${COURSE_ID}/enroll" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$ENROLL_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  ENROLLMENT_ID=$(echo "$ENROLL_RESPONSE" | jq -r '.id')
  print_pass "Enrolled successfully (ID: ${ENROLLMENT_ID:0:8}...)"
else
  print_fail "Course enrollment failed" "$(echo $ENROLL_RESPONSE | jq -r '.message')"
fi

# Test 4.4: Get my enrollments
print_test "Get my course enrollments"
MY_ENROLLMENTS=$(curl -s "${API_BASE}/courses/enrollments/my" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$MY_ENROLLMENTS" | jq -e '.[0].id' > /dev/null 2>&1; then
  ENROLLMENT_COUNT=$(echo "$MY_ENROLLMENTS" | jq '. | length')
  print_pass "Retrieved $ENROLLMENT_COUNT enrollment(s)"
else
  print_fail "Get enrollments failed" "$(echo $MY_ENROLLMENTS | jq -r '.message')"
fi

# ═══════════════════════════════════════════════════════════════
# 5. COURSE PROGRESS TRACKING
# ═══════════════════════════════════════════════════════════════
print_header "5. COURSE PROGRESS TRACKING"

# Get first lesson ID
FIRST_LESSON_ID=$(echo "$CURRICULUM_RESPONSE" | jq -r '.[0].lessons[0].id')

# Test 5.1: Update lesson progress
print_test "Update lesson progress"
PROGRESS_RESPONSE=$(curl -s -X POST "${API_BASE}/courses/${COURSE_ID}/lessons/${FIRST_LESSON_ID}/progress" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "watch_time_seconds": 30,
  "last_position_seconds": 30,
  "completion_percentage": 50
}
EOF
)

if echo "$PROGRESS_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  PROGRESS_PCT=$(echo "$PROGRESS_RESPONSE" | jq -r '.completion_percentage')
  print_pass "Progress updated: $PROGRESS_PCT%"
else
  print_fail "Update progress failed" "$(echo $PROGRESS_RESPONSE | jq -r '.message')"
fi

# Test 5.2: Mark lesson as complete
print_test "Mark lesson as complete"
COMPLETE_RESPONSE=$(curl -s -X POST "${API_BASE}/courses/${COURSE_ID}/lessons/${FIRST_LESSON_ID}/complete" \
  -H "Authorization: Bearer ${USER_TOKEN}")

if echo "$COMPLETE_RESPONSE" | jq -e '.is_completed' > /dev/null 2>&1; then
  IS_COMPLETED=$(echo "$COMPLETE_RESPONSE" | jq -r '.is_completed')
  print_pass "Lesson completed: $IS_COMPLETED"
else
  print_fail "Complete lesson failed" "$(echo $COMPLETE_RESPONSE | jq -r '.message')"
fi

# ═══════════════════════════════════════════════════════════════
# 6. ERROR HANDLING & VALIDATION
# ═══════════════════════════════════════════════════════════════
print_header "6. ERROR HANDLING & VALIDATION"

# Test 6.1: Invalid UUID format
print_test "Invalid UUID format (should return 400)"
INVALID_UUID_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/courses/invalid-uuid" \
  -H "Authorization: Bearer ${USER_TOKEN}")
HTTP_CODE=$(echo "$INVALID_UUID_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
  print_pass "400 error returned for invalid UUID"
else
  print_fail "Expected 400, got $HTTP_CODE" "$(echo $INVALID_UUID_RESPONSE | head -n-1 | jq -r '.message')"
fi

# Test 6.2: Non-existent course
print_test "Non-existent course ID (should return 404)"
NONEXISTENT_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/courses/99999999-9999-9999-9999-999999999999" \
  -H "Authorization: Bearer ${USER_TOKEN}")
HTTP_CODE=$(echo "$NONEXISTENT_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
  print_pass "404 error returned for non-existent course"
else
  print_fail "Expected 404, got $HTTP_CODE" "$(echo $NONEXISTENT_RESPONSE | head -n-1 | jq -r '.message')"
fi

# Test 6.3: Unauthorized access
print_test "Unauthorized access (should return 401)"
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/courses/${COURSE_ID}")
HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  print_pass "401 error returned for unauthorized access"
else
  print_fail "Expected 401, got $HTTP_CODE" "$(echo $UNAUTH_RESPONSE | head -n-1 | jq -r '.message')"
fi

# ═══════════════════════════════════════════════════════════════
# TEST SUMMARY
# ═══════════════════════════════════════════════════════════════
print_header "TEST SUMMARY"

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo "Pass Rate:    $PASS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✓ ALL TESTS PASSED!${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}  ✗ SOME TESTS FAILED${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  exit 1
fi
