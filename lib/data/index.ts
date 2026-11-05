import type { Repos } from './repository';
import { mockRepos } from './adapters/mock';
import { firestoreRepos } from './adapters/firestore';

export type DataSource = 'mock' | 'firestore';

export const dataSource: DataSource = process.env.NEXT_PUBLIC_DATA_SOURCE === 'firestore' ? 'firestore' : 'mock';

/** The only way pages, components and Server Actions reach data. */
export function getRepos(): Repos {
  return dataSource === 'firestore' ? firestoreRepos : mockRepos;
}

export type * from './types';
export type * from './repository';
