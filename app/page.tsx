import ActivitiesFeed from "@/components/ActivitiesFeed";
import AdminContentManager from "@/components/AdminContentManager";
import NewsFeed from "@/components/NewsFeed";

const canaisOficiais = [
  { label: "Instagram", href: "https://www.instagram.com/somosauxilia/" },
  { label: "Facebook", href: "https://www.facebook.com/somosauxilia/?locale=pt_BR" },
  { label: "YouTube", href: "https://www.youtube.com/c/somosauxilia" },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">@somosauxilia • Jovens em missão</p>
          <h1>Notícias e Agenda Auxilia</h1>
          <p>
            Acompanhe tudo o que movimenta a juventude salesiana: eventos, notícias, encontros,
            formações e vida de oração.
          </p>
          <div className="cta-row">
            <a className="btn" href="#noticias">
              Últimas notícias
            </a>
            <a className="btn btn-alt" href="#agenda">
              Próximas atividades
            </a>
          </div>
        </div>
      </section>

      <section id="noticias" className="section alt">
        <h2>Notícias para a Juventude</h2>
        <p className="section-description">
          Atualizações e conteúdos para fortalecer a fé, o protagonismo jovem e a missão.
        </p>
        <NewsFeed />
      </section>

      <section id="agenda" className="section alt">
        <h2>Agenda Jovem</h2>
        <p className="section-description">
          Programação de encontros, missões, oratórios e formações da comunidade.
        </p>
        <ActivitiesFeed />
      </section>

      <AdminContentManager />

      <footer className="footer-minimal">
        <small>@somosauxilia</small>
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
