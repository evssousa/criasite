# Migração dos WordPress para a VPS (eversonsousa.com.br e levelcards.com.br)

Status: 🚫 **cancelado em 2026-11-26** — o dono vai recriar os 2 sites em React. Em vez de migrar, os sites foram
**baixados como referência** para `projetos/sites-recriar/` (banco, imagens, tema filho, HTML e capturas). Falta: apagar os
sites do hPanel (com o ok do dono), tirar a chave SSH da hospedagem e a `/root/.ssh/hostinger_cloud` + `Host hostinger` da VPS.
O resto deste documento fica como histórico (e como base se um WordPress precisar ir para a VPS no futuro). A base da VPS
(Parte A de [migracao-vps.md](migracao-vps.md)) já está pronta e **não se repete**. Este plano segue o formato das
Partes B a F de lá e vale as "Lições do criasite" (citadas como "lição N").

Decisão do dono (2026-11-26): **migram só 2 WordPress**: a raiz de `eversonsousa.com.br` e `levelcards.com.br`.
`/site0` e `/karkaraceara` eram testes e **ficam de fora** (pastas excluídas da cópia; bancos não vão para a VPS).

## Objetivo

Levar os 2 WordPress do Cloud Startup (conta `u218539700`) para a VPS (Coolify em `painel.criasite.app`), com HTTPS,
backup e sem perder conteúdo, para o dono poder cancelar o plano de hospedagem.

## Contexto

- **Origem:** hospedagem `u218539700` (Cloud Startup), MariaDB 11.8.9 (srv1572). Os bancos estão **sem escrita desde
  2026-01-23**: sites parados, o que permite **um só dump** (ensaio = final, com conferência na virada).
  | Domínio | Instalação | Banco na origem | Tamanho | Hoje |
  |---|---|---|---|---|
  | `eversonsousa.com.br` (vhost principal) | raiz "Everson Sousa"; siteurl `http://` (sem https) | `u218539700_eversonsousa` | 60 MB | 200 em 1,1 s |
  | `levelcards.com.br` (addon) | raiz "Level Cards" | `u218539700_uwetu` | 347 MB | 200 em 5 s |
  Fora da migração: `/site0` (`u218539700_evs_site0`, 23 MB, já dá 500), `/karkaraceara` (`u218539700_karkaraceara`,
  10 MB). O banco órfão `u218539700_L0t3O` (580 MB, sem domínio) foi **apagado em 2026-11-26** a pedido do dono.
- **DNS hoje:** eversonsousa `@` A 84.32.84.68 e 2.57.91.60, MX mx1/mx2.hostinger.com; levelcards `@` A 145.79.55.225 e
  145.79.52.84, MX mx1/mx2.hostinger.com.br.
- **VPS:** 3,9 GB RAM (~1,65 GB disponível), swap 4 GB, 30 GB livres; Coolify, `mariadb-sites`
  (uuid `djg6eojhrivnayhax7ohoszd`, 11.8.9, backup diário de todos os bancos) e 4 apps Node.
- **Limite da API da Hostinger:** não baixa arquivos nem bancos. Por isso o caminho recomendado é SSH da hospedagem
  (pergunta 1).

## Decisões técnicas (resumo)

1. **1 app do Coolify por domínio**, do tipo **Dockerfile sem Git** (Dockerfile colado, B4), a partir da imagem oficial
   `wordpress:php<versão>-apache` (já traz mysqli, gd, imagick, zip, intl, opcache e `mod_remoteip` configurado para
   proxy). O código do site é a **cópia do public_html** montada de `/srv/sites/<dominio>/html` em `/var/www/html`
   (o entrypoint da imagem não toca em pasta que já tem WordPress). Limite **256 MB** por container, Apache com no
   máximo 5 processos. **Não** usar o modelo "WordPress" do Coolify: ele cria um MariaDB por site (~150 a 300 MB cada).
2. **Banco no `mariadb-sites`**, um banco + um usuário por site, nomes sem o prefixo: `eversonsousa` e `levelcards`.
   Senhas novas geradas **na VPS**, gravadas só no `wp-config.php` (que é o único lugar onde o WordPress as lê).
3. **PHP igual ao da origem** (descoberto no B1). Se a imagem oficial não tiver mais essa versão (ex.: 8.1), usar a
   menor disponível acima dela e o ensaio decide.
