# Guias da trilha: 1ª leva (6 guias)

**Status: executado em 2026-11-15.** Palavras por guia: domínio 775 · hospedagem 727 · visual 756 · SEO 742 · velocidade 738 · checklist 724
(todos de 3 a 4 min de leitura, 4 a 6 links internos, 0 a 1 externo). Migration `db/migrations/003_guias_iniciais.sql`, link "Ler o guia"
na `/trilha` (`TrailStep.guide` em `app/lib/site.ts`). Validação: sem MySQL local; o script conferiu JSON, aspas, tamanhos e links
e refez o caminho inverso do SQL. O primeiro guia de verdade a rodar é o do deploy: conferir `/guias` e o log `[migrate]` se faltar.

Plano criado em 2026-11-15 pelo planejador. Executor: seguir na ordem dos **Passos**.

## Objetivo

Publicar os 6 primeiros guias da trilha "do domínio ao primeiro visitante" (texto original, útil e sem propaganda,
o que o AdSense valoriza) por uma migration SQL aplicada sozinha no deploy, e ligar cada etapa da `/trilha` ao seu guia.

## Contexto

- Hoje a seção `guias` está vazia no banco: o menu "Guias" nem aparece (`app/lib/availability.ts` esconde editoria sem
  conteúdo). A home mostra os 3 guias mais recentes (`app/routes/home.tsx`, `listPosts({ section: "guias", perPage: 3 })`).
- A página `/trilha` (`app/routes/trail.tsx`) lê `TRAIL` de `app/lib/site.ts`: 7 etapas com texto curto e ferramentas,
  sem link para guia. Cada `<li>` já tem `id={s.id}`, então `/trilha#hospedagem` funciona como âncora.
- Guias ficam em `/guias/<slug>` (rota `post-guias` em `app/routes.ts`); a página mostra o nível (`LEVEL_LABEL`) e usa
  JSON-LD `Article`.
- Modelo a copiar: `../vibecoin/db/migrations/004_guias_iniciais.sql` (INSERT IGNORE, `origin='manual'`). **Diferença:**
  o CriaSite **não tem** a coluna `coins` (ver `db/migrations/001_inicial.sql`); não a inclua.
- `db/migrate.mjs` aplica cada arquivo inteiro em um único `conn.query` com `multipleStatements: true` e grava a versão em
  `schema_migrations`. Ou seja: roda uma vez só, no próximo início do servidor depois do deploy. O dono não roda nada.
- Sem imagem de capa: `Cover` (`app/components/ui.tsx`) cai na arte padrão (`.art`) quando `image_url` é NULL. Ok para esta leva.
- A trilha tem 7 etapas e a lista do dono tem 6 guias: a etapa **"Páginas"** fica sem guia nesta leva (ver Perguntas em aberto).
  Os 6 temas do dono foram mantidos sem mudança: cobrem as etapas em que o visitante mais busca no Google.

## Arquivos afetados

| Arquivo | O quê |
|---|---|
| `db/migrations/003_guias_iniciais.sql` | **novo**: INSERT IGNORE dos 6 guias |
| `app/lib/site.ts` | `TrailStep` ganha `guide?: string`; preencher em 6 etapas |
| `app/routes/trail.tsx` | botão "Ler o guia" em cada etapa que tiver guia |
| `docs/guias.md` | este plano; ao fim, marcar o que foi feito |
| `docs/README.md` | status, Próximos passos, Pendências suas |
| `docs/decisoes.md` | já registrado pelo planejador (2026-11-15) |

Não mexer em `RichText.tsx`, no robô nem no painel.

---

## A. Estrutura-modelo de todo guia

Ordem dos blocos no `body` (o H1 é o `title`, a página já renderiza; **não** repetir o título no corpo):

1. **Lide** (1 ou 2 blocos `p`, 50 a 90 palavras no total): diz o problema e o que o leitor vai ter ao final. **Sem link**
   no lide (mesma regra do guia editorial do robô).
2. **2 a 4 seções `h2` informativas** (o "porquê" e o "o quê"). Intertítulo descreve o conteúdo, não é chamativo
   (ex.: "O que muda entre .com.br e .com", não "O segredo do domínio perfeito"). `h3` só dentro de seção longa.
3. **Passo a passo** quando couber: `h2` "Passo a passo" (ou "Como fazer, em N passos") + um bloco `ol` com itens que
   começam por verbo no imperativo ("Anote", "Confira"). A ferramenta do CriaSite entra **dentro do passo em que é usada**.
4. **`h2` "Erros comuns"** + `ul` com 4 a 6 itens; cada item = o erro + a consequência ou a correção, em uma ou duas frases.
5. **`h2` "Perguntas frequentes"** + 3 a 4 pares `h3` (a pergunta, terminando em "?") + `p` (resposta de 1 a 3 frases).
6. **Fecho** (`p`): frase ligando à próxima etapa com link para a trilha (`/trilha#<id-da-etapa>`) e para o próximo guia.
7. **"Leia também"** (último bloco, `p` que começa exatamente com `Leia também: `): 1 ou 2 links para outros guias,
   separados por ` · `. `RichText` transforma esse bloco no box "LEIA TAMBÉM".

**Links**: 3 a 6 internos por guia (ferramentas, trilha, outros guias), cada URL só uma vez, na 1ª menção natural.
Externos: no máximo 2, só para fontes oficiais (`https://registro.br`, `https://search.google.com/search-console`,
`https://pagespeed.web.dev`, `https://developers.google.com/search/docs`, `https://www.bing.com/webmasters`,
`https://www.w3.org/WAI/`), sempre `https://`. Nunca link para concorrente, loja ou hospedagem específica.

**Tamanho**: 700 a 1.100 palavras de texto (somar `text` e `items` de todos os blocos). `read_minutes = ceil(palavras / 200)`
(dá 4 a 6).

**Tom e regras de conteúdo**

