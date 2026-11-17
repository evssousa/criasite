# Novo eixo: criar e cuidar de sites com IA

**Status: plano pronto (2026-11-17), aguardando as respostas das Perguntas em aberto.** Nada executado ainda.
Plano criado em 2026-11-17 pelo planejador. Executor: seguir as **fatias** (ordem e dias na seção K; passos de cada uma na seção J).

## Objetivo

Fazer do CriaSite a referência em português para quem quer criar ou cuidar de um site usando IA **do jeito certo**:
um roteiro próprio (`/criar-site-com-ia`) com 8 guias originais e atemporais, capas no estilo da casa, notícias do robô
sobre IA aplicada a sites (sem abrir a porta para notícia de IA genérica) e, depois, 2 ferramentas no navegador.

## Contexto

- O pedido do dono (2026-11-17): conteúdo sobre desenvolvimento de sites com IA (assistentes e agentes de código,
  arquivos de instruções, skills, servidores MCP, o jeito correto de trabalhar, dicas). Público: donos de pequenos
  negócios, freelancers e iniciantes. Pouca gente faz isso direito, e quase não há material sério em pt-BR.
- Hoje: 12 guias na seção `guias` (migrations 003 e 006), todos ligados às 7 etapas da `/trilha` (`TRAIL` em
  `app/lib/site.ts`). Regras de texto, validador e geração do SQL em [guias.md](guias.md) (seções A, D, E) e
  [guias-leva2.md](guias-leva2.md) (seção A). Capas por script em [capas.md](capas.md) (`scripts/make-capas.mjs`).
- A editoria `ia` existe para as notícias do robô (descrição genérica: "IA para criar, escrever e cuidar de sites").
- O robô tem um filtro de assunto (`app/lib/robot/topic.ts`, feito em 2026-11-16): `OFF_TOPIC_PATTERNS` barra chips,
  aparelhos, bolsa, cripto, política, esporte e troca de CEO em qualquer fonte; fontes em `GENERIC_FEEDS` (hoje só
  "The Verge (IA)") só passam se o título ou o começo do resumo casar com `SITE_TOPIC`, que **não tem** termos de
  assistentes de código, agentes, vibe coding ou MCP. Resultado: notícia boa sobre "GitHub Copilot abre pull requests
  sozinho" vinda de fonte genérica é barrada; e não há fonte dedicada ao tema.
- Decisão do dono (2026-11-17, `README.md`): a notícia da Nvidia sai; a de **Harvard sobre o impacto ambiental dos data
  centers de IA fica**, porque o site também terá assuntos de IA. Ou seja: o filtro deve aceitar IA aplicada a sites **e**
  a IA em geral que interesse a quem cria sites (impacto ambiental e custo da IA, IA na busca e no tráfego, conteúdo feito
  com IA), mas continuar barrando chips, regulação, processos, negócios de empresas, AGI e política (seção F.2).
- O "Leia também" do fim de cada post (`app/routes/post.tsx`) lista os 3 posts mais recentes da **mesma seção**. Se os
  guias de IA entrarem na seção `guias` sem ajuste, os 12 guias clássicos passam a sugerir só guias de IA.
- `posts.tag` (VARCHAR 40) substitui o rótulo da editoria no kicker (`content.server.ts`, `kicker: post.tag ?? ...`).
  Nos 12 guias atuais ele é `NULL` (kicker "Guia").

---

## A. Estrutura: onde o conteúdo mora (recomendação)

Opções avaliadas:

| Opção | Prós | Contras |
|---|---|---|
| 1. Nova editoria `/ia-sites` (novo `SectionSlug`) | separação total | mexe em `SectionSlug`, `routes.ts`, robô (`ROBOT_SECTIONS`), menu, sitemap, capa padrão; URLs novas fora de `/guias`; 2 lugares para "guias" confundem |
| 2. Só guias com tag em `/guias` | zero código | sem página de entrada para o tema; o termo "criar site com IA" não tem página própria; mistura na lista |
| 3. Segunda trilha completa igual à `/trilha` (faixa na home, etc.) | paralelismo total | duplica a faixa da home (poluição no topo), dois progressos competindo |
| **4. Guias em `/guias` com `tag = 'Com IA'` + página-hub `/criar-site-com-ia` com roteiro de 6 etapas e checklist** | URLs e validador iguais aos de hoje; uma página forte para o termo principal; o roteiro vira sumário e link interno; checklist dá motivo para voltar; mudança pequena | uma rota nova e um ajuste no "Leia também" |

**Recomendação: opção 4.** Os guias continuam guias (mesma rota `post-guias`, mesmo JSON-LD `Article`, mesma
`/guias`), só ganham o kicker "Com IA". A página-hub é estática (dados em `site.ts`, como a `TRAIL`) e busca os guias no
banco pelos slugs. A `/trilha` continua sendo "do domínio ao primeiro visitante" e ganha um box apontando para o roteiro.

### A.1 O roteiro (dados em `app/lib/site.ts`)

| # | id (âncora) | título | short | texto (1 a 2 frases) | guias (ordem) | ferramentas |
|---|---|---|---|---|---|---|
| 1 | `planejar` | Planeje antes de pedir | Planejar | Escreva em um parágrafo o que o site precisa ter, para quem é e o que fica de fora. Domínio, hospedagem e contas no seu nome continuam sendo decisão sua, não da IA. | G1 | — |
| 2 | `contexto` | Dê contexto ao assistente | Contexto | Um arquivo de instruções com as regras do projeto evita repetir tudo a cada conversa e deixa as respostas mais previsíveis. | G3 | — |
| 3 | `pedir` | Peça em partes pequenas | Pedir | Uma página ou uma mudança por pedido, com objetivo, público e restrições. Salve uma versão antes de cada pedido para poder voltar. | G2 | `contraste-cores` |
| 4 | `revisar` | Revise e teste o que a IA fez | Revisar | Leia o que mudou, teste no celular e confira formulários, títulos, contraste e peso das imagens antes de publicar. | G7, G8 | `meta-tags`, `comprimir-imagem` |
| 5 | `publicar` | Proteja e publique | Publicar | Senha, chave de API e dado de cliente não vão para o chat nem para o código. O checklist de lançamento vale para qualquer site, feito com IA ou não. | G6, `checklist-de-lancamento-do-site` | `status-http` |
| 6 | `alem` | Vá além: skills e MCP | Ir além | Para quem já trabalha com assistente de código: receitas reutilizáveis (skills) e conexões com outras ferramentas (MCP), com permissões mínimas. | G4, G5 | — |

(G1 a G8 = slugs da seção B.) O passo 5 reaproveita um guia clássico: o roteiro de IA desemboca no lançamento comum.

### A.2 Mudança mínima de código (fatia F3)

1. **`app/lib/site.ts`**
   - Tipo e dados:
     ```ts
     export interface AiStep { id: string; title: string; short: string; text: string; guides: string[]; tools: ToolSlug[] }
     export const AI_TRACK: AiStep[] = [ /* tabela A.1 */ ];
     export const AI_TAG = "Com IA";
     ```
   - Descrição da editoria `ia` em `SECTIONS`: "IA para criar e cuidar de sites: assistentes e agentes de código,
     geradores de site, MCP e o que já funciona de verdade."
   - `DOC_PAGES`: `updated` da `/politica-editorial` para a data da execução (seção H).
2. **`app/lib/repo/types.ts` + `app/lib/content.server.ts` (`ListOptions`) + `mysql.server.ts` + `mock.server.ts`**:
   `PostFilter` ganha `slugs?: string[]` e `tag?: string | null`.
   - MySQL (`where`): `slugs` → `p.slug IN (?, ?, …)` (se a lista vier vazia, `1 = 0`); `tag` string → `p.tag = ?`;
     `tag === null` → `p.tag IS NULL`; `undefined` → sem filtro.
   - Mock: mesmas regras (`(p.tag ?? null) === f.tag`).
3. **`app/lib/prefs.ts`**: extrair a lógica de `useTrail` para `useChecklist(key, validIds)` e manter
   `useTrail()` = `useChecklist("criasite_trail", TRAIL ids)` (comportamento igual). Novo
   `useAiTrack()` = `useChecklist("criasite_trilha_ia", AI_TRACK ids)`. Atualizar o comentário do topo e
   `docs/arquitetura.md` (seção "Estado no navegador": nova chave).
4. **Nova rota** `route("criar-site-com-ia", "routes/ai-track.tsx")` em `app/routes.ts` (antes de `trilha`).
   Loader: `listPosts({ section: "guias", slugs: <todos os slugs de AI_TRACK>, perPage: 20 })` → mapa slug→PostView.
   Guia que não existir no banco simplesmente não aparece (nada de "em breve"). `meta`: seção D.4 (SEO) e capa do G1
   como `og:image` (`image: "/capas/criar-site-com-ia-do-jeito-certo.webp"`, `imageSize: [1200, 675]`, `imageAlt` = alt do G1).
   `noindex` se nenhum guia existir (banco sem a migration).
5. **`app/lib/availability.ts` (`navFor`)**: depois de Trilha, `...(a.sections.includes("guias") ? [{ to: "/criar-site-com-ia", label: "Site com IA" }] : [])`.
   Isso já leva o hub ao menu, ao rodapé, ao `/mapa-do-site` e ao `sitemap.xml` (todos usam `navFor`).
6. **`app/routes/post.tsx`** ("Leia também" por família): se `post.section === "guias"`, o loader chama
   `listPosts({ section: "guias", tag: post.tag ?? null, exclude: [post.slug], perPage: 3 })`; nas outras seções, igual a hoje.
   Assim guia clássico sugere guia clássico e guia de IA sugere guia de IA.
7. **`app/components/cards.tsx` (`GuideCard`)**: se `post.tag`, uma pílula antes da do nível:
   `<span className="w-fit rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">{post.tag}</span>`, as duas
   pílulas numa `span` `flex flex-wrap gap-1.5`.
8. **`app/routes/home.tsx`**: card do roteiro no `aside` (seção C.4).
9. **`app/routes/trail.tsx`**: box no fim apontando para o roteiro (seção C.5).
10. **`app/lib/robot/writer.server.ts`**: na lista `internal`, depois de `/trilha`, acrescentar
    `["/criar-site-com-ia", "roteiro para criar site com IA do jeito certo"]` (só nesta fatia, quando o hub existe).
11. **`app/lib/mock-data.ts`**: um guia de exemplo com `tag: "Com IA"` e slug `criar-site-com-ia-do-jeito-certo`
    (para ver a pílula, o kicker e um passo do hub com guia no `npm run dev`).

Não mexer em `SectionSlug`, `SECTION_SLUGS`, `ROBOT_SECTIONS`, `TRAIL`, `TrailStrip`, `RichText`.

---

## B. Os 8 guias (1ª leva de IA)

### B.0 Regras (iguais à 2ª leva, com os ajustes abaixo)

Valem as seções **A, D, E** de [guias.md](guias.md) e a seção **A** de [guias-leva2.md](guias-leva2.md): lide de 50 a
90 palavras sem link; 2 a 4 `h2` informativos; passo a passo em `ol`; "Erros comuns" (`ul`, 4 a 6); "Perguntas
frequentes" (3 a 4 `h3` + `p`); fecho com link para o roteiro e o próximo guia; último bloco `Leia também: `;
**800 a 950 palavras** (validador 700 a 1.100); 3 a 6 links internos, cada URL uma vez; **no máximo 1 externo**;
nenhuma aspa dupla ASCII nem barra invertida no texto.

Campos comuns: `section='guias'`, `status='published'`, `origin='manual'`, `author='Equipe CriaSite'`,
**`tag='Com IA'`** (muda em relação às levas 1 e 2), `featured=0`, `updated_at=NULL`,
`image_url='/capas/<slug>.webp'`, `image_alt` da lista `CAPAS`.

**Ajustes desta leva**
1. **Fecho**: link para `/criar-site-com-ia#<id-da-etapa>` (no lugar de `/trilha#…`) e para o próximo guia do roteiro
   (ordem: G1 → G3 → G2 → G7 → G8 → G6 → G4 → G5).
2. **Lista branca interna ampliada**: os 11 `/ferramentas/<slug>`; `/trilha` e `/trilha#<id>`; os 12 guias de antes;
   os 8 desta leva; `/criar-site-com-ia` e `/criar-site-com-ia#<id>` (`planejar`, `contexto`, `pedir`, `revisar`,
   `publicar`, `alem`).
3. **Lista branca externa ampliada** (todas `https://`, conferir com `curl -sSIL` que respondem 200 antes de gravar):
   `https://git-scm.com`, `https://modelcontextprotocol.io`, `https://owasp.org`, `https://validator.w3.org`, mais as
   já aceitas (`https://developers.google.com/search/docs`, `https://www.w3.org/WAI/`, `https://pagespeed.web.dev` etc.).
