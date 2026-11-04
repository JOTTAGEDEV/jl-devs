"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { Menu, X, Globe2, Layers3, Zap, Pause, Play } from "lucide-react";
import { LiquidScene } from "./liquid-scene";
const MotionState = createContext({ paused: false, toggle: () => {} });
export function MotionExperience({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <MotionState.Provider
      value={{ paused, toggle: () => setPaused((p) => !p) }}
    >
      <MotionConfig reducedMotion="user">
        <div className="experience" data-motion={paused ? "paused" : "playing"}>
          {children}
          <button
            className="motion-control glass-panel"
            type="button"
            aria-pressed={paused}
            aria-label={paused ? "Retomar animações" : "Pausar animações"}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <Play aria-hidden="true" size={14} />
            ) : (
              <Pause aria-hidden="true" size={14} />
            )}
            <span>{paused ? "Retomar animações" : "Pausar animações"}</span>
          </button>
        </div>
      </MotionConfig>
    </MotionState.Provider>
  );
}
const links = [
  ["Serviços", "servicos"],
  ["Projetos", "projetos"],
  ["Sobre", "sobre"],
  ["Contato", "contato"],
];
export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(entry.target.id === "inicio" ? "" : entry.target.id);
        }),
      { rootMargin: "-18% 0px -60% 0px" },
    );
    [["Início", "inicio"], ...links].forEach(([, id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const listener = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [open]);
  return (
    <header className="site-header">
      <div className="nav-capsule glass-panel">
        <a
          className="brand"
          href="#inicio"
          aria-label="JL DEVS — início"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/nav-logo.png"
            width={2172}
            height={724}
            alt="JL DEVS"
            priority
          />
        </a>
        <nav
          id="main-navigation"
          className={`main-nav${open ? " is-open" : ""}`}
          aria-label="Navegação principal"
        >
          {links.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          className="menu-toggle"
          ref={button}
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
export function LiquidBackdrop() {
  const { paused } = useContext(MotionState);
  return <LiquidScene paused={paused} />;
}
export function Reveal({
  children,
  delay = 0,
  kind = "rise",
}: {
  children: ReactNode;
  delay?: number;
  kind?: "rise" | "hero" | "scale";
}) {
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionState);
  return (
    <motion.div
      className={`reveal reveal-${kind}`}
      initial={false}
      whileInView={
        reduced || paused
          ? undefined
          : kind === "scale"
            ? { scale: [0.965, 1], opacity: [0.7, 1] }
            : { y: [kind === "hero" ? 24 : 18, 0], opacity: [0.65, 1] }
      }
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
const dockServices = [
  {
    name: "Web",
    icon: Globe2,
    title: "Web",
    description:
      "Sites profissionais, rápidos e responsivos, que fortalecem a sua presença digital.",
  },
  {
    name: "Sistemas",
    icon: Layers3,
    title: "Sistemas",
    description:
      "Soluções personalizadas para organizar sua operação e acompanhar o seu negócio.",
  },
  {
    name: "Automações",
    icon: Zap,
    title: "Automações",
    description:
      "Ferramentas conectadas e processos mais simples, com menos tarefas repetitivas.",
  },
];
export function ServiceDock() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionState);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const service = dockServices[active];
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % 3;
    else if (event.key === "ArrowLeft") next = (index + 2) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }
  return (
    <div className="service-dock glass-panel">
      <div
        className="dock-tabs"
        role="tablist"
        aria-label="Explore nossos serviços"
      >
        {dockServices.map(({ name, icon: Icon }, i) => (
          <button
            key={name}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            id={`service-tab-${i}`}
            role="tab"
            aria-selected={active === i}
            aria-controls="service-panel"
            tabIndex={active === i ? 0 : -1}
            onKeyDown={(event) => onKey(event, i)}
            onClick={() => setActive(i)}
          >
            {active === i ? (
              <motion.span
                className="dock-active"
                layoutId="dock-active"
                transition={
                  reduced || paused
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 330, damping: 30 }
                }
              />
            ) : null}
            <Icon aria-hidden="true" size={35} strokeWidth={1.5} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div
        className="dock-content"
        id="service-panel"
        role="tabpanel"
        aria-labelledby={`service-tab-${active}`}
        tabIndex={0}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={service.title}
            initial={reduced || paused ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced || paused ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
          >
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
const steps = [
  {
    title: "Descoberta",
    text: "Ouvimos sua ideia e entendemos o que seu negócio precisa.",
  },
  {
    title: "Estratégia",
    text: "Definimos escopo, experiência e o caminho de desenvolvimento.",
  },
  {
    title: "Desenvolvimento",
    text: "Design e código se encontram. Construímos, testamos e refinamos.",
  },
  {
    title: "Entrega e evolução",
    text: "Colocamos o projeto no ar e planejamos os próximos passos.",
  },
];
export function ProcessTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionState);
  return (
    <div className="process-wrap">
      <div className="process-line" aria-hidden="true">
        <motion.div style={{ scaleX: reduced || paused ? 1 : scaleX }} />
      </div>
      <ol ref={ref} className="process-timeline">
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className="step-number">0{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
const subscribeYear = () => () => {};
const getYear = () => new Date().getFullYear();
export function CurrentYear() {
  return <>{useSyncExternalStore(subscribeYear, getYear, getYear)}</>;
}
