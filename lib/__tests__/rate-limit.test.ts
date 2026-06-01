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

  it("tracks different keys independently", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 30; i++) {
      checkRateLimit("test:4a");
    }
    expect(checkRateLimit("test:4a")).toBe(false);
    expect(checkRateLimit("test:4b")).toBe(true);
  });
});