- pt-BR claro, frases curtas, "você". Explica termo técnico na 1ª vez que aparece (ex.: "DNS, o catálogo que diz onde o site está").
- Sem promessa de resultado ("vai ficar em 1º no Google", "dobra as vendas"): proibido. Use "ajuda", "aumenta a chance".
- Sem propaganda e sem marca recomendada. Pode citar nomes de categoria e exemplos neutros (WordPress, Wix, construtores de site) sem juízo de "melhor".
- **Nada inventado.** Só números que dá para afirmar e que estão nos pontos-chave abaixo (limiares do Google/WCAG, tamanhos
  de favicon, conta de 99,9%). Preços: **só faixas genéricas** ("algumas dezenas de reais por mês" para hospedagem
  compartilhada de entrada; "algumas dezenas de reais por ano" para domínio .com.br) e **sempre** com a frase de que os preços
  mudam e devem ser conferidos no site do fornecedor. Nada de "R$ 40" ou "a partir de".
- Regras que mudam (Registro.br, Google) ganham "confira a regra atual em [fonte oficial]".
- Texto atemporal: sem "este ano", "recentemente", datas ou versões de programa.
- Não citar o CriaSite em 3ª pessoa como propaganda ("o melhor site de ferramentas"); pode dizer "a ferramenta [X](/ferramentas/x) faz isso no navegador, sem enviar o arquivo".

---

## B. Os 6 guias

Campos comuns a todos: `section='guias'`, `status='published'`, `origin='manual'`, `author='Equipe CriaSite'`,
`tag=NULL` (o card mostra "Guia"), `featured=0` (o destaque da home é das notícias; `getFeatured` não filtra seção e um
guia com destaque roubaria o topo), `image_url=NULL`, `updated_at=NULL` (senão a página exibe "Atualizado em" com a data
do deploy nos 6 ao mesmo tempo e o sitemap mostra todos com o mesmo lastmod).

Os `meta_description` abaixo já foram contados (120 a 160); confira de novo no passo 4 depois de qualquer ajuste.

### Guia 1 · Domínio

| Campo | Valor |
|---|---|
| title | Como escolher o domínio do seu site sem se arrepender |
| slug | `como-escolher-o-dominio-do-site` |
| excerpt | Nome curto, extensão certa e registro no seu nome: o que considerar antes de registrar o endereço do site e os erros que custam caro depois. |
| meta_description | Veja como escolher o nome e a extensão do domínio, onde registrar, por que deixar no seu CPF ou CNPJ e os erros que custam caro depois. |
| focus_keyword | como escolher domínio |
| tags | `["Domínio","Iniciante","Registro.br"]` |
| level | 1 |
| Etapa da trilha | `dominio` (etapa 1) |
| Ferramentas | nenhuma da etapa; citar [Link do WhatsApp](/ferramentas/link-whatsapp) só se couber naturalmente (não forçar) |
| Links internos | `/trilha#dominio`, `/guias/como-escolher-a-hospedagem-do-site` (fecho), `/guias/checklist-de-lancamento-do-site` (leia também) |
| Externo | `https://registro.br` |

Esqueleto e pontos-chave:
- **Lide**: o domínio é o endereço do site e vai para cartão, e-mail e QR code; trocar depois custa caro (links, Google, material impresso).
- **h2 O que é domínio (e o que não é)**: domínio ≠ hospedagem ≠ site. Domínio é o nome alugado por período (renovação
  anual ou por vários anos); a hospedagem é onde os arquivos ficam; o DNS liga um ao outro. Dá para ter domínio sem site
  (só e-mail, por exemplo).
- **h2 Como escolher o nome**: curto; fácil de falar ao telefone e de escrever depois de ouvir; evitar hífen, número e
  grafias ambíguas (ç, ss/ç, x/ch); teste do "ditado" (diga a alguém e peça para digitar); preferir o nome da marca ao
  nome de serviço genérico cheio de palavras-chave; conferir se o nome está livre nas redes sociais.
- **h2 Qual extensão usar**: `.com.br` para público no Brasil (reconhecimento e confiança local); `.br` é administrado
  pelo Registro.br (NIC.br) e exige CPF ou CNPJ; existem categorias como `.adv.br`, `.med.br`, `.eng.br` com exigências
  próprias (citar como exemplo e mandar conferir no Registro.br); `.com` para público internacional; extensões novas
  (`.app`, `.site`, `.online`) funcionam, mas algumas pessoas ainda digitam `.com.br` por hábito; `.app` exige HTTPS
  (o navegador só abre com certificado). Sugestão: registrar também as variações principais se o nome for a marca.
- **h2 Passo a passo para registrar** (`ol`): 1) liste 5 a 10 opções; 2) faça o teste do ditado; 3) pesquise a
  disponibilidade no [Registro.br](https://registro.br) (para .br) ou no registrador; 4) pesquise a marca no INPI e no
  Google para não esbarrar em marca registrada; 5) registre **no seu CPF ou CNPJ**, com o seu e-mail; 6) ative a
  renovação automática ou anote a data de vencimento; 7) guarde a senha e ative a verificação em duas etapas da conta do registrador.
- **h2 Quanto custa**: domínio .com.br custa algumas dezenas de reais por ano; extensões internacionais variam muito e
  o 1º ano costuma ter desconto que não se repete na renovação; preços mudam, confira no registrador. Alguns planos de
  hospedagem incluem o domínio no 1º ano: confira o preço de renovação.
- **h2 Erros comuns** (`ul`): registrar no CPF/CNPJ do desenvolvedor ou da agência (quem é titular é dono; recuperar dá
  trabalho); deixar vencer (o site e o e-mail param e, depois do prazo de congelamento, outra pessoa pode registrar);
  e-mail de contato que ninguém lê (avisos de vencimento se perdem); nome difícil de soletrar; comprar domínio "premium"
  de revenda sem necessidade.
- **h2 Perguntas frequentes**: Posso trocar de domínio depois? (pode, com redirecionamento 301 de todas as páginas, mas
  perde parte do caminho andado; link para [status HTTP](/ferramentas/status-http)) · Preciso ter empresa para registrar
  .com.br? (não, CPF serve para .com.br; categorias profissionais têm regra própria) · Domínio com acento funciona?
  (o Registro.br aceita, mas registre também a versão sem acento, porque muita gente digita sem) · O domínio inclui e-mail?
  (não, o e-mail vem da hospedagem ou de um serviço de e-mail; o domínio só aponta).
- **Fecho**: com o domínio na mão, a próxima etapa é a hospedagem → `/guias/como-escolher-a-hospedagem-do-site` e `/trilha#dominio`.

