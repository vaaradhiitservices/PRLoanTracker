# Software Development Lifecycle (SDLC) Phase Plan & Tasks Roadmap
## Project: Loan Tracker Enterprise Portal

This document outlines the phased development roadmap, prioritization of tasks, entry/exit criteria, and the testing checkpoints for our system using a **Vertical Slice Architecture (VSA)** workflow.

---

### SDLC Phases & Milestones

```mermaid
gantt
    title Loan Tracker Enterprise Portal - Vertical Slice Roadmap
    dateFormat  YYYY-MM-DD
    section Setup & Scaffold
    Phase 1: App Foundation & Auth      :active, p1, 2026-07-04, 3d
    section Feature Slices
    Phase 2: Slice - Property Owner    :        p2, after p1, 3d
    Phase 3: Slice - Profile & KYC      :        p3, after p2, 4d
    Phase 4: Slice - Loan Sanctions     :        p4, after p3, 4d
    Phase 5: Slice - Active Loans       :        p5, after p4, 4d
    section Audit & Delivery
    Phase 6: Notifications & Audits     :        p6, after p5, 3d
```

---

### Phase 1: Core Foundation & Authentication Setup
* **Objective**: Configure the local Supabase environment (Docker), create initial database schemas (basic `users` and `user_profiles` structures), bootstrap the React Vite frontend with Tailwind CSS, and build a working authentication system using Zustand.
* **Exit Criteria**: React client app running, communicating with local Supabase Auth, and logging users in to a blank Dashboard routing layout.

#### Tasks:
- [ ] **1.1 Supabase CLI Initialization**
  - Run `supabase init`. (completed)
  - Configure `supabase/config.toml` for local development. (completed)
- [ ] **1.2 Database Core Scaffolding**
  - Create the base SQL migration: define initial `user_profiles` table linked to Supabase `auth.users`, and create a default `banks` list. (completed)
- [ ] **1.3 Client Scaffolding (Vite + Tailwind)**
  - Initialize the React TypeScript Vite app inside `/client`.
  - Install Tailwind CSS v3, React Router DOM, Zustand, and TanStack Query.
  - Setup core layouts (Sidebar, Header, responsive viewport grid).
- [ ] **1.4 Session State Store & Auth UI**
  - Implement Zustand store `useAuthStore.ts` to manage token sessions.
  - Build `Login.tsx` with email/phone entry and simulated OTP display.
  - Setup routing guards redirecting users to their respective portals based on roles: `borrower`, `BankAgent`, `PropertyOwner`, `Admin`.

---

### Phase 2: Vertical Slice — Property Onboarding
* **Objective**: Deliver property registration end-to-end: database structures, VSA Edge Function, client components, and validation.
* **Exit Criteria**: PropertyOwners can list properties and upload property documents, and other roles can see the list.

#### Tasks:
- [ ] **2.1 Database & RLS**
  - Add `properties` table migration with foreign key to `user_profiles` (PropertyOwner user).
  - Define RLS policies: PropertyOwners write/read own listings; other roles read all verified listings.
- [ ] **2.2 Backend VSA (create-property)**
  - Define domain interfaces: `Property.ts` in `_shared/domain/`.
  - Implement `PropertyRepository.ts` under `_shared/repositories/` using `supabase-js`.
  - Create Edge Function `/create-property/`: validate payload with Zod, and insert record.
- [ ] **2.3 Frontend UI**
  - Create `PropertyPortal.tsx` dashboard view.
  - Build property submission form utilizing `react-hook-form` and connect submit action to `/create-property/` via TanStack Query.
- [ ] **2.4 Integration Verification**
  - Manual test: log in as PropertyOwner, register a property, and verify entry in Supabase database.

---

### Phase 3: Vertical Slice — Profile & KYC Onboarding
* **Objective**: Build borrower profile completion, document upload workflows, and BankAgent verification screens.
* **Exit Criteria**: Borrowers can submit KYC documents; BankAgents can approve or reject them on a review panel.

#### Tasks:
- [ ] **3.1 Database & RLS**
  - Create `kyc_documents` table and add `kyc_status`/`kyc_comments` columns to `user_profiles`.
  - Configure RLS: Borrowers insert/read own documents; BankAgents read all documents.
- [ ] **3.2 Backend VSA (upload-document, approve-kyc, reject-kyc)**
  - Define interfaces `UserProfile.ts` and `KycDocument.ts` in `_shared/domain/`.
  - Implement `UserProfileRepository.ts` in `_shared/repositories/`.
  - Create Edge Function `/upload-document/` (file handler loading files into Supabase Storage bucket and saving database references).
  - Create `/approve-kyc/` and `/reject-kyc/` Edge Functions updating borrower profile verification state.
