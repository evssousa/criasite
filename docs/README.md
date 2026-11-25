# Documentação e plano do CriaSite

Esta pasta (`docs/`) é a memória do projeto. Tudo o que for decidido ou construído entra aqui,
para que qualquer pessoa (ou o Claude, depois de perder o contexto) saiba onde estamos
e o que vem a seguir.

**Regra:** toda tarefa concluída atualiza o status abaixo e o documento da área.

O CriaSite (criasite.app) é o 4º site da família (Respawnou, Vibecoin, Anime Profile): ferramentas
gratuitas que rodam no navegador, notícias automáticas sobre a web e guias em pt-BR para quem cria e
cuida de sites. Mesma estratégia dos irmãos: repositório público como portfólio e renda com AdSense
(e afiliado da Hostinger depois). A base de código veio do Vibecoin.

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [arquitetura.md](arquitetura.md) | Stack, pastas, rotas, dados, estado no navegador, tema, variáveis |
| [ferramentas.md](ferramentas.md) | Ferramentas no ar, como adicionar uma, próximas |
| [automacao.md](automacao.md) | Robô de notícias: fluxo, fontes, guia editorial |
| [guias.md](guias.md) | Guias da trilha: modelo de guia, 1ª leva de 6 (migration 003), link na trilha, afiliado reservado |
| [capas.md](capas.md) | Capas próprias dos guias (script `make-capas.mjs`, SVG → WebP, migration 005) e capa padrão por editoria |
| [guias-leva2.md](guias-leva2.md) | 2ª leva de 6 guias (Páginas, e-mail, WordPress ou construtor, HTTPS, Search Console, Perfil da Empresa), migration 006 |
| [guias-leva3.md](guias-leva3.md) | 3ª leva de 5 guias evergreen (privacidade e LGPD, aviso de cookies, medir visitas, manutenção e backup, site fora do ar), capas novas, migrations 012 (guias) e 013 (links nos guias antigos); 11 decisões para o dono |
| [ia-desenvolvimento.md](ia-desenvolvimento.md) | Novo eixo "criar site com IA": hub `/criar-site-com-ia` (roteiro de 6 etapas), 8 guias, capas com régua própria, robô (fontes e filtro de assunto), 2 ferramentas, aviso editorial; em fatias |
| [ferramenta-fora-do-ar.md](ferramenta-fora-do-ar.md) | Plano da ferramenta "Está fora do ar?" (1ª com servidor): proteção contra SSRF, limites em memória, API `/api/fora-do-ar`, tela, textos legais |
| [ferramenta-instrucoes-ia.md](ferramenta-instrucoes-ia.md) | Plano da F6 "Gerador de arquivo de instruções" (AGENTS.md/CLAUDE.md): Markdown exato, escapes, detector de segredos, tela, textos, testes |
| [ferramenta-prompt-site.md](ferramenta-prompt-site.md) | Plano da F5 "Gerador de prompt para site": pedido exato com 2 arquivos de ouro, cores com contraste AA, textos colados entre marcas (anti-injeção), segredos, tela, textos, testes; 2 commits (peças comuns + ferramenta) |
| [midia-kit.md](midia-kit.md) | Plano do mídia kit em `/anuncie` (piloto para os 4 sites): números só com fonte e data, público, 3 formatos, regras, recusas, PDF por CSS de impressão, SEO/FAQ, textos legais e como copiar para os outros sites |
| [painel-visitas.md](painel-visitas.md) | Painel `/admin/visitas`: contador próprio sem cookie (módulo `app/visitas`, copiado do animeprofile), como funciona, diferenças e o que conferir |
| [orcamento-site.md](orcamento-site.md) | Plano da ferramenta "Quanto custa um site" (orçamento de site): premissas em faixas num único `data.ts` com data que vence, conta pura e testes, 5 caminhos (IA, construtor, WordPress, freelancer, agência), tela em réguas, resumo .txt, impressão, migration 010 de links; 12 decisões para o dono |
| [deploy-hostinger.md](deploy-hostinger.md) | Deploy: site, build, banco, variáveis, Cron Jobs, domínio |
| [migracao-vps.md](migracao-vps.md) | Migração para a VPS (KVM 1 + Coolify): base da VPS (uma vez) + módulo copiável por site (preparo, ensaio em sslip.io, janela de virada, pós, volta); 12 decisões para o dono |
| [decisoes.md](decisoes.md) | Registro de decisões (o quê, quando e por quê) |
| [prototipo-layout.html](prototipo-layout.html) | Protótipo do layout escolhido ("Busca + Central") |
| [plano-inicial.md](plano-inicial.md) | Histórico: os 3 conceitos da fase 0 (previa site sem banco; superado) |

