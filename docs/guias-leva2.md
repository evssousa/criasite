# Guias da trilha: 2ª leva (6 guias)

**Status: executado em 2026-11-15.** Migration **`006_guias_leva2.sql`** (a 005 ficou com as capas). Palavras: Páginas 835 ·
E-mail 822 · WordPress 822 · HTTPS 824 · Search Console 823 · Perfil 803 (5 min de leitura, 5 a 6 links internos, 0 a 1 externo). A etapa
Páginas da `/trilha` agora tem guia. Decisões do dono: publicar os 6 de uma vez; privacidade e cookies (LGPD) fica para a 3ª leva.
Dependia de [capas.md](capas.md), já executado (o script
`scripts/make-capas.mjs` e as artes `paginas`, `email`, `plataforma`, `cadeado`, `grafico`, `pino`).

Plano criado em 2026-11-15 pelo planejador. Executor: seguir na ordem dos **Passos**.

## Objetivo

Publicar mais 6 guias (chegando a 12), começando pela etapa **Páginas**, a única da trilha ainda sem guia, por uma
migration `006` aplicada sozinha no deploy, já com capa própria; e ligar a etapa Páginas da `/trilha` ao seu guia.

## Contexto

- A 1ª leva (6 guias, `db/migrations/003_guias_iniciais.sql`) está no ar; regras, estrutura e o jeito de gerar o SQL
  estão em [guias.md](guias.md) (seções A, D e E). **Este plano reaproveita tudo de lá**; aqui só vai o que muda.
- Migrations existentes: `001_inicial`, `002_robo`, `003_guias_iniciais`; a `004_capas_guias` vem de [capas.md](capas.md).
  **Esta leva usa `006_guias_leva2.sql`.** Se, na hora de executar, já existir outra `005`, usar o próximo número livre.
- A 1ª leva ficou entre 724 e 775 palavras, perto do piso de 700. **Alvo desta leva: 800 a 950 palavras por guia**
  (limite do validador continua 700 a 1.100).
- `TRAIL` (`app/lib/site.ts`) já tem o campo `guide` e a `/trilha` já mostra "Ler o guia" quando ele existe; só a etapa
  `paginas` está sem.
- Tudo o que é publicado precisa de `published_at <= agora` (`PUBLISHED` em `app/lib/repo/mysql.server.ts`): datas no
  passado aparecem na hora; no futuro, só na data.

## Arquivos afetados

| Arquivo | O quê |
|---|---|
| `db/migrations/006_guias_leva2.sql` | **novo**: INSERT IGNORE dos 6 guias, já com `image_url` e `image_alt` |
| `scripts/make-capas.mjs` | +6 entradas na lista `CAPAS` (seção E) |
| `public/capas/*.webp` | +6 capas |
| `app/lib/site.ts` | `guide: "como-escrever-as-paginas-do-site"` na etapa `paginas` (1 linha) |
| `docs/guias-leva2.md`, `docs/guias.md`, `docs/README.md`, `docs/decisoes.md` | marcar feito, palavras por guia |

Não mexer em `RichText.tsx`, `trail.tsx`, no robô nem no painel. Não editar a `003` (já rodou).

---

> Os exemplos entre aspas retas neste plano (títulos de erro, nomes de botão) são só deste documento: no texto do guia,
> use aspas curvas “assim” ou escreva sem aspas.

## A. Regras (iguais à 1ª leva, com 3 ajustes)

Valem integralmente as seções **A** (estrutura-modelo, links, tom, conteúdo), **D** (blocos aceitos, cuidados de SQL,
script temporário) e **E** (checklist de qualidade) de [guias.md](guias.md). Resumo do que o validador cobra:

- Lide (1º ou 2 primeiros blocos `p`) com **50 a 90 palavras e sem link**.
- 2 a 4 `h2` informativos; passo a passo em `ol` quando couber, com a ferramenta dentro do passo em que é usada.
- `h2` **"Erros comuns"** (`ul`, 4 a 6 itens) e `h2` **"Perguntas frequentes"** (3 a 4 `h3` terminando em "?" + `p`).
- Fecho em `p` com link para `/trilha#<id>` e para o próximo guia; último bloco começa exatamente com `Leia também: `.
- **3 a 6 links internos**, cada URL uma vez só no guia.
- Nenhuma aspa dupla ASCII `"` nem barra invertida `\` no texto (usar aspas curvas “assim” ou reescrever); `'` vira `''` no SQL.
- `title` 30 a 70; `meta_description` 120 a 160 (as abaixo já foram contadas); `excerpt` 120 a 200 (máx. 600).
- `read_minutes = ceil(palavras / 200)` (dá 5 para 800 a 1.000 palavras).

**Ajustes desta leva**
1. **Tamanho alvo 800 a 950 palavras** (validador continua 700 a 1.100).
2. **No máximo 1 link externo por guia** (antes eram 2).
3. **Lista branca de externos ampliada** com 2 fontes oficiais: `https://letsencrypt.org` (autoridade certificadora
   gratuita e sem fins lucrativos, citada no guia de HTTPS) e `https://support.google.com/business` (ajuda oficial do
   Perfil da Empresa). As de antes continuam valendo.

**Lista branca de links internos (para o validador):**
- os 11 `/ferramentas/<slug>` de `TOOLS`: comprimir-imagem, converter-imagem, qr-code, link-whatsapp, meta-tags,
  contador-de-caracteres, contraste-cores, gerador-favicon, sitemap-robots, status-http, tamanhos-de-imagem;
- `/trilha` e `/trilha#<id>` (`dominio`, `hospedagem`, `visual`, `paginas`, `google`, `velocidade`, `lancamento`);
- os 6 guias da 1ª leva: `como-escolher-o-dominio-do-site`, `como-escolher-a-hospedagem-do-site`,
  `cores-fonte-e-favicon-do-site`, `seo-basico-para-aparecer-no-google`, `site-lento-causas-e-como-otimizar-imagens`,
  `checklist-de-lancamento-do-site`;
