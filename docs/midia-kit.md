# Mídia kit em "Anuncie" (`/anuncie`), piloto para os 4 sites

Plano escrito pelo planejador em 2026-11-19. Executor: siga os passos na ordem; cada um diz como conferir.
As decisões de conteúdo, design e regras já estão tomadas aqui. Onde a decisão é do dono, está em "Perguntas em aberto",
com a recomendação que vale até ele responder (o plano já está escrito com a recomendação aplicada).

Marcação usada em todo o plano:
- **[COMUM]**: igual nos 4 sites. Copiar o arquivo sem mudar nada (só o caminho do import, se o site for diferente).
- **[CRIASITE]**: dado, texto ou visual só deste site. Nos outros sites é reescrito (ver Parte G).

## Objetivo

Transformar a página `/anuncie` em um mídia kit honesto e útil: quem lê, números com fonte e data (ou o aviso de que
ainda não há), formatos que o site pode vender de verdade, regras do patrocínio, o que recusamos, contato e uma versão
para salvar em PDF pelo próprio navegador. A estrutura (tipos, regras puras, testes, CSS de impressão) é feita para ser
copiada para animeprofile, respawnou e vibecoin.

## Contexto

- Hoje `app/routes/advertise.tsx` é uma página curta no `StaticPage`: diz que o site exibe AdSense, que parcerias
  diretas (patrocínio de ferramenta, conteúdo patrocinado) são tratadas pelo e-mail com assunto "Comercial", 3 regras e
  3 itens "não aceitamos". Não tem público, números, formatos detalhados, prazos nem versão para imprimir.
- O site está no ar desde **2026-11-14**. Dados que existem hoje:
  - contagem de conteúdo (ferramentas em `TOOLS`; guias e notícias publicados via `repo().sectionStats()`): real e automática;
  - `posts.views` (contador próprio em `app/routes/view.ts`, ignora robôs, admin e repetição em 30 min): só conta
    notícias e guias, não ferramentas, e começou junto com o site;
  - Google Search Console (propriedade de domínio, desde 2026-11-15): poucos dias de dados.
  - O painel de contadores de visitas (planejado hoje a partir do animeprofile, depois copiado para os 4 sites) ainda não existe.
- **Atenção:** `app/lib/mock-data.ts` tem `views` fictícios (3200, 2100...). O mídia kit **nunca** lê nada do mock: sem
  banco, a contagem automática some da página (ver C4).
- `/politica-editorial` (seção `patrocinio`), `/contato` (cartão "Comercial") e `/privacidade` (seção `compartilhamento`)
  falam de patrocínio e precisam ficar coerentes com o mídia kit (textos exatos na Parte F).
- Links pagos já seguem a regra do Google: `isAffiliateLink()` em `site.ts` + `rel="sponsored noopener"` em `RichText.tsx`.
- Irmãos: `respawnou/app/routes/advertise.tsx` e `vibecoin/app/routes/advertise.tsx` existem (o do Respawnou promete
  "mídia kit enviado sob pedido" e vende "Display" direto); o animeprofile novo **não tem** `/anuncie`.

## Decisões principais (resumo)

1. **Números:** arquivo de dados manual (`data.ts`) para audiência, com `updatedAt` por número, + contagem de conteúdo
   automática lida do banco com cache de 1 h. Número sem fonte e data não compila no teste. Número com mais de 90 dias
   some e vira "em atualização". Audiência **sob pedido** (print do Search Console por e-mail) até o dono decidir publicar.
2. **Sem gráfico** agora: não há 3 meses de dados reais. O tipo já reserva `series` para um mini-gráfico futuro.
3. **Preço:** "Sob consulta" em todos os formatos (campo `price: null`); o dono pode preencher depois.
4. **Formatos (3 + 1 informativo):** guia patrocinado, oferta em guia relacionado, apoio a uma ferramenta; banner AdSense
   explicado como "não vendido direto".
5. **Layout:** continua no `StaticPage` (mesma moldura, data, navegação lateral e rodapé das institucionais), com 2 props
   novas opcionais (`toc` e `printHeader`); todo o conteúdo vem de um componente `MediaKit.tsx` com mapa de classes `SKIN`.
6. **PDF:** só CSS `@media print` + botão `window.print()`. Nada de PDF no servidor nem serviço pago. A4, até 2 páginas.
7. **SEO:** `/anuncie` **indexada** (já está no sitemap via `DOC_PAGES`), com FAQ de 4 perguntas e JSON-LD `FAQPage`.
8. **Contato:** e-mail com assunto `[Comercial]` (o que já existe) e corpo pré-preenchido; `mailto()` ganha `body` opcional.
9. **Conteúdo patrocinado de verdade (selo no post, faixa na ferramenta)** só é construído quando o 1º contrato fechar
   (Parte H). A página já pode ficar no ar antes disso: os prazos de entrega cobrem a construção.

## Arquivos afetados

Novos:
- `app/lib/media-kit/types.ts` **[COMUM]**: tipos do mídia kit.
- `app/lib/media-kit/rules.ts` **[COMUM]**: funções puras (estado de cada número, validade, validação do arquivo de dados, corpo do e-mail, datas).
- `app/lib/media-kit/data.ts` **[CRIASITE]**: o mídia kit do site (textos, números manuais, formatos, regras, FAQ).
- `app/components/MediaKit.tsx` **[COMUM na estrutura, CRIASITE nas classes]**: a tela inteira; classes concentradas no objeto `SKIN` no topo.
- `scripts/test-midia-kit.ts` **[COMUM]**: testes das regras + validação do `data.ts` real.

Alterados:
- `app/routes/advertise.tsx`: reescrito (loader, meta com FAQ JSON-LD, usa `MediaKit`).
- `app/components/StaticPage.tsx`: props opcionais `toc` e `printHeader`; `print:hidden` no índice e na lateral.
- `app/lib/content.server.ts`: `getInventory()` (contagem de conteúdo, cache 1 h, `null` sem banco).
- `app/lib/site.ts`: `mailto(subject, body?)`; datas em `DOC_PAGES` (`/anuncie`, `/politica-editorial`, `/privacidade`, `/contato`).
- `app/app.css`: bloco `@media print` e ajuste da tabela do mídia kit.
- `app/root.tsx`: `print:hidden` no topo marinho e no link "Pular para o conteúdo".
- `app/components/Footer.tsx` e `app/components/CookieConsent.tsx`: `print:hidden` no elemento raiz.
- `app/routes/editorial.tsx`, `app/routes/privacy.tsx`, `app/routes/contact.tsx`: textos da Parte F.
- `package.json`: script `"test:midia-kit": "node scripts/test-midia-kit.ts"`.
- `docs/arquitetura.md` (pasta `lib/media-kit/`), `docs/README.md`, `docs/decisoes.md`.

Regra para `app/lib/media-kit/` (igual a `app/lib/uptime/`): **nenhum import com `~/`**, imports relativos com
extensão `.ts` (`import type { MediaKit } from "./types.ts"`), sem `enum`, sem `import.meta.env`. Por isso `data.ts`
repete o nome, a URL e o e-mail do site como texto (não importa `SITE`); o teste confere que batem.

---

## Parte A: dados e regras [COMUM]

### A1. Tipos (`app/lib/media-kit/types.ts`)

