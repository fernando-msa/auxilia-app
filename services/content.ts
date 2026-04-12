import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { mockEvents, mockNews, mockSongs, mockSpiritualContents } from "@/lib/mock-content";
import type {
  EventItem,
  NewsItem,
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

function mapNews(id: string, doc: FirestoreDoc): NewsItem {
  return {
    id,
    type: "news",
    slug: String(doc.slug ?? toSlug(String(doc.title ?? doc.titulo ?? id))),
    title: String(doc.title ?? doc.titulo ?? "Sem título"),
    summary: String(doc.summary ?? doc.resumo ?? ""),
    category: String(doc.category ?? doc.categoria ?? "Geral"),
    content: String(doc.content ?? doc.conteudo ?? doc.summary ?? doc.resumo ?? ""),
    status: (doc.status as "draft" | "published") ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    author: typeof doc.author === "string" ? doc.author : undefined,
    publishedAt: asDateString(doc.publishedAt ?? doc.createdAt),
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : undefined,
  };
}

function mapEvent(id: string, doc: FirestoreDoc): EventItem {
  return {
    id,
    type: "event",
    slug: String(doc.slug ?? toSlug(String(doc.title ?? doc.titulo ?? id))),
    title: String(doc.title ?? doc.titulo ?? "Sem título"),
    summary: String(doc.summary ?? doc.resumo ?? ""),
    category: String(doc.category ?? doc.categoria ?? "Agenda"),
    eventType: (doc.eventType as EventItem["eventType"]) ?? "outro",
    status: (doc.status as "draft" | "published") ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    location: String(doc.location ?? doc.local ?? "Local a definir"),
    audience: String(doc.audience ?? doc.publico ?? "Comunidade"),
    startsAt: String(doc.startsAt ?? doc.data ?? new Date().toISOString()),
    endsAt: typeof doc.endsAt === "string" ? doc.endsAt : undefined,
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
    songType: (doc.songType as SongItem["songType"]) ?? "outro",
    status: (doc.status as "draft" | "published") ?? "published",
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
    spiritualType: (doc.spiritualType as SpiritualContentItem["spiritualType"]) ?? "mensagem",
    status: (doc.status as "draft" | "published") ?? "published",
    featured: Boolean(doc.featured ?? doc.destaque),
    content: String(doc.content ?? doc.conteudo ?? ""),
    publishedAt: asDateString(doc.publishedAt ?? doc.createdAt),
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : undefined,
  };
}

async function getCollection(collection: SupportedCollection) {
  const db = getAdminDb();
  const snapshot = await db.collection(collection).orderBy("createdAt", "desc").limit(20).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const docs = await getCollection("noticias");
    if (!docs.length) return mockNews;
    return docs.map((d) => mapNews(d.id, d.data));
  } catch {
    return mockNews;
  }
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const docs = await getCollection("eventos");
    if (!docs.length) return mockEvents;
    return docs.map((d) => mapEvent(d.id, d.data));
  } catch {
    return mockEvents;
  }
}

export async function getSongs(): Promise<SongItem[]> {
  try {
    const docs = await getCollection("musicas");
    if (!docs.length) return mockSongs;
    return docs.map((d) => mapSong(d.id, d.data));
  } catch {
    return mockSongs;
  }
}

export async function getSpiritualContents(): Promise<SpiritualContentItem[]> {
  try {
    const docs = await getCollection("espiritualidades");
    if (!docs.length) return mockSpiritualContents;
    return docs.map((d) => mapSpiritual(d.id, d.data));
  } catch {
    return mockSpiritualContents;
  }
}
