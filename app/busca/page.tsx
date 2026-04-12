import { ContentGrid, SectionHeader } from "@/components/content-ui";
import { getEvents, getNews, getSongs, getSpiritualContents } from "@/services/content";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BuscaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const [news, events, songs, spiritual] = await Promise.all([
    getNews(),
    getEvents(),
    getSongs(),
    getSpiritualContents(),
  ]);

  const pool = [
    ...news.map((item) => ({ ...item, href: `/noticias/${item.slug}`, area: "Notícias" })),
    ...events.map((item) => ({ ...item, href: `/eventos/${item.slug}`, area: "Eventos" })),
    ...songs.map((item) => ({ ...item, href: `/musicas/${item.slug}`, area: "Músicas" })),
    ...spiritual.map((item) => ({ ...item, href: `/espiritualidade/${item.slug}`, area: "Espiritualidade" })),
  ];

  const results = query
    ? pool.filter((item) =>
        `${item.title} ${item.summary} ${item.category} ${item.area}`.toLowerCase().includes(query),
      )
    : [];

  return (
    <main className="section">
      <SectionHeader
        title="Busca global"
        description="Pesquise notícias, eventos, músicas e conteúdos espirituais em um único lugar."
      />
      <form action="/busca" className="filters-row">
        <input name="q" placeholder="Digite um termo" defaultValue={params.q ?? ""} />
        <button className="btn btn-dark" type="submit">
          Buscar
        </button>
      </form>
      <ContentGrid
        items={results.map((item) => ({
          id: `${item.area}-${item.id}`,
          title: item.title,
          summary: item.summary,
          category: `${item.area} • ${item.category}`,
          href: item.href,
        }))}
        emptyMessage={query ? "Nenhum conteúdo encontrado para sua busca." : "Digite um termo para iniciar a busca."}
      />
    </main>
  );
}
