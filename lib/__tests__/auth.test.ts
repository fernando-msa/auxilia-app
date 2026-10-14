import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyIdToken = vi.fn();

vi.mock("@/lib/firebaseAdmin", () => ({
  getAdminAuth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

describe("validateAdminRequest", () => {
  beforeEach(() => {
    vi.resetModules();
    mockVerifyIdToken.mockReset();
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

  it("returns 403 when email is not verified", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      email: "admin@example.com",
      email_verified: false,
    });
    const { validateAdminRequest } = await import("@/lib/auth");
    const request = new Request("http://localhost", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const result = await validateAdminRequest(request);
    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(403);
    }
  });

  it("returns 403 when email is not in allowlist", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      email: "attacker@example.com",
      email_verified: true,
    });
    const { validateAdminRequest } = await import("@/lib/auth");
    const request = new Request("http://localhost", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const result = await validateAdminRequest(request);
    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(403);
    }
  });

  it("returns userEmail when email is verified and allowed", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      email: "admin@example.com",
      email_verified: true,
    });
    const { validateAdminRequest } = await import("@/lib/auth");
    const request = new Request("http://localhost", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const result = await validateAdminRequest(request);
    expect("userEmail" in result).toBe(true);
    if ("userEmail" in result) {
      expect(result.userEmail).toBe("admin@example.com");
    }
  });
});

