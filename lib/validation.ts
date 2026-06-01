import { z } from "zod";

const urlField = z.string().url().max(2048).optional().or(z.literal(""));
const stringField = (max: number) => z.string().trim().min(1).max(max);
const optionalString = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const baseFields = {
  title: stringField(300),
  summary: stringField(1000),
  category: stringField(100),
  coverImage: urlField,
};

export const noticiasSchema = z.object({
  ...baseFields,
  content: stringField(50_000),
  author: optionalString(200),
});

export const eventosSchema = z.object({
  ...baseFields,
  eventType: stringField(100),
  location: stringField(500),
  audience: stringField(200),
  startsAt: stringField(50),
  endsAt: optionalString(50),
  externalSignupUrl: urlField,
});

export const musicasSchema = z.object({
  ...baseFields,
  songType: stringField(100),
  lyrics: stringField(50_000),
  youtubeUrl: urlField,
  spotifyUrl: urlField,
});

export const espiritualidadesSchema = z.object({
  ...baseFields,
  spiritualType: stringField(100),
  content: stringField(50_000),
});

export const avisosSchema = z.object({
  title: stringField(300),
  message: stringField(5000),
  level: stringField(50),
  startsAt: optionalString(50),
  endsAt: optionalString(50),
  ctaLabel: optionalString(100),
  ctaUrl: urlField,
});

export const contentSchemas = {
  noticias: noticiasSchema,
  eventos: eventosSchema,
  musicas: musicasSchema,
  espiritualidades: espiritualidadesSchema,
  avisos_oficiais: avisosSchema,
} as const;

export const deleteSchema = z.object({
  type: z.enum(["noticias", "eventos", "musicas", "espiritualidades", "avisos_oficiais"]),
  id: z.string().min(1).max(200),
});

export const integrationsActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sync") }),
  z.object({ action: z.literal("publish"), ids: z.array(z.string().min(1).max(200)).min(1).max(100) }),
  z.object({ action: z.literal("archive"), ids: z.array(z.string().min(1).max(200)).min(1).max(100) }),
]);

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);

export function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
