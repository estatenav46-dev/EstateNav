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
| `/` | Hero (segment switch, search console, featured carousel), "Where do you want to live?" photo cards (West and Central as coming-soon cards), "What are you looking for?" (type photo cards and need pills with custom icons), "Picked for you", partner section and the advisory band |
| `/properties` | Explore page, app-style: a left rail goes region → area → location, with type chips (Apartments, Plots, Offices), budget, sort, a "More filters" sheet and compact cards. From 1024px a "What's around" panel beside the headline (`components/explore/PlaceSnapshot.tsx`, data in `lib/placeGuides.ts`) describes the region or area on show: a one-line summary plus its work hubs, transport, schools and hospitals, compiled from public sources (names only, no distances); tablets show the one-line summary. The search box sits at the end of the filter row there. URL-backed (`?zone=east&corridor=whitefield&loc=…`); each region or area step is a history entry, so Back goes up a level. Opening a card shows the quick-view sheet |
| `/properties/[slug]` | Full detail page. Property cards, the carousel and search open it in a new tab; clicking a card photo opens the photo viewer instead |
| `/contact` | Enquiry form (`?intent=site-visit|price-sheet|loan-help|general&property=slug`) |
| `/shortlist` | The signed-in visitor's saved homes (wishlist), share link, compare, send to WhatsApp. Guests are asked to sign in |
| `/admin/*` | Mock-backed admin: properties, enquiries, developers, corridors, settings (preview flag required; `noindex`) |

Links from the previous site (`?for=`, `?category=`, `?locality=`, `?budgetMin=` …) are still understood by `lib/listingFilters.ts`.

## Design system

