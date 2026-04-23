# TestSprite API Testing Configuration

## Project: IDEA BUSINESS
**Base URL:** `https://fakrt-mashrou.vercel.app`

---

## 1. AUTHENTICATION APIs

### Login
- **Endpoint:** `POST /auth/login`
- **Description:** User login with email/password
- **Auth Required:** No
- **Body:**
```json
{
  "email": "investor@example.com",
  "password": "Password123"
}
```
- **Expected Response:** 200 OK
```json
{
  "success": true,
  "user": { "id": "...", "email": "..." },
  "session": "..."
}
```

### Register
- **Endpoint:** `POST /auth/register`
- **Description:** Create new user account
- **Auth Required:** No
- **Body:**
```json
{
  "email": "newuser@example.com",
  "password": "StrongPass123",
  "fullName": "محمد أحمد",
  "role": "investor"
}
```
- **Expected Response:** 201 Created

### Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** End user session
- **Auth Required:** Yes (Bearer token)
- **Expected Response:** 200 OK

### Password Reset
- **Endpoint:** `POST /auth/reset-password`
- **Description:** Request password reset
- **Auth Required:** No
- **Body:**
```json
{
  "email": "user@example.com"
}
```
- **Expected Response:** 200 OK (email sent)

---

## 2. PROJECT APIs

### Get All Projects
- **Endpoint:** `GET /api/projects`
- **Description:** Fetch all active projects (with pagination/filtering)
- **Auth Required:** No
- **Query Params:**
  - `category=AI` (optional)
  - `limit=12` (optional)
  - `offset=0` (optional)
- **Expected Response:** 200 OK
```json
{
  "projects": [...],
  "total": 0,
  "hasMore": false
}
```

### Get Project Details
- **Endpoint:** `GET /api/projects/[id]`
- **Description:** Get single project details
- **Auth Required:** No
- **Expected Response:** 200 OK

### Create Project
- **Endpoint:** `POST /api/projects`
- **Description:** Founder creates new project
- **Auth Required:** Yes (Founder role)
- **Body:**
```json
{
  "title": "AI Trading Platform",
  "description": "Smart trading with AI",
  "category": "AI",
  "fundingGoal": 5000000,
  "targetInvestors": 10
}
```
- **Expected Response:** 201 Created

### Update Project
- **Endpoint:** `PATCH /api/projects/[id]`
- **Description:** Update project details
- **Auth Required:** Yes (Founder owner)
- **Expected Response:** 200 OK

---

## 3. INVESTMENT APIs

### Get Investor Opportunities
- **Endpoint:** `GET /api/opportunities`
- **Description:** List projects for investment
- **Auth Required:** Yes (Investor)
- **Expected Response:** 200 OK

### Get Investment Details
- **Endpoint:** `GET /api/investments/[id]`
- **Description:** Get single investment record
- **Auth Required:** Yes
- **Expected Response:** 200 OK

### Create Investment
- **Endpoint:** `POST /api/investments`
- **Description:** Create new investment record
- **Auth Required:** Yes (Investor)
- **Body:**
```json
{
  "projectId": "...",
  "amount": 500000,
  "notes": "Interested in this project"
}
```
- **Expected Response:** 201 Created

### Get User Portfolio
- **Endpoint:** `GET /api/portfolio`
- **Description:** Get all user investments
- **Auth Required:** Yes (Investor)
- **Expected Response:** 200 OK
```json
{
  "investments": [...],
  "totalInvested": 0,
  "portfolioValue": 0
}
```

---

## 4. PAYOUT APIs

### Request Payout
- **Endpoint:** `POST /api/payouts`
- **Description:** Founder requests fund withdrawal
- **Auth Required:** Yes (Founder)
- **Body:**
```json
{
  "projectId": "...",
  "amount": 1000000
}
```
- **Expected Response:** 201 Created
```json
{
  "success": true,
  "payoutId": "...",
  "status": "pending",
  "amount": 1000000
}
```

### Get Payout History
- **Endpoint:** `GET /api/payouts`
- **Description:** Get all payouts for user
- **Auth Required:** Yes (Founder)
- **Expected Response:** 200 OK
```json
{
  "payouts": [
    {
      "id": "...",
      "amount": 1000000,
      "status": "pending",
      "createdAt": "..."
    }
  ]
}
```

### Payout Webhook
- **Endpoint:** `POST /api/webhooks/stripe`
- **Description:** Stripe payout status update
- **Auth Required:** Stripe signature
- **Body:** Stripe webhook payload
- **Expected Response:** 200 OK

---

## 5. MESSAGE APIs

### Send Message
- **Endpoint:** `POST /api/messages`
- **Description:** Send message between users
- **Auth Required:** Yes
- **Body:**
```json
{
  "recipientId": "...",
  "content": "Are you interested in investing?"
}
```
- **Expected Response:** 201 Created

### Get Messages
- **Endpoint:** `GET /api/messages/[userId]`
- **Description:** Get conversation with user
- **Auth Required:** Yes
- **Expected Response:** 200 OK

### Edit Message
- **Endpoint:** `PATCH /api/messages/[id]`
- **Description:** Edit message (within 15 minutes)
- **Auth Required:** Yes (Sender)
- **Body:**
```json
{
  "content": "Updated message content"
}
```
- **Expected Response:** 200 OK

### Delete Message
- **Endpoint:** `DELETE /api/messages/[id]`
- **Description:** Delete message (sender only)
- **Auth Required:** Yes (Sender)
- **Expected Response:** 204 No Content

---

## 6. BOOKMARKS APIs

