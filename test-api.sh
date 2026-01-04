#!/bin/bash

# API Testing Script for Course Detail Endpoints
# Uses seed user credentials to test authenticated endpoints

NGROK_URL="https://566517f62a69.ngrok-free.app"
API_BASE="${NGROK_URL}/api/v1"

echo "═══════════════════════════════════════════════"
echo "  MASHELENG API E2E TESTS"
echo "═══════════════════════════════════════════════"
echo ""

# Test 1: Public courses endpoint
echo "📝 Test 1: Get all courses (public)"
curl -s "${API_BASE}/courses" | jq -r '.[] | "\(.id) - \(.title)"'
echo ""

# Test 2: Register test user (may fail if already exists - that's OK)
echo "📝 Test 2: Register test user"
REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "email": "test1@example.com",
  "password": "Test123!",
  "first_name": "Test",
  "surname": "User",
  "country_code": "BW"
}
EOF
)
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "User may already exist (this is OK)"
echo ""

# Test 3: Login to get JWT token
echo "📝 Test 3: Login and get JWT token"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "email": "test1@example.com",
  "password": "Test123!"
}
EOF
)

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.access_token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Login successful! Token: ${TOKEN:0:20}..."
echo ""

# Test 4: Get specific course (authenticated)
COURSE_ID="22222222-1111-1111-1111-111111111111"
echo "📝 Test 4: Get course $COURSE_ID (authenticated)"
COURSE_RESPONSE=$(curl -s "${API_BASE}/courses/${COURSE_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$COURSE_RESPONSE" | jq '{id, title, description: (.description[:50] + "..."), required_tier_level}'
echo ""

# Test 5: Get course curriculum
echo "📝 Test 5: Get course curriculum (authenticated)"
CURRICULUM_RESPONSE=$(curl -s "${API_BASE}/courses/${COURSE_ID}/curriculum" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$CURRICULUM_RESPONSE" | jq '.[] | {id, title, lessons_count: (.lessons | length)}'
echo ""

# Test 6: Test with invalid UUID
echo "📝 Test 6: Test with invalid UUID (should return 400)"
curl -s "${API_BASE}/courses/invalid-uuid" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.message'
echo ""

# Test 7: Test with non-existent UUID
echo "📝 Test 7: Test with non-existent UUID (should return 404)"
curl -s "${API_BASE}/courses/99999999-9999-9999-9999-999999999999" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.message'
echo ""

echo "═══════════════════════════════════════════════"
echo "  TESTS COMPLETE"
echo "═══════════════════════════════════════════════"
echo ""
echo "✅ Valid Course UUIDs for testing:"
echo "   - 11111111-1111-1111-1111-111111111111 (TypeScript)"
echo "   - 22222222-1111-1111-1111-111111111111 (Web Dev)"
echo "   - 33333333-1111-1111-1111-111111111111 (Business)"
echo ""
echo "🔑 JWT Token (for manual testing):"
echo "   $TOKEN"
echo ""
