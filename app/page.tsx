import NewsFeed from "@/components/NewsFeed";

const trilhaOracao = [
  "Leitura diária da Palavra",
  "Exame de consciência e diário espiritual",
  "Adoração eucarística semanal",
  "Intercessão pelos jovens e famílias",
];

const frenteMissao = [
  "Visitas missionárias em comunidades",
  "Acompanhamento vocacional e juvenil",
  "Serviço social com presença salesiana",
  "Planejamento pastoral mensal",
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Movimento Salesiano / Católico</p>
          <h1>Portal Auxilia</h1>
          <p>
            Uma plataforma para fortalecer a vida de oração dos consagrados e oferecer aos
            jovens uma experiência viva das atividades, notícias e missão salesiana.
          </p>
          <a className="btn" href="#noticias">
            Ver notícias e atividades
          </a>
        </div>
      </section>

      <section className="section">
        <h2>Guia do Consagrado</h2>
        <div className="two-col">
          <article className="panel">
            <h3>Ritmo de Oração</h3>
            <ul>
              {trilhaOracao.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <h3>Norte Missionário</h3>
            <ul>
              {frenteMissao.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="noticias" className="section alt">
        <h2>Experiência Jovem: Atividades e Notícias</h2>
        <p className="section-description">
          Conteúdos para aproximar os jovens do carisma salesiano: encontros, formações,
          missões e tudo que movimenta a Igreja no dia a dia.
        </p>
        <NewsFeed />
      </section>
    </main>
  );
}
