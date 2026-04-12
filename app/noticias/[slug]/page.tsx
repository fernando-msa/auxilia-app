import { notFound } from "next/navigation";
import { getNews } from "@/services/content";
import { formatDate } from "@/components/content-ui";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NoticiaDetalhe({ params }: DetailPageProps) {
  const { slug } = await params;
  const news = await getNews();
  const item = news.find((entry) => entry.slug === slug);

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
