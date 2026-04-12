import type { Metadata } from "next";
import { ContentGrid, SectionHeader, formatDate } from "@/components/content-ui";
import { getEvents } from "@/services/content";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda de eventos, missões, encontros e formações do Auxilia.",
};

function eventStatus(startsAt: string, endsAt?: string) {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 2 * 60 * 60 * 1000;
  if (now < start) return "futuro";
  if (now <= end) return "em andamento";
  return "encerrado";
}

export default async function EventosPage() {
  const events = await getEvents();

  return (
    <main className="section">
      <SectionHeader
        title="Agenda e eventos"
        description="Acompanhe próximos encontros, com data, local, público e detalhes de participação."
      />
      <ContentGrid
        items={events
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
          .map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: `${item.eventType} • ${eventStatus(item.startsAt, item.endsAt)}`,
            href: `/eventos/${item.slug}`,
            meta: `${formatDate(item.startsAt)} • ${item.location}`,
          }))}
        emptyMessage="Nenhum evento disponível no momento."
      />
    </main>
  );
}