### Guia 2 · Hospedagem

| Campo | Valor |
|---|---|
| title | Como escolher a hospedagem do site: tipos, custos e cuidados |
| slug | `como-escolher-a-hospedagem-do-site` |
| excerpt | Compartilhada, VPS, nuvem ou construtor de sites: o que cada tipo resolve, o que conferir no plano e como não ser pego de surpresa na renovação. |
| meta_description | Compartilhada, VPS, nuvem ou construtor: entenda os tipos de hospedagem, o que conferir no plano e como evitar surpresas na renovação. |
| focus_keyword | como escolher hospedagem de site |
| tags | `["Hospedagem","Iniciante","SSL"]` |
| level | 1 |
| Etapa da trilha | `hospedagem` (etapa 2) |
| Ferramentas | [Status HTTP](/ferramentas/status-http) (seção sobre site fora do ar/erros 5xx) |
| Links internos | `/trilha#hospedagem`, `/guias/como-escolher-o-dominio-do-site`, `/guias/cores-fonte-e-favicon-do-site` (fecho), `/guias/site-lento-causas-e-como-otimizar-imagens` (leia também) |
| Externo | nenhum |

Esqueleto e pontos-chave:
- **Lide**: hospedagem é o computador ligado 24 horas onde o site fica; a escolha certa depende do tipo de site, não do plano mais caro.
- **h2 Os tipos de hospedagem**: `h3` Compartilhada (vários sites no mesmo servidor; resolve site institucional, blog e
  portfólio; painel pronto, instalação de WordPress em poucos cliques) · `h3` VPS e nuvem (recursos reservados, mais
  controle, exige conhecimento técnico ou suporte gerenciado; para lojas com muito acesso e sistemas próprios) · `h3`
  Construtor de sites (Wix e similares: hospedagem e editor no mesmo pacote; mais simples, menos liberdade e mais difícil
  de levar para outro lugar) · `h3` WordPress gerenciado (a empresa cuida das atualizações e do cache).
- **h2 O que conferir no plano** (`ul`): certificado SSL grátis incluído (o cadeado/HTTPS; o Let's Encrypt é gratuito e
  muitas empresas instalam automaticamente); e-mail com o seu domínio e quantas caixas; backup automático e como restaurar
  (quem faz, com que frequência, se cobra); onde ficam os servidores (perto do público = resposta mais rápida); suporte em
  português e por qual canal; limites de armazenamento, sites e tráfego; facilidade de sair (exportar arquivos e banco).
- **h2 Disponibilidade (uptime)**: a garantia costuma vir em porcentagem; 99,9% ao mês ainda permite cerca de 43 minutos fora
  do ar (0,1% de 30 dias); veja o que a empresa oferece se descumprir. Para conferir o que o navegador recebe quando o
  site falha, ver [códigos de status HTTP](/ferramentas/status-http) (500, 503).
- **h2 Quanto custa**: compartilhada de entrada costuma ficar em algumas dezenas de reais por mês; VPS e nuvem custam mais
  e variam com os recursos. É comum o 1º período ter desconto grande e a renovação vir pelo preço cheio, e o desconto
  maior exigir pagar vários meses adiantados. Preços mudam com frequência: compare o **preço de renovação**, não só o da vitrine.
- **`<!-- PONTO RESERVADO: AFILIADO -->`** fica aqui, entre "Quanto custa" e "Passo a passo" (ver seção F). **Na migration
  003 não entra nada** neste ponto: nem link, nem texto de espera.
- **h2 Passo a passo para contratar** (`ol`): 1) defina o tipo de site e o volume esperado; 2) escolha o tipo de
  hospedagem; 3) compare 2 ou 3 empresas pelos itens da lista; 4) calcule o custo total de 2 anos, com renovação;
  5) contrate no seu nome e com o seu e-mail; 6) aponte o domínio (DNS) para a hospedagem pelas instruções do painel
  (a propagação pode levar algumas horas); 7) ative o SSL e teste se o site abre com https.
- **h2 Erros comuns**: escolher só pelo preço do 1º mês; contratar VPS sem saber administrar servidor; deixar a conta no
  nome de quem faz o site; não testar o backup; usar o e-mail grátis genérico em vez do e-mail do domínio no cartão.
- **h2 Perguntas frequentes**: Posso trocar de hospedagem depois? (sim; o domínio é separado; muitas empresas migram o
  site) · Hospedagem grátis vale a pena? (para teste; costuma ter anúncio, limites e endereço sem domínio próprio) ·
  Domínio e hospedagem precisam ser da mesma empresa? (não; fica mais simples de gerenciar, mas não é obrigatório) ·
  Preciso de VPS para começar? (para site institucional ou blog, em geral não).
- **Fecho**: com o site hospedado, defina a cara dele → guia 3 e `/trilha#hospedagem`.

### Guia 3 · Visual

| Campo | Valor |
|---|---|
| title | Cores, fonte e favicon: a identidade visual do seu site |
| slug | `cores-fonte-e-favicon-do-site` |
| excerpt | Duas cores, uma ou duas fontes e um favicon nos tamanhos certos já dão cara de marca ao site. Veja como escolher sem errar no contraste. |
| meta_description | Como escolher as cores e a fonte do site com bom contraste e criar o favicon nos tamanhos certos, com ferramentas grátis no navegador. |
| focus_keyword | cores e fonte para site |
| tags | `["Visual","Iniciante","Acessibilidade"]` |
| level | 1 |
| Etapa da trilha | `visual` (etapa 3) |
| Ferramentas | [Contraste de cores](/ferramentas/contraste-cores), [Gerador de favicon](/ferramentas/gerador-favicon) |
| Links internos | as 2 ferramentas, `/trilha#visual`, `/guias/seo-basico-para-aparecer-no-google` (fecho), `/guias/site-lento-causas-e-como-otimizar-imagens` (leia também: fontes pesam) |
| Externo | opcional `https://www.w3.org/WAI/` |

Esqueleto e pontos-chave:
- **Lide**: o visitante julga o site em segundos pela aparência; poucas escolhas consistentes valem mais que muitos efeitos.
- **h2 Escolha poucas cores**: uma cor principal (marca, botões), uma de apoio, neutros para texto e fundo; a proporção
  60-30-10 é uma regra prática (não uma lei) para dividir fundo, apoio e destaque; partir da cor do logo, se já existir;
  usar a cor de destaque só no que é clicável ajuda o visitante a entender o que é botão.
