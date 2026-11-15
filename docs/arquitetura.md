# Arquitetura

## Stack

- React 19 + React Router 8 em modo framework, com SSR (`react-router build`).
- Servidor de produção: Express 5 (`server.js` → `server-app.js`), igual ao Vibecoin e ao Respawnou:
  define `NODE_ENV` antes de carregar o React, redireciona www → apex, aplica as migrations ao iniciar.
- Tailwind CSS 4 (tokens em `app/app.css`, tema "Busca + Central").
- TypeScript estrito. Vite 8. Node 22+.
- MySQL (Hostinger) via `mysql2`. Migrations aplicadas pelo servidor ao iniciar.
- Base copiada do Vibecoin em 2026-11-14 (servidor, robô, painel, páginas legais), sem a parte de
  cotações; o que é do CriaSite: ferramentas, busca da home, favoritas, trilha e layout.

## Pastas

```
app/
  root.tsx               layout: topo marinho (menu), conteúdo claro, rodapé marinho
  routes.ts              mapa de rotas (editorias registradas uma vez por slug; ferramentas uma a uma)
  routes/                páginas, ferramentas (tool-*.tsx), trilha, resource routes (sitemap, rss, robots, ads.txt)
  components/
    directory.tsx        diretório de ferramentas com estrela, "Suas ferramentas", faixa da trilha, botão de favoritar
    ToolLayout.tsx       moldura das ferramentas: título, painel marinho, texto explicativo, outras ferramentas
    Header, Footer, cards, StaticPage, RichText, CookieConsent, ui, admin-ui
  lib/
    site.ts              fonte única: editorias, ferramentas (com categoria e sinônimos), trilha, páginas institucionais
    prefs.ts             favoritas e trilha no localStorage (useSyncExternalStore)
    availability.ts      o que tem conteúdo (menu, home, sitemap, noindex)
    content.server.ts    API de dados usada pelas rotas
    repo/                contrato das fontes + mock (mock-data.ts, fictício) + MySQL
    robot/               robô de notícias (coleta, Gemini, qualidade, mídia)
    admin/               sessão e dados do painel /admin
db/migrations/           001 estrutura, 002 fontes do robô
scripts/                 db-migrate, admin-hash, make-icons (favicon e imagem de compartilhamento)
docs/                    este plano
```

## Rotas

| Endereço | Página |
|---|---|
| `/` | Home: busca grande, atalhos, faixa da trilha, Suas ferramentas, diretório, notícias e guias novos |
| `/ferramentas` | Diretório completo com filtro |
| `/ferramentas/{comprimir-imagem,converter-imagem,qr-code,link-whatsapp,contador-de-caracteres,meta-tags,contraste-cores,gerador-favicon,sitemap-robots,status-http,tamanhos-de-imagem}` | Ferramentas |
| `/trilha` | As 7 etapas com checklist salvo no navegador |
| `/noticias` (tudo, menos guias), `/google`, `/plataformas`, `/ia`, `/seguranca`, `/guias` | Editorias |
| `/:editoria/:slug` | Notícia ou guia |
| `/busca` | Ferramentas + notícias + guias, `noindex` |
| `/sobre`, `/contato`, `/faq`, `/politica-editorial`, `/anuncie`, `/termos`, `/privacidade`, `/cookies`, `/acessibilidade`, `/mapa-do-site` | Institucionais e legais |
| `/admin/*` | Painel (só o dono) |
| `/api/cron/:job` | Jobs do robô (protegidos por `CRON_TOKEN`) |

## Camada de dados

- Rotas só importam `content.server.ts`. Ele escolhe a fonte: **MySQL** se `DB_NAME` e `DB_USER`
  existirem; senão **mock** (dados de exemplo). As duas seguem a interface `Repo`.
- Só aparecem posts com `status = 'published'` e `published_at <= agora` (dá para agendar).
- Ferramentas não dependem de dados: todas as cadastradas em `TOOLS` aparecem.
- Loaders que leem o endereço usam `routePath`/`firstSegment` (ignoram o sufixo `.data`).

## Estado no navegador (`lib/prefs.ts`)

- `criasite_favs`: lista de slugs de ferramentas. Sem nada salvo, começa com comprimir imagem, QR code
  e link do WhatsApp (a área não nasce vazia).
- `criasite_trail`: ids das etapas da trilha marcadas.
- `criasite_consent`: escolha do banner de cookies (só com AdSense ligado).
- O servidor renderiza o padrão; o navegador lê o salvo depois de hidratar. Sem `localStorage` (aba
  anônima), funciona igual e só não lembra.

## Tema "Busca + Central"

- Os nomes dos tokens vêm do Vibecoin para reaproveitar componentes: `night*` = marinho (`#0c1a4b`),
  `moon*` = texto claro, `brand`/`lime` = laranja `#ff7a1a`, `glow` = laranja claro no escuro,
  `violet*` = laranja escuro `#c24e06` para texto e links no fundo claro (contraste AA), `day` = fundo
  `#eef1fb`, `ink` = marinho.
- Fonte Schibsted Grotesk; JetBrains Mono só em números (`.num`).
- Referência visual: `docs/prototipo-layout.html`.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `VITE_SITE_URL` | URL canônica (build) |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | MySQL |
| `CRON_TOKEN` | protege `/api/cron/*` (mín. 24 caracteres) |
| `GEMINI_API_KEY` | escrita das notícias (sem ela, o robô só registra "sem chave") |
| `ADMIN_EMAIL` `ADMIN_PASSWORD_HASH` `SESSION_SECRET` | login do /admin (`npm run admin:hash`) |
| `MEDIA_DIR` | pasta das imagens das notícias (padrão `~/criasite-media`) |
| `ADSENSE_CLIENT` | liga AdSense, `ads.txt` e banner de cookies |

Modelo em `.env.example`. O `.env` real nunca vai para o Git (repositório público).
