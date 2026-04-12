import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import type { ContentStatus, SupportedCollection } from "@/types/content";

type ContentFormData = Record<string, string>;

type SavePayload = {
  type: SupportedCollection;
  data: ContentFormData;
  id?: string;
};

const allowedCollections: Record<SupportedCollection, string[]> = {
  noticias: ["title", "summary", "category", "content", "author", "coverImage"],
  eventos: [
    "title",
    "summary",
    "category",
    "eventType",
    "location",
    "audience",
    "startsAt",
    "endsAt",
    "externalSignupUrl",
    "coverImage",
  ],
  musicas: [
    "title",
    "summary",
    "category",
    "songType",
    "lyrics",
    "youtubeUrl",
    "spotifyUrl",
    "coverImage",
  ],
  espiritualidades: [
    "title",
    "summary",
    "category",
    "spiritualType",
    "content",
    "coverImage",
  ],
  avisos_oficiais: ["title", "message", "level", "startsAt", "endsAt", "ctaLabel", "ctaUrl"],
};

const optionalFields = [
  "externalSignupUrl",
  "youtubeUrl",
  "spotifyUrl",
  "author",
  "endsAt",
  "coverImage",
  "ctaLabel",
  "ctaUrl",
  "startsAt",
  "endsAt",
];

const allowedStatus: ContentStatus[] = ["draft", "published", "archived"];

function getAllowedEmails() {
  const raw = process.env.CONTENT_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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

function normalizeStatus(input?: string): ContentStatus {
  if (!input) return "draft";
  if (allowedStatus.includes(input as ContentStatus)) {
    return input as ContentStatus;
  }
  throw new Error(`Status inválido: ${input}`);
}

function sanitizePayload(payload: SavePayload) {
  const keys = allowedCollections[payload.type];
  const cleanData: Record<string, string | boolean> = {};

  keys.forEach((key) => {
    const value = payload.data[key];
    const isOptional = optionalFields.includes(key);

    if (!isOptional && (typeof value !== "string" || !value.trim())) {
      throw new Error(`Campo obrigatório inválido: ${key}`);
    }

    if (typeof value === "string" && value.trim()) {
      cleanData[key] = value.trim();
    }
  });

  cleanData.slug =
    typeof cleanData.title === "string" ? toSlug(cleanData.title) : toSlug(String(Date.now()));
  cleanData.status = normalizeStatus(payload.data.status);

  return cleanData;
}

function normalizeAdminError(message: string) {
  const isConfigError =
    message.includes("FIREBASE_ADMIN_PROJECT_ID") ||
    message.includes("FIREBASE_ADMIN_CLIENT_EMAIL") ||
    message.includes("FIREBASE_ADMIN_PRIVATE_KEY");

  return {
    message: isConfigError
      ? "Configuração do Firebase Admin ausente no servidor. Verifique FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY."
      : message,
    status: isConfigError ? 503 : 500,
  };
}

async function validateRequest(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { error: NextResponse.json({ error: "Token não enviado." }, { status: 401 }) };
  }

  const decoded = await getAdminAuth().verifyIdToken(token);
  const userEmail = decoded.email?.toLowerCase();
  const allowedEmails = getAllowedEmails();

  if (!userEmail || !allowedEmails.includes(userEmail)) {
    return {
      error: NextResponse.json({ error: "Usuário sem permissão para administrar conteúdos." }, { status: 403 }),
    };
  }

  return { userEmail };
}

export async function GET(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as SupportedCollection;
    if (!type || !(type in allowedCollections)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }

    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category")?.toLowerCase();
    const queryFilter = searchParams.get("q")?.toLowerCase();

    const snapshot = await getAdminDb().collection(type).orderBy("updatedAt", "desc").limit(60).get();
    const items = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: String(data.title ?? data.titulo ?? "Sem título"),
          category: String(data.category ?? data.categoria ?? "Geral"),
          slug: typeof data.slug === "string" ? data.slug : undefined,
          status: String(data.status ?? "draft"),
          coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
        };
      })
      .filter((item) => (statusFilter ? item.status === statusFilter : true))
      .filter((item) => (categoryFilter ? item.category.toLowerCase().includes(categoryFilter) : true))
      .filter((item) =>
        queryFilter
          ? `${item.title} ${item.category} ${item.slug ?? ""}`.toLowerCase().includes(queryFilter)
          : true,
      );

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const normalized = normalizeAdminError(message);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}

export async function POST(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as SavePayload;
    if (!body?.type || !(body.type in allowedCollections) || !body?.data) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const data = sanitizePayload(body);

    await getAdminDb().collection(body.type).add({
      ...data,
      publishedAt: data.status === "published" ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: validated.userEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const normalized = normalizeAdminError(message);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}

export async function PUT(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as SavePayload;
    if (!body?.id || !body?.type || !(body.type in allowedCollections) || !body?.data) {
      return NextResponse.json({ error: "Payload inválido para atualização." }, { status: 400 });
    }

    const data = sanitizePayload(body);

    await getAdminDb()
      .collection(body.type)
      .doc(body.id)
      .set(
        {
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
          ...(data.status === "published" ? { publishedAt: FieldValue.serverTimestamp() } : {}),
        },
        { merge: true },
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const normalized = normalizeAdminError(message);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as { type: SupportedCollection; id: string; confirmText?: string };
    if (!body?.id || !body?.type || !(body.type in allowedCollections)) {
      return NextResponse.json({ error: "Payload inválido para exclusão." }, { status: 400 });
    }

    if (body.confirmText !== "EXCLUIR") {
      return NextResponse.json(
        { error: "Confirmação inválida. Digite EXCLUIR para remover conteúdo." },
        { status: 400 },
      );
    }

    await getAdminDb().collection(body.type).doc(body.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const normalized = normalizeAdminError(message);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
