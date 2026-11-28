// The grand-launch announcement in the top bar. It links to the public launch page; never add the
// page's ?preview= key here, which turns on a simulated test audience meant only for the team.
// The banner stops showing after `showUntil` (IST date), or set `url` to '' to hide it now.
export const LAUNCH_BANNER = {
  url: 'https://brand-launch-sepia.vercel.app/',
  showUntil: '2026-12-31',
};

export function launchBannerActive(now = new Date()): boolean {
  if (!LAUNCH_BANNER.url) return false;
  const today = new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10); // IST
  return today <= LAUNCH_BANNER.showUntil;
}
