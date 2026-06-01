import { describe, it, expect } from "vitest";
import {
  noticiasSchema,
  eventosSchema,
  musicasSchema,
  espiritualidadesSchema,
  deleteSchema,
  integrationsActionSchema,
  toSlug,
} from "@/lib/validation";

describe("toSlug", () => {
  it("converts a title to a URL-friendly slug", () => {
    expect(toSlug("Olá Mundo")).toBe("ola-mundo");
  });

  it("removes special characters", () => {
    expect(toSlug("Evento! @2024 #Jovens")).toBe("evento-2024-jovens");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(toSlug("  múltiplos   espaços  ")).toBe("multiplos-espacos");
  });

  it("handles empty string", () => {
    expect(toSlug("")).toBe("");
  });
});

describe("noticiasSchema", () => {
  const validNews = {
    title: "Título da notícia",
    summary: "Resumo da notícia",
    category: "Geral",
    content: "Conteúdo completo da notícia",
  };

  it("accepts valid data", () => {
    const result = noticiasSchema.safeParse(validNews);
    expect(result.success).toBe(true);
  });

  it("accepts with optional author", () => {
    const result = noticiasSchema.safeParse({ ...validNews, author: "João" });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = noticiasSchema.safeParse({
      summary: "Resumo",
      category: "Geral",
      content: "Conteúdo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty summary", () => {
    const result = noticiasSchema.safeParse({ ...validNews, summary: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title over 300 chars", () => {
    const result = noticiasSchema.safeParse({ ...validNews, title: "a".repeat(301) });
    expect(result.success).toBe(false);
  });
});

describe("eventosSchema", () => {
  const validEvent = {
    title: "Retiro de Jovens",
    summary: "Retiro espiritual",
    category: "Agenda",
    eventType: "retiro",
    location: "Paróquia São José",
    audience: "Jovens 18-30",
    startsAt: "2026-06-15T10:00:00Z",
  };

  it("accepts valid event data", () => {
    const result = eventosSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("accepts with optional externalSignupUrl", () => {
    const result = eventosSchema.safeParse({
      ...validEvent,
      externalSignupUrl: "https://example.com/signup",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL in externalSignupUrl", () => {
    const result = eventosSchema.safeParse({
      ...validEvent,
      externalSignupUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("musicasSchema", () => {
  const validSong = {
    title: "Hino da Juventude",
    summary: "Hino oficial",
    category: "Música",
    songType: "hino",
    lyrics: "Letra do hino aqui",
  };

  it("accepts valid song data", () => {
    const result = musicasSchema.safeParse(validSong);
    expect(result.success).toBe(true);
  });

  it("accepts with optional URLs", () => {
    const result = musicasSchema.safeParse({
      ...validSong,
      youtubeUrl: "https://youtube.com/watch?v=abc",
      spotifyUrl: "https://open.spotify.com/track/abc",
    });
    expect(result.success).toBe(true);
  });
});

describe("espiritualidadesSchema", () => {
  const validSpiritual = {
    title: "Reflexão do Dia",
    summary: "Reflexão para jovens",
    category: "Espiritualidade",
    spiritualType: "reflexao",
    content: "Conteúdo da reflexão",
  };

  it("accepts valid spiritual content", () => {
    const result = espiritualidadesSchema.safeParse(validSpiritual);
    expect(result.success).toBe(true);
  });
});

describe("deleteSchema", () => {
  it("accepts valid delete payload", () => {
    const result = deleteSchema.safeParse({ type: "noticias", id: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid collection type", () => {
    const result = deleteSchema.safeParse({ type: "invalid", id: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = deleteSchema.safeParse({ type: "noticias", id: "" });
    expect(result.success).toBe(false);
  });
});

describe("integrationsActionSchema", () => {
  it("accepts sync action", () => {
    const result = integrationsActionSchema.safeParse({ action: "sync" });
    expect(result.success).toBe(true);
  });

  it("accepts publish action with ids", () => {
    const result = integrationsActionSchema.safeParse({ action: "publish", ids: ["id1", "id2"] });
    expect(result.success).toBe(true);
  });

  it("rejects publish action without ids", () => {
    const result = integrationsActionSchema.safeParse({ action: "publish" });
    expect(result.success).toBe(false);
  });

  it("rejects publish action with empty ids array", () => {
    const result = integrationsActionSchema.safeParse({ action: "publish", ids: [] });
    expect(result.success).toBe(false);
  });

  it("rejects unknown action", () => {
    const result = integrationsActionSchema.safeParse({ action: "delete" });
    expect(result.success).toBe(false);
  });
});
