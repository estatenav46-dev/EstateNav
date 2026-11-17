// Small in-memory limiter per server instance: enough to blunt scripted floods of the public
// visitor endpoints. (Each serverless instance keeps its own window.)
const windows = new Map<string, { start: number; count: number }>();

export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || now - entry.start > windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 5000) windows.clear();
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