4. **REGRA DE FATOS (a mais importante desta leva).** Ferramentas de IA mudam toda semana. O texto descreve
   **categorias e princípios**, nunca o estado atual de um produto:
   - Produto só como **exemplo neutro**, sempre em grupo de 2 ou mais, com "por exemplo", sem juízo
     ("melhor", "mais rápido", "líder"), sem ranking, **sem preço, sem versão, sem nome de modelo, sem data**.
     Ex. aceitável: "assistentes que trabalham dentro do editor de código, como o GitHub Copilot e o Cursor". Na dúvida, não citar nome.
   - Nomes de arquivo, de menu e formatos de configuração: sempre como exemplo e com "confira na documentação da sua ferramenta".
   - Proibido: porcentagens de adoção, "X% do código", números de usuários, "estudo mostra que…" sem fonte na lista
     branca, previsões ("em breve a IA vai…"), "substituir programadores", "hoje", "atualmente", "recentemente", "este ano".
   - Permitido (são princípios estáveis): modelos de linguagem podem dar respostas plausíveis e erradas (alucinação),
     inclusive funções e pacotes que não existem; quem publica é responsável pelo que vai ao ar; segredos não vão para o
     Git; revogar chave vazada em vez de só apagar; injeção de prompt existe; limites de Core Web Vitals e WCAG que já
     estão nos guias antigos (LCP 2,5 s, INP 200 ms, CLS 0,1; contraste 4,5:1 e 3:1).
   - Termos em inglês explicados na 1ª menção (prompt = o pedido que você escreve; agente = assistente que lê arquivos
     e roda comandos sozinho; MCP; skill).
5. **Exemplos**: negócios fictícios e genéricos (assistência técnica, confeitaria, escritório de contabilidade), sem
   nome real. Se o dono aprovar a Pergunta 5, o G1 e o hub podem citar o próprio CriaSite como exemplo real.
6. **Nada copiado** de documentação de fornecedor, de outros sites ou dos guias antigos; estrutura e frases próprias.

### B.1 Tabela geral

| # | slug | etapa | nível | publicação (ordem) |
|---|---|---|---|---|
| G1 | `criar-site-com-ia-do-jeito-certo` | planejar | 1 | 8ª (mais recente) |
| G2 | `prompt-para-criar-site-com-ia` | pedir | 1 | 7ª |
| G3 | `arquivo-de-instrucoes-para-assistente-de-codigo` | contexto | 2 | 5ª |
| G4 | `skills-para-assistentes-de-ia` | alem | 2 | 2ª |
| G5 | `o-que-e-mcp-servidores-mcp` | alem | 2 | 1ª (mais antiga) |
| G6 | `seguranca-ao-criar-site-com-ia` | publicar | 1 | 6ª |
| G7 | `como-revisar-codigo-gerado-por-ia` | revisar | 2 | 4ª |
| G8 | `site-feito-com-ia-seo-acessibilidade-e-velocidade` | revisar | 1 | 3ª |

A home ("Guias novos") mostrará G1, G2 e G6, os mais fortes para quem chega.

### G1 · O jeito certo

| Campo | Valor |
|---|---|
| title | Como criar um site com IA do jeito certo, passo a passo (55) |
| excerpt | A IA escreve código rápido, mas quem decide é você. Veja o fluxo que evita retrabalho: planejar, dar contexto, pedir em passos pequenos, revisar, testar e versionar. |
| meta_description | Planejar, dar contexto, pedir em partes pequenas, revisar, testar e salvar versões: o fluxo para criar um site com IA sem perder o controle do projeto. (151) |
| focus_keyword | criar site com ia |
| tags | `["IA","Criar site","Vibe coding"]` |
| Links internos | `/trilha`, `/guias/como-escrever-as-paginas-do-site`, `/guias/prompt-para-criar-site-com-ia`, `/guias/arquivo-de-instrucoes-para-assistente-de-codigo` (fecho), `/criar-site-com-ia#planejar` (fecho), `/guias/seguranca-ao-criar-site-com-ia` (leia também): 6 |
| Externo | `https://git-scm.com` |

- **Lide**: assistentes de IA escrevem código em segundos e fazem parecer fácil; o que separa um site que funciona de
  um que vira dor de cabeça é o método: você decide, a IA executa em partes, você confere. Ao final: o fluxo em 6
  passos e os erros mais comuns.
- **h2 O que a IA faz bem e o que continua com você**: faz bem: rascunho de página e de componente, tarefas
  repetitivas, explicar uma mensagem de erro, converter e reorganizar código. Continua com você: decidir o que o site
  precisa; domínio, hospedagem e contas no seu nome (link `/trilha`: "as etapas que nenhuma IA faz por você");
  os textos com os fatos do negócio (link páginas); aprovar o que vai ao ar. Alucinação explicada em 1 frase.
- **h2 Os tipos de ferramenta** (`ul`, sem ranking): chat no navegador (gera trechos para copiar e colar); assistente
  dentro do editor de código (sugere e altera arquivos abertos); agente de código (lê a pasta do projeto, edita vários
  arquivos e roda comandos, no terminal ou no editor); gerador de site no navegador (cria e publica um projeto a partir
  de uma conversa); assistentes de IA dentro de construtores e do WordPress. Fecho da seção: "nomes, recursos e preços
  mudam com frequência; confira na documentação oficial de cada ferramenta". Exemplos neutros opcionais (regra B.0.4).
- **h2 O fluxo em 6 passos** (`ol`): 1) Planeje: objetivo, público, páginas e o que fica de fora, num parágrafo;
  2) Dê contexto: tecnologias, estilo e regras do projeto, escritos uma vez (sem link aqui; o G3 vem no fecho);
  3) Peça em partes pequenas: uma página ou função por vez, com critério de pronto ([como pedir](/guias/prompt-para-criar-site-com-ia));
  4) Revise: leia o que mudou e peça explicação do que não entendeu; 5) Teste: navegador, celular, formulário de
  verdade; 6) Salve a versão (passo do Git) e só então siga para o próximo pedido.
- **h2 Git: o botão de desfazer do projeto**: Git registra versões; cada commit é uma foto do projeto com uma
  mensagem; antes de um pedido grande, salve; se a IA quebrar algo, volte; ele mostra exatamente quais linhas mudaram
  (essencial quando um agente mexe em vários arquivos); guarde uma cópia num repositório remoto privado. O
  [Git](https://git-scm.com) é gratuito e de código aberto.
- **h2 Erros comuns**: pedir "um site completo" de uma vez; aceitar sem ler; colar senha ou chave no chat; conversa
  longa demais (o assistente perde detalhes do começo: abra outra com um resumo do projeto); trocar de ferramenta no
  meio sem anotar as decisões; publicar sem testar no celular.
- **h2 Perguntas frequentes**: Preciso saber programar? (para um site simples dá para começar sem; entender o básico de
  HTML e de como o site é publicado ajuda a revisar) · O que é vibe coding? (nome popular para criar software
  conversando com a IA e aceitando o código sem ler; serve para protótipo e teste de ideia; em site de cliente ou com
  dados de pessoas, revise) · A IA substitui quem faz sites? (ela acelera partes do trabalho; decidir, revisar e
  responder pelo resultado continua sendo de alguém; sem previsão) · Site feito com IA é pior no Google? (o Google
  avalia a página, não a ferramenta; sem link aqui, o G8 aparece pelo roteiro).
- **Fecho**: próximo passo, dar contexto ao assistente → G3 e `/criar-site-com-ia#planejar`.
- **Leia também**: G6.

### G2 · Como pedir (prompt)

| Campo | Valor |
|---|---|
| title | Prompt para criar site com IA: como pedir e o que incluir (57) |
| excerpt | Pedido vago vira site genérico, com textos inventados. Veja as partes de um bom pedido, um modelo para copiar e como pedir ajustes sem desmanchar o que já funciona. |
| meta_description | Veja como escrever um bom prompt para criar um site com IA: objetivo, público, páginas, estilo, restrições e um modelo pronto para copiar e adaptar. (148) |
| focus_keyword | prompt para criar site |
| tags | `["IA","Prompt","Iniciante"]` |
| Links internos | `/guias/como-escrever-as-paginas-do-site`, `/ferramentas/contraste-cores`, `/guias/como-revisar-codigo-gerado-por-ia` (fecho), `/criar-site-com-ia#pedir` (fecho), `/guias/criar-site-com-ia-do-jeito-certo` (leia também): 5 |
| Externo | nenhum |

- **Lide**: a IA responde ao que você escreveu, não ao que você imaginou; o que faltar ela preenche com o mais
  provável: textos genéricos, cores padrão, depoimentos inventados. Ao final: as partes de um bom pedido, um modelo
  e como pedir ajustes.
- **h2 Por que pedido vago dá site genérico**: o modelo completa lacunas com o padrão mais comum; quanto mais você
  diz, menos ele inventa; inventar depoimento, número ou prêmio é propaganda enganosa e o cliente percebe.
- **h2 As partes de um bom pedido** (`ul`, cada item "Nome: explicação"): Objetivo (a ação principal do visitante,
  ex.: pedir orçamento pelo WhatsApp); Público (quem visita e o que procura); Páginas e seções; Conteúdo real (cole os
  seus textos ou peça espaços marcados para você preencher; ver [páginas](/guias/como-escrever-as-paginas-do-site));
  Estilo (duas cores em hexadecimal, a fonte, o clima, o que evitar; peça contraste AA e confira na
  [ferramenta de contraste](/ferramentas/contraste-cores)); Tecnologia e limites (HTML e CSS simples, ou a plataforma
  que você usa; onde vai hospedar; sem bibliotecas desnecessárias); Restrições (não inventar depoimentos, números,
  endereços; texto em português do Brasil; rápido no celular; acessível); Formato da resposta (explique o que fez,
  liste os arquivos e o que falta).
- **h2 Modelo para copiar e adaptar**: um `ul` com 7 a 9 linhas preenchidas para um negócio fictício (ex.: assistência
  técnica de celulares), começando por "Objetivo:", "Público:", "Páginas:", "Estilo:", "Tecnologia:", "Não faça:",
  "Antes de escrever código:" (pedir que liste os arquivos e passos e espere o ok). **Sem colchetes** (o `RichText`
  trata `[texto](url)` como link): para marcar campos a preencher, usar MAIÚSCULAS ("NOME DA EMPRESA").
- **h2 Peça em partes, não o site inteiro**: primeiro o plano (lista de arquivos e etapas), depois a estrutura e a
  página inicial, depois cada página, depois o formulário; um pedido = uma mudança que dá para conferir.
- **h2 Como pedir ajustes** (`ul`): diga o que está errado, onde e o resultado esperado; cole a mensagem de erro
  inteira; peça para mudar só o necessário e não mexer no resto; conversa confusa → nova conversa com um resumo.
- **h2 Erros comuns**: "um site moderno e bonito" sem detalhes; deixar a IA inventar textos; tudo num pedido só;
  colar dados de clientes ou senhas no pedido; aceitar bibliotecas e serviços que você não pediu; não dizer onde o site
  vai ser hospedado.
- **h2 Perguntas frequentes**: Precisa ser em inglês? (não; escreva em português; termos técnicos podem ficar como
  são) · Posso pedir os textos para a IA? (para rascunho; confira os fatos e acrescente o que só você sabe) · Existe
  prompt perfeito? (não; o bom pedido deixa pouco para adivinhar e melhora com as respostas) · Vale pedir para a IA
  melhorar o pedido? (vale: peça que ela faça as perguntas que faltam antes de começar).
- **Fecho**: com o código pronto, revisar antes de publicar → G7 e `/criar-site-com-ia#pedir`.
- **Leia também**: G1.

### G3 · Arquivo de instruções

| Campo | Valor |
|---|---|
| title | Arquivo de instruções para IA: o que dizer ao assistente de código (66) |
| excerpt | O assistente não lembra das conversas anteriores. Um arquivo de instruções na pasta do projeto guarda as regras: o que colocar, o que nunca escrever nele e um modelo para começar. |
| meta_description | O que colocar no arquivo de instruções do projeto para o assistente de código: tecnologias, comandos, regras e limites, e o que nunca escrever nele. (148) |
| focus_keyword | arquivo de instruções para ia |
| tags | `["IA","Assistente de código","Instruções"]` |
| Links internos | `/guias/seguranca-ao-criar-site-com-ia` (o que não colocar), `/guias/skills-para-assistentes-de-ia` (quando vira skill), `/guias/prompt-para-criar-site-com-ia` (fecho), `/criar-site-com-ia#contexto` (fecho), `/guias/criar-site-com-ia-do-jeito-certo` (leia também): 5 |
| Externo | nenhum |

- **Lide**: cada conversa com o assistente começa do zero; sem regras escritas, você repete as mesmas instruções e
  recebe respostas diferentes a cada vez. O arquivo de instruções é um texto na pasta do projeto que a ferramenta lê no
  começo de cada sessão. Ao final: o que pôr, o que não pôr, um modelo.
- **h2 O que é e onde fica**: arquivo de texto, em geral em Markdown (formato simples em que # marca título), na raiz do
  projeto; o nome depende da ferramenta: por exemplo AGENTS.md (convenção aberta lida por várias ferramentas) e
  CLAUDE.md, ou arquivos de regras em pastas próprias de alguns editores; algumas aceitam um arquivo por pasta e um
  arquivo pessoal que vale para todos os projetos. "Confira na documentação da sua ferramenta qual nome ela lê."
  Arquivo do projeto vai para o Git e vale para a equipe; preferências pessoais ficam no arquivo pessoal.
- **h2 O que colocar** (`ul`): o que é o projeto e para quem, em 2 frases; tecnologias principais; comandos para
  instalar, rodar, testar e gerar a versão de produção; estrutura de pastas em poucas linhas; convenções (idioma dos
  textos, nomes, estilo, componentes a reaproveitar); regras de trabalho (perguntar antes de apagar arquivos, instalar
  dependências ou mexer no banco; rodar o build antes de dizer que terminou; não mudar o que não foi pedido); onde
  está a documentação do projeto.
- **h2 O que não colocar** (`ul`): senhas, chaves de API e dados de acesso (o arquivo vai para o Git e para o contexto
  da IA; ver [segurança](/guias/seguranca-ao-criar-site-com-ia)); dados pessoais de clientes; texto enorme (instrução
  demais compete por atenção: curto e direto); regras vagas ou contraditórias ("escreva código bom"); o que a
  ferramenta já descobre lendo o código.
- **h2 Modelo para começar**: `ul` com 6 a 8 linhas de um projeto fictício: "Projeto: …", "Público: …", "Tecnologias: …",
  "Comandos: instalar …, rodar …, gerar versão final …", "Textos: português do Brasil, sem jargão", "Antes de apagar ou
  instalar algo: pergunte", "Antes de dizer que terminou: rode o build e liste os arquivos alterados", "Nunca: escrever
  senha ou chave no código". Comandos escritos por extenso, sem barra invertida.
- **h2 Quando a instrução vira skill**: procedimento longo usado só às vezes (publicar um post no padrão do site,
  preparar imagens) fica melhor como receita carregada sob demanda → [skills](/guias/skills-para-assistentes-de-ia).
  Instrução = vale sempre; skill = receita para uma tarefa.
- **h2 Erros comuns**: arquivo desatualizado (o assistente segue regra velha); regras genéricas copiadas da internet;
  segredo no arquivo; arquivo gigante; deixar fora do Git; achar que a IA sempre obedece (instrução orienta, não
  trava: para o que é crítico, use as permissões da ferramenta e revise).
- **h2 Perguntas frequentes**: Funciona em qualquer assistente? (a ideia sim; nome e lugar mudam) · Em que língua
  escrever? (pode ser português; seja claro e consistente) · A IA pode escrever o arquivo? (pode propor um rascunho
  lendo o projeto; revise e corte) · De quanto em quanto tempo revisar? (sempre que uma regra mudar ou o assistente
  repetir o mesmo erro).
- **Fecho**: com as regras escritas, hora de pedir → G2 e `/criar-site-com-ia#contexto`.
- **Leia também**: G1.

### G4 · Skills

| Campo | Valor |
|---|---|
| title | Skills para assistentes de IA: o que são e como criar as suas (61) |
| excerpt | Uma skill é uma receita guardada que o assistente usa quando a tarefa pede. Veja quando vale criar uma, como montar a sua e os cuidados com skills feitas por outras pessoas. |
| meta_description | Entenda o que são skills em assistentes de IA, quando valem a pena e como escrever uma skill própria para tarefas que você repete no seu site. (142) |
| focus_keyword | skills ia |
| tags | `["IA","Skills","Automação"]` |
| Links internos | `/guias/arquivo-de-instrucoes-para-assistente-de-codigo`, `/guias/seguranca-ao-criar-site-com-ia`, `/guias/o-que-e-mcp-servidores-mcp` (fecho), `/criar-site-com-ia#alem` (fecho), `/guias/como-revisar-codigo-gerado-por-ia` (leia também): 5 |
| Externo | nenhum |

- **Lide**: skill = pacote com nome, descrição e passo a passo (às vezes modelos e scripts) que o assistente usa
  quando a tarefa combina; evita repetir o mesmo pedido longo e deixa o resultado previsível. Ao final: quando vale,
  como criar, cuidados.
- **h2 Skill, instrução e pedido**: instrução do projeto (sempre carregada, regras gerais; link G3); pedido (o que você
  quer agora); skill (procedimento específico, carregado só quando a descrição combina com a tarefa ou quando você a
  chama). Em outras ferramentas a mesma ideia aparece como comandos personalizados, regras ou pedidos salvos; o nome e
  o formato mudam: confira na documentação.
- **h2 Como uma skill costuma ser montada**: nas ferramentas que usam pasta: uma pasta com um arquivo principal em
  Markdown, com nome e descrição no topo e as instruções embaixo; arquivos de apoio (modelos, exemplos, scripts) na
  mesma pasta; a **descrição** é o que o assistente lê para decidir usar: diga o que faz e quando usar. Pode ficar no
  projeto (equipe) ou na pasta do usuário (todos os projetos). Sem copiar campos exatos de nenhum formato.
- **h2 Ideias para quem cuida de sites** (`ul`): publicar um post novo no padrão do site; revisar uma página antes de
  publicar; preparar imagens novas (tamanho e formato); checklist de atualização de plugins; resumo das mudanças para o
  cliente; relatório mensal de pendências.
- **h2 Passo a passo para criar a sua** (`ol`): 1) escolha uma tarefa que se repete e tem jeito certo; 2) faça uma vez
  com o assistente anotando as correções; 3) nome curto + descrição com "o que faz" e "quando usar"; 4) passos no
  imperativo com critério de pronto; 5) junte um modelo ou exemplo; 6) teste numa tarefa real e ajuste; 7) guarde no
  Git com o projeto.
