import { Metadata } from "next";
import { getAnnouncements } from "@/services/announcements";
import { AnnouncementCard } from "@/components/AnnouncementCard";

export const metadata: Metadata = {
  title: "Mural de Avisos | Dashboard Auxilia",
  description: "Acompanhe os avisos e comunicados do Movimento Auxilia",
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <section className="section">
      <header className="section-header">
        <h2>Mural de Avisos</h2>
        <p>Fique atualizado com os comunicados e avisos da comunidade</p>
      </header>

      {announcements.length === 0 ? (
        <p className="muted">Nenhum aviso publicado no momento.</p>
      ) : (
        <div className="cards-grid">
          {announcements.map((aviso) => (
            <AnnouncementCard key={aviso.id} aviso={aviso} />
          ))}
        </div>
      )}
    </section>
  );
}
