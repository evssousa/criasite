# Plano inicial do CriaSite (criasite.app)

> Plano temporário da fase 0. Quando o dono escolher o conceito, as partes aprovadas viram
> `arquitetura.md`, `ferramentas.md`, `conteudo.md` e `adsense.md`, e este arquivo fica só como histórico.

## Objetivo

Criar em criasite.app um web app em pt-BR que sirva de portfólio (repositório público no GitHub) e gere
renda com AdSense, com ferramentas gratuitas e guias para quem cria ou mantém sites (freelancers e
pequenos negócios no Brasil), sem APIs pagas.

## Contexto

- O domínio criasite.app já está na Hostinger e hoje aponta para um repositório de **organização** no
  GitHub, que o dono vai apagar e recriar do zero. **Nada disso deve ser mexido** até o dono decidir
  (ver "Pendências suas" no README). Nenhum passo deste plano apaga repo, site ou DNS.
- Os sites irmãos já resolveram quase tudo o que este precisa:
  - Respawnou: servidor Express + React Router com SSR, deploy na Hostinger, `availability.ts` (página
    vazia some do menu e leva `noindex`), estratégia do AdSense (`respawnou/docs/adsense.md`), banner de
    cookies com Modo de Consentimento v2, `ads.txt`, páginas institucionais, README de portfólio + LICENSE.
  - Vibecoin: mesma base, mais **ferramentas client-side** (`vibecoin/docs/ferramentas.md`,
    componente `ToolLayout`), `seo.ts`, sitemap/RSS/robots como resource routes, auditoria em
    375/768/1024/1440.
- Diferença principal: o CriaSite **não precisa de robô de notícias nem de banco** no começo. O valor
  está nas ferramentas e em guias escritos com cuidado (o que também é o que o AdSense quer ver).
- `.app` é um domínio com **HSTS pré-carregado** nos navegadores: o site só abre por HTTPS. O SSL da
  Hostinger precisa estar ativo antes de qualquer teste no domínio.

## Os 3 conceitos candidatos

### Conceito A: "Caixa de ferramentas do site" (suíte de geradores no navegador)

Dezenas de ferramentas pequenas que rodam 100% no navegador: gerador de meta tags e Open Graph com
prévia (Google, WhatsApp, LinkedIn, X), robots.txt, sitemap.xml a partir de lista de URLs, favicon
(PNG + ICO + manifest a partir de uma imagem), paleta de cores + contraste WCAG, schema JSON-LD
(LocalBusiness, FAQ, Article, Product), compressor/conversor de imagem para WebP/AVIF, prévia de
resultado no Google (limite em pixels), link do WhatsApp + QR code, gerador de slug, minificador de
CSS/JS/HTML, regras de redirecionamento .htaccess.

- **Tráfego:** alto e constante. Buscas como "gerador de link whatsapp", "gerador de qr code",
  "converter imagem para webp", "gerador de favicon" têm volume grande em pt-BR e pouca concorrência
  brasileira de qualidade (quase tudo é site gringo traduzido).
- **RPM:** baixo a médio. Sessões curtas (a pessoa usa e sai), público de dev usa bloqueador de
  anúncio. Compensa pelo volume. As ferramentas de público leigo (WhatsApp, QR code, imagem) têm menos
  bloqueador que as de dev (minificador).
- **Esforço:** médio. Cada ferramenta é pequena e não tem custo de servidor; dá para lançar 8 a 10 e ir
  somando.
- **Risco AdSense:** "página de ferramenta sem texto" é vista como conteúdo fino. Precisa de texto
  original em toda página (como usar, o que é, erros comuns, perguntas).

### Conceito B: "Analisador de site" (cola a URL, recebe o diagnóstico)

O usuário cola um endereço e recebe SEO on-page (title, description, headings, OG, canonical,
robots, sitemap), desempenho (via API gratuita do PageSpeed Insights) e itens de segurança
(HTTPS, cabeçalhos). Relatório em pt-BR com "como corrigir".

- **Tráfego:** médio. "Analisar SEO do site" e "teste de velocidade do site" têm volume, mas a
  concorrência é forte (o próprio PageSpeed, GTmetrix, SEMrush, Ubersuggest).
- **RPM:** médio a bom (público de marketing e pequenos negócios, sessão mais longa lendo o
  relatório).
