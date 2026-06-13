# Bugfix Requirements Document

## Introduction

The GenZ Restaurant POS system (Next.js 14 with Prisma) is currently 73% complete but has multiple critical bugs preventing production deployment. This bugfix addresses 10 critical issues that break the core order-to-payment workflow. The system should allow restaurant staff to complete the full cycle (create order → kitchen updates status → generate bill → receive payment) without encountering crashes, errors, or data integrity issues.

**Impact**: These bugs prevent the restaurant from operating, causing:
- Bills page crashes when viewing details (cannot collect payments)
- Build failures preventing deployment
- Empty database on fresh install (no test data)
- Incorrect table status logic (tables freed before payment)
- Missing essential features (print KOT/bills, user registration)

**Scope**: This bugfix focuses on correcting existing defective behavior while preserving all currently working features (authentication, tables CRUD, menu CRUD, order creation, KOT display).

## Bug Analysis

### Current Behavior (Defect)

#### 1.1 Bills Page Field Reference Errors
1.1 WHEN viewing bill details on the bills page THEN the system crashes with "Cannot read properties of undefined (reading 'toFixed')" because code references `selectedBill.taxAmount` and `selectedBill.discountAmount` fields that don't exist in the database schema (schema uses `tax` and `discount`)

#### 1.2 Build and Linting Errors
1.2 WHEN running build command (`npm run build`) THEN the system fails with ESLint errors including unescaped apostrophes in login page and React Hook dependency warnings in orders page

#### 1.3 Database Field Naming Inconsistency
1.3 WHEN accessing order items in code THEN the system has inconsistent field naming where Prisma schema defines the relation as `orderItems` but API code and TypeScript types reference `items`, causing type errors and runtime confusion

#### 1.4 Missing Seed Data
1.4 WHEN installing the system fresh or resetting the database THEN the system has an empty database with no default restaurant, tables, menu items, or test users, making it impossible to test or use the system without manual database population

#### 1.5 Hardcoded Restaurant IDs
1.5 WHEN creating menu items or tables THEN the system uses hardcoded restaurant IDs (menu page: `restaurantId: '1'`; tables page: empty field requiring manual UUID entry) instead of getting the restaurantId from the authenticated user's context

#### 1.6 Premature Table Status Update
1.6 WHEN an order status is updated to COMPLETED THEN the system sets the table status to AVAILABLE immediately, even though the bill has not yet been generated or paid, allowing new customers to be seated at a table with an unpaid bill

#### 1.7 Missing Input Validation
1.7 WHEN entering menu item prices or order quantities THEN the system accepts negative values, zero values, or excessively large values without validation, allowing invalid data into the database

1.8 WHEN entering special instructions for order items THEN the system does not sanitize the input, creating potential SQL injection and XSS vulnerabilities

#### 1.9 Generic Error Handling
1.9 WHEN API requests fail THEN the system returns generic error messages like "Failed to fetch tables" without specific error codes, detailed messages, or structured error logging, making debugging difficult

#### 1.10 Missing Print Functionality
1.10 WHEN viewing KOT (Kitchen Order Tickets) or bills THEN the system has no print button or print-friendly CSS, requiring kitchen staff and cashiers to manually copy information

#### 1.11 No User Registration
1.11 WHEN attempting to add new staff members to the system THEN the system has no registration endpoint or UI, only a login page, requiring direct database manipulation to add users

### Expected Behavior (Correct)

#### 2.1 Bills Page Field References Fixed
2.1 WHEN viewing bill details on the bills page THEN the system SHALL display tax and discount amounts by referencing the correct field names `selectedBill.tax` and `selectedBill.discount` from the database schema without crashing

#### 2.2 Build Succeeds Without Errors
2.2 WHEN running build command (`npm run build`) THEN the system SHALL complete successfully with zero ESLint errors by properly escaping apostrophes and fixing React Hook dependency arrays

#### 2.3 Consistent Field Naming
2.3 WHEN accessing order items throughout the codebase THEN the system SHALL use consistent field naming by either updating the Prisma schema to use `items` everywhere OR updating all code references to use `orderItems`, ensuring TypeScript types match the schema