Art direction: an editorial property desk. Calm limestone pages, a deep estate green for actions, brass only for small details, real project photographs carrying every section, and serif display type for headings. Light theme "Site Plan", dark theme "Blueprint" (the blueprint deck's slate `#111827` canvas and emerald `#10B981` actions), via `next-themes` (class strategy, light by default, no flash).

| Layer | Where | Notes |
| --- | --- | --- |
| Colour tokens | `app/globals.css` (`:root`, `.dark`), mapped in `tailwind.config.ts` | `bg` limestone `#F6F4EF`, `surface`, `surface-2`, `ink`, `ink-muted`, `line`, `line-strong`, `accent` estate green `#195C43` (white text 7.8:1), `accent-soft`, `forest` and `night` bands, `brass`, `sand`. Components use tokens only. Region tints (`.zone-*`) avoid violet. |
| Type | `app/layout.tsx` | Source Serif 4 (`font-serif`, weight 500, optical sizing) for headings, in one colour. Only the hero headline (`hero-accent`) sets its highlighted words in green italic, as the site's one signature; elsewhere `text-accent-ink`/`text-brass` spans inside a serif heading take the heading colour. The rules use attribute selectors because Tailwind copies class-named rules into every variant. Geist Sans for UI and body, Geist Mono for RERA numbers. Root size 100% on phones and tablets, 15px from 1024px, never smaller. |
| Radius scale | `--radius-sm` 8px, `--radius` 12px (buttons, fields), `rounded-card` 18px (cards, panels, photos), `rounded-slide` 24px (sheets, large dialogs), `rounded-full` for chips, icon buttons and badges | |
| Buttons | `.btn-primary`, `.btn-secondary`, `.btn-ghost` | One family: 12px corners, step up 1px on hover, press to 97% on click, trailing arrows loop. 48px tall on touch screens, 40px on desktop. |
| Chips | `.chip` | Outlined pills; the chosen one (`aria-pressed`, `aria-checked`, `data-active`) fills with ink. |
| Fields | `.field` | 48px, 12px corners, green border plus soft 4px ring on focus, red ring when `aria-invalid`. |
| Cards | `components/explore/ExploreCard.tsx` (and `.lift`, `.lift-photo`) | One card family everywhere listings appear: 4:3 photo, serif title, location and developer, price row with rate, unit types, size, then Possession / Type / K-RERA. Hover lifts 2px and zooms the photo 3%. Under 230px wide (two-up on phones) the card drops to title, place and price. |
| Section headings | `components/home/SectionHeading.tsx` | A short sentence-case label above a serif title (about 2.1rem on desktop); no numbered indexes or decorative rules. |
| Project page | `app/properties/[slug]/PropertyDetail.tsx` | One document: sections divided by hairlines with serif titles, no boxes around them; the sticky price card sits in a 340px column. |
| Surfaces | | Flat page ground (the drafting grid is gone; `BlueprintBackdrop` keeps only the faint building drawing in the corner). Deep forest for the advisory band and advisor notes, near-black green for the footer. |
| Loading and empty states | `app/**/loading.tsx`, explore, shortlist, blog | Skeletons match the real layouts; empty states are a centred icon disc, serif title, one line and one action. |
| Few-item layouts | home regions and types, hero showcase, explore, project page | One or two regions become compact cards (a 20rem photo beside the details) and one or two property types become 16rem-tall banners, so a lone tile never fills the screen; one featured project fills the hero rail and its controls hide; with no featured project the hero is one column; one or two explore results get a "Want more options?" card with relaxed-filter suggestions; fact rows, amenity, nearby and developer groups stretch to fill their row. |
| Phones | | The home hero drops its kicker, subline and concierge link (the dock has Concierge), so featured projects show on the first screen. The project page opens on the photos, then name, price, RERA and key facts; the breadcrumb trail shows from 640px up. |

Sizes and spacing come from Tailwind's scale; home sections are separated by 48–64px, cards by 20px. The home hero is a normal-height band (not full screen) with 23–24rem showcase cards; property types are compact thumbnail cards. Regions in `lib/regions.ts`; home shortcuts, type chips and quick budgets in `lib/categories.ts`. Motion uses `motion` through `LazyMotion` + `domAnimation` and CSS, animating transform and opacity only; everything respects `prefers-reduced-motion`.

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

## Visitors, consent and personalisation

- **Cookie banner** (`components/privacy/CookieBanner.tsx`): "Accept all", "Essential only" or "Customise" (essential always on, personalisation as a switch), reopened from "Cookie settings" in the footer. Nothing is tracked until personalisation is allowed; choosing "Essential only" clears the personalisation data on the device.
- **Welcome concierge** (`components/concierge/ConciergeFlow.tsx`): goal → region → budget → name and mobile, with a live match count and photos of matching homes. It opens as a centred dialog on the home page shortly after the cookie choice (`WelcomeConcierge.tsx`; never for signed-in users, not again once answered, or for 3 days after "I'll browse first"), from the hero's "Get matched in 30 seconds", and sits inline in the home page's "Your brief" section until answered, which then shows the picks. Answers are saved by `app/actions/visitors.ts` to `visitors/{visitorId}` (plus a `leads` subcollection) with the consent text and version, and UTM tags.
- **Browsing signals** (`lib/ui/visitor.ts` → `POST /api/track`): page and property views, filters, region picks, wishlist and compare events, batched and rate-limited, stored under `visitors/{visitorId}/events` with interest counters (`interest.zone.east`, …) on the visitor document. The same signals drive the home page's "Picked for you" rail on the device.
- Visitor data is written by the server only; `firestore.rules.draft` gives staff read access and denies client writes. Admin screens for visitors come next (separate admin app).

## Motion and interaction

- **Scroll reveals** (`components/Reveal.tsx`): `variant` = `up`, `zoom`, `left`, `right`, `clip` (photo wipes up while it settles) or `words` (wrap the title in `<Words>`); one shared observer, each runs once.
- **Scroll-linked effects** (`components/ui/Interactions.tsx`): elements with `data-scrub` (`enter`, `exit` or a full pass) get `--p` from 0 to 1 for the `.sc-*` classes in `app/globals.css`; today only the hero drifts away on desktop (the advisory band and footer wordmark are static). `data-parallax` moves photo layers; `data-scroll-progress` is the bar under the header. Reveals rise 28px at most and never tilt.
- **Hero**: Residential → Plots → Commercial cycle with the featured projects until the visitor picks a segment or starts searching (`components/home/HomeHero.tsx`, `HeroShowcase.tsx`).
- **Dropdowns** use `components/ui/Select.tsx` (listbox with keyboard support, counts per option) instead of native selects; **navigation** shows a top progress bar at once (`components/ui/NavProgress.tsx`) and the explore and project pages have loading skeletons.
- Everything respects the visitor's reduced-motion setting.

## Property page extras

- Prices carry an asterisk: approximate developer guide price, terms and conditions apply, contact for the latest sheet.
- "Similar homes" ranks other listings by area/region, BHK overlap and price (`lib/similar.ts`): four cards in a grid (a swipe row on phones), with the reasons shown on each photo.
- Property cards open the project page (new tab) from anywhere on the card; the photo-count chip opens the gallery.
- "Compared for you" puts the project beside its two closest matches, with swappable columns and highlighted differences (`components/property/AutoCompare.tsx`).

## Listing details (entered in EstateNav-admin)

Listings are created in the separate admin app (`EstateNav-admin`, see its README for the step-by-step flow). The project page (`app/properties/[slug]/PropertyDetail.tsx`) shows each section only when it has data, with a sticky "On this page" bar:

| Section | Data (in `lib/data/schemas.ts`) |
| --- | --- |
| Overview | type, configurations, size, rate, `facts` (acres, units, towers, floors, open space, clubhouse, launch), possession and RERA completion dates |
| Unit types & prices | `configurations` with carpet / super built-up area, bathrooms, dimensions, availability, note and the linked floor plan, plus unit type, balcony, terrace, UDS, rate, all-inclusive price, car parks, facing, tower and unit count when set. Grouped by BHK and unit type, so 4 BHK row houses and 4 BHK apartments stay apart (`components/property/ConfigExplorer.tsx`, `UnitTable.tsx`) |
| Price breakdown | `charges`: each cost-sheet line with amount and basis (`components/property/CostBreakdown.tsx`) |
| Payment plan | `paymentPlan`: type, booking % and stages |
| Floor plans | `media.masterPlan` and `media.floorPlans`, opened in the photo viewer (`PlanGallery.tsx`) |
| Amenities | `amenities`, grouped by `lib/listingMeta.ts` |
| Specifications | `specifications` (category and detail) |
| Location & connectivity | address, Google Maps link, `nearby` places grouped by transit, work, education, health and leisure, and the commute radar |
| RERA & approvals | verification ledger |
| Brochure & documents | `documents`: public files download; "on request" files open the enquiry form, and their links are removed before listings reach the browser (`lib/data/publicView.ts`) |
| More details | `extraDetails` label and value rows, grouped |
| Developer | partner profile and sourced track record |

`priceOnRequest` shows "Price on request" everywhere a price would appear (cards, header, compare, JSON-LD); `priceMin` still drives budget filters. An active `offer` shows as a badge on the card and the project page. Every new field has a schema default, so listings saved before these fields existed still load. Cards, search, compare and the shortlist receive a lighter copy of each listing (`toCardView` in `lib/data/publicView.ts`); only the project page gets the full record. A listing that fails validation is skipped and logged instead of breaking every page. A starting price of ₹1 (imported with no price) is left out of budget filters.

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
