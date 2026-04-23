# TestSprite Quick Setup - Copy & Paste

## Base URL
```
https://fakrt-mashrou.vercel.app
```

---

## API 1: Authentication

### Endpoint 1a: Register
- **API Name:** `auth-register`
- **URL:** `https://fakrt-mashrou.vercel.app/auth/register`
- **Method:** POST
- **Auth Type:** None
- **Body:**
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123",
  "fullName": "Test User",
  "role": "investor"
}
```

### Endpoint 1b: Login
- **API Name:** `auth-login`
- **URL:** `https://fakrt-mashrou.vercel.app/auth/login`
- **Method:** POST
- **Auth Type:** None
- **Body:**
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123"
}
```

---

## API 2: Projects

### Endpoint 2a: Get All Projects
- **API Name:** `projects-list`
- **URL:** `https://fakrt-mashrou.vercel.app/api/projects?category=AI&limit=10`
- **Method:** GET
- **Auth Type:** None

### Endpoint 2b: Create Project
- **API Name:** `projects-create`
- **URL:** `https://fakrt-mashrou.vercel.app/api/projects`
- **Method:** POST
- **Auth Type:** Bearer Token
- **Body:**
```json
{
  "title": "AI Trading Bot",
  "description": "Automated trading platform",
  "category": "AI",
  "fundingGoal": 5000000
}
```

---

## API 3: Investments

### Endpoint 3a: Get Portfolio
- **API Name:** `portfolio-get`
- **URL:** `https://fakrt-mashrou.vercel.app/api/portfolio`
- **Method:** GET
- **Auth Type:** Bearer Token

### Endpoint 3b: Create Investment
- **API Name:** `investment-create`
- **URL:** `https://fakrt-mashrou.vercel.app/api/investments`
- **Method:** POST
- **Auth Type:** Bearer Token
- **Body:**
```json
{
  "projectId": "project-id-here",
  "amount": 500000
}
```

---

## API 4: Payouts

### Endpoint 4a: Request Payout
- **API Name:** `payouts-request`
- **URL:** `https://fakrt-mashrou.vercel.app/api/payouts`
- **Method:** POST
- **Auth Type:** Bearer Token
- **Body:**
```json
{
  "projectId": "project-id-here",
  "amount": 1000000
}
```

### Endpoint 4b: Get Payouts
- **API Name:** `payouts-list`
- **URL:** `https://fakrt-mashrou.vercel.app/api/payouts`
- **Method:** GET
- **Auth Type:** Bearer Token

---

## API 5: Messages

### Endpoint 5a: Send Message
- **API Name:** `messages-send`
- **URL:** `https://fakrt-mashrou.vercel.app/api/messages`
- **Method:** POST
- **Auth Type:** Bearer Token
- **Body:**
```json
{
  "recipientId": "user-id-here",
  "content": "Are you interested in this project?"
}
```

### Endpoint 5b: Get Messages
- **API Name:** `messages-get`
- **URL:** `https://fakrt-mashrou.vercel.app/api/messages/user-id-here`
- **Method:** GET
- **Auth Type:** Bearer Token

---

## API 6: Bookmarks

### Endpoint 6a: Save Project
- **API Name:** `bookmarks-save`
- **URL:** `https://fakrt-mashrou.vercel.app/api/opportunities/project-id-here/save`
- **Method:** POST
- **Auth Type:** Bearer Token

### Endpoint 6b: Get Saved
- **API Name:** `bookmarks-list`
- **URL:** `https://fakrt-mashrou.vercel.app/api/opportunities/saved`
- **Method:** GET
- **Auth Type:** Bearer Token

---

## API 7: Leaderboard

### Endpoint 7a: Investor Rankings
- **API Name:** `leaderboard-investors`
- **URL:** `https://fakrt-mashrou.vercel.app/api/leaderboard/investors?limit=10`
- **Method:** GET
- **Auth Type:** None

### Endpoint 7b: Founder Rankings
- **API Name:** `leaderboard-founders`
- **URL:** `https://fakrt-mashrou.vercel.app/api/leaderboard/founders?limit=10`
- **Method:** GET
- **Auth Type:** None

---

## API 8: Admin

### Endpoint 8a: Get All Users
- **API Name:** `admin-users-list`
- **URL:** `https://fakrt-mashrou.vercel.app/api/admin/users`
- **Method:** GET
- **Auth Type:** Bearer Token (Admin role required)

### Endpoint 8b: Approve KYC
- **API Name:** `admin-kyc-approve`
- **URL:** `https://fakrt-mashrou.vercel.app/api/admin/kyc/user-id-here/approve`
- **Method:** POST
- **Auth Type:** Bearer Token (Admin role required)
- **Body:**
```json
{
  "status": "approved"
}
```

---

## Test Scenarios

### Scenario 1: User Registration & Login
1. Call `auth-register` → Get user ID
2. Call `auth-login` → Get JWT token
3. Use token in `Authorization: Bearer {token}` header for protected endpoints

### Scenario 2: Create & Browse Projects
1. Call `projects-create` (as founder) → Get project ID
2. Call `projects-list` → Verify project appears

### Scenario 3: Investment Flow
1. Call `projects-list` → Get project ID
2. Call `investment-create` → Create investment
3. Call `portfolio-get` → Verify investment shows

### Scenario 4: Payout Flow
1. Call `payouts-request` → Create payout
2. Call `payouts-list` → Verify payout appears

### Scenario 5: Messaging
1. Call `messages-send` → Send message
2. Call `messages-get` → Retrieve conversation

### Scenario 6: Leaderboards
1. Call `leaderboard-investors` → Get rankings
2. Call `leaderboard-founders` → Get rankings
3. Verify scores and badges

---

## Setup Steps in TestSprite

1. **Add APIs one group at a time**
2. **Test each endpoint individually first**
3. **Then create scenarios combining multiple endpoints**
4. **Set up data dependencies** (e.g., use project ID from create → use in investment)
5. **Add assertions** for response status, data structure, and values

---

## Common Headers

For all Bearer Token endpoints, add:
```
Authorization: Bearer {jwt_token_from_login}
Content-Type: application/json
```

---

**Next Step:** Start adding APIs to TestSprite dashboard! 🚀
