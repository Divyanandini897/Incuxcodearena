const rateMap = new Map<string, number>();

const WINDOW_MS = 60_000;

export function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const last = rateMap.get(key);
  if (last && now - last < WINDOW_MS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - last)) / 1000);
    return { allowed: false, retryAfter };
  }
  rateMap.set(key, now);
  return { allowed: true, retryAfter: 0 };
}