- os 6 desta leva: `como-escrever-as-paginas-do-site`, `email-com-dominio-proprio`, `wordpress-ou-construtor-de-sites`,
  `https-e-certificado-ssl`, `google-search-console-passo-a-passo`, `perfil-da-empresa-no-google`
  (todos com prefixo `/guias/`).

**Temas fora desta leva:** "Política de privacidade e cookies para site pequeno" fica para a 3ª leva (tema jurídico,
pede revisão mais cuidadosa; ver Perguntas em aberto).

---

## B. Os 6 guias

Campos comuns: `section='guias'`, `status='published'`, `origin='manual'`, `author='Equipe CriaSite'`, `tag=NULL`,
`featured=0`, `updated_at=NULL`, `image_url='/capas/<slug>.webp'`, `image_alt` = texto da seção E.

### Guia 7 · Páginas

| Campo | Valor |
|---|---|
| title | Como escrever as páginas do site: início, sobre, serviços e contato (67) |
| slug | `como-escrever-as-paginas-do-site` |
| excerpt | O que colocar no início, no sobre, nos serviços e no contato, em que ordem e com que palavras, para o visitante entender em segundos o que você faz. |
| meta_description | Veja o que escrever nas páginas de início, sobre, serviços e contato do seu site, em que ordem e com quais palavras, para o visitante entender rápido. (150) |
| focus_keyword | texto para site |
| tags | `["Páginas","Textos","Iniciante"]` |
| level | 1 |
| Etapa da trilha | `paginas` (etapa 4) |
| Ferramentas | [Link do WhatsApp](/ferramentas/link-whatsapp) (página de contato), [Contador de caracteres](/ferramentas/contador-de-caracteres) (título do início) |
| Links internos | as 2 ferramentas, `/trilha#paginas`, `/guias/cores-fonte-e-favicon-do-site` (seção sobre imagens/visual), `/guias/seo-basico-para-aparecer-no-google` (fecho), `/guias/perfil-da-empresa-no-google` (leia também) — 6 |
| Externo | nenhum |

Esqueleto e pontos-chave:
- **Lide**: o visitante decide em poucos segundos se ficou no lugar certo; o texto é o que responde. Escrever antes de
  montar o design, porque o texto decide o tamanho de cada bloco. Ao final: o que vai em cada uma das 4 páginas.
- **h2 Antes de escrever: para quem e para quê**: uma frase com quem você atende, o que resolve e onde (ex.: "conserto de
  ar-condicionado em casas e escritórios de Curitiba"); a ação principal que o visitante deve tomar (chamar no WhatsApp,
  pedir orçamento, agendar); as palavras que o cliente usa ao procurar, não o jargão do setor.
- **h2 Página inicial**: `ul` na ordem de cima para baixo: título que diz o que você faz e para quem (não o slogan);
  subtítulo com o benefício ou a região; botão da ação principal visível sem rolar; 3 a 6 serviços em blocos curtos com
  link para a página de cada um; prova (fotos reais de trabalhos, número de clientes só se for real, depoimentos com
  nome e autorização); repetição do botão no fim. Título e descrição para o Google em contagem certa no
  [contador de caracteres](/ferramentas/contador-de-caracteres).
- **h2 Página sobre**: não é currículo; conta quem está por trás, há quanto tempo, como trabalha e por que confiar;
  foto real da pessoa ou da equipe; endereço ou região de atendimento; em 3 a 5 parágrafos curtos. Visual coerente com o
  resto do site → link para [cores, fonte e favicon](/guias/cores-fonte-e-favicon-do-site).
- **h2 Página de serviços**: uma seção (ou página própria) por serviço: o que é, para quem, como funciona, o que está
  incluído, prazo típico e a ação. Página própria para cada serviço importante ajuda o Google a entender cada assunto
  (ligação natural com SEO, sem prometer posição). Preço: se mostrar, explicar o que muda o valor; se não, dizer como
  pedir orçamento.
- **h2 Página de contato**: telefone e e-mail clicáveis; botão do WhatsApp com mensagem pronta
  ([link do WhatsApp](/ferramentas/link-whatsapp)); formulário curto (nome, contato, mensagem); horário de atendimento;
  endereço com mapa se houver atendimento no local; prazo de resposta. O botão do WhatsApp também no rodapé de todas as páginas.
- **h2 Passo a passo** (`ol`): 1) escreva a frase de quem você atende; 2) liste os serviços e as dúvidas mais comuns dos
  clientes; 3) escreva o rascunho de cada página num editor de texto, antes do design; 4) corte o que não ajuda o
  visitante a decidir; 5) leia em voz alta e troque termos técnicos; 6) peça a alguém de fora para dizer, depois de 10
  segundos na página inicial, o que você faz; 7) só então monte as páginas.
- **h2 Erros comuns**: título genérico ("Bem-vindo ao nosso site"); texto copiado de concorrente (o Google pode
  ignorar página duplicada, e o cliente nota); excesso de jargão; contato escondido só no rodapé; foto de banco de
  imagens no lugar de trabalho real; páginas com o mesmo texto repetido.
- **h2 Perguntas frequentes**: Preciso de um redator? (não; quem conhece o negócio escreve melhor o rascunho; um revisor
  ajuda no fim) · Quanto texto cada página precisa? (o suficiente para responder as dúvidas de quem está decidindo; não
  há número mágico de palavras) · Posso usar inteligência artificial para escrever? (para rascunho e ideias, sim;
  revise, confira os fatos e acrescente o que só você sabe sobre o seu negócio) · Preciso de blog? (não para começar;
  as 4 páginas bem feitas vêm antes).
- **Fecho**: com as páginas escritas, é hora de prepará-las para a busca → `/guias/seo-basico-para-aparecer-no-google`
  e `/trilha#paginas`.
- **Leia também**: `/guias/perfil-da-empresa-no-google`.

### Guia 8 · E-mail com o domínio

