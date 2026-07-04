# Technical Stack & Architecture Document
## Project: Loan Tracker Enterprise Portal

This document outlines the software architecture, selected technologies, database design, directory structure, and development patterns.

---

### 1. Technology Selection

## Frontend
* **Vite + React (TypeScript)**: SPA client-side UI compilation.
* **React Router**: Multi-role dashboard client routing.
* **TanStack Query (React Query)**: Server state synchronization, queries, and mutations caching.
* **React Hook Form**: Form state management and client-side validation.
* **Tailwind CSS**: Modern utility styling framework for premium responsive interfaces.
* **Zustand**: Extremely lightweight hook-based state store for managing authentication status, active roles, and UI theme states with zero nested provider boilerplate.

## Backend Platform (Supabase)
* **Supabase**: Treated as managed infrastructure. All business logic is centralized in Edge Functions, not database triggers or components.
  * **PostgreSQL**: Stores database tables, relationships, and constraints.
  * **Authentication**: Managed JWT session authentication.
  * **Storage**: Document storage buckets for KYC files, property deeds, and receipts (protected via RLS).
  * **Realtime**: Client websocket subscriptions to notify users of status changes instantly.
  * **Edge Functions**: TypeScript runtimes executing Vertical Slice workflows (VSA).

## Database Access
* **Supabase JavaScript Client (`@supabase/supabase-js`)**: Repositories query database tables directly using the `@supabase/supabase-js` client SDK fluent builder API, completely avoiding raw SQL connection pools and raw string database queries.

---

### 2. Monorepo Directory Layout

The workspace is organized as follows:

```
/PRLoanTracker
  ├── PROJECT_REQUIREMENTS.md        # Requirement specifications
  ├── Suggested Tech Stack.md        # Technical guidelines
  ├── TECH_STACK.md                  # This file
  │
  ├── supabase/                      # Supabase configurations & Edge Functions
  │   ├── config.toml                # Supabase project settings
  │   ├── migrations/                # Database schemas & RLS policies
  │   └── functions/
  │       ├── _shared/               # Common backend domain logic
  │       │   ├── auth/              # JWT verification helpers
  │       │   ├── db/                # Supabase Client initialization client
  │       │   ├── domain/            # Lightweight interfaces
  │       │   │   ├── User.ts
  │       │   │   ├── Borrower.ts
  │       │   │   ├── Property.ts
  │       │   │   ├── Loan.ts
  │       │   │   ├── Offer.ts
  │       │   │   ├── Payment.ts
  │       │   │   ├── Bank.ts
  │       │   │   └── LoanRules.ts   # Shared validation business rules
  │       │   ├── repositories/      # Relational database access modules (using supabase-js)
  │       │   │   ├── UserRepository.ts
  │       │   │   ├── LoanRepository.ts
  │       │   │   ├── OfferRepository.ts
  │       │   │   ├── PaymentRepository.ts
  │       │   │   ├── BorrowerRepository.ts
  │       │   │   ├── PropertyRepository.ts
  │       │   │   ├── NotificationRepository.ts
  │       │   │   └── AuditRepository.ts
  │       │   ├── infrastructure/    # Cross-cutting infrastructure utilities
  │       │   │   ├── email.ts
  │       │   │   ├── storage.ts
  │       │   │   ├── logger.ts
  │       │   │   └── cache.ts
  │       │   ├── utils/
  │       │   ├── validation/
  │       │   └── errors/
  │       │
  │       ├── accept-offer/          # VSA Feature: Accept loan offer
  │       │   ├── index.ts           # Deno Function entry point
  │       │   ├── handler.ts         # Business workflow orchestration
  │       │   ├── validator.ts       # Feature-specific request validation
  │       │   └── dto.ts             # Data Transfer Objects
  │       │
  │       ├── approve-kyc/           # VSA Feature: Verify borrower profile
  │       ├── reject-kyc/            # VSA Feature: Flag borrower profile errors
  │       ├── submit-application/    # VSA Feature: File loan login application
  │       ├── issue-sanction/        # VSA Feature: Create banker loan offer
  │       ├── verify-payment/        # VSA Feature: Approve receipt payment
  │       ├── create-property/       # VSA Feature: Onboard real estate property
  │       └── upload-document/       # VSA Feature: Handle upload files to storage
  │
  └── client/                        # React SPA (Vite)
      ├── index.html
      ├── vite.config.ts
      ├── tsconfig.json
      ├── package.json
      └── src/
          ├── assets/
          ├── components/            # Shared UI components
          ├── stores/                # Zustand client state stores
          │   └── useAuthStore.ts    # User login session state
          ├── hooks/                 # TanStack Query mutations & query wrappers
          ├── layouts/               # Dashboard templates & role navbars
          ├── pages/
          │   ├── Login.tsx          # Login & simulated OTP screens
          │   ├── Dashboard.tsx      # Main workspace portal routing
          │   ├── BorrowerPortal.tsx
          │   ├── AgentPortal.tsx
          │   ├── BankerPortal.tsx
          │   └── PropertyPortal.tsx
          ├── styles/
          │   └── main.css           # CSS entry & Tailwind styles
          ├── utils/
          └── main.tsx
```

---

### 3. Database Access & Repositories

Inside Edge Functions, the database is accessed using the `@supabase/supabase-js` client SDK.

* **Database Client (`_shared/db/client.ts`)**:
  Initializes and exports the Supabase client using environment variables.
* **Repositories**:
  Repositories abstract away all database operations using the Supabase client query builder. Handlers never write raw database query builders themselves.
  
Example repository outline:

```typescript
// _shared/repositories/OfferRepository.ts
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Offer } from "../domain/Offer.ts";

export class OfferRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: number): Promise<Offer | null> {
    const { data, error } = await this.supabase
      .from('loan_offers')
      .select('id, application_id, bank_id, sanction_amount, interest_rate, tenure_months, emi_amount, status')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      applicationId: data.application_id,
      bankId: data.bank_id,
      sanctionAmount: data.sanction_amount,
      interestRate: data.interest_rate,
      tenureMonths: data.tenure_months,
      emiAmount: data.emi_amount,
      status: data.status,
    };
  }
}
```

---

### 4. Transactions

Since PostgREST/Supabase client is stateless, multi-record updates or inserts within business workflows are executed sequentially in Edge Function handlers. For operations requiring strict database-level atomicity, handlers execute a Postgres transaction by invoking simple PostgreSQL functions via `.rpc()`, keeping the heavy orchestrations in TypeScript.
