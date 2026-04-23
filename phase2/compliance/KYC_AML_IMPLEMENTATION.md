# KYC/AML Compliance Implementation

## Overview
Saudi Arabia requires Know Your Customer (KYC) verification for financial platforms. This document outlines the implementation strategy for IDEA BUSINESS.

## Phase 1: Manual Review (Phase 2B)

### Database Schema
```sql
CREATE TABLE kyc_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  
  -- Personal Info
  full_name VARCHAR(255),
  national_id VARCHAR(20) UNIQUE,
  date_of_birth DATE,
  nationality VARCHAR(50),
  
  -- Contact
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  
  -- Status
  verification_status VARCHAR(20), -- pending, approved, rejected
  rejection_reason TEXT,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES auth.users, -- admin
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY,
  kyc_id UUID REFERENCES kyc_data,
  
  document_type VARCHAR(50), -- national_id, passport, driver_license
  file_url TEXT,
  file_size INT,
  file_hash VARCHAR(255), -- for verification
  
  uploaded_at TIMESTAMP DEFAULT now(),
  verified_at TIMESTAMP
);
```

## Phase 2: Automated Verification (Phase 2C)

### Integration with Third-Party Service
- Use IDology, Jumio, or local Saudi provider
- Verify national ID validity
- Check against sanctions lists
- Verify phone number ownership

### Implementation
```typescript
// app/api/kyc/verify/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Call verification service
  const result = await verifyWithIDology({
    firstName: body.firstName,
    lastName: body.lastName,
    ssn: body.nationalId,
    dob: body.dateOfBirth,
  })
  
  // Update KYC status
  if (result.verified) {
    await updateKYCStatus(body.userId, 'approved')
  }
}
```

## AML Monitoring

### Risk Scoring
```typescript
function calculateAMLRisk(user: any): number {
  let risk = 0
  
  // High transaction volume
  if (user.totalInvested > 10000000) risk += 30
  
  // Multiple rapid transactions
  if (user.investmentsLast24h > 5) risk += 25
  
  // High-risk country
  if (HIGH_RISK_COUNTRIES.includes(user.nationality)) risk += 40
  
  // PEP (Politically Exposed Person) check
  if (user.isPEP) risk += 50
  
  return risk
}
```

### Actions
- **Risk < 25**: Approve transaction
- **Risk 25-50**: Flag for review, delay transaction
- **Risk > 50**: Block transaction, notify admin

## Compliance Checklist

- [ ] Implement national ID verification
- [ ] Check against sanctions lists (OFAC, UN)
- [ ] PEP screening
- [ ] Transaction monitoring
- [ ] Document retention (7 years)
- [ ] Audit trail logging
- [ ] Staff training
- [ ] Annual compliance review

