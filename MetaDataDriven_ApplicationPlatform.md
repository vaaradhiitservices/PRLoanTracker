# Metadata-Driven Application Platform Architecture

## Core Philosophy

The platform is **Domain-first**, not UI-first.

The Domain Model is the single source of truth. Every other subsystem (UI, APIs, workflows, reports, imports, exports, etc.) is merely a projection of the domain.

Dependencies flow in one direction only:

```text
                Domain Model
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   View Model     API Model    Workflow Model
      │
      │
 Layout (Optional)
      │
      ▼
 Renderer
      │
Blazor / React / Flutter / MAUI
```

The Domain **must never** reference UI concepts.

---

# Layer 1 - Domain Model

The Domain Model represents business concepts only.

It should contain:

* Entities
* Members
* Relationships
* Validation
* Behaviors
* Computed members
* State machines
* Security metadata
* Business events

Example:

```text
Loan

Members
--------
LoanNumber
Amount
InterestRate
Customer
Payments
OutstandingBalance

Validation
----------
Amount > 0

Behavior
--------
Approve()
Reject()
Disburse()

State Machine
-------------
Draft
Submitted
Approved
Rejected
Closed
```

This model should be completely independent of any UI technology.

---

# Members

Instead of treating everything as a Field, treat everything as a Member.

Member is an abstract concept.

Supported member kinds include:

```text
Property
Reference
Collection
Computed
Action
Aggregate
File
Image
Document
Money
Address
Timeline
```

Example:

```text
Loan

Members

Property
---------
LoanNumber

Property
---------
Amount

Reference
---------
Customer

Collection
----------
Payments

Computed
--------
OutstandingBalance

Action
------
Approve
```

This makes the platform extensible without redesigning the metadata model.

---

# Relationships

Relationships are first-class metadata objects.

Do NOT model relationships as a field type.

Instead:

```text
Entities

Loan
Customer
Payment
```

```text
Relationships

Loan -> Customer

Customer -> Loans

Loan -> Payments

Payment -> Loan
```

Relationship metadata should include:

* Source Entity
* Target Entity
* Cardinality
* Required
* Delete Behavior
* Navigation Name
* Inverse Navigation
* Ownership
* Display Member
* Value Member

Relationships belong entirely to the Domain.

The UI simply decides how to present them.

---

# Validation

Validation belongs to the Domain.

Examples:

```text
Amount > 0

InterestRate <= 100

LoanNumber is unique
```

Validation must execute regardless of whether data comes from:

* UI
* REST API
* Import
* Mobile App
* Background Jobs

Never place business validation inside UI metadata.

---

# Behavior

Business behavior belongs to the Domain.

Example:

```text
Approve()

Reject()

GenerateRepaymentSchedule()

CloseLoan()
```

Each behavior can contain metadata such as:

* Permission
* Preconditions
* Parameters
* Transaction
* Events Raised

These resemble Commands in CQRS.

---

# Computed Members

Computed values are Domain members.

Example:

```text
OutstandingBalance

InterestAccrued

LoanAge
```

The renderer simply displays them.

The computation logic remains within the Domain.

---

# State Machines

Lifecycle belongs to the Domain.

Example:

```text
Draft

Submitted

Approved

Rejected

Closed
```

Actions may define valid transitions.

---

# Layer 2 - View Definition

A View is NOT a layout.

A View is a projection of a Domain Entity.

It answers:

* Which members participate?
* Which actions are available?
* Which filters apply?
* Which sorting applies?

Example:

```text
Loan Edit

Entity

Loan

Members

LoanNumber
Customer
Amount
Interest
Status

Actions

Save
Approve
```

No rows.

No columns.

No tabs.

No UI controls.

Just a projection.

One entity may have many views.

Examples:

```text
Loan Edit

Loan Quick Entry

Loan Read Only

Loan Search

Loan Dashboard

Loan Mobile

Loan Wizard

Loan Print
```

---

# Layer 3 - Layout (Optional)

Layout describes visual arrangement only.

It answers:

How should this View be arranged?

Example:

```text
Section

General

Row

LoanNumber
Customer

Row

Amount
Interest
```

Layout contains:

* Sections
* Tabs
* Rows
* Columns
* Responsive Rules
* Groups

Layout never defines business logic.

A View can exist without a Layout.

---

# Default Layout

If no Layout exists:

The renderer automatically generates one.

Example:

```text
Loan

Loan Number

Customer

Amount

Interest

Save
```

This allows newly created entities to become immediately usable.

Layouts become optional enhancements rather than mandatory configuration.

---

# View Behavior

UI behavior belongs to the View, not the Domain.

Examples:

```text
Interest

Visible

LoanType == HomeLoan
```

```text
Amount

ReadOnly

Status == Approved
```

These rules affect presentation only.

Business rules remain inside the Domain.

---

# Layer 4 - Renderer

The renderer consumes:

* Domain
* View
* Optional Layout

The renderer maps semantic member types to concrete UI components.

Example:

```text
Money
    ↓
MudNumericField

or

Bootstrap Input

or

Flutter Widget
```

The renderer should never know anything about business entities.

---

# Semantic Controls

The platform should use semantic control types.

Instead of:

```text
Textbox
Dropdown
```

Use:

```text
Money

Date

DateTime

Lookup

Percentage

Email

Phone

File

Image

RichText

Rating

Barcode

Signature
```

Each renderer decides how to render them.

---

# Relationships in Views

Views reference relationship members.

Example:

```text
Loan Edit

Members

LoanNumber

Customer

Payments
```

The renderer decides how to display them.

Customer may render as:

* Dropdown
* Search Dialog
* Autocomplete
* Read-only Card

Payments may render as:

* Grid
* Cards
* Timeline
* Tree

The Domain remains unchanged.

---

# Nested Views

Collections should reference another View.

Example:

```text
Loan Edit

Payments

↓

Payment Grid View
```

Payment Grid View:

```text
Date

Amount

Method
```

Views become composable.

---

# Platform Principle

Every subsystem projects the Domain differently.

Examples:

```text
Domain Entity
    │
    ├── Edit View
    ├── Read View
    ├── Search View
    ├── Mobile View
    ├── Print View
    ├── API Schema
    ├── Workflow Schema
    ├── Import Schema
    ├── Export Schema
    ├── Report Schema
    └── Dashboard Schema
```

Each projection is independent.

---

# Dependency Rules

Allowed:

```text
Domain
    ↑
View

View
    ↑
Layout

Layout
    ↑
Renderer
```

Not Allowed:

```text
Domain
    ↓
View

Domain
    ↓
Layout

Domain
    ↓
Renderer
```

The Domain has zero knowledge of presentation.

---

# Design Principles

1. Domain is the single source of truth.
2. UI is a projection of the Domain.
3. Relationships are first-class metadata.
4. Members replace the concept of simple Fields.
5. Validation belongs to the Domain.
6. Business behavior belongs to the Domain.
7. View defines "what to expose."
8. Layout defines "how to arrange."
9. Renderer defines "how to render."
10. Layout is optional; sensible defaults must always exist.
11. Every consumer (UI, API, Workflow, Reports, Imports) reads the same Domain metadata.
12. The architecture must remain framework-agnostic and support multiple renderers without changing the Domain Model.