#### 2.4 Seed Data Available
2.4 WHEN running the seed script (`npm run db:seed`) THEN the system SHALL populate the database with:
- At least 1 restaurant (name: "GenZ Restaurant", address: "123 Main St")
- At least 1 admin user (email: "admin@genz.com", password: hashed "admin123")
- At least 5-10 tables with varying capacities
- At least 15-20 menu items across multiple categories (starters, mains, desserts, beverages)

#### 2.5 Dynamic Restaurant ID from Auth Context
2.5 WHEN creating menu items or tables THEN the system SHALL retrieve the restaurantId from the authenticated user's session/context rather than using hardcoded values or requiring manual entry

#### 2.6 Correct Table Status Logic
2.6 WHEN an order status is updated to COMPLETED THEN the system SHALL keep the table status as OCCUPIED until the bill status is updated to PAID, at which point the table status SHALL be updated to AVAILABLE

#### 2.7 Input Validation Implemented
2.7 WHEN entering menu item prices THEN the system SHALL validate that price > 0 and price < 100000, rejecting invalid inputs with a clear error message

2.8 WHEN entering order quantities THEN the system SHALL validate that quantity >= 1 and quantity <= 1000, rejecting invalid inputs with a clear error message

2.9 WHEN entering special instructions for order items THEN the system SHALL sanitize the input to remove potentially malicious content (SQL injection patterns, XSS scripts) while preserving legitimate text

#### 2.10 Specific Error Messages
2.10 WHEN API requests fail THEN the system SHALL return specific error responses including error codes, detailed messages describing what went wrong, and structured logging to aid debugging

#### 2.11 Print Functionality Available
2.11 WHEN viewing KOT or bills THEN the system SHALL provide a print button that triggers browser print dialog with print-friendly CSS formatting (no sidebar, optimized layout, clear text)

#### 2.12 User Registration Endpoint
2.12 WHEN accessing a registration endpoint (`/api/auth/register`) THEN the system SHALL accept user details (email, password, name, role, restaurantId), validate them, hash the password, create the user in the database, and return success or error

### Unchanged Behavior (Regression Prevention)

#### 3.1 Authentication Continues Working
3.1 WHEN logging in with valid credentials THEN the system SHALL CONTINUE TO authenticate users successfully and maintain sessions using NextAuth.js

#### 3.2 Tables CRUD Continues Working
3.2 WHEN creating, viewing, or deleting tables THEN the system SHALL CONTINUE TO perform these operations correctly without regression

#### 3.3 Menu CRUD Continues Working
3.3 WHEN performing full CRUD operations on menu items (create, read, update, delete, toggle availability) THEN the system SHALL CONTINUE TO execute these operations successfully

#### 3.4 Order Creation Continues Working
3.4 WHEN creating new orders with valid table and menu item selections THEN the system SHALL CONTINUE TO create orders correctly, update table status to OCCUPIED, and store order items with proper relationships

#### 3.5 KOT Display Continues Working
3.5 WHEN viewing the KOT (Kitchen Order Ticket) screen THEN the system SHALL CONTINUE TO display active orders grouped by table with auto-refresh every 5 seconds

#### 3.6 Order Status Updates Continue Working
3.6 WHEN kitchen staff updates order status through the workflow (PENDING → PREPARING → READY → SERVED → COMPLETED) THEN the system SHALL CONTINUE TO update order status correctly

#### 3.7 Bill Generation Logic Continues Working
3.7 WHEN generating bills for completed orders (excluding the display bug) THEN the system SHALL CONTINUE TO calculate subtotal, tax (18%), and total correctly

#### 3.8 Reports Continue Working
3.8 WHEN viewing daily sales reports with date range filters THEN the system SHALL CONTINUE TO display total sales, order count, and top-selling items correctly

#### 3.9 Database Relationships Continue Working
3.9 WHEN querying data across related tables (orders with items, bills with orders, tables with orders) THEN the system SHALL CONTINUE TO maintain referential integrity through Prisma relationships

#### 3.10 Protected Routes Continue Working
3.10 WHEN accessing protected routes without authentication THEN the system SHALL CONTINUE TO redirect users to the login page via middleware
