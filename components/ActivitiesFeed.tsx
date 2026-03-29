"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ActivityItem = {
  id: string;
  titulo: string;
  local: string;
  data: string;
  publico: string;
};

const fallbackActivities: ActivityItem[] = [
  {
    id: "1",
    titulo: "Oratório Jovem de Sábado",
    local: "Casa Salesiana",
    data: "Todo sábado, 16h",
    publico: "Adolescentes e jovens",
  },
  {
    id: "2",
    titulo: "Adoração + Louvor Auxilia",
    local: "Capela Maria Auxiliadora",
    data: "Quinta-feira, 20h",
    publico: "Comunidade geral",
  },
  {
    id: "3",
    titulo: "Missão nas periferias",
    local: "Setor missionário",
    data: "2º domingo do mês",
    publico: "Voluntários + juventude",
  },
];

export default function ActivitiesFeed() {
  const [atividades, setAtividades] = useState<ActivityItem[]>(fallbackActivities);

  useEffect(() => {
    const fetchAtividades = async () => {
      try {
        const atividadesRef = query(
          collection(db, "atividades"),
          orderBy("createdAt", "desc"),
          limit(6),
        );
        const snapshot = await getDocs(atividadesRef);

        if (!snapshot.empty) {
          const resultado = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ActivityItem, "id">),
          }));
          setAtividades(resultado);
        }
      } catch {
        setAtividades(fallbackActivities);
      }
    };

    fetchAtividades();
  }, []);

  return (
    <div className="cards-grid">
      {atividades.map((atividade) => (
        <article key={atividade.id} className="card">
          <span className="tag">{atividade.publico}</span>
          <h3>{atividade.titulo}</h3>
          <p>{atividade.local}</p>
          <p className="muted">{atividade.data}</p>
        </article>
      ))}
    </div>
  );
}
