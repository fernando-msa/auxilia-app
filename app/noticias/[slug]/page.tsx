import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/services/content";
import { formatDate } from "@/components/content-ui";

export const revalidate = 60;

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    return { title: "Notícia não encontrada | Auxilia" };
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

export default async function NoticiaDetalhe({ params }: DetailPageProps) {
  const { slug } = await params;
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

