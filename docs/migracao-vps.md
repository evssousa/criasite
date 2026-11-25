# Migração para a VPS (Hostinger KVM 1 + Coolify)

Status: 🔄 em execução. 12 decisões aprovadas pelo dono em 2026-11-25 (todas as recomendações). Ver "Andamento" no fim. O criasite é o **1º site** a migrar;
depois vêm respawnou, vibecoin e animeprofile, todos na mesma VPS.

Como ler este documento:
- **Parte A** (base da VPS) é feita **uma vez só**, no criasite. Os outros sites pulam para a Parte B.
- **Partes B a F** são o **módulo de migração copiável**: escritas com marcadores `<site>`, `<dominio>`, `<SITE>` (maiúsculas)
  e com o exemplo do criasite ao lado. Para migrar outro site, copie as Partes B a F para `docs/migracao-vps.md` do site,
  troque os marcadores e ajuste a seção "Específico do site".
- Cada passo diz **quem faz** (🤖 Claude ou 👤 Dono) e **como conferir**.

---

## Objetivo

Levar o criasite.app da hospedagem Cloud Startup para a VPS sem perder nada (banco, imagens, robô, painel, visitas, SEO) e
sem ficar fora do ar, deixando um módulo de migração que serve igual para os outros 3 sites.

## Contexto

- **Hoje:** app Node (React Router 8 SSR + Express 5) na hospedagem gerenciada da Hostinger, atrás da CDN deles
  (`criasite.app.cdn.hstgr.net`), auto-deploy do GitHub `evssousa/criasite` (main), MySQL/MariaDB compartilhado em
  `127.0.0.1:3306`, imagens das matérias em `MEDIA_DIR` (padrão `~/criasite-media`, fora da pasta do app), Cron Jobs do
  hPanel chamando `/api/cron/{coletar,publicar,limpeza}`. Migrations rodam sozinhas no início do servidor
  (`server-app.js` → `db/migrate.mjs`, tabela `schema_migrations`; última é `013_links_leva3`).
- **VPS (2026-11-25):** Hostinger KVM 1, 1 vCPU, 4 GB RAM (3.915 MB; ~1.077 MB já usados pelo Coolify, coolify-db,
  coolify-redis, Traefik e sentinel; ~2.837 MB livres), **sem swap**, disco 48 GB (42 GB livres), Ubuntu 24.04.5,
  kernel 6.8, ufw inativo, Coolify pré-instalado e **ainda sem conta de administrador**. IPv4 `189.24.17.85`, IPv6
  `2a02:4780:c6:654a::1`, hostname `srv2199552.hstgr.cloud`. O Claude **já tem SSH root** (chave ed25519 `claude-vps`,
  arquivo `~/.ssh/criasite_vps` no PC do dono). A chave `coolify` no root **não pode ser removida** (o Coolify usa para
  falar com o próprio servidor).
- **Por que muda:** o dono vai sair do Cloud Startup; todos os sites passam para a VPS.

## Decisões técnicas deste plano (resumo)

