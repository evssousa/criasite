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

1. **Coleta**: lê os feeds ativos (`feeds`), descarta pelo título (`SKIP_PATTERNS`: patrocinado, listas
   de "melhores", cupom, podcast/webinar, opinião, newsletter) e dá pontos (`BOOST`: lançamento,
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