- **h2 Contraste: o texto precisa ser lido**: a WCAG (diretrizes de acessibilidade do W3C) pede, no nível AA, contraste
  de pelo menos 4,5:1 para texto normal e 3:1 para texto grande; o nível AAA pede 7:1 e 4,5:1. Texto cinza-claro em fundo
  branco é o erro mais comum. Conferir na [ferramenta de contraste](/ferramentas/contraste-cores).
- **h2 Fontes**: no máximo duas famílias (uma para títulos, outra para texto, ou a mesma nas duas); corpo de texto com
  pelo menos 16 px no celular; fontes do sistema não precisam ser baixadas; fontes da web (ex.: Google Fonts) carregue só
  os pesos usados, porque cada peso é um arquivo a mais; evitar fonte manuscrita em texto corrido.
- **h2 Favicon**: o ícone da aba, dos favoritos e do atalho no celular; tamanhos usuais: `favicon.ico` com 16, 32 e 48 px,
  PNG 180×180 para o ícone da Apple (apple-touch-icon) e 192×192 e 512×512 para o manifesto (Android); partir de imagem
  quadrada, simples, que funcione pequena (só o símbolo ou a inicial, não o logo inteiro com texto). Gerar no
  [gerador de favicon](/ferramentas/gerador-favicon), que já entrega o código HTML.
- **h2 Passo a passo** (`ol`): 1) defina cor principal e de apoio; 2) teste texto/fundo e botão/texto do botão no
  verificador de contraste; 3) escolha a(s) fonte(s) e os tamanhos de título e texto; 4) anote tudo num mini guia de
  estilo (hexadecimais, fontes, tamanhos); 5) gere o favicon; 6) confira no celular, com o brilho baixo.
- **h2 Erros comuns**: muitas cores sem função; texto sobre foto sem camada escura; fonte fina e clara demais; favicon
  com o logo inteiro (vira borrão a 16 px); cores diferentes em cada página.
- **h2 Perguntas frequentes**: Preciso de logo para começar? (não; o nome em uma boa fonte resolve no início) · Modo
  escuro é obrigatório? (não; se fizer, confira o contraste também nele) · Por que o favicon não aparece? (cache do
  navegador; abra em aba anônima e confira o caminho no código).
- **Fecho**: visual pronto; próximo, preparar para o Google → guia 4 e `/trilha#visual`.

### Guia 4 · SEO básico

| Campo | Valor |
|---|---|
| title | SEO básico: como fazer o seu site aparecer no Google |
| slug | `seo-basico-para-aparecer-no-google` |
| excerpt | Título e descrição de cada página, sitemap e Search Console: o básico de SEO que todo site pequeno precisa, sem truque e sem promessa de 1º lugar. |
| meta_description | O básico de SEO para sites pequenos: título e descrição de cada página, sitemap, Search Console e o que fazer para o Google encontrar você. |
| focus_keyword | seo básico |
| tags | `["SEO","Google","Search Console"]` |
| level | 1 |
| Etapa da trilha | `google` (etapa 5) |
| Ferramentas | [Meta tags](/ferramentas/meta-tags), [Contador de caracteres](/ferramentas/contador-de-caracteres), [Sitemap e robots.txt](/ferramentas/sitemap-robots) |
| Links internos | as 3 ferramentas, `/trilha#google`, `/guias/site-lento-causas-e-como-otimizar-imagens` (fecho), `/guias/checklist-de-lancamento-do-site` (leia também) |
| Externo | `https://search.google.com/search-console` (ou `https://developers.google.com/search/docs`) |

Esqueleto e pontos-chave:
- **Lide**: SEO é deixar claro para o Google do que cada página trata e facilitar que ele a encontre; ninguém garante
  posição, e quem garante está vendendo promessa. Isso deve aparecer com essas palavras ou parecidas.
- **h2 Como o Google encontra o seu site**: rastrear (o robô segue links e lê o sitemap), indexar (guarda a página),
  classificar (decide a ordem para cada busca); site novo pode levar de dias a semanas para aparecer, sem prazo fixo.
- **h2 Título e descrição de cada página**: o `title` é o texto azul do resultado; a meta description é o resumo embaixo;
  o Google corta pelo espaço na tela, então títulos de até uns 60 caracteres e descrições de até uns 155 costumam aparecer
  inteiros; o Google pode reescrever os dois; cada página com os seus, sem repetir; os mesmos dados (Open Graph) decidem a
  prévia no WhatsApp. Ferramentas: [meta tags](/ferramentas/meta-tags) (prévia e código) e
  [contador](/ferramentas/contador-de-caracteres).
- **h2 Conteúdo que responde à busca**: uma página por assunto/serviço; usar as palavras que o cliente usa (ex.: "conserto
  de geladeira em Campinas", não só "soluções em refrigeração"); um H1 por página; intertítulos; texto próprio, não copiado.
- **h2 Sitemap e robots.txt**: o sitemap lista as páginas para o Google; o robots.txt diz o que não rastrear e aponta o
  sitemap; robots.txt mal configurado pode bloquear o site inteiro. Gerar no [gerador](/ferramentas/sitemap-robots).
- **h2 Passo a passo** (`ol`): 1) escreva título e descrição de cada página; 2) confira o tamanho; 3) gere e publique
  sitemap.xml e robots.txt na raiz; 4) crie a conta no [Google Search Console](https://search.google.com/search-console)
  e verifique o domínio; 5) envie o sitemap; 6) use a inspeção de URL para pedir a indexação da página inicial; 7) se for
  negócio local, crie o Perfil da Empresa no Google com o mesmo nome, endereço e telefone do site.
- **h2 Erros comuns**: mesmo título em todas as páginas ("Início", "Home"); WordPress com a opção de pedir para os buscadores
  não indexarem ainda marcada; encher o texto de palavra-chave repetida; comprar link ou "pacote de SEO" com garantia de 1º
  lugar; página só com imagem e sem texto.
