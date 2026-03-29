import ActivitiesFeed from "@/components/ActivitiesFeed";
import NewsFeed from "@/components/NewsFeed";

const trilhaOracao = [
  "Lectio Divina diária com o Evangelho do dia",
  "Adoração semanal com intenção pelos jovens",
  "Terço missionário salesiano",
  "Exame de consciência e projeto pessoal de santidade",
];

const frenteMissao = [
  "Presença ativa nas periferias e realidades juvenis",
  "Acompanhamento espiritual e vocacional",
  "Pastoral juvenil com pedagogia salesiana",
  "Formação contínua para lideranças e animadores",
];

const pilaresAuxilia = [
  "Espiritualidade mariana e eucarística",
  "Carisma de Dom Bosco e Madre Mazzarello",
  "Protagonismo juvenil e vida em comunidade",
  "Missão evangelizadora com alegria e serviço",
];

const canaisOficiais = [
  {
    id: "instagram",
    nome: "Instagram @somosauxilia",
    descricao: "Conteúdos do dia a dia do movimento, espiritualidade e missão.",
    url: "https://www.instagram.com/somosauxilia/",
  },
  {
    id: "facebook",
    nome: "Facebook /somosauxilia",
    descricao: "Eventos, avisos oficiais e partilhas da comunidade.",
    url: "https://www.facebook.com/somosauxilia/?locale=pt_BR",
  },
  {
    id: "youtube",
    nome: "YouTube /c/somosauxilia",
    descricao: "Pregações, formações, testemunhos e conteúdos em vídeo.",
    url: "https://www.youtube.com/c/somosauxilia",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">@somosauxilia • Movimento Salesiano Católico</p>
          <h1>Somos Auxilia</h1>
          <p>
            Um portal para viver oração, missão e comunhão. Aqui os consagrados encontram
            direção espiritual e os jovens acompanham atividades, notícias e experiências do
            mundo salesiano.
          </p>
          <div className="cta-row">
            <a className="btn" href="#agenda">
              Ver agenda
            </a>
            <a className="btn btn-alt" href="#noticias">
              Notícias
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Identidade Auxilia</h2>
        <div className="pills">
          {pilaresAuxilia.map((pilar) => (
            <span key={pilar} className="pill">
              {pilar}
            </span>
          ))}
        </div>
      </section>

      <section className="section social-section">
        <h2>Canais Oficiais @somosauxilia</h2>
        <div className="cards-grid">
          {canaisOficiais.map((canal) => (
            <article key={canal.id} className="card">
              <h3>{canal.nome}</h3>
              <p>{canal.descricao}</p>
              <a className="link-inline" href={canal.url} target="_blank" rel="noreferrer">
                Acessar canal oficial
              </a>
            </article>
          ))}
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

      <section id="agenda" className="section alt">
        <h2>Agenda Jovem e Comunitária</h2>
        <p className="section-description">
          Encontros, oratórios, missões, formações e momentos de oração para viver o carisma
          salesiano durante toda a semana.
        </p>
        <ActivitiesFeed />
      </section>

      <section id="noticias" className="section alt">
        <h2>Notícias do Mundo Salesiano</h2>
        <p className="section-description">
          Atualizações sobre ações, testemunhos, eventos e conteúdos para fortalecer a fé e a
          missão com a juventude.
        </p>
        <NewsFeed />
      </section>
    </main>
  );
}
