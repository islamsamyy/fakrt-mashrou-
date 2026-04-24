# Quick Start - Test the Registration Form

## To Test the Registration Form Flow

### Option 1: Via Browser (Recommended)
1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/register`
3. Fill in the form:
   - Choose role (مؤسس for founder, مستثمر for investor)
   - Enter full name (e.g., "Ahmed Hassan")
   - Enter email
   - Enter password (min 8 characters)
   - Check the terms & privacy checkbox
   - Click "إنشاء الحساب"
4. Expected result:
   - **With auto email confirmation**: Redirects to `/onboarding?role=founder` or `/onboarding?role=investor`
   - **With email confirmation required**: Shows success message with instructions to verify email

### Option 2: Via API Test Script
```bash
node test_complete_flow_final.js
```

This runs 6 comprehensive tests:
- ✓ Founder registration & initialization
- ✓ Investor registration & initialization  
- ✓ Founder login with JWT token
- ✓ Investor login with JWT token
- ✓ Wrong password rejection
- ✓ Duplicate email prevention

## What Was Fixed

The registration form now properly:
1. ✓ Submits form data to the server
2. ✓ Creates account with role selection
3. ✓ Initializes fresh user data:
   - Founders get a sample project with their name
   - Investors get a ready-to-use profile
4. ✓ **Redirects to onboarding page** (this was the main fix)
5. ✓ Handles email confirmation flow
6. ✓ Shows proper error messages for validation failures

## Key Technical Details

The fix uses Next.js's `useTransition` hook which has special handling for `redirect()` errors thrown from server actions:

```typescript
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  const result = await register(formData);
  // If register() calls redirect(), Next.js handles the navigation
  // If it returns a result, we show error/success message
});
```

This ensures the browser properly navigates after form submission without hanging or requiring page refresh.

## Email Confirmation Status

- **Current Supabase Instance**: Production instance (requires email confirmation)
- **Default Behavior**: Users must verify their email before logging in
- **Custom Config Available**: Can be configured in Supabase project settings to auto-confirm in development

## Troubleshooting

If the form still doesn't redirect:
1. Check browser console for errors: `F12` → Console tab
2. Verify the onboarding page exists: `/onboarding`
3. Ensure the Supabase session is created after registration
4. Check that the form is submitted with the correct role value

For detailed information, see: `REGISTRATION_FIX_SUMMARY.md`
