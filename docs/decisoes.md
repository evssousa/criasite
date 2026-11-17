# Registro de decisões

Mais recente no topo. Cada decisão diz o que foi decidido, quando e por quê.

## 2026-11-17 — Ferramenta "Está fora do ar?" (plano)

- **O quê (proposta do planejador, plano em `ferramenta-fora-do-ar.md`):** 1ª ferramenta que usa o servidor. Resource
  route `api/fora-do-ar` (POST com JSON, no padrão de `api/view`), sem mexer no Express e sem banco. Checagem com
  `node:http/https` conectando **no IP já validado** (DNS resolvido uma vez; qualquer IP interno derruba a checagem),
  só GET com leitura dos cabeçalhos, até 5 redirecionamentos revalidados, 9 s no total, IP literal e portas não padrão
  bloqueados. Limites em memória: 5/min e 30/h por IP, cache de 30 s e 4/min por alvo, 60/min e 8 simultâneas no global.
  Os IPs resolvidos não voltam ao navegador. Histórico só no navegador (`criasite_checagens`, 5 itens).
- **Privacidade:** endereço digitado não vai para banco nem log; fica na memória até 1 min (IP até 1 h). Privacidade,
  termos, sobre, FAQ e `/ferramentas` ganham a exceção ao "tudo roda no navegador" (textos exatos no plano).
- **Por quê:** o navegador não consegue checar outro site (CORS); a ferramenta é a de maior busca da lista, e o risco
  (SSRF, virar proxy ou DDoS) se resolve com regras fechadas e testáveis, sem custo nem serviço externo.
- **Pendente do dono:** 6 perguntas com recomendação (cabeçalho do IP real, lado padrão do "O que fazer", limites,
  plano B em http, cabeçalho Server, monitoramento futuro).

## 2026-11-17 — Roteiro "Criar site com IA" no ar (F3+F4)

- **Feito:** hub `/criar-site-com-ia` (6 etapas, regras de ouro, progresso em `localStorage`), menu "Site com IA", card na home e box na
  `/trilha`, filtros `slugs` e `tag` no repositório, "Leia também" por família (guia de IA sugere guia de IA; clássico sugere
  clássico, via `tag IS NULL`), pílula "Com IA" no card, aviso na política editorial e migration `008_guias_ia.sql` com 8 guias.
- **Sem desvios do plano**, exceto: guias entre 703 e 854 palavras (7 abaixo do alvo de 800, todos acima do mínimo de 700) e
  o guia de SEO/acessibilidade aponta para o guia de velocidade só no "Leia também" (limite de 6 links internos).

## 2026-11-17 — Novo eixo "criar site com IA" (plano; 9 recomendações aprovadas pelo dono)

- **Aprovado ("aprovo as recomendações", 2026-11-17):** as 9 recomendações do planejador valem como estão: hub + tag "Com IA" (sem
  editoria nova), menu "Site com IA", só um card no `aside` da home, 8 guias publicados direto com o dono lendo em até 3 dias pelo
  painel (a política pode dizer "revisão humana"), citar que o CriaSite foi feito com assistente de código, ferramentas na ordem
  gerador de prompt e depois gerador de arquivo de instruções, fontes de fornecedores com peso baixo (Tecnoblog em teste por 2
  semanas), "Leia também" por família e o corte da "IA em geral" no robô como o planejador definiu.

- **O quê (proposta do planejador, plano em `ia-desenvolvimento.md`):** os guias de IA ficam na seção `guias` (mesmas
  URLs `/guias/<slug>`, mesmo validador) com `tag = 'Com IA'` (kicker e pílula no card), e ganham uma página-hub
  `/criar-site-com-ia` com um roteiro de 6 etapas (planejar, contexto, pedir, revisar, publicar, ir além) e checklist no
  navegador (`criasite_trilha_ia`). Sem editoria nova e sem segunda faixa na home: um card no `aside` e um box no fim da
  `/trilha`. Menu ganha "Site com IA". "Leia também" dos guias passa a sugerir a mesma família (tag).
- **1ª leva de IA:** 8 guias (jeito certo, prompt, arquivo de instruções, skills, MCP, segurança, revisão de código,
  SEO/acessibilidade/velocidade), texto atemporal: produtos só como exemplo neutro em grupo, sem preço, versão, data,
  porcentagem ou ranking; o que muda manda conferir na documentação oficial.
- **Capas:** mesma moldura, com régua própria do roteiro (6 losangos e uma faísca) para diferenciar da trilha.
- **Robô:** fontes de IA aplicada a sites (conferidas com curl antes da migration), filtro com `AI_DEV_TOPIC` e
  `AI_INTEREST_TOPIC` para fontes genéricas e `GENERIC_AI_OFF` (regulação, justiça, negócios, AGI). Data centers e
  impacto ambiental da IA **entram**, por decisão do dono (a notícia de Harvard fica; a da Nvidia sai).
