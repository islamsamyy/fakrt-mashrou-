# IDEA BUSINESS — Product Requirements Document

## Overview
IDEA BUSINESS is an Arabic-first investment platform connecting founders seeking funding with investors. It is a Next.js 16.2.3 web application with Supabase backend, Stripe payments, and role-based access control.

## User Roles
- **Founder**: Creates projects, seeks funding, requests payouts
- **Investor**: Discovers projects, invests money, manages portfolio
- **Admin**: Manages users, reviews KYC, oversees platform

## Core Features

### 1. Authentication
- Register with email, password, full name, role (founder/investor)
- Login with email + password → returns JWT token
- Duplicate email returns 409 Conflict
- Wrong credentials return 401
- Empty fields return 400
- Email supports + character (e.g. user+tag@example.com)
- Token auto-refresh before expiry

### 2. Project Management (Founder)
- Create project: title, description, category, funding goal (50K–100M SAR)
- Edit project details
- View project funding progress
- Request payout when funded

### 3. Investment Discovery (Investor)
- Browse all active projects on /discover
- Filter by category (AI, FinTech, SaaS, Health, etc.)
- Search by keyword
- View trending projects on /trending
- Save/bookmark projects

### 4. Investment Flow
- View project details at /opportunities/[id]
- Invest amount between 1,000–10,000,000 SAR via POST /api/invest
- Complete payment via Stripe checkout
- View portfolio at /portfolio

### 5. KYC Verification
- 4-step identity verification
- Upload national ID
- Admin reviews and approves/rejects

### 6. Messaging
- Send messages between investor and founder
- Edit messages within 15 minutes
- Delete own messages only

### 7. Notifications
- Real-time alerts for investments, KYC status, messages
- 9 configurable notification preferences

### 8. Leaderboard
- Top investors ranked by score (invested amount, deal count, diversity, KYC)
- Top founders ranked by score (amount raised, projects, success rate)

### 9. Admin Panel
- View all users with role and KYC status
- Approve/reject KYC applications
- Platform analytics

### 10. Role-Based Access Control
- /admin: admin only
- /dashboard/investor: investor + admin
- /dashboard/founder: founder + admin
- /portfolio, /saved: investor + admin
- Unauthenticated users redirected to /login

## API Endpoints
- POST /api/invest — Create investment (auth required)
- POST /api/webhooks/stripe — Handle Stripe events

## Tech Stack
- Next.js 16.2.3, React 19, TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- Stripe for payments
- Tailwind CSS, RTL/Arabic support
- Vercel deployment

## Non-Functional Requirements
- Arabic language UI (RTL)
- Mobile responsive (hamburger menu on <768px)
- Pages load < 3 seconds
- XSS prevention, input sanitization
- HTTPS only in production