| Campo | Valor |
|---|---|
| title | E-mail com o seu domínio: como criar e configurar sem erro (58) |
| slug | `email-com-dominio-proprio` |
| excerpt | Por que contato@suaempresa.com.br passa mais confiança, onde criar a caixa, como configurar o DNS (MX, SPF, DKIM e DMARC) e o que fazer para não cair no spam. |
| meta_description | Aprenda a criar um e-mail com o seu domínio, configurar MX, SPF, DKIM e DMARC no DNS e evitar que as suas mensagens caiam na caixa de spam. (139) |
| focus_keyword | email com domínio próprio |
| tags | `["E-mail","DNS","Hospedagem"]` |
| level | 2 |
| Etapa da trilha | `hospedagem` (etapa 2) |
| Ferramentas | nenhuma (não forçar) |
| Links internos | `/guias/como-escolher-a-hospedagem-do-site` (onde criar), `/guias/como-escolher-o-dominio-do-site` (FAQ), `/trilha#hospedagem`, `/guias/wordpress-ou-construtor-de-sites` (fecho), `/guias/https-e-certificado-ssl` (leia também) — 5 |
| Externo | nenhum |

Esqueleto e pontos-chave:
- **Lide**: e-mail com o domínio (contato@suaempresa.com.br) passa mais confiança que um endereço gratuito genérico,
  continua seu se trocar de fornecedor e combina com o site; o que dá trabalho é configurar o DNS para as mensagens não
  caírem no spam. Ao final: onde criar e os 4 registros.
- **h2 Onde criar a caixa**: `h3` Na hospedagem (muitos planos incluem caixas; bom para começar; conferir quantas caixas,
  tamanho e limite de envio) · `h3` Serviço de e-mail profissional à parte (pacotes de escritório pagos por usuário, como
  Google Workspace e Microsoft 365, citados como exemplos, sem recomendação; mais espaço e aplicativos; preço por usuário,
  que muda: conferir no site do fornecedor) · `h3` Só redirecionamento (o endereço do domínio repassa para um e-mail
  pessoal; barato, mas responder "como" o endereço do domínio exige configuração extra e nem sempre funciona bem).
- **h2 Os registros de DNS, sem mistério**: DNS explicado em uma frase (o catálogo que diz para onde vai cada coisa do
  domínio). `ul`: **MX** diz qual servidor recebe os e-mails do domínio (só um serviço de recebimento por vez);
  **SPF** é um registro TXT que começa com v=spf1 e lista quem pode enviar em nome do domínio (deve existir **um só**
  SPF; dois registros SPF invalidam a checagem); **DKIM** é uma assinatura digital: o serviço de e-mail gera uma chave e
  você publica a parte pública no DNS; **DMARC** é um TXT em _dmarc que diz o que fazer com mensagem que falha no SPF e no
  DKIM e para onde mandar relatórios (começar com a política p=none, só observando, e endurecer depois). O painel do
  serviço de e-mail mostra os valores exatos: copiar de lá, não inventar.
- **h2 Por que isso evita o spam**: grandes provedores de e-mail checam SPF, DKIM e DMARC e tratam com desconfiança, ou
  recusam, mensagem de domínio sem autenticação, principalmente de quem envia em volume. Sem promessa: autenticação não
  garante a caixa de entrada; conteúdo e reputação também contam.
- **h2 Passo a passo** (`ol`): 1) escolha onde criar a caixa; 2) crie a caixa principal (contato@ ou o seu nome@);
  3) no painel do DNS do domínio, cadastre o MX indicado pelo serviço; 4) cadastre o SPF (ou acrescente o serviço ao SPF
  que já existe, sem criar um segundo); 5) ative o DKIM no serviço e publique o registro; 6) publique o DMARC com p=none
  e um e-mail para relatórios; 7) espere a propagação (de minutos a algumas horas) e mande um teste para um e-mail de
  outro provedor, conferindo se chegou na caixa de entrada; 8) configure no celular e troque o e-mail no cartão, no site
  e nas redes.
- **h2 Erros comuns**: dois registros SPF; trocar de serviço de e-mail e esquecer de mudar o MX (mensagens se perdem);
  apagar registros do DNS que não conhece ao mexer no domínio; usar a mesma senha do painel da hospedagem; criar a conta
  do serviço no e-mail de quem faz o site; deixar a caixa contato@ sem ninguém lendo.
- **h2 Perguntas frequentes**: Preciso de hospedagem para ter e-mail com domínio? (não; o domínio pode apontar o MX para
  um serviço de e-mail mesmo sem site) · Posso continuar usando o aplicativo do Gmail? (em geral, sim, adicionando a
  conta por IMAP ou pelo aplicativo do serviço; o endereço continua o do domínio) · Quantas caixas preciso? (uma por
  pessoa que responde; endereços como vendas@ podem ser apelidos que caem numa caixa só) · O que é DNS mesmo? (link
  natural para [como escolher o domínio](/guias/como-escolher-o-dominio-do-site), onde o DNS é explicado).
- **Fecho**: com domínio, hospedagem e e-mail resolvidos, falta decidir com que ferramenta montar o site →
  `/guias/wordpress-ou-construtor-de-sites` e `/trilha#hospedagem`.
- **Leia também**: `/guias/https-e-certificado-ssl`.
- **Atenção de SQL**: nada de aspas nos valores de registro (escrever "um TXT que começa com v=spf1", sem aspas); nada
  de barra invertida.

### Guia 9 · WordPress ou construtor

| Campo | Valor |
|---|---|
| title | WordPress ou construtor de sites: como decidir o que usar (57) |
| slug | `wordpress-ou-construtor-de-sites` |
| excerpt | Liberdade e manutenção de um lado, simplicidade e mensalidade do outro: compare WordPress e construtores de site pelo que importa para o seu projeto. |
| meta_description | Compare WordPress e construtores de site em custo, liberdade, manutenção, SEO e facilidade de mudar depois, e veja qual combina com o seu projeto. (146) |
| focus_keyword | wordpress ou construtor de sites |
| tags | `["WordPress","Plataformas","Iniciante"]` |
| level | 1 |
| Etapa da trilha | `hospedagem` (etapa 2) |
| Ferramentas | nenhuma |
| Links internos | `/guias/como-escolher-a-hospedagem-do-site`, `/guias/site-lento-causas-e-como-otimizar-imagens` (plugins pesam), `/guias/seo-basico-para-aparecer-no-google` (seção SEO), `/trilha#hospedagem`, `/guias/cores-fonte-e-favicon-do-site` (fecho), `/guias/como-escrever-as-paginas-do-site` (leia também) — 6 |
| Externo | nenhum |