- **h2 Cuidados com skills de terceiros**: pode incluir scripts que rodam na sua máquina; leia tudo antes de
  instalar; só de fonte confiável; desconfie de instrução que manda enviar arquivos ou dados → [segurança](/guias/seguranca-ao-criar-site-com-ia).
- **h2 Erros comuns**: descrição vaga (nunca é usada ou é usada na hora errada); skill que faz tudo; repetir as regras
  do arquivo de instruções; instalar sem ler; não atualizar quando o processo muda.
- **h2 Perguntas frequentes**: Skill é o mesmo que plugin? (parecido; em algumas ferramentas um plugin junta skills,
  comandos e conexões) · Preciso programar? (não; a maior parte é texto; scripts são opcionais) · Funciona em qualquer
  assistente? (o conceito sim; o formato varia) · Skill substitui o MCP? (não: a skill ensina como fazer; o MCP dá
  acesso a ferramentas e dados).
- **Fecho**: o próximo passo é entender o MCP → G5 e `/criar-site-com-ia#alem`.
- **Leia também**: G7.

### G5 · MCP

| Campo | Valor |
|---|---|
| title | O que é MCP: servidores MCP explicados para quem tem site (57) |
| excerpt | MCP é o padrão que liga assistentes de IA a outras ferramentas e dados. Entenda sem jargão o que um servidor MCP faz, exemplos úteis para quem cuida de sites e os cuidados de segurança. |
| meta_description | MCP é o padrão aberto que liga assistentes de IA a ferramentas e dados. Veja o que um servidor MCP faz, quando usar e os cuidados de segurança. (143) |
| focus_keyword | o que é mcp |
| tags | `["IA","MCP","Integrações"]` |
| Links internos | `/guias/skills-para-assistentes-de-ia`, `/guias/seguranca-ao-criar-site-com-ia`, `/criar-site-com-ia#alem` (fecho), `/trilha` (fecho), `/guias/arquivo-de-instrucoes-para-assistente-de-codigo` (leia também): 5 |
| Externo | `https://modelcontextprotocol.io` |

- **Lide**: MCP (Model Context Protocol) é um padrão aberto para ligar assistentes de IA a outras ferramentas e dados:
  em vez de copiar e colar, o assistente consulta a documentação, abre o navegador ou lê um banco de teste por um
  conector. Ao final: o que é, exemplos, cuidados.
- **h2 Como funciona, sem jargão**: comparação com uma tomada padrão; o aplicativo de IA conversa com **servidores
  MCP**; cada servidor oferece ações (consultar, criar, enviar), dados para leitura e modelos de pedido; servidor local
  (roda no seu computador) ou remoto (serviço na internet, com login). Criado pela Anthropic e publicado como padrão
  aberto, usado por ferramentas de várias empresas; a especificação fica no [site oficial](https://modelcontextprotocol.io).
- **h2 Exemplos úteis para quem cria e cuida de sites** (`ul`, categorias): navegador controlado pela IA para abrir a
  página, testar e tirar captura; documentação atualizada de uma biblioteca (menos invenção); repositório de código e
  lista de tarefas; banco de dados de teste; painéis de serviços (hospedagem, domínio, e-mail) quando o próprio
  fornecedor oferece servidor oficial; planilhas e documentos. "Confira se o fornecedor tem um servidor oficial."
- **h2 MCP, skill e instruções**: instruções = regras; skill = como fazer ([skills](/guias/skills-para-assistentes-de-ia));
  MCP = com o que fazer (acesso).
- **h2 Cuidados de segurança** (`ul`): o servidor age com as permissões que você der: comece só com leitura; só
  servidores oficiais ou de fonte confiável, de preferência de código aberto; tokens (chaves de acesso) com o menor
  acesso e prazo possível; nunca o banco de produção com escrita no começo; o texto que volta de uma ferramenta pode
  trazer instruções maliciosas (injeção de prompt): mantenha a confirmação antes de cada ação; desligue o que não usa
  → [segurança](/guias/seguranca-ao-criar-site-com-ia).
- **h2 Passo a passo para testar o primeiro** (`ol`): 1) confira se o seu assistente aceita MCP e onde se configura;
  2) escolha um servidor só de leitura; 3) instale pela instrução oficial do servidor; 4) dê o mínimo de permissão;
  5) peça uma tarefa simples e veja quais ações ele chamou; 6) mantenha a aprovação manual.
- **h2 Erros comuns**: dezenas de servidores ligados (ocupam espaço na conversa e aumentam o risco); token de
  administrador; servidor de origem desconhecida; aprovar tudo automaticamente; servidor esquecido com acesso a dados de clientes.
- **h2 Perguntas frequentes**: Preciso de MCP para criar um site? (não; ajuda em tarefas específicas) · MCP é pago? (o
  padrão é aberto; servidores e serviços podem cobrar) · É de uma empresa só? (não; é aberto e usado por várias) ·
  Posso criar o meu servidor? (sim, com os kits oficiais; exige programação).
- **Fecho**: fim do roteiro: volte ao `/criar-site-com-ia#alem` e, se o site ainda não está no ar, siga a `/trilha`.
- **Leia também**: G3.

### G6 · Segurança

| Campo | Valor |
|---|---|
| title | Segurança ao criar site com IA: o que nunca colar no chat (57) |
| excerpt | O assistente vê tudo o que você cola e, se for um agente, a pasta do projeto inteira. Veja o que nunca compartilhar, como limitar o que ele faz e o que fazer se uma chave vazar. |
| meta_description | Senhas, chaves de API e dados de clientes não vão para o chat da IA. Veja como proteger o projeto, revisar pacotes e limitar o que o agente pode fazer. (151) |
| focus_keyword | segurança ao criar site com ia |
| tags | `["IA","Segurança","LGPD"]` |
| Links internos | `/guias/arquivo-de-instrucoes-para-assistente-de-codigo`, `/guias/o-que-e-mcp-servidores-mcp`, `/guias/checklist-de-lancamento-do-site` (fecho), `/criar-site-com-ia#publicar` (fecho), `/guias/como-revisar-codigo-gerado-por-ia` (leia também): 5 |
| Externo | `https://owasp.org` |

- **Lide**: o assistente vê o que você cola; o agente vê a pasta e o que os comandos devolvem. Pequenos descuidos viram
  senha exposta, conta invadida ou dado de cliente vazado. Ao final: o que nunca compartilhar, como limitar o agente e o
  que fazer se algo vazar.
- **h2 O que nunca colar no chat** (`ul`): senhas (painel, hospedagem, banco, e-mail); chaves de API e tokens; o arquivo
  .env inteiro (onde ficam as variáveis secretas); dados pessoais de clientes (nome, CPF, telefone, pedidos): pela LGPD
  você responde por eles, use dados fictícios; capturas de tela com dados sensíveis. Confira nas configurações e nos
  termos da ferramenta se as conversas podem ser usadas para treinar modelos e como desligar.
- **h2 Segredos fora do código**: variáveis de ambiente no servidor; .env no .gitignore; repositório público nunca com
  segredo (robôs varrem repositórios públicos atrás de chaves); se vazou, apagar não basta: **revogue** a chave no
  painel do serviço e gere outra, porque ela fica no histórico do Git e em cópias.
- **h2 Limite o que o agente pode fazer** (`ul`): uma pasta só do projeto; confirmação antes de rodar comandos, apagar
  arquivos ou instalar pacotes; não aprovar tudo automaticamente em projeto com dados reais; Git e backup antes de
  pedidos grandes; banco de teste, não o de produção; as regras do [arquivo de instruções](/guias/arquivo-de-instrucoes-para-assistente-de-codigo)
  ajudam mas não travam nada; conexões [MCP](/guias/o-que-e-mcp-servidores-mcp) com o mínimo de permissão.