4. **Dados por SSH da hospedagem** (pergunta 1): `rsync` dos arquivos e `wp db export` em fluxo, direto
   hospedagem → VPS, com as credenciais lidas pelo wp-cli no próprio servidor (nada no chat, nada no PC).
5. **Ensaio sem mexer no banco:** no `wp-config.php`, `WP_HOME`/`WP_SITEURL` só quando o acesso vier pelo endereço
   `<site>.189-24-17-85.sslip.io` (B7). O banco já fica com a URL real; o domínio real só entra no Coolify depois do DNS.
6. **WP-Cron padrão do WordPress** (dispara nas visitas). Sites parados não precisam de tarefa agendada no Coolify.
7. **Ordem: levelcards primeiro.** É 1 instalação sem troca de URL (se o B1 confirmar `https` no siteurl) e com o banco
   maior: se a RAM do `mariadb-sites` ou o PHP antigo derem problema, aparece logo. O eversonsousa vem depois (pelo menos
   1 dia), já com o módulo testado, mais a troca `http://` → `https://`.

## Arquivos afetados

Nenhum repositório muda (WordPress não tem Git aqui). Na VPS:

| Caminho | O que é |
|---|---|
| `/srv/sites/levelcards.com.br/html`, `/srv/sites/eversonsousa.com.br/html` | cópia do public_html (dono `33:33`, www-data) |
| `/root/migracao/<site>.sql.gz` | dump (apagar 7 dias depois da virada) |
| `/root/migracao/<site>-db.env` | senha nova do banco (chmod 600; apagar depois da virada) |
| `/root/.ssh/hostinger_pull` | chave só para puxar da hospedagem (apagar no fim) |
| `/etc/cron.d/backup-wordpress` | backup semanal dos arquivos (B10) |
| apps no Coolify: projeto `wordpress`, apps `levelcards` e `eversonsousa` | B4/B6 |

Docs: este arquivo, `deploy-vps.md` (seção nova "WordPress" depois da virada), `README.md`, `decisoes.md`.

---

## Parte B — Preparar o site na VPS (por domínio)

Marcadores: `<dominio>` = `levelcards.com.br` | `eversonsousa.com.br`; `<site>` = `levelcards` | `eversonsousa`;
`<temp>` = `<site>.189-24-17-85.sslip.io`; `<pasta>` = caminho do public_html na hospedagem
(esperado `~/domains/<dominio>/public_html`, confirmar no B1).

### B0. Acesso SSH à hospedagem 🤖 + 👤 (uma vez, serve aos dois)
1. 🤖 Na VPS: `ssh-keygen -t ed25519 -f /root/.ssh/hostinger_pull -N '' -C vps-pull-hostinger` e mostra **só** a chave
   pública (`.pub`, pode aparecer no chat).
2. 👤 hPanel → Hospedagem → Avançado → **Acesso SSH**: ativar; em "Chaves SSH", adicionar a chave pública. Informar no
   chat o IP e a porta que a tela mostra (porta costuma ser 65002; não é segredo).
3. 🤖 Criar `/root/.ssh/config` com `Host hostinger` (HostName, Port, User `u218539700`, IdentityFile da chave).
- **Conferir:** `ssh hostinger 'whoami; which rsync wp php; php -v'` responde sem pedir senha.

### B1. Levantamento 🤖 (anotar na Parte F)
Por SSH, sem ler o `wp-config.php` para o chat (só nomes de constantes):
1. `ls -la <pasta>`; `du -sh <pasta>/* | sort -h | tail -20`; `du -sh <pasta>/wp-content/{uploads,plugins,themes,cache,litespeed,upgrade} 2>/dev/null`.
2. `wp --path=<pasta> core version`; `wp option get siteurl`; `wp option get home`; `wp plugin list --format=csv`;
   `wp theme list --status=active`; `wp db size --tables --format=csv | sort -t, -k2 -h | tail -15` (tabelas gigantes de log?).
3. PHP do site: hPanel/API (configuração PHP do site) ou `grep -i php <pasta>/.htaccess`; extensões: `php -m`.
4. `grep -E "^define|table_prefix" <pasta>/wp-config.php | sed -E "s/(DB_PASSWORD|_KEY|_SALT)'.*/\1' ***/"` (nomes,
   prefixo, `DB_CHARSET`, se já define `WP_HOME`/`WP_SITEURL`/`FORCE_SSL_ADMIN`).