- **Esforço:** alto. Exige servidor buscando páginas de terceiros: proteção contra SSRF (não acessar
  IP interno), limite por IP, cache, tempo máximo, e a Hostinger compartilhada pode estrangular
  processos longos. A cota gratuita do PageSpeed tem limite diário.
- **Risco:** relatórios de URL de terceiros não podem virar páginas indexadas ("análise de
  site-x.com.br" aos milhares é spam de conteúdo em escala). Abuso do servidor por robôs.

### Conceito C: "Guia para criar o seu site" (conteúdo + checklist interativo)

Blog de guias em pt-BR (como criar um site, quanto custa, domínio .com.br vs .com, hospedagem,
WordPress vs construtor vs código, SEO local, Google Meu Negócio, LGPD para site pequeno, orçamento
para freelancer) + checklist de lançamento interativo + calculadora "quanto custa um site".

- **Tráfego:** médio, cresce devagar. Termos comerciais ("melhor hospedagem", "como criar um site
  grátis") são disputados por portais grandes e pelas próprias empresas de hospedagem.
- **RPM:** o melhor dos três. Hospedagem, domínio e criação de site estão entre os temas de CPC mais
  alto em tecnologia; abre porta para afiliados (programa de afiliados da Hostinger, por exemplo), que
  costuma render mais que o AdSense nesse nicho.
- **Esforço:** contínuo. Guia bom não sai de robô (mesma decisão do Vibecoin: guias escritos à mão).
- **Risco:** é o mais seguro para o AdSense (texto original), mas o mais lento para gerar tráfego, e
  comparativo de hospedagem exige dado conferido e atualizado.

### Comparação

| Critério | A: Ferramentas | B: Analisador | C: Guias |
|---|---|---|---|
| Volume de busca em pt-BR | alto | médio | médio |
| Concorrência BR de qualidade | baixa | alta | média/alta |
| RPM esperado | baixo/médio | médio | bom (+ afiliados) |
| Esforço para o MVP | médio | alto | médio, contínuo |
| Custo de servidor | quase zero | alto (processos, cota) | zero |
| Risco de reprovação no AdSense | médio (resolvível com texto) | médio/alto | baixo |
| Valor de portfólio | alto (muita interface) | alto | baixo |
| Reaproveita os irmãos | `ToolLayout` do Vibecoin | pouco | `StaticPage`, guias do Vibecoin |

## Recomendação

**A + C juntos, com A na frente; B fica para depois em versão reduzida.**

- As **ferramentas trazem o tráfego** (volume alto, concorrência BR fraca, custo zero de servidor).
- Os **guias trazem o RPM e a aprovação**: cada ferramenta tem texto próprio e aponta para 1 a 3 guias;
  cada guia usa uma ferramenta no meio do texto. É o par "ferramenta → guia" que diferencia o site de um
  catálogo de geradores e dá ao AdSense o "conteúdo original e útil".
- O **analisador (B)** entra na fase 3 só na forma leve: "verificador de meta tags de uma URL" (uma
  requisição, só o HTML, com limite e cache), sem páginas indexadas de resultado. PageSpeed fica
  como opcional.
- Posicionamento: "Ferramentas e guias para criar e cuidar do seu site, em português". Público
  principal: freelancer que faz site para cliente e dono de pequeno negócio. Isso puxa ferramentas
  "de leigo" (WhatsApp, QR code, imagem, favicon, orçamento), que têm mais volume e menos bloqueador
  de anúncio que as de dev.

## Estratégia de SEO programático (com freio)

Regra de ouro: **só gerar página em escala quando cada página tem dado próprio e útil**; o resto não
existe ou leva `noindex` (mesma lógica do `availability.ts` dos irmãos). Nada de "cor #000001 até
#FFFFFF" nem "análise do site X".

Conjuntos aprovados para o plano (curados, dezenas e não milhares):

1. **Referência de status HTTP** (`/referencia/http/301`, `404`, `500`...): ~40 páginas com
   significado, quando usar, como configurar na Hostinger/Apache/Nginx/Cloudflare, efeito no SEO.
2. **Tamanhos de imagem por plataforma** (`/tamanhos/instagram`, `whatsapp`, `og`, `favicon`...):
   ~15 páginas com tabela atualizada + link para o redimensionador.
3. **Paletas por tipo de negócio** (`/paletas/restaurante`, `dentista`, `advocacia`...): ~30
   páginas com 3 paletas testadas em contraste WCAG, sugestão de fonte e prévia de botão/cabeçalho;
   botão "abrir no gerador".
4. **Schema por tipo de negócio** (`/schema/restaurante`, `clinica`, `loja`...): modelo de JSON-LD
   pronto + campos explicados, abrindo o gerador já preenchido.
5. **Quanto custa um site de [tipo]** (fase 3, só se a calculadora tiver dados próprios): faixas
   de preço explicadas, sem inventar números; se não houver fonte, não publica.

Cada página do conjunto: H1 único, introdução escrita (não template com troca de palavra),
dados/tabela, ferramenta ou link para ela, 2 a 4 links internos, data de atualização. Entra no
sitemap só quando passa num checklist (texto mínimo, dado presente). Lançar em lotes pequenos e olhar
o Search Console antes do próximo lote.

SEO base (igual aos irmãos): title/description/canonical/OG por página, JSON-LD (`WebApplication`
nas ferramentas, `Article` nos guias, `BreadcrumbList` em tudo), sitemap.xml, robots.txt, imagem OG
padrão, links internos por "ferramentas relacionadas" e "guias relacionados". Não contar com rich
result de FAQ (o Google restringiu em 2023); FAQ fica pelo valor para o leitor.

## Potencial de RPM (estimativa, sem garantia)

- Tráfego brasileiro tem RPM bem menor que o americano; o que muda o jogo é volume e tema.
- Ordem esperada, do maior para o menor RPM: guias de hospedagem/domínio/criação de site >
  ferramentas para pequeno negócio (WhatsApp, QR, schema local) > ferramentas de imagem >
  ferramentas de dev (minificador, regex), que têm muito bloqueador.
- Afiliados (hospedagem, domínio) tendem a render mais que o AdSense nesse nicho. Fica como pergunta
  ao dono (ver abaixo); se aprovado, entra com aviso de "link de afiliado" e sem virar a pauta do site.
- Os números só serão conhecidos depois de 1 a 2 meses de AdSense ativo; não prometer valor.

## Stack e arquitetura

**Recomendado: a mesma base do Vibecoin, sem MySQL no MVP.**

- React 19 + React Router 8 em modo framework, com SSR, Vite, Tailwind 4, TypeScript estrito,
  Express 5 (`server.js` → `server-app.js`, www → apex). Copiar o esqueleto do Vibecoin e remover
  banco, robô, cotações e admin.
- **Ferramentas rodam no navegador** (Canvas, `FileReader`, Web Workers para imagem, bibliotecas
  open source pequenas para QR code e ZIP). O arquivo do usuário nunca sai do computador dele; isso
  vira argumento de venda ("nada é enviado") e evita custo e responsabilidade de guardar arquivo.
- **Guias e páginas de referência em Markdown no repositório** (`content/guias/*.md` com frontmatter:
  título, descrição, data, atualizado, ferramentas relacionadas). O Git é o "painel": o Claude escreve,
  o dono revisa no PR/commit. Sem admin, sem banco, sem login.
- **Por que Node e não estático puro:** mesma forma de deploy dos irmãos (o Sonnet já sabe fazer), e
  as ferramentas da fase 3 precisam de rota de servidor (verificador de domínio pelo RDAP do
  registro.br, verificador de meta tags de URL). Se a Hostinger Business não permitir mais um app
  Node.js, plano B: `prerender` do React Router gerando HTML estático (o MVP inteiro funciona assim) e
  as ferramentas de servidor esperam.
- Sem APIs pagas. Fase 3 pode usar só serviços gratuitos e públicos: RDAP do registro.br (domínio
  .br), DNS por HTTPS da Cloudflare/Google (no navegador), PageSpeed Insights com chave gratuita
  (opcional). Toda rota de servidor que acessa a internet tem limite por IP, cache e bloqueio de IP
  interno.
- AdSense, banner de cookies, Modo de Consentimento v2 e `ads.txt` copiados do Respawnou, desligados
  até existir `ADSENSE_CLIENT`.

### Pastas previstas

```
app/
  root.tsx, routes.ts
  routes/            home, ferramentas, guias, referência, institucionais, sitemap, robots, ads.txt
  components/        Header, Footer, ToolLayout, GuideLayout, StaticPage, RichText, AdSlot, CookieConsent
  tools/             uma pasta por ferramenta: lógica pura (testável) + componente
  lib/
    site.ts          lista de ferramentas, guias, categorias, páginas institucionais (fonte única)
    seo.ts, ads.ts, availability.ts, format.ts
    content.server.ts  lê content/*.md
content/
  guias/*.md
  referencia/http/*.md, tamanhos/*.md, paletas/*.md, schema/*.md
public/              og-default.png, ícones, logo
docs/
```

## Estrutura de páginas

| Endereço | Página |
|---|---|
| `/` | Home: busca de ferramentas, ferramentas mais usadas, categorias, guias recentes, checklist |
| `/ferramentas` | Catálogo por categoria (SEO, Imagem, Marca e cores, WhatsApp e redes, Código, Domínio e hospedagem) |
| `/ferramentas/:slug` | Ferramenta + texto (como usar, o que é, erros comuns, perguntas) + relacionados |
| `/guias`, `/guias/:slug` | Guias; categorias por tema (Começar, Domínio e hospedagem, SEO, Desempenho, Design, Para freelancers, Leis e LGPD) |
| `/checklist-de-lancamento` | Checklist interativo (salvo no navegador, exporta em PDF/Markdown) |
| `/referencia/http/:codigo`, `/tamanhos/:plataforma`, `/paletas/:negocio`, `/schema/:negocio` | Conjuntos do SEO programático (fase 2/3) |
| `/busca` | Busca local nas ferramentas e guias, `noindex` |
| `/sobre`, `/contato`, `/faq`, `/politica-editorial`, `/termos`, `/privacidade`, `/cookies`, `/acessibilidade`, `/mapa-do-site`, `/anuncie` | Institucionais e legais (modelo dos irmãos) |

### Ferramentas do MVP (fase 1, 10 ferramentas, todas no navegador)

1. Gerador de link do WhatsApp (+ QR code e botão flutuante para colar no site)
2. Gerador de QR code (URL, texto, Wi-Fi, Pix "copia e cola" só como texto, sem gerar cobrança)
3. Conversor/compressor de imagem para WebP/AVIF/JPG (vários arquivos, ZIP)
4. Redimensionador de imagem com tamanhos prontos (OG, Instagram, favicon)
5. Gerador de favicon (PNG em vários tamanhos + ICO + `site.webmanifest` + código para o `<head>`)
6. Gerador de meta tags e Open Graph com prévia (Google, WhatsApp, LinkedIn, X)
7. Prévia do resultado no Google (title/description com limite em pixels)
8. Gerador de robots.txt (modelos prontos: WordPress, loja, bloquear IA, etc.)
9. Gerador de schema JSON-LD (LocalBusiness, Organization, FAQ, Article, Product)
10. Gerador de paleta + verificador de contraste WCAG

Fase 2: gerador de sitemap.xml (lista colada), redirecionamentos .htaccess, gerador de slug,
minificador CSS/JS/HTML, calculadora "quanto custa um site" (orçamento do freelancer, com horas e
custos fixos que o usuário digita; nada de preço inventado), gerador de assinatura de e-mail.
Fase 3 (servidor): verificador de domínio .br (RDAP), consulta DNS, verificador de meta tags de URL.

### Guias do lançamento (fase 1, ~12, 1.000+ palavras cada, escritos com cuidado)

Como criar um site do zero em 2026 · Quanto custa um site (sem chute de preço, com o que entra na
conta) · Domínio .com.br ou .com · Como registrar domínio no registro.br · Hospedagem compartilhada,
VPS ou construtor · Checklist de lançamento explicado · O que são meta tags e Open Graph · Como deixar
o site rápido (Core Web Vitals sem jargão) · Imagens para web: WebP, tamanho e compressão · SEO local
para pequeno negócio · Botão de WhatsApp no site sem plugin · LGPD para site pequeno: o básico
(sem virar consultoria jurídica).

## MVP em fases

| Fase | Entrega |
|---|---|
| 0 | Decisões do dono (conceito, nome/marca, repo, afiliados). Protótipos de layout (3 a 4) para escolher, como no Vibecoin |
| 1 | Esqueleto (copiado do Vibecoin, sem banco), layout escolhido, institucionais, SEO base, AdSense desligado, 10 ferramentas, ~12 guias, checklist de lançamento, README + LICENSE, auditoria 375/768/1024/1440 |
| 2 | Repo novo no ar em criasite.app (Node na Hostinger, SSL, www → apex), e-mail contato@, Search Console + Bing, sitemap enviado. +6 ferramentas, +10 guias, referência HTTP e tamanhos de imagem |
| 3 | Paletas e schemas por negócio (lotes pequenos), ferramentas de servidor (RDAP, DNS, meta tags de URL), afiliados se aprovados |
| 4 | Pedido do AdSense (checklist abaixo) |

## Passos (para o Sonnet, na ordem)

Só começar o passo 3 depois que o dono responder as perguntas 1 e 2.

1. Criar a pasta `criasite/` local com os docs (já feito neste planejamento). Não tocar no repo de
   organização, no site da Hostinger nem no DNS de criasite.app.
2. Fazer 3 a 4 protótipos de layout em HTML estático (pasta `criasite/prototipos/`, fora do app), cada um
   com a home e a página de uma ferramenta, para o dono escolher. Registrar a escolha em `decisoes.md`.
3. `git init` em `criasite/`, copiar do Vibecoin: `server.js`, `server-app.js` (sem migrations e sem
   cron), `vite.config`, `react-router.config`, `tsconfig`, `app/root.tsx`, `lib/seo.ts`, `lib/ads.ts`,
   `lib/availability.ts`, `lib/format.ts`, `CookieConsent`, `StaticPage`, `ToolLayout`, rotas de
   sitemap/robots/ads.txt. Remover tudo de banco, robô, cotações e admin. Verificar: `npm run build` e
   `npm run start` sobem a home vazia sem erro.
4. Criar `docs/arquitetura.md` com a stack e pastas reais (a partir da seção acima).
5. Aplicar o layout escolhido (tokens em `app/app.css`), Header, Footer, home e catálogo de ferramentas.
   Marca própria, diferente do Respawnou e do Vibecoin.
6. `lib/site.ts` como fonte única de ferramentas/guias/categorias; menu, rodapé, home, sitemap e busca
   leem dele.
7. Leitura de `content/*.md` em `content.server.ts` (frontmatter + Markdown → HTML no servidor), rotas
   `/guias` e `/guias/:slug` com `Article` + `BreadcrumbList`. Loaders que usam o endereço usam
   `routePath` (sufixo `.data`).
8. Implementar as 10 ferramentas, uma por vez, cada uma com: lógica pura em `app/tools/<slug>/` com
   teste simples, componente, texto da página (como usar, o que é, erros comuns, 4 a 6 perguntas),
   ferramentas e guias relacionados. Criar `docs/ferramentas.md` com as regras de cada uma.
   Verificar cada uma em 375 e 1440 e com arquivo grande (imagem de 10 MB não trava a aba: usar Worker).
9. Escrever os ~12 guias (Claude redige, dono revisa). Criar `docs/conteudo.md` com o padrão de texto
   (tom, tamanho, links internos, fontes, data de atualização).
10. Checklist de lançamento interativo (localStorage, exportar).
11. Páginas institucionais e legais adaptadas dos irmãos (privacidade dizendo que arquivos das
    ferramentas não saem do navegador; termos com "uso por sua conta"; política editorial explicando
    o uso de IA na redação com revisão humana).
12. Imagem OG padrão, ícones, JSON-LD de organização, `docs/adsense.md` (copiar a estrutura do Respawnou
    e adaptar o checklist abaixo).
13. Auditoria de UX/UI em 375/768/1024/1440 e clique em todos os links do menu e rodapé.
14. README de apresentação + LICENSE (todos os direitos reservados), igual aos irmãos. `npm run build`.
15. **Só depois que o dono apagar/recriar o repo** (pergunta 3): push para o repo novo, ligar o site
    Node.js da Hostinger a ele, conferir SSL (obrigatório no .app), www → apex. O deploy sobrescreve o
    conteúdo atual do site: confirmar com o dono antes.
16. Search Console (propriedade de Domínio, TXT no DNS), sitemap, Bing importado do Search Console.

## Critérios para pedir o AdSense

- [ ] Site no domínio próprio há 3 a 4 semanas, HTTPS ok
- [ ] Pelo menos 15 ferramentas, **todas** com texto próprio de 400+ palavras abaixo da ferramenta
- [ ] Pelo menos 20 guias de 1.000+ palavras, originais, com data e autor ("Equipe CriaSite" ou nome do dono)
- [ ] Sobre, Contato (e-mail que funciona), Política editorial, Privacidade, Cookies, Termos, Mapa do site
- [ ] Menu claro, busca, nenhuma página vazia ou "em breve" indexada (`availability.ts`)
- [ ] Search Console sem erros graves e páginas indexadas (meta: 30+)
- [ ] Banner de cookies + Modo de Consentimento v2, `ads.txt` pronto para ligar
- [ ] Conjuntos programáticos só com páginas que passaram no checklist de qualidade
- [ ] Espaços de anúncio planejados **fora** da área da ferramenta: nada de anúncio colado em botão
      de "Baixar", "Gerar" ou "Copiar" (risco de clique acidental, proibido pela política); anúncio
      abaixo do resultado e dentro do texto

## Riscos e cuidados

- **Repo antigo e deploy:** o site da Hostinger está ligado ao repo de organização. Um deploy novo
  sobrescreve o conteúdo; apagar o repo antes de desligar o auto-deploy pode deixar o site quebrado.
  Ordem segura fica para o dono decidir (pergunta 3); o Sonnet não executa sem confirmação.
- **.app é HSTS:** sem SSL o domínio não abre em nenhum navegador. Conferir o SSL primeiro.
- **Conteúdo fino:** ferramenta sem texto e páginas programáticas em massa são o maior risco de
  reprovação. Seguir o freio da seção de SEO programático.
- **Conteúdo com IA:** guias redigidos pelo Claude precisam de revisão do dono e de experiência real
  (capturas próprias, passo a passo testado no registro.br/Hostinger). Sem isso, viram "mais um texto".
- **Temas legais (LGPD, política de privacidade):** só orientação geral, com aviso de que não é
  consultoria jurídica. Gerador de política de privacidade fica fora até o dono decidir (pergunta 5).
- **Desempenho:** é um site sobre sites rápidos; precisa passar bem no PageSpeed. Bibliotecas pesadas
  (compressão de imagem) carregam só na página da ferramenta (`import()` dinâmico), nunca no bundle geral.
- **Ferramentas de servidor (fase 3):** SSRF, abuso e limite da Hostinger. Limite por IP, cache,
  timeout curto, bloquear IP privado/localhost, sem páginas indexadas de resultado.
- **Afiliados:** se entrarem, sempre identificados e sem transformar guia em propaganda; comparativo só
  com dado conferido na página oficial (como o comparador de corretoras do Vibecoin).
- **React Router:** loaders que leem o endereço usam `routePath`; rodar `npm run build` antes de todo push.

## Como verificar

- `npm run build` sem erro; `npm run start` e abrir a home, uma ferramenta e um guia.
- Cada ferramenta: funciona sem internet depois de carregada (prova de que nada vai ao servidor),
  aba "Rede" do navegador sem envio do arquivo, celular 375 px sem rolagem lateral.
- `view-source` de ferramenta e guia: title, description, canonical, OG, JSON-LD presentes.
- `/sitemap.xml` lista só páginas com conteúdo; `/robots.txt` aponta o sitemap.
- PageSpeed (celular) de home, uma ferramenta e um guia: meta 90+ em desempenho e SEO.
- Depois do deploy: `https://criasite.app` abre, `www` redireciona para o apex, SSL válido.

## Perguntas em aberto (do dono)

1. **Conceito:** aprova a recomendação (A + C, B leve na fase 3)? Ou prefere só um dos três?
2. **Nome e marca:** fica "CriaSite"? Escrita (CriaSite, Cria Site, criasite)? Quer também registrar
   criasite.com.br para proteger a marca (o .app pode soar estrangeiro para parte do público)?
3. **Repositório:** quando apagar o repo de organização antigo e criar o novo? O novo fica na mesma
   organização ou na conta pessoal (como respawnou e vibecoin)? Algo do repo antigo deve ser guardado?
4. **Afiliados:** aceita links de afiliado (hospedagem/domínio) além do AdSense?
5. **Gerador de política de privacidade/termos:** tem muita busca, mas é tema jurídico. Entra (com aviso
   forte) ou fica de fora?
6. **Autoria dos guias:** assinar com seu nome (ajuda em E-E-A-T) ou "Equipe CriaSite"?
7. **Plano da Hostinger:** confirmar no hPanel se o plano Business ainda permite mais um app Node.js
   (se não, o MVP sai em modo estático/prerender).
