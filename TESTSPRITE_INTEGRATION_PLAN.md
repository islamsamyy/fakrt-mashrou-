# TestSprite Integration & Testing Plan

**Status:** 🚀 Ready to Execute  
**Date:** April 23, 2026  
**Objective:** Complete API testing via TestSprite

---

## Phase 1: Authentication Tests (Start Here) ✅

### Test 1.1: User Registration
```
API: POST /auth/register
Expected: 201 Created + User object with ID
Test Data:
{
  "email": "testinvestor@testsprite.com",
  "password": "TestPass123",
  "fullName": "Test Investor",
  "role": "investor"
}

✓ Verify: Returns user ID
✓ Verify: Email is unique (try duplicate → 409 Conflict)
✓ Verify: Password meets requirements
```

### Test 1.2: User Login
```
API: POST /auth/login
Expected: 200 OK + JWT token
Test Data:
{
  "email": "testinvestor@testsprite.com",
  "password": "TestPass123"
}

✓ Verify: Returns auth token
✓ Verify: Token is JWT format
✓ Verify: Wrong password → 401 Unauthorized
```

### Test 1.3: Token Validation
```
Use JWT token from Test 1.2 for all subsequent tests
Header: Authorization: Bearer {token}
```

---

## Phase 2: Project Management (Depends on Phase 1) 🔄

### Test 2.1: List All Projects
```
API: GET /api/projects
Expected: 200 OK + Array of projects
Query: ?category=AI&limit=10

✓ Verify: Returns array
✓ Verify: Each project has: id, title, fundingGoal, amount_raised
✓ Verify: Category filter works
```

### Test 2.2: Create Project (as Founder)
```
First: Register founder account
API: POST /api/projects
Auth: Bearer {founder_token}
Expected: 201 Created

Body:
{
  "title": "TestSprite AI Trading Bot",
  "description": "AI-powered trading automation",
  "category": "AI",
  "fundingGoal": 5000000,
  "targetInvestors": 10
}

✓ Verify: Project created with ID
✓ Verify: founder_id matches logged-in user
✓ Verify: Amount raised = 0 initially
✓ Save project ID for later tests
```

### Test 2.3: Get Project Details
```
API: GET /api/projects/{projectId}
Expected: 200 OK + Full project object

✓ Verify: All fields populated
✓ Verify: Founder information included
```

---

## Phase 3: Investment Flow (Depends on Phase 1 & 2) 💰

### Test 3.1: Browse Opportunities
```
API: GET /api/opportunities
Auth: Bearer {investor_token}
Expected: 200 OK + Investment opportunities

✓ Verify: Shows available projects
✓ Verify: Filters work
```

### Test 3.2: Create Investment
```
API: POST /api/investments
Auth: Bearer {investor_token}
Expected: 201 Created

Body:
{
  "projectId": "{projectId_from_Test_2.2}",
  "amount": 500000
}

✓ Verify: Investment record created
✓ Verify: Amount is valid (1K-10M SAR)
✓ Verify: Too low amount → 422 Validation Error
✓ Verify: Too high amount → 422 Validation Error
✓ Save investment ID
```

### Test 3.3: Get Portfolio
```
API: GET /api/portfolio
Auth: Bearer {investor_token}
Expected: 200 OK + Investment list

✓ Verify: Shows investment from Test 3.2
✓ Verify: Total invested calculated correctly
```

### Test 3.4: Verify Project Funding Updated
```
API: GET /api/projects/{projectId}
Expected: amount_raised should be 500000

✓ **CRITICAL:** Verify trigger updated funding
✓ Verify: Leaderboard would recalculate
```

---

## Phase 4: Payout System (Depends on Phase 1 & 2) 🏦

### Test 4.1: Request Payout (as Founder)
```
API: POST /api/payouts
Auth: Bearer {founder_token}
Expected: 201 Created

Body:
{
  "projectId": "{projectId}",
  "amount": 250000
}

✓ Verify: Payout record created
✓ Verify: Status = "pending"
✓ Verify: Cannot payout more than earned
✓ Save payout ID
```

