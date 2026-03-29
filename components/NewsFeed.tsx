"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type NewsItem = {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
};

const fallbackNews: NewsItem[] = [
  {
    id: "1",
    titulo: "Semana Missionária Juvenil",
    resumo: "Participe dos encontros de evangelização e serviço nas periferias.",
    categoria: "Missão",
  },
  {
    id: "2",
    titulo: "Novena de Maria Auxiliadora",
    resumo: "Guia diário de oração e meditação disponível para toda comunidade.",
    categoria: "Espiritualidade",
  },
  {
    id: "3",
    titulo: "Formação Salesiana para Líderes",
    resumo: "Inscrições abertas para o ciclo formativo sobre carisma salesiano.",
    categoria: "Formação",
  },
];

export default function NewsFeed() {
  const [noticias, setNoticias] = useState<NewsItem[]>(fallbackNews);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const noticiasRef = query(
          collection(db, "noticias"),
          orderBy("createdAt", "desc"),
          limit(6),
        );
        const snapshot = await getDocs(noticiasRef);

        if (!snapshot.empty) {
          const resultado = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<NewsItem, "id">),
          }));
          setNoticias(resultado);
        }
      } catch {
        setNoticias(fallbackNews);
      }
    };

    fetchNoticias();
  }, []);

  return (
    <div className="cards-grid">
      {noticias.map((noticia) => (
        <article key={noticia.id} className="card">
          <span className="tag">{noticia.categoria}</span>
          <h3>{noticia.titulo}</h3>
          <p>{noticia.resumo}</p>
        </article>
      ))}
    </div>
  );
}
