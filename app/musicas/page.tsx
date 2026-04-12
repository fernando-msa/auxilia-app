import type { Metadata } from "next";
import { ContentGrid, SectionHeader } from "@/components/content-ui";
import { getSongs } from "@/services/content";

export const metadata: Metadata = {
  title: "Músicas | Auxilia App",
  description: "Músicas, hinos e letras para encontros e espiritualidade do Movimento Auxilia.",
};

export default async function MusicasPage() {
  const songs = await getSongs();

  return (
    <main className="section">
      <SectionHeader
        title="Músicas do movimento"
        description="Hinos, adoração e animação para encontros da juventude."
      />
      <ContentGrid
        items={songs.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.songType,
          href: `/musicas/${item.slug}`,
        }))}
        emptyMessage="Nenhuma música cadastrada."
      />
    </main>
  );
}
