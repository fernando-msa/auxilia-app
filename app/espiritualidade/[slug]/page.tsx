import { notFound } from "next/navigation";
import { getSpiritualContentBySlug } from "@/services/content";

export default async function EspiritualidadeDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getSpiritualContentBySlug(slug);

  if (!item) return notFound();

  return (
    <main className="section">
      <article className="content-detail">
        <span className="tag">{item.spiritualType}</span>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <p>{item.content}</p>
      </article>
    </main>
  );
}
