# JL DEVS

Site institucional de JG Dev (Jotage Dev) & Linhar Dev.

## Deploy na Vercel

1. Na Vercel, selecione **Add New → Project** e importe **JOTTAGEDEV/jl-devs**.
2. Use a branch **main** e **Root Directory: `./`** (a raiz do repositório).
3. Mantenha o preset detectado **Next.js**. O build é `npm run build`; a instalação pode usar `npm ci`. Mantenha **Output Directory** no padrão detectado, sem override manual.
4. Clique em **Deploy**. O projeto não precisa de banco, tokens ou variáveis obrigatórias.

Para usar seu domínio nas imagens de compartilhamento, configure opcionalmente `NEXT_PUBLIC_SITE_URL=https://seu-dominio.com.br` e faça um novo deploy. Sem essa variável, a origem é obtida das variáveis de sistema da Vercel. O arquivo `.openai/hosting.json` registra apenas a prévia anterior no Sites e não interfere no deploy na Vercel.

O desenvolvimento e o build foram executados com Node.js 24. Os scripts de lint e TypeScript podem ser executados antes do deploy.

## Desenvolvimento

Requer Node.js 20.9 ou superior.

```sh
npm ci
npm run dev
```

## Verificação e produção

```sh
npm run lint
npm run typecheck
npm run build
```

O build gera `out/`, pronto para hospedagem estática. Não há variáveis de ambiente obrigatórias nem backend. Os contatos abrem o WhatsApp com a mensagem preenchida; nenhuma mensagem é enviada automaticamente.

## Estrutura

- `app/page.tsx`: conteúdo, serviços, projetos e contatos.
- `app/ui.tsx`: menu móvel, seletor acessível de serviços, transições, controle de movimento e ano atual.
- `app/liquid-scene.tsx`: fundo Liquid Glass com shader WebGL e fallback de imagem.
- `app/content.ts`: os contatos oficiais e a mensagem de WhatsApp.
- `app/globals.css`: identidade visual e responsividade.
- `public/jl-devs.png`: logo oficial fornecido.

Next.js App Router, React, TypeScript, Motion e Lucide. Fontes Space Grotesk, Inter e JetBrains Mono servidas localmente. CSS próprio para reproduzir a referência sem dependências de UI desnecessárias.

O portfólio inclui Lucília Residencial, Pousada do Dado, Residencial Pôr do Sol e Auto Serta Mecânica, com links para seus sites publicados. As capturas dos três últimos estão em `public/images/projects/` e seus dados em `app/content.ts`. A imagem de Lucília é uma composição ilustrativa. A captura da Auto Serta foi feita a partir do código público executado localmente. As capturas foram feitas em 04/11/2026 e convertidas para WebP.

ODIOPAY e Second Server / Client mantêm composições ilustrativas em CSS, identificadas como tal, e links de contato. Links de demos, repositórios e stacks desses dois projetos continuam omitidos a pedido do responsável. Fotos e perfis dos fundadores podem ser adicionados posteriormente.

A nova direção Liquid Glass foi aprovada pelo responsável. O fundo combina uma arte original da marca com refração e reflexos em WebGL, limitado a cerca de 30 quadros por segundo e resolução máxima de 1800 px. Pausa fora da tela e quando a aba está oculta. Há controle global de pausa e respeito a `prefers-reduced-motion`. Sem WebGL, a mesma arte aparece como imagem estática. Observadores, listeners, buffers, shaders e texturas são liberados no cleanup.

Copyright e créditos no rodapé com ano calculado automaticamente. Para alterar contatos, edite a lista `contacts` em `app/content.ts`. As artes produzidas com ImageGen ficam em `public/images/`; sua proveniência está nos metadados PNG ou no sidecar do WebP.
