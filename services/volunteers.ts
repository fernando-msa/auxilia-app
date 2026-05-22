import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import type { Voluntario, VoluntarioFormData } from "@/types/volunteers";

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateWhatsApp(phone: string): boolean {
  const phoneRegex = /^(\d{2})(\d{8,9})$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

export async function createVolunteer(
  data: VoluntarioFormData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validate required fields
    if (!data.nome?.trim()) {
      return { success: false, error: "Nome é obrigatório" };
    }
    if (!data.email?.trim()) {
      return { success: false, error: "E-mail é obrigatório" };
    }
    if (!data.whatsapp?.trim()) {
      return { success: false, error: "WhatsApp é obrigatório" };
    }
    if (!data.como_ajudar?.trim()) {
      return { success: false, error: "Campo 'Como deseja ajudar' é obrigatório" };
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      return { success: false, error: "E-mail inválido" };
    }

    // Validate WhatsApp format (Brazilian format: 11 digits with area code)
    if (!validateWhatsApp(data.whatsapp)) {
      return {
        success: false,
        error: "WhatsApp inválido. Use formato: (11) 99999-9999",
      };
    }

    // Sanitize inputs
    const sanitizedData = {
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      whatsapp: data.whatsapp.replace(/\D/g, ""),
      cidade: data.cidade?.trim() || "",
      estado: data.estado?.trim() || "",
      como_ajudar: data.como_ajudar.trim(),
      criado_em: new Date().toISOString(),
      status: "novo" as const,
    };

    // Insert into Firestore
    const db = getAdminDb();
    const docRef = await db.collection("voluntarios").add(sanitizedData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating volunteer:", error);
    return { success: false, error: "Erro ao salvar cadastro. Tente novamente." };
  }
}
