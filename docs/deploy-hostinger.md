# Deploy na Hostinger (histórico)

> **Desde 2026-11-26 o site roda na VPS: ver [deploy-vps.md](deploy-vps.md).** O app daqui fica parado até 2026-12-10
> como volta de segurança (Cron Jobs apagados, auto-deploy ainda ligado).

Status: ✅ no ar desde 2026-11-14 em https://criasite.app (banco vazio; robô coletando, sem escrever até a
`GEMINI_API_KEY` ser cadastrada).

| Item | Valor |
|---|---|
| Site | `criasite.app` (addon no mesmo plano dos irmãos; ids da conta fora do repositório, que é público: consultar com `hosting_websites_list` pelo MCP) |
| Deploy | GitHub `evssousa/criasite`, branch `main`, **auto-deploy a cada push** (religado em 2026-11-14: o site apontava para `criasite-app/criasite`, da organização apagada, por isso o hPanel dizia "O provedor do Git não está conectado") |
| Build | Node 24, app Express, `npm run build`, entrada `server.js` (igual ao Vibecoin) |
| Banco | MySQL `<usuário>_criasite` em `127.0.0.1:3306`; migrations aplicadas a cada início. Os 3 bancos do projeto antigo (`_prod`, `_dev`, `_shdw`) foram apagados com autorização do dono |
| Variáveis | `VITE_SITE_URL` (`https://criasite.app` por enquanto), `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CRON_TOKEN` (cadastradas pelo Claude via MCP em 2026-11-14). **Depois que o dono cadastrar `GEMINI_API_KEY` e as do painel no hPanel, não usar mais a operação de substituir variáveis pelo MCP** (ela apaga tudo que não estiver na lista) |
| Cron Jobs | `10,40 * * * *` → `/api/cron/coletar`; `50 * * * *` → `/api/cron/publicar`; `0,30 7 * * *` → `/api/cron/limpeza` (visitas; desde 2026-11-25) (desencontrados do Respawnou e do Vibecoin) |

## DNS e e-mail (2026-11-14)

O criasite.app usava os nameservers da Cloudflare (`sue`/`zahir.ns.cloudflare.com`), da instalação antiga:
a zona da Hostinger era ignorada e não havia MX, por isso o hPanel dizia "A configuração do seu domínio
não está completa". Trocados para `ns1/ns2.dns-parking.com` (como os outros sites). A zona da Hostinger
já tinha site (ALIAS para a CDN), MX, SPF, DKIM (3 CNAMEs) e DMARC; conferido nos servidores da
Hostinger depois da troca. Os CNAMEs `send`/`rsend` (rmta.net), do projeto antigo, foram apagados pelo dono no hPanel (a exclusão pela API falhou: o MCP não repassa o filtro).

## Primeira coleta (2026-11-14)

19 pautas novas de 11 fontes. Search Engine Land responde **403** ao servidor: desativar ou tirar peso
pelo painel `/admin/fontes` se continuar.

## Domínio

**criasite.app é o domínio definitivo** (decisão do dono em 2026-11-14: o .com.br não será registrado).
O `.app` só abre por HTTPS (HSTS pré-carregado): o SSL da Hostinger está ativo, vitalício, com
redirecionamento para HTTPS. E-mail: `contato@criasite.app` (caixa criada pelo dono).

## Falta

1. ~~`GEMINI_API_KEY`~~ cadastrada pelo dono (2026-11-14); diag ok (gemini-3.5-flash e flash-lite), teste dry ok.
2. ~~Variáveis do painel~~ cadastradas pelo dono (2026-11-14).
3. ~~Caixa `contato@criasite.app`~~ criada pelo dono (2026-11-14). Falta Search Console e Bing.
4. Guias da trilha no painel antes de pedir o AdSense.
