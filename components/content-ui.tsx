import Link from "next/link";

type CardItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  href: string;
  meta?: string;
};

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="section-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

export function ContentGrid({ items, emptyMessage }: { items: CardItem[]; emptyMessage: string }) {
  if (!items.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="cards-grid">
      {items.map((item) => (
        <article key={item.id} className="card">
          <span className="tag">{item.category}</span>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          {item.meta ? <p className="muted">{item.meta}</p> : null}
          <Link href={item.href} className="text-link">
            Ver detalhes
          </Link>
        </article>
      ))}
    </div>
  );
}

export function formatDate(date?: string) {
  if (!date) return "";

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}
