import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { mockAnnouncements } from "@/lib/mock-content";
import type { Aviso } from "@/types/announcements";

type FirestoreDoc = Record<string, unknown>;

function asDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function mapAviso(id: string, doc: FirestoreDoc): Aviso {
  return {
    id,
    titulo: String(doc.titulo ?? "Sem título"),
    conteudo: String(doc.conteudo ?? ""),
    autor: String(doc.autor ?? "Comunidade"),
    data_criacao: asDateString(doc.data_criacao ?? doc.createdAt) ?? new Date().toISOString(),
    categoria: typeof doc.categoria === "string" ? doc.categoria : undefined,
    status: (doc.status as "draft" | "published" | "archived") ?? "published",
    createdAt: asDateString(doc.createdAt),
    updatedAt: asDateString(doc.updatedAt),
  };
}

export async function getAnnouncements(): Promise<Aviso[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("avisos")
      .orderBy("data_criacao", "desc")
      .limit(50)
      .get();

    if (snapshot.empty) return mockAnnouncements;

    return snapshot.docs
      .map((doc) => mapAviso(doc.id, doc.data()))
      .filter((item) => item.status === "published");
  } catch {
    return mockAnnouncements;
  }
}