Regra extra deste guia: **neutro**. Nenhuma plataforma é "a melhor"; nada de ranking, nada de preço exato, nada de
"recomendamos X". Pode citar WordPress (o software) e "Wix e similares" como exemplos de construtor, como na 1ª leva.

Esqueleto e pontos-chave:
- **Lide**: a escolha da ferramenta pesa mais no dia a dia (quem atualiza, quanto custa por mês, se dá para mudar) do que
  no visual; não existe opção certa para todo mundo. Ao final: um critério claro para decidir.
- **h2 O que é cada opção**: WordPress é um software livre e gratuito que você instala numa hospedagem (diferenciar do
  WordPress.com, serviço hospedado com planos próprios); você escolhe tema e plugins. Construtor de sites é um serviço
  com editor visual, hospedagem e modelos no mesmo pacote, pago por mensalidade ou anuidade. Existe também a plataforma
  de loja virtual, para quem vende produtos (citar como categoria).
- **h2 Comparação pelo que importa** (`ul`, um item por critério, sempre "WordPress: … Construtor: …"): custo (WordPress:
  hospedagem + domínio + temas ou plugins pagos, se quiser; construtor: plano mensal ou anual, recursos extras costumam
  exigir plano maior; preços mudam); facilidade para começar; liberdade (o que dá para mudar no layout e nas funções);
  manutenção (WordPress: atualizar núcleo, tema e plugins e manter backup; construtor: a empresa cuida); segurança
  (plugin desatualizado é uma das portas de entrada mais comuns em sites WordPress invadidos; no construtor a atualização
  é da empresa); levar para outro lugar (WordPress: exportar e mudar de hospedagem; construtor: em geral é refazer).
- **h2 E o SEO?**: as duas opções permitem título e descrição por página, sitemap e endereço com o seu domínio; o que mais
  pesa é o conteúdo e a velocidade, não a plataforma → link para [SEO básico](/guias/seo-basico-para-aparecer-no-google).
  Excesso de plugins e temas pesados deixam o WordPress lento → link para
  [site lento](/guias/site-lento-causas-e-como-otimizar-imagens).
- **h2 Como decidir** (`ul` de dois blocos): "Construtor faz mais sentido se…" (você quer cuidar sozinho, sem mexer em
  atualização; site institucional pequeno; prefere custo previsível) e "WordPress faz mais sentido se…" (quer liberdade
  e poder mudar de hospedagem; pretende ter blog grande ou funções específicas; tem alguém para cuidar das atualizações).
  Escrever como `p` + `ul` em cada bloco, ou dois `h3` com `ul`.
- **h2 Passo a passo para escolher** (`ol`): 1) liste as páginas e funções de que precisa (formulário, agenda, loja,
  blog); 2) defina quem vai atualizar o site; 3) faça o teste grátis de um construtor e uma instalação de teste do
  WordPress; 4) monte a página inicial nos dois; 5) some o custo de 2 anos, com renovação; 6) confira se dá para usar o
  seu domínio e exportar o conteúdo; 7) decida e registre a conta no seu nome e no seu e-mail
  (ver [hospedagem](/guias/como-escolher-a-hospedagem-do-site)).
- **h2 Erros comuns**: instalar dezenas de plugins; tema ou plugin pago baixado de graça em site não oficial (costuma vir
  com código malicioso); escolher pelo modelo mais bonito sem conferir as funções; plano de construtor que não permite
  domínio próprio; esquecer o preço de renovação; site no nome e na conta de quem o fez.
- **h2 Perguntas frequentes**: WordPress é grátis? (o software é; hospedagem e domínio são pagos, e alguns temas e plugins
  também) · Preciso saber programar? (não para nenhum dos dois no básico) · Dá para trocar de construtor para WordPress
  depois? (dá, mas costuma ser refazer as páginas; textos e imagens se reaproveitam; redirecionar os endereços antigos
  com 301) · Qual é melhor para loja virtual? (depende do volume e dos produtos; existem plataformas próprias para loja;
  compare taxas por venda e meios de pagamento).
- **Fecho**: ferramenta escolhida; agora a cara do site → `/guias/cores-fonte-e-favicon-do-site` e `/trilha#hospedagem`.
- **Leia também**: `/guias/como-escrever-as-paginas-do-site`.

### Guia 10 · HTTPS e SSL

| Campo | Valor |
|---|---|
| title | HTTPS e certificado SSL: o que são e como ativar no seu site (60) |
| slug | `https-e-certificado-ssl` |
| excerpt | O cadeado do navegador explicado sem jargão: o que o certificado protege, por que ele é gratuito na maioria das hospedagens e como resolver o aviso de site não seguro. |
| meta_description | Entenda o que é HTTPS e certificado SSL, como ativar de graça na hospedagem, redirecionar o http e corrigir o aviso de site não seguro no navegador. (148) |
| focus_keyword | certificado ssl |
| tags | `["HTTPS","SSL","Segurança"]` |
| level | 1 |
| Etapa da trilha | `lancamento` (etapa 7) |
| Ferramentas | [Status HTTP](/ferramentas/status-http) (conferir o 301 de http para https) |
| Links internos | `/ferramentas/status-http`, `/guias/como-escolher-a-hospedagem-do-site`, `/trilha#lancamento`, `/guias/checklist-de-lancamento-do-site` (fecho), `/guias/email-com-dominio-proprio` (leia também) — 5 |
| Externo | `https://letsencrypt.org` |

Esqueleto e pontos-chave:
- **Lide**: o cadeado e o https no endereço mostram que a conexão entre o visitante e o site está protegida; sem ele, o
  navegador avisa que o site não é seguro e muita gente desiste. Ativar costuma ser grátis e levar poucos minutos. Ao
  final: ativar, redirecionar e corrigir os avisos.