```ts
/** Data no formato AAAA-MM-DD. */
export type IsoDate = string;

export interface MediaKitMetric {
  id: string;                 // ex.: "gsc-clicks-28d"
  label: string;              // ex.: "Cliques vindos do Google"
  value: number | null;       // null = ainda sem dado público
  unit?: string;              // ex.: "cliques"
  period: string;             // ex.: "últimos 28 dias"
  source: string;             // ex.: "Google Search Console"
  updatedAt: IsoDate | null;  // obrigatório quando value != null
  note?: string;              // aparece pequeno abaixo do número
  /** Futuro (mini-gráfico): só com 3+ pontos reais, cada um com data. Não usar agora. */
  series?: { date: IsoDate; value: number }[];
}

export interface Persona { code: string; title: string; who: string; seeks: string[] }

export interface AdFormat {
  id: string;                 // ex.: "guia-patrocinado"
  code: string;               // ex.: "FORMATO 01"
  name: string;
  summary: string;
  includes: string[];
  excludes: string[];
  delivery: string;           // prazo de entrega
  duration: string;           // tempo no ar
  marking: string;            // como é marcado
  price: string | null;       // null = "Sob consulta"
  available: boolean;         // false = card some da tela e do PDF
}

export interface MediaKit {
  version: 1;
  updatedAt: IsoDate;         // revisão do kit inteiro (aparece no topo, no PDF e na validade)
  validDays: number;          // 90: validade do PDF e idade máxima de um número manual
  brand: { name: string; domain: string; email: string; mailSubject: string; launchedAt: IsoDate };
  pitch: { title: string; lead: string };
  audience: { intro: string; personas: Persona[]; why: string[]; categories: string[]; note: string };
  metrics: MediaKitMetric[];  // só os manuais; os automáticos vêm do loader
  audienceOnRequest: string | null; // texto da caixa "números sob pedido"; null = não mostra
  formats: AdFormat[];
  adsenseNote: { title: string; text: string };
  sharedExcludes: string;     // frase única "nenhum formato garante...", usada também no PDF
  rules: string[];
  refused: string[];
  process: { title: string; text: string }[];
  firstEmail: string[];       // "o que enviar no primeiro e-mail"
  responseTime: string;
  mailTemplate: string[];     // linhas do corpo do e-mail (ver B9)
  faq: { q: string; a: string }[];
}

/** Linha pronta para a tela. */
export type MetricState = "ok" | "sem-dados" | "vencido";
export interface MetricRow extends MediaKitMetric { state: MetricState; auto: boolean }
```

### A2. Regras puras (`app/lib/media-kit/rules.ts`)

Funções (todas puras, datas como texto `AAAA-MM-DD`, contas em UTC para não depender do fuso):

1. `addDays(date: IsoDate, days: number): IsoDate`.
2. `daysBetween(a: IsoDate, b: IsoDate): number` (b − a, inteiro).
3. `validUntil(kit: MediaKit): IsoDate` = `addDays(kit.updatedAt, kit.validDays)`.
4. `isKitExpired(kit, today): boolean` = `today > validUntil(kit)`.
5. `metricState(m, today, maxAgeDays): MetricState`:
   - `value === null` → `"sem-dados"`;
   - `daysBetween(m.updatedAt, today) > maxAgeDays` → `"vencido"`;
   - senão `"ok"`.
6. `resolveMetrics(auto: MediaKitMetric[], manual: MediaKitMetric[], today, maxAgeDays): MetricRow[]`: automáticos
   primeiro (com `auto: true`), depois os manuais, cada um com `state`.
7. `validateKit(kit, today): string[]` devolve a lista de erros (vazia = ok). Erros:
   - número com `value != null` e sem `source` ou sem `updatedAt`;
   - `updatedAt` (do kit ou de um número) com formato errado ou **no futuro** em relação a `today`;
   - `series` com menos de 3 pontos ou ponto sem data;
   - formato com `includes` ou `excludes` vazios, ou `price` igual a `""`;
   - **frase de audiência sem fonte**: qualquer texto do kit (pitch, audience, formats, rules, faq, process,
     adsenseNote, audienceOnRequest) que case com
     `/\b(milhares|milh(ão|ões)|mil (visitas|visitantes|acessos|leitores|usuários))\b|\d[\d.,]*\s*(visitas|visitantes|acessos|leitores|usuários|pageviews|seguidores)\b/i`
     ou com `/(prêmio|premiad|líder|nº ?1|número 1|o maior|a maior)/i`. Número de audiência só existe em `metrics`.
8. `mailtoHref(kit, formatName?: string): string`: `mailto:<email>?subject=<[mailSubject] >&body=<corpo>`; corpo =
   `kit.mailTemplate` com a linha `Formato de interesse:` completada pelo nome do formato (ou `ainda não sei`), linhas
   unidas com `\r\n`, tudo com `encodeURIComponent`. O assunto segue o padrão de `site.ts`: `[Comercial] `.
9. `formatDateBR(date: IsoDate): string` → `DD/MM/AAAA` (sem `Intl`, para o teste rodar igual em qualquer máquina).
10. `todayInBrazil(now = new Date()): IsoDate` usando `Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" })`.

### A3. Testes (`scripts/test-midia-kit.ts`) [COMUM]

Mesmo estilo de `scripts/test-fora-do-ar.ts` (asserts simples, contagem no fim, `process.exit(1)` se falhar). Casos mínimos:

- `addDays("2026-11-19", 90) === "2027-02-17"`; `addDays("2026-12-31", 1) === "2027-01-01"`; `daysBetween("2026-11-14", "2026-11-19") === 5`.
- `metricState`: `value null` → `sem-dados`; 90 dias → `ok`; 91 dias → `vencido`.
- `validateKit`: número com valor e sem data → erro; data no futuro → erro; texto "milhares de leitores" no `pitch` → erro;
  "mais de 2.000 acessos" em uma resposta da FAQ → erro; `price: ""` → erro; `series` com 2 pontos → erro.
- `mailtoHref(kit, "Guia patrocinado")` contém `subject=%5BComercial%5D%20`, contém `Guia%20patrocinado` e `%0D%0A`.
- `formatDateBR("2026-11-19") === "19/11/2026"`.
- **O kit real:** `validateKit(MEDIA_KIT, todayInBrazil())` devolve `[]`; `MEDIA_KIT.brand.email === "contato@criasite.app"`;
  `MEDIA_KIT.brand.domain === "criasite.app"`; todo formato `available` tem `price === null` ou texto não vazio.

Comando: `node scripts/test-midia-kit.ts` (ou `npm run test:midia-kit`). Tem que passar antes de cada commit que mexe em `data.ts`.

---

## Parte B: conteúdo do CriaSite (`app/lib/media-kit/data.ts`) [CRIASITE]

Exporta `export const MEDIA_KIT: MediaKit = { ... }`. Textos exatos abaixo (copiar sem reescrever).

### B1. Cabeçalho

- `version: 1`, `updatedAt: "<data do dia da execução>"`, `validDays: 90`.
- `brand: { name: "CriaSite", domain: "criasite.app", email: "contato@criasite.app", mailSubject: "Comercial", launchedAt: "2026-11-14" }`.
- `pitch.title`: **Fale com quem está criando o próprio site**
- `pitch.lead`: **Donos de pequenos negócios, freelancers e iniciantes usam o CriaSite para escolher hospedagem e plataforma, deixar o site rápido e aparecer no Google. Aqui a sua marca entra no assunto certo, marcada como patrocínio.**

### B2. Público (`audience`)

- `intro`: **O CriaSite é para quem quer colocar um site no ar e mantê-lo funcionando sem depender de agência: gente que faz quase tudo sozinha e precisa de ferramenta que resolve e de explicação em português claro.**
- `personas`:
  1. `code: "PERFIL 01"`, `title: "Dono de pequeno negócio"`, `who: "Loja, consultório, restaurante, prestador de serviço. Quer o site, o WhatsApp e o Google funcionando juntos."`,
     `seeks: ["domínio e hospedagem confiáveis, com preço claro", "aparecer no Google e no Perfil da Empresa", "QR code, link do WhatsApp e imagens leves"]`
  2. `code: "PERFIL 02"`, `title: "Freelancer e quem faz site para clientes"`, `who: "Designers, desenvolvedores e social media que entregam sites para pequenos clientes."`,
     `seeks: ["ferramentas rápidas: favicon, meta tags, sitemap, contraste", "plataformas e hospedagem para indicar aos clientes", "o que mudou no Google e no WordPress"]`
  3. `code: "PERFIL 03"`, `title: "Quem está criando o primeiro site"`, `who: "Iniciantes, inclusive quem está criando o site com ajuda de IA."`,
     `seeks: ["passo a passo do domínio ao lançamento", "escolher entre WordPress, construtor de sites ou IA", "segurança básica e o que não fazer"]`
