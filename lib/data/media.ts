import type { MediaRepo } from './repository';
import { mockMediaRepo } from './adapters/mock/media';
import { firestoreMediaRepo } from './adapters/firestore';

/** Browser-side media uploads for the admin panel (kept apart from getRepos so seed data never ships to the client). */
export function getMediaRepo(): MediaRepo {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === 'firestore' ? firestoreMediaRepo : mockMediaRepo;
}
