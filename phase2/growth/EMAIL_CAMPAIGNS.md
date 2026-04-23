# Email Drip Campaign Documentation

## Campaign Overview

This document outlines the email marketing strategy for IDEA BUSINESS, including welcome emails, onboarding sequences, weekly digests, and transaction confirmations.

---

## 1. Welcome Email (On Signup)

### Purpose
Activate new users and set expectations for the platform

### Template: `welcome-email.ts`
```
Subject: مرحباً بك في IDEA BUSINESS - ابدأ رحلتك الاستثمارية
From: hello@ideabusiness.sa
```

### Content Structure
- **Header**: Logo + Welcome message
- **Main CTA**: Complete your profile
- **Key Benefits**: 3-5 main features
- **Footer**: Social links + Unsubscribe

### Trigger
- User completes registration
- Sent immediately (within 5 minutes)

### Variables
- `{user_name}` - User's full name
- `{profile_type}` - Founder/Investor
- `{unsubscribe_link}` - Compliance

### Performance Goals
- Open Rate: 40%+
- Click Rate: 15%+
- Conversion: 25% complete profile

---

## 2. Onboarding Email Sequence (3 Emails Over 7 Days)

### Email 1: Day 0 - Account Setup & KYC
**Subject**: اكتمل عملية التحقق الأمنية (KYC) في دقيقتين فقط

**Content**:
- Why KYC is important (safety, legal compliance)
- Step-by-step guide to complete verification
- Estimated time: 2 minutes
- CTA Button: "ابدأ التحقق"

**Timing**: Sent immediately after welcome email

---

### Email 2: Day 3 - Platform Orientation
**Subject**: استكشف الميزات الأساسية وكيفية استخدام المنصة

**Content**:
- Walkthrough video/gif
- Key features based on user role:
  - **For Founders**: How to submit project, set milestones
  - **For Investors**: How to browse opportunities, set preferences
- Tips from successful users
- CTA: Explore the dashboard

**Timing**: Sent 3 days after signup

---

### Email 3: Day 7 - First Action
**Subject**: احصل على أولى النتائج - خطوتك الأولى نحو النجاح

**Content**:
- Success stories from similar users
- Case study: Project X to funding in 4 weeks
- Personalized recommendations:
  - If Founder: Matching investors waiting for projects like yours
  - If Investor: 5 opportunities matching your criteria
- CTA: "ابدأ الآن"

**Timing**: Sent 7 days after signup

---

## 3. Weekly Digest Email

### Purpose
Keep users engaged with relevant opportunities and market insights

### Schedule
- **Frequency**: Every Monday at 9:00 AM Saudi Time (UTC+3)
- **Target**: Users with confirmed profiles
- **Content**: Personalized based on user preferences

### Template Structure

**Subject Line Examples**:
- "أسبوعك الاستثماري: 5 فرص جديدة تنتظرك"
- "التقرير الأسبوعي: أفضل المشاريع هذا الأسبوع"

**Sections**:
1. **Weekly Headline**: Market summary (2-3 sentences)
2. **Top Opportunities**: 3-5 personalized recommendations
   - Project thumbnail
   - 2-line description
   - Funding stage
   - CTA: "View Details"
3. **Market Insights**: 1-2 stats/trends
4. **Trending Keywords**: Top 3 industries trending this week
5. **Success Story**: Weekly featured success (project got funded)
6. **Platform News**: New features, updates
7. **Footer**: Preferences + Unsubscribe

### Personalization Rules

**For Investors**:
- Show opportunities matching investment criteria
- Projects in preferred sectors
- Stage (pre-seed, seed, Series A)
- Funding amount matching average investment

**For Founders**:
- Show investor profiles matching needs
- Investors with success in similar sectors
- Investment size and stage preferences
- Recent investor activity

### Performance Metrics
- Target Open Rate: 35%
- Target Click Rate: 12%
- Target Unsubscribe Rate: <0.5%

---

## 4. Investment Confirmation Email

### Purpose
Confirm investment transaction, provide legal docs, set expectations

### Trigger
- Investment payment confirmed
- Investment status = "paid"

### Template Structure

**Subject**: تم تأكيد استثمارك بنجاح في {project_name}

**Content**:
- Congratulations message
- Investment details:
  - Amount
  - Date
  - Project name
  - Investor share percentage