- `why` (título na tela: "Por que anunciar aqui"):
  1. **Quem chega aqui está decidindo: qual hospedagem, qual domínio, qual plataforma, que ferramenta usar. É a hora em que uma marca útil é lembrada.**
  2. **Os assuntos do site são os do seu produto: hospedagem e domínio, plataformas e construtores, design e imagens, Google e SEO, segurança e IA para criar sites.**
  3. **Conteúdo em português do Brasil, escrito para quem não é técnico.**
  4. **Poucos formatos, todos marcados: o leitor sabe o que é anúncio e, por isso, confia no resto.**
- `categories` (título na tela: "Marcas que combinam com o CriaSite"): `["Hospedagem", "Registro de domínio", "Plataformas e construtores de site", "E-mail profissional", "Design, imagens e fontes", "SEO e Search Console", "IA para criar sites", "Cursos para quem cria site"]`
- `note`: **Perfil descrito a partir do que o site publica e das ferramentas que oferece. Não é uma pesquisa com leitores.**

### B3. Números manuais (`metrics`)

Hoje nenhum número de audiência é publicado (ver pergunta 2). Os 2 manuais ficam cadastrados com `value: null`, para a
tabela mostrar o estado "ainda sem dado público" e o dono só preencher depois:

```ts
{ id: "gsc-clicks-28d", label: "Cliques vindos do Google", value: null, unit: "cliques", period: "últimos 28 dias", source: "Google Search Console", updatedAt: null },
{ id: "gsc-impressions-28d", label: "Vezes que o site apareceu no Google", value: null, unit: "impressões", period: "últimos 28 dias", source: "Google Search Console", updatedAt: null },
```

Reservado para quando o painel de visitas existir (Parte H3, não cadastrar agora): `id: "reads-30d"`, "Leituras de guias e notícias".

- `audienceOnRequest`: **O CriaSite está no ar desde 14/11/2026 e ainda está juntando o primeiro trimestre de dados de audiência. Se você precisa dos números atuais (cliques e impressões no Google), pedimos por e-mail e enviamos com a captura de tela do Google Search Console, com a data.**

Rotina do dono para publicar (quando decidir): Search Console → Desempenho → Resultados da pesquisa → "Últimos 28 dias";
copiar "Total de cliques" e "Total de impressões" para `value`, pôr a data do dia em `updatedAt` e em `MEDIA_KIT.updatedAt`,
rodar o teste, commit. Repetir todo mês (dia 1 a 5). Passados 90 dias sem atualizar, o número some sozinho.

### B4. Números automáticos (montados no loader, não ficam no `data.ts`)

| id | label | value | period | source |
|---|---|---|---|---|
| `tools` | Ferramentas gratuitas no ar | `TOOLS.length` | hoje | Contagem do próprio site |
| `guides` | Guias publicados | total da seção `guias` | hoje | Contagem do próprio site |
| `news` | Notícias publicadas | soma das outras seções | hoje | Contagem do próprio site |

`updatedAt` = `todayInBrazil()`. Sem banco (mock) ou se a consulta falhar: as 3 linhas não entram (nem `tools`, para a
tabela não ficar com uma linha solta) e os "fatos" do topo somem.

### B5. Formatos (`formats`)

`sharedExcludes`: **Nenhum formato garante posição no Google, cliques ou vendas, nem muda notícias, guias ou o funcionamento das ferramentas.**

1. **Guia patrocinado** (`id: "guia-patrocinado"`, `code: "FORMATO 01"`, `price: null`, `available: true`)
   - `summary`: **Um guia novo, escrito pela Equipe CriaSite, sobre um assunto ligado ao seu produto e útil para quem cria site. Por exemplo: como migrar o site de hospedagem ou como montar uma loja virtual pequena.**
   - `includes`: `["pauta combinada com a marca e texto escrito pela nossa equipe, no padrão dos guias do site", "selo “Patrocinado por” com o nome da marca no topo do guia e nos cards", "até 3 links para o site da marca, com rel=\"sponsored\"", "número de leituras contado pelo site, enviado 30 dias depois da publicação"]`
   - `excludes`: `["publicar texto pronto da marca como se fosse nosso", "comparação que coloque a marca como “a melhor” ou esconda pontos de atenção da categoria", "aprovação de opinião: a marca confere só os dados do próprio produto"]`
   - `delivery`: **até 15 dias úteis depois da pauta aprovada**
   - `duration`: **no ar por pelo menos 12 meses**
   - `marking`: **selo “Patrocinado” no topo e nos cards, nome da marca e links com rel="sponsored"**
2. **Oferta em guia relacionado** (`id: "oferta-em-guia"`, `code: "FORMATO 02"`, `price: null`, `available: true`)
   - `summary`: **Uma caixa separada do texto, marcada como “Patrocinado”, no fim de um guia do mesmo assunto. Por exemplo: uma oferta de e-mail profissional no guia de e-mail com domínio próprio.**
   - `includes`: `["caixa com o nome da marca, uma frase de até 160 caracteres e um link com rel=\"sponsored\"", "escolha do guia entre os do assunto do produto", "30 dias no ar, renováveis"]`
   - `excludes`: `["mudança no texto do guia ou na ordem das recomendações", "exclusividade de categoria"]`
   - `delivery`: **até 5 dias úteis depois de receber a frase e o link**
   - `duration`: **30 dias, renováveis**
   - `marking`: **caixa com rótulo “Patrocinado”, fora do corpo do guia, e link com rel="sponsored"**
3. **Apoio a uma ferramenta** (`id: "apoio-ferramenta"`, `code: "FORMATO 03"`, `price: null`, `available: true`)
   - `summary`: **Uma faixa discreta abaixo do painel de uma ferramenta, com o logo da marca, uma frase curta e um link.**
   - `includes`: `["logo (guardado no próprio CriaSite) e frase de até 90 caracteres", "link com rel=\"sponsored\"", "escolha entre as ferramentas no ar", "30 dias no ar, renováveis"]`
   - `excludes`: `["mudança no funcionamento ou no resultado da ferramenta", "pop-up, vídeo automático, script, pixel ou cookie da marca", "acesso ao que a pessoa digita ou envia na ferramenta (isso não sai do navegador)"]`
   - `delivery`: **até 5 dias úteis depois de receber o logo, a frase e o link**
   - `duration`: **30 dias, renováveis**
   - `marking`: **faixa com rótulo “Patrocinado” e link com rel="sponsored"**

`adsenseNote`: título **Banners do Google AdSense**; texto: **Quando estão ligados, os anúncios em banner do site são do Google AdSense: o Google escolhe e vende esses anúncios, não nós. Por isso não vendemos espaço de banner direto nem mudamos onde eles aparecem.**

### B6. Regras do patrocínio (`rules`)

1. **Todo conteúdo pago leva o selo “Patrocinado” no topo, com o nome de quem pagou. O selo aparece também nos cards e nas listas do site.**
2. **Todo link pago leva o atributo rel="sponsored", como o Google pede para links pagos. Não vendemos link sem essa marcação.**
3. **Patrocínio não muda notícias, guias nem o funcionamento das ferramentas. Nenhum guia ganha ou perde menção por causa de anunciante.**
4. **Conteúdo patrocinado é escrito pela Equipe CriaSite. A marca confere os dados do próprio produto (nome, preço, recursos) antes da publicação, mas não aprova opinião nem pede para apagar pontos de atenção.**
5. **Nenhum texto pago promete posição no Google, vendas ou resultado garantido.**
6. **Sem rastreamento de terceiros: logos e imagens ficam guardados no próprio CriaSite, sem script, pixel ou cookie da marca. Os links podem ter parâmetros de campanha (UTM).**
7. **Avaliamos cada proposta e podemos recusar qualquer uma. Só publicamos depois de combinar por e-mail o texto, o link, a data e o período.**
8. **Seguimos o Código de Defesa do Consumidor (art. 36: a publicidade tem que ser identificada como tal, fácil e imediatamente) e as orientações do CONAR sobre identificação de publicidade.**

### B7. O que não aceitamos (`refused`)

1. **apostas, cassinos on-line, rifas e jogos de azar;**
2. **“renda extra garantida”, marketing multinível, pirâmides e cursos que prometem faturamento;**
3. **investimentos e criptomoedas com promessa de ganho;**
4. **produtos de saúde, estética ou emagrecimento com promessa de resultado;**
5. **venda de links e de backlinks, redes de blogs para SEO e “primeira página do Google garantida”;**
6. **seguidores, curtidas e avaliações falsas;**
7. **temas, plugins e programas piratas ou “nulled”, e ferramentas que coletam dados dos visitantes sem dizer isso com clareza;**
8. **empréstimo com juros escondidos, conteúdo adulto, armas e propaganda política.**

