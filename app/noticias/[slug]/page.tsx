import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/services/content";
import { formatDate } from "@/components/content-ui";

export default async function NoticiaDetalhe({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const item = await getNewsBySlug(slug);

  if (!item) return notFound();

  return (
    <main className="section">
      <article className="content-detail">
        <span className="tag">{item.category}</span>
        <h1>{item.title}</h1>
        <p className="muted">{formatDate(item.publishedAt)}</p>
        <p>{item.content}</p>
      </article>
    </main>
  );
}
