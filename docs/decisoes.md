# Registro de decisões

Mais recente no topo. Cada decisão diz o que foi decidido, quando e por quê.

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

## 2026-11-15 — Domínio definitivo: criasite.app

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