- **h2 Pacotes e código que funcionam mas são inseguros**: a IA pode sugerir pacote que não existe ou com nome parecido
  com um conhecido, e golpistas registram esses nomes: antes de instalar, confira na página oficial do pacote se ele
  existe e é mantido; prefira menos dependências. Código que funciona mas é inseguro: formulário validado só no
  navegador; consulta ao banco montada com o texto do visitante (injeção de SQL); chave secreta no código que vai para o
  navegador; área de administração sem senha. A [OWASP](https://owasp.org), fundação sem fins lucrativos, mantém listas
  dos riscos mais comuns em aplicações web e com IA. Injeção de prompt em 1 ou 2 frases (texto escondido numa página ou
  arquivo dando ordens ao assistente).
- **h2 Se uma chave ou senha vazar** (`ol`): 1) revogue a chave ou troque a senha na hora; 2) veja no painel do serviço
  se houve uso estranho; 3) gere uma nova e guarde no lugar certo (variável de ambiente, gerenciador de senhas);
  4) tire do código; 5) ative a verificação em duas etapas; 6) se houver dados de clientes envolvidos, avalie a
  comunicação aos titulares e à ANPD: consulte um profissional.
- **h2 Erros comuns**: colar o .env para a IA achar um erro; print do painel com a chave aparecendo; dados reais de
  clientes para testar; aprovar comando sem ler; instalar o pacote sugerido sem conferir; repositório público com
  segredo no histórico.
- **h2 Perguntas frequentes**: É seguro usar IA para programar? (é, com estes cuidados e revisão) · A ferramenta guarda o
  que eu colo? (depende da ferramenta e do plano; leia a política de privacidade dela) · Repositório privado resolve?
  (reduz o risco, não elimina; segredo não vai para o Git) · Posso usar dados reais para testar? (prefira fictícios).
- **Fecho**: com o projeto protegido, siga o checklist de lançamento → `/guias/checklist-de-lancamento-do-site` e `/criar-site-com-ia#publicar`.
- **Leia também**: G7.
- Sem orientação jurídica detalhada sobre LGPD (a 3ª leva de sábado trata de privacidade): "consulte um profissional".

### G7 · Revisar código gerado por IA

| Campo | Valor |
|---|---|
| title | Como revisar código gerado por IA: checklist antes de publicar (62) |
| excerpt | Código gerado por IA costuma funcionar no primeiro teste e esconder problemas. Revisar não exige ser programador experiente, exige método: veja o checklist em cinco blocos. |
| meta_description | Checklist para revisar o código que a IA escreveu antes de publicar: entender o que mudou, testar no celular, conferir formulários, segurança e desempenho. (155) |
| focus_keyword | revisar código gerado por ia |
| tags | `["IA","Revisão de código","Testes"]` |
| Links internos | `/ferramentas/status-http`, `/guias/seguranca-ao-criar-site-com-ia`, `/guias/checklist-de-lancamento-do-site`, `/guias/site-feito-com-ia-seo-acessibilidade-e-velocidade` (fecho), `/criar-site-com-ia#revisar` (fecho), `/guias/prompt-para-criar-site-com-ia` (leia também): 6 |
| Externo | `https://validator.w3.org` |

- **Lide**: o código da IA costuma passar no primeiro teste e esconder um caso não tratado, uma falha de segurança ou
  um arquivo alterado sem pedido. Revisar exige método, não anos de experiência. Ao final: checklist em 5 blocos.
- **h2 Entenda o que mudou**: lista de arquivos alterados (o Git mostra as linhas); peça à IA que explique em português
  cada mudança e o porquê; desconfie de mudança fora do pedido; pergunte "o que pode dar errado com isso?".
- **h2 Funciona de verdade?** (`ul`): gere a versão final (build) e leia erros e avisos; teste o caminho certo e os
  errados (campo vazio, e-mail inválido, internet lenta); formulário: a mensagem chega?; celular; links e
  redirecionamentos ([status HTTP](/ferramentas/status-http)); console do navegador (F12) sem erros em vermelho; HTML no
  [validador do W3C](https://validator.w3.org).
- **h2 Segurança** (`ul`): nenhuma senha ou chave no código do navegador; dados validados também no servidor; consultas
  ao banco com parâmetros; dependências novas conferidas; área de administração protegida → [segurança](/guias/seguranca-ao-criar-site-com-ia).
- **h2 Qualidade e manutenção** (`ul`): nomes claros; nada duplicado; sem código comentado ou morto; textos de exemplo,
  depoimentos inventados e lorem ipsum removidos; segue as regras do projeto.
- **h2 Checklist rápido antes de publicar** (`ol`): 1) li a lista de arquivos alterados; 2) entendi cada mudança;
  3) build sem erro; 4) testei no celular e no computador; 5) testei formulário e links; 6) nenhuma senha ou chave no
  código; 7) dependências novas conferidas; 8) salvei a versão com mensagem clara; 9) publiquei e conferi no ar com o
  [checklist de lançamento](/guias/checklist-de-lancamento-do-site).
- **h2 Erros comuns**: revisar só olhando a tela; pedir "corrija" em sequência sem entender o erro (a IA pode piorar e
  mexer em mais arquivos); aceitar teste que a própria IA alterou para passar; várias mudanças num commit só; publicar
  sem tempo para corrigir se der errado.
- **h2 Perguntas frequentes**: Preciso entender cada linha? (entenda o que mudou e onde; o que não entender, peça
  explicação ou não publique) · Outra IA pode revisar? (ajuda como segunda opinião, não substitui o teste) · Testes
  automáticos valem a pena? (em projeto que cresce, sim; confira se testam algo real) · Por onde começar se eu não
  souber o que testar? (pelo que o visitante faz: abrir, ler, clicar, enviar).
- **Fecho**: além de funcionar, o site precisa ser encontrado e usado por todos → G8 e `/criar-site-com-ia#revisar`.
- **Leia também**: G2.

### G8 · SEO, acessibilidade e velocidade

| Campo | Valor |
|---|---|
| title | Site feito com IA: como conferir SEO, acessibilidade e velocidade (65) |
| excerpt | Um site montado pela IA pode parecer pronto e ser invisível para o Google, difícil de usar com leitor de tela ou lento no celular. Veja o que conferir e como pedir as correções. |
| meta_description | O site que a IA montou aparece no Google, abre rápido e todos conseguem usar? Veja o que conferir em títulos, código, imagens, contraste e celular. (147) |
| focus_keyword | site feito com ia |
| tags | `["IA","SEO","Acessibilidade"]` |
| Links internos | `/ferramentas/meta-tags`, `/ferramentas/contraste-cores`, `/guias/seo-basico-para-aparecer-no-google`, `/guias/seguranca-ao-criar-site-com-ia` (fecho), `/criar-site-com-ia#revisar` (fecho), `/guias/site-lento-causas-e-como-otimizar-imagens` (leia também): 6 |
| Externo | `https://developers.google.com/search/docs` |

- **Lide**: ferramentas de IA tendem a caprichar na aparência; o que não aparece na tela (código, títulos, rótulos,
  peso) fica por sua conta. Ao final: o que conferir em busca, acessibilidade e velocidade, e como pedir as correções.
- **h2 O Google consegue ler o seu site?**: alguns geradores entregam páginas que montam o conteúdo no navegador com
  JavaScript; o Google consegue processar JavaScript, mas o caminho mais seguro é o texto principal já vir no HTML.
  Teste: abra o código-fonte (Ctrl+U) e procure uma frase da página. Cada página com endereço próprio, título e
  descrição próprios ([meta tags](/ferramentas/meta-tags)), um só H1, sitemap → [SEO básico](/guias/seo-basico-para-aparecer-no-google).
- **h2 Texto escrito com IA e o Google**: o Google diz avaliar a utilidade e a qualidade do conteúdo, não a forma como
  foi produzido; páginas feitas em massa para manipular a busca violam as regras de spam; orientação atual na
  [documentação da Busca](https://developers.google.com/search/docs). Na prática: fatos do seu negócio, fotos reais,
  nada de depoimento inventado.
- **h2 Acessibilidade** (`ul`): texto alternativo que descreve as imagens (decorativa: vazio); contraste AA, 4,5:1 para
  texto normal ([contraste](/ferramentas/contraste-cores)); tudo funciona com a tecla Tab e o foco aparece; cada campo
  de formulário com rótulo; idioma da página definido como português do Brasil (atributo lang com o valor pt-BR, sem
  aspas); títulos em ordem; informação que não depende só de cor.
- **h2 Velocidade** (`ul`): imagens enormes; bibliotecas pesadas para coisa simples; animações demais; muitas fontes;
  medir no PageSpeed Insights (sem link: o externo deste guia é a documentação da Busca) e olhar os limites de "bom"
  (LCP até 2,5 s, INP até 200 ms, CLS até 0,1).
- **h2 Como pedir as correções** (`ol`): 1) meça; 2) cole o resultado no pedido; 3) uma correção por vez; 4) meça de
  novo; 5) registre a regra no arquivo de instruções (ex.: toda imagem com texto alternativo) para não repetir.
- **h2 Erros comuns**: publicar texto de exemplo; tudo numa página só (fica difícil aparecer para cada serviço); menu que
  só abre com mouse; texto alternativo enorme em imagem decorativa; páginas sem título próprio; confiar na nota que a
  própria ferramenta de IA dá.
- **h2 Perguntas frequentes**: Site feito com IA é penalizado? (não por ser feito com IA; pela qualidade) · Preciso de
  nota 100? (não; os limites importam mais) · Como saber se uma pessoa cega consegue usar? (teste com o teclado e com o
  leitor de tela do celular; verificadores automáticos pegam só parte) · A IA consegue corrigir sozinha? (boa parte, se
  você mostrar o problema e conferir depois).
- **Fecho**: falta proteger o projeto antes de publicar → G6 e `/criar-site-com-ia#revisar`.
- **Leia também**: `/guias/site-lento-causas-e-como-otimizar-imagens`.

### B.2 Datas (`published_at`), relativas ao momento em que a migration roda

| Guia | published_at |
|---|---|
| G5 MCP | `UTC_TIMESTAMP() - INTERVAL 47 HOUR - INTERVAL 10 MINUTE` |
| G4 Skills | `UTC_TIMESTAMP() - INTERVAL 41 HOUR - INTERVAL 35 MINUTE` |
| G8 SEO/acess. | `UTC_TIMESTAMP() - INTERVAL 34 HOUR - INTERVAL 5 MINUTE` |
| G7 Revisar | `UTC_TIMESTAMP() - INTERVAL 27 HOUR - INTERVAL 50 MINUTE` |
| G3 Instruções | `UTC_TIMESTAMP() - INTERVAL 20 HOUR - INTERVAL 15 MINUTE` |
| G6 Segurança | `UTC_TIMESTAMP() - INTERVAL 13 HOUR - INTERVAL 40 MINUTE` |
| G2 Prompt | `UTC_TIMESTAMP() - INTERVAL 7 HOUR - INTERVAL 25 MINUTE` |
| G1 Jeito certo | `UTC_TIMESTAMP() - INTERVAL 2 HOUR - INTERVAL 5 MINUTE` |

Todos no passado (links entre eles funcionam desde o 1º minuto). Mesma decisão da 2ª leva.

### B.3 Migration dos guias

`db/migrations/0NN_guias_ia.sql` (**usar o próximo número livre na hora**: a 3ª leva de sábado e a de fontes do robô
podem ter pego 007/008). Forma igual à `006_guias_leva2.sql` (colunas com `image_url` e `image_alt`), trocando
`tag` de `NULL` para `'Com IA'`. Cabeçalho:
```sql
-- CriaSite · migration 0NN · guias de IA (roteiro Criar site com IA, /criar-site-com-ia)
-- Escritos à mão (origem 'manual'), tag 'Com IA'. Revise e edite em /admin → Matérias.
-- INSERT IGNORE: se já existir um guia com o mesmo endereço (seção + slug), nada é sobrescrito.
-- Capas em public/capas/ (scripts/make-capas.mjs, régua do roteiro de IA). Datas relativas (últimas ~48 h).
```
Script temporário fora do repositório, como nas levas anteriores, com a lista branca da seção B.0 e as validações de
lá (incluindo: `public/capas/<slug>.webp` existe para os 8; `tag` = `Com IA`; fecho contém `/criar-site-com-ia#`).
Validação extra de fatos (avisar, sem abortar): procurar no texto `\d+ ?%`, `R\$`, `US\$`, `versão \d`, `20\d\d`,
`melhor ferramenta`, `hoje`, `atualmente`, `recentemente` e listar as ocorrências para o executor revisar.

---

## C. Visual: hub, card da home, box da trilha

**Direção visual**: mesmo clima da `/trilha` (planta técnica amigável: marinho, laranja, cartões claros com borda
fina), para o roteiro parecer parte da casa e não um "site de IA" à parte. Sinal próprio do roteiro: a **faísca**
(o ícone da editoria `ia`, já em `COVER_ART` de `app/components/ui.tsx`) e o **losango** na régua das capas.
**Evitar**: degradê roxo/azul, brilhos, robôs, cérebros, emojis, "IA" em letras gigantes; tudo o que lembre
propaganda de ferramenta de IA.

