import { createHash, timingSafeEqual } from "node:crypto";
import { STATUS, apagarPedido, bancoConfigurado, listarPedidos, mudarStatus, type Pedido } from "../_lib/db";

/*
 * /painel — lista dos pedidos do checkout, só para a JL Devs.
 * Protegido por usuário e senha (HTTP Basic) definidos nas variáveis de
 * ambiente PAINEL_USUARIO (padrão "jl") e PAINEL_SENHA. Sem senha definida,
 * o painel fica desligado. A página não usa JavaScript.
 */

const CABECALHOS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "same-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

const ROTULO: Record<string, string> = { novo: "Novo", pago: "Pago", concluido: "Concluído" };

function igual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function autorizado(request: Request): boolean {
  const senha = process.env.PAINEL_SENHA || "";
  if (senha === "") return false;
  const usuario = process.env.PAINEL_USUARIO || "jl";
  const cabecalho = request.headers.get("authorization") || "";
  if (!cabecalho.startsWith("Basic ")) return false;
  let par = "";
  try {
    par = Buffer.from(cabecalho.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const corte = par.indexOf(":");
  if (corte < 0) return false;
  const okUsuario = igual(par.slice(0, corte), usuario);
  const okSenha = igual(par.slice(corte + 1), senha);
  return okUsuario && okSenha;
}

function esc(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DATA = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function telefone(digitos: string): string {
  const d = digitos.length > 11 && digitos.startsWith("55") ? digitos.slice(2) : digitos;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}

function linkWhatsApp(p: Pedido): string {
  const numero = p.whatsapp.length <= 11 ? "55" + p.whatsapp : p.whatsapp;
  const texto = `Olá, ${p.nome}! Aqui é da JL Devs. Recebemos seu pedido do Plano ${p.plano}.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function botao(id: number, acao: string, rotulo: string, classe = ""): string {
  return `<form method="post" action="/painel"><input type="hidden" name="id" value="${id}"><input type="hidden" name="acao" value="${acao}"><button class="${classe}" type="submit">${rotulo}</button></form>`;
}

function cartao(p: Pedido): string {
  const acoes = STATUS.filter((s) => s !== p.status)
    .map((s) => botao(p.id, s, s === "novo" ? "Voltar para novo" : `Marcar ${ROTULO[s].toLowerCase()}`))
    .join("");
  return `
  <li class="p p--${esc(p.status)}">
    <div class="p__top">
      <h2>${esc(p.nome)}</h2>
      <span class="tag tag--${esc(p.status)}">${esc(ROTULO[p.status] || p.status)}</span>
    </div>
    <p class="p__meta"><b>Plano ${esc(p.plano)}</b> · R$ ${p.valor} · ${esc(DATA.format(p.criadoEm))} · pedido nº ${p.id}</p>
    ${p.mensagem ? `<p class="p__msg">${esc(p.mensagem)}</p>` : ""}
    <div class="p__acoes">
      <a class="wa" href="${esc(linkWhatsApp(p))}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${esc(telefone(p.whatsapp))}</a>
      ${acoes}
      <details><summary>Apagar</summary>${botao(p.id, "apagar", "Confirmar: apagar este pedido", "perigo")}</details>
    </div>
  </li>`;
}

function pagina(titulo: string, corpo: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titulo)} — JL Devs</title>
<style>
:root{--lime:#90EE1F}
*{box-sizing:border-box}
body{margin:0;background:#000;color:#fff;font:16px/1.5 "Century Gothic","Avenir Next",Futura,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:860px;margin:0 auto;padding:clamp(24px,6vw,64px) clamp(18px,4vw,40px) 80px}
h1{margin:0;font-size:clamp(34px,6vw,60px);line-height:1;letter-spacing:-.04em}
.sub{margin:12px 0 0;color:rgba(255,255,255,.72)}
.sub b{color:#fff}
ul{list-style:none;margin:clamp(24px,5vw,44px) 0 0;padding:0;display:grid;gap:14px}
.p{padding:20px 22px 22px;border-radius:22px;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.26)}
.p--novo{box-shadow:inset 0 0 0 2px var(--lime)}
.p--concluido{opacity:.62}
.p__top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
h2{margin:0;font-size:clamp(22px,3.4vw,30px);line-height:1.1;letter-spacing:-.035em;overflow-wrap:anywhere}
.tag{padding:6px 11px 7px;border-radius:999px;font-size:13px;font-weight:700;line-height:1;background:#fff;color:#000}
.tag--novo{background:var(--lime)}
.tag--concluido{background:transparent;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5)}
.p__meta{margin:8px 0 0;color:rgba(255,255,255,.78);font-size:15px}
.p__meta b{color:#fff}
.p__msg{margin:12px 0 0;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.08);white-space:pre-wrap;overflow-wrap:anywhere}
.p__acoes{margin-top:16px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
form{margin:0}
.wa,button,summary{display:inline-flex;align-items:center;min-height:42px;padding:8px 16px;border-radius:999px;font-family:inherit;font-weight:700;font-size:14.5px;line-height:1;text-decoration:none;cursor:pointer}
.wa{background:var(--lime);color:#000}
.wa:hover{background:#fff}
button{border:0;background:transparent;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5)}
button:hover{background:#fff;color:#000}
details{position:relative}
summary{list-style:none;color:rgba(255,255,255,.7);padding:0 6px}
summary::-webkit-details-marker{display:none}
summary:hover{color:#fff}
.perigo{margin-top:8px;box-shadow:inset 0 0 0 1.5px #ff6b6b;color:#ff9c9c}
.perigo:hover{background:#ff6b6b;color:#000}
:focus-visible{outline:3px solid var(--lime);outline-offset:3px}
.vazio{margin-top:36px;padding:26px;border-radius:22px;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.26);color:rgba(255,255,255,.8)}
code{font:14px ui-monospace,Menlo,Consolas,monospace;background:rgba(255,255,255,.12);padding:2px 6px;border-radius:6px}
</style>
</head>
<body><main>${corpo}</main></body>
</html>`;
}

function html(corpo: string, status = 200, extras: Record<string, string> = {}): Response {
  return new Response(corpo, { status, headers: { ...CABECALHOS, ...extras } });
}

function barrar(request: Request): Response | null {
  if ((process.env.PAINEL_SENHA || "") === "") {
    return html(
      pagina("Painel desligado", `<h1>Painel desligado</h1><p class="sub">Defina a variável <code>PAINEL_SENHA</code> no projeto da Vercel e publique de novo para ligar o painel.</p>`),
      503,
    );
  }
  if (!autorizado(request)) {
    return html(pagina("Acesso restrito", `<h1>Acesso restrito</h1><p class="sub">Entre com o usuário e a senha do painel.</p>`), 401, {
      "WWW-Authenticate": 'Basic realm="Painel JL Devs", charset="UTF-8"',
    });
  }
  return null;
}

export async function GET(request: Request): Promise<Response> {
  const barrado = barrar(request);
  if (barrado) return barrado;

  if (!bancoConfigurado()) {
    return html(
      pagina("Pedidos", `<h1>Pedidos</h1><div class="vazio">O banco de dados ainda não está ligado. Crie um banco Postgres (Neon) em Storage, no projeto da Vercel, e publique de novo.</div>`),
    );
  }

  let pedidos: Pedido[];
  try {
    pedidos = await listarPedidos();
  } catch (erro) {
    console.error("painel: falha ao listar", erro);
    return html(pagina("Pedidos", `<h1>Pedidos</h1><div class="vazio">Não consegui ler o banco de dados agora. Tente de novo em instantes.</div>`), 500);
  }

  const novos = pedidos.filter((p) => p.status === "novo").length;
  const pagos = pedidos.filter((p) => p.status === "pago").length;
  const resumo = `<p class="sub"><b>${pedidos.length}</b> no total · <b>${novos}</b> ${novos === 1 ? "novo" : "novos"} · <b>${pagos}</b> ${pagos === 1 ? "pago" : "pagos"}</p>`;
  const lista = pedidos.length
    ? `<ul>${pedidos.map(cartao).join("")}</ul>`
    : `<div class="vazio">Nenhum pedido ainda. Quando alguém preencher o checkout, aparece aqui.</div>`;
  return html(pagina("Pedidos", `<h1>Pedidos</h1>${resumo}${lista}`));
}

function mesmaOrigem(request: Request): boolean {
  /* o navegador marca sozinho de onde veio o formulário; nenhuma página consegue forjar este cabeçalho */
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origem = request.headers.get("origin");
  if (!origem || origem === "null") return false;
  try {
    return new URL(origem).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const barrado = barrar(request);
  if (barrado) return barrado;

  /* o navegador manda a senha sozinho em qualquer formulário: só aceita os do próprio painel */
  if (!mesmaOrigem(request)) return html(pagina("Pedido recusado", `<h1>Pedido recusado</h1>`), 403);

  try {
    const form = await request.formData();
    const id = Number(form.get("id"));
    const acao = String(form.get("acao") || "");
    if (Number.isInteger(id) && id > 0 && bancoConfigurado()) {
      if (acao === "apagar") await apagarPedido(id);
      else if ((STATUS as readonly string[]).includes(acao)) await mudarStatus(id, acao);
    }
  } catch (erro) {
    console.error("painel: falha ao alterar", erro);
  }
  return new Response(null, { status: 303, headers: { Location: "/painel", "Cache-Control": "no-store" } });
}
