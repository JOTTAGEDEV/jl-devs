/* Planos vendidos no checkout. Os mesmos valores ficam em
   experimentos/pagina-cursores/src/checkout.html e nos links do Mercado Pago. */
export const PLANOS: Record<string, { nome: string; valor: number }> = {
  basico: { nome: "Básico", valor: 350 },
  medio: { nome: "Médio", valor: 450 },
  completo: { nome: "Completo", valor: 700 },
};