- **h2 Perguntas frequentes**: Quanto tempo leva para aparecer? (não há prazo; acompanhe no Search Console) · Preciso
  pagar para aparecer no Google? (não; resultado orgânico é gratuito, anúncio é outra coisa) · Meta keywords ajuda? (o
  Google não usa a meta keywords) · E o Bing? (tem o Bing Webmaster Tools, com o mesmo envio de sitemap).
- **Fecho**: além de ser encontrado, o site precisa abrir rápido → guia 5 e `/trilha#google`.

### Guia 5 · Velocidade

| Campo | Valor |
|---|---|
| title | Site lento? As causas mais comuns e como resolver as imagens |
| slug | `site-lento-causas-e-como-otimizar-imagens` |
| excerpt | Imagens grandes demais estão entre as causas mais comuns de site lento no celular. Veja como medir, o que mais pesa e como corrigir sem perder qualidade. |
| meta_description | Descubra por que o seu site está lento, como medir no PageSpeed Insights e como comprimir e redimensionar imagens para carregar rápido no celular. |
| focus_keyword | site lento |
| tags | `["Velocidade","Imagens","Core Web Vitals"]` |
| level | 2 |
| Etapa da trilha | `velocidade` (etapa 6) |
| Ferramentas | [Comprimir imagem](/ferramentas/comprimir-imagem), [Converter imagem](/ferramentas/converter-imagem), [Tamanhos de imagem](/ferramentas/tamanhos-de-imagem) |
| Links internos | as 3 ferramentas, `/trilha#velocidade`, `/guias/checklist-de-lancamento-do-site` (fecho), `/guias/como-escolher-a-hospedagem-do-site` (leia também) |
| Externo | `https://pagespeed.web.dev` |

Esqueleto e pontos-chave:
- **Lide**: site lento perde visitante antes de mostrar qualquer coisa, principalmente no celular com 4G fraco; a boa
  notícia é que a causa mais comum (imagem) é a mais fácil de resolver. Sem estatística de "X% abandonam".
- **h2 Como medir antes de mexer**: [PageSpeed Insights](https://pagespeed.web.dev) com o endereço da página; olhar a aba
  celular; os dados de usuários reais (quando existem) valem mais que o teste de laboratório. Core Web Vitals e os limites
  de "bom" do Google: LCP (maior elemento visível carregado) até 2,5 s; INP (resposta a cliques e toques) até 200 ms; CLS
  (quanto a página "pula" enquanto carrega) até 0,1. Medir de novo depois de cada mudança.
- **h2 As causas mais comuns** (`ul`): imagens pesadas ou maiores que o espaço onde aparecem; muitos plugins/scripts (chat,
  pop-up, rastreadores, sliders); fontes da web com muitos pesos; vídeo hospedado no próprio site em vez de incorporado;
  hospedagem sobrecarregada ou longe do público; falta de cache.
- **h2 Imagens: tamanho, formato e peso**: `h3` Largura certa (não subir foto de câmera com 4000 px para um espaço de
  800 px; para telas de alta densidade, até cerca de 2× a largura exibida; medidas na
  [tabela de tamanhos](/ferramentas/tamanhos-de-imagem)) · `h3` Formato (WebP costuma gerar arquivos menores que JPG e
  PNG com qualidade parecida e é aceito pelos navegadores atuais; PNG para ícone e imagem com transparência ou texto;
  JPG continua bom para foto; [converter](/ferramentas/converter-imagem)) · `h3` Compressão (qualidade em torno de 75 a 85
  costuma ser imperceptível em foto; [comprimir](/ferramentas/comprimir-imagem), sem enviar o arquivo para servidor).
- **h2 Detalhes no código (para quem edita o HTML ou o tema)**: `width` e `height` na tag `img` evitam que a página pule
  (CLS); `loading="lazy"` nas imagens abaixo da primeira tela, **nunca** na imagem principal do topo; `srcset` para servir
  tamanhos diferentes por tela. No WordPress, muitos temas e plugins de otimização já fazem parte disso.
  **Atenção de SQL**: escrever esses atributos **sem aspas** no texto (ex.: "o atributo loading com o valor lazy" ou
  `loading=lazy`), ver seção D.
- **h2 Passo a passo** (`ol`): 1) meça a página inicial no celular; 2) liste as 5 imagens mais pesadas; 3) redimensione
  para a largura de uso; 4) converta para WebP quando fizer sentido; 5) comprima; 6) substitua no site mantendo o nome
  (ou atualize o link); 7) meça de novo; 8) só então olhe plugins, fontes e hospedagem.
- **h2 Erros comuns**: comprimir mas manter a largura gigante; lazy load na imagem do topo (piora o LCP); slider com 5 fotos
  enormes na home; trocar de hospedagem antes de resolver as imagens; avaliar só pelo computador de casa com internet rápida.
- **h2 Perguntas frequentes**: Nota 100 no PageSpeed é obrigatória? (não; os limites dos Core Web Vitals importam mais
  que a nota) · Comprimir estraga a foto? (com qualidade moderada, a diferença costuma não ser visível; compare antes) ·
  AVIF é melhor que WebP? (costuma gerar arquivos ainda menores, mas nem toda ferramenta e plataforma aceita; WebP é a
  escolha mais segura hoje). Cuidado: "hoje" é a única exceção aceitável à regra de texto atemporal; se preferir, troque
  por "a escolha mais compatível".
- **Fecho**: rápido e bonito; falta publicar com segurança → guia 6 e `/trilha#velocidade`.

### Guia 6 · Lançamento

| Campo | Valor |
|---|---|
| title | Checklist para lançar o site: o que conferir antes e depois |
| slug | `checklist-de-lancamento-do-site` |
| excerpt | HTTPS, redirecionamentos, formulários, meta tags, sitemap e Search Console: a lista do que conferir antes de divulgar o site e na primeira semana no ar. |
| meta_description | Checklist para publicar o site sem sustos: HTTPS, redirecionamentos, formulários, meta tags, sitemap, Search Console e o que fazer na 1ª semana. |
| focus_keyword | checklist lançamento de site |
| tags | `["Lançamento","Checklist","Search Console"]` |
| level | 2 |
| Etapa da trilha | `lancamento` (etapa 7) |
| Ferramentas | [Status HTTP](/ferramentas/status-http), [QR code](/ferramentas/qr-code), [Link do WhatsApp](/ferramentas/link-whatsapp), [Meta tags](/ferramentas/meta-tags) |
| Links internos | as 4 ferramentas, `/trilha` (fecho: "marque as etapas"), `/guias/seo-basico-para-aparecer-no-google` e `/guias/como-escolher-o-dominio-do-site` (leia também) |
| Externo | `https://search.google.com/search-console` ou `https://www.bing.com/webmasters` (no máximo 2) |

