import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { importEventsFromProviders } from "@/services/integrations/events";

function hasSyncAccess(request: Request) {
  const expectedSecret = process.env.SYNC_API_SECRET;
  const receivedSecret = request.headers.get("x-sync-secret");

  return Boolean(expectedSecret && receivedSecret && expectedSecret === receivedSecret);
}

export async function POST(request: Request) {
  try {
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
    const message = error instanceof Error ? error.message : "Erro inesperado na sincronização.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