### Save Opportunity
- **Endpoint:** `POST /api/opportunities/[id]/save`
- **Description:** Bookmark a project
- **Auth Required:** Yes (Investor)
- **Expected Response:** 200 OK
```json
{
  "success": true,
  "isSaved": true
}
```

### Remove Bookmark
- **Endpoint:** `DELETE /api/opportunities/[id]/save`
- **Description:** Remove saved project
- **Auth Required:** Yes (Investor)
- **Expected Response:** 200 OK

### Get Saved Opportunities
- **Endpoint:** `GET /api/opportunities/saved`
- **Description:** Get all bookmarked projects
- **Auth Required:** Yes (Investor)
- **Expected Response:** 200 OK

---

## 7. NOTIFICATION APIs

### Get Preferences
- **Endpoint:** `GET /api/notifications/preferences`
- **Description:** Get user notification settings
- **Auth Required:** Yes
- **Expected Response:** 200 OK
```json
{
  "emailOnInvestment": true,
  "emailOnMessage": true,
  "pushOnInvestment": true,
  "inAppNotifications": true
}
```

### Update Preferences
- **Endpoint:** `PATCH /api/notifications/preferences`
- **Description:** Update notification settings
- **Auth Required:** Yes
- **Body:**
```json
{
  "emailOnInvestment": false,
  "pushOnMessage": true
}
```
- **Expected Response:** 200 OK

---

## 8. LEADERBOARD APIs

### Get Investor Leaderboard
- **Endpoint:** `GET /api/leaderboard/investors`
- **Description:** Get ranked investor list
- **Auth Required:** No
- **Query Params:**
  - `limit=10` (optional)
  - `page=1` (optional)
- **Expected Response:** 200 OK
```json
{
  "investors": [
    {
      "rank": 1,
      "name": "...",
      "score": 920,
      "badges": ["mega_investor", "verified"]
    }
  ]
}
```

### Get Founder Leaderboard
- **Endpoint:** `GET /api/leaderboard/founders`
- **Description:** Get ranked founder list
- **Auth Required:** No
- **Expected Response:** 200 OK

---

## 9. ADMIN APIs

### Get All Users
- **Endpoint:** `GET /api/admin/users`
- **Description:** List all platform users
- **Auth Required:** Yes (Admin)
- **Query Params:**
  - `role=investor|founder` (optional)
  - `status=active|inactive` (optional)
- **Expected Response:** 200 OK

### Get User Details
- **Endpoint:** `GET /api/admin/users/[id]`
- **Description:** Get specific user info
- **Auth Required:** Yes (Admin)
- **Expected Response:** 200 OK

### Update User Role
- **Endpoint:** `PATCH /api/admin/users/[id]/role`
- **Description:** Change user role
- **Auth Required:** Yes (Admin)
- **Body:**
```json
{
  "role": "investor",
  "tier": "premium"
}
```
- **Expected Response:** 200 OK

### Approve KYC
- **Endpoint:** `POST /api/admin/kyc/[id]/approve`
- **Description:** Approve user KYC verification
- **Auth Required:** Yes (Admin)
- **Expected Response:** 200 OK

### Reject KYC
- **Endpoint:** `POST /api/admin/kyc/[id]/reject`
- **Description:** Reject KYC with reason
- **Auth Required:** Yes (Admin)
- **Body:**
```json
{
  "reason": "Document unclear"
}
```
- **Expected Response:** 200 OK

---

## 10. VALIDATION APIs

### Validate Email
- **Endpoint:** `POST /api/validate/email`
- **Description:** Check email validity
- **Auth Required:** No
- **Body:**
```json
{
  "email": "test@example.com"
}
```
- **Expected Response:** 200 OK
```json
{
  "valid": true,
  "errors": []
}
```

### Validate Amount
- **Endpoint:** `POST /api/validate/amount`
- **Description:** Check investment/funding amount
- **Auth Required:** No
- **Body:**
```json
{
  "amount": 500000,
  "type": "investment"
}
```
- **Expected Response:** 200 OK
```json
{
  "valid": true,
  "min": 1000,
  "max": 10000000
}
```

---

## Test Scenarios to Create in TestSprite

### Scenario 1: Complete Investment Flow
1. Register as investor
2. Browse projects
3. Invest in project
4. Verify investment appears in portfolio
5. Request payout (as founder)

### Scenario 2: Message Flow
1. Send message between users
2. Edit message
3. Delete message
4. Verify deletion

### Scenario 3: Notification Preferences
1. Get current preferences
2. Update preferences
3. Verify changes persisted

### Scenario 4: Leaderboard Ranking
1. Get investor leaderboard
2. Get founder leaderboard
3. Verify ranking order
4. Check score calculations

### Scenario 5: Admin Operations
1. Get all users (admin only)
2. Approve KYC
3. Verify user status updated

### Scenario 6: Error Handling
1. Invalid email format
2. Investment amount too low
3. Unauthorized access
4. Missing required fields
5. Duplicate project creation

---

## Authentication Headers

For protected endpoints, include:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

---

## Expected Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Server Error |

---

## Rate Limiting

- API rate limit: 100 requests/minute
- Payout limit: 5 per day
- Message send: 1 per 2 seconds

---

## Next Steps in TestSprite

1. ✅ Add base URL: `https://fakrt-mashrou.vercel.app`
2. ✅ Add all endpoints above
3. ⏭️ Set up test cases for each endpoint
4. ⏭️ Create test scenarios
5. ⏭️ Run tests and view results
6. ⏭️ Set up CI/CD integration

---

**Note:** Some endpoints are server actions (not traditional REST APIs). For those, use POST to `/api/actions` with action name in body.
