#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   MASHELENG UNIVERSITY - Development Environment          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Start Docker services
echo "📦 Starting Docker services (PostgreSQL & Redis)..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Start NestJS backend
echo "🚀 Starting NestJS backend..."
npm run start:dev &
NEST_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "To install ngrok:"
    echo "  macOS: brew install ngrok"
    echo "  Or download from: https://ngrok.com/download"
    echo ""
    echo "After installing, configure with:"
    echo "  ngrok config add-authtoken YOUR_AUTH_TOKEN"
    echo ""
    exit 1
fi

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 --log=stdout > /tmp/ngrok.log &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Development Environment Ready!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🔗 Backend URLs:"
echo "   Local:   http://localhost:3000"
echo "   API Docs: http://localhost:3000/api/docs"
echo ""

# Try to get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
    echo "🌍 ngrok Tunnel:"
    echo "   $NGROK_URL"
    echo ""
    echo "📝 IMPORTANT: Update your Framer config.js with this ngrok URL:"
    echo "   const DEV_API_URL = '$NGROK_URL/api/v1';"
    echo ""
else
    echo "⚠️  Could not get ngrok URL automatically."
    echo "   Visit http://localhost:4040 to see your ngrok URL"
    echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo ""
echo "💡 Tips:"
echo "   • ngrok URL changes on free tier (upgrade for stable subdomain)"
echo "   • Press Ctrl+C to stop all services"
echo "   • Check ngrok dashboard: http://localhost:4040"
echo ""
echo "════════════════════════════════════════════════════════════"

# Trap exit signal
trap cleanup EXIT

cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $NEST_PID $NGROK_PID 2>/dev/null
    docker-compose down
    echo "✅ All services stopped"
}

# Keep script running
wait
