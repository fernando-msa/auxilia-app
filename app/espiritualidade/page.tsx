import type { Metadata } from "next";
import { ContentGrid, SectionHeader } from "@/components/content-ui";
import { getSpiritualContents } from "@/services/content";

export const metadata: Metadata = {
  title: "Espiritualidade | Auxilia App",
  description: "Evangelho do dia, orações e formação espiritual para juventude católica.",
};

export default async function EspiritualidadePage() {
  const contents = await getSpiritualContents();

  return (
    <main className="section">
      <SectionHeader
        title="Espiritualidade"
        description="Conteúdos para oração pessoal, formação e vida comunitária."
      />
      <ContentGrid
        items={contents.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.spiritualType,
          href: `/espiritualidade/${item.slug}`,
        }))}
        emptyMessage="Ainda não há conteúdos espirituais publicados."
      />
    </main>
  );
}