### B8. Como funciona (`process`) e prazos

1. `title: "Você escreve"` — **Mande um e-mail com o assunto [Comercial] contando a marca, o produto e o formato que interessa.**
2. `title: "Respondemos em até 5 dias úteis"` — **Dizemos se a proposta se encaixa e mandamos as condições. Se não aceitarmos, dizemos isso na resposta.**
3. `title: "Combinamos tudo por e-mail"` — **Pauta ou frase, link, data de início, período e valor. Nada é publicado sem esse acordo escrito.**
4. `title: "Publicamos marcado"` — **No prazo do formato, com o selo “Patrocinado” e o link com rel="sponsored".**

`responseTime`: **Respondemos em até 5 dias úteis.**

### B9. Primeiro e-mail (`firstEmail`) e modelo (`mailTemplate`)

`firstEmail` (título na tela: "O que mandar no primeiro e-mail"):
1. **nome da empresa e endereço do site;**
2. **o produto ou serviço e para quem ele é;**
3. **o formato que interessa e o período;**
4. **se você já tem o material (logo, frase, link) ou quer que a gente escreva;**
5. **o orçamento aproximado, se já tiver.**

`mailTemplate` (cada item é uma linha; a linha vazia é `""`):
```
Olá, equipe CriaSite.
""
Empresa ou marca:
Site:
Produto ou serviço:
Formato de interesse:
Período desejado:
Orçamento aproximado (opcional):
```

### B10. Perguntas frequentes (`faq`) — também viram JSON-LD

1. **O CriaSite publica texto pronto enviado pela marca?** — **Não. O conteúdo patrocinado é escrito pela Equipe CriaSite, leva o selo “Patrocinado” no topo e os links pagos levam rel="sponsored". A marca confere só os dados do próprio produto.**
2. **Vocês garantem posição no Google ou número de cliques?** — **Não. Nenhum formato garante posição na busca, cliques ou vendas. Entregamos o espaço combinado, marcado, pelo prazo combinado e, no guia patrocinado, o número de leituras contado pelo site.**
3. **De onde vêm os números deste mídia kit?** — **Da contagem do próprio site (ferramentas, guias e notícias publicados) e, para audiência, do Google Search Console. Cada número mostra a fonte e a data. Quando ainda não há dado confiável, a página diz isso.**
4. **Quanto custa anunciar?** — **Os valores são sob consulta, porque dependem do formato e do período. Escreva para contato@criasite.app com o assunto [Comercial] e respondemos em até 5 dias úteis.**

---

## Parte C: a tela

### C1. Direção visual

"Ficha técnica honesta": a mesma página institucional do CriaSite (fundo `day`, cards brancos, laranja só para o que
importa), com um bloco marinho no topo que resume o kit em 5 segundos. Nada de foto de banco de imagens, gráfico de
enfeite, contador animado ou selo de "confiança". O olho vê **primeiro** o título e a frase do bloco marinho com os 3
números de conteúdo e o botão de e-mail; **depois** a tabela de números com fonte e data e os perfis de leitor;
**por último** formatos, regras, recusas, FAQ e contato.

### C2. Moldura: `StaticPage` com 2 props novas (justificativa)

Continua no `StaticPage` porque o mídia kit é uma página institucional: mantém o título com "Última atualização" (data de
`DOC_PAGES`), a navegação entre documentos e o mesmo rodapé, e o executor não duplica layout. O que muda em `StaticPage.tsx`
(compatível com as outras páginas):

1. Prop `toc?: { id: string; title: string }[]`. Quando vier, o índice ("Nesta página", lateral em ≥1024 px e `details` no
   celular) usa essa lista em vez de `sections`; `showToc` passa a ser `(toc ?? sections).length > 2`. O `Toc` recebe a
   lista `{ id, title }[]`.
2. Prop `printHeader?: ReactNode`, renderizada como **primeiro filho de `<main>`**, dentro de
   `<div className="hidden print:block">`.
3. `print:hidden` no `<details>` do índice móvel e no `<aside>`.

Título da página: `title="Anuncie no CriaSite"`; `lead="Mídia kit com quem lê, números com fonte e data, formatos marcados e as regras que valem para todo patrocínio."`.
Todo o resto vai em `children` = `<MediaKit ... />`. `sections` fica vazio.

### C3. Tokens (todos já existem em `app/app.css`; não criar cor nova)

| Uso | Token / valor |
|---|---|
| Fundo da página | `day` `#eef1fb` |
| Cards | `card` `#ffffff`, borda `line` `#dde3f6`, borda forte `line-2` `#cdd5ef` |
| Texto | `ink` `#0c1a4b`; secundário `muted` `#5a6798` (5,6:1 no branco) |
| Links e rótulos no claro | `violet` `#c24e06` (4,9:1 no branco); hover `violet-deep` `#9a3d04` |
| Chip de preço | fundo `violet-soft` `#fff0e5` + texto **`violet-deep` `#9a3d04`** (6,2:1). Não usar `violet` aqui: dá 4,4:1 e reprova. |
| Bloco marinho | fundo `night` `#0c1a4b`, texto `moon` `#fff`, secundário `moon-muted` `#b9c3ea`, números `glow` `#ff9a4d` (7,9:1), linhas `night-line-2` `#2a3c80` |
| Botão principal no marinho | fundo `brand` `#ff7a1a` + texto **`night`** (6,4:1). Não usar texto branco no laranja (2,9:1). |
| Marca "inclui" | `up` `#0b7a44` (só ícone, `aria-hidden`) |
| Fontes | Schibsted Grotesk (texto); JetBrains Mono (`.num` e códigos "FORMATO 01") |
| Raios | blocos grandes `rounded-[22px]`; cards de perfil `rounded-[18px]`; chips `rounded-full`; botões `rounded-xl` |
| Sombra | nenhuma (o site não usa); separação por borda |
| Espaço entre seções | `gap-12` (48 px) no `MediaKit`; dentro dos cards `p-5 sm:p-6`, `gap-3` |

### C4. Estrutura, na ordem (ids = âncoras do índice)

Cabeçalho de cada seção numerada: `<section id=… aria-labelledby=…-t>` + `<h2 id=…-t>` com o número em
`font-mono text-base text-violet mr-3` (mesmo desenho dos `h2` do `StaticPage`), `text-2xl sm:text-3xl font-extrabold tracking-[-0.02em]`.

**0. Resumo (sem número, sem entrada no índice)**: `div.mk-hero` `rounded-[22px] bg-night text-moon p-6 sm:p-8 flex flex-col gap-5`.
- Linha 1: `eyebrow` em `text-glow`: `MÍDIA KIT · ATUALIZADO EM DD/MM/AAAA` (data de `MEDIA_KIT.updatedAt`). Se `isKitExpired`:
  `MÍDIA KIT · EM REVISÃO` e, logo abaixo do lead, `text-sm text-moon-muted`: "Algumas informações podem estar desatualizadas. Peça as atuais por e-mail."
- `p` grande (não é `h2`; o `h1` já está acima): `pitch.title`, `text-2xl sm:text-[32px] font-extrabold leading-tight`.
- `pitch.lead` em `text-moon-muted text-base sm:text-lg max-w-[60ch]`.
- **Fatos** (só se houver números automáticos): `<dl class="grid grid-cols-3 gap-3 border-t border-night-line-2 pt-5">`;
  cada item: `dd` com o número em `.num text-[32px] sm:text-[40px] font-bold text-glow leading-none` e `dt` embaixo
  (`order` visual com flex-col-reverse) em `text-xs sm:text-sm text-moon-muted`: "ferramentas grátis", "guias", "notícias".
  Abaixo do `dl`, `text-xs text-moon-muted`: "Contagem do próprio site em DD/MM/AAAA. No ar desde 14/11/2026."
