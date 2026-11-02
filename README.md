# EstateNav — Bengaluru Real Estate Advisory Engine

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![K-RERA](https://img.shields.io/badge/K--RERA-Audited-10b981?style=flat-square)](https://rera.karnataka.gov.in/)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-black?style=flat-square&logo=vercel)](https://vercel.com)

**EstateNav** is an institutional-grade Bengaluru real estate advisory and discovery engine designed for high-income technology leads (GCC engineers, AI founders) and NRI investors. 

Instead of traditional classified portals or high-friction brokerage models, EstateNav operates on a **zero-brokerage direct developer allocation model**, anchored by primary launch partner **Abhee Ventures**.

---

## Key Features & Architecture

### 1. Dual-Paradigm Device Architecture
* **Desktop ($\ge$ 1024px):** 35% Left Sticky Tool Panel / 65% Right Always-Visible Property Grid for simultaneous computation and inventory discovery.
* **Mobile ($<$ 768px):** Card-first listing presentation with an app-style fixed bottom navigation bar (`Explore`, `Commute`, `Calculator`, `Concierge`) and touch-friendly slide-up bottom sheet drawers (`max-h-[85vh]`).

### 2. State Re-Skin Matrix (Zero-Reload Architecture)
Toggle between 3 distinct market segments instantly without page reloads:
* **Residential:** Micro-markets & budget tickets; telemetry monitors ₹/sq.ft capital rates and rental yields.
* **Commercial & Offices:** Tech corridor floorplates & seats; telemetry tracks ₹/sq.ft/mo lease rates and REIT cap rates.
* **Plotted Reserves:** STRR & Devanahalli villa land parcels; telemetry follows land values and appreciation indexes.

### 3. Asymmetric Hero Showcase (Fold 1)
* **Left Console (40%):** Dynamic headline, micro-market selector, budget filter, and quick jump to the workspace.
* **Right Spotlight Card (60%):** Featured showcase of **Abhee Codename New Dimension** (45-Acre Scotland-Themed Township, 3-Acre Golf Zone, 4 Clubhouses), verified K-RERA badge, guide pricing, and direct jump to developer track record.

### 4. Dynamic Corridor Telemetry Ticker (Fold 2)
* Live, smooth infinite marquee ticker displaying validated **Kaveri 2.0 Sub-Registrar benchmark rates**, YoY deltas, gross rental yields, and absorption velocity across Sarjapur Road, Whitefield, Hebbal, Electronic City, and STRR corridors.

### 5. Inlined Developer Partnership Section (Fold 3)
* Permanent native trust banner detailing Abhee Ventures' **15+ Years Track Record**, **3.5M+ Sq.Ft Delivered**, **Mivan Aluminium Formwork Tech**, 100% legal title (A-Khata, BBMP), and pre-approved APF lines across HDFC, ICICI, and SBI.

### 6. Interactive Split Workspace Engine (Fold 4)
* **Milestone Lens Filters:** Instant DOM filtering across `All Allocations`, `First Home (< ₹1.25 Cr)`, `Upgrading (3.5/4.5 BHK)`, `NRI Portfolio`, and `Senior Enclaves`.
* **Peak-Hour Transit Radar:** Filter properties based on real driving times to corporate campuses (**Wipro HQ Sarjapur**, **Prestige Tech Park / Ecospace ORR**, **Manyata Business Park Hebbal**).
* **Multi-Parameter Financial Studio:** Real-time loan and statutory tax calculations:
  * Property value slider (₹60 L to ₹3.50 Cr)
  * Down Payment toggle (10%, 20%, 30%)
  * Loan tenure & bank benchmark rates (15, 20, 25 years)
  * Compound Monthly EMI calculation
  * Karnataka Stamp Duty (exact 5.6%)
  * Registration Fee (exact 1.0%)
  * Section 24(b) Tax Offset deduction ceiling
* **RERA & Kaveri 2.0 Checklist:** 12-point title clearance protocol.

### 7. Consultative Lead Capture Modal
* Replaces aggressive sales popups with high-converting advisory CTAs (*"Inspect Allocation Deck"*, *"Unlock Direct Developer Pricing"*, *"Schedule Guided VIP Site Visit"*).
* Features the **Zero-Spam Privacy Shield** and mandatory SV Praveen channel partner consent disclosures.

### 8. Regulatory Compliance Guardrails
* **RERA Registered Agent:** SV PRAVEEN
* **K-RERA Registration No.:** `PRM/KA/RERA/1251/310/AG/260916/007810`
* **Validity Period:** 16-09-2026 to 16-09-2031
* **Mandatory Legal Disclaimer:** Affirming independent advisory portal status under direct developer terms.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Static Optimization) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom Dark Canvas & Obsidian Tokens) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database Layer** | [Firebase Firestore](https://firebase.google.com/) (Dual Mode: Curated Mock + Live Firestore) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```text
EstateNav/
├── app/
│   ├── globals.css              # Obsidian slate dark theme, custom scrollbars, animations
│   ├── layout.tsx               # Root layout with Schema.org RealEstateAgent JSON-LD
│   └── page.tsx                 # Core page coordinating states, filters, and modals
├── components/
│   ├── Header.tsx               # Global sticky navbar with 3-segment switcher
│   ├── HeroFold.tsx             # Fold 1: Asymmetric hero + search console + spotlight card
│   ├── TelemetryTicker.tsx      # Fold 2: Live Kaveri 2.0 Sub-Registrar ticker
│   ├── DeveloperTrustBanner.tsx # Fold 3: Inlined Abhee Ventures trust section
│   ├── WorkspaceEngine.tsx      # Fold 4: Split workspace (Commute + Calculator + Grid)
│   ├── PropertyCard.tsx         # Verified property card with specs & RERA link
│   ├── LeadModal.tsx            # Consultative lead capture modal with privacy shield
│   ├── MobileBottomNav.tsx      # Native mobile bottom bar + slide-up sheet drawers
│   └── Footer.tsx               # Immutable RERA regulatory compliance footer
├── lib/
│   ├── firebase.ts              # Firebase/Firestore initialization & fallback service
│   ├── mockData.ts              # Curated Abhee Ventures ongoing inventory dataset
│   └── types.ts                 # Strongly typed TypeScript interfaces
├── .env.example                 # Environment variables template for Firebase
├── next.config.mjs              # Next.js image domains & configuration
├── tailwind.config.ts           # Custom brand green and canvas obsidian palette
└── tsconfig.json                # TypeScript compiler configuration
```

---

## Getting Started

### Prerequisites
* **Node.js:** v18.17+ (Tested on v20.19.0)
* **npm:** v9+

### 1. Installation
```bash
git clone https://github.com/teammarktaleworld-wq/EstateNav.git
cd EstateNav
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Test
```bash
npm run build
npm run start
```

---

## Firebase Integration (Dual Mode)

EstateNav is built with a **graceful fallback architecture**:

1. **Curated Mock Mode (Default):**
   * If Firebase credentials are not provided, the site runs on the curated Abhee Ventures inventory in `lib/mockData.ts`.
   * Lead submissions are persisted to `localStorage` for review and demonstration.

2. **Live Firestore Mode:**
   * When you are ready to connect your Firebase project, create a `.env.local` file (or set variables in Vercel) based on `.env.example`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   * Once these variables exist, `getProperties()` and `submitLead()` in `lib/firebase.ts` automatically connect to your live `properties` and `leads` Firestore collections.

---

## Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import `teammarktaleworld-wq/EstateNav`.
3. Vercel automatically detects **Next.js**. Keep the default settings:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** `./`
   * **Build Command:** `next build`
   * **Output Directory:** `.next`
   * **Node.js Version:** `20.x`
4. Click **Deploy**. The application builds and deploys in under 60 seconds.
