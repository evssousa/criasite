# Deploy na VPS (Coolify)

Status: ✅ no ar na VPS desde **2026-11-26** (virada às 11:41–12:05 de Brasília). Antes: Hostinger Cloud Startup
([deploy-hostinger.md](deploy-hostinger.md), agora histórico). Plano e andamento completos: [migracao-vps.md](migracao-vps.md).

| Item | Valor |
|---|---|
| Servidor | VPS Hostinger KVM 1 (1 vCPU, 4 GB, 50 GB, swap 4 GB), Ubuntu 24.04, IPv4 `189.24.17.85` (sem AAAA por enquanto) |
| Painel | Coolify 4 em `https://painel.criasite.app` (2FA). Porta 8000 fechada. Acesso de emergência: SSH root só por chave |
| App | projeto `criasite` → app `criasite`, build pelo `Dockerfile` da raiz, porta 3000, healthcheck `/robots.txt`, 768 MB |
| Deploy | **auto-deploy a cada push** na `main` (GitHub App `coolify-sites-evssousa`), troca sem queda (testado) |
| Domínios | `https://criasite.app` (principal), `https://www.criasite.app` (301 para o principal), `https://criasite.189-24-17-85.sslip.io` (ensaio, com noindex; tirar depois de 7 dias) |
| SSL | Let's Encrypt pelo Traefik do Coolify, renovação automática |
| Banco | MariaDB 11.8 compartilhado `mariadb-sites` (projeto `bancos`), banco e usuário `criasite`; `DB_HOST` = nome interno do serviço. Sem porta pública. Migrations rodam a cada início do app |
| Imagens | `/srv/sites/criasite/media` no servidor → `/data/media` no container (`MEDIA_DIR` no Dockerfile) |
| Variáveis | cadastradas no app do Coolify (só `VITE_SITE_URL` no build). Cópia local do dono em `projetos\_segredos\criasite-vps.env` |
| Tarefas | Scheduled Tasks do app (UTC): `coletar` `10,40 * * * *`, `publicar` `50 * * * *`, `limpeza` `0,30 7 * * *`; cada uma roda `curl` com o `CRON_TOKEN` dentro do container |
| Backup | banco: todos os bancos, diário `30 6 * * *` UTC, 14 cópias locais (restauração testada). Externo (B2): pendente |

## Rótulos do proxy (atenção)

Os redirecionamentos do Coolify saem como 302. Para virar 301, o app usa **rótulos próprios**
("Container Labels" com o gerenciamento automático desligado), com `permanent=true` no `to-non-www` e no
`redirect-to-https`. Consequência: **mudar domínio no Coolify não muda mais os rótulos sozinho**. Para trocar
domínio: ligar de novo "Readonly labels", salvar o domínio, deixar o Coolify gerar os rótulos, aplicar de novo as
duas linhas `permanent=true` e desligar o automático.

**Deploy sem certificado provisório (lição 14 de `criasite/docs/migracao-vps.md`, 2026-11-27):** num deploy, o container
antigo e o novo ficam no ar juntos por alguns minutos. Se um roteador com o **mesmo nome** tem configuração diferente nos
dois (regra, middlewares, TLS), o Traefik descarta o roteador e o site responde com o certificado provisório do Traefik
("não seguro") até o antigo sair (~4 min). Deploy comum (rótulos iguais) não tem esse problema (medido em 27/11: zero
segundos). Tirar um domínio só apaga roteadores e é seguro. Para **mudar** um roteador existente, dar a ele um nome novo
(ex.: `https-0-<uuid>` → `https-0b-<uuid>`, junto com o `service`), para os dois conviverem durante o deploy.

## Comandos úteis (SSH)

- Logs do app: `docker logs --since 1h $(docker ps -qf name=il6sotaggogtnqah6xaf2eg8)`
- Robô à mão: `docker exec <container> sh -c 'curl -s -H "x-cron-token: $CRON_TOKEN" http://127.0.0.1:3000/api/cron/status'`
- SQL: `docker exec -it djg6eojhrivnayhax7ohoszd sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" criasite'`

## Site antigo na Hostinger

**Apagado em 2026-11-26** a pedido do dono (não haverá volta). A exclusão apagou arquivos e banco antigos e o
registro `ftp` da zona; `@`, `www`, `painel`, MX, SPF, DKIM, DMARC e a verificação do Google ficaram. A caixa
`contato@criasite.app` (pedido de e-mail separado, brinde do Cloud Startup) continua ativa.
