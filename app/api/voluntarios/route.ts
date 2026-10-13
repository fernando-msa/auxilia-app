import { NextRequest, NextResponse } from "next/server";
import { createVolunteer } from "@/services/volunteers";
import { voluntarioSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: máximo de 5 cadastros por minuto por IP para evitar spam
    const clientIp = getClientIp(request);
    if (!checkRateLimit(`voluntarios:${clientIp}`, 5, 60_000)) {
      return NextResponse.json(
        { success: false, error: "Muitas tentativas. Por favor, aguarde um momento." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = voluntarioSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const volunteerResult = await createVolunteer({
      nome: result.data.nome,
      email: result.data.email,
      whatsapp: result.data.whatsapp,
      cidade: result.data.cidade ?? "",
      estado: result.data.estado ?? "",
      como_ajudar: result.data.como_ajudar,
    });


    if (volunteerResult.success) {
      return NextResponse.json(
        { success: true, id: volunteerResult.id },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: volunteerResult.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("API error /voluntarios:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