- **Ações** (`flex flex-wrap gap-3 print:hidden`):
  - "Falar sobre um anúncio" → `<a href={mailtoHref(kit)}>` `inline-flex min-h-12 items-center rounded-xl bg-brand px-5 font-bold text-night hover:bg-glow`;
  - "Salvar em PDF ou imprimir" → `<button type="button" onClick={() => window.print()}>` `inline-flex min-h-12 items-center gap-2 rounded-xl border border-night-line-2 px-5 font-bold text-moon hover:border-glow`, ícone de impressora em SVG inline 18 px `aria-hidden` (retângulo + bandeja, traço 2, `currentColor`).
  - abaixo, `text-xs text-moon-muted`: "No diálogo de impressão, escolha “Salvar como PDF”."

**01 Números** (`id="numeros"`): tabela em `div.table-wrap.mk-table`.
- `<caption>` (visível, `text-left px-4 py-3 text-sm font-bold text-ink`): "Números do CriaSite, com fonte e data".
- Colunas (`<th scope="col">`): MÉTRICA · VALOR · PERÍODO · FONTE · ATUALIZADO EM. Cada linha: `<th scope="row">` com o label.
- Valor: `.num font-bold text-ink text-right`, formatado `toLocaleString("pt-BR")` + `unit` em `text-muted text-sm`.
- Estado `sem-dados`: célula de valor com texto `ainda sem dado público` em `text-sm text-muted` (nada de "—" sozinho);
  ATUALIZADO EM mostra `—` com `<span class="sr-only">sem data</span>`.
- Estado `vencido`: valor `em atualização` (`text-sm text-muted`) e ATUALIZADO EM com a data antiga + "(mais de 90 dias)".
- Em <640 px: PERÍODO e FONTE ficam `hidden sm:table-cell`; o `th` da linha ganha, embaixo do label, `<span class="block text-xs font-normal text-muted sm:hidden">últimos 28 dias · Google Search Console</span>`.
  No CSS, `.mk-table table { min-width: 0 }` (a `.table-wrap` padrão força 520 px e geraria rolagem em 390 px).
- Abaixo da tabela, se `audienceOnRequest`: caixa `rounded-[14px] border-l-4 border-violet bg-violet-soft p-4 text-[15px] text-ink`
  com o texto e o link "Pedir os números atuais" (`mailtoHref(kit)`, `font-bold text-violet-deep underline`).
- Sem nenhuma linha (sem banco e sem manuais): no lugar da tabela, a mesma caixa com o texto de `audienceOnRequest`.
- **Sem gráfico.** Mini-gráfico só quando algum número tiver `series` com 3+ pontos (Parte H4).

**02 Quem lê** (`id="publico"`):
- `audience.intro` em `text-lg text-[#26325f] max-w-[65ch]`.
- Perfis: `ul.grid gap-3 sm:grid-cols-3`; card `rounded-[18px] border border-line bg-card p-5 flex flex-col gap-2`:
  código em `font-mono text-xs font-bold text-violet`, título `text-lg font-extrabold`, `who` em `text-[15px] text-muted`,
  rótulo `text-xs font-bold text-ink mt-1` "Procura", lista `text-[15px]` com marcador `•` em `text-violet`.
  (No site há 796 px de coluna em 1280: 3 colunas de ~256 px cabem; abaixo de 640 px, 1 coluna.)
- `h3` "Por que anunciar aqui" (`text-xl font-extrabold mt-2`) + `ol` dos 4 itens de `why`, número em `font-mono text-violet`.
- `h3` "Marcas que combinam com o CriaSite" + `ul.flex flex-wrap gap-2` de chips `rounded-full border border-line-2 bg-card px-3 py-1.5 text-sm font-semibold`.
- `audience.note` em `text-xs text-muted`.

**03 Formatos** (`id="formatos"`): `ul.flex flex-col gap-4` de cards (só `available`), 1 por linha em todas as larguras.
- Card `rounded-[22px] border border-line bg-card p-5 sm:p-6 flex flex-col gap-4 mk-card`. **Sem hover** (o card não é link).
- Topo: `code` em `font-mono text-xs font-bold text-violet`; `h3` `text-2xl font-extrabold`; `summary` em `text-[16px] text-muted`.
- Meio: `div.grid gap-4 sm:grid-cols-2`: coluna "Inclui" (`h4 text-sm font-bold`, itens com ✓ SVG 16 px em `text-up`, `aria-hidden`)
  e coluna "Não inclui" (itens com ✕ SVG em `text-muted`), essa coluna inteira `print:hidden`.
- Base: `dl` em `flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 text-sm`: Prazo, No ar, Marcação (cada `dt` em
  `text-xs font-bold text-muted uppercase tracking-wide`, `dd` em `text-ink`), e o preço como chip
  `rounded-full bg-violet-soft px-3 py-1 font-bold text-violet-deep`: `Sob consulta` quando `price === null`.
- Link no fim do card (`print:hidden`): "Pedir este formato →" → `mailtoHref(kit, format.name)`, `font-bold text-violet hover:text-violet-deep hover:underline`.
- Depois da lista: `p` com `sharedExcludes` em `text-[15px] font-semibold text-ink`.
- Card informativo do AdSense: `rounded-[22px] border border-dashed border-line-2 p-5`, `h3` `text-lg font-extrabold`, texto `text-muted`. Sem link.

**04 Regras do patrocínio** (`id="regras"`): `div.article-body max-w-[720px]` com `ol` dos 8 itens de `rules`
(o `article-body` já dá o estilo de lista do site). Último parágrafo: "Os detalhes estão na [política editorial](/politica-editorial#patrocinio)."

**05 O que não aceitamos** (`id="nao-aceitamos"`): `div.article-body` com `ul` dos 8 itens de `refused`.

**06 Como funciona** (`id="como-funciona"`): `ol.grid gap-3 sm:grid-cols-2` de 4 passos; cada um
`rounded-[18px] border border-line bg-card p-5`: número `font-mono text-2xl font-bold text-violet`, título `font-extrabold`, texto `text-[15px] text-muted`.

**07 Perguntas frequentes** (`id="perguntas"`, `print:hidden`): os 4 itens de `faq` no mesmo `<details>` de `app/routes/faq.tsx`
(copiar as classes de lá: `rounded-[14px] border border-line bg-card`, `+` que gira 45°). O texto tem que ser idêntico ao do JSON-LD.

**08 Contato** (`id="contato"`): bloco `rounded-[22px] bg-night text-moon p-6 sm:p-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end`.
- Esquerda: `p` `text-2xl font-extrabold` "Vamos conversar"; `p` `text-moon-muted`: "Escreva para **contato@criasite.app** com o assunto **[Comercial]**. " + `responseTime`;
  `h3` `text-sm font-bold text-moon mt-2` "O que mandar no primeiro e-mail" + `ul` de `firstEmail` em `text-[15px] text-moon-muted`.
- Direita (`flex flex-col gap-3 print:hidden`): botão principal "Escrever e-mail" (mesma classe do resumo) e botão secundário
  "Copiar endereço" (`navigator.clipboard.writeText(email)`): ao copiar, texto vira "Endereço copiado" por 2 s; em erro,
  "Não deu para copiar: selecione o endereço". Mensagem em `<span role="status" aria-live="polite">`.

**Rodapé de impressão** (`hidden print:block`, depois do 08): ver D3.

Índice (`toc`) = os 8 itens acima com os mesmos títulos: Números, Quem lê, Formatos, Regras do patrocínio, O que não aceitamos, Como funciona, Perguntas frequentes, Contato.

### C5. Larguras

- **390 px:** tudo em 1 coluna; fatos do resumo em 3 colunas estreitas (número 32 px); tabela sem rolagem horizontal
  (colunas PERÍODO/FONTE escondidas, info abaixo do label); perfis empilhados; cards de formato com "Inclui" e "Não inclui"
  empilhados; botões do resumo e do contato com largura total (`w-full sm:w-auto`). Índice no `details` "Nesta página (8)".
- **1280 px:** coluna de conteúdo (~796 px) + lateral de 280 px com índice fixo e navegação dos documentos; perfis em 3
  colunas; "Inclui/Não inclui" lado a lado; "Como funciona" em 2×2; contato em 2 colunas (texto | botões).

