# JL DEVS

Site institucional de JG Dev (Jotage Dev) & Linhar Dev.

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

O build gera `out/`, pronto para hospedagem estática. Não há variáveis de ambiente nem backend. Os contatos abrem o WhatsApp com a mensagem preenchida; nenhuma mensagem é enviada automaticamente.

## Estrutura

- `app/page.tsx`: conteúdo, serviços, projetos e contatos.
- `app/ui.tsx`: menu móvel, animações e ano atual.
- `app/globals.css`: identidade visual e responsividade.
- `public/jl-devs.png`: logo oficial fornecido.

Next.js App Router, React, TypeScript, Motion e Lucide. Fontes Space Grotesk, Inter e JetBrains Mono servidas localmente. CSS próprio para reproduzir a referência sem dependências de UI desnecessárias.

As artes do portfólio são composições ilustrativas em CSS. Não representam capturas dos produtos. Links de demos, repositórios e stacks dos projetos foram omitidos a pedido do responsável. Fotos e perfis dos fundadores podem ser adicionados posteriormente.

A animação do editor pausa fora da tela e quando a aba está oculta, oferece controle de pausa e respeita `prefers-reduced-motion`. Observadores e listeners são removidos no cleanup.

Copyright e créditos no rodapé com ano calculado automaticamente. Para alterar contatos, edite a lista `contacts` em `app/page.tsx`.