Esqueleto e pontos-chave (aqui o formato checklist domina: vários `h2` curtos, cada um com um `ul`; o `ol` fica para a
"primeira semana"):
- **Lide**: lançar é mais que "subir os arquivos"; uma revisão de meia hora evita formulário quebrado, cadeado faltando e
  página fora do Google. Não usar número fixo de itens no título nem no texto (se contar, o número tem de bater).
- **h2 Endereço e segurança**: tudo abre com https e o cadeado; http redireciona para https com 301; versão com e sem www
  levam ao mesmo endereço (escolha uma); conferir o código de cada redirecionamento ([status HTTP](/ferramentas/status-http):
  301 permanente, 302 temporário); página 404 personalizada com link para a home.
- **h2 Conteúdo e contato**: cada página com título e descrição próprios ([meta tags](/ferramentas/meta-tags)); prévia ao
  colar o link no WhatsApp; formulário testado de ponta a ponta (a mensagem chega e não cai no spam); botão do WhatsApp com
  a mensagem pronta ([link do WhatsApp](/ferramentas/link-whatsapp)); telefone e e-mail clicáveis; textos revisados;
  links quebrados; favicon aparecendo.
- **h2 Celular**: abrir em pelo menos um Android e um iPhone (ou no modo de dispositivo do navegador); menu, botões grandes
  o bastante para o dedo, nada vazando para o lado.
- **h2 Google e privacidade**: robots.txt sem bloquear o site; sitemap publicado; Search Console com o sitemap enviado;
  Bing Webmaster (opcional); se usar ferramentas de estatística ou anúncio que coletam dados, política de privacidade e
  aviso de cookies (LGPD) publicados. Sem orientação jurídica detalhada: "para casos específicos, consulte um profissional".
- **h2 Garantias para o dia seguinte**: backup recente e testado; renovação automática do domínio e da hospedagem; senhas
  em gerenciador e verificação em duas etapas no painel; e-mail com o domínio funcionando.
- **h2 Primeira semana no ar** (`ol`): 1) divulgue para clientes atuais; 2) troque o link na bio das redes e na assinatura
  de e-mail; 3) imprima um [QR code](/ferramentas/qr-code) para balcão, cardápio ou cartão (teste antes de imprimir em
  quantidade); 4) atualize o Perfil da Empresa no Google com o site; 5) acompanhe o Search Console (cobertura e erros);
  6) peça a 2 ou 3 pessoas de fora para usar o site e conte onde elas travam.
- **h2 Erros comuns**: divulgar antes de testar o formulário; esquecer o bloqueio de buscadores ligado do período de
  construção; deixar página de teste ou "lorem ipsum" publicada; QR code apontando para endereço provisório; não ter
  ninguém olhando o e-mail de contato.
- **h2 Perguntas frequentes**: Preciso lançar com tudo pronto? (não; melhor no ar com poucas páginas boas do que esperando
  a perfeição) · Por que o site não aparece no Google no dia seguinte? (rastreamento leva tempo; ver guia de SEO) ·
  QR code expira? (o QR code estático não expira; o que pode parar é o endereço para onde ele aponta).
- **Fecho**: volte à [trilha](/trilha) e marque as etapas concluídas.

---

## C. Guia na trilha (mudança mínima de código)

Proposta: **sim**, cada etapa com guia ganha um botão "Ler o guia" na `/trilha`. É o link interno mais forte que esses
guias podem ter (a trilha está no menu e na home) e transforma a trilha em sumário.

1. Em `app/lib/site.ts`, na interface `TrailStep`, acrescentar:
   ```ts
   /** Slug do guia desta etapa (seção guias). Sem guia: omitir. */
   guide?: string;
   ```
   e preencher: `dominio` → `"como-escolher-o-dominio-do-site"`, `hospedagem` → `"como-escolher-a-hospedagem-do-site"`,
   `visual` → `"cores-fonte-e-favicon-do-site"`, `google` → `"seo-basico-para-aparecer-no-google"`,
   `velocidade` → `"site-lento-causas-e-como-otimizar-imagens"`, `lancamento` → `"checklist-de-lancamento-do-site"`.
   `paginas` fica sem `guide`.
2. Em `app/routes/trail.tsx`, dentro do `<div className="flex flex-wrap items-center gap-2">`, **antes** das ferramentas:
   ```tsx
   {s.guide && available.sections.includes("guias") && (
     <Link to={`/guias/${s.guide}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-card px-4 text-sm font-bold text-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2">
       Ler o guia <span aria-hidden>→</span>
     </Link>
   )}
   ```
   Visual: contorno marinho (os botões de ferramenta são marinho cheio; o de "marcar como feita" é cinza claro), então o
   guia fica distinto das ferramentas sem cor nova. Sem ícone extra além da seta. A condição `available.sections` evita
   link para guia se a seção estiver vazia (ex.: banco sem a migration).
3. Não mexer na faixa da trilha da home nem no aside de progresso.

---

## D. Formato do `body` e cuidados de SQL

**Blocos aceitos** (`app/lib/types.ts` / `RichText.tsx`): `{"type":"p","text":"..."}`, `{"type":"h2","text":"..."}`,
`{"type":"h3","text":"..."}`, `{"type":"quote","text":"..."}`, `{"type":"ul","items":["...","..."]}`,
`{"type":"ol","items":[...]}`. Não usar `img` nem `video` nesta leva. Links só dentro de `p`, `quote` e itens de lista,
no formato `[texto](url)`; `h2`/`h3` **não** renderizam links. URL interna começa com `/`; externa com `https://`
(qualquer outra coisa vira texto puro). O texto do link não pode ter `]` nem quebra de linha; a URL não pode ter espaço
nem `)`. Âncora da trilha: `/trilha#dominio` etc. (ids: `dominio`, `hospedagem`, `visual`, `paginas`, `google`,
`velocidade`, `lancamento`).

