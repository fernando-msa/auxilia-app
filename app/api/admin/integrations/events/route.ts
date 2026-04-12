import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { importEventsFromProviders } from "@/services/integrations/events";

function getAllowedEmails() {
  const raw = process.env.CONTENT_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function validateRequest(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { error: NextResponse.json({ error: "Token não enviado." }, { status: 401 }) };
  }

  const decoded = await getAdminAuth().verifyIdToken(token);
  const userEmail = decoded.email?.toLowerCase();

  if (!userEmail || !getAllowedEmails().includes(userEmail)) {
    return {
      error: NextResponse.json({ error: "Usuário sem permissão." }, { status: 403 }),
    };
  }

  return { userEmail };
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

function normalizeApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  const isConfigError =
    message.includes("FIREBASE_ADMIN_PROJECT_ID") ||
    message.includes("FIREBASE_ADMIN_CLIENT_EMAIL") ||
    message.includes("FIREBASE_ADMIN_PRIVATE_KEY");

  return {
    message: isConfigError
      ? "Configuração do Firebase Admin ausente no servidor. Verifique variáveis de ambiente."
      : message,
    status: isConfigError ? 503 : 500,
  };
}

export async function GET(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const snapshot = await getAdminDb()
      .collection("eventos_importados")
      .orderBy("updatedAt", "desc")
      .limit(80)
      .get();

    const items = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: String(data.title ?? "Sem título"),
          startsAt: typeof data.startsAt === "string" ? data.startsAt : "",
          source: typeof data.source === "string" ? data.source : "indefinido",
          status: typeof data.status === "string" ? data.status : "imported",
          location: typeof data.location === "string" ? data.location : "",
        };
      })
      .filter((item) => (statusFilter ? item.status === statusFilter : true));

    return NextResponse.json({ items });
  } catch (error) {
    const normalized = normalizeApiError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}

export async function POST(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const body = (await request.json()) as
      | { action: "sync" }
      | { action: "publish"; ids: string[] }
      | { action: "archive"; ids: string[] };

    const db = getAdminDb();

    if (body.action === "sync") {
      const { imported, warnings } = await importEventsFromProviders();
      await Promise.all(
        imported.map((item) =>
          db
            .collection("eventos_importados")
            .doc(item.externalId)
            .set(
              {
                ...item,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true },
            ),
        ),
      );

      return NextResponse.json({ ok: true, importedCount: imported.length, warnings });
    }

    if (body.action === "archive") {
      const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
      if (!ids.length) {
        return NextResponse.json({ error: "Nenhum ID enviado para arquivamento." }, { status: 400 });
      }

      await Promise.all(
        ids.map((id) =>
          db.collection("eventos_importados").doc(id).set(
            {
              status: "archived",
              updatedAt: FieldValue.serverTimestamp(),
              reviewedBy: validated.userEmail,
            },
            { merge: true },
          ),
        ),
      );

      return NextResponse.json({ ok: true, archivedCount: ids.length });
    }

    if (body.action === "publish") {
      const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
      if (!ids.length) {
        return NextResponse.json({ error: "Nenhum ID enviado para publicação." }, { status: 400 });
      }

      const docs = await Promise.all(ids.map((id) => db.collection("eventos_importados").doc(id).get()));

      const writes = docs
        .filter((doc) => doc.exists)
        .map((doc) => {
          const data = doc.data()!;

          return Promise.all([
            db.collection("eventos").doc(doc.id).set(
              {
                title: String(data.title ?? "Sem título"),
                summary: String(data.summary ?? ""),
                category: String(data.category ?? "Agenda"),
                eventType: String(data.eventType ?? "outro"),
                location: String(data.location ?? "Local a definir"),
                audience: String(data.audience ?? "Comunidade"),
                startsAt: String(data.startsAt ?? ""),
                endsAt: typeof data.endsAt === "string" ? data.endsAt : null,
                externalSignupUrl:
                  typeof data.externalSignupUrl === "string" ? data.externalSignupUrl : null,
                slug: typeof data.title === "string" ? toSlug(String(data.title)) : doc.id,
                status: "published",
                createdBy: validated.userEmail,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                publishedAt: FieldValue.serverTimestamp(),
              },
              { merge: true },
            ),
            db.collection("eventos_importados").doc(doc.id).set(
              {
                status: "published",
                publishedAt: FieldValue.serverTimestamp(),
                publishedBy: validated.userEmail,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true },
            ),
          ]);
        });

      await Promise.all(writes.flat());

      return NextResponse.json({ ok: true, publishedCount: writes.length });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    const normalized = normalizeApiError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