- **Transparência:** política editorial diz que as notícias são escritas por IA e que os guias são escritos com apoio de
  IA e revisados antes de publicar (a palavra "humana" só se o dono de fato ler os guias).
- **Por quê:** pedido do dono (assunto em alta, pouca gente sabe fazer direito); reaproveita rota, validador e capas
  existentes; uma página forte para "criar site com IA" sem misturar as duas jornadas.

## 2026-11-15 — Capas próprias dos guias e 2ª leva (planos)

- **Capas (plano em `capas.md`):** arte vetorial desenhada em SVG num script Node (`scripts/make-capas.mjs`, `sharp`
  → WebP 1200×675, < 60 KB), versionada em `public/capas/`. Nada de gerador de imagem pago ou com créditos (o conector
  OpenArt não é usado). Linguagem: janela de navegador branca com sombra sólida laranja sobre marinho pontilhado, um
  desenho por assunto e a régua das 7 etapas da trilha com a etapa acesa. **Sem texto na imagem**: o título já aparece ao
  lado, os cortes variam (21:9 a 1:1) e o librsvg depende das fontes da máquina (quebraria a reprodução).
  A mesma imagem serve de `og:image` (recorte central para 1,91:1 só perde pontilhado).
- **Ligação ao banco:** migration `004_capas_guias.sql` com `UPDATE` só onde `image_url` está vazio (não sobrescreve capa
  posta pelo dono; não exige `updated_at` vazio porque só mexe nos campos da imagem; não altera `updated_at`).
- **Post sem imagem:** a arte listrada sai; entra uma capa padrão por editoria (marinho pontilhado, círculo na cor da
  editoria, ícone branco), só CSS e SVG inline. `GuideCard` da `/guias` passa a ter capa.
- **2ª leva (plano em `guias-leva2.md`):** 6 guias: Páginas (vira o `guide` da etapa 4), e-mail com o domínio,
  WordPress ou construtor (neutro), HTTPS e SSL, Search Console passo a passo, Perfil da Empresa no Google. Migration
  `005`, datas nas últimas ~48 h (todos visíveis ao mesmo tempo, sem link quebrado), alvo de 800 a 950 palavras, no
  máximo 1 link externo, lista branca de externos ampliada com `letsencrypt.org` e `support.google.com/business`.
  Privacidade e cookies (LGPD) fica para a 3ª leva.
- **Por quê:** pedido do dono (capa listrada sem graça; 2ª leva começando por Páginas); custo zero e reprodução com um comando.

## 2026-11-15 — Guias da trilha: 1ª leva por migration

- **O quê:** os 6 primeiros guias (domínio, hospedagem, visual, SEO básico, velocidade, checklist de lançamento) entram pela
  migration `003_guias_iniciais.sql` (INSERT IGNORE, origem `manual`, Equipe CriaSite, publicados com datas escalonadas
  de 1 a 6 dias antes do deploy, `featured=0`, `updated_at` vazio), e não pelo painel. A etapa "Páginas" fica para a 2ª leva.
  Plano em `guias.md`.
- **Por quê:** mesmo esquema do Vibecoin; o dono não precisa rodar nada e o texto fica versionado. `featured=0` porque o
  destaque da home não filtra seção; `updated_at` vazio para não mostrar "Atualizado em" igual nos seis.
- **Trilha:** cada etapa com guia ganha um botão "Ler o guia" (campo `guide` em `TRAIL`), só quando a seção guias tem conteúdo.
- **Afiliado:** nada de link de afiliado nesta leva; ponto reservado no guia de hospedagem, aviso junto ao link e
  `rel="sponsored"` quando o link existir (tarefa própria).
- **Conteúdo:** sem preços exatos (só faixas, com aviso de que mudam), sem promessa de resultado, sem marca recomendada.

## 2026-11-14 — Ponto de partida do CriaSite

- **O quê:** criasite.app vira o 4º site da família, com a mesma estratégia dos irmãos (repositório
  público como portfólio, renda com AdSense), nicho de criação de sites/web/SEO para freelancers e
  pequenos negócios no Brasil, em pt-BR, sem APIs pagas. Hospedagem na Hostinger.
- **Por quê:** pedido do dono; o domínio já está na Hostinger.
- O repositório de organização ligado hoje ao domínio será apagado e recriado pelo dono. Até ele
  decidir, nada é mexido (repo, site da Hostinger, DNS).

## 2026-11-14 — Recomendação de conceito (aguardando o dono)

- **O quê (proposta, não aprovada):** ferramentas gratuitas no navegador + guias escritos com cuidado;
  analisador de URL só na fase 3 e em versão leve. SEO programático só em conjuntos curados.
  Stack do Vibecoin sem banco; guias em Markdown no repositório. Detalhes em `plano-inicial.md`.