**Como gerar o SQL sem erro (recomendado)**: escrever os 6 guias como objetos JS num script Node **temporário, fora do
repositório** (pasta temporária do sistema), que monta o arquivo `db/migrations/003_guias_iniciais.sql`. O script deve:
1. Para cada guia, `JSON.stringify(body)` e `JSON.stringify(tags)`.
2. **Abortar** se algum texto tiver aspas duplas ASCII `"` ou barra invertida `\`. Motivo: `JSON.stringify` escreve `\"`, e
   o MySQL, dentro de string SQL, transforma `\"` em `"` e quebra o JSON. Use aspas curvas “assim” no texto (e prefira
   frases sem aspas para atributos de HTML).
3. Trocar `'` por `''` em **todos** os valores de texto (title, excerpt, body, meta etc.).
4. Validar: `title` 30 a 70 caracteres; `meta_description` 120 a 160; `excerpt` até 600 (alvo 120 a 200); `slug` só
   `[a-z0-9-]`; palavras 700 a 1.100; 1º bloco é `p` sem `[`; último bloco começa com `Leia também: `; todo link interno
   está na lista branca (os 11 `/ferramentas/<slug>` de `TOOLS` em `app/lib/site.ts`: comprimir-imagem, converter-imagem,
   qr-code, link-whatsapp, meta-tags, contador-de-caracteres, contraste-cores, gerador-favicon, sitemap-robots,
   status-http, tamanhos-de-imagem; mais `/trilha`, `/trilha#<id>` e os 6 `/guias/<slug>`);
   nenhuma URL repetida no mesmo guia.
5. Imprimir uma tabela (slug, palavras, read_minutes, tamanho do title e da meta) para colar na resposta ao dono.
Depois de gerar, apagar o script (não vai para o commit).

**Cabeçalho e forma do arquivo** (seguir o Vibecoin, sem `coins`):
```sql
-- CriaSite · migration 003 · seis guias iniciais da trilha ("do domínio ao primeiro visitante")
-- Escritos à mão (origem 'manual'): o robô não escreve guias. Revise e edite em /admin → Matérias.
-- INSERT IGNORE: se já existir um guia com o mesmo endereço (seção + slug), nada é sobrescrito.

SET NAMES utf8mb4;

INSERT IGNORE INTO posts
  (section, slug, status, origin, title, excerpt, tag, level, author, read_minutes, body, meta_description, focus_keyword, tags, featured, published_at, updated_at)
VALUES
('guias', 'como-escolher-o-dominio-do-site', 'published', 'manual', '…', '…', NULL, 1, 'Equipe CriaSite', 5, '[…]', '…', 'como escolher domínio', '["Domínio","Iniciante","Registro.br"]', 0, UTC_TIMESTAMP() - INTERVAL 6 DAY - INTERVAL 270 MINUTE, NULL),
…;
```
- Arquivo salvo em **UTF-8 sem BOM**, quebra de linha LF; uma linha por guia; termina com `;` e nova linha.
- **`published_at` escalonado** (horários "humanos", não redondos, nenhum no futuro). Ordem = ordem da trilha, para a home
  mostrar os 3 últimos (checklist, velocidade, SEO):

| Guia | published_at |
|---|---|
| 1 domínio | `UTC_TIMESTAMP() - INTERVAL 6 DAY - INTERVAL 270 MINUTE` |
| 2 hospedagem | `UTC_TIMESTAMP() - INTERVAL 5 DAY - INTERVAL 95 MINUTE` |
| 3 visual | `UTC_TIMESTAMP() - INTERVAL 4 DAY - INTERVAL 400 MINUTE` |
| 4 SEO | `UTC_TIMESTAMP() - INTERVAL 3 DAY - INTERVAL 150 MINUTE` |
| 5 velocidade | `UTC_TIMESTAMP() - INTERVAL 2 DAY - INTERVAL 320 MINUTE` |
| 6 checklist | `UTC_TIMESTAMP() - INTERVAL 1 DAY - INTERVAL 45 MINUTE` |

  Datas são relativas ao momento em que a migration roda no servidor (deploy), então ficam sempre no passado recente.
- O arquivo é uma única chamada `multipleStatements`; se um INSERT falhar, a migration não é marcada e o servidor tenta de
  novo no próximo início. Por isso a validação local (passo 4) é obrigatória.

---

## E. Revisão de qualidade e conferência no /admin

**Checklist por guia (executor, antes do commit)**
- [ ] Lide sem link, 50 a 90 palavras, diz o que o leitor ganha.
- [ ] Estrutura A completa (h2 informativos, passo a passo quando há, Erros comuns, Perguntas frequentes, fecho, Leia também).
- [ ] 700 a 1.100 palavras; `read_minutes` = ceil(palavras/200).
- [ ] Nenhum preço em reais, nenhuma porcentagem ou prazo além dos listados na seção B; faixas com "os preços mudam".
- [ ] Nenhuma promessa ("garante", "vai aparecer em 1º", "dobrar") e nenhuma marca recomendada.
- [ ] Links: todos da lista branca, ≤ 2 externos, sem repetição, a ferramenta citada no passo em que é usada.
- [ ] Ortografia (acentos, crase, "a gente" evitado, sem "você pode estar fazendo").
- [ ] Texto realmente original: nada copiado das páginas das ferramentas (`app/routes/tool-*.tsx`) nem do Vibecoin.

**Como o dono confere depois do deploy (2 a 3 minutos)**
1. `/admin/materias`: aparecem 6 itens "manual" na seção Guias, publicados, com datas de 1 a 6 dias atrás.
2. Abrir cada um em `/admin/materias/<id>`: nível certo, sem "★ destaque", "atualizada" vazio.
3. No site: menu "Guias" apareceu; `/guias` lista os 6; a home mostra 3 guias; cada guia abre em `/guias/<slug>` com o
   box "LEIA TAMBÉM" no fim.
4. `/trilha`: 6 etapas com "Ler o guia" (a etapa 4, Páginas, sem).
5. Clicar em 2 links internos de cada guia (ferramenta e trilha) para confirmar que abrem.
6. Correções de texto: editar direto no painel (isso preenche `updated_at`, o que é esperado). Não reescrever a migration
   depois que ela rodou: o servidor não aplica de novo.