- **h2 O que o HTTPS faz (e o que não faz)**: criptografa o caminho entre navegador e servidor (quem está no meio, como
  numa rede Wi-Fi pública, não lê nem altera o que é enviado: formulário, senha, cartão); o certificado mostra que o
  servidor responde por aquele domínio. **Não** garante que o site é honesto: site de golpe também tem cadeado.
  SSL é o nome antigo; o protocolo atual se chama TLS, mas o mercado continua dizendo "certificado SSL".
- **h2 Tipos de certificado**: DV (valida só o domínio; suficiente para a maioria dos sites) e OV/EV (validam também a
  empresa; custam mais; o navegador não exibe diferença de destaque para o visitante). Certificados gratuitos, como os do
  [Let's Encrypt](https://letsencrypt.org), têm validade curta e são renovados automaticamente pela hospedagem.
- **h2 Por que todo site precisa, mesmo sem formulário**: navegadores marcam páginas http como não seguras; o Google
  considera o HTTPS um sinal na busca, de peso pequeno (sem promessa de posição); algumas extensões, como .app e .dev,
  só abrem por HTTPS.
- **h2 Passo a passo** (`ol`): 1) com o domínio já apontado para a hospedagem, ative o SSL gratuito no painel; 2) espere
  a emissão (de minutos a algumas horas); 3) abra o site com https e veja o cadeado; 4) ative o redirecionamento de http
  para https (opção do painel ou do tema/plugin), com código 301; 5) teste as 4 variações (http e https, com e sem www)
  e confira que todas levam ao mesmo endereço final, com o código explicado em [status HTTP](/ferramentas/status-http);
  6) no WordPress, troque o endereço do site para https nas configurações; 7) corrija o conteúdo misto (próxima seção).
- **h2 Conteúdo misto: o cadeado que some**: página em https que carrega imagem, script ou fonte por http; o navegador
  bloqueia ou tira o cadeado. Como achar: abrir a página, apertar F12 e olhar o console, que avisa "Mixed Content"
  (usar aspas curvas ou sem aspas); como corrigir: trocar os endereços para https ou caminhos relativos.
- **h2 Erros comuns**: pagar caro por certificado sem necessidade; renovação automática desligada e certificado vencido
  (o navegador mostra uma tela de alerta); certificado sem a versão com www; redirecionamento em loop (página que não
  abre); esquecer o conteúdo misto; achar que o cadeado protege o site de invasão (protege a conexão, não o painel nem os plugins).
- **h2 Perguntas frequentes**: Preciso pagar pelo certificado? (para a maioria dos sites, não; muitas hospedagens incluem
  o gratuito; ver [hospedagem](/guias/como-escolher-a-hospedagem-do-site)) · O cadeado quer dizer que o site é confiável?
  (não; quer dizer que a conexão é protegida) · Quanto tempo leva para ativar? (de minutos a algumas horas, depois que o
  domínio já aponta para a hospedagem) · O certificado vence? (sim; os gratuitos são renovados sozinhos se a renovação
  automática estiver ligada).
- **Fecho**: com o cadeado ativo, siga o resto da lista antes de divulgar → `/guias/checklist-de-lancamento-do-site` e
  `/trilha#lancamento`.
- **Leia também**: `/guias/email-com-dominio-proprio`.
- Não citar validade em dias dos certificados gratuitos (a regra está mudando); só "validade curta".

### Guia 11 · Search Console

| Campo | Valor |
|---|---|
| title | Google Search Console: passo a passo para cadastrar o site (58) |
| slug | `google-search-console-passo-a-passo` |
| excerpt | Como verificar o domínio, enviar o sitemap, pedir a indexação e ler os relatórios que importam no Search Console, a ferramenta gratuita do Google para quem tem site. |
| meta_description | Passo a passo para cadastrar o site no Google Search Console: verificar o domínio, enviar o sitemap, pedir indexação e entender os relatórios principais. (153) |
| focus_keyword | google search console |
| tags | `["Search Console","Google","SEO"]` |
| level | 2 |
| Etapa da trilha | `google` (etapa 5) |
| Ferramentas | [Sitemap e robots.txt](/ferramentas/sitemap-robots), [Status HTTP](/ferramentas/status-http) (motivos de página não indexada: 404, redirecionamento) |
| Links internos | as 2 ferramentas, `/guias/seo-basico-para-aparecer-no-google` (no corpo, seção "O que fazer com o que aparecer"), `/trilha#google`, `/guias/site-lento-causas-e-como-otimizar-imagens` (fecho), `/guias/perfil-da-empresa-no-google` (leia também) — 6 |
| Externo | `https://search.google.com/search-console` |

Esqueleto e pontos-chave:
- **Lide**: o Search Console é a ferramenta gratuita em que o Google mostra como vê o seu site: se as páginas foram
  encontradas, por quais buscas aparecem e quais erros impedem a indexação. Cadastrar leva poucos minutos. Ao final:
  verificação, sitemap, indexação e os relatórios.
- **h2 Domínio ou prefixo de URL**: dois tipos de propriedade. Domínio cobre http, https, com e sem www e subdomínios, e
  é verificado por um registro TXT no DNS (recomendado). Prefixo de URL cobre só aquele endereço exato e aceita outros
  métodos (arquivo HTML, meta tag, Google Analytics, Tag Manager). Depois de verificado, **não apagar o TXT**: o Google
  confere de tempos em tempos e a verificação pode cair.
- **h2 Passo a passo para cadastrar** (`ol`): 1) entre no [Search Console](https://search.google.com/search-console) com
  a conta Google do negócio (não a de quem faz o site); 2) escolha Domínio e digite só o domínio; 3) copie o TXT e
  cadastre no DNS onde o domínio está; 4) volte e clique em verificar (se falhar, espere a propagação e tente de novo);
  5) em Sitemaps, envie o endereço do sitemap (gerar no [gerador de sitemap](/ferramentas/sitemap-robots) se o site não
  cria sozinho) e confira o status de leitura; 6) na inspeção de URL, cole o endereço da página inicial e peça a
  indexação; 7) em Usuários e permissões, dê acesso a quem ajuda, sem passar a sua senha.
