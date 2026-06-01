import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { validateAdminRequest } from "@/lib/auth";
import { integrationsActionSchema, toSlug } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { importEventsFromProviders } from "@/services/integrations/events";

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for") ?? "unknown";
}

export async function GET(request: Request) {
  try {
    if (!checkRateLimit(`admin:${getClientIp(request)}`)) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const validated = await validateAdminRequest(request);
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
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`admin:${getClientIp(request)}`)) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const validated = await validateAdminRequest(request);
    if ("error" in validated) return validated.error;

    const body = await request.json();
    const result = integrationsActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }

    const db = getAdminDb();

    if (result.data.action === "sync") {
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

    if (result.data.action === "archive") {
      await Promise.all(
        result.data.ids.map((id) =>
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

      return NextResponse.json({ ok: true, archivedCount: result.data.ids.length });
    }

    if (result.data.action === "publish") {
      const docs = await Promise.all(
        result.data.ids.map((id) => db.collection("eventos_importados").doc(id).get()),
      );

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
                slug: typeof data.title === "string" ? toSlug(data.title) : doc.id,
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
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
