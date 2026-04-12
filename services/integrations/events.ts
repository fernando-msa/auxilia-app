import { createHash } from "node:crypto";
import type { EventItem } from "@/types/content";

export type ExternalEvent = {
  externalId: string;
  title: string;
  summary: string;
  category?: string;
  eventType?: EventItem["eventType"];
  location?: string;
  audience?: string;
  startsAt: string;
  endsAt?: string;
  externalSignupUrl?: string;
  sourceUrl?: string;
};

export type ImportedEventRecord = {
  externalId: string;
  importHash: string;
  source: string;
  sourceUrl?: string;
  title: string;
  summary: string;
  category: string;
  eventType: EventItem["eventType"];
  location: string;
  audience: string;
  startsAt: string;
  endsAt?: string;
  externalSignupUrl?: string;
  status: "imported";
  importedAt: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildImportHash(event: ExternalEvent) {
  const payload = [
    event.externalId,
    normalizeText(event.title),
    normalizeText(event.summary),
    event.startsAt,
    event.endsAt ?? "",
    event.location ?? "",
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

function toImportedRecord(event: ExternalEvent, source: string): ImportedEventRecord {
  return {
    externalId: event.externalId,
    importHash: buildImportHash(event),
    source,
    sourceUrl: event.sourceUrl,
    title: event.title,
    summary: event.summary,
    category: event.category ?? "Agenda",
    eventType: event.eventType ?? "outro",
    location: event.location ?? "Local a definir",
    audience: event.audience ?? "Comunidade",
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    externalSignupUrl: event.externalSignupUrl,
    status: "imported",
    importedAt: new Date().toISOString(),
  };
}

export async function fetchGoogleCalendarEvents(): Promise<ExternalEvent[]> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (!calendarId || !apiKey) {
    return [];
  }

  const now = new Date().toISOString();
  const endpoint = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );

  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("singleEvents", "true");
  endpoint.searchParams.set("orderBy", "startTime");
  endpoint.searchParams.set("timeMin", now);
  endpoint.searchParams.set("maxResults", "25");

  const response = await fetch(endpoint.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar Google Calendar (${response.status}).`);
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id?: string;
      summary?: string;
      description?: string;
      location?: string;
      htmlLink?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }>;
  };

  return (payload.items ?? [])
    .filter((item) => item.id && item.summary && (item.start?.dateTime || item.start?.date))
    .map((item) => ({
      externalId: String(item.id),
      title: String(item.summary),
      summary: String(item.description ?? "Evento importado automaticamente para curadoria."),
      startsAt: String(item.start?.dateTime ?? item.start?.date),
      endsAt: item.end?.dateTime ?? item.end?.date,
      location: item.location,
      sourceUrl: item.htmlLink,
    }));
}

export async function importEventsFromProviders() {
  const providerResults = await Promise.allSettled([fetchGoogleCalendarEvents()]);

  const imported: ImportedEventRecord[] = [];
  const warnings: string[] = [];

  providerResults.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.forEach((event) => imported.push(toImportedRecord(event, "google-calendar")));
      return;
    }

    warnings.push(result.reason instanceof Error ? result.reason.message : "Falha desconhecida");
  });

  return { imported, warnings };
}