- **h2 Os relatórios que importam**: `h3` Desempenho (cliques, impressões, CTR e posição média por busca e por página;
  os dados chegam com alguns dias de atraso) · `h3` Páginas (quais estão indexadas e por que outras não estão: não
  encontrada 404, página com redirecionamento, excluída pela tag noindex, rastreada mas não indexada, descoberta mas não
  indexada; o significado dos códigos está em [status HTTP](/ferramentas/status-http)) · `h3` Experiência e Core Web
  Vitals (velocidade com dados de usuários reais, quando há visitas suficientes) · `h3` Segurança e ações manuais (deve
  estar vazio; se aparecer algo, é prioridade).
- **h2 O que fazer com o que aparecer**: página importante fora do índice → conferir se não tem noindex, se aparece no
  sitemap e se tem links internos; "não indexada" em página de redirecionamento ou de parâmetro é normal; queda de
  cliques → olhar quais páginas e buscas caíram antes de mudar algo. Ligar ao básico de SEO →
  [SEO básico](/guias/seo-basico-para-aparecer-no-google).
- **h2 Erros comuns**: propriedade por prefixo só do endereço com www quando o site abre sem www (dados faltando); apagar
  o TXT depois de verificar; pedir indexação da mesma página todo dia (há limite diário, e repetir não acelera);
  entrar em pânico com toda página "não indexada"; deixar a agência como única proprietária.
- **h2 Perguntas frequentes**: É pago? (não) · Quanto tempo até aparecerem dados? (alguns dias depois da verificação;
  um site novo pode demorar mais a ter buscas) · Qual a diferença para o Google Analytics? (o Search Console mostra a
  busca, antes do clique; o Analytics mostra o que o visitante faz no site) · E o Bing? (o Bing Webmaster Tools permite
  importar os sites do Search Console; vale fazer depois).
- **Fecho**: com o Google acompanhando o site, a próxima etapa é a velocidade →
  `/guias/site-lento-causas-e-como-otimizar-imagens` e `/trilha#google`.
- **Leia também**: `/guias/perfil-da-empresa-no-google`.
- Nomes de menu do Search Console mudam com o tempo: escrever "o relatório de páginas" em vez de copiar rótulos exatos de
  botões; onde citar um rótulo, citar sem aspas ASCII.

### Guia 12 · Perfil da Empresa no Google

| Campo | Valor |
|---|---|
| title | Perfil da Empresa no Google: como criar, verificar e cuidar (59) |
| slug | `perfil-da-empresa-no-google` |
| excerpt | O cartão que aparece na busca e no Maps quando alguém procura o seu negócio: como criar, verificar, preencher sem erro e pedir avaliações do jeito certo. |
| meta_description | Como criar e verificar o Perfil da Empresa no Google, preencher horário, categoria e fotos, ligar ao seu site e pedir avaliações sem ferir as regras. (149) |
| focus_keyword | perfil da empresa no google |
| tags | `["Google","Negócio local","Iniciante"]` |
| level | 1 |
| Etapa da trilha | `lancamento` (etapa 7; a trilha já fala de avisar o Google e do QR code para clientes da loja física) |
| Ferramentas | [QR code](/ferramentas/qr-code) (pedir avaliação no balcão) |
| Links internos | `/ferramentas/qr-code`, `/guias/seo-basico-para-aparecer-no-google` (dados iguais aos do site), `/trilha#lancamento`, `/guias/google-search-console-passo-a-passo` (fecho), `/guias/como-escrever-as-paginas-do-site` (leia também) — 5 |
| Externo | `https://support.google.com/business` |

Esqueleto e pontos-chave:
- **Lide**: quando alguém procura o nome do negócio ou "padaria perto de mim", o Google mostra um cartão com endereço,
  horário, fotos e avaliações: é o Perfil da Empresa, antigo Google Meu Negócio. Criar é gratuito, e um perfil completo
  e certo ajuda o cliente a chegar até você. Ao final: criar, verificar, preencher e cuidar.
- **h2 Quem pode ter um perfil**: negócio com atendimento presencial: no próprio endereço (loja, consultório) ou indo
  até o cliente (área de atendimento, com o endereço oculto, como eletricista ou diarista). Negócio só on-line, sem
  contato presencial com o cliente, em geral não se encaixa: conferir as diretrizes na
  [ajuda oficial](https://support.google.com/business).
- **h2 Passo a passo para criar e verificar** (`ol`): 1) pesquise o nome do negócio no Google Maps para ver se já existe
  um perfil (se existir, peça a propriedade em vez de criar outro); 2) crie com a conta Google do negócio; 3) use o nome
  real, igual ao da fachada e do site; 4) escolha a categoria principal mais específica; 5) informe endereço ou área de
  atendimento, telefone e site; 6) verifique pelo método que o Google indicar para o seu caso (pode ser vídeo, telefone,
  SMS, e-mail ou carta; ele decide); 7) depois de verificado, preencha horário, serviços, fotos e descrição.
- **h2 O que preencher e como**: `ul`: nome, endereço e telefone **iguais** aos do site e das redes (diferenças confundem o
  cliente e o Google; ligação com [SEO básico](/guias/seo-basico-para-aparecer-no-google)); horário, incluindo feriados
  e férias; fotos reais da fachada, do ambiente, da equipe e dos trabalhos; descrição em linguagem natural, sem lista de
  palavras-chave; serviços ou produtos com nome e descrição curta; link do site na página certa.
- **h2 Avaliações: pedir, responder e o que é proibido**: pedir a todo cliente atendido, não só aos satisfeitos; facilitar
  com o link curto de avaliação que o próprio perfil gera, num [QR code](/ferramentas/qr-code) no balcão, no cardápio ou
  no recibo; responder todas, inclusive as negativas, com educação e sem expor dados do cliente. **Proibido** pelas
  regras do Google: comprar avaliações, oferecer desconto ou brinde em troca, avaliar o próprio negócio ou pedir para
  funcionários avaliarem. Violação pode levar à remoção das avaliações ou à suspensão do perfil.
