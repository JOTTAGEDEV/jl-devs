import type { Metadata, Viewport } from "next";
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "./globals.css";
const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "JL DEVS — Ideias que viram soluções digitais",
  description:
    "Desenvolvimento web, sistemas personalizados, inteligência artificial, automações e design. Transforme sua ideia com JG Dev e Linhar Dev.",
  openGraph: {
    title: "JL DEVS — Desenvolvimento Digital",
    description:
      "Tecnologia, criatividade e código para o seu próximo projeto.",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/jl-devs.png", width: 1942, height: 809 }],
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#edf3f6" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