### Test 4.2: Get Payout History
```
API: GET /api/payouts
Auth: Bearer {founder_token}
Expected: 200 OK + Payout list

✓ Verify: Shows payout from Test 4.1
✓ Verify: All details correct
```

### Test 4.3: Stripe Webhook Simulation
```
Simulate: checkout.payout.updated webhook
Expected: Payout status updated to "processing" or "completed"

✓ Verify: Status changed
✓ Verify: Timestamp updated
```

---

## Phase 5: Messaging (Depends on Phase 1) 💬

### Test 5.1: Send Message
```
API: POST /api/messages
Auth: Bearer {token_user1}
Expected: 201 Created

Body:
{
  "recipientId": "{user2_id}",
  "content": "Are you interested in investing?"
}

✓ Verify: Message created
✓ Verify: Sender ID matches token
✓ Save message ID
```

### Test 5.2: Get Messages
```
API: GET /api/messages/{recipientId}
Auth: Bearer {token_user1}
Expected: 200 OK + Conversation

✓ Verify: Message from Test 5.1 appears
✓ Verify: Correct order (newest first)
```

### Test 5.3: Edit Message
```
API: PATCH /api/messages/{messageId}
Auth: Bearer {token_user1}
Expected: 200 OK

Body:
{
  "content": "Updated message content"
}

✓ Verify: Content updated
✓ Verify: edited_at timestamp set
✓ Try edit after 15 min → Should fail (time window expired)
```

### Test 5.4: Delete Message
```
API: DELETE /api/messages/{messageId}
Auth: Bearer {token_user1}
Expected: 204 No Content

✓ Verify: Message deleted
✓ Try delete as different user → Should fail 403
```

---

## Phase 6: Bookmarks/Save (Depends on Phase 1 & 2) 📌

### Test 6.1: Save Project
```
API: POST /api/opportunities/{projectId}/save
Auth: Bearer {investor_token}
Expected: 200 OK

✓ Verify: Returns { "success": true, "isSaved": true }
```

### Test 6.2: Get Saved Opportunities
```
API: GET /api/opportunities/saved
Auth: Bearer {investor_token}
Expected: 200 OK + Saved projects

✓ Verify: Includes project from Test 6.1
```

### Test 6.3: Remove Bookmark
```
API: DELETE /api/opportunities/{projectId}/save
Auth: Bearer {investor_token}
Expected: 200 OK

✓ Verify: Removed from saved
✓ GET /api/opportunities/saved should not include it
```

---

## Phase 7: Notification Preferences (Depends on Phase 1) 🔔

### Test 7.1: Get Preferences
```
API: GET /api/notifications/preferences
Auth: Bearer {token}
Expected: 200 OK

✓ Verify: All preferences returned
✓ Verify: Defaults are sensible
```

### Test 7.2: Update Preferences
```
API: PATCH /api/notifications/preferences
Auth: Bearer {token}
Expected: 200 OK

Body:
{
  "emailOnInvestment": false,
  "pushOnMessage": true
}

✓ Verify: Changes persisted
✓ GET again → Verify changes saved
```

---

## Phase 8: Leaderboard Rankings (Depends on Phase 1 & 3) 🏆

### Test 8.1: Get Investor Leaderboard
```
API: GET /api/leaderboard/investors?limit=10
Expected: 200 OK + Ranked list

✓ Verify: Our test investor appears
✓ Verify: Score = 390 (from backend test)
✓ Verify: Ranked correctly (highest first)
✓ Verify: Badges awarded correctly
```

### Test 8.2: Get Founder Leaderboard
```
API: GET /api/leaderboard/founders?limit=10
Expected: 200 OK + Ranked list

✓ Verify: Our test founder appears
✓ Verify: Score calculated correctly
✓ Verify: Fund raised updated after investment
```

