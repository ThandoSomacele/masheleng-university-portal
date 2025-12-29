#!/bin/bash

# ============================================================
# Update API URL Script
# Updates the ngrok URL in all Framer components
# ============================================================

if [ -z "$1" ]; then
    echo "❌ Error: No ngrok URL provided"
    echo ""
    echo "Usage: ./scripts/update-api-url.sh <ngrok-url>"
    echo "Example: ./scripts/update-api-url.sh https://abc123.ngrok-free.app"
    exit 1
fi

NGROK_URL="$1"
API_URL="${NGROK_URL}/api/v1"

echo "════════════════════════════════════════════════════════"
echo "  Updating API URLs in Framer Components"
echo "════════════════════════════════════════════════════════"
echo ""
echo "New API URL: $API_URL"
echo ""

# Find all TypeScript files with API_URL constant
FILES=$(grep -rl "const API_URL = 'http" framer-integration/components/ 2>/dev/null || true)

if [ -z "$FILES" ]; then
    echo "✅ No hardcoded API URLs found (components likely use api_client.js)"
    echo ""
    echo "📝 Note: Make sure to update API_URL in api_client.js if needed:"
    echo "   export const DEFAULT_API_URL = '$API_URL';"
    exit 0
fi

echo "Found files with hardcoded API URLs:"
echo "$FILES" | while read -r file; do
    echo "  - $file"
done
echo ""

# Update each file
echo "$FILES" | while read -r file; do
    # Use sed to replace the API_URL line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|const API_URL = 'http[^']*';|const API_URL = '$API_URL';|g" "$file"
    else
        # Linux
        sed -i "s|const API_URL = 'http[^']*';|const API_URL = '$API_URL';|g" "$file"
    fi
    echo "✅ Updated: $file"
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ API URLs Updated Successfully!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Republish your Framer components"
echo "2. Clear browser cache if needed"
echo "3. Test registration and login"
echo ""
