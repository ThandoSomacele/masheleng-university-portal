# Vimeo Video Reference for Sample Data

This document lists all Vimeo video IDs used in the sample course data.

## Video IDs Used

### 1. Video ID: `76979871`
- **URL**: https://vimeo.com/76979871
- **Type**: Public educational content
- **Used in**:
  - Introduction to TypeScript → "What is TypeScript?"
  - Advanced TypeScript → "Generics in TypeScript"
  - Business Management → "What is Business Management?"

### 2. Video ID: `347119375`
- **URL**: https://vimeo.com/347119375
- **Type**: Tutorial/learning content
- **Used in**:
  - Introduction to TypeScript → "Setting Up Your Development Environment"
  - Web Development → "Introduction to HTML"

### 3. Video ID: `391466947`
- **URL**: https://vimeo.com/391466947
- **Type**: Educational demonstration
- **Used in**:
  - Advanced TypeScript → "Interfaces and Type Aliases"
  - Web Development → "CSS Fundamentals"

## Important Notes

⚠️ **These are PUBLIC placeholder videos** for testing only.

For production:
1. Upload your own educational content to Vimeo
2. Get your video IDs from the Vimeo URL
3. Replace the IDs in the seed files
4. Update video durations to match actual length

## How to Replace Videos

### 1. Upload to Vimeo

```bash
# Go to Vimeo.com
# Click "Upload"
# Upload your video
# Set privacy settings
```

### 2. Get Video ID

From URL: `https://vimeo.com/YOUR_VIDEO_ID`

Example: `https://vimeo.com/987654321` → ID is `987654321`

### 3. Update Seed File

**In TypeScript seeder** (`src/database/seeds/course-data.seed.ts`):
```typescript
vimeo_video_id: '987654321', // Your new ID
video_duration_seconds: 600,  // Actual duration
```

**In SQL seeder** (`database/seeds/sample-courses.sql`):
```sql
'987654321', -- Your new ID
10, -- duration_minutes
```

### 4. Update API Client

The frontend automatically uses the video ID to embed Vimeo player:

```typescript
// VimeoPlayer.tsx automatically constructs URL:
src={`https://player.vimeo.com/video/${videoId}`}
```

## Vimeo Privacy Settings

For student courses, use these settings:

### Option 1: Unlisted (Recommended for Testing)
- ✅ Anyone with the link can view
- ✅ Not searchable on Vimeo
- ✅ Easy to share for testing

### Option 2: Domain-Level Privacy (Production)
- ✅ Only embeddable on your domain
- ✅ Better security
- ✅ Requires Vimeo Pro/Business

### Option 3: Password Protected
- ⚠️ Requires users to enter password
- Not ideal for learning platform

## Vimeo API Integration

### Current Implementation (Embed Only)
- Uses Vimeo Player iframe
- No API key required
- Limited to playback only

### Future Enhancement (Vimeo API)
- Programmatic upload
- Thumbnail extraction
- Video analytics
- Requires API credentials:

```env
VIMEO_CLIENT_ID=your_client_id
VIMEO_CLIENT_SECRET=your_client_secret
VIMEO_ACCESS_TOKEN=your_token
```

## Video Best Practices

### File Format
- MP4 (H.264 codec)
- Resolution: 1080p recommended
- Aspect ratio: 16:9

### File Size
- Keep under 2GB for faster upload
- Vimeo automatically transcodes

### Duration
- Keep lessons focused: 5-15 minutes ideal
- Break longer topics into multiple lessons

### Naming Convention
```
CourseCode_ModuleNumber_LessonNumber_Title.mp4

Examples:
TS101_M1_L1_WhatIsTypeScript.mp4
WEBDEV_M2_L3_CSSFlexbox.mp4
BIZ101_M1_L1_IntroToManagement.mp4
```

## Testing Videos

### Test Video Playback
1. Get video ID from seed data
2. Open in browser: `https://vimeo.com/VIDEO_ID`
3. Verify it plays correctly

### Test in Application
1. Seed database with sample data
2. Navigate to course player
3. Verify video loads and plays
4. Test progress tracking
5. Test resume functionality

## Troubleshooting

### Video Won't Load
- Check privacy settings (must be public or unlisted)
- Verify video ID is correct
- Check Vimeo account status

### "Private Video" Error
- Change privacy to "Unlisted" or "Public"
- Or add domain whitelist in Vimeo settings

### Player Not Showing
- Check browser console for errors
- Verify iframe is allowed (CSP headers)
- Ensure Vimeo Player JS loaded

## Alternative Video Hosts

If not using Vimeo, you can use:

### YouTube
- Pros: Free, unlimited storage
- Cons: Ads, less professional
- Implementation: Similar iframe embed

### Wistia
- Pros: Built for business, great analytics
- Cons: Expensive
- Implementation: Similar embed code

### Self-Hosted (AWS S3 + CloudFront)
- Pros: Full control, no limits
- Cons: More complex, CDN costs
- Implementation: HLS/DASH streaming

## Cost Comparison

| Plan | Videos | Storage | Price/Month |
|------|--------|---------|-------------|
| Vimeo Free | Unlimited | 500MB/week | $0 |
| Vimeo Plus | Unlimited | 5GB/week | $20 |
| Vimeo Pro | Unlimited | 20GB/week | $75 |
| Vimeo Business | Unlimited | 5TB/year | $108 |

For your use case: **Vimeo Pro** recommended

## Replacement Checklist

Before production launch:

- [ ] Create Vimeo Pro account
- [ ] Upload all course videos
- [ ] Set privacy to domain-restricted
- [ ] Get all video IDs
- [ ] Update seed files with new IDs
- [ ] Update video durations
- [ ] Test playback on all devices
- [ ] Verify progress tracking works
- [ ] Test resume functionality
- [ ] Add backup video storage

---

**Last Updated**: December 2024
**Status**: Using placeholder public videos for development
**Action Required**: Replace with production videos before launch
