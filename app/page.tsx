import Link from "next/link";
import { ContentGrid, SectionHeader, formatDate } from "@/components/content-ui";
import {
  getEvents,
  getNews,
  getOfficialNotices,
  getSongs,
  getSpiritualContents,
} from "@/services/content";

const canaisOficiais = [
  { label: "Instagram", href: "https://www.instagram.com/somosauxilia/" },
  { label: "Facebook", href: "https://www.facebook.com/somosauxilia/?locale=pt_BR" },
  { label: "YouTube", href: "https://www.youtube.com/c/somosauxilia" },
];

export default async function Home() {
  const [news, events, songs, spiritual, notices] = await Promise.all([
    getNews(),
    getEvents(),
    getSongs(),
    getSpiritualContents(),
    getOfficialNotices(),
  ]);

  const featuredNotice = notices[0];

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Movimento Auxilia • Juventude em missão</p>
          <h1>Plataforma oficial de evangelização, música e agenda do Auxilia</h1>
          <p>
            Um espaço digital para rezar, cantar, formar-se e caminhar em comunidade. Acompanhe
            notícias, eventos, conteúdos espirituais e materiais para a juventude católica.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/espiritualidade">
              Conteúdo espiritual
            </Link>
            <Link className="btn btn-alt" href="/eventos">
              Ver agenda
            </Link>
            <Link className="btn btn-alt" href="/busca">
              Busca global
            </Link>
          </div>
        </div>
      </section>

      {featuredNotice ? (
        <section className="section">
          <article className={`notice-banner ${featuredNotice.level}`}>
            <p className="eyebrow">Aviso oficial</p>
            <h3>{featuredNotice.title}</h3>
            <p>{featuredNotice.message}</p>
            {featuredNotice.ctaLabel && featuredNotice.ctaUrl ? (
              <Link href={featuredNotice.ctaUrl} className="text-link">
                {featuredNotice.ctaLabel}
              </Link>
            ) : null}
          </article>
        </section>
      ) : null}

      <section className="section">
        <SectionHeader
          title="Quem Somos"
          description="Conheça o Movimento Auxilia e nossa missão"
        />

        <div className="about-content">
          <article className="about-section">
            <h3>Nossa Missão</h3>
            <p>
              O Movimento Auxilia é uma iniciativa católica de inspiração salesiana dedicada à evangelização
              e formação integral da juventude. Buscamos acompanhar jovens em seu caminho de fé, oferecendo
              espaços de espiritualidade, formação e fraternidade.
            </p>
          </article>

          <div className="pillars-grid">
            <article className="pillar">
              <h4>🙏 Espiritualidade</h4>
              <p>Devoção mariana, oração pessoal e comunitária, acompanhamento espiritual e formação católica.</p>
            </article>

            <article className="pillar">
              <h4>🎵 Música e Louvor</h4>
              <p>Repertório próprio para encontros, atividades, adoração e animação missionária da juventude.</p>
            </article>

            <article className="pillar">
              <h4>🤝 Fraternidade</h4>
              <p>Comunidade viva onde jovens caminham juntos, compartilham valores e se apoiam na missão.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section alt">
        <SectionHeader
          title="Nosso Impacto"
          description="Estatísticas e números que refletem o compromisso do Movimento Auxilia"
        />

        <div className="dashboard-visual">
          <div className="stat-card">
            <div className="stat-number">2.450+</div>
            <div className="stat-label">Membros Ativos</div>
            <p className="stat-description">Jovens engajados em diferentes comunidades</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">1.200+</div>
            <div className="stat-label">Eventos Realizados</div>
            <p className="stat-description">Retiros, missões, adorações e encontros de formação</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">850+</div>
            <div className="stat-label">Voluntários</div>
            <p className="stat-description">Pessoas que dedicam tempo e talentos à missão</p>
          </div>
        </div>
      </section>

      <section id="espiritualidade" className="section alt">
        <SectionHeader
          title="Espiritualidade"
          description="Evangelho do dia, orações e reflexões para jovens e comunidades."
        />
        <ContentGrid
          items={spiritual.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.category,
            href: `/espiritualidade/${item.slug}`,
            meta: formatDate(item.publishedAt),
          }))}
          emptyMessage="Ainda não há conteúdos espirituais publicados."
        />
      </section>

      <section id="musicas" className="section">
        <SectionHeader
          title="Músicas do movimento"
          description="Repertório para encontros, oração, adoração e animação missionária."
        />
        <ContentGrid
          items={songs.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.songType,
            href: `/musicas/${item.slug}`,
          }))}
          emptyMessage="Nenhuma música cadastrada até o momento."
        />
      </section>

      <section id="eventos" className="section alt">
        <SectionHeader
          title="Agenda e eventos"
          description="Programação de encontros, retiros, missões e ações de fraternidade."
        />
        <ContentGrid
          items={events.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.lifecycleStatus ?? item.eventType,
            href: `/eventos/${item.slug}`,
            meta: `${formatDate(item.startsAt)} • ${item.location}`,
          }))}
          emptyMessage="Nenhum evento cadastrado no momento."
        />
      </section>

      <section id="noticias" className="section">
        <SectionHeader
          title="Notícias e comunicação"
          description="Atualizações institucionais, formações e destaques da missão juvenil."
        />
        <ContentGrid
          items={news.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.category,
            href: `/noticias/${item.slug}`,
            meta: formatDate(item.publishedAt),
          }))}
          emptyMessage="Nenhuma notícia publicada ainda."
        />
      </section>

      <section className="section alt">
        <SectionHeader
          title="Participe da comunidade"
          description="Acompanhe os canais oficiais, divulgue iniciativas locais e caminhe com o Auxilia."
        />
        <div className="cta-row">
          <Link className="btn" href="/quero-ajudar">
            ✨ Quero Ajudar
          </Link>
          <Link className="btn btn-alt" href="/dashboard/avisos">
            Entrar no Dashboard
          </Link>
          <a
            className="btn btn-alt btn-outline"
            href="https://www.instagram.com/somosauxilia/"
            target="_blank"
            rel="noreferrer"
          >
            Canais oficiais
          </a>
        </div>
      </section>

      <footer className="footer-minimal">
        <small>Auxilia App • Plataforma em evolução</small>
        <div className="footer-links">
          {canaisOficiais.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
