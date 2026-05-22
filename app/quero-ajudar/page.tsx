import { Metadata } from "next";
import { VolunteerForm } from "@/components/VolunteerForm";

export const metadata: Metadata = {
  title: "Quero Ajudar | Auxilia",
  description:
    "Junte-se ao Movimento Auxilia! Cadastre-se como voluntário e faça parte de nossa missão.",
};

export default function QueroAjudarPage() {
  return (
    <main>
      <section className="hero hero-secondary">
        <div>
          <p className="eyebrow">Movimento Auxilia • Voluntariado</p>
          <h1>Quero Ajudar!</h1>
          <p>
            Você é convidado a participar ativamente da missão do Auxilia. Compartilhe seus talentos,
            sua fé e sua paixão pela juventude. Deixe seu cadastro e em breve entraremos em contato.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="volunteer-container">
          <div className="volunteer-info">
            <h2>Por que ser voluntário?</h2>
            <ul className="benefits-list">
              <li>
                <strong>Viver a espiritualidade</strong> — Participar de encontros e retiros formativos
              </li>
              <li>
                <strong>Servir com alegria</strong> — Contribuir para a missão da Igreja junto à juventude
              </li>
              <li>
                <strong>Fazer comunidade</strong> — Integrar uma rede de jovens comprometidos com valores
                cristãos
              </li>
              <li>
                <strong>Desenvolver talentos</strong> — Crescer pessoal, espiritual e missionariamente
              </li>
            </ul>
          </div>

          <div className="volunteer-form-container">
            <VolunteerForm />
          </div>
        </div>
      </section>

      <section className="section alt">
        <h2>Perguntas frequentes</h2>
        <div className="faq-grid">
          <article className="faq-item">
            <h3>Qual é a idade mínima?</h3>
            <p>Buscamos jovens a partir de 16 anos, mas avaliamos cada caso individualmente.</p>
          </article>

          <article className="faq-item">
            <h3>Preciso ser católico?</h3>
            <p>
              Sim, esperamos que você tenha uma relação ativa com a fé católica e esteja interessado em
              crescer espiritualmente.
            </p>
          </article>

          <article className="faq-item">
            <h3>Quanto tempo preciso dedicar?</h3>
            <p>Varia conforme o projeto. Alguns envolvem um encontro mensal, outros são mais intensivos.</p>
          </article>

          <article className="faq-item">
            <h3>Como é o acompanhamento?</h3>
            <p>Você receberá orientação e acompanhamento pastoral durante toda sua participação.</p>
          </article>
        </div>
      </section>

      <footer className="footer-minimal">
        <small>Movimento Auxilia • Juventude em missão</small>
      </footer>
    </main>
  );
}