**Hierarquia do hub**: 1º o H1 e a frase de abertura; 2º as 4 regras de ouro (o "jeito certo" em 10 segundos);
3º as 6 etapas com os guias; por último o progresso (lateral) e a nota de transparência.

### C.1 Tokens (os do site; nada novo)

Fundo `bg-day` (`#eef1fb`), cartões `bg-card` (`#ffffff`) com `border-line` (`#dde3f6`), texto `ink` (`#0c1a4b`) e
`muted` (`#5a6798`), destaque `violet` (`#c24e06`) e `violet-soft` (`#fff0e5`), laranja `brand` (`#ff7a1a`), aside
`bg-night` com `text-moon` e `text-glow` (`#ff9a4d`). Fonte Schibsted Grotesk (a do site). Raios: cartões 14 px,
botões pílula `rounded-full`, linhas de guia `rounded-xl`. Sem sombras novas.

### C.2 Página `/criar-site-com-ia` (`app/routes/ai-track.tsx`)

Contêiner igual ao da trilha: `main` `mx-auto flex max-w-[1180px] flex-col gap-8 px-4 pt-8 sm:px-6`.

1. **Cabeçalho** (`header` `flex max-w-3xl flex-col gap-3`):
   - Pílula: `inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-soft px-3 py-1 text-xs font-bold text-violet`
     com o SVG da faísca 14×14 (`aria-hidden`, `stroke="currentColor"`) + "Roteiro · Com IA".
   - H1 (mesmas classes do H1 da trilha): **"Criar site com IA, do jeito certo"**.
   - Lead (`text-lg leading-relaxed text-muted`): "A IA escreve código em segundos. O que decide se o site fica bom é o
     método: você planeja, dá contexto, pede em partes, revisa e só então publica. Marque cada etapa quando terminar:
     o progresso fica salvo neste navegador."
2. **Regras de ouro** (`ul` `grid gap-3 sm:grid-cols-2 lg:grid-cols-4`, `aria-label="Regras de ouro"`), mesmo cartão
   dos princípios da `/politica-editorial` (`rounded-[14px] border border-line bg-card p-5`, número `text-3xl
   font-extrabold text-violet`, título `text-xl font-extrabold`, texto `text-[15px] leading-relaxed text-muted`):
   - 01 **Você decide**: A IA executa. O que o site precisa, o que vai ao ar e as contas no seu nome continuam com você.
   - 02 **Passos pequenos**: Uma página ou uma mudança por pedido, com uma versão salva antes de cada uma.
   - 03 **Segredo fica fora**: Senha, chave de API e dado de cliente não vão para o chat nem para o código.
   - 04 **Teste antes**: Leia o que mudou e teste no celular. Funcionar na tela não é o mesmo que estar certo.
3. **Etapas + lateral** (`grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]`): copiar a estrutura do `ol` da
   `/trilha` (círculo numerado 52 px, linha vertical, `id` da etapa no `li`, H2 22 px, texto 16 px), com uma diferença
   no miolo de cada etapa, nesta ordem:
   - **Lista de guias** (`ul` `flex max-w-[62ch] flex-col gap-2`), um `Link` por guia existente:
     `group flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 hover:border-ink`
     `focus-visible:outline-2 focus-visible:outline-offset-2`; à esquerda o título (`font-bold leading-snug
     group-hover:text-violet`) e embaixo `text-[13px] text-muted` "Nível N · M min de leitura"; à direita `→`
     (`aria-hidden`, `text-violet`, `transition-transform group-hover:translate-x-0.5`). Sem guia no banco: o item não aparece.
   - **Botões** (`flex flex-wrap items-center gap-2`): ferramentas (mesmo botão marinho da trilha) e "Marcar como
     feita" / "Feita" (mesmo botão da trilha, ligado a `useAiTrack`).
   - **Aside** (`night … lg:sticky lg:top-6`, igual ao da trilha): "Seu progresso", "N de 6 etapas feitas", barra,
     lista de âncoras. Abaixo da lista, separado por `border-t border-night-line pt-3`, um link
     `text-sm font-semibold text-glow hover:text-moon`: "Ainda sem domínio e hospedagem? Veja a trilha →" (`/trilha`).
4. **Nota de transparência** (último bloco, `rounded-[14px] border border-line bg-card p-5 text-[15px] leading-relaxed
   text-muted max-w-3xl`), H2 pequeno `text-base font-extrabold text-ink` "Sobre este roteiro": texto da seção H.2 +
   link "política editorial" (`/politica-editorial#automacao`).

**Estados**: sem `localStorage` funciona e só não lembra (mesmo `useChecklist`); etapa feita: círculo `bg-brand` com ✓
(igual à trilha); foco visível em todo link e botão; hover só muda borda/cor (sem pulo de layout). Sem estado de
carregamento (SSR).

**Celular (390 px)**: regras em 1 coluna (2 a partir de `sm`), etapas em coluna única, aside vem depois das etapas
(não fixo). **Tela larga (1280 px)**: regras em 4 colunas, aside fixo à direita.

### C.3 SEO do hub

`seo({ title: "Criar site com IA: roteiro do jeito certo, em 6 etapas", description: "Como criar um site com inteligência artificial sem perder o controle: planejar, dar contexto, pedir, revisar, proteger e publicar, com guias e checklist.", path: "/criar-site-com-ia", image, imageAlt, imageSize })`
(título 54, descrição 153). JSON-LD `ItemList` com os guias existentes na ordem do roteiro
(`itemListElement: [{ "@type": "ListItem", position, url: absoluteUrl(guia.url), name: guia.title }]`).

### C.4 Card na home (`aside` de `app/routes/home.tsx`)

Entre "Notícias da web" e "Guias novos", só se `available.sections.includes("guias")`. O card inteiro é um `Link`
para `/criar-site-com-ia`: `group flex flex-col gap-1.5 rounded-[14px] bg-night p-4 text-moon hover:bg-night-2`.
Dentro: linha `text-[12px] font-bold tracking-wide text-glow uppercase` com a faísca 12×12 + "Roteiro novo";
título `text-[17px] leading-snug font-extrabold` "Criar site com IA, do jeito certo"; texto `text-[13.5px]
text-moon-muted` "6 etapas, do pedido ao site no ar, sem colar senha no chat."; "Ver o roteiro →" `text-[13px]
font-bold text-glow group-hover:text-moon`. Foco: `focus-visible:outline-2 focus-visible:outline-offset-2`.

### C.5 Box no fim da `/trilha`

Depois do `grid`, um bloco `flex flex-col gap-3 rounded-[14px] border border-line bg-card p-5 sm:flex-row
sm:items-center sm:justify-between`: texto `text-[16px]` "**Vai usar IA para montar o site?** As 7 etapas continuam
valendo. O roteiro mostra como pedir, revisar e publicar sem perder o controle." + botão igual ao "Ler o guia"
(`border-2 border-ink`, pílula) "Ver o roteiro →". Só aparece se `available.sections.includes("guias")`.

### C.6 Critério de pronto (visual)

Capturas em **390 px** e **1280 px** de: `/criar-site-com-ia` (topo, uma etapa com 2 guias, aside), home (card no aside;
no celular ele aparece depois das notícias), `/trilha` (box no fim), `/guias` (pílula "Com IA" + nível nos cards de IA,
só nível nos clássicos), um guia de IA (kicker "Com IA · Nível 1 (Iniciante)"; "Leia também" do rodapé só com guias de
IA) e um guia clássico ("Leia também" só com clássicos). Menu: 5 itens no desktop sem quebrar a linha a partir de
1024 px; em 768 px a busca do topo pode ir para a linha de baixo (o cabeçalho já é `flex-wrap`); menu do celular com
os 5 itens em 2 colunas.

---

## D. Capas (fatia F2)

Mesma linguagem de [capas.md](capas.md) (janela branca, sombra laranja, marinho pontilhado, sem texto), com uma
**régua própria do roteiro de IA**.

### D.1 Mudanças em `scripts/make-capas.mjs`

1. `const ETAPAS_IA = { planejar: 1, contexto: 2, pedir: 3, revisar: 4, publicar: 5, alem: 6 };`
2. `const FAISCA = "M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z";` (mesmo path do
   ícone `ia` do `Cover`, viewBox 24).
3. Entradas de `CAPAS` podem ter `trilha: "ia"`. `validar`: `const etapas = c.trilha === "ia" ? ETAPAS_IA : ETAPAS;` e
   conferir `c.etapa in etapas`.
4. `moldura(arte, etapa, trilha = "site")`. Para `"site"`, igual a hoje. Para `"ia"`, a régua troca:
   - linha igual: `<path d="M510 548H690" stroke="#1d2c66" stroke-width="4" stroke-linecap="round"/>`;
   - faísca à esquerda: `<path d="${FAISCA}" fill="#ff9a4d" transform="translate(462 536)"/>` (fica em x 467 a 481);
   - 6 losangos em x = 510 + (i − 1) × 36, y = 548:
     - i < n: `<rect x="-6" y="-6" width="12" height="12" rx="2" fill="#ff9a4d" transform="translate(X 548) rotate(45)"/>`
     - i = n: anel `<rect x="-15" y="-15" width="30" height="30" rx="6" fill="none" stroke="#ff7a1a" stroke-width="3" opacity="0.5" transform="translate(X 548) rotate(45)"/>` + `<rect x="-9" y="-9" width="18" height="18" rx="3" fill="#ff7a1a" transform="translate(X 548) rotate(45)"/>`
     - i > n: igual ao primeiro, `fill="#2a3c80"`.
5. `main()` passa `c.trilha` para `moldura`. `--sql` não muda (os guias novos já entram com capa pela migration).

### D.2 As 8 artes (coordenadas absolutas; `N`=`#0c1a4b`, `L`=`#ff7a1a`, `LC`=`#ff9a4d`; tudo dentro de x 400 a 800, y 225 a 450; `stroke-linecap/linejoin="round"` no `<g>`)

**`fluxo` (G1)** — ciclo de 5 caixas.
- Linha de cima, `rect y=246 w=104 h=60 rx=12`: B1 `x=420 fill=#eef1fb stroke=N sw=4` com `rect x=436 y=262 w=44 h=10 rx=5 fill=N` e `rect x=436 y=280 w=68 h=8 rx=4 fill=#cdd5ef`;
  B2 `x=548 fill=#fff0e5 stroke=L sw=4` com a faísca `fill=L transform="translate(582 258) scale(1.6)"`;
  B3 `x=676 fill=#eef1fb stroke=N sw=4` com `rect x=692 y=262 w=56 h=8 rx=4 fill=N`, `rect x=692 y=276 w=72 h=8 rx=4 fill=#cdd5ef`, `rect x=692 y=290 w=40 h=8 rx=4 fill=#cdd5ef`.
- Setas `stroke=N sw=4 fill=none`: `M528 276 h14 M536 270 l6 6 -6 6`; `M656 276 h14 M664 270 l6 6 -6 6`; descida `M728 310 v30 M722 334 l6 6 6 -6`.
- Linha de baixo, `rect y=350 w=104 h=60 rx=12`: B4 `x=676 fill=N` com `path M712 380 l10 10 l22 -22 stroke=#fff sw=6 fill=none`;
  B5 `x=548 fill=#eef1fb stroke=N sw=4` com ramo do Git `path M576 368 V394 M576 378 Q576 380 606 380 stroke=N sw=4 fill=none`, `circle cx=576 cy=366 r=6 fill=N`, `circle cx=576 cy=396 r=6 fill=N`, `circle cx=612 cy=380 r=6 fill=L`.
- Seta B4→B5 `M672 380 h-14 M664 374 l-6 6 6 6 stroke=N sw=4`. Volta tracejada `path M544 380 H472 V316 stroke=#cdd5ef sw=4 stroke-dasharray="2 10" fill=none` + ponta `path M466 322 l6 -8 l6 8 stroke=#cdd5ef sw=4 fill=none`.

**`prompt` (G2)** — conversa com pedido estruturado.
- Balão `rect x=430 y=240 w=300 h=130 rx=18 fill=#eef1fb stroke=#cdd5ef sw=3`.
- 4 linhas, y = 260, 286, 312, 338: rótulo `rect x=450 w=50 h=12 rx=6 fill=L`; texto `rect x=510 h=12 rx=6` com larguras 170, 140, 190, 120; a 1ª `fill=N`, as outras `fill=#cdd5ef`.
- Caixa de envio `rect x=430 y=396 w=340 h=44 rx=22 fill=#fff stroke=N sw=4`; cursor `path M452 408 v20 stroke=L sw=4`; botão `circle cx=746 cy=418 r=16 fill=L`; seta `path M739 418 h14 M747 411 l7 7 -7 7 stroke=#fff sw=4 fill=none`.
- Faísca `fill=LC transform="translate(744 236) scale(2)"`.