### C6. Acessibilidade

- Um só `h1` (do `StaticPage`); `h2` por seção; `h3` dentro. O título do resumo é `p`, não cabeçalho.
- Tabela com `caption`, `th scope="col"` e `th scope="row"`. Nenhuma célula só com traço sem texto para leitor de tela.
- Foco visível: o global do site (`outline 2px violet`; no marinho `.night` já troca para `glow`); conferir que o bloco do
  resumo e o do contato têm a classe `night` para herdar o foco claro, ou aplicar `focus-visible:outline-glow` nos botões.
- Todos os ícones `aria-hidden`; botões com texto.
- Alvos de toque ≥ 44 px (`min-h-12` nos botões, `min-h-11` nos links do card).
- Sem animação além de `transition-colors` (o site já zera transições com `prefers-reduced-motion`).

### C7. Estados

| Situação | O que aparece |
|---|---|
| Sem banco / mock / consulta falhou | sem fatos no resumo; tabela só com os manuais (hoje: 2 linhas "ainda sem dado público") + caixa "sob pedido" |
| Número manual preenchido | valor, período, fonte, data |
| Número com mais de 90 dias | "em atualização" + data antiga |
| Kit vencido (`today > updatedAt + 90`) | eyebrow "EM REVISÃO" + aviso no resumo |
| Formato com `available: false` | some da tela e do PDF |
| Copiar endereço | normal / "Endereço copiado" / erro |
| Carregando | não existe (SSR); o botão de imprimir só funciona depois de hidratar, o que é imediato |

---

## Parte D: versão para salvar em PDF / imprimir

### D1. Decisão

Só CSS de impressão + botão `window.print()`. O navegador gera o PDF ("Salvar como PDF"). Sem PDF no servidor, sem
biblioteca, sem serviço. A4 retrato, **até 2 páginas**.

### D2. CSS (`app/app.css`, no fim do arquivo) [COMUM, trocando só as cores]

```css
@media print {
  @page { size: A4; margin: 14mm 14mm 16mm; }
  html, body { background: #fff !important; }
  body { font-size: 10.5pt; color: #0c1a4b; }
  ins.adsbygoogle, .google-auto-placed, .adsbygoogle, iframe { display: none !important; }
  main#conteudo { max-width: none; padding: 0; }
  main#conteudo h1 { font-size: 22pt; }
  main#conteudo > header { padding-bottom: 8pt; gap: 4pt; }
  .mk { gap: 14pt !important; }
  .mk h2 { font-size: 14pt; }
  .mk h3 { font-size: 11.5pt; }
  .mk-hero, .mk-contact { background: #fff !important; color: #0c1a4b !important; border: 1.5pt solid #0c1a4b; padding: 12pt !important; }
  .mk-hero *, .mk-contact * { color: #0c1a4b !important; }
  .mk-hero .num { color: #c24e06 !important; font-size: 22pt !important; }
  .mk-card, .mk-section-head, .mk-table tr, .mk-persona { break-inside: avoid; }
  .mk h2, .mk h3 { break-after: avoid; }
  .mk a { color: inherit; text-decoration: none; }
  .mk-table table { font-size: 9pt; }
  .mk-table th, .mk-table td { padding: 4pt 6pt; }
}
.mk-table table { min-width: 0; }
```

Mais as classes `print:hidden` já listadas (topo, rodapé, banner de cookies, link "Pular", índice, lateral, botões,
"Não inclui", links "Pedir este formato", FAQ). Observação para o executor: na impressão a largura útil do A4 é ~718 px
CSS, então valem as classes `sm:` (640) e **não** valem `md:`/`lg:`. Por isso o plano só usa `sm:` nas grades.
`.mk` é a classe do `div` raiz do `MediaKit` (`flex flex-col gap-12`).

### D3. Cabeçalho e rodapé do PDF

- `printHeader` (passado ao `StaticPage`): `div.flex items-center justify-between border-b-2 border-night pb-3 mb-4`:
  à esquerda `<Logo className="text-ink!" />` (de `components/ui.tsx`; o `!` vence o `text-moon` padrão; o quadrado
  laranja do logo é SVG e imprime mesmo sem "gráficos de fundo"); à direita, alinhado à direita, em 9 pt:
  `criasite.app/anuncie` · `contato@criasite.app` · `Mídia kit atualizado em DD/MM/AAAA`.
- Rodapé (último filho do `.mk`, `hidden print:block border-t border-line pt-3 text-[8.5pt] text-muted`):
  **Mídia kit do CriaSite, atualizado em DD/MM/AAAA e válido até DD/MM/AAAA. Números e condições podem mudar; a versão atual fica em criasite.app/anuncie. Valores sob consulta pelo e-mail contato@criasite.app.**
  (datas de `updatedAt` e `validUntil(kit)`).

### D4. O que entra no PDF

Página 1: cabeçalho do PDF, título e lead, resumo (sem botões), Números, Quem lê. Página 2: Formatos (sem "Não inclui",
com a frase `sharedExcludes`), card AdSense, Regras, O que não aceitamos, Como funciona, Contato, rodapé.
Se passar de 2 páginas, esconder na impressão, nesta ordem, até caber: (1) as listas "Procura" dos perfis, (2) o
`h3` "Marcas que combinam" e os chips, (3) "Como funciona". Anotar no commit o que foi escondido.

---

## Parte E: SEO e AdSense

- **Indexar** (`seo()` sem `noindex`; já está no `sitemap.xml` por `DOC_PAGES`). Motivo: marcas e agências procuram
  "anunciar em site de criação de sites"; um mídia kit público com regras claras mostra transparência (bom para a revisão
  do AdSense, que quer ver quem mantém o site e como ele se financia). O risco de "página fina" não existe aqui: a página
  passa de 900 palavras de texto próprio. Não pôr caixas de anúncio nela (o AdSense automático decide sozinho).
- `meta`:
  - título: `Anuncie: mídia kit, formatos e regras` → vira "Anuncie: mídia kit, formatos e regras | CriaSite";
  - descrição (~143 caracteres, abaixo de 155): **Mídia kit do CriaSite: quem lê, números com fonte e data, formatos de patrocínio marcados e o que não aceitamos. Fale com a equipe pelo e-mail.**
  - JSON-LD `FAQPage` montado de `MEDIA_KIT.faq` (mesmo código de `app/routes/faq.tsx`). Desde 2023 o Google só mostra o
    resultado rico de FAQ para sites de governo e saúde; o JSON-LD fica pela consistência e para outros buscadores, sem
    expectativa de destaque. As perguntas ficam visíveis na página (regra do Google).
- Rodapé: o link "Anuncie" já existe (`DOC_PAGES`). Só atualizar a data `updated` de `/anuncie`.
- Conteúdo patrocinado e AdSense: a política do Google aceita conteúdo patrocinado se estiver marcado e com links
  `rel="sponsored"` (ou `nofollow`); o que derruba é link pago sem marcação e texto que engana o leitor. As regras B6 cobrem isso.

---

## Parte F: textos em outras páginas (exatos)

1. **`app/routes/editorial.tsx`, seção `patrocinio`**: trocar o `<p>` inteiro por:
   > Conteúdo pago é marcado como **patrocinado** no topo da página e nos cards, com o nome de quem pagou, e é escrito
   > pela Equipe CriaSite: a marca confere só os dados do próprio produto. Links pagos e de afiliados (por exemplo, de
   > hospedagem) são sinalizados no texto e levam o atributo `sponsored`. Patrocínio e afiliados nunca mudam notícias,
   > guias ou o funcionamento das ferramentas, e nenhum texto pago promete posição no Google ou resultado. Podemos recusar
   > qualquer proposta. Formatos, regras e o que não aceitamos estão no [mídia kit](/anuncie).

   (`<strong>patrocinado</strong>`, `<code>sponsored</code>`, link com `TextLink`.)
2. **`app/routes/privacy.tsx`, seção `compartilhamento`**: depois do `</ul>`, novo parágrafo:
   > Anunciantes e parceiros comerciais recebem só números agregados, como o total de leituras de uma página, nunca dados que identifiquem você.
