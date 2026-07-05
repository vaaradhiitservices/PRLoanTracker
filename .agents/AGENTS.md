# Project Guardrails & Architectural Rules

All AI coding agents working on the PR Loan Tracker project must adhere to the following core constraints:

---

## 1. UI & Styling Constraints: App-First Architecture
Always design and implement user interfaces with an **App-First (Mobile-App-First)** mental model. Do not simply design for desktop and compress it; build for mobile touch/thumb navigation first, then adapt and expand for desktop.

*   **Fixed Screen Shells**: The primary application layout must be locked to the viewport height (`h-screen` or `h-[dvh]` with `overflow-hidden`). The page should not bounce scroll. Only the inner body workspace (`main`) must be an independent scrollable pane.
*   **Mobile Bottom Tab Navigation**:
    *   On mobile screens, primary module switches (Dashboard, Properties, KYC, Profiles) must reside in a **fixed bottom tab bar** for easy thumb access.
    *   Do not force users to open hamburger side drawers to navigate between core views. Side drawers must be reserved only for secondary settings (e.g. active role toggling, signing out).
*   **Mobile Bottom Action Sheets**:
    *   When launching forms, creation actions, or upload modules (like adding a property or uploading KYC), use slide-up **Bottom Sheets** (drawer panels anchored to the bottom viewport) instead of centered desktop popup modals.
*   **Card-Based Lists**:
    *   Convert standard relational tables (`<table>` structures) into scrollable touch-friendly cards on mobile viewports. Row tables must only be exposed on desktop (`md:` and above).
*   **Design Tokens System**: Adhere to the design system. Use HSL styling tokens mapped in [tailwind.config.js](file:///e:/Metrolabs/repos/PRLoanTracker/client/tailwind.config.js) (like `border-border`, `bg-background`) rather than introducing arbitrary color codes.

---

## 2. Frontend State & Validation Patterns
*   **Client State Division**:
    *   Use **Zustand** only for cross-cutting client-side globals (like Auth state, login sessions, active role toggles).
    *   Use **TanStack Query** for syncing, fetching, and mutating database tables. Avoid invoking raw `supabase-js` inside React UI elements.
*   **Form Validation**: Manage form states and client-side checks using `react-hook-form` coupled with `zod` schemas.

---

## 3. Backend & Database Access Rules
*   **Supabase Edge Functions (VSA)**: All business logic processes must be handled inside Deno Edge Functions in the `supabase/functions/` directory. The frontend React client must call these functions rather than writing heavy write logic directly.
*   **Feature Folder Layout**: Each Edge Function feature must separate concerns into:
    *   `index.ts`: The Deno HTTP entry point. Handles CORS and forwards request.
    *   `handler.ts`: Orchestrates the business workflow (interacts with Repositories).
    *   `validator.ts`: Validates request schemas using standard TypeScript logic.
    *   `dto.ts`: Data Transfer Objects.
*   **Database Query Abstraction (Repositories)**: Business handlers **must never** write raw Supabase queries directly (i.e. no `supabase.from(...)` inside handlers). All queries must be encapsulated inside clean repository classes located in `supabase/functions/_shared/repositories/`.
*   **Deno Dependencies**: Deno Edge Functions must import libraries using esm.sh URL imports (e.g., `https://esm.sh/@supabase/supabase-js@2`), not local client npm paths.
*   **Primary Key Design**:
    *   Use sequential integer keys (`serial PRIMARY KEY`) for static lookup tables where guessing IDs is not a risk (e.g., `roles`, `banks`).
    *   Use secure UUIDs (`uuid PRIMARY KEY DEFAULT gen_random_uuid()`) for public-facing, dynamic, or transactional tables (e.g., `properties`, `loans`, `payments`, `user_profiles`) to prevent URL guessability/ID enumeration attacks.
*   **Explicit Data API Grants**: Because local Supabase CLI does not auto-expose newly created public tables, **all migration files must include explicit SQL `GRANT` statements at the bottom** for the `authenticated`, `anon`, and `service_role` roles, as well as `GRANT USAGE` on sequences.
*   **RLS Role checking**: RLS policies checking user role memberships **must** utilize the optimized, cached `STABLE` function `public.has_role(auth.uid(), 'RoleName')` to minimize query execution times.
*   **Row-Level Ownership Checks**: Row-level policies targeting `authenticated` users must combine the role check with user ownership predicates (i.e., comparing `user_id = auth.uid()`), avoiding broad BOLA/IDOR permissions.
*   **Bypassing RLS (Security Definer)**: Database triggers must run as `SECURITY DEFINER` (to bypass RLS limits when syncing profiles). However, standard CRUD utility functions must run as `SECURITY INVOKER`.

---

## 4. Workflow & Cooperation Rules
*   **Explicit Consent Constraint**: The agent **must not** make database changes, edit files, or trigger build setups until the technical proposal has been discussed and approved by the user.
*   **Compilation Checks**: Run `npm run build` at the root workspace after every feature slice is completed to ensure zero TypeScript compiler failures or styling bundler issues.