**`instrucoes` (G3)** — arquivo lido pelo assistente.
- Documento `path M440 240 h150 l40 40 v150 h-190 Z fill=#fff stroke=N sw=5`; dobra `path M590 240 v40 h40 Z fill=#eef1fb stroke=N sw=5`.
- Título 1: `rect x=462 y=266 w=16 h=16 rx=4 fill=L` + `rect x=486 y=268 w=80 h=12 rx=6 fill=N`; linhas `rect x=462 w=140 h=8 rx=4 fill=#cdd5ef` em y=298 e 314.
- Título 2: `rect x=462 y=338 w=16 h=16 rx=4 fill=L` + `rect x=486 y=340 w=100 h=12 rx=6 fill=N`.
- Lista: `circle cx=468 r=4 fill=N` em cy = 372, 390, 408, com `rect x=480 h=8 rx=4 fill=#cdd5ef` em y = cy − 4 e larguras 110, 90, 120.
- Seta `path M646 336 h50 M686 326 l10 10 -10 10 stroke=L sw=6 fill=none`; assistente `circle cx=740 cy=336 r=40 fill=N` + faísca `fill=#fff transform="translate(716 312) scale(2)"`.

**`skills` (G4)** — três cartões de receita, o do meio escolhido.
- A `rect x=430 y=290 w=110 h=140 rx=14 fill=#eef1fb stroke=#cdd5ef sw=3`; C igual com `x=660`; B (levantado) `rect x=545 y=250 w=110 h=140 rx=14 fill=L`.
- Em A e C: `rect x=X+16 y=308 w=60 h=10 rx=5 fill=N`, `rect x=X+16 y=330 w=78 h=6 rx=3 fill=#cdd5ef`, `rect x=X+16 y=344 w=60 h=6 rx=3 fill=#cdd5ef`.
  Ícone de A: `circle cx=485 cy=395 r=16 fill=none stroke=N sw=4` + `path M485 387 v16 M477 395 h16 stroke=N sw=4`.
  Ícone de C: `path M706 383 l-12 12 12 12 M730 383 l12 12 -12 12 stroke=N sw=4 fill=none`.
- Em B: `rect x=561 y=268 w=60 h=10 rx=5 fill=#fff`, `rect x=561 y=290 w=78 h=6 rx=3 fill=#fff0e5`, `rect x=561 y=304 w=60 h=6 rx=3 fill=#fff0e5`; `circle cx=600 cy=350 r=22 fill=#fff` + `path M590 350 l7 7 l13 -14 stroke=L sw=5 fill=none`.

**`mcp` (G5)** — assistente no centro ligado a três conectores.
- Ligações `stroke=#cdd5ef sw=6`: `path M562 338 H480`, `path M630 316 L700 280`, `path M630 360 L700 398`; pontos `circle r=6 fill=L` em (520,338), (665,298), (665,379).
- Centro `circle cx=600 cy=338 r=38 fill=N` + faísca `fill=#fff transform="translate(576 314) scale(2)"`.
- Banco (esquerda): `path M416 312 v52 a30 10 0 0 0 60 0 v-52 fill=#eef1fb stroke=N sw=4`, `ellipse cx=446 cy=312 rx=30 ry=10 fill=#eef1fb stroke=N sw=4`, `path M416 338 a30 10 0 0 0 60 0 fill=none stroke=N sw=3`.
- Pasta (em cima à direita): `path M704 250 h24 l8 10 h34 v42 h-66 Z fill=#fff0e5 stroke=L sw=4`.
- Janela (embaixo à direita): `rect x=704 y=384 w=66 h=48 rx=8 fill=#eef1fb stroke=N sw=4`, `path M704 398 h66 stroke=N sw=3`, `circle r=3 fill=N` em (712,391) e (721,391).

**`escudo` (G6)** — escudo, chave proibida no chat, confirmação.
- Escudo `path M600 238 l80 30 v58 c0 52 -34 88 -80 104 c-46 -16 -80 -52 -80 -104 v-58 Z fill=N`; fechadura `circle cx=600 cy=318 r=18 fill=L` + `rect x=592 y=326 w=16 h=40 rx=8 fill=L`.
- Balão `rect x=414 y=262 w=84 h=60 rx=14 fill=#eef1fb stroke=#cdd5ef sw=3`; chave `circle cx=440 cy=292 r=10 fill=none stroke=N sw=4` + `path M450 292 h30 M470 292 v8 M478 292 v6 stroke=N sw=4`; proibido `circle cx=456 cy=292 r=36 fill=none stroke=L sw=5` + `path M431 317 L481 267 stroke=L sw=5`.
- Confirmação `circle cx=730 cy=380 r=24 fill=#3ee0b0` + `path M719 380 l7 7 l13 -14 stroke=#fff sw=5 fill=none`.

**`revisao` (G7)** — painel de diferenças + lista de revisão.
- Painel `rect x=420 y=244 w=240 h=186 rx=14 fill=N`; destaque da linha 6 `rect x=428 y=379 w=224 h=24 rx=6 fill=#1d2c66` (desenhar antes das linhas).
- 7 linhas, y = 266 + 24 × i (i = 0 a 6): marcador `rect x=436 w=10 h=10 rx=3` (`fill=#3ee0b0` em i = 2 e 3; `fill=L` em i = 5; `fill=#2a3c80` nas outras); código `rect x=456 h=10 rx=5` com larguras 120, 90, 150, 110, 70, 130, 100 (`fill=LC` em i = 5; `fill=#2a3c80` nas outras).
- Lista `rect x=680 y=264 w=104 h=148 rx=12 fill=#eef1fb stroke=#cdd5ef sw=3`; 3 itens, y = 284, 324, 364: caixa `rect x=694 w=22 h=22 rx=6` (2 primeiras `fill=L` com `path M699 y+11 l5 5 l9 -10 stroke=#fff sw=4 fill=none`; a 3ª `fill=none stroke=#cdd5ef sw=3`); linha `rect x=724 y=y+7 w=46 h=8 rx=4` (`fill=N` nas 2 primeiras, `#cdd5ef` na 3ª).

**`qualidade` (G8)** — página + três selos (busca, contraste, velocidade).
- Página `rect x=420 y=240 w=200 h=190 rx=12 fill=#eef1fb stroke=#cdd5ef sw=3`; título `rect x=438 y=258 w=120 h=14 rx=7 fill=N`; linhas `rect x=438 w=160 h=8 rx=4 fill=#cdd5ef` em y=284 e 298; imagem `rect x=438 y=316 w=164 h=70 rx=8 fill=#dde3f6` + `path M450 376 l26 -28 l18 16 l14 -10 l30 22 Z fill=#cdd5ef`; botão `rect x=438 y=398 w=70 h=18 rx=9 fill=L`.
- Ligações `path M620 272 H670 M620 338 H670 M620 404 H670 stroke=#cdd5ef sw=4`.
- Selos `circle cx=700 r=30 fill=#fff stroke=N sw=5` em cy = 272, 338, 404: lupa `circle cx=696 cy=268 r=10 fill=none stroke=N sw=4` + `path M703 275 l9 9 stroke=N sw=5`; contraste `circle cx=700 cy=338 r=14 fill=none stroke=N sw=4` + `path M700 324 a14 14 0 0 1 0 28 Z fill=N`; raio `path M704 388 L690 408 H702 L698 424 L714 402 H702 Z fill=L`.
- Confirmações `circle cx=742 r=10 fill=#3ee0b0` em cy = 254, 320, 386, cada uma com `path M737 cy l4 4 l7 -8 stroke=#fff sw=3 fill=none`.

O executor pode mover **até 12 px** sem pedir; mais que isso, anotar na resposta.

### D.3 Entradas de `CAPAS` (com `trilha: "ia"`)

| slug | etapa | arte | alt |
|---|---|---|---|
| `criar-site-com-ia-do-jeito-certo` | planejar | fluxo | Ilustração de um ciclo de cinco caixas ligadas por setas dentro de uma janela de navegador: plano, pedido à IA, partes pequenas, revisão aprovada e versão salva. |
| `prompt-para-criar-site-com-ia` | pedir | prompt | Ilustração de uma conversa com um assistente de IA: um balão com o pedido dividido em partes marcadas em laranja e a caixa de envio logo abaixo. |
| `arquivo-de-instrucoes-para-assistente-de-codigo` | contexto | instrucoes | Ilustração de um arquivo de texto com títulos e listas sendo lido por um assistente de IA, representado por um círculo azul-marinho com uma faísca branca. |
| `skills-para-assistentes-de-ia` | alem | skills | Ilustração de três cartões de receita lado a lado, com o do meio em laranja e levantado, representando a skill escolhida pelo assistente para a tarefa. |
| `o-que-e-mcp-servidores-mcp` | alem | mcp | Ilustração de um assistente de IA no centro ligado por linhas a um banco de dados, uma pasta e uma janela de ferramenta, como num padrão de conexão. |
| `seguranca-ao-criar-site-com-ia` | publicar | escudo | Ilustração de um escudo azul-marinho com fechadura laranja, uma chave riscada dentro de um balão de conversa e um selo verde de confirmação. |
| `como-revisar-codigo-gerado-por-ia` | revisar | revisao | Ilustração de um painel de código com linhas marcadas em verde e uma em laranja, ao lado de uma lista de revisão com dois itens concluídos. |
| `site-feito-com-ia-seo-acessibilidade-e-velocidade` | revisar | qualidade | Ilustração do rascunho de uma página ao lado de três selos aprovados: uma lupa de busca, um círculo de contraste e um raio de velocidade. |

Comando: `node scripts/make-capas.mjs <os 8 slugs> --folha`. Pesos < 60 KB. **Parar e mostrar a folha ao dono** antes
de seguir (é linguagem nova de régua).

---

## E. Ferramentas (fatias F5 e F6, depois dos guias)

Todas no navegador, sem envio de dados, com `ToolLayout` + `ToolPanel`, texto explicativo (`explain`) e entrada em
`TOOLS` (como em [ferramentas.md](ferramentas.md)). Antes de implementar cada uma, um plano visual curto (formulário,
estados) no mesmo arquivo, seção nova.

| Ferramenta | O que faz | Esforço | Valor | Quando |
|---|---|---|---|---|
| **Gerador de prompt para site** (`/ferramentas/prompt-para-site`) | formulário (tipo de negócio, cidade/região, ação principal, público, páginas em caixas de marcar, 2 cores, clima em 3 opções, tecnologia: HTML simples / WordPress / construtor / "a IA sugere", onde vai hospedar, o que evitar) → pedido estruturado em pt-BR no formato do G2, com "Antes de escrever código, liste os arquivos e espere o meu ok"; copiar; rascunho salvo no `localStorage` (`criasite_prompt_site`); botão limpar | M | alto: casa com a busca "prompt para criar site", serve a iniciante, uso recorrente (cada página nova) | **1ª** (F5) |
| **Gerador de arquivo de instruções** (`/ferramentas/arquivo-de-instrucoes-ia`) | campos do G3 (projeto, público, tecnologias em chips, 4 comandos, pastas, regras prontas para marcar: perguntar antes de apagar, rodar o build, não instalar sem pedir, textos em pt-BR, nunca segredo no código) → Markdown; copiar e baixar com nome escolhido (AGENTS.md, CLAUDE.md ou outro: só muda o nome do arquivo baixado); salvo no navegador | M | alto e raro em pt-BR; público mais técnico | **2ª** (F6) |
| Checklist de revisão de código gerado por IA | itens do G7 com progresso salvo | P | médio: o G7 e o checklist do hub já cobrem | **depois** (só se o G7 tiver tráfego no Search Console) |

Categoria das duas primeiras: `tecnico` (sem cor nova). Acrescentar `TOOL_TERMS` no robô (`assemble.ts`):
"prompt" → gerador de prompt; "arquivo de instruções", "AGENTS.md" → gerador de instruções. Depois de no ar: links
dos guias G2 e G3 para as ferramentas (UPDATE por migration ou painel).

---

## F. Robô de notícias (fatia F1)

### F.1 Fontes candidatas (só nomes; **o executor confirma a URL do feed com curl antes de gravar**)

| Veículo/blog oficial | Onde procurar o feed (palpite a conferir) | Peso | Genérica? |
|---|---|---|---|
| GitHub Blog (de preferência a categoria de IA) | github.blog: testar a categoria de IA e, se não houver, o feed geral | 6 | sim |
| Make WordPress, equipe de IA | make.wordpress.org/ai (feed padrão do WordPress em /feed/) | 6 | não |
| Google Developers Blog | developers.googleblog.com | 5 | sim |
| OpenAI News | openai.com/news (procurar link de RSS na página) | 4 | sim |
| Anthropic News | anthropic.com/news: **só se existir RSS oficial**; feed de terceiros não vale | 4 | sim |
| Vercel Blog | vercel.com/blog (procurar atom/rss) | 4 | sim |
| Opcional, pt-BR: Tecnoblog | tecnoblog.net (feed padrão /feed/) | 3 | sim (exige os termos em português do filtro) |

Como conferir (Git Bash):
```bash
curl -sSIL -A "Mozilla/5.0" "<url>" | grep -iE "^HTTP|content-type"     # 200 e xml/rss/atom
curl -sL -A "Mozilla/5.0" "<url>" | head -c 800                            # começa com <rss ou <feed
curl -sL -A "Mozilla/5.0" "<url>" | grep -oE "<(pubDate|updated)>[^<]+" | head -3   # itens recentes
```
Sem feed ou sem item nas últimas semanas: **não gravar**. O leitor aceita RSS 2.0 e Atom (`rss.server.ts`).