3. **`app/routes/contact.tsx`**, cartão "Comercial": texto `Mídia kit, formatos e regras para anunciar.` e `cta="Ver o mídia kit"`.
4. **`app/lib/site.ts`**, `DOC_PAGES`: `updated` = data da execução em `/anuncie`, `/politica-editorial`, `/privacidade` e `/contato`.
5. **`app/lib/site.ts`**, `mailto`: `export const mailto = (subject: string, body?: string) => \`mailto:${SITE.email}?subject=${encodeURIComponent(\`[${subject}] \`)}${body ? \`&body=${encodeURIComponent(body)}\` : ""}\`;`
   (as chamadas atuais continuam iguais). O `MediaKit` usa `mailtoHref` de `rules.ts`, que faz o mesmo sem depender de `site.ts`.
6. Termos de uso: **sem mudança** (já dizem que anúncio é do AdSense e não é recomendação).

---

## Parte G: reuso nos outros 3 sites

### G1. O que é dado e o que é layout

| Peça | Tipo | Nos outros sites |
|---|---|---|
| `lib/media-kit/types.ts` | dado (forma) | copiar igual |
| `lib/media-kit/rules.ts` | lógica pura | copiar igual |
| `scripts/test-midia-kit.ts` | teste | copiar; trocar as 2 linhas que conferem e-mail e domínio |
| `lib/media-kit/data.ts` | dado (conteúdo) | **reescrever** (marca, público, formatos, recusas, FAQ) |
| `components/MediaKit.tsx` | layout | copiar a estrutura e as seções; **trocar só o objeto `SKIN`** (classes do tema) e o ícone |
| bloco `@media print` | layout | copiar; trocar as 3 cores (`#0c1a4b`, `#c24e06`, borda) pelas do site |
| `StaticPage` props `toc` e `printHeader` | layout | repetir a mesma mudança (respawnou e vibecoin têm `StaticPage`; o do respawnou tem `accent`) |
| `getInventory()` | dado do banco | adaptar às seções/tabelas do site |
| textos da Parte F | texto | reescrever com a marca do site |

`SKIN` (no topo de `MediaKit.tsx`): um objeto `const SKIN = { hero: "...", heroNum: "...", btnPrimary: "...", btnGhost: "...", card: "...", code: "...", chip: "...", price: "...", callout: "...", h2: "...", h2Num: "...", contact: "..." } as const;`.
Toda classe de cor/forma usada no componente sai dele; classes de estrutura (`grid`, `flex`, `gap`, `sm:grid-cols-2`) ficam no JSX.

### G2. O que muda por site

| Site | Público e posicionamento | Números automáticos | Formatos | Recusas extras | Observações |
|---|---|---|---|---|---|
| **respawnou** (games) | quem joga em pt-BR, PC/console/celular | notícias, jogos do Arcade | matéria patrocinada, apoio a um jogo do Arcade, módulo da home; **tirar "Display" vendido direto** se o AdSense for o banner | casas de aposta e "bets", sites de skins/caixas pagas, cheats, contas e chaves piratas | PLANEJAMENTO diz: mídia kit só **depois do AdSense** (24/11 a 01/12); a página atual promete "mídia kit sob pedido" e precisa trocar o texto |
| **vibecoin** (cripto/finanças) | quem começa em cripto e finanças pessoais | notícias, guias, ferramentas | guia patrocinado, apoio a ferramenta/comparador | promessa de rendimento, "sinais" e robôs de trade, pirâmides, empresas sem autorização do Banco Central para ativos virtuais, recomendação de investimento | **regra extra:** patrocínio nunca entra no comparador de corretoras nem muda a ordem dele; aviso "não é recomendação de investimento" em todo patrocinado |
| **animeprofile** (anime, comunidade) | fãs de anime, muitos jovens | notícias, animes no catálogo, perfis (se houver) | matéria patrocinada, apoio a quiz/agenda | álcool, apostas, conteúdo adulto, produtos piratas | **público com menores:** nada de publicidade dirigida a crianças (CDC art. 37 e regras do CONAR); **não tem `/anuncie`** no site novo: criar rota + item em `DOC_PAGES` |

### G3. Passos de adaptação (por site)

1. Copiar `types.ts`, `rules.ts`, `test-midia-kit.ts` (trocar e-mail/domínio no teste).
2. Escrever `data.ts` do site seguindo a Parte B como modelo (mesmos campos; textos novos; `metrics` manuais com `value: null`).
3. Rodar o teste até `validateKit` dar `[]`.
4. Fazer a mudança do `StaticPage` (C2).
5. Copiar `MediaKit.tsx`, reescrever o `SKIN` com os tokens do site; conferir contraste dos botões e do chip de preço.
6. `getInventory()` com as contagens do site; reescrever `advertise.tsx` (ou criar, no animeprofile).
7. CSS de impressão com as cores do site; `print:hidden` em topo, rodapé, banner de cookies.
8. Textos da Parte F com a marca do site.
9. Mesma conferência da seção "Como verificar".

Tamanho por site: **P/M, ~2 a 3 h** (vibecoin e respawnou); **M, ~3 a 4 h** no animeprofile (rota nova e público jovem).

---

## Parte H: depois (não executar agora)

1. **Selo "Patrocinado" nos posts** (só quando fechar o 1º guia patrocinado): migration com `sponsor_name VARCHAR(80) NULL`
   e `sponsor_url VARCHAR(500) NULL` em `posts`; com `sponsor_name`, a página do post mostra a faixa
   "Patrocinado por X" acima do título, o card ganha a pílula "Patrocinado" e `RichText` põe `rel="sponsored noopener"`
   em todo link externo daquele post. Plano próprio na hora.
2. **Faixa de apoio na ferramenta** e **caixa de oferta no guia**: lista `SPONSORS` em `data.ts` com `{ slot, name, text, url, logo, start, end }`;
   aparece só entre `start` e `end` (some sozinha no fim do período). Logo em `public/patrocinio/`. Plano próprio.
3. **Número automático de leituras** quando o painel de visitas existir: linha `reads-30d` lida da tabela do painel com
   cache de 1 h, mostrada só depois de 30 dias completos de coleta (antes: "coletando desde DD/MM/AAAA").
4. **Mini-gráfico**: barras simples em SVG (sem biblioteca) de cliques por mês, só com 3+ meses reais em `series`.

---

## Passos de execução

1. **Tipos e regras:** criar `app/lib/media-kit/types.ts` (A1) e `rules.ts` (A2). Conferir: `npm run typecheck` sem erro.
2. **Teste:** criar `scripts/test-midia-kit.ts` (A3) ainda sem os casos do kit real; script `test:midia-kit` no `package.json`.
   Conferir: `node scripts/test-midia-kit.ts` passa.
3. **Dados:** criar `app/lib/media-kit/data.ts` com os textos da Parte B, `updatedAt` = data do dia. Ligar os casos do kit
   real no teste. Conferir: teste passa e `validateKit` devolve `[]`.
4. **Inventário:** `getInventory()` em `content.server.ts`: `null` se `!hasDatabase()`; senão `{ tools: TOOLS.length, guides, news }`
   a partir de `repo().sectionStats()` (conferir que conta só `published` com `published_at <= agora`; se não contar,
   filtrar), cache de 1 h igual ao `availabilityCache`, `try/catch` devolvendo `null`. Conferir: typecheck.
5. **`mailto` com corpo** em `site.ts` (F5). Conferir: `/contato` continua abrindo o e-mail com o assunto certo.
6. **`StaticPage`:** props `toc` e `printHeader`, `print:hidden` no índice e na lateral (C2). Conferir: `/termos`, `/faq` e
   `/politica-editorial` iguais a antes em 390 e 1280.
7. **`MediaKit.tsx`:** montar as seções C4 com o `SKIN` (G1), estados C7, acessibilidade C6. Ícones em SVG inline.
8. **`advertise.tsx`:** `loader` devolve `{ inventory: await getInventory(), today: todayInBrazil() }`; o componente monta os
   números automáticos (B4), chama `resolveMetrics(auto, MEDIA_KIT.metrics, today, MEDIA_KIT.validDays)` e passa tudo ao
   `MediaKit`; `meta` com título, descrição e JSON-LD (Parte E); `StaticPage` com `title`, `lead`, `toc`, `printHeader`.
