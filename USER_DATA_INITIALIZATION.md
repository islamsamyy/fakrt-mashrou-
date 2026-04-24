# 👤 User Data Initialization System

**Status**: ✅ IMPLEMENTED  
**Date**: April 24, 2026

## Overview

Every new account automatically receives fresh, personalized data when created. This ensures users have a complete experience from day one.

---

## What Gets Initialized on Account Creation

### For ALL Users
```
├─ Profile Record
│  ├─ ID: {user_id}
│  ├─ Email: {user_email}
│  ├─ Full Name: {user_name}
│  ├─ Avatar: Auto-generated (DiceBear API)
│  ├─ Role: founder or investor
│  ├─ KYC Status: pending
│  ├─ Initialized: true
│  └─ Initialized At: {creation_timestamp}
│
└─ Notification Preferences
   ├─ Email Notifications: Enabled
   ├─ Push Notifications: Enabled
   └─ In-App Notifications: Enabled
```

### For FOUNDER Users
```
├─ Sample Project
│  ├─ Title: "مشروع {Full Name}"
│  ├─ Description: Template text with user's name
│  ├─ Category: Technology (التكنولوجيا)
│  ├─ Funding Goal: 500,000 SAR
│  ├─ Minimum Investment: 10,000 SAR
│  ├─ ROI: 25%
│  ├─ Status: draft (ready to edit)
│  └─ Created: {timestamp}
│
└─ Profile Fields Set
   ├─ Role: founder
   └─ Interests: Empty (set during onboarding)
```

### For INVESTOR Users
```
├─ Profile Fields Set
│  ├─ Role: investor
│  └─ Interests: Set during onboarding
│
└─ Ready For
   ├─ Browsing Opportunities
   ├─ Saving Projects
   └─ Making Investments
```

---

## Data Flow During Registration

```
User submits registration form
    ↓
Backend validates inputs
    ↓
Create Supabase Auth account
    ↓
Insert profile record
    ↓
Create notification preferences
    ↓
Call initializeUserData()
    ├─ IF founder:
    │  └─ Create sample project
    ├─ IF investor:
    │  └─ Mark as investor
    └─ Update profile.initialized = true
    ↓
Redirect to onboarding
    ↓
User selects interests
    ↓
updateProfile() saves interests
    ↓
Redirect to dashboard
```

---

## Database Tables Used

### profiles
- `id` - User ID (UUID)
- `email` - User email
- `full_name` - User's full name
- `role` - "founder" or "investor"
- `avatar_url` - Auto-generated avatar
- `kyc_status` - KYC verification status
- `interests` - Array of interests (set during onboarding)
- `initialized` - Boolean flag (true = setup complete)
- `initialized_at` - Timestamp of setup
- `created_at` - Account creation time

### projects
- `id` - Project ID (UUID)
- `founder_id` - References profiles.id
- `title` - Project name
- `description` - Project details
- `category` - Industry category
- `funding_goal` - Target amount in SAR
- `amount_raised` - Current fundraising progress
- `min_invest` - Minimum investment amount
- `roi` - Expected return on investment
- `status` - "draft" or "active" or other
- `verified` - Admin verification flag
- `created_at` - Creation timestamp

### notification_preferences
- `user_id` - References profiles.id
- `email_on_investment` - Boolean
- `email_on_message` - Boolean
- `email_on_kyc_update` - Boolean
- `email_on_milestone` - Boolean
- `push_on_investment` - Boolean
- `push_on_message` - Boolean
- `in_app_notifications` - Boolean
- `created_at` - Creation timestamp

---

## Code Implementation

### In app/auth/actions.ts

```typescript
// During registration, after profile creation:
await initializeUserData(supabase, userId, role, fullName)

// The initializeUserData() function:
// 1. If founder: Creates a sample project
// 2. If investor: Logs as investor setup
// 3. Marks profile as initialized with timestamp
// 4. Handles errors gracefully (doesn't block account creation)
```

### Initialization Function