- [ ] **3.3 Frontend UI**
  - Create `BorrowerPortal.tsx` showing Profile Setup form and KYC upload widgets.
  - Create `AgentPortal.tsx` dashboard containing a "Pending KYC Review" table where BankAgents inspect uploader files and approve/reject with review comments.
- [ ] **3.4 Integration Verification**
  - Manual test: borrower uploads a PDF file; BankAgent checks the file in the dashboard and changes state to `VERIFIED`.

---

### Phase 4: Vertical Slice — Loan Application & Sanctions
* **Objective**: Create the loan request flow ("loan login") connecting borrowers, agents (BankAgents), and banks.
* **Exit Criteria**: Borrowers/BankAgents can submit loan applications for verified properties; BankAgents can review and respond with formal loan sanction offers.

#### Tasks:
- [ ] **4.1 Database & RLS**
  - Create tables: `loan_applications` and `loan_offers`.
  - Configure RLS: Borrowers/BankAgents view applications they filed; BankAgents view applications logged to their banks.
- [ ] **4.2 Backend VSA (submit-application, issue-sanction)**
  - Define models `Loan.ts` and `Offer.ts` in `_shared/domain/`.
  - Implement `LoanRepository.ts` and `OfferRepository.ts` in `_shared/repositories/`.
  - Create `/submit-application/` Edge Function (validates that borrower profile KYC is `VERIFIED` and maps application to selected property).
  - Create `/issue-sanction/` Edge Function (receives BankAgent proposal inputs: principal, interest rate, tenure, and EMI).
- [ ] **4.3 Frontend UI**
  - **Agent Dashboard (`AgentPortal.tsx`)**: Form to choose borrower profile and property, and log the application.
  - **BankAgent Dashboard**: View loan applications list, open details, and access "Issue Sanction Offer" calculator modal.
  - **Borrower Portal**: Real-time application timeline status tracker.
- [ ] **4.4 Integration Verification**
  - Verify BankAgent submits application -> BankAgent sees it -> BankAgent issues a loan sanction offering 8.5% interest rate for 240 months.

---

### Phase 5: Vertical Slice — Active Loans & Payments
* **Objective**: Manage active loan profiles and record manual installment receipts.
* **Exit Criteria**: Borrower accepts a sanction offer (spawning an active loan), logs a payment receipt, and BankAgent verifies the receipt, updating outstanding balances.

#### Tasks:
- [ ] **5.1 Database & RLS**
  - Create tables: `active_loans` and `payments`.
  - Configure RLS: Borrowers write receipts; BankAgents inspect and update verify status.
- [ ] **5.2 Backend VSA (accept-offer, verify-payment)**
  - Define models `Payment.ts` in `_shared/domain/`.
  - Implement `PaymentRepository.ts` in `_shared/repositories/`.
  - Create `/accept-offer/` Edge Function: in a database transaction, set offer status to `ACCEPTED`, create `ActiveLoan` record, and set other offers on the application to `DECLINED`.
  - Create `/verify-payment/` Edge Function: update payment status, decrement active loan remaining months, and decrease current balance.
- [ ] **5.3 Frontend UI**
  - **Borrower Dashboard**: Show active loan summary cards (Outstanding, paid installments, next due date) and "Make Payment" upload drawer.
  - **BankAgent Dashboard**: Review payment receipts queue and click "Verify".
- [ ] **5.4 Integration Verification**
  - Verify Borrower accepts Bank A's offer -> application offers close -> Borrower submits receipt for $1,500 -> BankAgent clicks verify -> Borrower outstanding balance decreases by $1,500.

---

### Phase 6: Notifications, Auditing, & Handover
* **Objective**: Configure real-time dashboard notifications, record system audit logs, and conduct final validation.
* **Exit Criteria**: WebSockets push instant notifications on status updates, actions are logged in the audit trail, and walkthrough is ready.

#### Tasks:
- [ ] **6.1 Real-time WebSockets Integration**
  - Connect Supabase Realtime client hooks in frontend layout listening to the `notifications` table, displaying browser toast messages.
- [ ] **6.2 Backend Audit Logging**
  - Verify that each Edge Function inserts status trail changes into the `audit_logs` table.
- [ ] **6.3 Comprehensive Walkthrough & Cleanup**
  - Run full production client compilation build.
  - Create the [walkthrough.md](file:///C:/Users/Vinod/.gemini/antigravity-ide/brain/dbde710f-f75b-41b2-bfba-9f649ea1fc58/walkthrough.md) artifact documenting integration success.