1. **Coolify** (já instalado) em vez de stack manual. Motivo: o dono não é de infra e ganha uma tela para ver deploys,
   logs, variáveis, backups e tarefas agendadas; SSL automático (Traefik + Let's Encrypt), auto-deploy por GitHub e
   deploy sem queda (healthcheck) já vêm prontos; o Claude continua operando tudo por SSH (`docker`, logs, banco) e pela
   API do Coolify. O custo é ~1,1 GB de RAM, que cabe: 4 apps (~250 MB cada) + MariaDB (~400 MB) + Coolify (~1,1 GB)
   ≈ 2,5 GB de 3,9 GB. O ponto fraco é o **build no 1 vCPU** (Vite/React Router: 2 a 4 min, pico de ~1 a 1,5 GB): resolvido
   com **swap de 4 GB** e **1 build por vez**. Se os builds atrapalharem os sites, a saída já prevista é construir a
   imagem no GitHub Actions e o Coolify só baixar (Parte G).
2. **Um MariaDB só** (um serviço do Coolify) para os 4 sites, **um banco + um usuário por site**, só na rede interna do
   Docker (nunca exposto). Versão: **a LTS igual ou mais nova que a da origem** (ver passo B5.1; esperado `mariadb:11.4`).
3. **Dump pelo phpMyAdmin** (opção a), feito pelo dono, duas vezes: ensaio e final. Sem senha no chat, sem derrubar o site
   antigo. (b) exigiria a senha do banco e (c) derruba o site antigo e obriga a usar a troca total de variáveis pelo MCP,
   que apaga as que o dono cadastrou. Ver Parte H, decisão 3.
4. **Imagens (`/media`) baixadas por HTTP** do site antigo, a partir da lista de caminhos extraída do próprio dump
   (não depende de SSH na hospedagem nem do esquema das tabelas).
5. **Teste completo antes da virada** num endereço temporário `https://criasite.189-24-17-85.sslip.io` (Let's Encrypt
   de verdade). O domínio `criasite.app` só é cadastrado no Coolify **depois** que o DNS já aponta para a VPS, para não
   gastar o limite de falhas do Let's Encrypt.
6. **Crons no Coolify (Scheduled Tasks)** rodando `curl` **dentro do container**, com o `CRON_TOKEN` lido do ambiente do
   próprio container: o token nunca aparece em linha de comando nem no chat.
7. **Firewall da Hostinger (pela API)** e não ufw: o Docker publica portas por cima do ufw (o ufw não bloquearia a 8000
   do Coolify). Abertas: 22, 80, 443 (TCP) e 443 (UDP, HTTP/3).

---

## Arquivos afetados

| Arquivo | O que muda |
|---|---|
| `Dockerfile` (novo) | Imagem de produção (Parte B2) |
| `.dockerignore` (novo) | Não mandar `node_modules`, `build`, `.git`, `.env*`, `docs` para o build |
| `server.js` | Só comentários: tirar a menção ao LiteSpeed como única forma; explicar que a regra continua valendo (Docker e Hostinger) |
| `server-app.js` | Comentário de `prepareDatabase` ("O MySQL da Hostinger só aceita conexão local") passa a genérico |
| `server-paths.mjs` | Comentário: na VPS o `MEDIA_DIR` é `/data/media` (pasta do servidor montada no container) |
| `app/lib/db.server.ts` | Comentário do topo: na VPS o host é o nome interno do serviço MariaDB (vem de `DB_HOST`) |
| `app/routes/cron.ts` | Comentário: "chamadas pelos Cron Jobs da Hostinger" → "pelas tarefas agendadas do Coolify"; manter a resposta 202 (não mexer na lógica) |
| `app/lib/robot/robot.server.ts` | Mensagens "configurada no hPanel" → "configurada no painel" (linhas 63 e 333) |
| `.env.example` | Comentários: "Na Hostinger" → "No painel (Coolify)"; `DB_HOST` com exemplo do nome interno; `MEDIA_DIR=/data/media` na VPS |
| `docs/deploy-vps.md` (novo) | Doc de deploy na VPS (substitui o da Hostinger depois da virada) |
| `docs/deploy-hostinger.md` | No topo: "Histórico: o site saiu da Hostinger gerenciada em <data>; ver deploy-vps.md" |
| `docs/arquitetura.md` | Stack/servidor: "Docker no Coolify (VPS)"; tabela de variáveis com `MEDIA_DIR=/data/media` |
| `docs/README.md`, `docs/decisoes.md` | Status, próximos passos, pendências, decisões |

Nada de lógica do app muda. **Não** mexer em `clientIp`/`ipDe`/`limits.server.ts` antes do teste de cabeçalhos (passo B9.8).

---

## Parte A — Base da VPS (uma vez só; genérica)

### A0. URGENTE: conta de administrador do Coolify 👤 + 🤖
Enquanto ninguém criou a conta, **qualquer pessoa** que abrir `http://189.24.17.85:8000` vira administradora.
1. 🤖 Antes de tudo, fechar a 8000 para o mundo: descobrir o IP público do PC do dono (`curl -s https://api.ipify.org`,
   rodado no PC) e criar o firewall da Hostinger (passo A5) já com a regra `TCP 8000` **só desse IP**.
2. 👤 Abrir `http://189.24.17.85:8000`, criar a conta (e-mail do dono, senha forte guardada no gerenciador de senhas),
   ligar **2FA** em Profile → Two-factor. Não colar nada no chat.
3. 👤 Criar um **token de API** (Keys & Tokens → API tokens, permissão `root`, nome `claude`) e salvar **só** no arquivo
   `C:\Users\evsli\OneDrive\Área de Trabalho\projetos\_segredos\coolify-api-token.txt` (pasta fora de qualquer repositório).
   O Claude usa o arquivo em comandos (`$(cat ...)`) sem nunca ler o conteúdo para o chat. (Se o dono preferir não dar o
   token, o Claude passa cada configuração de tela como roteiro e o dono clica: Parte H, decisão 5.)
- **Conferir:** login com 2FA funciona; `curl -m 5 http://189.24.17.85:8000` de fora do IP do dono não conecta.

### A1. Snapshot antes de mexer 🤖
Criar snapshot da VPS pelo MCP da Hostinger (operação de snapshot da VPS). **Conferir** se o plano inclui snapshot e
backups semanais sem custo (listar backups pelo MCP); se só houver 1 snapshot, ele é substituído a cada passo grande.

### A2. Atualizações 🤖
```bash
apt-get update && apt-get -y upgrade
apt-get -y install unattended-upgrades fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades
```
Criar `/etc/apt/apt.conf.d/52unattended-local`:
```
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "06:15";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
```
(06:15 UTC = 03:15 de Brasília; longe dos crons dos sites. Os containers do Coolify voltam sozinhos.)
- **Conferir:** `systemctl status unattended-upgrades` ativo; `unattended-upgrade --dry-run -d` sem erro.

### A3. Swap de 4 GB 🤖
```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf && sysctl --system
```
- **Conferir:** `free -m` mostra Swap 4095; `swapon --show`.

### A4. SSH só por chave 🤖
Criar `/etc/ssh/sshd_config.d/99-endurecer.conf`:
```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
```
`sshd -t && systemctl reload ssh`. **Antes de fechar a sessão atual**, abrir uma segunda sessão SSH com a chave
`claude-vps` e confirmar que entra. Não mexer em `/root/.ssh/authorized_keys` (a chave `coolify` fica).
fail2ban: `/etc/fail2ban/jail.d/sshd.local` com `[sshd]\nenabled = true\nmaxretry = 5\nbantime = 1h`; `systemctl enable --now fail2ban`.
- **Conferir:** `ssh -o PasswordAuthentication=yes -o PubkeyAuthentication=no root@189.24.17.85` é recusado;
  `fail2ban-client status sshd` ativo; no Coolify, Servers → localhost → "Validate Server" continua verde.

### A5. Firewall da Hostinger (API) 🤖
Pelo MCP (operações de firewall da VPS): criar o firewall `vps-sites`, regras de entrada:

| Protocolo | Porta | Origem |
|---|---|---|
| TCP | 22 | qualquer |
| TCP | 80 | qualquer |
| TCP | 443 | qualquer |
| UDP | 443 | qualquer |
| TCP | 8000 | só o IP do dono (temporária, sai no A7) |

Ativar na VPS. ufw fica **desligado** (não protege portas do Docker; o firewall da Hostinger fica antes da máquina).
Conferir se as regras valem também para IPv6; se não valerem, ligar o ufw só para IPv6 não resolve (Docker): nesse caso
anotar e manter o painel só por domínio com HTTPS + 2FA.
- **Conferir (de fora, do PC):** `Test-NetConnection 189.24.17.85 -Port 22/80/443` abre; `-Port 6001`, `6002`, `3306`,
  `8000` (de outro IP, ex. celular no 4G) não abrem.

### A6. Docker: logs e IPv6 🤖
1. Ler `/etc/docker/daemon.json` (o Coolify já escreve um). **Juntar**, sem apagar o que existe:
   ```json
   { "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" },
     "ipv6": true, "ip6tables": true, "fixed-cidr-v6": "fd00:d0c::/64" }
   ```
2. `systemctl restart docker` (todos os containers reiniciam; nessa fase ainda não há site).
- **Por quê do IPv6:** sem ele, quem acessa por IPv6 chega ao app com o IP do gateway do Docker (`172.x`), e aí todos os
  visitantes IPv6 dividem o mesmo limite do "Está fora do ar?" e do login do `/admin`, e o contador de visitas junta todos.
- **Conferir:** `docker ps` com Coolify de pé; o teste de cabeçalhos do B9.8 por IPv6 mostra o IPv6 real.
  Se não der certo, **não publicar AAAA** (o site funciona só com IPv4) e anotar em `decisoes.md`.

### A7. Coolify: atualizar, painel com domínio, ajustes 🤖 (pela API/SSH) ou 👤 (roteiro)
1. Settings → Update: atualizar o Coolify para a última versão estável.
2. DNS 🤖: `painel.criasite.app` A `189.24.17.85` e AAAA `2a02:4780:c6:654a::1` (TTL 300) — nome conforme a decisão 6.
3. Settings → Instance Domain: `https://painel.criasite.app`. Esperar o certificado. Conferir que o terminal web e as
   atualizações em tempo real funcionam pelo domínio.
4. Tirar a regra `TCP 8000` do firewall.
5. Servers → localhost: **Concurrent builds = 1**; Docker cleanup ligado (limite de disco 80%); timezone do servidor `UTC`.
6. Settings → "Do not track"/telemetria: desligar se houver.
- **Conferir:** `https://painel.criasite.app` abre com cadeado; `http://189.24.17.85:8000` não conecta de nenhum lugar.

### A8. GitHub 👤
Sources → GitHub App → instalar o app do Coolify na conta `evssousa` com acesso aos repositórios dos 4 sites (pode
escolher "All repositories" ou marcar os 4). É o que dá o auto-deploy a cada push (webhook).
- **Conferir:** o Coolify lista `evssousa/criasite` ao criar uma aplicação.

### A9. MariaDB compartilhado 🤖
1. Antes, ver a versão da origem (B5.1). Projeto `bancos` no Coolify → New resource → MariaDB, imagem `mariadb:<LTS>`
   (10.11, 11.4 ou 11.8: a LTS **igual ou mais nova** que a da origem), nome `mariadb-sites`.
2. **Não** marcar "Make it publicly available". Limite de memória do container: 640 MB.
3. Configuração personalizada (campo "Custom MariaDB Configuration"):
   ```ini
   [mysqld]
   character-set-server = utf8mb4
   collation-server = utf8mb4_unicode_ci
   default-time-zone = '+00:00'
   innodb_buffer_pool_size = 256M
   max_connections = 80
   performance_schema = OFF
   skip-name-resolve
   ```
4. Anotar o nome interno do host (o "Internal URL" mostra `…@<uuid>:3306`): é o `DB_HOST` dos sites.
- **Conferir:** `docker exec <container> sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" -e "SELECT VERSION(), @@time_zone, @@character_set_server"'`
  (a senha sai do ambiente do container, nunca do chat). Conferir antes os nomes das variáveis com
  `docker inspect <container> --format '{{range .Config.Env}}{{println .}}{{end}}' | cut -d= -f1` (só nomes).

### A10. Backups 🤖
1. **Banco (diário):** no serviço `mariadb-sites` → Backups: agendamento `30 6 * * *` (06:30 UTC), "todos os bancos",
   manter 14 locais. Se a decisão 7 for sim, ligar o envio para o S3 grátis (Backblaze B2, 10 GB sem cartão) cadastrado
   em Storages.
2. **Imagens (semanal):** `/etc/cron.d/backup-media`:
   ```
   45 6 * * 0 root tar -czf /srv/backups/media-$(date +\%F).tar.gz -C /srv/sites . --wildcards '*/media' && find /srv/backups -name 'media-*.tar.gz' -mtime +29 -delete
   ```
   (`mkdir -p /srv/backups` antes). Com B2, trocar por `rclone sync /srv/sites b2:<bucket>/sites --include '*/media/**'`.
3. **Snapshot da Hostinger** antes de cada migração de site (A1).
- **Conferir:** rodar o backup do banco à mão no Coolify ("Backup now") e restaurar o arquivo num banco de teste
  (`criasite_restore`), comparar contagem de `posts`, apagar o banco de teste.

### A11. Pastas no servidor 🤖
`mkdir -p /srv/sites /srv/backups /root/migracao && chmod 700 /root/migracao`. Cada site usa `/srv/sites/<site>/media`.

### A12. Monitoramento 👤 (sugestão, grátis)
UptimeRobot (plano grátis, 50 monitores, a cada 5 min): um monitor HTTPS por site (`https://criasite.app/`, palavra-chave
`CriaSite`) e um para `https://painel.criasite.app`. Alertas por e-mail. Opcional: notificação do Coolify por Telegram
(deploy falhou, backup falhou). A ferramenta "Está fora do ar?" do site serve para checagem manual.

---

## Parte B — Preparar o site na VPS (módulo copiável)

Marcadores: `<site>` = `criasite`; `<dominio>` = `criasite.app`; `<repo>` = `evssousa/criasite`;
`<temp>` = `criasite.189-24-17-85.sslip.io`.

### B1. Levantamento 🤖
1. Pelo MCP: listar **os nomes** das variáveis do app Node na Hostinger (valores vêm mascarados; não tentar ler).
   Comparar com a tabela B3. Anotar se existem `GEMINI_MODEL`, `DB_POOL`, `ADSENSE_CLIENT`, `MEDIA_DIR`.
2. Listar a zona DNS e **salvar os registros atuais** de `@` e `www` neste doc (seção E) para a volta.
   Procurar registro **CAA**: se existir e não incluir `letsencrypt.org`, adicionar `0 issue "letsencrypt.org"`.
3. Listar os Cron Jobs (nomes e horários) se o MCP tiver a operação.
- **Conferir:** seção "Específico do site" preenchida.

### B2. Código: Dockerfile e comentários 🤖
`Dockerfile` (raiz):
```dockerfile
# Imagem de produção para a VPS (Coolify). A Hostinger gerenciada ignora este arquivo.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# --include=dev: o build precisa dos tipos e o Coolify pode passar NODE_ENV=production no build.
RUN npm ci --include=dev --no-audit --no-fund
COPY . .
ARG VITE_SITE_URL=https://criasite.app
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build && npm prune --omit=dev && node -e "require('sharp')"

FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000 MEDIA_DIR=/data/media
COPY --from=build --chown=node:node /app ./
RUN mkdir -p /data/media && chown node:node /data/media
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/robots.txt >/dev/null || exit 1
CMD ["node", "server.js"]
```
`.dockerignore`:
```
node_modules
build
.git
.github
.env
.env.*
!.env.example
docs
*.log
.react-router
```
Se não existir `package-lock.json` no repo, parar e avisar (o `npm ci` exige). Atualizar os comentários da tabela
"Arquivos afetados". `npm run build` local antes do commit. Commit `chore: Dockerfile para a VPS (Coolify)` e push
(a Hostinger continua fazendo deploy normal: o Dockerfile não muda nada lá).
- **Conferir:** deploy da Hostinger após o push termina "completed" (`hosting_get-deployment`) e o site segue igual.

### B3. Variáveis 🤖 + 👤
| Variável | Obrigatória? | Valor na VPS | Quem |
|---|---|---|---|
| `DB_HOST` | sim | nome interno do `mariadb-sites` (A9.4) | 🤖 |
| `DB_PORT` | não (3306) | `3306` | 🤖 |
| `DB_NAME` | **sim** (sem ela o site mostra os dados de exemplo, sem erro) | `criasite` | 🤖 |
| `DB_USER` | **sim** | `criasite` | 🤖 |
| `DB_PASSWORD` | sim | nova, gerada (B4) | 🤖 |
| `CRON_TOKEN` | sim para o robô (mín. 24) | novo, gerado (64 hex) | 🤖 |
| `SESSION_SECRET` | sim para o /admin (mín. 32) | novo, gerado (desloga o admin, ok) | 🤖 |
| `ADMIN_EMAIL` | sim para o /admin | o mesmo de hoje | 👤 |
| `ADMIN_PASSWORD_HASH` | sim para o /admin | gerar de novo com `npm run admin:hash` (formato com `:`, sem `$`) | 👤 |
| `GEMINI_API_KEY` | sim para o robô escrever | a mesma chave | 👤 |
| `GEMINI_MODEL` | não | só se existir hoje (B1) | 👤 |
| `ADSENSE_CLIENT` | não | só se existir hoje (B1) | 👤 |
| `VITE_SITE_URL` | não (padrão `https://criasite.app`) | `https://criasite.app`, marcada como **Build Variable** | 🤖 |
| `MEDIA_DIR`, `PORT`, `NODE_ENV` | — | já no Dockerfile; **não** cadastrar | — |
| `API_KEY`, `DB_POOL` | não usadas / opcional | não cadastrar | — |

Como entram sem passar pelo chat:
1. 🤖 Gera no PC, sem imprimir, o arquivo `projetos\_segredos\<site>-vps.env` já com `DB_*`, `CRON_TOKEN`,
   `SESSION_SECRET`, `VITE_SITE_URL` e as linhas vazias `ADMIN_EMAIL=`, `ADMIN_PASSWORD_HASH=`, `GEMINI_API_KEY=` (e as
   opcionais que existirem). Exemplo (PowerShell): `[Convert]::ToHexString((1..32|%{Get-Random -Max 256})).ToLower()`
   gravado direto com `Add-Content`, nada na saída.
2. 👤 Abre o arquivo no Bloco de Notas, preenche as 3 a 5 linhas vazias, salva.
3. 🤖 (com o token de API) envia o arquivo para o app pelo endpoint de variáveis em lote do Coolify, por script que não
   mostra o conteúdo; ou 👤 cola o arquivo inteiro em Environment Variables → "Developer view" e salva.
4. Só `VITE_SITE_URL` marcada como Build Variable (segredos nunca como build: ficariam gravados na imagem).
5. 👤 Depois da virada, apagar o arquivo (ou guardar no gerenciador de senhas).
- **Conferir:** no Coolify aparecem os nomes; `/admin` sem a lista de "problemas" na tela de login (ela mostra só nomes).

### B4. Banco e usuário do site 🤖
Script em `/root/migracao/criar-banco.sh` que lê a senha do `.env` enviado por `scp` para `/root/migracao/<site>.env`
(chmod 600), sem ecoar:
```bash
set -a; . /root/migracao/criasite.env; set +a
docker exec -i <mariadb> sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD"' <<SQL
CREATE DATABASE IF NOT EXISTS criasite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'criasite'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON criasite.* TO 'criasite'@'%';
FLUSH PRIVILEGES;
SQL
```
(Não rodar com `bash -x`.) Apagar `/root/migracao/criasite.env` depois da virada.
- **Conferir:** `SHOW GRANTS FOR 'criasite'@'%'` só tem `criasite.*`.

### B5. Ensaio do banco 👤 + 🤖
1. 👤 phpMyAdmin do hPanel (banco do criasite) → anotar a **versão do servidor** que aparece na página inicial
   (ex.: "Servidor: MariaDB 11.x") → Exportar → **Personalizado**: formato SQL; todas as tabelas; estrutura e dados;
   **marcar** "Adicionar DROP TABLE"; **desmarcar** "CREATE DATABASE / USE"; conjunto de caracteres `utf8mb4`;
   compressão: nenhuma. Salvar em `projetos\_migracao\criasite-ensaio.sql` (fora de qualquer repositório; o arquivo tem
   dados de visitas e não pode ir para o GitHub).
2. 🤖 `scp` para `/root/migracao/`, conferir cabeçalho (`head -30`: versão, `SET time_zone = "+00:00"`), procurar
   `USE \``, `CREATE DATABASE`, `DEFINER` e collation `uca1400` (`grep -c`). Se houver `uca1400`, o MariaDB alvo tem de ser 11.8.
3. 🤖 Importar: `docker exec -i <mariadb> sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" criasite' < /root/migracao/criasite-ensaio.sql`.
4. 🤖 Conferir: `SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1` = `013_links_leva3`;
   `SELECT COUNT(*)` de `posts`, `feeds`, `feed_items`, `cron_runs` e das `visit_*` (anotar para comparar na virada).

### B6. Ensaio das imagens 🤖
```bash
mkdir -p /srv/sites/criasite/media
grep -oE '/media/[A-Za-z0-9._/-]+' /root/migracao/criasite-ensaio.sql | sort -u > /root/migracao/media.txt
wc -l /root/migracao/media.txt
cd /srv/sites/criasite/media
while read -r p; do f="${p#/media/}"; [ -s "$f" ] && continue; mkdir -p "$(dirname "$f")"
  curl -fsS --retry 3 -o "$f" "https://criasite.app$p" || echo "FALHOU $p"; done < /root/migracao/media.txt
chown -R 1000:1000 /srv/sites/criasite/media
```
- **Conferir:** número de arquivos = linhas do `media.txt` (menos as `FALHOU`; cada `FALHOU` precisa de explicação:
  404 também no site antigo = imagem já quebrada hoje, anotar). `du -sh` anotado.

### B7. Aplicação no Coolify 🤖 (API) ou 👤 (roteiro)
Projeto `<site>` → New resource → Private Repository (GitHub App) → `<repo>`, branch `main`:
- Build Pack: **Dockerfile**; porta exposta `3000`.
- Domínios: **só** `https://<temp>` (nada de `<dominio>` ainda).
- Healthcheck: ligado, caminho `/robots.txt`, porta 3000.
- Persistent Storage → Directory mount: origem `/srv/sites/criasite/media`, destino `/data/media`.
- Limites: memória 768 MB.
- Auto Deploy: ligado (os dois lados fazem deploy do mesmo código até a virada, sem problema).
- Variáveis: B3.
- Destination: a mesma rede do `mariadb-sites` (padrão `coolify`).
- **Sem** tarefas agendadas por enquanto (o banco do ensaio é cópia; o robô real continua na Hostinger).
Deploy. Anotar o tempo do build e o pico de memória (`free -m` / `docker stats` durante o build).
- **Conferir:** log do container com `[migrate] banco atualizado` (nenhuma migration aplicada, porque o dump já tem
  todas) e `[criasite] ouvindo na porta 3000`; healthcheck "healthy".

### B8. Tarefas agendadas preparadas (não criar ainda) 🤖
Comando de cada tarefa (roda dentro do container do app; `$CRON_TOKEN` vem do ambiente dele):
| Nome | Cron (UTC) | Comando |
|---|---|---|
| coletar | `10,40 * * * *` | `curl -fsS -H "x-cron-token: $CRON_TOKEN" http://127.0.0.1:3000/api/cron/coletar` |
| publicar | `50 * * * *` | `curl -fsS -H "x-cron-token: $CRON_TOKEN" http://127.0.0.1:3000/api/cron/publicar` |
| limpeza | `0,30 7 * * *` | `curl -fsS -H "x-cron-token: $CRON_TOKEN" http://127.0.0.1:3000/api/cron/limpeza` |
Se o Coolify não expandir `$CRON_TOKEN` (a 1ª execução volta 404), trocar por `sh -c '…'` ou usar cron do servidor com
`docker exec $(docker ps -qf "name=<uuid do app>") sh -c 'curl … -H "x-cron-token: $CRON_TOKEN" …'`.
Horários dos outros sites: manter os desencontros que já existem nos irmãos (copiar do `deploy-hostinger.md` de cada um).

### B9. Checklist do ensaio em `https://<temp>` 🤖 (tudo tem de passar antes de marcar a virada)
Atalho: `T=https://criasite.189-24-17-85.sslip.io`.
1. **Páginas (200 e conteúdo real, não o de exemplo):** `/`, `/ferramentas`, 3 ferramentas, `/noticias`, `/google`,
   `/guias`, 1 notícia e 1 guia reais, `/trilha`, `/criar-site-com-ia`, `/busca?q=seo`, `/anuncie`, `/mapa-do-site`,
   `/privacidade`; uma página que não existe dá 404. Conferir que os títulos das notícias na home batem com
   `https://criasite.app/`.
2. **SEO:** `curl -s $T/sitemap.xml | grep -c '<loc>'` igual ao do site antigo; `/robots.txt` igual; canonical das
   páginas aponta para `https://criasite.app/…` (vem do `VITE_SITE_URL`).
3. **/media:** loop no `media.txt` contra `$T` → todos 200; `cache-control` com `max-age=31536000, immutable`.
4. **Cabeçalhos:** HTML com `content-encoding: gzip` ou `br` (`curl -sI -H 'Accept-Encoding: gzip' $T/`); `/assets/*`
   com `immutable`; `/api/v` e `/admin` com `X-Robots-Tag: noindex, nofollow` e `no-store`.
5. **/admin:** login com a senha nova; abrir `/admin/materias`, `/admin/fontes`, `/admin/visitas`. Não editar nada que
   precise sobreviver (o banco do ensaio será substituído).
6. **Robô (dentro do container, sem token na tela):**
   `docker exec <app> sh -c 'curl -s -H "x-cron-token: $CRON_TOKEN" "http://127.0.0.1:3000/api/cron/diag?wait=1"'`
   (Gemini ok), `coletar?wait=1` (pautas novas, sem erro de rede), `publicar?dry=1&wait=1` (gera sem gravar),
   `limpeza?wait=1`, `status`. As fontes que davam 403 na Hostinger podem passar a funcionar (o IP mudou): anotar.
7. **Visitas:** abrir 2 páginas no navegador em `$T` → `/admin/visitas` "Hoje" sobe.
8. **IP real:** `cabecalhos` tem de ser chamado **de fora** (do PC), não de dentro do container. Script PowerShell no
   scratchpad que lê o `CRON_TOKEN` do `_segredos\criasite-vps.env` para uma variável e chama
   `Invoke-RestMethod "$T/api/cron/cabecalhos" -Headers @{ 'x-cron-token' = $tok }` (o comando mostrado só tem o nome
   da variável; nunca imprimir `$tok`). Esperado:
   `xff` = IP do PC do dono (IPv4); repetir com `curl -6` se o PC tiver IPv6 (esperado o IPv6 real, não `172.x`/`fd00:`).
   Repetir enviando `-H "X-Forwarded-For: 1.2.3.4"`: o Traefik tem de **descartar** o valor forjado (se o `1.2.3.4`
   aparecer como primeiro valor, o login e as visitas usariam IP forjado: registrar em `decisoes.md` e planejar trocar
   `clientIp`/`ipDe` para o último valor, como em `limits.server.ts`).
9. **Está fora do ar?:** checar `https://google.com` e `https://criasite.app` pela tela → respostas certas.
10. **Redirecionamentos:** `http://$T` → https (Coolify "Force HTTPS"); `www` será testado na virada.
11. **Tempo:** `curl -o /dev/null -s -w '%{time_starttransfer}\n' $T/` 5 vezes; anotar média (esperado < 0,5 s) e
    comparar com o site antigo.
12. **Deploy sem queda:** fazer um push trivial (ex.: comentário) e, durante o deploy, rodar
    `while true; do curl -s -o /dev/null -w '%{http_code}\n' $T/; sleep 1; done`: nenhum 502/503.
13. **Reinício:** `docker restart <app>` e reboot da VPS (`reboot`) → tudo volta sozinho em < 3 min.
14. **Recursos:** `free -m`, `docker stats --no-stream`; app < 300 MB parado.

---

## Parte C — Janela de virada (módulo copiável)

Marcar com o dono um horário de ~1 h em que ele esteja disponível (decisão 8). Começar aos **:52** de uma hora
(depois do `publicar` das :50 e antes do `coletar` das :10).

| # | Quem | Passo | Conferir |
|---|---|---|---|
| C1 | 🤖 | Snapshot da VPS. Avisar o dono: não editar nada no `/admin` antigo até o fim | snapshot criado |
| C2 | 👤 (ou 🤖, se o MCP tiver) | **Desligar** os 3 Cron Jobs do criasite no hPanel (desativar, não apagar) | 🤖 `/api/cron/status` antigo não mostra execução nova depois do horário |
| C3 | 🤖 | Esperar o `publicar` das :50 terminar | status antigo: última execução `publicar` com fim |
| C4 | 👤 | Dump final pelo phpMyAdmin, igual ao B5.1 → `projetos\_migracao\criasite-final.sql` | arquivo salvo, avisar no chat |
| C5 | 🤖 | `scp`; `DROP DATABASE criasite; CREATE DATABASE …` (mesma collation); importar; contagens (B5.4) ≥ as do ensaio | `schema_migrations` = 013; `posts` igual ao `<loc>` de notícias/guias do sitemap antigo |
| C6 | 🤖 | Imagens novas: repetir o B6 com o dump final (o loop pula as que já existem) | 0 `FALHOU` novos |
| C7 | 🤖 | `docker restart <app>`; repetir B9 itens 1, 3 e 5 em `$T` | ok |
| C8 | 🤖 | **DNS:** `@` ALIAS → `A 189.24.17.85` + `AAAA 2a02:4780:c6:654a::1`; `www` CNAME → `A` + `AAAA` iguais; TTL 300. (AAAA só se o A6/B9.8 deu certo.) Não tocar em MX, SPF, DKIM, DMARC, autodiscover, autoconfig, TXT do Google, `ftp` | `dig +short criasite.app @ns1.dns-parking.com` e `@8.8.8.8` e `@1.1.1.1` = IP da VPS |
| C9 | 🤖 | Só depois do C8 nos 3 resolvedores: no app do Coolify, domínios `https://criasite.app,https://www.criasite.app` (manter o `<temp>` por 7 dias) e **Redeploy** (reaproveita a imagem do mesmo commit) | log do Traefik sem erro ACME; `openssl s_client -connect 189.24.17.85:443 -servername criasite.app` emissor Let's Encrypt, nomes apex e www |
| C10 | 🤖 | Checklist da virada (abaixo) | tudo ok |
| C11 | 🤖 | Criar as 3 tarefas agendadas (B8) e rodar `coletar` uma vez à mão | `status` com `coletar` ok |
| C12 | 🤖 | Avisar o dono que acabou; ele abre o site e o `/admin` no celular (4G) e no PC | dono confirma |

**Checklist da virada (C10), contra `https://criasite.app` resolvido para a VPS** (do PC, usar
`curl --resolve criasite.app:443:189.24.17.85` se o DNS local ainda estiver velho):
- B9 itens 1 a 7 e 11 no domínio real.
- `http://criasite.app/x` → 301/308 para `https://criasite.app/x`; `https://www.criasite.app/x` → 301 para
  `https://criasite.app/x`; `http://www.criasite.app/x` → chega em `https://criasite.app/x` em no máximo 2 saltos.
- IPv6: `curl -6 -sI https://criasite.app/` (do VPS para fora não vale; usar um verificador externo de IPv6 ou o PC).
- Search Console: "Inspeção de URL → Testar URL publicada" na home (👤, opcional) volta 200.
- E-mail: `dig MX criasite.app` igual a antes; 👤 manda e recebe um e-mail de teste em `contato@criasite.app`.

**Janela sem HTTPS:** entre o C8 e o C9 (poucos minutos), quem já recebeu o IP novo vê erro de certificado (o `.app`
não deixa pular). Quem ainda tem o DNS velho continua vendo o site antigo (congelado, mas funcionando). Por isso o C9
vem imediatamente depois de o DNS responder nos 3 resolvedores, e o TTL de 300 já está baixo.

---

## Parte D — Depois da virada (módulo copiável)

- **Primeiras 2 h** 🤖: acompanhar `coletar` (:10 e :40) e `publicar` (:50) no `status`; 1 notícia nova aparece com
  capa servida de `/media` da VPS; `docker logs --since 2h <app>` sem erro; `free -m`.
- **24 h** 🤖: backup diário do banco rodou; `limpeza` das 7h rodou; `/admin/visitas` com o dia contando; certificado
  com renovação agendada (Traefik renova sozinho aos 60 dias).
- **7 dias** 🤖: subir o TTL de `@` e `www` para 3600; tirar o domínio `<temp>`; apagar `/root/migracao/*.sql` e
  `/root/migracao/criasite.env`; 👤 apagar `projetos\_migracao\criasite-*.sql`; atualizar `deploy-vps.md`, marcar
  `deploy-hostinger.md` como histórico; README e decisões.
- **Site antigo na Hostinger:** fica parado do jeito que está (crons desligados, app no ar) por **14 dias** como volta.
  Depois, 🤖 desliga o auto-deploy do Git lá. **Não apagar o site do hPanel** antes de exportar a zona DNS e conferir
  que a exclusão não mexe nos registros. O cancelamento do Cloud Startup é 👤 e só depois que os 4 sites saírem **e**
  depois de resolver o e-mail (Riscos, item 1).

## Parte E — Volta (rollback; módulo copiável)

Quando usar: certificado não sai em 30 min, erro grave sem conserto rápido, perda de dado detectada.
1. 🤖 DNS de volta aos valores salvos (B1.2). Para o criasite: `@` **ALIAS `criasite.app.cdn.hstgr.net`** e
   `www` **CNAME `www.criasite.app.cdn.hstgr.net`**, TTL 300; apagar os A/AAAA criados.
2. 🤖 Pausar as tarefas agendadas do Coolify (para não publicar em dobro).
3. 👤 (ou 🤖) Religar os 3 Cron Jobs no hPanel.
4. Se o VPS já tiver gravado algo novo (notícia, edição no painel), 🤖 lista o que é (`posts` com `created_at`/
   `updated_at` depois do C4) e, se precisar, exporta só essas linhas para o dono importar pelo phpMyAdmin.
5. Anotar a causa em `decisoes.md` e marcar nova janela.

---

## Parte F — Específico do criasite

- Registros para a volta: `@` ALIAS `criasite.app.cdn.hstgr.net` (TTL 300); `www` CNAME `www.criasite.app.cdn.hstgr.net` (TTL 300).
- E-mail `contato@criasite.app` continua na Hostinger (MX/SPF/DKIM/DMARC intocados).
- TXT do Google `H8ZjO9tf…` fica.
- Crons de hoje: `10,40 * * * *` coletar, `50 * * * *` publicar, `0,30 7 * * *` limpeza.
- Última migration: `013_links_leva3`.
- Variáveis existentes na Hostinger (preencher no B1): …
- Versão do MariaDB da origem (preencher no B5.1): …
- Tempo de build e pico de memória (preencher no B7): …

## Parte G — Para os próximos sites

- **respawnou e vibecoin:** mesmo padrão Express (`server.js`/`server-app.js`); copiar Partes B a F, o `Dockerfile` e o
  `.dockerignore` (trocar o `VITE_SITE_URL` padrão). Conferir nomes de variáveis e horários de cron próprios.
- **animeprofile:** **não** é cópia direta (ainda há Supabase/Lovable em parte do site): precisa de plano próprio antes,
  usando este como base.
- Ordem sugerida: um site por vez, com pelo menos 2 dias entre um e outro olhando memória (`free -m`, `docker stats`).
- **Se os builds pesarem** (site lento durante deploy ou build passando de 6 min): construir a imagem no GitHub Actions
  (grátis em repositório público) e publicar no GHCR; no Coolify, trocar o app para "Docker Image" e disparar o deploy
  pelo webhook do Coolify no fim do workflow.
- Ao 4º site, conferir RAM: se a sobra ficar abaixo de 500 MB, baixar `innodb_buffer_pool_size`/limites ou considerar
  o KVM 2 (decisão do dono).

---

## Riscos e cuidados

1. **E-mail some com o plano:** se a caixa `contato@criasite.app` (e as dos irmãos) for o e-mail grátis que vem com o
   Cloud Startup, cancelar o plano apaga as caixas. Antes do cancelamento, confirmar no hPanel de qual plano o e-mail
   faz parte (pergunta 2). A migração do site não depende disso.
2. **Coolify sem conta de admin** (A0): qualquer um vira dono do painel. Fazer hoje.
3. **ufw não protege portas do Docker:** usar o firewall da Hostinger (A5). Nunca marcar o MariaDB como público.
4. **Site sobe com dados de exemplo** se `DB_NAME`/`DB_USER` faltarem (não dá erro): o checklist confere conteúdo real.
5. **Robô publicando em dobro:** crons da Hostinger desligados (C2) **antes** de criar os do Coolify (C11); no ensaio, nenhuma
   tarefa agendada.
6. **Limite de falhas do Let's Encrypt:** `criasite.app` só entra no Coolify depois do DNS (C9). Se falhar, ver o log do
   Traefik, corrigir e tentar de novo uma vez; se não resolver em 30 min, volta (Parte E).
7. **CAA no DNS** bloqueando o Let's Encrypt: conferido no B1.
8. **IPv6 com IP do gateway do Docker:** resolvido no A6; se não der, sem AAAA.
9. **Build no 1 vCPU:** swap (A3), 1 build por vez (A7), limite de memória por app; deploy sem queda pelo healthcheck.
10. **Versão/collation do banco:** alvo LTS ≥ origem; `uca1400` no dump exige 11.8.
11. **Fuso:** MariaDB em `+00:00` e o app com `timezone: "Z"`; conferir que as datas das notícias no site novo batem com o antigo.
12. **Segredos:** nunca no chat, nunca em linha de comando expandida, nunca como Build Variable; arquivos de migração fora
    dos repositórios; dumps apagados em 7 dias.
13. **Regra do `server.js`:** continua valendo (sem `await` no topo, `NODE_ENV` definido antes de carregar o React).
14. **`npm run build` antes de cada push**; commit+push ao terminar cada parte.
15. **Disco:** imagens antigas do Docker acumulam; Docker cleanup do Coolify ligado (A7).
16. **Migrations novas** continuam rodando sozinhas no início do container; SQL novo também vai colado no chat (regra do dono).

## Como verificar (resumo)

- Fim da Parte A: `free -m` (swap 4 GB), firewall com só 22/80/443, painel em `https://painel.criasite.app` com 2FA,
  8000 fechada, backup de teste restaurado.
- Fim da Parte B: os 14 itens do B9 passam em `https://criasite.189-24-17-85.sslip.io`.
- Fim da Parte C: checklist C10 no domínio real + 1ª coleta e 1ª publicação pelo Coolify.
- Fim da Parte D: 7 dias sem erro, backups diários, TTL 3600.

---

## Parte H — Decisões do dono (com a recomendação)

1. **Coolify ou stack manual?** → **Coolify** (tela para o dono, SSL e deploy prontos; Claude opera por SSH/API).
2. **Um MariaDB para os 4 sites ou um por site?** → **Um só**, com banco e usuário por site (economiza ~300 MB por site).
3. **Como tirar o dump?** → **phpMyAdmin pelo dono** (2 vezes: ensaio e final; ~3 min cada). Sem senha no chat e sem
   derrubar o site antigo.
4. **Testar antes num endereço temporário (sslip.io)?** → **Sim** (tudo testado com HTTPS de verdade antes do DNS).
5. **Dar ao Claude um token de API do Coolify (arquivo local, nunca no chat)?** → **Sim** (o dono só cria a conta, instala o
   GitHub App e preenche 3 a 5 linhas de segredo; o resto o Claude faz).
6. **Endereço do painel do Coolify:** → **`painel.criasite.app`** (com 2FA; porta 8000 fechada).
7. **Backup fora da VPS (Backblaze B2 grátis, 10 GB, sem cartão)?** → **Sim**, para banco diário e imagens; sem ele, a perda
   da VPS leva os backups junto (sobram só os backups da Hostinger, se o plano tiver).
8. **Horário da virada:** → um dia útil, começando às **XX:52**, numa hora em que o dono fique 1 h disponível
   (sugestão: 09:52 de Brasília = 12:52 UTC).
9. **IPv6 (AAAA):** → **publicar só se o teste do IP real passar** (A6/B9.8); senão, só IPv4 por enquanto.
10. **Reinício automático da VPS para atualizações de segurança (03:15 de Brasília):** → **Sim**.
11. **Quando desligar o antigo:** → manter o criasite parado na Hostinger por **14 dias**; cancelar o Cloud Startup só depois
    que os 4 sites saírem e o e-mail estiver garantido.
12. **UptimeRobot grátis:** → **Sim** (sugestão; o dono cria a conta).

## Perguntas em aberto

1. As decisões da Parte H (todas com recomendação).
2. A caixa `contato@criasite.app` (e as dos outros sites) faz parte do Cloud Startup ou de um plano de e-mail separado?
   (Decide se cancelar o plano apaga os e-mails.)
3. O dono lembra se cadastrou `GEMINI_MODEL` ou `ADSENSE_CLIENT` no hPanel? (O B1 confere os nomes; é só para adiantar.)


## Andamento

**2026-11-25 (Claude)**
- A0: conta do Coolify criada pelo dono (confirmado). Porta 8000 liberada só para o IP do PC do dono no firewall.
- A1: snapshot criado (antes de qualquer mudança).
- A2: `apt upgrade`, `unattended-upgrades` com reinício às 06:15 UTC, `fail2ban`. Reiniciado para o kernel novo (volta em ~20 s; Coolify sobe sozinho).
- A3: swap de 4 GB, `swappiness=10`.
- A4: SSH só por chave. O arquivo teve de ser `00-endurecer.conf`: o `50-cloud-init.conf` da imagem liga `PasswordAuthentication yes` e, no sshd, vale o primeiro valor lido. Login por senha recusado (conferido).
- A5: firewall da Hostinger `vps-sites` ativo: 22, 80, 443 TCP, 443 UDP abertas; 8000 só do IP do dono. 6001/6002 fechadas (conferido de fora).
- A6: o `daemon.json` do Coolify já limita logs (10 MB × 3) e a rede `coolify` já tem IPv6. Docker 29.10. O teste do IP real fica no B9.8.
- A7.2: DNS `painel.criasite.app` A 189.24.17.85 criado. API do Coolify ainda desligada.
- A11: pastas `/srv/sites`, `/srv/backups`, `/root/migracao` criadas.
- B1: variáveis na Hostinger: as 11 da tabela B3 (sem `GEMINI_MODEL`, `ADSENSE_CLIENT`, `API_KEY`, `DB_POOL`, `MEDIA_DIR`). Não há CAA na zona.
- B2: `Dockerfile` e `.dockerignore` no repo (commit `a6c5b4c`). Build na VPS: 26 s, imagem de 548 MB; container de teste sem banco respondeu 200 em 0,05 s com 48 MB de RAM.
- B3.1: `projetos\_segredos\criasite-vps.env` gerado com DB_PASSWORD, CRON_TOKEN e SESSION_SECRET novos; faltam 3 linhas do dono. `DB_HOST` é preenchido depois do A9.
