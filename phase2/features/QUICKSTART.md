# Quick Start Guide - Feature Implementation

## Setup Instructions

### 1. Apply Database Migrations

Run these migrations in order:

```bash
# Migration 1: Add video_url column to projects
supabase migration up 20260423000010_add_video_url_to_projects

# Migration 2: Enhance notifications table
supabase migration up 20260423000011_enhance_notifications_realtime
```

Or if using local Supabase:
```bash
cd supabase
supabase migration list
supabase migration up  # Runs all pending migrations
```

### 2. Verify Database Changes

```sql
-- Check video_url column exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'video_url';

-- Check notifications columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name IN ('read', 'event_type', 'related_user_id');

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'notifications';
```

### 3. Test Feature 1: Video Pitch

**Step 1**: Go to a project edit page
```
/projects/{projectId}/edit
```

**Step 2**: Find the "Video Section" form
- It appears after the "Funding Goal" section

**Step 3**: Enter a video URL
- YouTube: `https://youtube.com/watch?v=dQw4w9WgXcQ`
- Vimeo: `https://vimeo.com/90509568`

**Step 4**: Verify preview loads
- Thumbnail should appear
- Embedded player should show

**Step 5**: Save and verify
- Go to project detail page: `/projects/{projectId}`
- Video player should display prominently

### 4. Test Feature 2: Matching Algorithm

**Step 1**: Authenticate as an investor with some investments

**Step 2**: Call the matching API
```bash
curl -X GET http://localhost:3000/api/match \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Step 3**: Verify response
```json
{
  "matches": [
    {
      "id": "project-id",
      "matchScore": 85,
      "scoreBreakdown": { ... }
    }
  ],
  "total": 5
}
```

**Step 4**: Check scoring
- Scores should be 0-100
- Should return exactly 5 projects
- Should be sorted by matchScore (highest first)

### 5. Test Feature 3: Notifications

**Step 1**: Set up test investment
```bash
# As investor, invest in a project
curl -X POST http://localhost:3000/api/invest \
  -H "Authorization: Bearer INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "...", "amount": 1000}'
```

**Step 2**: Check for notification
- Toast should appear on screen
- Check database:
```sql
SELECT * FROM notifications 
WHERE user_id = 'founder-id' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Step 3**: Mark as read
```typescript
const { markAsRead } = useRealtimeNotifications(userId)
await markAsRead(notificationId)
```

**Step 4**: Verify read state
```sql
SELECT id, read, event_type 
FROM notifications 
WHERE id = 'notification-id';
```

---

## Integration Steps

### Add Matched Projects to Dashboard

```typescript
// File: app/dashboard/investor/page.tsx

import { useEffect, useState } from 'react'

export default function InvestorDashboard() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await fetch('/api/match')
      const data = await res.json()
      setMatches(data.matches)
    }
    
    fetchMatches()
  }, [])

  return (
    // ... existing dashboard JSX ...
    <section className="mb-12">
      <h2>Recommended Projects</h2>
      {matches.map(match => (
        <div key={match.id}>
          <h3>{match.title}</h3>
          <p>Match Score: {match.matchScore}%</p>
          <button onClick={() => router.push(`/opportunities/${match.id}`)}>
            View Project
          </button>
        </div>
      ))}
    </section>
  )
}
```

### Display Notifications

```typescript
// File: components/NotificationCenter.tsx

import { useNotifications } from '@/hooks/useRealtimeNotifications'

export default function NotificationCenter({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId)

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={notification.read ? 'opacity-50' : ''}
        >
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## File Structure Reference

```
D:\IDEA BUSINESS\
├── app/
│   ├── api/
│   │   └── match/
│   │       └── route.ts              [NEW] Match API endpoint
│   ├── projects/[id]/
│   │   ├── page.tsx                  [UPDATED] Displays video
│   │   └── edit/
│   │       ├── page.tsx              [EXISTING]
│   │       ├── EditProjectClient.tsx [UPDATED] Added video section
│   │       ├── video-section.tsx     [NEW] Video input component
│   │       └── actions.ts            [UPDATED] Handles video_url
│
├── lib/
│   ├── types.ts                      [UPDATED] Added video_url & Notification
│   ├── matching.ts                   [EXISTING]
│   └── matching-enhanced.ts          [NEW] Enhanced algorithm
│
├── hooks/
│   └── useRealtimeNotifications.ts   [UPDATED] Enhanced with DB persistence
│
├── supabase/
│   └── migrations/
│       ├── 20260423000010_...        [NEW] Video URL migration
│       └── 20260423000011_...        [NEW] Notifications enhancement
│
└── phase2/features/
    ├── FEATURES_PROGRESS.md          [NEW] Detailed progress report
    ├── IMPLEMENTATION_SUMMARY.md     [NEW] Quick reference
    └── QUICKSTART.md                 [THIS FILE]
```

---

## Troubleshooting

### Video Not Displaying
- Check URL is valid (YouTube or Vimeo)
- Verify `video_url` column exists in projects table
- Check browser console for CORS errors
- Ensure iframes are not blocked

### Match API Returns Empty
- Verify user is authenticated
- Check investor has at least one project selected
- Verify active projects exist in database
- Check API logs for errors

### Notifications Not Appearing
- Check WebSocket connection in browser DevTools
- Verify `notifications` table has required columns
- Check if realtime is enabled in Supabase
- Review browser console for subscription errors

### Database Migration Failed
- Check migration syntax
- Verify table names are correct
- Ensure columns don't already exist (add `IF NOT EXISTS`)
- Check Supabase logs for detailed error

---

## Performance Checklist

- [ ] Video loading < 2 seconds
- [ ] Match API response < 500ms
- [ ] Notifications appear < 1 second
- [ ] No memory leaks from WebSocket subscriptions
- [ ] Database queries use indexes efficiently
- [ ] API properly handles errors
- [ ] Mobile responsive video player

---

## Security Checklist

- [ ] Video URLs validated before save
- [ ] Match API requires authentication
- [ ] WebSocket only subscribes to user's data
- [ ] No sensitive data in match response
- [ ] Notifications filtered by user_id
- [ ] All inputs sanitized

---

## Next: Integration Tasks

1. Add matched projects section to dashboard (20 mins)
2. Create notification center component (30 mins)
3. Add video preview to project cards (15 mins)
4. Test all features end-to-end (30 mins)
5. Performance optimization (30 mins)

---

## Emergency Rollback

If critical issues arise:

```bash
# Revert migrations
supabase migration down 20260423000011_enhance_notifications_realtime
supabase migration down 20260423000010_add_video_url_to_projects

# Revert component changes (use git)
git checkout app/projects/[id]/page.tsx
git checkout app/projects/[id]/edit/EditProjectClient.tsx
git checkout lib/types.ts
git checkout hooks/useRealtimeNotifications.ts
```

---

**Status**: Ready for Immediate Testing
**Last Updated**: April 23, 2026
**Estimated Testing Time**: 2 hours for all features