5. Arquivos que não são do WordPress na raiz (`Script.zip`, `htaccess.zip`, `.htaccess.bk`, pastas estranhas, `error_log`).
6. Segurança (sites parados em hospedagem compartilhada podem estar infectados): `wp core verify-checksums`,
   `wp plugin verify-checksums --all`, `find <pasta>/wp-content/uploads -name '*.php*'`. Se aparecer arquivo alterado ou
   PHP em uploads, **parar** e listar para o dono antes de copiar.
7. DNS pela API: salvar a zona inteira (Parte F) para a volta; ver NS (Hostinger?), `www` (A ou CNAME?), AAAA e CAA.
   Ver se o **CDN da Hostinger** está ligado no site (os A atuais parecem de CDN).
- **Conferir:** Parte F preenchida.

### B2. Cópia dos arquivos 🤖
```bash
mkdir -p /srv/sites/<dominio>/html
rsync -az --info=stats1 -e ssh hostinger:<pasta>/ /srv/sites/<dominio>/html/ \
  --exclude 'wp-content/cache/' --exclude 'wp-content/litespeed/' --exclude 'wp-content/upgrade/' \
  --exclude 'wp-content/ai1wm-backups/' --exclude 'wp-content/updraft/' --exclude 'error_log' --exclude '*.log' \
  --exclude 'Script.zip' --exclude 'htaccess.zip' --exclude '.htaccess.bk' \
  --exclude 'site0/' --exclude 'karkaraceara/'          # só no eversonsousa
chown -R 33:33 /srv/sites/<dominio>/html
find /srv/sites/<dominio>/html -type d -exec chmod 755 {} + ; find /srv/sites/<dominio>/html -type f -exec chmod 644 {} +
chmod 640 /srv/sites/<dominio>/html/wp-config.php
```
Os zips soltos vão para fora do site só se o dono quiser guardar (pergunta 3).
- **Conferir:** número de arquivos de `wp-content/uploads` igual dos dois lados (`find … -type f | wc -l`); `du -sh`.

### B3. Banco e usuário 🤖
1. Gerar a senha **na VPS** sem imprimir: `umask 077; echo "DBPW=$(openssl rand -hex 24)" > /root/migracao/<site>-db.env`.
2. Criar banco/usuário como no B4 do `migracao-vps.md` (`CREATE DATABASE <site> … utf8mb4_unicode_ci`, usuário `<site>`@`%`,
   `GRANT ALL ON <site>.*`), lendo `DBPW` do arquivo. Nada de `bash -x`.
3. Dump em fluxo e importação:
   ```bash
   ssh hostinger "cd <pasta> && wp db export - --single-transaction --quick --default-character-set=utf8mb4" \
     | gzip > /root/migracao/<site>.sql.gz
   zcat /root/migracao/<site>.sql.gz | head -20; zcat … | grep -c -E 'DEFINER|^USE |CREATE DATABASE'
   zcat /root/migracao/<site>.sql.gz | docker exec -i djg6eojhrivnayhax7ohoszd sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" <site>'
   ```
   (Se `wp db export` falhar na hospedagem: plano B é o dono exportar pelo phpMyAdmin, compressão gzip.)
- **Conferir:** contagem de `posts` (por `post_type`/`post_status`), `comments`, `users`, `options` igual à da origem
  (`wp db query` dos dois lados); `SHOW GRANTS FOR '<site>'@'%'` só com `<site>.*`.

### B4. Dockerfile (igual para os dois; só muda a versão do PHP) 🤖
```dockerfile
FROM wordpress:php8.3-apache
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN printf '%s\n' 'memory_limit=128M' 'upload_max_filesize=32M' 'post_max_size=32M' \
      'max_execution_time=60' 'expose_php=Off' > /usr/local/etc/php/conf.d/zz-site.ini
RUN printf '%s\n' \
  '<IfModule mpm_prefork_module>' ' StartServers 2' ' MinSpareServers 1' ' MaxSpareServers 3' \
  ' MaxRequestWorkers 5' ' MaxConnectionsPerChild 500' '</IfModule>' \
  'ServerTokens Prod' 'ServerSignature Off' \
  '<Files xmlrpc.php>' ' Require all denied' '</Files>' \
  '<DirectoryMatch "/wp-content/uploads">' ' <FilesMatch "\.(php[0-9]?|phtml|phar)$">' '  Require all denied' \
  ' </FilesMatch>' '</DirectoryMatch>' > /etc/apache2/conf-enabled/zz-site.conf
```
Trocar `php8.3` pela versão do B1. Não declarar `WORDPRESS_*` no ambiente (o entrypoint geraria outro wp-config).
Conferir no 1º deploy que `remoteip` está ativo (`apache2ctl -M | grep remoteip`); se não, acrescentar
`RemoteIPHeader X-Forwarded-For` + `RemoteIPTrustedProxy 10.0.0.0/8 172.16.0.0/12` e `a2enmod remoteip`.