## Status

Legenda: ✅ feito · 🔄 em andamento · ⏳ próximo · 💤 depois · ❓ esperando decisão do dono

| Fase | Item | Status |
|---|---|---|
| 0 | Conceito: ferramentas + notícias automáticas + trilha/guias | ✅ |
| 0 | Marca CriaSite, domínio criasite.app (definitivo; sem .com.br), repo `evssousa/criasite` (antigo da organização apagado pelo dono) | ✅ |
| 0 | Layout "Busca + Central" (4 rodadas de protótipos) | ✅ |
| 1 | Esqueleto a partir do Vibecoin, sem cotações; tema, cabeçalho, rodapé, ícones e imagem de compartilhamento | ✅ |
| 1 | Home: busca que filtra, atalhos, faixa da trilha, Suas ferramentas (estrela), diretório, notícias, guias | ✅ |
| 1 | 11 ferramentas com texto explicativo: comprimir e converter imagem, QR code, link do WhatsApp, contador, meta tags, contraste de cores, favicon, sitemap e robots.txt, status HTTP, tamanhos de imagem | ✅ |
| 1 | Página da trilha com checklist salvo no navegador | ✅ |
| 1 | Robô de notícias adaptado (editorias, fontes, guia editorial, links para ferramentas) | ✅ (no ar: coleta ok, Gemini ok, teste de escrita aprovado em 2026-11-14) |
| 1 | Institucionais e legais reescritas (sobre, FAQ, contato, termos, privacidade, cookies, editorial, anuncie) | ✅ |
| 1 | README de portfólio + LICENSE + telas | ✅ |
| 2 | Deploy na Hostinger (criasite.app), repo religado, banco novo, variáveis, Cron Jobs; 1ª coleta ok (19 pautas) | ✅ |
| 2 | Chave do Gemini, senha do painel, DNS do e-mail (nameservers na Hostinger) | ✅ |
| 2 | Caixa contato@criasite.app, CNAMEs antigos apagados | ✅ |
| 2 | Search Console (propriedade de domínio, conta centralizada, TXT no DNS) | ✅ |
| 2 | Sitemap enviado no Search Console | ✅ |
| 2 | Cadastrar no Bing Webmaster | ✅ |
| 2 | Guias da trilha, 1ª leva (6) por migration `003_guias_iniciais.sql` + botão "Ler o guia" na `/trilha`: plano em [guias.md](guias.md) | ✅ (escritos, validados e no repo; a migration roda no deploy) |
| 2 | Capas próprias dos guias (12 artes SVG → WebP, migration 005) + capa padrão por editoria no lugar das listras + capa nos cards de `/guias`: plano em [capas.md](capas.md) | ✅ (amostras aprovadas pelo dono; no ar depois do deploy) |
| 2 | Guias da trilha, 2ª leva (6: Páginas, e-mail, WordPress ou construtor, HTTPS, Search Console, Perfil da Empresa; migration 006): plano em [guias-leva2.md](guias-leva2.md) | ✅ (6 guias com capa, 803 a 835 palavras; etapa Páginas da trilha com guia) |
| 2 | Guias da trilha, 3ª leva (5: privacidade e LGPD, aviso de cookies, medir visitas, manutenção e backup, site fora do ar; migrations 012 e 013 com links nos guias antigos e os 4 links pendentes do "Está fora do ar?"): plano em [guias-leva3.md](guias-leva3.md) | ✅ no ar em 2026-11-24 (11 decisões aprovadas; conferido em produção: 5 guias com capa, 25 guias em `/guias` e no sitemap, links nos 8 guias antigos; falta só o dono ler os 2 guias legais) |
| 2 | Novo eixo "criar site com IA" (hub `/criar-site-com-ia`, 8 guias com tag "Com IA", capas, robô, ferramentas, aviso editorial): plano em [ia-desenvolvimento.md](ia-desenvolvimento.md) | 🔄 (plano pronto em 2026-11-17; **F1 robô feita e no ar em 2026-11-17**; 9 recomendações aprovadas pelo dono em 2026-11-17; **F1, F2, F3 e F4 feitas em 2026-11-17**: hub `/criar-site-com-ia`, menu "Site com IA", 8 guias "Com IA" (migration 008) e capas; **F6 ✅ no ar**; F5 com plano pronto) |
| 2 | Ferramenta "Está fora do ar?" (servidor, anti-SSRF, limites por IP/alvo/global, histórico no navegador): plano em [ferramenta-fora-do-ar.md](ferramenta-fora-do-ar.md) | ✅ (feita em 2026-11-17: guarda anti-SSRF, checagem, API `/api/fora-do-ar`, tela, textos legais; 84 testes puros + 14 de rede) |
| 2 | Ferramenta "Gerador de arquivo de instruções" (F6, `/ferramentas/arquivo-de-instrucoes-ia`, 100% no navegador, rascunho em `criasite_instrucoes`, alerta de segredos): plano em [ferramenta-instrucoes-ia.md](ferramenta-instrucoes-ia.md) | ✅ (feita em 2026-11-17: 8 recomendações aprovadas; 79 testes puros; falta só o link no G3, pelo painel) |
| 2 | Ferramenta "Gerador de prompt para site" (F5, `/ferramentas/prompt-para-site`, 100% no navegador, rascunho em `criasite_prompt_site`, cores com contraste AA, textos colados entre marcas contra injeção, alerta de segredos): plano em [ferramenta-prompt-site.md](ferramenta-prompt-site.md) | ✅ (feita em 2026-11-17: 10 recomendações aprovadas; 80 testes puros; falta só o link no G2, pelo painel) |
| 2 | Mídia kit em `/anuncie` (piloto para animeprofile, respawnou e vibecoin): plano em [midia-kit.md](midia-kit.md) | ✅ (feito em 2026-11-19; 10 recomendações aprovadas pelo dono; 27 testes; `/anuncie` com PDF por CSS de impressão em 2 páginas) |
| 2 | Ferramenta "Quanto custa um site" (orçamento de site, `/ferramentas/quanto-custa-um-site`, 100% no navegador, premissas com data que vence, rascunho em `criasite_orcamento`): plano em [orcamento-site.md](orcamento-site.md) | ✅ no ar em 2026-11-19 (faixas conferidas pelo dono; revisar premissas até 2027-05) |
| 2 | Painel `/admin/visitas` com contador de visitas próprio, sem cookie (módulo do animeprofile): [painel-visitas.md](painel-visitas.md) | 🔄 (feito e testado localmente em 2026-11-19; falta conferir em produção, criar o Cron Job `limpeza` e o dono aprovar os textos de privacidade/cookies) |
| 2 | Migração para a VPS (Coolify, 1º site dos 4): plano em [migracao-vps.md](migracao-vps.md) | 🔄 (12 decisões aprovadas em 2026-11-25; Parte A feita pelo Claude: snapshot, firewall, atualizações, swap, SSH só por chave, fail2ban; Dockerfile no repo e build testado na VPS; esperando os passos do dono no Coolify, o arquivo de segredos e o dump do ensaio) |
| 2 | Mais ferramentas: paleta, slug, proposta para cliente (freelancer) | 💤 |
| 3 | Pedido do AdSense e afiliado da Hostinger | 💤 |

