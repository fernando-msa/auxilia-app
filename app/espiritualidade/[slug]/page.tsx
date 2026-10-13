import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpiritualBySlug } from "@/services/content";

export const revalidate = 60;

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getSpiritualBySlug(slug);

  if (!item) {
    return { title: "Conteúdo não encontrado | Auxilia" };
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

export default async function EspiritualidadeDetalhe({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = await getSpiritualBySlug(slug);

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

