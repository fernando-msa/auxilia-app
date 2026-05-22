import type { Aviso } from "@/types/announcements";

export interface AnnouncementCardProps {
  aviso: Aviso;
}

export function AnnouncementCard({ aviso }: AnnouncementCardProps) {
  const formattedDate = aviso.data_criacao
    ? new Intl.DateTimeFormat("pt-BR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(aviso.data_criacao))
    : "";

  const contentPreview = aviso.conteudo.substring(0, 120);
  const needsTruncation = aviso.conteudo.length > 120;

  return (
    <article className="card">
      <div className="announcement-header">
        <h3>{aviso.titulo}</h3>
        {aviso.categoria && <span className="tag">{aviso.categoria}</span>}
      </div>

      <p className="announcement-content">
        {contentPreview}
        {needsTruncation && "..."}
      </p>

      <footer className="announcement-footer">
        <small className="muted">{formattedDate}</small>
        <small className="muted">Por {aviso.autor}</small>
      </footer>
    </article>
  );
}