- **h2 Erros comuns**: pôr palavra-chave no nome ("Padaria da Ana Pão Quente Barato Centro"), que pode levar à suspensão;
  perfil duplicado do mesmo negócio; endereço de casa exposto sem necessidade (usar área de atendimento); horário velho
  (cliente vai e encontra fechado); perfil criado na conta de quem cuida do marketing, sem você como proprietário.
- **h2 Perguntas frequentes**: É pago? (não; anúncio no Maps é outra coisa) · Preciso ter loja aberta ao público? (não;
  quem atende na casa do cliente usa área de atendimento) · Quanto tempo leva a verificação? (varia de minutos a alguns
  dias, conforme o método) · Posso apagar uma avaliação ruim? (não; dá para denunciar a que viola as regras e responder
  as outras).
- **Fecho**: com o perfil no ar, acompanhe como o site aparece na busca →
  `/guias/google-search-console-passo-a-passo` e `/trilha#lancamento`.
- **Leia também**: `/guias/como-escrever-as-paginas-do-site`.
- Regras do Google para perfis mudam: escrever "confira a regra atual na ajuda oficial" onde couber; não citar prazos de
  verificação fixos.

---

## C. Ordem de publicação (`published_at`)

Datas no passado recente, relativas ao momento em que a migration roda (como na 1ª leva), espalhadas nas últimas
~48 horas, com o guia de Páginas por último para ele aparecer primeiro em "Guias novos" da home (a home mostra os 3 mais
recentes: Páginas, Search Console e Perfil):

| Guia | published_at |
|---|---|
| 9 WordPress ou construtor | `UTC_TIMESTAMP() - INTERVAL 46 HOUR - INTERVAL 20 MINUTE` |
| 8 E-mail | `UTC_TIMESTAMP() - INTERVAL 38 HOUR - INTERVAL 5 MINUTE` |
| 10 HTTPS e SSL | `UTC_TIMESTAMP() - INTERVAL 29 HOUR - INTERVAL 40 MINUTE` |
| 12 Perfil da Empresa | `UTC_TIMESTAMP() - INTERVAL 20 HOUR - INTERVAL 15 MINUTE` |
| 11 Search Console | `UTC_TIMESTAMP() - INTERVAL 11 HOUR - INTERVAL 50 MINUTE` |
| 7 Páginas | `UTC_TIMESTAMP() - INTERVAL 3 HOUR - INTERVAL 25 MINUTE` |

Todos no passado: os links entre os guias desta leva funcionam desde o primeiro minuto (data no futuro esconderia o guia
e deixaria links e o botão da trilha dando 404 até a data). No arquivo, as linhas podem seguir a ordem da tabela.

## D. Forma do arquivo `006_guias_leva2.sql`

Igual à 003 (ver [guias.md](guias.md), seção D), com **`image_url` e `image_alt` na lista de colunas**:

```sql
-- CriaSite · migration 006 · segunda leva de guias (páginas, e-mail, WordPress ou construtor, HTTPS, Search Console, Perfil da Empresa)
-- Escritos à mão (origem 'manual'). Revise e edite em /admin → Matérias.
-- INSERT IGNORE: se já existir um guia com o mesmo endereço (seção + slug), nada é sobrescrito.
-- Capas em public/capas/ (scripts/make-capas.mjs). Datas relativas ao momento em que a migration roda (últimas ~48 h).

SET NAMES utf8mb4;

INSERT IGNORE INTO posts
  (section, slug, status, origin, title, excerpt, tag, level, author, read_minutes, image_url, image_alt, body, meta_description, focus_keyword, tags, featured, published_at, updated_at)
VALUES
('guias', 'wordpress-ou-construtor-de-sites', 'published', 'manual', '…', '…', NULL, 1, 'Equipe CriaSite', 5, '/capas/wordpress-ou-construtor-de-sites.webp', '…', '[…]', '…', 'wordpress ou construtor de sites', '["WordPress","Plataformas","Iniciante"]', 0, UTC_TIMESTAMP() - INTERVAL 46 HOUR - INTERVAL 20 MINUTE, NULL),
…;
```
- O script temporário (fora do repositório) é o mesmo da 1ª leva, com: lista branca nova (seção A), máximo de **1**
  externo, alvo de palavras impresso na tabela (avisar, sem abortar, se ficar fora de 800 a 950), e o `image_alt` lido
  da lista `CAPAS` de `scripts/make-capas.mjs` (importar o array, para o texto não divergir) com `'` → `''`.
- Validar também: o arquivo `public/capas/<slug>.webp` existe para os 6.
- Apagar o script temporário depois de gerar.

## E. Capas desta leva (entradas para `CAPAS` em `scripts/make-capas.mjs`)

| slug | etapa | arte | alt |
|---|---|---|---|
| `como-escrever-as-paginas-do-site` | paginas | paginas | Ilustração do rascunho de uma página inicial dentro de uma janela de navegador: cabeçalho, título, botão laranja, imagem de destaque e três blocos de serviços. |
| `email-com-dominio-proprio` | hospedagem | email | Ilustração de um envelope dentro de uma janela de navegador, com um selo laranja com o símbolo de arroba no canto. |
| `wordpress-ou-construtor-de-sites` | hospedagem | plataforma | Ilustração de dois painéis lado a lado, um com código em fundo azul-marinho e outro com blocos de arrastar, separados por um selo de comparação. |
| `https-e-certificado-ssl` | lancamento | cadeado | Ilustração de um cadeado laranja fechado dentro de uma janela de navegador, com um selo verde de confirmação ao lado. |
| `google-search-console-passo-a-passo` | google | grafico | Ilustração de um gráfico de barras com uma linha laranja subindo, representando os relatórios de desempenho do site na busca. |
| `perfil-da-empresa-no-google` | lancamento | pino | Ilustração de um mapa simplificado com um pino laranja marcando o local do negócio e uma fileira de estrelas de avaliação. |

