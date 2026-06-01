import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebaseAdmin", () => ({
  getAdminAuth: () => ({
    verifyIdToken: vi.fn(),
  }),
}));

describe("validateAdminRequest", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CONTENT_ADMIN_EMAILS = "admin@example.com,other@example.com";
  });

  it("returns 401 when no Authorization header is present", async () => {
    const { validateAdminRequest } = await import("@/lib/auth");
    const request = new Request("http://localhost", { headers: {} });
    const result = await validateAdminRequest(request);
    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(401);
    }
  });

  it("returns 401 when token is empty string", async () => {
    const { validateAdminRequest } = await import("@/lib/auth");
    const request = new Request("http://localhost", {
      headers: { Authorization: "Bearer " },
    });
    const result = await validateAdminRequest(request);
    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(401);
    }
  });
});
