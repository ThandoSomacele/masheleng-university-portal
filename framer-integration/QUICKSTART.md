# 🚀 Framer Integration - Quick Start

Get your Framer site connected to the backend in 3 steps.

## Step 1: Start Backend with ngrok (5 minutes)

```bash
cd /Users/thando/Documents/masheleng-university-portal

# Install ngrok (first time only)
brew install ngrok
ngrok config add-authtoken YOUR_TOKEN  # Get token from ngrok.com

# Start everything
./scripts/start-dev-tunnel.sh
```

**Copy the ngrok URL** that appears (e.g., `https://abc123.ngrok-free.app`)

## Step 2: Setup Framer (15 minutes)

1. Open your Framer project at https://university.masheleng.com/

2. Create **Code File** → Name: `api-client.js`
   - Copy contents from: `framer-integration/api-client.js`

3. Create **Code File** → Name: `config.js`
   - Copy contents from: `framer-integration/config.js`
   - **IMPORTANT:** Update line 13 with your ngrok URL:
   ```javascript
   const DEV_API_URL = 'https://YOUR-NGROK-URL.ngrok-free.app/api/v1';
   ```

## Step 3: Add Components (1 hour per component)

For each component you want to add:

1. In Framer: **Insert** → **Code** → **Code Component**
2. Name it (e.g., `PricingTiers`)
3. Copy code from `components/` directory
4. Insert on your page

### Priority Components:

1. **PricingTiers** - Add to homepage (shows subscription options)
2. **LoginForm** - Create `/login` page
3. **RegisterForm** - Create `/register` page
4. **StudentDashboard** - Create `/dashboard` page
5. **CourseCatalog** - Create `/courses` page

## Complete Component Code

All component code is available in the detailed plan from agent **a6365e7**.

To access complete component code:
1. Check `/Users/thando/.claude/plans/kind-dancing-giraffe.md`
2. Or ask me to provide specific component code

## Test Connection

Create a test component to verify it works:

```typescript
import { useState, useEffect } from "react"
import { MashelengAPI } from "./api-client"
import { API_URL } from "./config"

export default function APITest() {
  const [status, setStatus] = useState("Testing...")

  useEffect(() => {
    async function test() {
      try {
        const api = new MashelengAPI(API_URL)
        await api.getSubscriptionTiers()
        setStatus("✅ Connected!")
      } catch (err) {
        setStatus(`❌ Error: ${err.message}`)
      }
    }
    test()
  }, [])

  return <div style={{padding: 40}}><h2>{status}</h2></div>
}
```

Expected: "✅ Connected!"

## Troubleshooting

**CORS Error?**
- Check ngrok URL in `config.js` is correct
- Restart: `./scripts/start-dev-tunnel.sh`

**401 Unauthorized?**
- Clear browser localStorage
- Login again

**ngrok URL changed?**
- Update `config.js` with new URL
- Reload Framer preview

## Next Steps

✅ Backend setup complete
✅ Framer connection ready
⬜ Build your 4 priority pages
⬜ Test user flow end-to-end
⬜ Deploy to production (later)

**Need full component code?** See:
- `/framer-integration/components/` (when created)
- Or check the detailed plan with agent a6365e7
- Or ask me to generate specific components

**Full documentation:** See `README.md`
