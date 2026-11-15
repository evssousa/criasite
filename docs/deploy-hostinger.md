# Deploy na Hostinger

Status: ✅ no ar desde 2026-11-15 em https://criasite.app (banco vazio; robô coletando, sem escrever até a
`GEMINI_API_KEY` ser cadastrada).

| Item | Valor |
|---|---|
| Site | `criasite.app` (addon no mesmo plano dos irmãos; ids da conta fora do repositório, que é público: consultar com `hosting_websites_list` pelo MCP) |
| Deploy | GitHub `evssousa/criasite`, branch `main`, **auto-deploy a cada push** (religado em 2026-11-15: o site apontava para `criasite-app/criasite`, da organização apagada, por isso o hPanel dizia "O provedor do Git não está conectado") |
| Build | Node 24, app Express, `npm run build`, entrada `server.js` (igual ao Vibecoin) |
| Banco | MySQL `<usuário>_criasite` em `127.0.0.1:3306`; migrations aplicadas a cada início. Os 3 bancos do projeto antigo (`_prod`, `_dev`, `_shdw`) foram apagados com autorização do dono |
| Variáveis | `VITE_SITE_URL` (`https://criasite.app` por enquanto), `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CRON_TOKEN` (cadastradas pelo Claude via MCP em 2026-11-15). **Depois que o dono cadastrar `GEMINI_API_KEY` e as do painel no hPanel, não usar mais a operação de substituir variáveis pelo MCP** (ela apaga tudo que não estiver na lista) |
| Cron Jobs | `10,40 * * * *` → `/api/cron/coletar`; `50 * * * *` → `/api/cron/publicar` (desencontrados do Respawnou e do Vibecoin) |

## Primeira coleta (2026-11-15)

19 pautas novas de 11 fontes. Search Engine Land responde **403** ao servidor: desativar ou tirar peso
pelo painel `/admin/fontes` se continuar.

## Domínio

O plano é ter o **criasite.com.br** como principal, mas ele ainda não está na conta. Quando estiver:
adicionar como site (ou domínio do mesmo app), trocar `VITE_SITE_URL` para `https://criasite.com.br`
(é usada no build: fazer um novo deploy depois), redirecionar o criasite.app para o .com.br e
cadastrar o .com.br no Search Console.

## Falta

1. `GEMINI_API_KEY` (dono, no hPanel) → testar com `/api/cron/diag` e `/api/cron/publicar?dry=1`.
2. `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (`npm run admin:hash`, dono, no hPanel).
3. E-mail `contato@criasite.com.br` (ou `.app` enquanto o .com.br não existir), Search Console e Bing.
4. Guias da trilha no painel antes de pedir o AdSense.
