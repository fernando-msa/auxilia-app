import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { mockCalendarEvents } from "@/lib/mock-content";
import type { EventItem } from "@/types/content";

type FirestoreDoc = Record<string, unknown>;

function asDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLifecycleStatus(
  startsAt: string,
  endsAt?: string
): "upcoming" | "ongoing" | "finished" {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 2 * 60 * 60 * 1000;

  if (now < start) return "upcoming";
  if (now <= end) return "ongoing";
  return "finished";
}

function mapCalendarEvent(id: string, doc: FirestoreDoc): EventItem {
  const startsAt = String(doc.startsAt ?? doc.data ?? new Date().toISOString());
  const endsAt = typeof doc.endsAt === "string" ? doc.endsAt : undefined;

  return {
    id,
    type: "event",
    slug: String(doc.slug ?? toSlug(String(doc.title ?? doc.titulo ?? id))),
    title: String(doc.title ?? doc.titulo ?? "Sem título"),
    summary: String(doc.summary ?? doc.resumo ?? ""),
    category: String(doc.category ?? doc.categoria ?? "Agenda"),
    coverImage: typeof doc.coverImage === "string" ? doc.coverImage : undefined,
    eventType: (doc.eventType as EventItem["eventType"]) ?? "outro",
    status: (doc.status as "draft" | "published" | "archived") ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    location: String(doc.location ?? doc.local ?? "Local a definir"),
    audience: String(doc.audience ?? doc.publico ?? "Comunidade"),
    startsAt,
    endsAt,
    lifecycleStatus: toLifecycleStatus(startsAt, endsAt),
    externalSignupUrl:
      typeof doc.externalSignupUrl === "string" ? doc.externalSignupUrl : undefined,
    publishedAt: asDateString(doc.publishedAt ?? doc.createdAt),
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : undefined,
  };
}

export async function getCalendarEvents(): Promise<EventItem[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("eventos")
      .orderBy("startsAt", "asc")
      .limit(50)
      .get();

    if (snapshot.empty) return mockCalendarEvents;

    return snapshot.docs
      .map((doc) => mapCalendarEvent(doc.id, doc.data()))
      .filter((item) => item.status === "published");
  } catch {
    return mockCalendarEvents;
  }
}
