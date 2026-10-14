import { timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { importEventsFromProviders } from "@/services/integrations/events";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function hasSyncAccess(request: Request) {
  const expectedSecret = process.env.SYNC_API_SECRET;
  const receivedSecret = request.headers.get("x-sync-secret");

  if (!expectedSecret || !receivedSecret) return false;

  const expected = Buffer.from(expectedSecret);
  const received = Buffer.from(receivedSecret);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`sync:${getClientIp(request)}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde antes de tentar novamente." },
        { status: 429 }
      );
    }

    if (!hasSyncAccess(request)) {
      return NextResponse.json({ error: "Não autorizado para sincronização." }, { status: 401 });
    }

    const { imported, warnings } = await importEventsFromProviders();
    const db = getAdminDb();

    const writes = imported.map((item) =>
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
    );

    await Promise.all(writes);

    return NextResponse.json({
      ok: true,
      importedCount: imported.length,
      warnings,
    });
  } catch (error) {
    console.error("API error /api/integrations/sync/events:", error);
    return NextResponse.json({ error: "Erro interno na sincronização." }, { status: 500 });
  }
}