9. **Impressão:** bloco `@media print` (D2), `print:hidden` em `root.tsx` (div do topo marinho e link "Pular"), `Footer.tsx`
   e `CookieConsent.tsx`; rodapé do PDF (D3). Conferir com a impressão (ver abaixo); ajustar D4 se passar de 2 páginas.
10. **Textos legais:** Parte F (editorial, privacidade, contato, datas em `DOC_PAGES`).
11. **Docs:** `docs/arquitetura.md` (linha `media-kit/` em `lib/` e "Anuncie (mídia kit)" na tabela de rotas), `docs/README.md`
    (status ✅, Próximos passos, Pendências suas), `docs/decisoes.md` (execução).
12. **Fechamento:** `npm run typecheck` → `node scripts/test-midia-kit.ts` → `npm run build` → 1 commit
    ("Mídia kit em /anuncie (piloto)") → push. Marcar `[x]` em "criasite: mídia kit em 'Anuncie', implementação do piloto" no `PLANEJAMENTO.md`.

## Como verificar

Tela (`npm run dev`, sem banco = estado "sem dados"; com banco local, se houver, = com fatos):
- [ ] **390 px:** sem rolagem horizontal em nenhum ponto (inclusive a tabela); índice "Nesta página (8)" abre e leva às 8 âncoras;
  botões com largura total e ≥ 44 px; perfis e formatos empilhados.
- [ ] **1280 px:** lateral com índice e documentos; perfis em 3 colunas; "Inclui/Não inclui" lado a lado; contato em 2 colunas.
- [ ] Sem banco: nenhum número no resumo; tabela com 2 linhas "ainda sem dado público"; caixa "sob pedido" visível.
  **Nenhum valor do `mock-data.ts` aparece.**
- [ ] Com banco: os 3 fatos batem com `/ferramentas`, `/guias` e a contagem de notícias no painel.
- [ ] Todo número na tela tem fonte e data ao lado; procurar na página (Ctrl+F) por "mil", "milhares", "visitantes", "líder": zero.
- [ ] "Falar sobre um anúncio" e "Pedir este formato" abrem o e-mail com assunto `[Comercial] ` e o corpo do modelo
  (no segundo, com o nome do formato preenchido). "Copiar endereço" copia e mostra a mensagem.
- [ ] Teclado: Tab passa por todos os botões e links com foco visível (claro no marinho, laranja no claro).
- [ ] Leitor de tela/inspeção: `caption` na tabela, `th scope` certos, um só `h1`.
- [ ] Chip "Sob consulta" em `#9a3d04` sobre `#fff0e5`; botão laranja com texto marinho (conferir na ferramenta `/ferramentas/contraste-cores`).

Impressão (Chrome, "Salvar como PDF", A4, margens padrão, **sem** "Gráficos de plano de fundo" e depois **com**):
- [ ] no máximo 2 páginas; nada cortado no meio de um card ou de uma linha da tabela;
- [ ] sem topo marinho do site, sem rodapé do site, sem banner de cookies, sem anúncio, sem botões, sem índice, sem FAQ;
- [ ] cabeçalho do PDF com logo, `criasite.app/anuncie`, e-mail e data; rodapé com "válido até" = data + 90 dias;
- [ ] texto legível nas duas opções (resumo e contato viram fundo branco com borda).

Outros:
- [ ] `view-source` de `/anuncie`: `<meta name="robots" content="index, follow, ...">`, título e descrição da Parte E, JSON-LD `FAQPage` com as 4 perguntas idênticas às da tela.
- [ ] `/sitemap.xml` com `/anuncie` e a data nova.
- [ ] `/politica-editorial#patrocinio` com o texto novo e link para `/anuncie`; `/privacidade` com o parágrafo novo; `/contato` com "Ver o mídia kit".
- [ ] `npm run typecheck`, `node scripts/test-midia-kit.ts` e `npm run build` sem erro.

## Riscos e cuidados

- **Promessa falsa:** nenhum texto pode dizer que o site "tem milhares de leitores", "é líder" ou garante resultado. O
  `validateKit` barra os casos comuns; mesmo assim, ao editar textos, reler B6 e a FAQ.
- **Número defasado:** cada número manual some em 90 dias sem atualização; o kit inteiro mostra "EM REVISÃO". O dono
  precisa da rotina mensal (B3) quando decidir publicar números.
- **Mock em produção:** `getInventory()` devolve `null` sem banco; nunca ler `views` nem contagens do mock.
- **Dados pessoais:** o mídia kit não coleta nada (só links `mailto`). Patrocinador nunca recebe dado de visitante, só
  totais (texto novo da privacidade). Formatos não carregam script/pixel de terceiros.
- **Promessa operacional:** prazos (5 dias úteis para responder, 15 para o guia, 12 meses no ar) viram compromisso público;
  a Parte H precisa ser feita dentro do prazo do 1º contrato. Por isso a recomendação é só publicar patrocinado depois do AdSense (pergunta 8).
- **Afiliado x patrocínio:** o guia de hospedagem já tem o afiliado da Hostinger; uma caixa de outra hospedagem no mesmo
  guia precisa ficar separada do aviso de afiliado (pergunta 4).
- **Impressão:** `md:`/`lg:` não valem no A4; usar só `sm:`. Anúncios automáticos podem injetar blocos: o CSS os esconde.
- **Build:** rodar `npm run build` antes do push; o loader não lê o endereço, então não há risco com o sufixo `.data`.
- **Repositório público:** nada de preço negociado, nome de cliente ou e-mail pessoal em `data.ts`.

## Estimativa

**M, ~3 a 4 h** de execução: tipos/regras/teste ~45 min; dados (copiar textos) ~30 min; `StaticPage` + `MediaKit` ~1 h 30;
impressão ~45 min; textos legais e docs ~20 min. Cada um dos outros sites: P/M (Parte G).

## Perguntas em aberto (com recomendação; a recomendação vale até o dono responder)

1. **Preço na página: "sob consulta" ou faixas?** Recomendo **sob consulta** até fechar os 2 ou 3 primeiros contratos;
   o campo `price` aceita texto ("a partir de R$ X") quando o dono quiser.
2. **Publicar números de audiência agora?** Recomendo **não**: com 5 dias de Search Console os números não dizem nada.
   Até fevereiro de 2027 (1º trimestre completo), "sob pedido, com captura do Search Console". Depois, publicar cliques e
   impressões de 28 dias e atualizar todo mês.
3. **Prazos e permanência** (resposta em 5 dias úteis; guia em 15 dias úteis; caixa e faixa em 5; guia patrocinado no ar
   por 12 meses; caixa e faixa por 30 dias renováveis)? Recomendo **como está**.
4. **Caixa patrocinada de outra hospedagem no guia que tem o afiliado da Hostinger?** Recomendo **aceitar, sem
   exclusividade**, com a caixa no fim do guia e separada do aviso de afiliado.
5. **A marca pode conferir os dados do próprio produto no guia patrocinado?** (a página antiga dizia "o anunciante não
   revisa nem aprova textos"). Recomendo **sim, só fatos do produto**, como está na regra 4; nos textos editoriais continua sem revisão.
6. **Assunto do e-mail: manter `[Comercial]` ou trocar para `[Anuncie]`?** Recomendo **manter `[Comercial]`** (já usado e possivelmente filtrado na caixa).
7. **`/anuncie` indexada ou `noindex`?** Recomendo **indexada** (Parte E).
8. **Quando aceitar o 1º patrocínio?** Recomendo **publicar o mídia kit já** (ajuda a revisão do AdSense a ver como o site
   se financia), mas **só publicar conteúdo patrocinado depois da aprovação do AdSense**, para a revisão olhar só o editorial.
9. **Relatório de leituras no guia patrocinado** (usa `posts.views`, que já existe)? Recomendo **incluir**, como está.
10. **Cobrança e nota fiscal:** o site é mantido sem CNPJ. Antes do 1º contrato o dono precisa decidir como emitir
    cobrança (pessoa física, MEI ou outra forma; vale falar com um contador). Recomendo **não citar isso na página** e
    resolver antes de fechar o 1º patrocínio.
