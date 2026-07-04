# Loan Tracker Enterprise Portal

The **Loan Tracker Enterprise Portal** is a centralized, secure, multi-role web platform designed to streamline and track the end-to-end loan procurement and management process. It bridges Borrowers, Bank Agents (intermediaries), Bankers (lenders), and Property Providers (builders/sellers).

The application is architected around **Supabase** (acting as managed infrastructure) with business orchestrations written as Deno TypeScript **Edge Functions** using **Vertical Slice Architecture (VSA)**. The frontend client is built with **React (Vite + TypeScript + Tailwind CSS)**.

---

## 📖 Key Documentation

*   **[PROJECT_REQUIREMENTS.md](file:///e:/Metrolabs/repos/PRLoanTracker/PROJECT_REQUIREMENTS.md)**: Product specifications, functional modules, access control matrix, and user workflows.
*   **[TECH_STACK.md](file:///e:/Metrolabs/repos/PRLoanTracker/TECH_STACK.md)**: Full stack specifications, domain models, database access patterns, folder layouts, and transaction management design.
*   **[TASKS.md](file:///e:/Metrolabs/repos/PRLoanTracker/TASKS.md)**: SDLC phase plan and task checklist structured into vertical slices.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS v3, Zustand (Client session state), TanStack Query (Server-state cache), React Hook Form, React Router.
*   **Backend & DB**: Supabase (PostgreSQL, JWT Authentication, Storage buckets, Realtime WebSockets, and Deno Edge Functions).

---

## 📁 Project Structure

```text
/PRLoanTracker
  ├── PROJECT_REQUIREMENTS.md  # Detailed system features and workflows
  ├── TECH_STACK.md            # Technical selection and repository setup
  ├── TASKS.md                 # SDLC vertical slice execution plan
  ├── README.md                # This file
  │
  ├── supabase/                # Supabase configuration & backend logic
  │   ├── config.toml          # Local project settings
  │   ├── migrations/          # DB schemas, constraints, and RLS policies
  │   └── functions/           # Vertical Slice Deno Edge Functions
  │       ├── _shared/         # Common domain types and repositories
  │       └── [feature-name]/  # Independent API endpoints
  │
  └── client/                  # React SPA (Vite client)
      ├── src/
      │   ├── components/      # Shared UI elements
      │   ├── stores/          # Zustand store hooks
      │   ├── hooks/           # TanStack Query mutations
      │   └── pages/           # Portals for each stakeholder role
```

---

## 🚀 Getting Started (Development Environment)

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required to run the local Supabase container pool)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### Local Configuration
1.  **Initialize Local Containers**:
    ```bash
    supabase start
    ```
2.  **Apply Database Migrations**:
    ```bash
    supabase db reset
    ```
3.  **Run Frontend Client**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
    Access the portal dashboard locally at `http://localhost:5173`.
