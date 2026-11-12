import type { NextConfig } from "next";

/*
 * A home (/) e o checkout (/checkout) são páginas estáticas geradas por
 * experimentos/pagina-cursores/build.py em public/. As regras abaixo servem
 * esses arquivos nos endereços limpos. O projeto roda com servidor (sem
 * `output: "export"`) por causa das rotas /api/pedido e /painel.
 */
const config: NextConfig = {
  images: { unoptimized: true },
  devIndicators: false,
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/index.html" },
        { source: "/checkout", destination: "/checkout/index.html" },
        { source: "/obra", destination: "/obra/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