## Próximos passos

0. **Migração para a VPS** ([migracao-vps.md](migracao-vps.md)): com as decisões do dono, Parte A (base da VPS: firewall,
   swap, SSH, Coolify com domínio, MariaDB, backups), depois Parte B (Dockerfile, banco, ensaio completo em
   `criasite.189-24-17-85.sslip.io`), e só então a janela de virada (Parte C). Onde parou: Parte A feita até onde não depende do dono (A1–A6, A11, DNS de `painel`);
   B1, B2 e o arquivo de segredos (B3.1) prontos. Falta: A7/A8 (dono no Coolify), A9 MariaDB, A10 backups, B4 em diante.
1. **Robô: filtro de assunto** ✅ feito em 2026-11-16 (`app/lib/robot/topic.ts`). A fonte The Verge IA **fica** (decisão do dono,
   2026-11-17): com o filtro, só passa com assunto de sites. Decisão do dono (2026-11-17): a notícia da **Nvidia** será excluída por ele
   no painel; a de **Harvard sobre IA e data centers fica**, porque o site também terá assuntos de IA (por isso o filtro de assunto
   precisa deixar entrar IA aplicada a sites e a IA em geral que interesse a quem cria sites: ver `docs/ia-desenvolvimento.md`).
2. **Novo eixo: criar site com IA** (pedido do dono, 2026-11-17). **Plano pronto** em [ia-desenvolvimento.md](ia-desenvolvimento.md),
   em fatias: **F1** robô ✅ **feita em 2026-11-17** (5 fontes de IA conferidas com curl na migration 007, `AI_DEV_TOPIC`,
   `AI_INTEREST_TOPIC` e `GENERIC_AI_OFF` em `topic.ts`, BOOST, guia do redator; 41 casos de teste certos, com a notícia de Harvard passando); **F2** capas ✅ **feita em 2026-11-17** (8 webp de 8 a 12 KB em `public/capas/`, régua com 6 losangos e faísca; o dono aprovou a amostra e a folha);
   **F3+F4** ✅ **feitas em 2026-11-17** (hub `/criar-site-com-ia` com 6 etapas e progresso no navegador, card na home, box na `/trilha`, menu "Site com IA", pílula "Com IA" nos cards, "Leia também" por família, aviso na política editorial, migration `008_guias_ia.sql` com 8 guias); **F6** gerador de arquivo de instruções ✅ **no ar em 2026-11-17** ([ferramenta-instrucoes-ia.md](ferramenta-instrucoes-ia.md));
   **F5** gerador de prompt ✅ **feita em 2026-11-17** ([ferramenta-prompt-site.md](ferramenta-prompt-site.md); 3 commits: plano, peças comuns com a F6 + contraste em `lib`, e a ferramenta).
   As 9 perguntas do plano foram aprovadas com as recomendações (2026-11-17).
