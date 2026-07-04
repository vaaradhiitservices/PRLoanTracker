# Project Requirements Document (PRD)
## Project Name: Loan Tracker Enterprise Portal

### 1. Introduction & Objectives
The **Loan Tracker Enterprise Portal** is a centralized, multi-tenant/multi-role platform designed to streamline and track the end-to-end loan procurement and management process. It connects borrowers, intermediaries (agents), lenders (banks), and builders/sellers (property providers) into a unified workflow.

The core objectives are:
* **Facilitate Collaboration**: Allow bank agents to act as intermediaries between loan applicants (borrowers) and multiple banking institutions.
* **Streamline Workflows**: Automate property onboarding, profile validation, document verification (KYC), multi-bank loan application submission ("loan login"), and sanction offer workflows.
* **Track Active Loans**: Record post-sanction metrics (disbursement details, remaining balances, installments, and payment verification) without complex interest calculation algorithms.
* **Document Management**: Maintain a secure, structured repository for KYC records, property titles, sanction letters, and payment receipts.

---

### 2. User Roles & Access Matrix

The system supports five distinct roles with tailored permissions:

| Feature / Action | Borrower | Bank Agent | Loan Banker | Property Provider | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Register & Log In** | Yes | Yes | Yes | Yes | Yes |
| **Manage Own Profile & Docs** | Yes | Yes (For client) | View Only | No | Yes |
| **Register Properties** | No | No | No | Yes | Yes |
| **View Properties** | Yes | Yes | Yes | Yes | Yes |
| **Submit Loan Applications** | Yes | Yes | No | No | Yes |
| **Issue Sanction Offers** | No | No | Yes | No | Yes |
| **Accept/Reject Loan Offers** | Yes | Yes | No | No | Yes |
| **Record Installment Payments** | Yes | Yes | No | No | Yes |
| **Verify Payment Receipts** | No | No | Yes | No | Yes |
| **System Settings & Auditing** | No | No | No | No | Yes |

---

### 3. Functional Requirements

#### Module 1: Authentication & User Management
* **Registration**: Users register by specifying email, phone, password, and their chosen role.
* **Login & Authentication**: Secure login via email/phone.
* **Profile Management**:
  * **Borrowers**: Personal details, employment details (Salaried / Self-Employed), monthly income, current outstanding debts, and KYC document uploads.
  * **Bank Agents**: Agency name, linked banks, list of associated clients (borrowers).
  * **Bankers**: Association with a specific bank and branch.
  * **Property Providers**: Company/individual name, address, license details.

#### Module 2: Property Onboarding
* Property Providers register physical properties that are available for purchase/financing.
* Required details:
  * Property Name/Title.
  * Address / Location.
  * Estimated Market Valuation.
  * Supporting documents (Title deeds, municipal approval letters, images).
* Status of properties: `PENDING_VERIFICATION` -> `APPROVED` (Visible to buyers) -> `SOLD/FINANCED`.

#### Module 3: KYC & Profile Validation Workflow
* **Document Upload**: Borrowers or Agents upload high-resolution files (PDFs/Images) for:
  * Identity Proof (e.g., PAN Card, Aadhar Card, Passport).
  * Address Proof.
  * Financial Proof (Pay slips, Income Tax Returns, Bank Statements).
* **Verification Status**:
  * Initial upload sets profile status to `KYC_PENDING`.
  * Assigned Banker reviews documents and changes status to `KYC_VERIFIED` or `KYC_REJECTED` (with feedback comments).
  * *Note: A borrower's profile must be verified before a loan can be sanctioned.*

#### Module 4: Loan Login & Sanction Workflow
* **Loan Login Creation**:
  * Initiated by a Borrower or by their Bank Agent.
  * Links a Borrower Profile, a registered Property, and the requested loan amount.
* **Submission to Multiple Banks**:
  * The Agent or Borrower selects one or more Banks to submit the application to.
  * The application appears in the queues of the respective Bank's Bankers.
* **Bank Evaluation & Offer**:
  * Bankers review the applicant's profile and property details.
  * Bankers can mark the application as `REJECTED` or issue a `SANCTION_OFFER`.
  * The Sanction Offer includes:
    * Sanctioned Principal Amount.
    * Interest Rate (per annum).
    * Loan Tenure (months).
    * Monthly Installment (EMI) amount.
* **Offer Acceptance**:
  * The Borrower (or Agent on their behalf) views all active Sanction Offers.
  * Accepting an offer moves the Loan Application to `SANCTIONED` status and spawns an `Active Loan` entity. All other offers for that application are automatically marked as `DECLINED`.

#### Module 5: Post-Sanction Loan Tracking & Payments
* **Loan Dashboard**: Tracks the status of the `Active Loan`:
  * Original Sanctioned Principal vs. Current Outstanding Balance.
  * EMI Amount & Annual Interest Rate.
  * Total Tenure vs. Remaining Installments.
  * Start Date.
* **Payment Recording**:
  * When an installment is paid, the Borrower or Agent logs the transaction:
    * Amount paid.
    * Date of payment.
    * Receipt/Transaction Reference document upload.
  * The payment record remains in `PENDING_VERIFICATION` status.
* **Payment Verification**:
  * The lending bank's Banker verifies the transaction against their records.
  * Upon verification (`VERIFIED`), the loan's current outstanding balance is reduced by the payment amount, and the remaining installments counter is decremented.
  * If rejected (`REJECTED`), a reason is logged, and the balance is unaffected.

#### Module 6: Notifications & Alerts
* **Email System**:
  * Automated email alert when a new Sanction Offer is issued.
  * Monthly reminder email sent 5 days before the EMI due date.
  * Confirmation email upon KYC approval/rejection.
  * Confirmation email upon payment receipt verification/rejection.

---

### 4. Technical & Non-Functional Requirements

* **Audit Logging**: Every action (KYC review, Loan offer submission, payment upload) must be logged with user ID, action, and timestamp.
* **Document Security**: Uploaded KYC documents and property deeds must be stored securely. Access must be restricted only to authorized Bankers, Agents, and the Borrower.
* **Responsive UI/UX**: The portal must feature a high-fidelity, responsive user interface designed for both desktops (primarily for Bankers and Agents) and mobile devices (primarily for Borrowers).
* **Data Consistency**: Relational integrity must prevent deleting users or properties that are linked to active loans.
