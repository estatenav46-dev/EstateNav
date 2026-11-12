# EstateNav

Curated Bengaluru property discovery and advisory portal (estatenav.in), operated by SV Praveen, K-RERA registered agent (PRM/KA/RERA/1251/310/AG/260916/007810). Next.js 14 App Router, TypeScript, Tailwind, deployed on Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # optional; sensible defaults are built in
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build (output goes to .next_build locally, .next on Vercel)
```

To open the admin preview locally, set `NEXT_PUBLIC_ADMIN_PREVIEW=true` and visit `/admin`.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Featured carousel with search, then "Where do you want to live?" region tiles (North, East, South-East, South; West and Central marked coming soon), "What are you looking for?" shortcut tiles, trust strip and advisor card |
| `/properties` | Explore page, app-style: a left rail goes region → area → location, with type chips (Apartments, Plots, Offices), budget, sort, a "More filters" sheet and compact cards. URL-backed (`?zone=east&corridor=whitefield&loc=…`); each region or area step is a history entry, so Back goes up a level. Opening a card shows the quick-view sheet |
| `/properties/[slug]` | Full detail page. Property cards, the carousel and search open it in a new tab; clicking a card photo opens the photo viewer instead |
| `/contact` | Enquiry form (`?intent=site-visit|price-sheet|loan-help|general&property=slug`) |
| `/shortlist` | The signed-in visitor's saved homes (wishlist), share link, compare, send to WhatsApp. Guests are asked to sign in |
| `/admin/*` | Mock-backed admin: properties, enquiries, developers, corridors, settings (preview flag required; `noindex`) |

Links from the previous site (`?for=`, `?category=`, `?locality=`, `?budgetMin=` …) are still understood by `lib/listingFilters.ts`.

## Design system

"Site Plan" (light) and "Blueprint" (dark) themes via `next-themes` (class strategy, system default, no flash). All colours are CSS variables in `app/globals.css`, mapped in `tailwind.config.ts` (`bg`, `surface`, `ink`, `line`, `accent`…); components use tokens only. Fonts: Plus Jakarta Sans (headings, via the `font-serif` utility), Geist Sans (UI), Geist Mono (RERA numbers, areas). Regions and their colours live in `lib/regions.ts`; home shortcuts, type chips and quick budgets in `lib/categories.ts`. Motion uses `motion` through `LazyMotion` + `domAnimation`, animating transform and opacity only; everything respects `prefers-reduced-motion`.

## Product blueprint (design/EstateNav_Product_Blueprint.pdf)

What the site implements from the blueprint, and what stays hidden until verified data exists:

| Blueprint item | Where |
| --- | --- |
| Fold 1 split hero: segment switch (Residential / Plots / Commercial) re-skins the headline, console and spotlight without reload; console = micro-market search + budget, plot size or monthly rent + live "Show N" | `components/home/HomeHero.tsx` |
| Spotlight carousel with K-RERA badge, highlight and "Inspect allocation deck"; jump link to the partner section | `components/home/HeroCarousel.tsx` |
| Fold 2 corridor telemetry ticker | `components/home/MarketTicker.tsx` — shows only figures saved in **Admin → Market data** (each requires a source and as-of date, printed beside it). Hidden while there are none. |
| Fold 3 inline partner section (no logo) | `components/home/PartnerShowcase.tsx` — track record and construction facts appear only when the developer record has a source for them (**Admin → Developers**) |
| Fold 4 workspace: buyer-lens chips, RERA audit checklist with live counts, Cost & EMI studio and Compare in the desktop rail, sourced area benchmark | `app/properties/PropertyResults.tsx` |
| Financial studio: ₹60 L–₹3.5 Cr, 10/20/30 % down, 15/20/25 yrs, EMI, stamp duty, registration, Section 24(b) year-1 deduction | `components/property/CostStudio.tsx` |
| Mobile bottom nav: Home · Explore · Calculator · Shortlist · Concierge; calculator in an 85 %-height sheet | `components/layout/MobileDock.tsx` |
| CTA wording: "Inspect allocation deck", "Unlock direct developer pricing sheet", "Schedule guided VIP site visit", "Connect with dedicated area advisor" | cards, carousel, detail actions, forms, header, advisor blocks |
| Partner developer in text only (hero link and partner section, no logo); footer agent, K-RERA no., validity, legal disclosure | `components/home/HomeHero.tsx`, `SiteFooter.tsx` |
| Forms show the zero-spam privacy shield and consent text (the card K-RERA badge is built but commented out for now) | `components/forms/LeadForm.tsx` |
| Dark theme on the blueprint palette (#111827 canvas, #10B981 actions); 48 px touch targets on phones | `app/globals.css` |

Not added: the deck's sample figures (corridor ₹/sq.ft, ~79,200 unsold units, absorption, yields, developer track record) and "Abhee Urban Glen" are unsourced or not in the catalogue. Commute filtering waits for measured drive times on listings.

## Data architecture (Firebase-ready, not connected)

```
lib/data/
  schemas.ts          zod schemas — the single source of truth for every collection
  types.ts            domain types inferred from the schemas
  repository.ts       PropertyRepo, LeadRepo, DeveloperRepo, CorridorRepo, MediaRepo, SettingsRepo
  adapters/mock/      in-memory implementation + seed (the nine migrated listings)
  adapters/firestore/ stubs and withConverter skeletons, NOT wired
  index.ts            getRepos() — picks the adapter from NEXT_PUBLIC_DATA_SOURCE (default 'mock')
  media.ts            getMediaRepo() for browser uploads
  cached.ts           unstable_cache reads tagged 'properties' / 'catalogue' / 'settings' (ISR, revalidate 300)
```

Pages read only through `getRepos()` / `lib/data/cached.ts`. Mutations go through Server Actions (`app/actions/enquiries.ts`, `app/actions/admin.ts`), which call the repos and `revalidateTag`. Switching to Firestore means finishing `lib/data/adapters/firestore` and setting `NEXT_PUBLIC_DATA_SOURCE=firestore` — no UI changes.

Fine-grained filters (BHK, amenities, approvals, lenses) run in memory on the server or client. With fewer than ~500 listings this avoids Firestore's single `array-contains-any` per query limit; the ordered queries are covered by `firestore.indexes.json`.

Security rules are drafted in `firestore.rules.draft` and `storage.rules.draft` (not deployed). Enquiries are server-written only.

### Environment variables

See `.env.example`. On Vercel add them under **Project Settings → Environment Variables**. `FIREBASE_ADMIN_*` are server-only; never prefix them with `NEXT_PUBLIC_`.

## Compliance built in

- Header shows no developer logos; the partner developer appears as text only.
- Footer on every public page: RERA Registered Agent SV Praveen, the K-RERA number, validity 16-09-2026 to 16-09-2031, and "EstateNav is an independent advisory portal, not the official developer website."
- The detail page shows the project's K-RERA number with a Verify link, or "RERA details on request". On cards this block is commented out for now at the client's request (`components/explore/ExploreCard.tsx`, `components/property/PropertyCard.tsx`); uncomment to restore.
- Wishlist (heart): sign-in required. Saved to `users/{uid}.shortlist` through `app/actions/wishlist.ts`, which verifies the Firebase ID token; in mock mode it is kept on the device per account.
- Every lead form shows the zero-spam privacy note and the consent line under the submit button; each enquiry stores `consentText`, `consentVersion` and `consentAt`.
- Market stats, yields, commute times and developer facts render only with a `source` and an `asOf` date. Unsourced yield and cap-rate figures from the old data were removed.
- JSON-LD: `RealEstateAgent` (home, contact), `Product` with `AggregateOffer` (detail), `BreadcrumbList` (listings, detail).

## Needed from the client

- Verified K-RERA numbers for each project (and confirmation that the leased commercial listings need one at all).
- Approvals per project: Khata type, plan authority, title/Kaveri check, bank APFs.
- Configuration-level carpet / super areas, prices and floor plans.
- Developer facts (years active, sq.ft delivered, construction method) with a citable source.
- Sourced market snapshots and measured commute times, each with a date.
- Real project renders and photos with usage rights (Unsplash placeholders are marked "Representative images"), and SV Praveen's photo for the advisor block.
- Confirmation of the Karnataka stamp duty and registration rates and their effective date (`/admin/settings`).
