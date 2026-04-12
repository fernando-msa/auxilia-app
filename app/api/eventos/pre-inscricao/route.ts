import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

type Payload = {
  eventId: string;
  eventSlug: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;

    if (!body.eventId || !body.eventSlug || !body.name || !body.email) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    await getAdminDb().collection("eventos_pre_inscricoes").add({
      eventId: body.eventId,
      eventSlug: body.eventSlug,
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      notes: body.notes ?? null,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