### B5. wp-config.php 🤖
Script em `/root/migracao/` (lê `DBPW` do `<site>-db.env`; nunca mostra valores). Com wp-cli em container:
```bash
wpcli() { docker run --rm -i --network coolify --user 33:33 --env-file /root/migracao/<site>-db.env \
  -v /srv/sites/<dominio>/html:/var/www/html wordpress:cli-php8.3 "$@"; }
wpcli wp config set DB_HOST djg6eojhrivnayhax7ohoszd
wpcli wp config set DB_NAME <site>; wpcli wp config set DB_USER <site>
wpcli sh -c 'wp config set DB_PASSWORD "$DBPW" --quiet'
wpcli wp config set DISALLOW_FILE_EDIT true --raw
wpcli wp config shuffle-salts          # novas chaves: todo mundo é deslogado (ok)
```
Logo depois do `<?php`, inserir (sed, uma vez):
```php
// VPS: HTTPS atrás do proxy do Coolify
if (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') { $_SERVER['HTTPS'] = 'on'; }
// ENSAIO-VPS (apagar na virada, C5)
if (($_SERVER['HTTP_HOST'] ?? '') === '<temp>') { define('WP_HOME', 'https://<temp>'); define('WP_SITEURL', 'https://<temp>'); }
```
Se o B1 mostrou `WP_HOME`/`WP_SITEURL` já definidos, comentar os antigos. `DB_CHARSET` fica o que estava.
- **Conferir:** `wpcli wp db check` ok; `wpcli wp option get siteurl` devolve a URL real.

### B6. Limpeza do que só funciona na Hostinger 🤖
```bash
wpcli wp plugin deactivate litespeed-cache hostinger hostinger-ai-assistant --skip-plugins --skip-themes
rm -f html/wp-content/advanced-cache.php html/wp-content/object-cache.php   # drop-ins do LiteSpeed, se existirem
```
No `.htaccess`: apagar os blocos `# BEGIN LSCACHE … # END LSCACHE` e `# BEGIN NON_LSCACHE …` e qualquer `AddHandler`/
`php_value` da Hostinger; manter o bloco `# BEGIN WordPress`. (Nomes exatos dos plugins vêm do B1; desativar, não apagar.)
Tabelas de log gigantes (B1.2) só são esvaziadas com ok do dono.
- **Conferir:** `wpcli wp plugin list --status=active` sem plugins da Hostinger.

### B7. App no Coolify 🤖 (API)
Projeto `wordpress` → app `<site>`, tipo **Dockerfile** (B4 colado), porta 80, sem Git:
- Domínio: **só** `https://<temp>`, com `noindex_domains` (lição 3).
- Storage: `{"type":"file","is_directory":true,"fs_path":"/srv/sites/<dominio>/html","mount_path":"/var/www/html"}` (lição 2).
- Limite de memória 256 MB; healthcheck `/wp-includes/images/blank.gif` porta 80 (estático: não reinicia o site se o
  banco piscar); rede `coolify`.
- **Logo depois de criar: rótulos com `redirect-to-https…permanent=true`** (lição 13, senão todo http da VPS dá 503).
- **Conferir:** container "healthy"; `curl -sI http://criasite.app/x` segue 301 e `docker logs --since 2m coolify-proxy | grep ERR` vazio.

### B8. Checklist do ensaio 🤖 (+ 👤 no item 6)
`T=https://<temp>`. Do PC ou da VPS:
1. Home, 3 posts/páginas reais, 1 categoria, busca `/?s=a`, `/feed/`, `/wp-sitemap.xml` (ou o do plugin de SEO): 200 e
   títulos iguais aos do site antigo; página inexistente dá 404.
