"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const links = [
  ["Início", "inicio"],
  ["Serviços", "servicos"],
  ["Projetos", "projetos"],
  ["Sobre", "sobre"],
  ["Contato", "contato"],
];
export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("inicio");
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px" },
    );
    links.forEach(([, id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <a
          href="#inicio"
          aria-label="JL DEVS — início"
          className="brand"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/jl-devs.png"
            width={1942}
            height={809}
            alt="JL DEVS"
            priority
          />
        </a>
        <nav
          id="main-navigation"
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label="Navegação principal"
        >
          {links.map(([name, id]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {name}
            </a>
          ))}
        </nav>
        <a className="button primary nav-cta" href="#contato">
          Iniciar um projeto <ArrowUpRight size={17} />
        </a>
        <button
          ref={button}
          className="menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="reveal"
      initial={false}
      whileInView={reduced ? undefined : { opacity: [0.5, 1], y: [14, 0] }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function CodeScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    const observer = new IntersectionObserver(
      ([entry]) => scene.classList.toggle("in-view", entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(scene);
    const visibility = () =>
      scene.classList.toggle("page-hidden", document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`code-scene${paused ? " motion-paused" : ""}`}
      onPointerMove={(event) => {
        if (
          paused ||
          event.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--tilt-x",
          `${(event.clientY - box.top - box.height / 2) / 100}deg`,
        );
        event.currentTarget.style.setProperty(
          "--tilt-y",
          `${(event.clientX - box.left - box.width / 2) / 100}deg`,
        );
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--tilt-x", "0deg");
        event.currentTarget.style.setProperty("--tilt-y", "0deg");
      }}
    >
      <div className="scene-orbit orbit-one" aria-hidden="true" />
      <div className="scene-orbit orbit-two" aria-hidden="true" />
      {children}
      <span className="scene-caption">
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Retomar animação" : "Pausar animação"}
        </button>
        <span>JL / DEVS</span>
      </span>
    </div>
  );
}
const subscribeYear = () => () => {};
const getYear = () => new Date().getFullYear();
export function CurrentYear() {
  const year = useSyncExternalStore(subscribeYear, getYear, getYear);
  return <>{year}</>;
}
