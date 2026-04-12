import Link from "next/link";
import type { Metadata } from "next";
import { ContentGrid, SectionHeader, formatDate } from "@/components/content-ui";
import { getEvents } from "@/services/content";

export const metadata: Metadata = {
  title: "Agenda | Auxilia App",
  description: "Agenda de eventos, missões, encontros e formações do Auxilia.",
};

type PageProps = {
  searchParams: Promise<{
    tipo?: string;
    publico?: string;
    status?: string;
  }>;
};

function translateLifecycle(status?: string) {
  if (status === "upcoming") return "próximo";
  if (status === "ongoing") return "em andamento";
  if (status === "finished") return "encerrado";
  return "indefinido";
}

export default async function EventosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const events = await getEvents();

  const filtered = events
    .filter((item) => (params.tipo ? item.eventType === params.tipo : true))
    .filter((item) =>
      params.publico ? item.audience.toLowerCase().includes(params.publico.toLowerCase()) : true,
    )
    .filter((item) => (params.status ? item.lifecycleStatus === params.status : true))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const nextEvents = filtered.filter((event) => event.lifecycleStatus === "upcoming").slice(0, 2);

  return (
    <main className="section">
      <SectionHeader
        title="Agenda e eventos"
        description="Acompanhe próximos encontros, com data, local, público e detalhes de participação."
      />

      <div className="event-filters">
        <Link href="/eventos" className={!params.tipo && !params.publico && !params.status ? "active" : ""}>
          Todos
        </Link>
        <Link href="/eventos?status=upcoming" className={params.status === "upcoming" ? "active" : ""}>
          Próximos
        </Link>
        <Link href="/eventos?tipo=adoracao" className={params.tipo === "adoracao" ? "active" : ""}>
          Adoração
        </Link>
        <Link href="/eventos?tipo=missao" className={params.tipo === "missao" ? "active" : ""}>
          Missão
        </Link>
        <Link href="/eventos?publico=jovens" className={params.publico === "jovens" ? "active" : ""}>
          Jovens
        </Link>
      </div>

      {nextEvents.length ? (
        <div style={{ marginBottom: "1.2rem" }}>
          <h3>Próximos destaques</h3>
          <ContentGrid
            items={nextEvents.map((item) => ({
              id: `next-${item.id}`,
              title: item.title,
              summary: item.summary,
              category: item.eventType,
              href: `/eventos/${item.slug}`,
              meta: `${formatDate(item.startsAt)} • ${item.location}`,
            }))}
            emptyMessage=""
          />
        </div>
      ) : null}

      <ContentGrid
        items={filtered.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: `${item.eventType} • ${translateLifecycle(item.lifecycleStatus)}`,
          href: `/eventos/${item.slug}`,
          meta: `${formatDate(item.startsAt)} • ${item.location}`,
        }))}
        emptyMessage="Nenhum evento disponível para os filtros selecionados."
      />
    </main>
  );
}