2. **Domínio real sem DNS e sem certificado** (testa o banco como ficará): da VPS,
   `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'Host: <dominio>' -H 'X-Forwarded-Proto: https' http://<ip-do-container>/`
   → 200 (nada de redirecionar para `http://` ou para outro host). Repetir em 3 posts.
3. Uploads: 20 arquivos aleatórios de `wp-content/uploads` em `$T/wp-content/uploads/...` → 200.
   (No ensaio, imagens dentro do texto dos posts ainda apontam para o domínio real, ou seja, para o site antigo: normal.)
4. Segurança: `$T/xmlrpc.php` → 403; `$T/wp-content/uploads/x.php` (arquivo de teste criado e apagado) → 403;
   `$T/wp-config.php` não mostra código.
5. `/wp-login.php` abre; `docker logs` sem `PHP Fatal`/`Deprecated` em excesso.
6. 👤 Entrar no `$T/wp-admin` com o usuário de sempre, abrir Posts, Mídia e um editor (sem salvar). Se a senha foi
   esquecida: 🤖 `wpcli wp user update <id> --user_pass=…` lendo de arquivo em `_segredos` (nunca no chat).
7. Tempo: `time_starttransfer` da home 5 vezes, comparar com o antigo (5 s no levelcards hoje).
8. Recursos: `docker stats --no-stream`, `free -m` (sobra > 800 MB com o site carregado).
9. Reboot da VPS: o site volta sozinho.

### B9. Só eversonsousa: `http://` → `https://` 🤖
Na cópia da VPS (a origem não muda):
```bash
wpcli wp search-replace 'http://eversonsousa.com.br' 'https://eversonsousa.com.br' --all-tables-with-prefix --precise --skip-columns=guid --dry-run --report-changed-only
wpcli wp search-replace 'http://www.eversonsousa.com.br' 'https://eversonsousa.com.br' --all-tables-with-prefix --precise --skip-columns=guid --dry-run --report-changed-only
```
Mostrar os números ao dono, rodar sem `--dry-run`, depois `wpcli wp cache flush`. O `wp search-replace` trata dados
serializados (por isso nada de `sed` no dump). Links para `/site0/…` e `/karkaraceara/…` dentro dos posts viram 404:
listar com `wp db search '/site0/'` e avisar o dono (não corrigir sozinho).
- **Conferir:** `wp option get siteurl` = `https://eversonsousa.com.br`; B8.2 sem redirecionamento para http.

### B10. Backup 🤖
- Banco: entra sozinho no backup diário "todos os bancos" do `mariadb-sites`. Conferir no dia seguinte que o arquivo
  do backup cresceu (~400 MB a mais sem compressão) e que o disco aguenta 14 cópias.
- Arquivos: `/etc/cron.d/backup-wordpress`:
  ```
  15 7 * * 0 root for d in levelcards.com.br eversonsousa.com.br; do tar -czf /srv/backups/wp-$d-$(date +\%F).tar.gz -C /srv/sites/$d html --exclude='html/wp-content/cache'; done; find /srv/backups -name 'wp-*.tar.gz' -mtime +29 -delete
  ```
  Rodar uma vez à mão e anotar o tamanho.

---

## Parte C — Virada (por domínio; ~30 min, sem pressa de horário)

Dados parados desde janeiro: sem congelamento nem crons para desligar.

