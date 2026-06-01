import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

function getAllowedEmails(): string[] {
  const raw = process.env.CONTENT_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function validateAdminRequest(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { error: NextResponse.json({ error: "Token não enviado." }, { status: 401 }) };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userEmail = decoded.email?.toLowerCase();

    if (!userEmail || !getAllowedEmails().includes(userEmail)) {
      return {
        error: NextResponse.json({ error: "Usuário sem permissão." }, { status: 403 }),
      };
    }

    return { userEmail };
  } catch {
    return { error: NextResponse.json({ error: "Token inválido." }, { status: 401 }) };
  }
}
