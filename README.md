# ✈️ Kanimo Airline — Production-Ready Ticketing Platform

Kanimo Airline is a full-stack, enterprise-grade flight ticket management and booking platform featuring a responsive **Next.js 14 Web Application** and a connected **Cross-Platform Android Mobile Application**. Both clients share a single authoritative backend, database schema, authentication system, cryptographic ticket validation mechanism, and business rules.

---

## 🌟 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Key Features](#-key-features)
   - [Web Application](#web-application)
   - [Android Mobile App](#android-mobile-app)
   - [Unified Backend & Security](#unified-backend--security)
3. [Data Model & Schema](#-data-model--schema)
4. [Ticket Cryptography & Gate Security](#-ticket-cryptography--gate-security)
5. [Concurrency-Safe Inventory & Reservation](#-concurrency-safe-inventory--reservation)
6. [Payment Processing (Demo Simulator vs. Stripe Production)](#-payment-processing)
7. [Environment Variables](#-environment-variables)
8. [Local Development Guide](#-local-development-guide)
9. [Vercel Deployment Guide](#-vercel-deployment-guide)
10. [Android Application Build & APK Guide](#-android-application-build--apk-guide)
11. [Verification & Integration Test Results](#-verification--integration-test-results)

---

## 🏗 Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │            PostgreSQL / SQLite       │
                      │               (Prisma ORM)           │
                      └──────────────────┬───────────────────┘
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             │                                                       │
  ┌──────────▼───────────────┐                             ┌─────────▼───────────────┐
  │   Next.js 14 Web App     │                             │  Shared REST API Endpoints │
  │  - App Router (React 18) │                             │  - Dual Auth: JWT/Bearer│
  │  - Tailwind CSS          │                             │  - Atomic Transactions  │
  │  - Lucide Icons          │                             │  - HMAC-SHA256 Signer   │
  │  - Canvas QR Generator   │                             │  - Stripe Webhooks      │
  └──────────────────────────┘                             └─────────▲───────────────┘
                                                                     │ HTTP / HTTPS
                                                           ┌─────────┴───────────────┐
                                                           │   Android Application   │
                                                           │  - Vite + React + TS    │
                                                           │  - Capacitor Android    │
                                                           │  - Offline Pass Storage │
                                                           │  - Camera / Host Switch │
                                                           └─────────────────────────┘
```

Both clients interact with the exact same server endpoints. A flight booked or support ticket submitted on the Android app immediately appears in the Web App's wallet and admin dashboards, and vice versa.

---

## ✨ Key Features

### Web Application
- **Flagship Discovery & Search**: Interactive route search engine with filters for origin, destination, cabin class, travel dates, and price sorting.
- **Flight & Tier Details**: Dynamic multi-cabin pricing tier selection (Economy Classic, Premium Comfort, Business Executive, Royal First Class), real-time seat availability counter, and baggage allowance breakdown.
- **Transactional Checkout Flow**: Passenger assignment, seat selection, and checkout with live concurrency checks.
- **Interactive Demo Payment Simulator**: 1-click test card filler (`4242...`), CVV generator, and instant verification without card charges.
- **Digital Boarding Pass Wallet**: View active, upcoming, and checked-in boarding passes.
- **High-Resolution Ticket View**: Dynamic QR code rendering with embedded HMAC cryptographic signatures, seat allocation, departure counters, and print actions.
- **Customer Concierge & Support**: Ticket creation, status tracking (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), and real-time message threading.
- **Comprehensive Admin Dashboard**:
  - **Analytics & Revenue Metrics**: Live revenue, load factors, ticket volume, and system alerts.
  - **Gate Ticket Scanner (`/admin/scanner`)**: Live validation console verifying HMAC signatures and enforcing single-entry check-ins.
  - **Flight Manager (`/admin/flights`)**: Create, edit, and adjust flight routes, schedules, aircraft models, and statuses.
  - **Order Directory (`/admin/orders`)**: Audit trail, transaction details, and self-service refund handling.
  - **Concierge Desk (`/admin/support`)**: Respond to customer inquiries and escalate ticket priority.
  - **Customer Directory (`/admin/customers`)**: Directory of registered users and order totals.

### Android Mobile App
- **Native Experience with Shared Logic**: Powered by Capacitor and React 18, providing smooth 60fps mobile navigation.
- **5-Tab Navigation Bar**:
  1. **Explore**: Live flight discovery, cabin tier selection, and immediate mobile checkout.
  2. **My Passes**: Mobile digital wallet with offline caching in `localStorage` and scannable QR passes.
  3. **Bookings**: Order history with status indicators and itemized receipts.
  4. **Support**: Mobile concierge desk to submit and track support queries.
  5. **Account & API Host Settings**: Profile management, sign in/out, and live API endpoint configuration (`http://10.0.2.2:3000` for Android Emulator, LAN IP for physical device, or deployed Vercel URL).
- **Graceful Error & Offline Handling**: Detects network disconnects, displays user-friendly error banners, and falls back to cached boarding passes.

### Unified Backend & Security
- **Dual Authentication**: Session cookies for the web frontend and `Authorization: Bearer <token>` for the mobile application.
- **Role-Based Access Control (RBAC)**: Strict authorization guards distinguishing `CUSTOMER`, `STAFF`, and `ADMIN` roles.
- **Atomic Concurrency Protection**: Multi-user seat booking transactions with database locks preventing overselling.
- **Idempotent Webhooks**: Stripe webhook handling verifying signatures and ensuring orders are not processed twice.

---

## 🗄 Data Model & Schema

The system uses a normalized relational data model managed by Prisma:

```prisma
enum Role {
  CUSTOMER
  STAFF
  ADMIN
}

enum FlightStatus {
  SCHEDULED
  BOARDING
  DEPARTED
  ARRIVED
  CANCELLED
  DELAYED
}

enum TicketStatus {
  ISSUED
  CHECKED_IN
  BOARDED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

### Models
- **`User`**: Authentication credentials (hashed with bcrypt), profile info, role, and relational links to orders, tickets, and support tickets.
- **`Flight`**: Route details (flight number, origin, destination, departure/arrival timestamps, aircraft model, gate, terminal, and status).
- **`TicketTier`**: Cabin classes per flight (name, price, capacity, remaining seats, baggage allowance, perks).
- **`Order` & `OrderItem`**: Purchase records, total amounts, currency, status, and line items.
- **`Payment`**: Payment provider (`DEMO` or `STRIPE`), transaction ID, status, and payment method details.
- **`Ticket`**: Digital boarding pass with unique ticket number, seat assignment, passenger name, cryptographic HMAC signature, QR code payload, and check-in timestamp.
- **`SupportTicket` & `SupportComment`**: Customer inquiries, priority levels, categories, and bidirectional conversation logs.
- **`AuditLog`**: Security and administrative activity logs.

---

## 🔐 Ticket Cryptography & Gate Security

To prevent counterfeit tickets, screenshot manipulation, and ticket reuse, Kanimo Airline implements **HMAC-SHA256 cryptographic verification**:

1. **Payload Generation**:
   Upon successful purchase, the server generates a tamper-proof signature:
   ```typescript
   payload = {
     ticketId: "clxxxx...",
     flightNumber: "KN-204",
     passengerName: "Jane Doe",
     seat: "12A",
     secretSalt: "unpredictable-salt"
   }
   signature = HMAC_SHA256(JSON.stringify(payload), TICKET_SIGNING_SECRET)
   ```
2. **Scannable QR Code**:
   The QR code encodes a verified payload containing `ticketId`, `passengerName`, `flightNumber`, and the `signature`. It intentionally **never exposes credit card or sensitive personal data**.
3. **Server-Side Gate Scanner**:
   When staff scans the boarding pass at `/admin/scanner`:
   - The server re-computes the HMAC signature using `TICKET_SIGNING_SECRET`.
   - If the signature does not match, it returns **`400 Bad Request: Invalid or Tampered Signature`**.
   - If the ticket has already been used (`status === 'CHECKED_IN'`), it immediately rejects the scan with **`409 Conflict: Ticket Already Redeemed`**, displaying the exact original check-in timestamp.
   - If valid, the ticket status transitions atomically to `CHECKED_IN`.

---

## 🛡 Concurrency-Safe Inventory & Reservation

To prevent overbooking when multiple passengers purchase the last available seat simultaneously, all checkout logic executes within an isolated **`prisma.$transaction`**:

```typescript
await prisma.$transaction(async (tx) => {
  for (const item of items) {
    const tier = await tx.ticketTier.findUnique({
      where: { id: item.tierId },
    });
    
    if (tier.remainingSeats < item.quantity) {
      throw new Error(`Insufficient seats available for ${tier.name}. Only ${tier.remainingSeats} remaining.`);
    }

    // Atomic decrement
    await tx.ticketTier.update({
      where: { id: item.tierId },
      data: { remainingSeats: { decrement: item.quantity } },
    });
  }

  // Create Order, Payment, and Tickets within same transaction
});
```
If two requests race for the final seat, one transaction succeeds while the other fails cleanly and returns an informative out-of-stock notification without inconsistent state.

---

## 💳 Payment Processing

### 1. Interactive Demo Mode (`DEMO_PAYMENT_MODE="true"`)
- Enabled by default for local development, reviews, and test environments without requiring active Stripe merchant credentials.
- Checkout UI displays a distinctive **"Demo Mode Active"** banner with a 1-click test card filler.
- Simulates realistic payment latency (600ms) and processes genuine orders, inventory decrement, and ticket generation.

### 2. Stripe Production Mode (`DEMO_PAYMENT_MODE="false"`)
- Uses Stripe Checkout Session creation (`/api/payments/checkout`).
- Confirms purchases through verified Stripe webhook signatures (`/api/webhooks/stripe`) listening to `checkout.session.completed`.
- Ensures idempotency: duplicate webhook events are recognized and ignored.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Database connection string. SQLite for local, PostgreSQL for Vercel. | `file:./dev.db` |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens. | Random 32+ character string |
| `TICKET_SIGNING_SECRET`| Secret key for HMAC-SHA256 boarding pass verification. | Random 32+ character string |
| `DEMO_PAYMENT_MODE` | `"true"` for demo testing; `"false"` for live Stripe payments. | `true` |
| `STRIPE_SECRET_KEY` | Stripe secret API key (Required if DEMO is false). | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET`| Stripe webhook signing secret for signature verification. | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side publishable key. | `pk_test_...` |
| `NEXT_PUBLIC_APP_URL` | Canonical origin URL for CORS, redirects, and API calls. | `http://localhost:3000` |
| `NODE_ENV` | Environment mode (`development` or `production`). | `production` |

---

## 💻 Local Development Guide

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npx prisma db push
npx prisma db seed
```

This populates the database with:
- **5 Scheduled Flights**: Domestic & International (London Heathrow, New York JFK, Tokyo Haneda, Dubai, Singapore Changi).
- **4 Cabin Classes per flight**: Economy, Premium, Business, First Class.
- **Default Accounts**:
  - **Admin**: `admin@kanimo.com` / `admin123`
  - **Staff**: `agent@kanimo.com` / `agent123`
  - **Customer**: `passenger@example.com` / `passenger123`

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production & Run Tests
```bash
npm run build
npx tsx tests/api-integration.test.ts
```

---

## 🚀 Vercel Deployment Guide

The web application is fully optimized for zero-configuration deployment to **Vercel**.

### Step 1: Provision a Production Database
Because Vercel Serverless Functions have an ephemeral filesystem, SQLite should not be used in production. Use any managed PostgreSQL database:
- [Neon](https://neon.tech) (Recommended, serverless PostgreSQL)
- [Supabase](https://supabase.com)
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/)

1. In your PostgreSQL provider, create a new database and copy the connection string.
2. In `prisma/schema.prisma`, update the datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run the migration to deploy the schema to your PostgreSQL database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### Step 2: Push Code to GitHub / GitLab / Bitbucket
```bash
git add .
git commit -m "Deploy Kanimo Airline platform"
git push origin main
```

### Step 3: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Import the repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your production PostgreSQL connection string.
   - `JWT_SECRET`: A secure 32+ character random string.
   - `TICKET_SIGNING_SECRET`: A secure 32+ character random string.
   - `DEMO_PAYMENT_MODE`: `"true"` (or `"false"` if using real Stripe credentials).
   - `NEXT_PUBLIC_APP_URL`: `https://your-project-name.vercel.app`.
   - `STRIPE_SECRET_KEY`: (If using Stripe).
   - `STRIPE_WEBHOOK_SECRET`: (If using Stripe).
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: (If using Stripe).
4. Click **Deploy**. Vercel will execute `npm run build` and launch the application globally on edge CDN.

---

## 📱 Android Application Build & APK Guide

The mobile application is located in the `android-app/` directory and is built using **Capacitor** with native Android bindings.

### Project Structure
- `android-app/src/`: React + TypeScript mobile client with full feature parity.
- `android-app/dist/`: Compiled web distribution assets.
- `android-app/capacitor.config.ts`: Capacitor configuration binding package ID `com.kanimo.airline`.
- `android-app/android/`: Complete Native Android project with Gradle wrapper, AndroidManifest, and Java source.

### ⚡ Ready-to-Install APK File
A verified 4.0 MB debug APK has been compiled via GitHub Actions CI/CD and is saved locally:
- **Local APK Path**: [`kanimo-airline-debug.apk`](file:///home/kanimo/Desktop/KANIMO%20AIRLINE/kanimo-airline-debug.apk) (or in [`build-artifacts/kanimo-airline-apk/app-debug.apk`](file:///home/kanimo/Desktop/KANIMO%20AIRLINE/build-artifacts/kanimo-airline-apk/app-debug.apk))
- **GitHub Repository**: [https://github.com/pedajh8-design/kanimo-airline](https://github.com/pedajh8-design/kanimo-airline)
- **Cloud Build Runs & Artifacts**: [https://github.com/pedajh8-design/kanimo-airline/actions](https://github.com/pedajh8-design/kanimo-airline/actions)

### 1. Mobile Development & Asset Sync
```bash
cd android-app
npm install
npm run build
npx cap sync android
```

### 2. Building the APK (Debug or Release)

#### Option A: Building via Android Studio (Recommended for Developers)
1. Open Android Studio.
2. Select **Open an Existing Project** and navigate to:
   `/home/kanimo/Desktop/KANIMO AIRLINE/android-app/android`
3. Allow Gradle to sync.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Android Studio will compile the app and output `app-debug.apk` in:
   `android-app/android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Building via Command Line
Ensure you have the **Android SDK** installed and `ANDROID_HOME` configured:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

cd android-app/android
./gradlew assembleDebug
```
The compiled debug APK will be created at:
```
android-app/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Option C: Building a Signed Production APK
To generate a signed release APK for Google Play Store or private distribution:
```bash
cd android-app/android
./gradlew assembleRelease
```
Sign the APK with your release keystore using `apksigner`:
```bash
apksigner sign --ks release-key.jks --ks-key-alias kanimo-key app/build/outputs/apk/release/app-release-unsigned.apk
```

### 3. Connecting the Android App to Your Backend
The Android app includes a built-in **API Host Configuration** modal in the Account tab:
- **Android Emulator**: Set host to `http://10.0.2.2:3000` (maps to host localhost).
- **Physical Device on Wi-Fi**: Set host to your development computer's LAN IP, e.g. `http://192.168.1.50:3000`.
- **Production**: Set host to your live Vercel URL, e.g. `https://kanimo-airline.vercel.app`.

---

## 🧪 Verification & Integration Test Results

An automated end-to-end integration test suite is provided in `tests/api-integration.test.ts`.

Run tests:
```bash
npx tsx tests/api-integration.test.ts
```

### Verified Test Scenarios
| # | Test Scenario | Verified Behavior | Status |
| :--- | :--- | :--- | :--- |
| 1 | **Admin Authentication** | Verified login with `admin@kanimo.com`, role `ADMIN`, valid JWT token. | ✅ PASSED |
| 2 | **Staff Authentication** | Verified login with `agent@kanimo.com`, role `STAFF`, valid JWT token. | ✅ PASSED |
| 3 | **Passenger Authentication** | Verified login with `passenger@example.com`, role `CUSTOMER`. | ✅ PASSED |
| 4 | **Flight Discovery & Search** | Verified flight catalog retrieval, route filters, and tier seat availability. | ✅ PASSED |
| 5 | **Transactional Order Placement** | Concurrency-safe seat reservation, order creation, and ticket issuance. | ✅ PASSED |
| 6 | **Cryptographic Ticket Issuance** | Verified HMAC-SHA256 signature generated and attached to ticket record. | ✅ PASSED |
| 7 | **Gate Scanner Validation** | Staff gate scan successfully validates genuine ticket signature (HTTP 200). | ✅ PASSED |
| 8 | **Single-Entry Re-use Prevention** | Second scan of same ticket immediately rejected with HTTP 409 Conflict. | ✅ PASSED |
| 9 | **Counterfeit Signature Rejection** | Scan with forged/tampered signature rejected with HTTP 400 Bad Request. | ✅ PASSED |
| 10 | **Concierge Support Threading** | Customer creates ticket, staff replies, status updates correctly. | ✅ PASSED |
| 11 | **Admin Revenue & Stats** | Verified metrics calculation (orders, revenue, load factors, alerts). | ✅ PASSED |

---

## 📄 License
This project is proprietary and built for Kanimo Airline ticketing operations.