| # | Quem | Passo | Conferir |
|---|---|---|---|
| C1 | 🤖 | Snapshot da VPS | snapshot criado |
| C2 | 🤖 | Origem não mudou: contagens do B3 de novo na hospedagem; `rsync` de novo (só diferença) | contagens iguais; se mudaram, refazer B3.3 (e B9 no eversonsousa) |
| C3 | 🤖 | DNS: apagar os **dois A** de `@` e o `www` atual (lição 9: apagar antes de criar); criar `@` A `189.24.17.85` e `www` A `189.24.17.85`, TTL 300. Sem AAAA. Não tocar em MX, SPF, DKIM, DMARC, autodiscover, TXT. Se o CDN da Hostinger estiver ligado (B1.7), desligar antes | `dig +short <dominio> @8.8.8.8` e `@1.1.1.1` = só o IP da VPS |
| C4 | 🤖 | Só depois do C3: domínios `https://<dominio>,https://www.<dominio>` (www → principal) + `<temp>`; rótulos 301 (lição 4 e 13); redeploy | certificado Let's Encrypt para apex e www; `grep ERR` do proxy vazio |
| C5 | 🤖 | Apagar o bloco `ENSAIO-VPS` do `wp-config.php` | `grep -c ENSAIO-VPS` = 0 |
| C6 | 🤖 | Checklist B8 itens 1, 3, 4, 5 no domínio real; imagens dentro dos posts agora vêm da VPS (conferir no HTML que não há `cdn.hstgr`/IP antigo) | ok |
| C7 | 🤖 | `http://<dominio>/x` → 301 `https://<dominio>/x`; `https://www.<dominio>/x` → 301 `https://<dominio>/x` | 301, no máximo 2 saltos |
| C8 | 🤖 + 👤 | `dig MX <dominio>` igual ao de antes; dono entra no `/wp-admin` real e abre o site no celular (4G) | dono confirma |

## Parte D — Depois da virada

- **Logo depois** 🤖: atualizar com backup antes (`wp db export` para `/srv/backups` + o tar do B10):
  `wp core update`, `wp plugin update --all`, `wp theme update --all`, um de cada vez e com a home testada entre eles;
  se um plugin quebrar, voltar só ele (`wp plugin install <nome> --version=<antiga> --force`). Plugin abandonado ou sem
  uso: listar para o dono decidir remover.
- **24 h** 🤖: backup diário inclui os 2 bancos; `docker stats` estável; sem `PHP Fatal` nos logs.
- **7 dias** 🤖: TTL de `@`/`www` para 3600; tirar `<temp>`; apagar `/root/migracao/<site>*` e, depois do 2º site,
  `/root/.ssh/hostinger_pull` + config; 👤 desligar o Acesso SSH no hPanel e remover a chave. Seção "WordPress" no
  `deploy-vps.md` (apps, pastas, wp-cli, backup).
- **Site antigo:** fica no hPanel o tempo da pergunta 5. Apagar (`hosting_websites_delete`) só com o "ok" do dono e
  conferir a zona e o e-mail logo depois (lição 10). Antes de apagar o eversonsousa (vhost principal da conta), os
  dumps de guarda da pergunta 2. Cancelar/reembolsar o plano é sempre o último passo, depois do e-mail (lição 11).

## Parte E — Volta

Com a origem intacta e parada, a volta é só DNS: 🤖 recolocar os A salvos na Parte F (apagar o A da VPS antes), TTL 300,
e tirar `<dominio>` do Coolify. Se algo foi editado no `/wp-admin` novo depois do C4, 🤖 exporta só esses posts
(`post_modified` depois da virada) antes de voltar. Anotar a causa em `decisoes.md`.

## Parte F — Específico de cada site (preencher no B1)

**levelcards.com.br** (1º): `<pasta>` …; PHP …; WordPress …; siteurl …; plugins ativos …; tabelas maiores …;
zona salva: `@` A 145.79.55.225 e 145.79.52.84, `www` …, MX mx1/mx2.hostinger.com.br, outros …; tamanho da cópia …;
RAM no ensaio ….

**eversonsousa.com.br** (2º): `<pasta>` …; PHP …; WordPress …; siteurl `http://eversonsousa.com.br` (vira https no B9);
plugins ativos …; zona salva: `@` A 84.32.84.68 e 2.57.91.60, `www` …, MX mx1/mx2.hostinger.com, outros …; pastas
excluídas: `site0/`, `karkaraceara/`; links internos para elas: ….

---

## Riscos e cuidados

1. **WordPress parado = alvo.** Núcleo/plugins velhos: B1.6 antes de copiar e D logo depois. Nunca expor o MariaDB.
2. **PHP mais novo que o da origem** pode quebrar plugin velho (500/tela branca): por isso a mesma versão e o ensaio;
   ver `docker logs`.
3. **RAM:** 2 containers de 256 MB + o banco de 347 MB no buffer de 256 MB. Se a sobra ficar < 500 MB, baixar
   `MaxRequestWorkers` para 3 antes de qualquer outra coisa.
