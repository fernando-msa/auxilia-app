import { notFound } from "next/navigation";
import { getSpiritualContents } from "@/services/content";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EspiritualidadeDetalhe({ params }: DetailPageProps) {
  const { slug } = await params;
  const contents = await getSpiritualContents();
  const item = contents.find((entry) => entry.slug === slug);

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