Migration `0NN_fontes_ia.sql` (próximo número livre):
```sql
-- CriaSite · migration 0NN · fontes do robô para IA aplicada a sites (assistentes e agentes de código, MCP, IA no WordPress)
-- Fontes genéricas só publicam com assunto de sites ou de IA para programar (ver GENERIC_FEEDS em app/lib/robot/topic.ts).
SET NAMES utf8mb4;
INSERT IGNORE INTO feeds (name, url, language, section_hint, weight) VALUES
  ('GitHub Blog', '<url conferida>', 'en', 'ia', 6),
  ('Make WordPress AI', '<url conferida>', 'en', 'ia', 6),
  …;
```
O `name` gravado tem de ser **idêntico** ao usado em `GENERIC_FEEDS`.

### F.2 `app/lib/robot/topic.ts`

1. Em `SKIP_PATTERNS`, novo item: `[/\bmeeting (notes|summary|recap|agenda)\b|\bdev chat\b|\bteam meeting\b/i, "ata de reunião"]`
   (os blogs Make WordPress publicam muitas atas).
2. Nova constante (título + começo do resumo, como `SITE_TOPIC`):
   ```ts
   /** IA aplicada a criar e programar sites: assistentes e agentes de código, geradores de site, MCP, skills. */
   const AI_DEV_TOPIC =
     /\b(coding (assistants?|agents?|tools?|models?)|code (assistants?|generation|review|completion|editors?)|ai[- ](coding|code|pair programm\w*|ide)|vibe[- ]?cod\w*|agentic (coding|development|workflows?)|software (engineering|development) agents?|model context protocol|mcp( servers?)?|agent skills|github copilot|copilot (for|in) (github|vs ?code|visual studio)|claude code|cursor|windsurf|codex|replit|lovable|bolt\.new|v0\.(dev|app)|(app|site|website) builders?|no-?code|low-?code|pull requests?|agents\.md|assistentes? de (código|programação)|agentes? de (ia|código)|programar com ia|criar sites? com ia)\b/i;
   ```
   Fica de fora de propósito: "copilot" sozinho (o assistente de consumo da Microsoft), "agents" sozinho, "developers"
   sozinho, "ChatGPT", "Gemini", "Claude" sozinhos (modelo de uso geral).
3. Nova constante para a **IA em geral que interessa a quem cria sites** (decisão do dono sobre a notícia de Harvard):
   ```ts
   /** IA em geral que interessa a quem tem site: custo e impacto ambiental, IA na busca e no tráfego, conteúdo feito com IA. */
   const AI_INTEREST_TOPIC =
     /\b(data cent(er|re)s?|environmental|energy (use|consumption)|carbon footprint|water use|ai[- ]generated (content|text|images?)|ai content|ai search|answer engines?|chatbot (traffic|referrals?)|(web )?designers?|freelancers?|impacto ambiental|conteúdo gerado por ia)\b/i;
   ```
4. Nova lista, aplicada **só a fontes genéricas** e só ao título (para não barrar, por exemplo, "Automattic compra
   plugin X" vindo do WP Tavern). Ela vence as listas de aceitação acima:
   ```ts
   /** IA em geral que NÃO interessa (vale só para GENERIC_FEEDS): regulação, justiça, negócios, AGI. */
   export const GENERIC_AI_OFF: [RegExp, string][] = [
     [/\b(regulat\w+|ai act|lawsuits?|sues?|sued|court|judge|antitrust|ftc|lawmakers?|senators?)\b/i, "fora do assunto: regulação e justiça"],
     [/\b(agi|superintelligence|alignment|military|pentagon|deepfakes?|companions?|girlfriends?)\b/i, "fora do assunto: IA em geral"],
     [/\b(acquires?|acquisition|merger|layoffs?|poach\w*)\b/i, "fora do assunto: negócios de empresas de IA"],
   ];
   ```
   (Data centers e energia **não** entram aqui: o dono quer esse tipo de notícia. Se ele mudar de ideia na Pergunta 9,
   basta mover o termo de `AI_INTEREST_TOPIC` para uma linha nova desta lista.)
5. `GENERIC_FEEDS`: `new Set(["The Verge (IA)", "GitHub Blog", "Google Developers Blog", "OpenAI News", "Anthropic News", "Vercel Blog", "Tecnoblog"])`
   (deixar só os que entraram na migration).
6. `skipReason`, a linha das genéricas vira:
   ```ts
   if (GENERIC_FEEDS.has(feed)) {
     const ai = GENERIC_AI_OFF.find(([re]) => re.test(title));
     if (ai) return ai[1];
     const text = `${title} ${summary.slice(0, 400)}`;
     if (!SITE_TOPIC.test(text) && !AI_DEV_TOPIC.test(text) && !AI_INTEREST_TOPIC.test(text)) return "fora do assunto: fonte genérica sem tema de sites";
   }
   ```
   Atualizar o comentário do topo e `docs/automacao.md`.

### F.3 Casos de teste (script temporário fora do repositório; `node --experimental-strip-types` ou `npx tsx` importando `topic.ts`)

Resumo vazio, a não ser quando indicado. Esperado: **passa** (`null`) ou o motivo.

| # | Fonte | Título | Esperado |
|---|---|---|---|
| 1 | GitHub Blog | GitHub Copilot can now open pull requests on its own | passa |
| 2 | The Verge (IA) | Cursor adds background agents that fix bugs while you sleep | passa |
| 3 | The Verge (IA) | Model Context Protocol support comes to Windows apps | passa |
| 4 | Make WordPress AI | WordPress AI team proposes building blocks for plugin developers | passa (fonte não genérica) |
| 5 | The Verge (IA) | Vibe coding platform Lovable adds a security scan before publishing | passa |
| 6 | OpenAI News | Codex can now review code directly in GitHub | passa |
| 7 | The Verge (IA) | Google's new AI tool turns sketches into working websites | passa (SITE_TOPIC) |
| 8 | Tecnoblog | Como usar agentes de IA para programar com segurança | passa (termos em português) |
| 9 | The Verge (IA) | Claude Code now supports agent skills and plugins | passa |
| 10 | The Verge (IA) | AI agents are now a major source of traffic to websites | passa (já passava) |
| 11 | The Verge (IA) | Nvidia's new GPU doubles AI training speed | chips e hardware |
| 12 | The Verge (IA) | EU AI Act: what changes for chatbots next year | regulação e justiça |
| 13 | The Verge (IA) | Lovable raises $200 million at a new valuation | bolsa e investimento |
| 14 | OpenAI News | OpenAI launches a new voice mode for ChatGPT | fonte genérica sem tema de sites |
| 15 | The Verge (IA) | Microsoft Copilot gets a new look on Windows | fonte genérica sem tema de sites |
| 16 | The Verge (IA) | Data centers for AI are straining the power grid | passa (`AI_INTEREST_TOPIC`, decisão do dono) |
| 17 | The Verge (IA) | New York Times sues OpenAI over training on its articles (resumo cita "publishers") | regulação e justiça |
| 18 | The Verge (IA) | Apple Intelligence comes to the iPhone in Portuguese | aparelhos |
| 19 | GitHub Blog | GitHub Actions gets faster hosted runners | fonte genérica sem tema de sites |
| 20 | The Verge (IA) | Best AI coding tools you can try right now | lista de 'melhores' (o padrão atual exige "best … tools"; conferir) |
| 21 | Make WordPress AI | AI Team meeting summary | ata de reunião |
| 22 | The Verge (IA) | Harvard reveals high environmental impact of AI data centers | passa (a notícia que o dono manteve) |
| 25 | The Verge (IA) | Google says AI-generated content is fine if it helps users | passa (`AI_INTEREST_TOPIC`) |
| 26 | The Verge (IA) | OpenAI acquires a data center startup | negócios de empresas de IA (`GENERIC_AI_OFF` vence) |
| 23 | Google Search Central Blog | Search Console adds a new report for AI Mode | passa (fonte não genérica) |
| 24 | WP Tavern | Automattic acquires a popular forms plugin | passa (GENERIC_AI_OFF não vale para fonte não genérica) |

Todos têm de dar o esperado; se algum falhar, ajustar a regex e rodar de novo (anotar a mudança em `automacao.md`).
Depois do deploy, olhar `/admin/fila` por 3 dias: pautas de IA descartadas por engano ou que passaram sem ser de sites.

### F.4 `BOOST` (`app/lib/robot/robot.server.ts`)

Acrescentar `[/\b(coding (assistant|agent)s?|ai coding|vibe[- ]?cod\w*|model context protocol|mcp|agentic|agent skills)\b/i, 8]`.
Menor que o de Google/segurança (14 e 12) de propósito: IA não deve dominar o feed.

### F.5 Guia editorial do redator (`SYSTEM` em `writer.server.ts`)

- **VOZ E TOM**, no exemplo de termos: acrescentar `"MCP, o padrão que liga assistentes de IA a outras ferramentas"`.
- **FOCO NO LEITOR**, novo item: "Ferramenta de IA para criar ou programar sites (assistente ou agente de código,
  gerador de site, IA no WordPress): diga o que ela faz, para quem serve e o que exige (conta, plano, conhecimento),
  segundo as fontes, e o cuidado que o leitor precisa ter (revisar o código, não colar senhas nem dados de clientes).
  Nada de 'a IA vai substituir programadores' e nada de comparar qual ferramenta é melhor."
- **QUANDO NÃO PUBLICAR**, no 1º item, acrescentar: "notícia de IA sem relação com criar ou cuidar de sites (modelo
  novo de uso geral, chatbot de consumo, regulação, processos, investimentos, compra de empresas, chips)". E, logo
  depois, uma linha de exceção: "IA em geral pode ser publicada quando muda algo para quem tem site: custo e impacto
  ambiental da IA, IA na busca e no tráfego dos sites, regras sobre conteúdo feito com IA. Nesses casos, explique em que
  isso afeta o site do leitor."
- **CAMPOS**, trocar "inteligência artificial em \"ia\"" por "IA aplicada a sites (assistentes e agentes de código,
  geradores de site, MCP, IA no WordPress e nas plataformas, robôs de IA que visitam sites) em \"ia\"".
- O link interno do hub entra na fatia F3 (A.2, item 10), não aqui.

---

## G. SEO e AdSense

**Buscas que o plano mira (pt-BR; volume não verificado: conferir no Search Console 4 semanas depois)**:
"criar site com ia", "como criar um site com inteligência artificial", "prompt para criar site", "vibe coding",
"o que é mcp", "servidor mcp", "skills ia" / "skills claude", "agents.md", "arquivo de instruções ia",
"código gerado por ia é seguro", "revisar código gerado por ia", "site feito com ia aparece no google".
O hub mira o termo amplo; cada guia mira um termo mais específico (focus_keyword no título, de preferência no começo).

**Risco "conteúdo gerado por IA" e como o plano mitiga**:
- O Google avalia utilidade, não o método; o problema é conteúdo em massa, raso ou repetido. Este plano: 8 guias (não
  80), cada um com estrutura própria, checklists e passos que o leitor executa, ligados às ferramentas do site.
- Texto **original**: nada copiado de documentação de fornecedor nem de outros sites; os esqueletos acima são do CriaSite.
- **Fatos conferíveis** e atemporais (regra B.0.4); o que muda manda conferir na fonte oficial.
- **Revisão humana** antes ou logo depois de publicar (Pergunta 4) e correções pelo painel (`updated_at`).
- O robô continua só nas notícias; guias nunca saem do robô.
- Transparência: seção H (política editorial e nota no hub).

**E-E-A-T sem exagero**: autor "Equipe CriaSite" (como hoje), sem currículo inventado, sem "especialistas", sem
selos. Experiência real só se for verdade (Pergunta 5: o próprio CriaSite foi feito com assistente de código).
Página de política editorial atualizada e link para ela no hub.

---

## H. Aviso editorial (transparência sobre IA)

### H.1 `/politica-editorial` (`app/routes/editorial.tsx`, seção `automacao`)

Renomear o título para "Automação e inteligência artificial" (já é) e trocar o corpo por 3 parágrafos + lista atual:
1. Notícias: "As notícias são escritas por inteligência artificial a partir de fontes identificadas e sempre
   creditadas, seguindo as regras abaixo." (+ a lista que já existe).
2. Guias: "Os guias são planejados pela Equipe CriaSite e escritos com apoio de ferramentas de inteligência artificial.
   Antes de publicar, cada guia passa por revisão humana e checagem dos fatos em fontes oficiais. Nenhuma empresa paga
   para aparecer nos guias, e os produtos citados são só exemplos."
3. "Ferramentas de IA mudam rápido: quando um guia fala delas, descreve categorias e cuidados, e não preços ou versões.
   Se algo ficou desatualizado, avise pelo canal de correções."
Atualizar `updated` em `DOC_PAGES` para a data da execução. **O texto 2 só vale se a revisão humana acontecer de
fato** (Pergunta 4).

### H.2 Nota "Sobre este roteiro" no hub