4. **Lição 13:** app novo sem `permanent=true` no `redirect-to-https` derruba o http de **todos** os sites.
5. **Let's Encrypt:** domínio real só no Coolify depois do DNS (C4).
6. **Segredos:** senhas do banco geradas na VPS e só no `wp-config.php`; nada de `cat wp-config.php` no chat (B1.4 mascara).
7. **E-mail que o WordPress envia** (formulário, "esqueci a senha"): a imagem não tem `sendmail`, então `mail()` deixa
   de funcionar (pergunta 4). Os MX não mudam; as caixas são brinde do Cloud Startup e somem se o plano for cancelado.
8. **CDN da Hostinger** ligado pode reescrever o DNS: desligar antes do C3 e conferir a zona.
9. **Apagar o site principal da conta** (eversonsousa) pode mexer em mais coisa que o addon: por último e com zona exportada.

## Como verificar (resumo)

- Fim da B: B8 inteiro passa em `https://<temp>` e no teste com `Host:` real (B8.2).
- Fim da C: C6–C8 no domínio real; MX igual; dono confirma.
- Fim da D: 7 dias sem `PHP Fatal`, backup diário com os 2 bancos, tar semanal gerado, SSH da hospedagem desligado.

## Perguntas ao dono

1. **Como tirar os dados?** → **SSH da hospedagem** (você ativa no hPanel e cola a chave pública que eu mostro; ~3 min).
   Sem isso, são downloads seus pelo Gerenciador de Arquivos e phpMyAdmin (um com 347 MB+).
2. **Bancos e pastas de teste (`/site0`, `/karkaraceara`): guardar uma cópia antes de cancelar o plano?** (opcional)
   → **Sim, um dump de guarda de cada + tar das 2 pastas**, comprimidos, em `/srv/backups/arquivo/` (e cópia no seu PC
   se quiser); não vão para o banco da VPS. Sai pelo mesmo SSH, com o wp-cli de cada pasta (~33 MB de banco).
3. **Arquivos soltos do levelcards (`Script.zip` 68 MB, `htaccess.zip`, `.htaccess.bk`):** → **não entram no site**;
   guardo em `/srv/backups/arquivo/` por 90 dias e depois apago (a não ser que você diga que pode descartar já).
4. **Os sites precisam enviar e-mail** (formulário de contato, recuperação de senha)? → Se não, fica sem envio. Se sim,
   plugin WP Mail SMTP com uma caixa sua (decidir junto com o destino dos e-mails do Cloud Startup).
5. **Quanto tempo manter o site antigo no hPanel depois da virada?** → **7 dias** (dados parados, a volta é só DNS);
   depois apago com o seu "ok".

**Respostas do dono (2026-11-26):** 1. SSH (ativando). 2. **Não guardar**: `/site0` e `/karkaraceara` são descartados
(eram testes). 3. **Apagar direto** os arquivos soltos do levelcards (não guardar). 4. **Não precisa enviar e-mail.**
5. **7 dias** com o site antigo no hPanel. Banco órfão `u218539700_L0t3O` apagado pelo Claude a pedido do dono.

## Andamento

- 2026-11-26: chave `/root/.ssh/hostinger_cloud` (ed25519, "vps-migracao-wordpress") criada na VPS para puxar da hospedagem.
  Apagar a chave no hPanel (ou desativar o SSH) ao terminar.
- 2026-11-26: SSH ok (`Host hostinger` = 187.6.160.61:65002 no `/root/.ssh/config` da VPS; servidor us-bos-web1572,
  PHP 8.2.36, WP-CLI 2.12). Cópias: levelcards 1,6 GB (uploads 668 MB, plugins 756 MB), eversonsousa 1,4 GB.
- 2026-11-26, **B1 levelcards: SITE INVADIDO → migração PARADA até o dono decidir.** É loja WooCommerce (Mercado Pago,
  Correios, Elementor Pro 3.15.1, WP 6.9.12, siteurl `http://`). Achados: plugin `wpcore-content-manager` instalado em
  2026-05-05 (cloaker de SEO turco: classes `cloaker`/`ghost`/`affiliate-content`, painel `panel287.com`, 9.685 páginas
  de spam em cache); **13 administradores falsos** `admin_xxxxxxxx` criados em 2026-05-05 16:09; plugin
  `stops-core-theme-and-plugin-updates` ativo (bloqueia atualizações). Núcleo do WP confere com os checksums.
  eversonsousa: 1 admin só, sem o plugin; checksums ainda não rodados.
