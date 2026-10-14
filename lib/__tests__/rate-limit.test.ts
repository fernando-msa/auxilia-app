import { describe, it, expect, vi, beforeEach } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows first request", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    expect(checkRateLimit("test:1")).toBe(true);
  });

  it("allows up to 30 requests in window", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 29; i++) {
      checkRateLimit("test:2");
    }
    expect(checkRateLimit("test:2")).toBe(true);
  });

  it("blocks after 30 requests", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 30; i++) {
      checkRateLimit("test:3");
    }
    expect(checkRateLimit("test:3")).toBe(false);
  });

  it("supports custom maxRequests limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    expect(checkRateLimit("custom:key", 2)).toBe(true);
    expect(checkRateLimit("custom:key", 2)).toBe(true);
    expect(checkRateLimit("custom:key", 2)).toBe(false);
  });
});

describe("getClientIp", () => {
  it("extracts IP from cf-connecting-ip header", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const req = new Request("http://localhost", {
      headers: { "cf-connecting-ip": "198.51.100.5" },
    });
    expect(getClientIp(req)).toBe("198.51.100.5");
  });

  it("extracts IP from x-vercel-forwarded-for header", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const req = new Request("http://localhost", {
      headers: { "x-vercel-forwarded-for": "203.0.113.195, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("extracts IP from x-real-ip header", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.22" },
    });
    expect(getClientIp(req)).toBe("198.51.100.22");
  });

  it("extracts first IP from x-forwarded-for header", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.0.2.1, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("192.0.2.1");
  });

  it("falls back to 127.0.0.1 if no headers are present", async () => {
    const { getClientIp } = await import("@/lib/rate-limit");
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});