"Os guias deste roteiro são escritos pela Equipe CriaSite com apoio de IA e revisados antes de publicar. Nenhuma
ferramenta pagou para aparecer, e os nomes citados são só exemplos. Recursos e preços de ferramentas de IA mudam com
frequência: confira sempre na documentação oficial. Veja a nossa política editorial." (+ se Pergunta 5 = sim: "O
próprio CriaSite foi construído com um assistente de código, seguindo estas etapas.")

---

## I. Arquivos afetados (todas as fatias)

| Arquivo | Fatia | O quê |
|---|---|---|
| `app/lib/robot/topic.ts` | F1 | `AI_DEV_TOPIC`, `AI_INTEREST_TOPIC`, `GENERIC_AI_OFF`, `GENERIC_FEEDS`, ata de reunião |
| `app/lib/robot/robot.server.ts` | F1 | 1 linha no `BOOST` |
| `app/lib/robot/writer.server.ts` | F1, F3 | guia editorial (F1); link do hub (F3) |
| `db/migrations/0NN_fontes_ia.sql` | F1 | **novo** |
| `scripts/make-capas.mjs` | F2 | régua de IA, 8 artes, 8 entradas |
| `public/capas/*.webp` | F2 | **8 novas** |
| `app/lib/site.ts` | F3 | `AI_TRACK`, `AI_TAG`, descrição da editoria `ia`, data da política editorial |
| `app/lib/repo/types.ts`, `repo/mysql.server.ts`, `repo/mock.server.ts`, `content.server.ts` | F3 | filtros `slugs` e `tag` |
| `app/lib/prefs.ts` | F3 | `useChecklist`, `useAiTrack` |
| `app/routes.ts`, `app/routes/ai-track.tsx` | F3 | rota e página **nova** |
| `app/lib/availability.ts` | F3 | item "Site com IA" no `navFor` |
| `app/routes/post.tsx` | F3 | "Leia também" por família (tag) |
| `app/components/cards.tsx` | F3 | pílula da tag no `GuideCard` |
| `app/routes/home.tsx`, `app/routes/trail.tsx` | F3 | card e box do roteiro |
| `app/routes/editorial.tsx` | F3 | aviso editorial |
| `app/lib/mock-data.ts` | F3 | guia de exemplo com tag |
| `db/migrations/0NN_guias_ia.sql` | F4 | **novo**: 8 guias |
| `app/routes/tool-*.tsx`, `TOOLS`, `routes.ts`, `assemble.ts` | F5, F6 | ferramentas |
| `docs/ia-desenvolvimento.md`, `README.md`, `decisoes.md`, `automacao.md`, `arquitetura.md`, `ferramentas.md` | todas | status |

---

## J. Passos (por fatia; cada fatia termina com build, commit e push)

### F1 · Robô (P) — ✅ executada em 2026-11-17 (migration `007_fontes_ia.sql`, 41 casos de teste certos)
1. Ler `topic.ts`, `robot.server.ts` (BOOST), `writer.server.ts` (SYSTEM), `002_robo.sql`.
2. Conferir as URLs da tabela F.1 com curl; anotar as que valem (nome exato + URL).
3. Editar `topic.ts` (F.2) e rodar os 26 casos (F.3) até todos baterem.
4. `BOOST` (F.4) e guia editorial (F.5).
5. Criar `db/migrations/0NN_fontes_ia.sql` só com as fontes conferidas; nomes iguais aos de `GENERIC_FEEDS`.
6. `npm run typecheck` e `npm run build`. Atualizar `automacao.md` (fontes, filtro, casos de teste).
7. Commit `feat(robo): notícias de IA aplicada a sites (fontes e filtro de assunto)` e push. Colar o SQL na resposta.
8. Depois do deploy: `/api/cron/fontes` e `/api/cron/paginas` (como no doc de automação); `/admin/fontes` sem erro;
   fila acompanhada por 3 dias.

### F2 · Capas (M) — ✅ executada em 2026-11-17 (8 capas, 8 a 12 KB; as capas só aparecem no site quando a migration dos guias da F3+F4 apontar para elas)
1. Ler `capas.md` e `make-capas.mjs`.
2. Régua de IA (D.1) e a arte `fluxo` com a entrada do G1; gerar com `--folha`.
3. **Parar e mostrar ao dono** a capa e a folha (régua com losangos e faísca). Seguir com o ok.
4. As outras 7 artes e entradas; gerar as 8; conferir pesos e a zona segura (corte 21:9 e 1:1).
5. Commit `feat(capas): capas do roteiro de IA` e push (as imagens ficam sem uso até a F4; não quebra nada).

### F3 · Estrutura e hub (M) — **mesmo push da F4**
1. Itens 1 a 11 da seção A.2, na ordem.
2. Página do hub conforme C.2 e C.3; card da home (C.4); box da trilha (C.5); aviso editorial (H).
3. `npm run typecheck`, `npm run build`, `npm run dev` (mock): conferir o critério C.6 com o guia de exemplo.
4. Não fazer push sozinho: o hub sem guias no banco ficaria só com etapas (e com `noindex`); o push vai com a F4.

### F4 · Guias (G) — dividir em 2 dias, push só no fim
1. Dia 1: escrever G1, G2, G3, G6 (os 4 que abrem o roteiro e vão para a home). Sem push.
2. Dia 2: G7, G8, G4, G5; montar o script temporário (B.3) e gerar `0NN_guias_ia.sql`; caminho inverso do SQL;
   checklist de qualidade (guias.md, seção E) + regra de fatos (B.0.4) + lista de avisos do script.
3. `npm run build`; commit único `feat: roteiro Criar site com IA (hub, 8 guias, capas, menu)` com F3 + F4; push.
4. Depois do deploy: Como verificar (abaixo). Enviar `/criar-site-com-ia` para indexação no Search Console.
5. Atualizar `ia-desenvolvimento.md` (status, palavras por guia), `README.md`, `decisoes.md`.

### F5 · Ferramenta gerador de prompt (M) e F6 · gerador de arquivo de instruções (M)
Plano visual curto em seção nova deste doc antes de cada uma (pode ser feito pelo próprio chat em Opus). Seguir
"Como adicionar uma ferramenta" de `ferramentas.md`; ligar no hub (etapas 3 e 2) e nos guias G2 e G3.

## K. Ordem, tamanho e dia sugerido

| Fatia | Tamanho | Entregável sozinha? | Dia sugerido |
|---|---|---|---|
| F1 Robô: fontes, filtro, redator | P | sim | **sex 20/11** (dia livre da semana; ou ter 17/11 se sobrar tempo depois do "está fora do ar?") |
| F2 Capas do roteiro | M | sim (imagens sem uso até a F4) | **seg 23/11** |
| F4 dia 1: G1, G2, G3, G6 | G | não (sem push) | **ter 24/11** |
| F3 estrutura/hub + F4 dia 2: G7, G8, G4, G5 + push | G | sim (o par F3+F4) | **qua 25/11** |
| F5 Gerador de prompt | M | sim | **dom 29/11** (dia de ferramenta) |
| F6 Gerador de instruções | M | sim | semana seguinte |
| 2ª leva de IA (ideias: vibe coding, quando não usar IA, IA no WordPress, IA para os textos do site, erros e alucinação) | G | sim | depois de 4 semanas de dados no Search Console |

A semana de 17/11 já tem: ter "está fora do ar?", qua mídia kit, qui mídia kit + orçamento, sáb 3ª leva (privacidade),
dom 3ª ferramenta. Por isso só a F1 cabe nela.

## Riscos e cuidados

- **Número das migrations**: a 3ª leva (sábado) e a F1 disputam 007/008. Sempre o próximo número livre na hora.
- **Hub sem guias**: não fazer push da F3 sem a F4 (página fina; e links do menu para um hub vazio).
- **Fatos voláteis**: é o maior risco desta leva. Na dúvida, tirar o nome do produto ou o detalhe e mandar conferir na
  documentação oficial. Nunca preço, versão, data, porcentagem ou ranking.
- **Aspas e barras no JSON**: modelos de prompt e de arquivo de instruções (G2, G3) tentam a usar aspas, colchetes e
  barras: usar MAIÚSCULAS para campos, aspas curvas e comandos por extenso. Colchete sem `(url)` logo depois não vira
  link, mas evite para não confundir o validador.
- **Regex do robô**: "cursor" e "codex" são palavras que podem aparecer fora do contexto; aceitável nas fontes
  genéricas de IA. Se aparecer falso positivo na fila, ajustar e anotar.
- **IA dominando o feed**: pesos 3 a 6 e BOOST 8 de propósito; se em 2 semanas mais da metade das notícias for de IA,
  baixar pesos no `/admin/fontes`.
- **Menu com 5 itens**: conferir 768 e 1024 px (C.6).
- **"Leia também" por tag**: guia de IA sem `tag` (editado no painel e apagada) cai na família clássica; manter a tag.
- **Revisão humana declarada** na política editorial: só publicar o texto H.1 item 2 se o dono for mesmo revisar.
- React Router: `npm run build` antes de todo push; o hub tem loader novo (usa `listPosts`, sem `request.url`).
- Migrations rodam uma vez: correção depois do deploy é pelo painel ou nova migration. Colar o SQL na resposta ao dono.

## Como verificar

- F1: os 26 casos batem; `npm run build` ok; depois do deploy, `/admin/fontes` com as fontes novas sem erro e a fila
  com pautas de IA de sites marcadas "new" e as genéricas de IA "skipped" com o motivo certo.
- F2: tabela do script com 8 linhas < 60 KB; folha com as 8 capas da mesma família, régua com losangos e faísca.
- F3+F4: script com 8 linhas (800 a 950 palavras, 3 a 6 internos, ≤ 1 externo, tag Com IA); `npm run build` ok;
  produção: `/criar-site-com-ia` com 6 etapas e os 9 guias (8 + checklist de lançamento); menu "Site com IA";
  `/sitemap.xml` com `/criar-site-com-ia`; `/guias` com 20 cards, os 8 de IA com a pílula; home com o card do roteiro
  e G1, G2, G6 em "Guias novos"; um guia de IA com "Leia também" só de IA e um clássico só com clássicos;
  `/busca?q=mcp` acha o G5; `/politica-editorial` com o aviso novo; checklist do hub marca e lembra ao recarregar.

## Perguntas em aberto (com recomendação)

1. **Estrutura**: guias em `/guias` com a tag "Com IA" + hub `/criar-site-com-ia` (opção 4), em vez de editoria nova
   ou segunda trilha completa? **Recomendo a opção 4** (menos código, URLs estáveis, página forte para o termo principal).
2. **Nome no menu e endereço**: "Site com IA" e `/criar-site-com-ia`? Alternativas: "Com IA" / `/ia-para-sites`.
   **Recomendo "Site com IA" + `/criar-site-com-ia`** (o endereço é a própria busca).
3. **Card na home**: o card escuro no `aside` (C.4) basta, ou quer o roteiro também na faixa do topo? **Recomendo só o
   card**: a faixa do topo é da trilha e duas faixas brigariam.
4. **Revisão humana dos 8 guias**: publicar direto (como nas levas 1 e 2) e você lê nos dias seguintes pelo painel, ou
   entrar como rascunho e você publica? **Recomendo publicar direto e você ler em até 3 dias** pelo painel. A frase
   "revisão humana" da política editorial (H.1) só é verdadeira se essa leitura acontecer; se você não for ler, o
   texto muda para "revisados com checklist de qualidade e checagem de fatos", sem dizer "humana".
5. **Experiência real**: posso dizer no hub e no G1 que o próprio CriaSite foi construído com assistente de código,
   seguindo este método? **Recomendo sim**: é verdade, é o melhor sinal de experiência e diferencia de conteúdo genérico.
6. **Ferramentas**: começar pelo gerador de prompt (F5) e depois o de instruções (F6), deixando o checklist de revisão
   para depois? **Recomendo essa ordem.**
7. **Fontes de fornecedores** (OpenAI, Anthropic, Vercel): entram com peso baixo e filtro de fonte genérica, ou só
   fontes neutras (GitHub, Google, WordPress)? **Recomendo entrar com peso 4** (são a origem dos anúncios; o filtro e o
   guia editorial seguram o tom de propaganda). Tecnoblog (pt-BR): **recomendo testar** por 2 semanas com peso 3.
8. **"Leia também" por família** (A.2, item 6): aprovar a mudança para guias clássicos sugerirem clássicos e de IA
   sugerirem de IA? **Recomendo sim.**
9. **Até onde vai a "IA em geral" no robô**: você manteve a notícia de Harvard (impacto ambiental dos data centers). O
   plano aceita, de fontes genéricas, IA aplicada a sites + impacto ambiental e custo da IA, IA na busca e no tráfego,
   conteúdo feito com IA; e barra regulação, processos na justiça, compra e investimento de empresas, AGI e chips.
   **Recomendo esse corte**: processos de veículos contra empresas de IA e leis de IA são o tipo de notícia que puxa o
   site para "portal de IA genérico". Se quiser, regulação que mexe com sites (rótulo de conteúdo feito com IA) pode
   entrar depois como exceção específica.
