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
| `/` | Segment-aware hero (`?seg=residential|plot|commercial|rent`), centre-focus carousel, search console, corridor map explorer, bento portfolio, partner developer, how it works, advisor block |
| `/properties` | Split workspace: filter rail, instant results (grid / list / map), URL-backed filters, compare |
| `/properties/[slug]` | Full detail page. Opening a card from inside the site shows the same URL as a quick-view sheet (intercepting route in `app/@modal`) |
| `/contact` | Enquiry form (`?intent=site-visit|price-sheet|loan-help|general&property=slug`) |
| `/shortlist` | Hearted properties (local today), share link, compare, send to WhatsApp |
| `/admin/*` | Mock-backed admin: properties, enquiries, developers, corridors, settings (preview flag required; `noindex`) |

Links from the previous site (`?for=`, `?category=`, `?locality=`, `?budgetMin=` …) are still understood by `lib/listingFilters.ts`.

## Design system

"Site Plan" (light) and "Blueprint" (dark) themes via `next-themes` (class strategy, system default, no flash). All colours are CSS variables in `app/globals.css`, mapped in `tailwind.config.ts` (`bg`, `surface`, `ink`, `line`, `accent`…); components use tokens only. Fonts: Instrument Serif (display), Geist Sans (UI), Geist Mono (RERA numbers, areas). Motion uses `motion` through `LazyMotion` + `domAnimation`, animating transform and opacity only; everything respects `prefers-reduced-motion`.

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
- Every card and detail page shows the project's K-RERA number with a Verify link, or "RERA details on request".
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
