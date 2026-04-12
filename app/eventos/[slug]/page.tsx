import { notFound } from "next/navigation";
import { getEventBySlug } from "@/services/content";
import { formatDate } from "@/components/content-ui";

export default async function EventoDetalhe({ params }: { params: { slug: string } }) {
  const { slug } = params;
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
      </article>
    </main>
  );
}
