import type { BlogPost } from './data/types';

export const blogDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '';

/** The post that leads the blog page: the newest featured one, otherwise the newest. */
export const leadPost = (posts: BlogPost[]) => posts.find((p) => p.featured) ?? posts[0] ?? null;

/** Posts for the lead carousel: every featured post (newest first, up to 6), or just the newest. */
export const featuredPosts = (posts: BlogPost[], max = 6) => {
  const starred = posts.filter((p) => p.featured).slice(0, max);
  return starred.length ? starred : posts.slice(0, 1);
};

/** Other posts worth reading next: same category and shared tags first, then the newest. */
export function suggestedPosts(current: BlogPost, all: BlogPost[], count = 4): BlogPost[] {
  const tags = new Set(current.tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.id !== current.id)
    .map((p, i) => ({
      p,
      score: (p.category === current.category ? 3 : 0) + p.tags.filter((t) => tags.has(t.toLowerCase())).length * 2 + (p.featured ? 1 : 0) - i * 0.01,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.p);
}

/** Posts written as the agent are credited to EstateNav: the agent's name appears only in the site footer. */
export function publicAuthor(author: { name: string; role: string }): { name: string; role: string } {
  return /praveen/i.test(author.name) ? { name: 'EstateNav Advisory', role: '' } : author;
}