- **Por quê:** ferramentas trazem volume de busca com concorrência brasileira fraca e custo zero de
  servidor; guias trazem RPM melhor e o "conteúdo original e útil" que o AdSense exige; o analisador
  tem concorrência forte e custo/risco de servidor alto.

## 2026-11-14 — Rodadas de layout e novos requisitos

- **Marca:** CriaSite, domínio principal criasite.com.br. Guias assinados por "Equipe CriaSite".
- **Afiliado:** usar o programa de afiliados da Hostinger (com aviso de link de afiliado), depois que houver conteúdo.
- **Layout, rodada 1:** de 4 estruturas (Oficina, Trilha, Busca, Planta), o dono gostou de **Busca** (busca no topo +
  diretório por categoria, marinho/laranja) e **Trilha** (jornada em 7 etapas + checklist, serifada verde/rosa).
- **Novos requisitos:** o site terá **notícias automáticas** (como Respawnou/Vibecoin) e **ferramentas de uso
  recorrente** para o visitante voltar (comprimir imagem, QR code, link do WhatsApp, está fora do ar?, orçamento de site,
  favoritas e "meu site" salvos no navegador).
- **Rodada 2:** Central, Caderno, Painel e Hoje (variações de Busca + Trilha); escolhido o **Central**.
- **Rodada 3:** variações do Central (Claro, Noturno, Lateral, Revista).
- **Layout escolhido: "Busca + Central"** — topo marinho com busca centralizada e chips "Mais usadas", faixa da trilha
  (7 etapas, clicável) no fim do topo; corpo com "Suas ferramentas" (favoritas pela estrela, salvas no navegador) e
  diretório por categoria; lateral com notícias automáticas, anúncio 300×250 e guias novos. Marinho `#0c1a4b` + laranja
  `#ff7a1a`, fundo `#eef1fb`, fonte Schibsted Grotesk. Referência: `docs/prototipo-layout.html`.

## 2026-11-14 — Fase 1: o site

- **Base:** cópia do Vibecoin (servidor, robô, painel, páginas legais, SEO), sem cotações, moedas e
  corretoras. Os nomes dos tokens de cor foram mantidos com os valores do CriaSite, para reaproveitar
  componentes sem renomear tudo.
- **Ferramentas só no navegador** (comprimir imagem, QR code, link do WhatsApp, contador, meta tags):
  privacidade, custo zero de servidor e argumento de confiança ("nada sai do seu computador").
- **Favoritas e trilha no `localStorage`**, sem conta. Favoritas começam com comprimir imagem, QR code
  e link do WhatsApp, para a área não nascer vazia.
- **Sem caixas de anúncio no layout**: como no Vibecoin, AdSense em anúncios automáticos ligados por
  `ADSENSE_CLIENT`. Caixas vazias "Anúncio" pioram a avaliação do site.
- **Busca da home**: filtra o diretório na hora (nome, descrição, categoria e sinônimos, sem acento);
  Enter com uma só ferramenta encontrada abre a ferramenta, senão vai para `/busca` (ferramentas +
  notícias + guias).
- **Notícias:** editorias `noticias` (web), `google`, `plataformas`, `ia`, `seguranca`; guias à parte
  (fora do feed de notícias). Robô com guia editorial próprio (foco no dono de site pequeno, sem
  promessa de resultado) e link automático para a ferramenta citada no texto.
- **Bancos antigos do criasite na Hostinger:** o dono autorizou apagar e recriar no deploy.

## 2026-11-14 — Domínio definitivo: criasite.app

- **O quê:** o .com.br não será registrado; criasite.app é o domínio do site, do e-mail
  (`contato@criasite.app`) e de todos os textos. Nameservers na Hostinger (antes estavam na Cloudflare,
  da instalação antiga, e o e-mail não funcionava).
- **Por quê:** decisão do dono. O .app já estava na conta, com SSL vitalício.

## 2026-11-15 — Capas, 2ª leva e afiliado

- **Capas próprias:** linguagem "janela de navegador com sombra laranja + régua da trilha", sem texto na imagem, geradas por
  `scripts/make-capas.mjs` (SVG → WebP, grátis e reproduzível); aprovada pelo dono. 12 artes. Capa padrão por editoria no
  lugar das listras. Migrations: 004 afiliado, 005 capas dos 6 primeiros guias, 006 a 2ª leva (6 guias já com capa).
- **2ª leva publicada de uma vez** (datas nas últimas ~48 h) para os links entre guias não darem 404.
- **Afiliado da Hostinger** (código do dono) no guia de hospedagem, com aviso na mesma frase e `rel="sponsored noopener"`.