3. 3ª leva de guias ([guias-leva3.md](guias-leva3.md)): **feita em 2026-11-24** (11 decisões aprovadas pelo dono). 5 guias (privacidade e LGPD, aviso de cookies,
   medir visitas, manutenção e backup, site fora do ar; 857 a 1.000 palavras) com capas novas pela migration 012, e a 013 com 9 parágrafos de link em 8 guias
   antigos (fecha os 4 links pendentes do "Está fora do ar?"). O servidor aplica as migrations sozinho no deploy. Conferido em produção no mesmo dia.
   Falta a 2ª leva de IA, que fica para meados de dezembro (4 semanas de dados do Search Console).
4. **Está fora do ar?** ✅ **no ar em 2026-11-17** ([ferramenta-fora-do-ar.md](ferramenta-fora-do-ar.md)): commit 1 (guarda anti-SSRF, testes, job
   `cabecalhos`) e commit 2 (checagem, limites, API, tela, textos legais). `limits.server.ts` usa o último valor de `x-forwarded-for`
   até sair o resultado do diagnóstico (se o último for sempre o mesmo IP de proxy, trocar pelo penúltimo ou por `x-real-ip`).
   Falta: links nos guias antigos (sáb 21/11, lista na Parte D do plano) e rever os limites em 2 semanas. Depois: orçamento de site.
5. **Mídia kit** em `/anuncie` ✅ **feito em 2026-11-19** ([midia-kit.md](midia-kit.md); piloto dos 4 sites). Copiar para vibecoin,
   respawnou (só depois do AdSense) e animeprofile pela Parte G do plano (`types.ts`, `rules.ts`, teste e CSS iguais; `data.ts` e `SKIN` mudam).
   Selo "Patrocinado" nos posts e faixa nas ferramentas (Parte H) só quando fechar o 1º contrato.
6. **Quanto custa um site**: no ar (2026-11-19). Revisar as premissas de `app/lib/orcamento/data.ts` até 2027-05 (o teste falha se vencer). Conferido em produção em 2026-11-19 (tela, sitemap, trilha, 4 guias com o link; migration 010 aplicada no deploy).
7. Com ~20 notícias (já são 22 no feed, falta limpar as fora do assunto) e os 12 guias, pedir o AdSense.

