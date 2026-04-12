import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import {
  mockEvents,
  mockNews,
  mockNotices,
  mockSongs,
  mockSpiritualContents,
} from "@/lib/mock-content";
import type {
  ContentStatus,
  EventItem,
  NewsItem,
  OfficialNotice,
  SongItem,
  SpiritualContentItem,
  SupportedCollection,
} from "@/types/content";

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

function isPublicStatus(status: unknown) {
  return status === "published";
}

function toLifecycleStatus(startsAt: string, endsAt?: string): EventItem["lifecycleStatus"] {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 2 * 60 * 60 * 1000;

  if (now < start) return "upcoming";
  if (now <= end) return "ongoing";
  return "finished";
}

function mapNews(id: string, doc: FirestoreDoc): NewsItem {
  return {
    id,
    type: "news",
    slug: String(doc.slug ?? toSlug(String(doc.title ?? doc.titulo ?? id))),
    title: String(doc.title ?? doc.titulo ?? "Sem título"),
    summary: String(doc.summary ?? doc.resumo ?? ""),
    category: String(doc.category ?? doc.categoria ?? "Geral"),
    coverImage: typeof doc.coverImage === "string" ? doc.coverImage : undefined,
    content: String(doc.content ?? doc.conteudo ?? doc.summary ?? doc.resumo ?? ""),
    status: (doc.status as ContentStatus) ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    author: typeof doc.author === "string" ? doc.author : undefined,
    publishedAt: asDateString(doc.publishedAt ?? doc.createdAt),
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : undefined,
  };
}

function mapEvent(id: string, doc: FirestoreDoc): EventItem {
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
    status: (doc.status as ContentStatus) ?? "published",
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

function mapSong(id: string, doc: FirestoreDoc): SongItem {
  return {
    id,
    type: "song",
    slug: String(doc.slug ?? toSlug(String(doc.title ?? doc.titulo ?? id))),
    title: String(doc.title ?? doc.titulo ?? "Sem título"),
    summary: String(doc.summary ?? doc.resumo ?? ""),
    category: String(doc.category ?? doc.categoria ?? "Música"),
    coverImage: typeof doc.coverImage === "string" ? doc.coverImage : undefined,
    songType: (doc.songType as SongItem["songType"]) ?? "outro",
    status: (doc.status as ContentStatus) ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    lyrics: String(doc.lyrics ?? doc.letra ?? ""),
    youtubeUrl: typeof doc.youtubeUrl === "string" ? doc.youtubeUrl : undefined,
    spotifyUrl: typeof doc.spotifyUrl === "string" ? doc.spotifyUrl : undefined,
    publishedAt: asDateString(doc.publishedAt ?? doc.createdAt),
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : undefined,
  };
}

function mapSpiritual(id: string, doc: FirestoreDoc): SpiritualContentItem {
  return {
    id,
    type: "spiritual",
    slug: String(doc.slug ?? toSlug(String(doc.title ?? doc.titulo ?? id))),
    title: String(doc.title ?? doc.titulo ?? "Sem título"),
    summary: String(doc.summary ?? doc.resumo ?? ""),
    category: String(doc.category ?? doc.categoria ?? "Espiritualidade"),
    coverImage: typeof doc.coverImage === "string" ? doc.coverImage : undefined,
    spiritualType: (doc.spiritualType as SpiritualContentItem["spiritualType"]) ?? "mensagem",
    status: (doc.status as ContentStatus) ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    content: String(doc.content ?? doc.conteudo ?? ""),
    publishedAt: asDateString(doc.publishedAt ?? doc.createdAt),
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : undefined,
  };
}

function mapNotice(id: string, doc: FirestoreDoc): OfficialNotice {
  return {
    id,
    title: String(doc.title ?? "Aviso oficial"),
    message: String(doc.message ?? doc.summary ?? ""),
    level: (doc.level as OfficialNotice["level"]) ?? "info",
    status: (doc.status as ContentStatus) ?? "published",
    startsAt: asDateString(doc.startsAt),
    endsAt: asDateString(doc.endsAt),
    ctaLabel: typeof doc.ctaLabel === "string" ? doc.ctaLabel : undefined,
    ctaUrl: typeof doc.ctaUrl === "string" ? doc.ctaUrl : undefined,
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
  };
}

async function getCollection(collection: SupportedCollection) {
  const db = getAdminDb();
  const snapshot = await db.collection(collection).orderBy("createdAt", "desc").limit(40).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const docs = await getCollection("noticias");
    if (!docs.length) return mockNews;
    return docs.map((d) => mapNews(d.id, d.data)).filter((item) => isPublicStatus(item.status));
  } catch {
    return mockNews;
  }
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const docs = await getCollection("eventos");
    if (!docs.length) return mockEvents;
    return docs.map((d) => mapEvent(d.id, d.data)).filter((item) => isPublicStatus(item.status));
  } catch {
    return mockEvents;
  }
}

export async function getSongs(): Promise<SongItem[]> {
  try {
    const docs = await getCollection("musicas");
    if (!docs.length) return mockSongs;
    return docs.map((d) => mapSong(d.id, d.data)).filter((item) => isPublicStatus(item.status));
  } catch {
    return mockSongs;
  }
}

export async function getSpiritualContents(): Promise<SpiritualContentItem[]> {
  try {
    const docs = await getCollection("espiritualidades");
    if (!docs.length) return mockSpiritualContents;
    return docs.map((d) => mapSpiritual(d.id, d.data)).filter((item) => isPublicStatus(item.status));
  } catch {
    return mockSpiritualContents;
  }
}

export async function getOfficialNotices(): Promise<OfficialNotice[]> {
  try {
    const docs = await getCollection("avisos_oficiais");
    if (!docs.length) return mockNotices;

    const now = Date.now();
    return docs
      .map((d) => mapNotice(d.id, d.data))
      .filter((item) => item.status === "published")
      .filter((item) => {
        const startOk = item.startsAt ? new Date(item.startsAt).getTime() <= now : true;
        const endOk = item.endsAt ? new Date(item.endsAt).getTime() >= now : true;
        return startOk && endOk;
      });
  } catch {
    return mockNotices;
  }
}
