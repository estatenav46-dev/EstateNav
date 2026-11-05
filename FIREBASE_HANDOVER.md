# Firebase handover

Firebase is not connected. Everything is built so that connecting it means finishing one adapter.

## Steps

1. `npm install firebase firebase-admin` (the old unused `lib/firebase.ts` client helper can then be removed).
2. Implement `lib/data/adapters/firestore/index.ts` with the Admin SDK on the server, reading through the converters in `converters.ts` (`withConverter`). Dates are ISO strings in the app and Timestamps in Firestore.
3. Implement `firestoreMediaRepo` with `uploadBytesResumable` to the storage paths below, reporting progress to the admin uploader.
4. Deploy `firestore.rules.draft`, `storage.rules.draft` and `firestore.indexes.json` after review.
5. Set `NEXT_PUBLIC_DATA_SOURCE=firestore` and the Firebase env vars (see `.env.example`).
6. Replace the `NEXT_PUBLIC_ADMIN_PREVIEW` guard (`lib/admin.ts`, `app/admin/layout.tsx`) with Google sign-in plus a `users/{uid}.role` check, and move the shortlist from localStorage (`lib/ui/stores.ts`) to `users/{uid}.shortlist`.
7. Import the seed: `lib/data/adapters/mock/seed.ts` already matches the schemas.

## Collections

`properties`, `developers`, `corridors`, `marketSnapshots`, `officeHubs`, `enquiries`, `settings/site`, `users` — shapes in `lib/data/schemas.ts`.

## Storage paths

```
properties/{propertyId}/gallery/{imageId}.{ext}
properties/{propertyId}/floorplans/{imageId}.{ext}
properties/{propertyId}/brochure/{fileId}.pdf
developers/{developerId}/logo.{ext}
corridors/{corridorId}/hero.{ext}
```

The admin uploader extracts width, height and a 16px blur preview in the browser before upload and stores them on each `ImageRef`.