## Pendências suas
- **VPS (no Coolify, em `http://189.24.17.85:8000`, liberado só para o seu IP):** ligar 2FA; Settings → Advanced → ligar a API; criar token (`root`, nome `claude`) e salvar só em `projetos\_segredos\coolify-api-token.txt`; Settings → Instance Domain `https://painel.criasite.app`; Sources → instalar o GitHub App na conta `evssousa`.
- **VPS:** preencher as 3 linhas vazias de `projetos\_segredos\criasite-vps.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `GEMINI_API_KEY`, os mesmos valores de hoje).
- **VPS:** exportar o dump do ensaio pelo phpMyAdmin (passo B5.1) para `projetos\_migracao\criasite-ensaio.sql` e anotar a versão do servidor.
- **VPS:** dizer se o e-mail `contato@criasite.app` faz parte do Cloud Startup (cancelar o plano pode apagar as caixas).
- ✅ Cron Job `limpeza` criado pelo dono em 2026-11-25 (`0,30 7 * * *`, roda às 7h00 e 7h30 UTC; inofensivo rodar duas vezes) e conferido: a chamada devolveu ok e apagou 19 códigos antigos de `visit_seen`.
- **Search Console:** relatório de 2026-11-24 analisado (ver `decisoes.md`): corrigido `/busca` (robots.txt) e o `SearchAction`; o resto é site novo. Sitemap (agora com as editorias) reenviado pelo dono em 2026-11-25. Dono: pedir indexação das 10 páginas principais pela Inspeção de URL (opcional) e **reexportar o relatório por volta de 02/12 a 09/12** para eu analisar.
- ✅ Aprovados pelo dono em 2026-11-24: os guias de privacidade e de cookies, e o texto novo de `/privacidade` e `/cookies` (os 2 links de exemplo nos guias ficam).
- ✅ Painel `/admin/visitas` conferido em produção pelo dono em 2026-11-24 ("Hoje" sobe ao navegar).

- Prévia de um guia no WhatsApp: **fica para depois** (decisão do dono, 2026-11-17). Dar uma olhada nos 12 guias em `/admin/materias`
  (a conferência pública já foi feita em 2026-11-16: 12 guias, 12 capas, 7 botões da trilha e todos os links respondem 200).
- ✅ A notícia da Nvidia foi excluída pelo dono em 2026-11-17 (a de Harvard fica).
- ✅ "Está fora do ar?": diagnóstico dos cabeçalhos feito em 2026-11-17 (ver `decisoes.md`). A regra do limite por IP (último valor de `x-forwarded-for`) está confirmada e não muda. O dono testou a ferramenta no navegador em 2026-11-17 e confirmou que funciona. Falta só rever os limites em 2 semanas (por volta de 01/12).
- ✅ Feito pelo dono em 2026-11-17: leu os 8 guias de IA ("estão bons", então a política editorial "revisão humana" vale) e enviou `/criar-site-com-ia` ao Search Console.
- ✅ Links dos guias G2 e G3 para as ferramentas de IA: feitos por migration (`009_links_ferramentas_ia.sql`, 2026-11-17), que só mexe em guia ainda não editado no painel. Se algum não aparecer (guia já editado), inserir pelo painel o parágrafo do plano (Parte E, item 8 de `ferramenta-prompt-site.md`; Parte D, item 6 de `ferramenta-instrucoes-ia.md`).
- Mídia kit no ar: **antes do 1º contrato**, resolver como cobrar e emitir nota (pessoa física, MEI ou outra forma; falar com um contador). Quando quiser publicar números de audiência, siga a rotina de `app/lib/media-kit/data.ts` (Search Console → cliques e impressões de 28 dias → `value` e `updatedAt`; repetir todo mês). Publicar conteúdo patrocinado só depois do AdSense.
- "Quanto custa um site": as 12 recomendações foram aprovadas em 2026-11-19. **Falta conferir as faixas de preço** de `app/lib/orcamento/data.ts`
  (~20 min, páginas públicas de 2 ou 3 empresas por linha; nenhum nome de empresa entra no arquivo) antes de a ferramenta ir ao ar. Depois do deploy,
  rodar a migration 010 (SQL colado no chat). Revisão das premissas a cada 6 meses (o teste falha quando vencem).
- Afiliado da Hostinger: já está no guia de hospedagem (migration 004). Se editar esse guia no painel, mantenha o aviso e o link juntos.
- O TXT antigo do Google (`B0Z4u6o-…`) foi removido da zona ao trocar para a conta centralizada; o novo (`H8ZjO9tf…`) está no DNS e não deve ser apagado.

## Regra de atualização

Ao terminar qualquer tarefa: atualizar a tabela de status, `## Próximos passos`, `## Pendências suas` e,
se houve decisão, `decisoes.md`.
