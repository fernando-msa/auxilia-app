import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { eventoPreInscricaoSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: máximo de 10 pré-inscrições por minuto por IP
    const clientIp = getClientIp(request);
    if (!checkRateLimit(`pre-inscricao:${clientIp}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Por favor, aguarde um momento." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = eventoPreInscricaoSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    await getAdminDb().collection("eventos_pre_inscricoes").add({
      eventId: result.data.eventId,
      eventSlug: result.data.eventSlug,
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone ?? null,
      notes: result.data.notes ?? null,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("API error /eventos/pre-inscricao:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}


