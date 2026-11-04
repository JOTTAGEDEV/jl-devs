import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  Check,
  Code2,
  Globe2,
  Layers3,
  Bot,
  Workflow,
  PenTool,
} from "lucide-react";
import {
  MotionExperience,
  Navigation,
  LiquidBackdrop,
  Reveal,
  ServiceDock,
  ProcessTimeline,
  CurrentYear,
} from "./ui";
import { contacts } from "./content";
const services = [
  {
    name: "Desenvolvimento Web",
    icon: Globe2,
    description: "Seu negócio merece um site que faça sentido.",
    detail:
      "Sites institucionais e landing pages com identidade, navegação clara e atenção à performance em cada tela.",
  },
  {
    name: "Sistemas Personalizados",
    icon: Code2,
    description: "Tecnologia que se adapta ao seu jeito de trabalhar.",
    detail:
      "Ferramentas web construídas a partir das necessidades reais da sua operação, do planejamento à entrega.",
  },
  {
    name: "Inteligência Artificial",
    icon: Bot,
    description: "Inteligência aplicada aos desafios do seu negócio.",
    detail:
      "Assistentes e integrações com IA pensados para o seu contexto, seus dados e seus fluxos de trabalho.",
  },
  {
    name: "Automações",
    icon: Workflow,
    description: "Menos tarefas repetitivas. Mais possibilidades.",
    detail:
      "Conectamos ferramentas e organizamos fluxos para simplificar rotinas e reduzir trabalho manual.",
  },
  {
    name: "UI/UX Design",
    icon: PenTool,
    description: "Experiências intuitivas, em todos os detalhes.",
    detail:
      "Estrutura, prototipação e interfaces que aproximam a identidade do seu negócio das necessidades de quem usa.",
  },
  {
    name: "Aplicações SaaS",
    icon: Layers3,
    description: "Uma ideia hoje. Seu próximo produto digital.",
    detail:
      "Do primeiro escopo ao desenvolvimento da aplicação, criamos juntos uma base para o seu produto.",
  },
];
export default function Home() {
  return (
    <MotionExperience>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navigation />
      <main id="conteudo">
        <div className="hero-world" id="inicio">
          <LiquidBackdrop />
          <section className="hero-top" aria-labelledby="hero-title">
            <div className="hero-copy">
              <Reveal kind="hero">
                <h1 id="hero-title">
                  Sua ideia. Nossa
                  <br />
                  próxima criação.
                </h1>
              </Reveal>
              <Reveal kind="hero" delay={0.12}>
                <p>
                  Sites, sistemas e automações.
                  <br />
                  Desenvolvidos para o seu negócio.
                </p>
              </Reveal>
              <Reveal kind="hero" delay={0.22}>
                <div className="hero-actions">
                  <a href="#contato" className="button glass-button green">
                    <MessageCircle aria-hidden="true" />
                    Iniciar um projeto
                  </a>
                  <a href="#servicos" className="button glass-button clear">
                    Conheça os serviços
                  </a>
                </div>
              </Reveal>
            </div>
          </section>
          <section
            className="hero-services"
            id="servicos"
            aria-labelledby="services-title"
          >
            <h2 id="services-title">Tudo o que sua ideia precisa.</h2>
            <ServiceDock />
          </section>
        </div>
        <section
          className="section capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className="container">
            <Reveal>
              <div className="section-intro">
                <h2 id="capabilities-title">
                  Pensado para você.
                  <br />
                  <span>Desenvolvido com propósito.</span>
                </h2>
                <p>
                  Transformamos ideias em soluções digitais. Escolha o que seu
                  negócio precisa — nós ajudamos a construir o caminho.
                </p>
              </div>
            </Reveal>
            <div className="service-list">
              {services.map(({ name, icon: Icon, description, detail }) => (
                <details className="service-row" key={name}>
                  <summary>
                    <Icon aria-hidden="true" size={25} strokeWidth={1.5} />
                    <h3>{name}</h3>
                    <span className="service-short">{description}</span>
                    <span className="expand-icon" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="service-detail">
                    <p>{detail}</p>
                    <a href="#contato">
                      Conversar sobre minha ideia{" "}
                      <ArrowUpRight aria-hidden="true" size={17} />
                    </a>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section
          className="section projects"
          id="projetos"
          aria-labelledby="projects-title"
        >
          <div className="container">
            <Reveal>
              <div className="section-intro">
                <h2 id="projects-title">
                  Código que se transforma
                  <br />
                  em resultado.
                </h2>
                <p>
                  Conheça dois projetos que fazem parte da nossa trajetória de
                  desenvolvimento.
                </p>
              </div>
            </Reveal>
            <div className="project-grid">
              <Reveal kind="scale">
                <article className="project-card odiopay">
                  <div className="project-stage">
                    <div
                      className="project-glass-object pay-object"
                      aria-hidden="true"
                    >
                      <span>o</span>
                    </div>
                    <div className="project-wordmark">odiopay.</div>
                    <span className="concept-note">
                      Composição visual ilustrativa
                    </span>
                  </div>
                  <div className="project-body">
                    <h3>ODIOPAY</h3>
                    <p>Plataforma de pagamentos em ambiente sandbox.</p>
                    <a href="#contato">
                      Conversar sobre o projeto{" "}
                      <ArrowUpRight aria-hidden="true" size={18} />
                    </a>
                  </div>
                </article>
              </Reveal>
              <Reveal kind="scale" delay={0.1}>
                <article className="project-card second-server">
                  <div className="project-stage">
                    <div className="server-pair" aria-hidden="true">
                      <div>S</div>
                      <ArrowRight />
                      <div>C</div>
                    </div>
                    <div className="project-wordmark">
                      Second Server / Client
                    </div>
                    <span className="concept-note">
                      Composição visual ilustrativa
                    </span>
                  </div>
                  <div className="project-body">
                    <h3>Second Server / Client</h3>
                    <p>Servidor e cliente de jogo personalizados.</p>
                    <a href="#contato">
                      Conversar sobre o projeto{" "}
                      <ArrowUpRight aria-hidden="true" size={18} />
                    </a>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>
        <section
          className="section about"
          id="sobre"
          aria-labelledby="about-title"
        >
          <div className="container">
            <Reveal>
              <div className="about-intro">
                <h2 id="about-title">
                  Duas mentes. Uma visão.
                  <br />
                  <span>Infinitas possibilidades.</span>
                </h2>
                <p>
                  A JL DEVS nasce da colaboração entre JG Dev e Linhar Dev.
                  Unimos criatividade, design e desenvolvimento para transformar
                  ideias em produtos digitais.
                </p>
              </div>
            </Reveal>
            <div className="founder-grid">
              <Reveal>
                <article className="founder glass-panel">
                  <div className="founder-monogram" aria-hidden="true">
                    JG
                  </div>
                  <div>
                    <h3>JG Dev</h3>
                    <p>Jotage Dev</p>
                    <span>Cofundador da JL DEVS</span>
                  </div>
                  <a
                    href={contacts[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Conversar com JG Dev no WhatsApp (nova aba)"
                  >
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </article>
              </Reveal>
              <Reveal delay={0.1}>
                <article className="founder glass-panel">
                  <div className="founder-monogram" aria-hidden="true">
                    LD
                  </div>
                  <div>
                    <h3>Linhar Dev</h3>
                    <p>Cofundador da JL DEVS</p>
                    <span>Desenvolvimento digital</span>
                  </div>
                  <a
                    href={contacts[1].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Conversar com Linhar Dev no WhatsApp (nova aba)"
                  >
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </article>
              </Reveal>
            </div>
          </div>
        </section>
        <section
          className="section process"
          id="processo"
          aria-labelledby="process-title"
        >
          <div className="container">
            <Reveal>
              <div className="section-intro">
                <h2 id="process-title">
                  Uma boa conversa.
                  <br />
                  Um próximo grande projeto.
                </h2>
                <p>
                  Você participa das decisões. Nós cuidamos do design e do
                  desenvolvimento, com clareza em cada etapa.
                </p>
              </div>
            </Reveal>
            <ProcessTimeline />
          </div>
        </section>
        <section
          className="section contact"
          id="contato"
          aria-labelledby="contact-title"
        >
          <div className="container">
            <div className="contact-panel glass-panel">
              <Reveal>
                <h2 id="contact-title">
                  Vamos transformar sua <br />
                  ideia em realidade?
                </h2>
                <p>
                  Conte com a JL DEVS para desenvolver sua próxima solução
                  digital.
                  <br className="desktop-break" /> Entre em contato com nossa
                  equipe.
                </p>
              </Reveal>
              <div className="contact-grid">
                {contacts.map((contact) => (
                  <article className="contact-person" key={contact.name}>
                    <div className="contact-person-title">
                      <MessageCircle aria-hidden="true" size={24} />
                      <h3>{contact.name}</h3>
                    </div>
                    <a
                      className="contact-number"
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contact.number}
                    </a>
                    <a
                      className="button glass-button green"
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Conversar no WhatsApp{" "}
                      <ArrowUpRight aria-hidden="true" size={18} />
                      <span className="sr-only">
                        {" "}
                        com {contact.name} (abre em nova aba)
                      </span>
                    </a>
                  </article>
                ))}
              </div>
              <p className="contact-footnote">
                <Check aria-hidden="true" size={16} /> Uma conversa direta com
                quem vai desenvolver.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <a
                href="#inicio"
                aria-label="JL DEVS — início"
                className="footer-brand"
              >
                <Image
                  src="/images/nav-logo.png"
                  width={2172}
                  height={724}
                  alt="JL DEVS"
                />
              </a>
              <p>Desenvolvimento Digital & Tecnologia.</p>
            </div>
            <nav aria-label="Navegação do rodapé">
              {[
                ["Início", "inicio"],
                ["Serviços", "servicos"],
                ["Projetos", "projetos"],
                ["Sobre", "sobre"],
                ["Contato", "contato"],
              ].map(([name, id]) => (
                <a href={`#${id}`} key={id}>
                  {name}
                </a>
              ))}
            </nav>
            <div className="footer-contacts">
              {contacts.map((contact) => (
                <a
                  href={contact.href}
                  key={contact.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{contact.name}</span>
                  {contact.number}
                  <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <div>
              <p>
                © <CurrentYear /> JL DEVS. Todos os direitos reservados.
              </p>
              <p>
                Desenvolvido por <span>JG Dev</span> & <span>Linhar Dev</span>.
              </p>
            </div>
            <a href="#inicio">
              Voltar ao início <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
      </footer>
    </MotionExperience>
  );
}
