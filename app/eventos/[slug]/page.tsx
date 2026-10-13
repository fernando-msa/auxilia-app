import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/services/content";
import { formatDate } from "@/components/content-ui";
import { EventPreSignupForm } from "@/components/EventPreSignupForm";

export const revalidate = 60;

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEventBySlug(slug);

  if (!item) {
    return { title: "Evento não encontrado | Auxilia" };
  }

  return {
    title: `${item.title} | Auxilia`,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      images: item.coverImage ? [item.coverImage] : [],
    },
  };
}

export default async function EventoDetalhe({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);

  if (!item) return notFound();

  return (
    <main className="section">
      <article className="content-detail">
        <span className="tag">{item.eventType}</span>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <p>
          <strong>Data:</strong> {formatDate(item.startsAt)}
        </p>
        <p>
          <strong>Status:</strong> {item.lifecycleStatus}
        </p>
        <p>
          <strong>Local:</strong> {item.location}
        </p>
        <p>
          <strong>Público:</strong> {item.audience}
        </p>
        {item.externalSignupUrl ? (
          <p>
            <a href={item.externalSignupUrl} target="_blank" rel="noreferrer" className="text-link">
              Link de inscrição externa
            </a>
          </p>
        ) : null}

        <EventPreSignupForm eventId={item.id} eventSlug={item.slug} />
      </article>
    </main>
  );
}

