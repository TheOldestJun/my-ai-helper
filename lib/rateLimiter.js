const requests = new Map();

const CLEANUP_INTERVAL = 60_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

let lastCleanup = Date.now();

export function rateLimit(ip) {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of requests) {
      if (now - entry.windowStart > WINDOW_MS) {
        requests.delete(key);
      }
    }
    lastCleanup = now;
  }

  const entry = requests.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count++;
  requests.set(ip, entry);

  return {
    allowed: entry.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetTime: entry.windowStart + WINDOW_MS,
  };
}
