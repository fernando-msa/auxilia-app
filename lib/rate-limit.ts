const store = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 30;
const MAX_STORE_SIZE = 10_000;

// Limpeza automática periódica para evitar vazamento de memória e exaustão DoS
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60_000 && store.size < MAX_STORE_SIZE) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }

  // Se ainda estiver acima do limite máximo após expirar, evict entradas antigas
  if (store.size > MAX_STORE_SIZE) {
    const toRemove = store.size - MAX_STORE_SIZE;
    let count = 0;
    for (const key of store.keys()) {
      store.delete(key);
      count++;
      if (count >= toRemove) break;
    }
  }
}

export function checkRateLimit(
  key: string,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS
): boolean {
  cleanupExpired();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export function getClientIp(request: Request): string {
  // Prioriza cabeçalhos comuns em provedores de nuvem (Cloudflare, Vercel, etc.)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "127.0.0.1";
}


