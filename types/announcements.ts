import { ContentStatus } from "./content";

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  data_criacao: string;
  categoria?: string;
  status: ContentStatus;
  createdAt?: string;
  updatedAt?: string;
}
