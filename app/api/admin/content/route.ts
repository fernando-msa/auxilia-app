import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import type { SupportedCollection } from "@/types/content";

type Payload = {
  type: SupportedCollection;
  data: Record<string, string>;
};

const allowedCollections: Record<SupportedCollection, string[]> = {
  noticias: ["title", "summary", "category", "content", "author"],
  eventos: [
    "title",
    "summary",
    "category",
    "eventType",
    "location",
    "audience",
    "startsAt",
    "externalSignupUrl",
  ],
  musicas: ["title", "summary", "category", "songType", "lyrics", "youtubeUrl", "spotifyUrl"],
  espiritualidades: ["title", "summary", "category", "spiritualType", "content"],
};

const optionalFields = ["externalSignupUrl", "youtubeUrl", "spotifyUrl", "author"];

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

function sanitizePayload(payload: Payload) {
  const keys = allowedCollections[payload.type];
  const cleanData: Record<string, string | boolean> = {};

  keys.forEach((key) => {
    const value = payload.data[key];
    const isOptional = optionalFields.includes(key);

    if ((!isOptional && (typeof value !== "string" || !value.trim())) || (!value && !isOptional)) {
      throw new Error(`Campo obrigatório inválido: ${key}`);
    }

    if (typeof value === "string" && value.trim()) {
      cleanData[key] = value.trim();
    }
  });

  cleanData.slug =
    typeof cleanData.title === "string" ? toSlug(cleanData.title) : toSlug(String(Date.now()));
  cleanData.status = "published";

  return cleanData;
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
      error: NextResponse.json({ error: "Usuário sem permissão para publicar." }, { status: 403 }),
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

    const snapshot = await getAdminDb().collection(type).orderBy("createdAt", "desc").limit(10).get();
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title ?? data.titulo ?? "Sem título"),
        category: String(data.category ?? data.categoria ?? "Geral"),
        slug: typeof data.slug === "string" ? data.slug : undefined,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const isConfigError =
      message.includes("FIREBASE_ADMIN_PROJECT_ID") ||
      message.includes("FIREBASE_ADMIN_CLIENT_EMAIL") ||
      message.includes("FIREBASE_ADMIN_PRIVATE_KEY");
    return NextResponse.json(
      {
        error: isConfigError
          ? "Configuração do Firebase Admin ausente no servidor. Verifique variáveis de ambiente."
          : message,
      },
      { status: isConfigError ? 503 : 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as Payload;
    if (!body?.type || !(body.type in allowedCollections) || !body?.data) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const data = sanitizePayload(body);

    await getAdminDb().collection(body.type).add({
      ...data,
      publishedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: validated.userEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const isConfigError =
      message.includes("FIREBASE_ADMIN_PROJECT_ID") ||
      message.includes("FIREBASE_ADMIN_CLIENT_EMAIL") ||
      message.includes("FIREBASE_ADMIN_PRIVATE_KEY");
    return NextResponse.json(
      {
        error: isConfigError
          ? "Configuração do Firebase Admin ausente no servidor. Verifique variáveis de ambiente."
          : message,
      },
      { status: isConfigError ? 503 : 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as { type: SupportedCollection; id: string };
    if (!body?.id || !body?.type || !(body.type in allowedCollections)) {
      return NextResponse.json({ error: "Payload inválido para exclusão." }, { status: 400 });
    }

    await getAdminDb().collection(body.type).doc(body.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const isConfigError =
      message.includes("FIREBASE_ADMIN_PROJECT_ID") ||
      message.includes("FIREBASE_ADMIN_CLIENT_EMAIL") ||
      message.includes("FIREBASE_ADMIN_PRIVATE_KEY");
    return NextResponse.json(
      {
        error: isConfigError
          ? "Configuração do Firebase Admin ausente no servidor. Verifique variáveis de ambiente."
          : message,
      },
      { status: isConfigError ? 503 : 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as { type: SupportedCollection; id: string };
    if (!body?.id || !body?.type || !(body.type in allowedCollections)) {
      return NextResponse.json({ error: "Payload inválido para exclusão." }, { status: 400 });
    }

    await getAdminDb().collection(body.type).doc(body.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
