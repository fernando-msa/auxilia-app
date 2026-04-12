import type { Metadata } from "next";
import { ContentGrid, SectionHeader, formatDate } from "@/components/content-ui";
import { getNews } from "@/services/content";

export const metadata: Metadata = {
  title: "Notícias | Auxilia App",
  description: "Comunicação institucional e notícias do Movimento Auxilia.",
};

export default async function NoticiasPage() {
  const news = await getNews();

  return (
    <main className="section">
      <SectionHeader
        title="Notícias do Movimento Auxilia"
        description="Informativos, formações e destaques da missão juvenil católica."
      />
      <ContentGrid
        items={news.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          href: `/noticias/${item.slug}`,
          meta: `${item.author ?? "Equipe"} • ${formatDate(item.publishedAt)}`,
        }))}
        emptyMessage="Nenhuma notícia encontrada."
      />
    </main>
  );
}
