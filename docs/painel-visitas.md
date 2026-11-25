# Painel de visitas (`/admin/visitas`)

Cópia do módulo do animeprofile (plano completo em `animeprofile/docs/plano-painel-visitas.md`), adaptada ao CriaSite em 2026-11-19.
Contagem própria, **sem cookie, sem guardar IP**, agregada por dia (horário de Brasília). Funciona com a CDN guardando o HTML.

## Como funciona
- `<VisitBeacon />` (no `App` de `app/root.tsx`) manda `POST /api/v` (texto, até 1 KB) quando a página abre e a cada troca de endereço. Não manda em `/admin`, `/api` nem na página de erro/404.
- `app/routes/api.v.ts` → `app/visitas/server/coleta.server.ts`: ignora robôs (`isbot`, contados à parte), prefetch, outro site e o dono logado (cookie `__criasite_admin`); calcula um código do visitante com sal diário (tabela `visit_salt`, trocado todo dia); a mesma pessoa no mesmo endereço em 30 s não conta de novo.
- O buffer em memória é gravado a cada 10 s em `visit_daily`, `visit_pages`, `visit_dims` e `visit_seen` (migration `011_visitas.sql`, aplicada sozinha no deploy). Um reinício perde no máximo 10 s.
- `posts.views` (usado em "Mais lidas") volta a andar pela mesma coleta: soma 1 por pessoa a cada 30 min em `/<editoria>/<slug>`. O antigo `POST /api/view` responde 204 sem fazer nada (apagar com a rota depois de 2026-11-27).
- Limpeza: `GET /api/cron/limpeza?token=...` (Cron Job da Hostinger criado em 2026-11-25, `0,30 7 * * *` UTC, conferido) apaga `visit_seen` antigo e páginas/origens com mais de 400 dias. Os totais por dia ficam sem prazo.

## Tela
Cartões Hoje / Ontem / 7 dias / 30 dias / Total, gráfico de 30 dias, páginas mais vistas (filtros: Tudo, Matérias, Guias, Ferramentas, Trilha, Outras), de onde vêm (direto, busca, redes, outros sites, campanhas UTM), aparelho, navegador e sistema. "Agora" = pessoas diferentes nos últimos 5 min (aproximado, só deste processo). Visitantes únicos só por dia (7 e 30 dias mostram média por dia).

## O que é do site (o resto é o módulo)
`app/visitas/config.ts` (tipos de página, filtros, contadores, hosts), `db.ts`, `site.server.ts` (títulos), `ui/visitas.css` (cores) e `ui/icones.tsx` (SVGs no lugar do lucide). Núcleo puro testado por `npm run test:visitas` (14 casos).

## Diferenças em relação ao animeprofile
- Sal diário em tabela própria (`visit_salt`), porque o CriaSite não tem `system_config`.
- Sem biblioteca de ícones; teste do núcleo em `node scripts/test-visitas.ts` (sem vitest).
- Login: o do próprio CriaSite (`ADMIN_*`, cookie `__criasite_admin`). Painel em `/admin/visitas` (o `/admin` continua sendo o painel do robô).

## Conferido em 2026-11-19 (banco MySQL 8.4 em memória + site em desenvolvimento)
Robô vira "robôs ignorados"; cookie do admin não conta; recarregamento em 30 s conta 1; origem Google/Instagram/UTM, aparelho, navegador e sistema gravados; `posts.views` soma por pessoa; limpeza apaga o código antigo; painel sem rolagem horizontal em 1440 e 375 px.

## Cuidados
- O IP usado no código é o primeiro de `x-forwarded-for`. Se a CDN mandar o IP dela, todos viram "1 visitante": conferir depois do deploy (visitantes de hoje ≈ nº de pessoas reais).
- Números menores que os de ferramentas com cookie ou de contagem a cada clique: não são comparáveis.
- Texto de privacidade e cookies atualizado (contagem sem cookie, retenção de 13 meses).