```typescript
async function initializeUserData(
  supabase: any,
  userId: string,
  role: string,
  fullName: string
) {
  // Founder gets a sample project
  if (role === 'founder') {
    await supabase.from('projects').insert({
      founder_id: userId,
      title: `مشروع ${fullName}`,
      description: `مشروع تجريبي...`,
      category: 'التكنولوجيا',
      funding_goal: 500000,
      min_invest: 10000,
      roi: '25%',
      status: 'draft',
    })
  }

  // Mark as initialized
  await supabase.from('profiles').update({
    initialized: true,
    initialized_at: new Date().toISOString(),
  }).eq('id', userId)
}
```

---

## User Experience Timeline

### Registration → Founder Dashboard

```
1. Sign up as Founder
   ├─ Name: محمد الساير
   ├─ Email: founder@test.com
   └─ Password: Test123456!
          ↓
2. Backend initializes
   ├─ Create profile ✅
   ├─ Create notifications ✅
   ├─ Create sample project "مشروع محمد الساير" ✅
   └─ Mark initialized ✅
          ↓
3. Redirect to onboarding
   ├─ Select interests
   ├─ Confirm role
   └─ Save preferences
          ↓
4. Dashboard loads
   ├─ See sample project (draft status)
   ├─ Can edit/publish it
   └─ Can create new projects
          ↓
5. User can immediately:
   ├─ Edit sample project
   ├─ View investor inquiries
   ├─ Check funding progress
   └─ Upload project documents
```

### Registration → Investor Dashboard

```
1. Sign up as Investor
   ├─ Name: فاطمة الخالدي
   ├─ Email: investor@test.com
   └─ Password: Test123456!
          ↓
2. Backend initializes
   ├─ Create profile ✅
   ├─ Create notifications ✅
   └─ Mark initialized ✅
          ↓
3. Redirect to onboarding
   ├─ Select interests
   ├─ Confirm role
   └─ Save preferences
          ↓
4. Dashboard loads
   ├─ Opportunities filtered by interests
   ├─ Empty portfolio (no investments yet)
   └─ Saved list empty
          ↓
5. User can immediately:
   ├─ Browse opportunities
   ├─ Filter by category
   ├─ Save projects
   └─ View investment details
```

---

## Fallback Behavior

If initialization fails:
- ✅ Account is still created
- ✅ Profile is still created
- ✅ Notifications are still created
- ⚠️ Sample data might not be created (optional)
- ✅ User can still log in and complete onboarding
- ✅ Data can be created manually later

This ensures account creation always succeeds even if optional initialization steps fail.

---

## Testing the Initialization

### Test Founder Account
```bash
# 1. Register
Visit http://localhost:3000/register
Select: مؤسس (Founder)
Email: founder@test.com
Password: Test123456!

# 2. Verify database
SELECT * FROM profiles WHERE email = 'founder@test.com';
-- Should show: initialized = true, role = 'founder'

SELECT * FROM projects WHERE founder_id = (
  SELECT id FROM profiles WHERE email = 'founder@test.com'
);
-- Should show: 1 sample project with status 'draft'

SELECT * FROM notification_preferences 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'founder@test.com');
-- Should show: all notification flags true
```

### Test Investor Account
```bash
# 1. Register
Visit http://localhost:3000/register
Select: مستثمر (Investor)
Email: investor@test.com
Password: Test123456!

# 2. Verify database
SELECT * FROM profiles WHERE email = 'investor@test.com';
-- Should show: initialized = true, role = 'investor'

SELECT * FROM notification_preferences 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'investor@test.com');
-- Should show: all notification flags true
```

---

## Future Enhancements

- [ ] Create default portfolio record for investors
- [ ] Add sample saved opportunities for investors
- [ ] Create welcome messages in notifications
- [ ] Add seed investment data for testing
- [ ] Send welcome email with first steps
- [ ] Create referral code for user
- [ ] Initialize subscription tier tracking

---

## Files Modified

- `app/auth/actions.ts` — Added `initializeUserData()` function
- `supabase/migrations/20260424000001_add_initialization_fields.sql` — New migration

## Migration Status

Run this migration on Supabase:
```bash
# This adds the initialization tracking columns to profiles
supabase migration up
```

