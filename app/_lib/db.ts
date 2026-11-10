import { neon } from "@neondatabase/serverless";

/*
 * Pedidos do checkout, em Postgres (Neon, criado pelo painel da Vercel).
 * A URL de conexão vem das variáveis de ambiente: nunca fica no código.
 */

export type Pedido = {
  id: number;
  criadoEm: Date;
  nome: string;
  whatsapp: string;
  plano: string;
  valor: number;
  mensagem: string;
  status: string;
};

export const STATUS = ["novo", "pago", "concluido"] as const;

function url(): string {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function bancoConfigurado(): boolean {
  return url() !== "";
}

function sql() {
  return neon(url());
}

let pronto: Promise<void> | null = null;

/* cria a tabela na primeira vez que o banco é usado */
function preparar(): Promise<void> {
  if (!pronto) {
    pronto = (async () => {
      await sql()`
        CREATE TABLE IF NOT EXISTS pedidos (
          id BIGSERIAL PRIMARY KEY,
          criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
          nome TEXT NOT NULL,
          whatsapp TEXT NOT NULL,
          plano TEXT NOT NULL,
          valor INTEGER NOT NULL,
          mensagem TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'novo'
        )`;
    })().catch((erro) => {
      pronto = null;
      throw erro;
    });
  }
  return pronto;
}

export async function criarPedido(p: {
  nome: string;
  whatsapp: string;
  plano: string;
  valor: number;
  mensagem: string;
}): Promise<number> {
  await preparar();
  const linhas = await sql()`
    INSERT INTO pedidos (nome, whatsapp, plano, valor, mensagem)
    VALUES (${p.nome}, ${p.whatsapp}, ${p.plano}, ${p.valor}, ${p.mensagem})
    RETURNING id`;
  return Number(linhas[0].id);
}

export async function listarPedidos(): Promise<Pedido[]> {
  await preparar();
  const linhas = await sql()`
    SELECT id, criado_em, nome, whatsapp, plano, valor, mensagem, status
    FROM pedidos
    ORDER BY criado_em DESC
    LIMIT 500`;
  return linhas.map((l) => ({
    id: Number(l.id),
    criadoEm: new Date(l.criado_em),
    nome: String(l.nome),
    whatsapp: String(l.whatsapp),
    plano: String(l.plano),
    valor: Number(l.valor),
    mensagem: String(l.mensagem ?? ""),
    status: String(l.status),
  }));
}

export async function mudarStatus(id: number, status: string): Promise<void> {
  await preparar();
  await sql()`UPDATE pedidos SET status = ${status} WHERE id = ${id}`;
}

export async function apagarPedido(id: number): Promise<void> {
  await preparar();
  await sql()`DELETE FROM pedidos WHERE id = ${id}`;
}
