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

export async function GET(request: Request) {
  try {
    const validated = await validateRequest(request);
    if ("error" in validated) return validated.error;

    const snapshot = await getAdminDb()
      .collection("eventos_importados")
      .orderBy("updatedAt", "desc")
      .limit(30)
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title ?? "Sem título"),
        startsAt: typeof data.startsAt === "string" ? data.startsAt : "",
        source: typeof data.source === "string" ? data.source : "indefinido",
        status: typeof data.status === "string" ? data.status : "imported",
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

    const body = (await request.json()) as
      | { action: "sync" }
      | { action: "publish"; ids: string[] };

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
            db.collection("eventos").doc(doc.id).set({
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
              slug:
                typeof data.title === "string"
                  ? String(data.title)
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-")
                  : doc.id,
              status: "published",
              createdBy: validated.userEmail,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
              publishedAt: FieldValue.serverTimestamp(),
            }),
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
