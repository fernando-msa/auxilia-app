import { NextRequest, NextResponse } from "next/server";
import { createVolunteer } from "@/services/volunteers";
import type { VoluntarioFormData } from "@/types/volunteers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate that required fields exist
    if (!body.nome || !body.email || !body.whatsapp || !body.como_ajudar) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const formData: VoluntarioFormData = {
      nome: body.nome,
      email: body.email,
      whatsapp: body.whatsapp,
      cidade: body.cidade || "",
      estado: body.estado || "",
      como_ajudar: body.como_ajudar,
    };

    const result = await createVolunteer(formData);

    if (result.success) {
      return NextResponse.json(
        { success: true, id: result.id },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