As artes já existem desde a execução de [capas.md](capas.md) (seção E de lá). Aqui só entram as 6 linhas na lista.

## F. Trilha (mudança mínima de código)

Em `app/lib/site.ts`, na etapa `paginas` de `TRAIL`, acrescentar depois de `tools`:
```ts
    guide: "como-escrever-as-paginas-do-site",
```
Nada mais: `app/routes/trail.tsx` já mostra o botão "Ler o guia" quando `guide` existe. As outras 5 guias novas não
viram `guide` de etapa (cada etapa tem um guia principal); elas chegam pela `/guias`, pela busca e pelos links internos.

---

## Passos

1. Confirmar que [capas.md](capas.md) foi executado (existem `scripts/make-capas.mjs` e as 12 artes). Se não, executar
   aquele plano primeiro.
2. Ler este plano, [guias.md](guias.md) (seções A, D e E), `app/lib/types.ts` (tipo `Block`) e um guia da
   `003_guias_iniciais.sql` como exemplo de tom e tamanho.
3. Escrever os 6 guias (ordem: 7 Páginas, 8 E-mail, 9 WordPress, 10 HTTPS, 11 Search Console, 12 Perfil), seguindo os
   esqueletos da seção B, mirando 800 a 950 palavras.
4. Acrescentar as 6 entradas da seção E em `CAPAS` e rodar
   `node scripts/make-capas.mjs como-escrever-as-paginas-do-site email-com-dominio-proprio wordpress-ou-construtor-de-sites https-e-certificado-ssl google-search-console-passo-a-passo perfil-da-empresa-no-google --folha`.
   Conferir pesos (< 60 KB) e a folha.
5. Montar o script temporário (seção D) e gerar `db/migrations/006_guias_leva2.sql`; rodar até passar em todas as
   validações e imprimir a tabela (slug, palavras, read_minutes, title, meta, links internos, externos).
6. Caminho inverso (sem MySQL local): desfazer `''` → `'` e `JSON.parse` nos 6 bodies. Com MySQL local: `npm run db:migrate`
   num banco de teste e `SELECT slug, JSON_VALID(body), image_url FROM posts WHERE section='guias'` (12 linhas, todas 1).
7. Passar o checklist da seção E de [guias.md](guias.md) em cada guia, mais: neutralidade no guia 9, nenhuma validade em
   dias no guia 10, nenhum prazo fixo de verificação no guia 12, "consulte a ajuda oficial" onde a regra muda.
8. Mudança da seção F em `app/lib/site.ts`.
9. `npm run typecheck` e `npm run build` sem erro. `npm run dev`: a etapa Páginas da `/trilha` mostra "Ler o guia"
   (no mock dá 404 ao clicar, é esperado).
10. Atualizar `docs/guias-leva2.md` (status, palavras por guia), `docs/guias.md` (nota no topo apontando para a 2ª leva),
    `docs/README.md` (status, Próximos passos) e `docs/decisoes.md` se algo mudou.
11. Commit (`feat: 2ª leva de guias (6) + guia da etapa Páginas na trilha`) com a 005, as 6 capas e o `site.ts`; push.
    Na resposta ao dono: nome do arquivo, a tabela de validação e o aviso de que o servidor aplica sozinho (não colar o
    SQL inteiro, que é longo; colar só o cabeçalho e a lista de slugs).
12. Depois do deploy: `/guias` com 12 guias, todos com capa; `/trilha` com 7 botões "Ler o guia".

## Riscos e cuidados

- **Aspas e barras no JSON**: continua sendo o erro mais provável (ver [guias.md](guias.md), seção D). Os guias 8 e 10
  têm mais tentação de aspas (registros de DNS, mensagens do navegador): escrever sem aspas.
- **Capa ausente**: se a 005 subir sem os 6 `.webp`, os guias aparecem com imagem quebrada. O passo 5 valida a existência.
- **Fatos que mudam** (regras do Google, validade de certificado, métodos de verificação): na dúvida, tirar o número e
  mandar conferir na fonte oficial. Melhor sem o dado do que com dado errado.
- **Neutralidade (guia 9 e 8)**: citar marcas só como exemplo de categoria, nunca como recomendação; sem preço.
- **Migration roda uma vez**: correção depois do deploy é pelo painel ou nova migration.
- **INSERT IGNORE engole truncamento**: o script valida os tamanhos (title ≤ 300, excerpt ≤ 600, meta ≤ 200,
  focus_keyword ≤ 120, image_alt ≤ 300).
- `featured=0` e `updated_at=NULL` sempre. Sem coluna `coins`.
- React Router: `npm run build` antes do push.

## Como verificar

- Tabela do script: 6 linhas, 800 a 950 palavras (aviso fora disso, erro fora de 700 a 1.100), 3 a 6 internos, ≤ 1 externo.
- `npm run build` sem erro.
- Produção: `/admin/materias` com 12 guias manuais; `/guias` com 12 cards, todos com capa; a home mostra Páginas, Search
  Console e Perfil em "Guias novos"; `/trilha` com 7 botões "Ler o guia"; cada guia novo termina com o box "LEIA TAMBÉM";
  2 links internos de cada guia abrem; `/busca?q=dmarc` acha o guia de e-mail.

## Perguntas em aberto

1. **Privacidade e cookies (LGPD) para site pequeno**: fica para a 3ª leva, com tom bem geral e "consulte um
   profissional". O dono quer esse tema mesmo assim (ele ajuda no pedido do AdSense, que exige política de privacidade)?
2. **Publicação gradual**: o plano publica os 6 de uma vez (datas nas últimas 48 h). Alternativa: datas no futuro, um
   guia a cada 2 dias, para o site parecer ativo por mais tempo; custo: links entre guias novos e o botão da trilha dão
   404 até a data de cada um, então os links teriam de apontar só para guias já publicados. Recomendação: de uma vez.
3. **Links dos guias antigos para os novos** (ex.: o guia de SEO cita Perfil da Empresa e Search Console sem link):
   fazer depois, pelo painel, ou numa migration de UPDATE própria. Não entra nesta leva.