---

## F. Afiliado da Hostinger (reservado, não implementar agora)

- Decisão vigente (`decisoes.md`, 2026-11-14): usar o afiliado da Hostinger **com aviso de link de afiliado**, depois que
  houver conteúdo. Ainda não há link.
- **Nesta leva: nada de afiliado.** O guia 2 é neutro, sem citar a Hostinger.
- **Ponto reservado**: no guia 2, um parágrafo entre "Quanto custa" e "Passo a passo para contratar". Quando o dono tiver o
  link, a inclusão será feita pelo painel (editar o guia) ou por uma migration nova de `UPDATE`, nunca reescrevendo a 003.
- **Regra do aviso** (para o futuro): o parágrafo diz com clareza que o CriaSite usa a Hostinger, que o link é de
  afiliado e que o site pode receber comissão sem custo extra para o leitor; o aviso fica **na mesma frase ou logo ao
  lado do link**, não só no rodapé. O resto do guia continua neutro (critérios valem para qualquer empresa).
- **Dependência de código futura**: hoje `RichText` põe só `rel="noopener"` em link externo. Link de afiliado precisa de
  `rel="sponsored noopener"` (regra do Google para links pagos). Isso será uma tarefa própria junto com o link
  (ex.: detectar o domínio de afiliado no `RichText`), mais uma linha na `/politica-editorial` sobre afiliados.

---

## Passos

1. Ler este plano inteiro, `app/lib/types.ts` (tipo `Block`) e `../vibecoin/db/migrations/004_guias_iniciais.sql`.
2. Escrever o texto dos 6 guias seguindo a seção A e os esqueletos da seção B (um de cada vez, na ordem 1 → 6).
3. Montar o script temporário da seção D e gerar `db/migrations/003_guias_iniciais.sql`.
4. Rodar o script até passar em todas as validações; conferir a tabela de palavras/tamanhos; passar o checklist da seção E.
5. Validar o SQL de verdade, se houver MySQL/MariaDB local: `npm run db:migrate` num banco de teste (com `DB_NAME`/`DB_USER`
   locais) e `SELECT slug, JSON_VALID(body), JSON_LENGTH(body) FROM posts WHERE section='guias'` (todos 1 e > 10). Sem
   banco local: no script, refazer o caminho inverso (desfazer `''` → `'` no valor extraído e `JSON.parse`) para os 6 bodies.
6. Fazer a mudança da seção C em `app/lib/site.ts` e `app/routes/trail.tsx`.
7. `npm run typecheck` (se existir) e `npm run build`; os dois sem erro.
8. `npm run dev` sem banco: a `/trilha` usa mock; conferir que os botões "Ler o guia" aparecem (o mock tem a seção guias)
   e que o link aponta para `/guias/<slug>` (no mock dá 404, é esperado).
9. Atualizar `docs/guias.md` (marcar feito, anotar palavras por guia), `docs/README.md` (status ✅ da 1ª leva, Próximos
   passos) e, se mudar algo do plano, `docs/decisoes.md`.
10. Commit (`feat: 6 guias iniciais da trilha + link na trilha`) e push. O deploy aplica a migration sozinho.
11. Depois do deploy: abrir `/guias` e um guia em produção; se não aparecerem, ver o log do servidor (`[migrate]`) no painel da Hostinger.

## Riscos e cuidados

- **Aspas e barras no JSON** (seção D): é o erro mais provável; quebra a migration inteira e o servidor sobe sem os guias.
- **Migration roda uma vez**: depois do deploy, mudar a 003 não tem efeito. Correção = painel ou migration 004.
- **INSERT IGNORE** também engole erros "leves" (ex.: texto maior que a coluna é truncado com aviso, não falha). Por isso o
  script valida os tamanhos: `title` ≤ 300, `excerpt` ≤ 600, `meta_description` ≤ 200, `focus_keyword` ≤ 120.
- Não usar a coluna `coins` (não existe no CriaSite: a migration falharia).
- `featured=0` sempre (ver seção B). `updated_at=NULL`.
- React Router: `npm run build` antes do push; nada nesta tarefa mexe em loader.
- Fatos: na dúvida sobre um número ou regra, tirar a frase ou trocar por "confira a regra atual em …". Melhor um guia sem o dado do que com dado errado.
- Não há SQL para o dono colar: a migration é aplicada pelo servidor. Mesmo assim, mostrar na resposta final o nome do arquivo e a tabela de validação.

## Como verificar

- Script: todas as validações da seção D passando, tabela impressa.
- `npm run build` sem erro.
- Local (se houver banco): `JSON_VALID(body)=1` nos 6; `/guias` lista 6; `/trilha` com 6 botões.
- Produção: checklist "Como o dono confere" da seção E.
- Busca do site (`/busca?q=dominio`) encontra o guia 1.

## Perguntas em aberto

1. **Etapa "Páginas" sem guia**: a 2ª leva começa por "Como escrever as páginas do site: início, sobre, serviços e
   contato"? Outras ideias para a 2ª leva (4 a 6): e-mail com o seu domínio; Perfil da Empresa no Google; WordPress ou
   construtor de sites; política de privacidade e cookies para site pequeno; Search Console passo a passo; HTTPS e SSL
   explicados. O status antigo falava em 8 a 12 guias: com a 2ª leva chegamos lá.
2. **Capas**: guias sem imagem usam a arte padrão. Quer capas próprias depois (ilustração simples por etapa, mesma
   paleta), ou a arte padrão basta?
3. **Afiliado**: quando tiver o link da Hostinger, confirmar o texto do aviso (seção F) antes de publicar.

## Página /guias: organização por nível (2026-11-17)

A página `/guias` agrupa os guias por **nível** (Iniciante, Intermediário, Avançado) e, dentro de cada nível, segue a ordem de
aprendizado definida em `GUIDE_ORDER` (`app/lib/site.ts`); guia que não estiver na lista vai para o fim do seu nível, por data de
publicação; guia sem nível aparece no grupo "Outros guias". Há filtro por nível (`/guias?nivel=1|2|3`; nível inválido mostra todos).
**Ao criar um guia novo, acrescente o slug em `GUIDE_ORDER`** (e defina o nível no painel ou na migration).