### Test 8.3: Verify Score Components
```
Founder score should include:
- 40% from total raised (5M goal, 0.5M invested)
- 25% from project count (1 project)
- 25% from success rate (100% = 1/1 funded)
- 10% bonus if verified

✓ Calculate expected score
✓ Verify actual score matches
```

---

## Phase 9: Admin Operations (Requires Admin Token) 👨‍💼

### Test 9.1: Get All Users
```
First: Register admin account with admin role
API: GET /api/admin/users
Auth: Bearer {admin_token}
Expected: 200 OK + User list

✓ Verify: All users from previous tests appear
✓ Verify: No sensitive data exposed
```

### Test 9.2: Get User Statistics
```
API: GET /api/admin/users?stats=true
Expected: 200 OK

✓ Verify: Total users count
✓ Verify: Investor count
✓ Verify: Founder count
✓ Verify: Verified count
```

### Test 9.3: Approve KYC
```
API: POST /api/admin/kyc/{userId}/approve
Auth: Bearer {admin_token}
Expected: 200 OK

✓ Verify: User KYC status = verified
```

### Test 9.4: Reject KYC
```
API: POST /api/admin/kyc/{userId}/reject
Auth: Bearer {admin_token}
Expected: 200 OK

Body:
{
  "reason": "Document quality unclear"
}

✓ Verify: User KYC status = rejected
✓ Verify: Reason stored
```

---

## Phase 10: Error Handling & Edge Cases 🚨

### Test 10.1: Validation Errors
```
✓ Invalid email → 422
✓ Weak password → 422
✓ Amount out of range → 422
✓ Required field missing → 422
```

### Test 10.2: Authentication Errors
```
✓ No token → 401
✓ Invalid token → 401
✓ Expired token → 401
✓ Missing Authorization header → 401
```

### Test 10.3: Authorization Errors
```
✓ Non-admin accessing /admin/users → 403
✓ User deleting others' messages → 403
✓ Investor creating projects → 403
```

### Test 10.4: Not Found Errors
```
✓ Non-existent project ID → 404
✓ Non-existent user ID → 404
✓ Non-existent investment → 404
```

### Test 10.5: Conflict Errors
```
✓ Duplicate email registration → 409
✓ Duplicate investment same project → 409
```

---

## Execution Order

```
Phase 1: Auth (Required for everything)
  ↓
Phase 2: Projects (Required for Phase 3,4,8)
  ↓
Phase 3: Investments (Updates funding)
  ↓
Phase 4: Payouts (Uses funding from Phase 3)
  ↓
Phase 5,6,7: Parallel (Independent)
  ↓
Phase 8: Leaderboard (Depends on Phase 3 data)
  ↓
Phase 9: Admin (Uses created users)
  ↓
Phase 10: Error Cases (Should fail gracefully)
```

---

## Success Criteria

- ✅ All 50+ tests passing
- ✅ Latency < 1s per request
- ✅ No data leaks in responses
- ✅ RLS policies enforced
- ✅ Database triggers working
- ✅ Error messages descriptive
- ✅ All validations working
- ✅ Leaderboard scores correct

---

## TestSprite Dashboard Setup

1. **Create Test Suite:** "IDEA BUSINESS Full Flow"
2. **Add Tests in order** (Phases 1-10)
3. **Set up data dependencies** using variables
4. **Enable assertions** for status codes & response structure
5. **Run full suite** → Should take ~2-3 minutes
6. **View report** → 100% pass rate 🎉

---

## Next Actions

1. ⏭️ Add Phase 1 tests to TestSprite (Auth)
2. ⏭️ Get JWT token from login test
3. ⏭️ Add Phase 2 tests (Projects)
4. ⏭️ Continue through all phases
5. ⏭️ View results and debug any failures
6. ⏭️ Generate final test report

---

**Estimated Time:** 30 minutes to set up all tests  
**Estimated Run Time:** 2-3 minutes for full suite  
**Expected Result:** 🎉 All tests passing, production ready
