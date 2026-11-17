# Robô de notícias

Mesmo robô do Vibecoin (que veio do Respawnou), adaptado em 2026-11-14 para notícias sobre criar e
cuidar de sites. Ainda **não rodou de verdade**: falta o deploy, o banco e a `GEMINI_API_KEY`.

## Fluxo

```
Cron Jobs da Hostinger (depois do deploy; horários desencontrados dos outros sites)
  │  a cada 30 min        /api/cron/coletar   lê os feeds e enche a fila (feed_items)
  │  de hora em hora      /api/cron/publicar  escreve e publica 1 notícia (respeita horário, limite e intervalo)
  └─ manual               /api/cron/{diag,paginas,fontes,status}
```

1. **Coleta**: lê os feeds ativos (`feeds`), descarta pela regra de `app/lib/robot/topic.ts` (`skipReason`): tipo de texto
   (patrocinado, listas de "melhores", cupom, podcast/webinar, opinião, newsletter) e **assunto** (chips e hardware, aparelhos,
   bolsa, criptomoedas, política e guerra, esporte e entretenimento, troca de CEO). Fonte genérica (`GENERIC_FEEDS`: The Verge IA, GitHub Blog (IA), OpenAI News,
   Vercel Blog e Tecnoblog) só entra se o título ou o início do resumo tiver assunto de sites (`SITE_TOPIC`), IA para criar e programar
   sites (`AI_DEV_TOPIC`: assistentes e agentes de código, MCP, skills, vibe coding) ou IA em geral que interessa a quem tem site
   (`AI_INTEREST_TOPIC`: impacto ambiental e data centers, IA na busca, conteúdo feito com IA); regulação, processos, compra de
   empresas, AGI e chips continuam barrados (`GENERIC_AI_OFF`). A fila que já existia também é revista
   a cada coleta (`reviewQueue`). Testado em 2026-11-16 com 18 títulos reais e inventados. A coleta também dá pontos (`BOOST`: lançamento,
   atualização do Google/Search Console/Core Web Vitals, falha de segurança, WordPress/Shopify/Wix,
   Chrome/HTTPS/WebP, Brasil/LGPD).
2. **Publicação**: pega a pauta melhor colocada, junta outras fontes do mesmo assunto, busca o texto e a
   mídia, exige capa utilizável, pede a notícia ao Gemini (guia editorial em `writer.server.ts`) e
   confere a qualidade (`quality.ts`), com até 3 tentativas.
3. **Montagem** (`assemble.ts`): imagens abaixo dos intertítulos, vídeo depois do lide, "Leia também" e
   pelo menos 1 link interno (1ª menção de um termo ligado a uma ferramenta → página da ferramenta).

## Editorias do robô

`noticias` (web em geral), `google`, `plataformas`, `ia`, `seguranca`. Guias são escritos à mão no painel.

## Fontes iniciais (migration 002)

Google Search Central Blog (10), WordPress News (9), Search Engine Land (8), Search Engine Journal (7),
WP Tavern (7), web.dev (7), Wordfence (7), Smashing Magazine (6), Chrome for Developers (6),
Cloudflare Blog (6), The Verge IA (5). **A testar depois do deploy** com `/api/cron/paginas` e
`/api/cron/fontes` (no Vibecoin, várias fontes bloqueavam o servidor da Hostinger e só o resumo do
RSS chegava): fontes que não rendem texto saem ou perdem peso pelo painel `/admin/fontes`.

## Guia editorial (resumo)

Notícia para quem tem site pequeno: o que mudou e o que muda para o site dele. Sem promessa de
resultado, sem tom de propaganda, falha de segurança com quem é afetado e qual versão corrige, nada
inventado, 400+ palavras, links só das listas permitidas.

## Fontes de IA (migration 007, 2026-11-17)

Feeds conferidos com curl: GitHub Blog (categoria IA, peso 6), Make WordPress AI (6), OpenAI News (4), Vercel Blog (4) e Tecnoblog
(pt-BR, 3). Ficaram de fora: Anthropic (não tem RSS oficial) e Google Developers Blog (itens sem data: o robô descarta). `BOOST` de IA
aplicada a sites é 8, menor que o de Google (14) e segurança (12), de propósito. Se em 2 semanas mais da metade das notícias for de IA,
baixar os pesos em `/admin/fontes`. Casos de teste do filtro (41, todos certos em 2026-11-17): títulos que passam (Copilot abrindo pull
request, MCP, Claude Code com skills, vibe coding, impacto dos data centers) e que são barrados (chips, regulação, investimento, voz do
ChatGPT, Copilot do Windows, compra de empresa de IA).
