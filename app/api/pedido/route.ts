import { bancoConfigurado, criarPedido } from "../../_lib/db";
import { PLANOS } from "../../_lib/planos";

/*
 * POST /api/pedido — grava quem está indo pagar (nome, WhatsApp e plano).
 * Só escreve: nenhum dado de cliente sai por aqui.
 */

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function mesmaOrigem(request: Request): boolean {
  const origem = request.headers.get("origin");
  if (!origem) return true;
  try {
    return new URL(origem).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function resposta(corpo: Record<string, unknown>, status = 200): Response {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  if (!mesmaOrigem(request)) return resposta({ ok: false, erro: "origem" }, 403);

  let dados: Record<string, unknown>;
  try {
    const corpo: unknown = await request.json();
    if (!corpo || typeof corpo !== "object") throw new Error("corpo inválido");
    dados = corpo as Record<string, unknown>;
  } catch {
    return resposta({ ok: false, erro: "formato" }, 400);
  }

  /* campo-isca: pessoas não veem, robôs preenchem */
  if (texto(dados.site, 200) !== "") return resposta({ ok: true });

  const nome = texto(dados.nome, 80);
  const whatsapp = texto(dados.whatsapp, 30).replace(/\D/g, "");
  const chave = texto(dados.plano, 20);
  const mensagem = texto(dados.mensagem, 600);
  const plano = Object.prototype.hasOwnProperty.call(PLANOS, chave) ? PLANOS[chave] : null;

  if (nome.length < 2) return resposta({ ok: false, erro: "nome" }, 400);
  if (whatsapp.length < 10 || whatsapp.length > 13) return resposta({ ok: false, erro: "whatsapp" }, 400);
  if (!plano) return resposta({ ok: false, erro: "plano" }, 400);

  if (!bancoConfigurado()) return resposta({ ok: false, erro: "banco" }, 503);

  try {
    const id = await criarPedido({ nome, whatsapp, plano: plano.nome, valor: plano.valor, mensagem });
    return resposta({ ok: true, id });
  } catch (erro) {
    console.error("pedido não gravado", erro);
    return resposta({ ok: false, erro: "banco" }, 500);
  }
}
