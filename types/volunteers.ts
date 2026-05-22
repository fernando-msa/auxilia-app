export interface Voluntario {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  como_ajudar: string;
  criado_em: string;
  status: "novo" | "contatado" | "ativo";
}

export type VoluntarioFormData = Omit<Voluntario, "id" | "criado_em" | "status">;