- Legal documents:
  - Investment agreement (PDF)
  - Share certificate
  - Terms & conditions
- Next steps:
  - When you'll receive updates
  - How to track project progress
  - Contact person for questions
- Portfolio link: View investment in dashboard

**Variables**:
- `{investor_name}`
- `{project_name}`
- `{amount_invested}`
- `{share_percentage}`
- `{investment_date}`
- `{founder_name}`
- `{document_links}`

### Timing
- Sent within 1 hour of payment confirmation
- Include reminder: "Save this email for legal purposes"

---

## 5. Email Best Practices

### Compliance
- Include unsubscribe link on all emails
- Honor user preferences (frequency, content type)
- GDPR/Saudi PDPA compliant
- Clear privacy policy link in footer

### Design
- Mobile responsive (tested on iOS + Android)
- Arabic/English optimized
- Right-to-left (RTL) layout for Arabic
- Max 600px width
- Clear CTA buttons

### Timing
- Send during business hours (9 AM - 5 PM Saudi Time)
- Avoid weekends (Fridays-Saturdays in Saudi)
- Test send times for maximum engagement

### Segmentation Strategy

| Segment | Email Type | Frequency |
|---------|-----------|-----------|
| New User | Onboarding | 3 over 7 days |
| Active Investor | Weekly Digest | Every Monday |
| Active Founder | Weekly Digest | Every Monday |
| Inactive (30+ days) | Re-engagement | Every 2 weeks |
| Unverified KYC | Reminder | Day 2, Day 5 |

---

## 6. Email Templates (Code)

### Location
All email templates stored in: `/lib/email/templates/`

### Files
- `welcome.ts` - Welcome email template
- `onboarding-1.ts` - KYC reminder
- `onboarding-2.ts` - Platform orientation
- `onboarding-3.ts` - First action
- `weekly-digest.ts` - Weekly digest
- `investment-confirmation.ts` - Investment confirmation

### Sending Service
- **Provider**: Resend (resend.io)
- **API Key**: Environment variable `RESEND_API_KEY`
- **From Email**: hello@ideabusiness.sa
- **Sender Name**: IDEA BUSINESS

---

## 7. Future Enhancements

### Planned Features
- [ ] A/B testing for subject lines
- [ ] Predictive send time optimization
- [ ] SMS notifications for critical events
- [ ] Push notifications for mobile app
- [ ] Behavioral email triggers (project updated, investor profile viewed)
- [ ] Dynamic content blocks based on user activity

### Advanced Campaigns
- Win-back campaign for inactive users
- Referral incentive campaign
- Milestone celebration emails (project got funded!)
- Post-investment check-in series
- Quarterly performance reports

---

## 8. Analytics & KPIs

### Metrics to Track
- **Email Delivery**: % delivered, bounces, spam complaints
- **Engagement**: Open rate, click rate, time spent
- **Conversion**: Profile completion, KYC completion, actions taken
- **Retention**: Unsubscribe rate, preference updates
- **ROI**: Cost per email vs. revenue generated

### Dashboard Location
Analytics accessible at: `/admin/email-analytics`

---

## 9. Resend API Setup

### Installation
```bash
npm install resend
```

### Environment Configuration
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_EMAIL_FROM=hello@ideabusiness.sa
```

### Usage Example
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.NEXT_PUBLIC_EMAIL_FROM,
  to: user_email,
  subject: 'مرحباً بك في IDEA BUSINESS',
  html: welcomeEmailTemplate(user),
});
```

---

## 10. Testing Procedures

### Before Launch
- [ ] Test all email templates in Outlook, Gmail, iOS Mail
- [ ] Verify RTL rendering for Arabic content
- [ ] Check unsubscribe link functionality
- [ ] Test all CTA buttons and links
- [ ] Verify variables populate correctly
- [ ] Send test email to multiple addresses

### Load Testing
- Verify system can send 10K emails per hour
- Monitor email delivery times
- Track Resend API rate limits

---

## 11. Legal Disclaimers

All emails must include:
- Clear unsubscribe mechanism
- Company contact information
- Privacy policy link
- Compliance notice (PDPA for Saudi Arabia)

---

**Document Version**: 1.0
**Last Updated**: April 23, 2024
**Maintained By**: Growth Team
**Next Review**: May 23, 2024
