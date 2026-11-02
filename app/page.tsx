import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDown,
  Code2,
  Globe2,
  Layers3,
  Bot,
  Workflow,
  PenTool,
  Command,
  ShieldCheck,
  Zap,
  MessageCircle,
  Check,
  Terminal,
  GitBranch,
  Files,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Navigation, Reveal, CodeScene, CurrentYear } from "./ui";

const message = encodeURIComponent(
  "Olá! Conheci a JL DEVS pelo site e gostaria de conversar sobre um projeto.",
);
const contacts = [
  {
    name: "JG Dev",
    number: "(48) 98805-8940",
    href: `https://wa.me/5548988058940?text=${message}`,
  },
  {
    name: "Linhar Dev",
    number: "(48) 98876-7877",
    href: `https://wa.me/5548988767877?text=${message}`,
  },
];
const services = [
  {
    icon: Globe2,
    name: "Desenvolvimento Web",
    text: "Sua presença digital, com personalidade e performance.",
    tags: "Sites institucionais / Landing pages",
    detail:
      "Sites responsivos, navegação intuitiva e uma experiência alinhada à identidade do seu negócio.",
  },
  {
    icon: Code2,
    name: "Sistemas Personalizados",
    text: "Tecnologia que se adapta à sua operação. E não o contrário.",
    tags: "Plataformas / Sistemas web",
    detail:
      "Da descoberta dos requisitos à construção de ferramentas para os processos específicos da sua equipe.",
  },
  {
    icon: Bot,
    name: "Inteligência Artificial",
    text: "Novas possibilidades para desafios reais do seu negócio.",
    tags: "Assistentes / Integrações com IA",
    detail:
      "Integração de recursos de IA com propósito, considerando seus dados, necessidades e fluxos de trabalho.",
  },
  {
    icon: Workflow,
    name: "Automações",
    text: "Menos tarefas repetitivas. Mais tempo para o que importa.",
    tags: "Integrações / Fluxos inteligentes",
    detail:
      "Conectamos ferramentas e desenhamos fluxos para reduzir o trabalho manual nas suas rotinas.",
  },
  {
    icon: PenTool,
    name: "UI/UX Design",
    text: "Interfaces que fazem sentido. Experiências que conectam.",
    tags: "Interfaces / Identidade digital",
    detail:
      "Organização de conteúdo, prototipação e design visual com atenção à usabilidade e à acessibilidade.",
  },
  {
    icon: Layers3,
    name: "Aplicações SaaS",
    text: "Da primeira ideia ao seu próximo produto digital.",
    tags: "MVPs / Produtos digitais",
    detail:
      "Planejamento e desenvolvimento de aplicações web, com escopo construído a partir da proposta do seu produto.",
  },
];
const steps = [
  {
    title: "Descoberta",
    text: "Ouvimos sua ideia, entendemos o negócio e identificamos o que realmente precisa ser resolvido.",
  },
  {
    title: "Estratégia",
    text: "Definimos o caminho: escopo, experiência, tecnologias e um plano claro de desenvolvimento.",
  },
  {
    title: "Desenvolvimento",
    text: "Design e código se encontram. Construímos, testamos e refinamos cada parte da solução.",
  },
  {
    title: "Entrega e evolução",
    text: "Colocamos o projeto no ar e planejamos juntos os próximos passos da sua evolução.",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navigation />
      <main id="conteudo">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="ambient ambient-one" aria-hidden="true" />
          <div className="container hero-inner">
            <div className="hero-copy">
              <Reveal>
                <span className="eyebrow pill">
                  <span className="status-dot" /> Tecnologia com propósito
                </span>
              </Reveal>
              <h1 id="hero-title">
                <Reveal delay={0.08}>Transformamos</Reveal>
                <Reveal delay={0.16}>
                  <span className="lime">ideias</span> em soluções
                </Reveal>
                <Reveal delay={0.24}>
                  digitais<span className="lime">.</span>
                </Reveal>
              </h1>
              <Reveal delay={0.3}>
                <p className="hero-description">
                  Desenvolvemos sites, sistemas e experiências digitais que
                  conectam tecnologia, criatividade e resultados.
                </p>
              </Reveal>
              <Reveal delay={0.36}>
                <div className="hero-actions">
                  <a className="button primary" href="#contato">
                    Iniciar um projeto{" "}
                    <ArrowUpRight aria-hidden="true" size={19} />
                  </a>
                  <a className="button secondary" href="#projetos">
                    Explorar projetos <ArrowDown aria-hidden="true" size={17} />
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.42}>
                <div className="hero-values">
                  <span>
                    <Zap aria-hidden="true" /> Performance
                  </span>
                  <span>
                    <Code2 aria-hidden="true" /> Código sob medida
                  </span>
                  <span>
                    <ShieldCheck aria-hidden="true" /> Cuidado em cada detalhe
                  </span>
                </div>
              </Reveal>
            </div>
            <CodeScene>
              <div
                className="editor"
                aria-label="Exemplo ilustrativo de código da JL DEVS"
              >
                <div className="editor-top">
                  <div className="traffic">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>jl-devs / seu-próximo-projeto</span>
                  <Command aria-hidden="true" size={13} />
                </div>
                <div className="editor-main">
                  <aside aria-hidden="true">
                    <Files aria-hidden="true" />
                    <Search aria-hidden="true" />
                    <GitBranch aria-hidden="true" />
                    <span />
                    <Settings2 aria-hidden="true" />
                  </aside>
                  <div className="editor-content">
                    <div className="editor-tab">
                      <Code2 aria-hidden="true" size={14} />
                      <span>transformar.tsx</span>
                      <span className="tab-dot" />
                    </div>
                    <div className="code">
                      <div className="code-comment">
                        {"// O próximo passo começa com uma ideia."}
                      </div>
                      <div>
                        <b>import</b> {"{"} criatividade, tecnologia {"}"}
                      </div>
                      <div>
                        <b>from</b> <em>&apos;@jl-devs/essência&apos;</em>;
                      </div>
                      <br />
                      <div>
                        <b>const</b> <strong>seuProjeto</strong> = {"{"}
                      </div>
                      <div>
                        {" "}
                        ideia: <em>&apos;Algo extraordinário&apos;</em>,
                      </div>
                      <div> possibilidades: [</div>
                      <div>
                        {" "}
                        <em>&apos;web&apos;</em>, <em>&apos;sistemas&apos;</em>,{" "}
                        <em>&apos;inteligência artificial&apos;</em>
                      </div>
                      <div> ],</div>
                      <div> feitoCom: [criatividade, tecnologia],</div>
                      <div>{"}"};</div>
                      <br />
                      <div>
                        <b>export default</b> <strong>transformar</strong>
                        (seuProjeto);
                      </div>
                    </div>
                    <div className="terminal">
                      <span>
                        <Terminal aria-hidden="true" size={12} /> Terminal
                      </span>
                      <p>
                        <span className="lime">✓</span> Sua próxima ideia pode
                        começar aqui
                        <span className="cursor" />
                      </p>
                    </div>
                  </div>
                </div>
                <div className="editor-status">
                  <span>
                    <GitBranch aria-hidden="true" size={11} /> main{" "}
                    <Check aria-hidden="true" size={11} /> Pronto para criar
                  </span>
                  <span>
                    TypeScript <span className="lime">{"{ }"}</span>
                  </span>
                </div>
              </div>
              <div className="code-floating">
                <span className="floating-icon">
                  <Sparkles aria-hidden="true" size={18} />
                </span>
                <div>
                  Uma ideia. Infinitas possibilidades.
                  <small>Vamos construir a próxima.</small>
                </div>
                <ArrowUpRight aria-hidden="true" size={18} />
              </div>
            </CodeScene>
          </div>
          <div className="container hero-bottom">
            <span>Do primeiro insight à última linha de código.</span>
            <a href="#servicos">
              Explore o que fazemos <ArrowDown aria-hidden="true" size={15} />
            </a>
          </div>
        </section>
        <section
          className="section services"
          id="servicos"
          aria-labelledby="services-title"
        >
          <div className="container">
            <Reveal>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    <span className="small-line" /> O que fazemos
                  </span>
                  <h2 id="services-title">
                    Sua próxima ideia.
                    <br />
                    <span className="muted">Nossa próxima construção.</span>
                  </h2>
                </div>
                <p>
                  Design, desenvolvimento e tecnologia.
                  <br />
                  As peças certas para tirar seu projeto do papel.
                </p>
              </div>
            </Reveal>
            <div className="service-grid">
              {services.map(({ icon: Icon, ...service }, i) => (
                <Reveal key={service.name} delay={(i % 3) * 0.06}>
                  <details className="service-card">
                    <summary>
                      <div className="service-card-top">
                        <span className="icon-box">
                          <Icon
                            aria-hidden="true"
                            size={24}
                            strokeWidth={1.5}
                          />
                        </span>
                        <span className="service-expand" aria-hidden="true">
                          +
                        </span>
                      </div>
                      <h3>{service.name}</h3>
                      <p>{service.text}</p>
                      <span className="service-tags">{service.tags}</span>
                    </summary>
                    <p className="service-detail">
                      {service.detail}{" "}
                      <a href="#contato">
                        Vamos conversar{" "}
                        <ArrowUpRight aria-hidden="true" size={14} />
                      </a>
                    </p>
                  </details>
                </Reveal>
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
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    <span className="small-line" /> Ideias em desenvolvimento
                  </span>
                  <h2 id="projects-title">
                    Código que se transforma
                    <br />
                    em <span className="lime">resultado.</span>
                  </h2>
                </div>
                <a className="text-link" href="#contato">
                  Converse sobre seu projeto{" "}
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
              </div>
            </Reveal>
            <div className="project-grid">
              <Reveal>
                <article className="project-card">
                  <div className="project-art payment-art">
                    <span className="art-label">
                      Exploração visual / JL DEVS
                    </span>
                    <div className="pay-word">
                      <span className="pay-symbol">o</span> odiopay
                      <span className="pay-dot">.</span>
                    </div>
                    <div className="pay-abstract">
                      <div className="pay-orbit" />
                      <div className="pay-tile">
                        <span className="pay-symbol">o</span>
                        <span>
                          ODIOPAY<small>ambiente sandbox</small>
                        </span>
                        <ShieldCheck aria-hidden="true" size={24} />
                      </div>
                    </div>
                    <span className="art-bottom">
                      Pagamentos. Código. Possibilidades.
                    </span>
                  </div>
                  <div className="project-info">
                    <div>
                      <span className="project-type">
                        Plataforma de pagamentos
                      </span>
                      <h3>ODIOPAY</h3>
                    </div>
                    <span className="project-badge">Sandbox</span>
                    <p>
                      Projeto de plataforma de pagamentos em ambiente sandbox.
                    </p>
                    <a href="#contato">
                      Conversar sobre o projeto{" "}
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </div>
                </article>
              </Reveal>
              <Reveal delay={0.1}>
                <article className="project-card">
                  <div className="project-art game-art">
                    <span className="art-label">
                      Exploração visual / JL DEVS
                    </span>
                    <div className="game-grid" />
                    <div className="game-emblem">
                      <span>S</span>
                      <span>S</span>
                    </div>
                    <div className="game-word">
                      SECOND<span>SERVER / CLIENT</span>
                    </div>
                    <span className="art-bottom">
                      Dois lados. Uma experiência.
                    </span>
                  </div>
                  <div className="project-info">
                    <div>
                      <span className="project-type">
                        Desenvolvimento de jogos
                      </span>
                      <h3>Second Server / Client</h3>
                    </div>
                    <span className="project-badge neutral">Projeto</span>
                    <p>Servidor e cliente de jogo personalizados.</p>
                    <a href="#contato">
                      Conversar sobre o projeto{" "}
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </div>
                </article>
              </Reveal>
            </div>
            <p className="portfolio-note">
              Composições visuais ilustrativas. Demos, repositórios e
              tecnologias serão adicionados após confirmação dos links oficiais.
            </p>
          </div>
        </section>
        <section
          className="section about"
          id="sobre"
          aria-labelledby="about-title"
        >
          <div className="container about-layout">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="small-line" /> Quem está por trás do código
                </span>
                <h2 id="about-title">
                  Duas mentes.
                  <br />
                  Uma visão.
                  <br />
                  <span className="lime">Infinitas possibilidades.</span>
                </h2>
                <p className="about-text">
                  A JL DEVS nasce da colaboração entre JG Dev e Linhar Dev.
                  Unimos criatividade, design e desenvolvimento para transformar
                  ideias em produtos digitais.
                </p>
                <p className="about-text muted">
                  Cada projeto começa com uma conversa. Entendemos o que você
                  precisa e construímos juntos o caminho até a solução.
                </p>
              </Reveal>
            </div>
            <Reveal>
              <div className="founders">
                <div className="founders-caption">
                  <span className="status-dot" /> Pessoas reais. Construindo o
                  digital.
                </div>
                <article className="founder">
                  <div className="avatar">
                    JG<span>_</span>
                  </div>
                  <div>
                    <h3>JG Dev</h3>
                    <p>Jotage Dev</p>
                    <span>Cofundador / Desenvolvimento digital</span>
                  </div>
                  <Code2 aria-hidden="true" className="founder-icon" />
                </article>
                <div className="founder-connector">
                  <span />&<span />
                </div>
                <article className="founder">
                  <div className="avatar second">
                    LD<span>_</span>
                  </div>
                  <div>
                    <h3>Linhar Dev</h3>
                    <p>Cofundador</p>
                    <span>Desenvolvimento digital</span>
                  </div>
                  <Terminal aria-hidden="true" className="founder-icon" />
                </article>
                <div className="founders-bottom">
                  <span className="lime">{"{ "}</span> Criatividade + tecnologia
                  + colaboração <span className="lime">{" }"}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        <section
          className="section process"
          id="processo"
          aria-labelledby="process-title"
        >
          <div className="container">
            <Reveal>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    <span className="small-line" /> Como trabalhamos
                  </span>
                  <h2 id="process-title">
                    Da conversa ao código.
                    <br />
                    <span className="muted">Um caminho construído juntos.</span>
                  </h2>
                </div>
                <p>
                  Clareza em cada etapa.
                  <br />
                  Cuidado em cada entrega.
                </p>
              </div>
            </Reveal>
            <ol className="process-grid">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 0.07}>
                    <div className="step-number">
                      0{i + 1}
                      <span />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          className="section contact"
          id="contato"
          aria-labelledby="contact-title"
        >
          <div className="container contact-panel">
            <div className="contact-grid" aria-hidden="true" />
            <Reveal>
              <span className="eyebrow">
                <span className="status-dot" /> Sua próxima ideia começa aqui
              </span>
              <h2 id="contact-title">
                Vamos transformar sua
                <br />
                ideia em <span className="lime">realidade?</span>
              </h2>
              <p>
                Conte com a JL DEVS para desenvolver sua próxima solução
                digital.
                <br className="desktop-break" /> Entre em contato com nossa
                equipe.
              </p>
            </Reveal>
            <div className="contact-options">
              {contacts.map((contact, i) => (
                <Reveal key={contact.number} delay={i * 0.08}>
                  <div className="contact-option">
                    <div className="contact-label">
                      <MessageCircle aria-hidden="true" size={21} />
                      <span>{contact.name}</span>
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
                      className="button primary"
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Conversar no WhatsApp{" "}
                      <ArrowUpRight aria-hidden="true" size={18} />
                      <span className="sr-only">
                        {" "}
                        pelo número {contact.number} (abre em nova aba)
                      </span>
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
            <span className="contact-note">
              <ShieldCheck aria-hidden="true" size={14} /> Contato direto com a
              equipe. Do seu jeito.
            </span>
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
                className="brand footer-brand"
              >
                <Image
                  src="/jl-devs.png"
                  width={1942}
                  height={809}
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
                <a key={id} href={`#${id}`}>
                  {name}
                </a>
              ))}
            </nav>
            <div className="footer-contacts">
              {contacts.map((contact) => (
                <a
                  key={contact.number}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" size={15} />{" "}
                  {contact.number}
                  <ArrowUpRight aria-hidden="true" size={13} />
                </a>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © <CurrentYear /> JL DEVS. Todos os direitos reservados.
            </p>
            <p>
              Desenvolvido por <span>JG Dev</span> & <span>Linhar Dev</span>.
            </p>
            <a href="#inicio">
              Voltar ao topo <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
