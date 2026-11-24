# Guias da trilha: 3ª leva (5 guias evergreen) + links dos guias antigos

**Status: executado em 2026-11-24** (11 decisões aprovadas pelo dono com as recomendações). Commit com as migrations 012 e 013, 5 capas, `make-capas.mjs` e `site.ts`. Falta conferir em produção.
Plano criado em 2026-11-22 pelo planejador. Executor: seguir na ordem dos **Passos**.

## Objetivo

Publicar mais 5 guias originais e atemporais (privacidade e LGPD, aviso de cookies, medir visitas, manutenção e backup,
site fora do ar), chegando a 25 guias antes do pedido do AdSense, por uma migration `012` já com capa própria; e, numa
migration `013`, ligar os guias antigos aos novos e às ferramentas, sem mexer em `updated_at`.

## Contexto

- No ar: 12 guias clássicos (migrations 003 e 006), 8 de IA (008, `tag='Com IA'`), 22 notícias, 15 ferramentas.
  Regras de texto, validador e geração do SQL: [guias.md](guias.md) (seções A, D, E), [guias-leva2.md](guias-leva2.md)
  (seção A) e [ia-desenvolvimento.md](ia-desenvolvimento.md) (B.0, a regra de fatos). **Este plano reaproveita tudo isso;
  aqui só vai o que muda.**
- A 1ª e a 2ª leva deixaram de fora "política de privacidade e cookies (LGPD)" por ser tema jurídico (guias-leva2.md,
  Pergunta 1). O AdSense exige política de privacidade e conteúdo útil; guias sobre o assunto ajudam o pedido.
- Ideias que sobraram dos planos anteriores: (1) privacidade e cookies (guias.md e guias-leva2.md); (2) a 2ª leva de IA
  (vibe coding, quando não usar IA, IA no WordPress, IA para os textos do site, erros e alucinação), que
  ia-desenvolvimento.md (seção K) marcou para **depois de 4 semanas de dados do Search Console** (os guias de IA são de
  17/11, então isso cai por volta de 15/12); (3) os links pendentes da ferramenta "Está fora do ar?" em 4 guias antigos
  (ferramenta-fora-do-ar.md, Parte D, item 5), marcados para "o sábado da 3ª leva". Esta leva cobre (1) e (3) e completa
  com 3 temas evergreen que fecham o ciclo de vida do site (medir, manter, consertar). A (2) fica para dezembro
  (Decisão G1).
- O próprio CriaSite já tem o que os guias ensinam: `/privacidade`, `/cookies` (tabela tipo, situação, para quê,
  consentimento), banner com "Só os essenciais" e "Aceitar todos" no mesmo tamanho (`app/components/CookieConsent.tsx`),
  link "Preferências de cookies" no rodapé e contagem de visitas sem cookie. Pode servir de exemplo real (Decisão G4).
- Migrations: a última é `011_visitas.sql`. **Esta leva usa `012_guias_leva3.sql` (guias) e `013_links_leva3.sql`
  (links).** Se, na hora de executar, já existir outra 012, usar os próximos números livres.
- Estado dos corpos que a 013 vai alterar (conferido lendo as migrations, na ordem em que rodaram):
  - `updated_at` **vazio**: domínio, HTTPS, checklist, páginas, Search Console, WordPress, segurança com IA (G6).
  - `updated_at` **gravado** pela 004: hospedagem (guarda só por âncoras, como na 010). Pela 009: G2 e G3 de IA
    (não são tocados aqui).
  - A 010 inseriu 1 parágrafo no domínio (índice 12), na hospedagem (16), no WordPress (13) e no e-mail (14); o README
    confirma que os 4 links apareceram em produção em 2026-11-19. Os índices da Parte E já contam com isso.
- `GUIDE_ORDER` (`app/lib/site.ts`) ordena a `/guias`; guia novo precisa entrar na lista. `TRAIL` não muda: cada etapa
  continua com um guia principal.

## Arquivos afetados

| Arquivo | O quê |
|---|---|
| `db/migrations/012_guias_leva3.sql` | **novo**: INSERT IGNORE dos 5 guias, já com `image_url` e `image_alt` |
| `db/migrations/013_links_leva3.sql` | **novo**: 8 UPDATE com `JSON_ARRAY_INSERT` nos guias antigos (Parte E) |
| `scripts/make-capas.mjs` | +5 desenhos em `ARTES` e +5 entradas em `CAPAS` (Parte D) |
| `public/capas/*.webp` | +5 capas |
| `app/lib/site.ts` | +5 slugs em `GUIDE_ORDER` (Parte C.3) |
| `docs/guias-leva3.md`, `docs/README.md`, `docs/decisoes.md`, `docs/ferramenta-fora-do-ar.md` | marcar feito, palavras por guia, links feitos |

Não mexer em `RichText.tsx`, `post.tsx`, `trail.tsx`, nas páginas `/privacidade` e `/cookies`, no robô nem no painel.
Não editar migrations que já rodaram.

---

> Os exemplos entre aspas retas neste plano são só deste documento. No texto do guia, use aspas curvas “assim” ou
> escreva sem aspas (o validador aborta com aspas duplas ASCII ou barra invertida).

## A. Regras desta leva

Valem integralmente as seções A, D e E de [guias.md](guias.md), a seção A de [guias-leva2.md](guias-leva2.md) e a regra
de fatos B.0.4 de [ia-desenvolvimento.md](ia-desenvolvimento.md). Resumo do que o validador cobra: lide de 50 a 90
palavras sem link; 2 a 4 `h2` informativos (podem ser mais quando o tema pede, como nas levas anteriores); passo a passo
em `ol`; `h2` "Erros comuns" (`ul`, 4 a 6 itens); `h2` "Perguntas frequentes" (3 a 4 `h3` terminando em "?" + `p`);
fecho com `/trilha#<id>` e o próximo guia; último bloco começa exatamente com `Leia também: `; 3 a 6 links internos,
cada URL uma vez; no máximo 1 externo; `title` 30 a 70; `meta_description` 120 a 160; `excerpt` 120 a 200;
`read_minutes = ceil(palavras / 200)`.

**Ajustes desta leva**
1. **Tamanho: alvo 850 a 1.000 palavras** (o pedido é 800+; validador continua 700 a 1.100). Na leva de IA, 7 de 8 ficaram
   abaixo de 800: aqui o script **aborta** abaixo de 800 (antes só avisava).
2. **Aviso jurídico (padrão novo, só nos guias 13 e 14).** Hoje nenhum guia tem aviso dentro do texto (a transparência
   fica na `/politica-editorial`). Nos dois guias de tema legal, o **2º bloco** (logo depois do lide) é um `quote` com
   este texto exato (Decisão G3):
   > Este guia explica o assunto de forma simples, para você dar o primeiro passo. Ele não é orientação jurídica e não
   > garante que o seu site esteja de acordo com a lei: cada negócio tem as suas particularidades. Para o seu caso, consulte
   > um advogado ou um profissional de proteção de dados.

   O `quote` não conta como lide (o validador olha só os blocos `p` do começo) e não leva link.
3. **Sem promessa legal.** Proibido: "fica em conformidade", "100% de acordo com a LGPD", "protege você de multa",
   "modelo aprovado", "evita processo". Permitido: "ajuda a ser transparente", "é o mínimo que a lei pede de todo site
   que trata dados", "a lei prevê sanções". **Sem valores de multa** nem números de artigos no texto (o leitor é leigo;
   a única referência formal é "Lei Geral de Proteção de Dados, a Lei 13.709/2018", uma vez, no guia 13).
4. **Nomes de empresas (Decisão G5).** Só podem aparecer: Google e os produtos dele que são o assunto (Search Console,
   Google Analytics, AdSense, Perfil da Empresa), o software WordPress e órgãos públicos (ANPD, Registro.br). Nenhum
   plugin, serviço de banner de cookies, ferramenta de estatística alternativa, serviço de monitoramento ou hospedagem
   por nome, nem como exemplo: descrever pela categoria ("plugins de aviso de cookies", "ferramentas de estatística que
   não usam cookies", "serviços de monitoramento"). A Hostinger continua só no guia de hospedagem (afiliado já existente);
   nenhum guia desta leva cita a Hostinger.
5. **Lista branca interna** (para o validador):
   - os 15 `/ferramentas/<slug>` de `TOOLS`: comprimir-imagem, qr-code, link-whatsapp, contador-de-caracteres, meta-tags,
     converter-imagem, contraste-cores, gerador-favicon, sitemap-robots, status-http, esta-fora-do-ar, prompt-para-site,
     quanto-custa-um-site, arquivo-de-instrucoes-ia, tamanhos-de-imagem;
   - `/trilha` e `/trilha#<id>` (dominio, hospedagem, visual, paginas, google, velocidade, lancamento);
     `/criar-site-com-ia` e `/criar-site-com-ia#<id>`;
   - os 20 guias existentes e os 5 desta leva (prefixo `/guias/`);
   - **novo, se a Decisão G4 for aprovada:** `/privacidade` e `/cookies` (páginas do próprio CriaSite, citadas como
     exemplo de organização, nunca como modelo para copiar).
6. **Lista branca externa ampliada:** `https://www.gov.br/anpd/pt-br` (ANPD). Continuam valendo `https://registro.br` e
   as anteriores. Conferir com `curl -sSIL -A "Mozilla/5.0" <url>` que responde 200 (seguindo redirecionamentos) antes de
   gravar. Se o endereço da ANPD mudar, usar o que o gov.br redirecionar e anotar aqui.
7. **Regra de fatos (LGPD e Google).** Tudo o que for regra vem das fontes da Parte F e é escrito como princípio estável.
   O que muda (regras da ANPD para pequeno porte, exigências do AdSense, recursos do Google) ganha "confira a regra atual
   em …". Na dúvida, tirar a frase. **Nada de prazo** (dias de propagação de DNS além de "de minutos a algumas horas", como
   os outros guias; dias de congelamento do domínio; prazo de resposta ao titular).
8. **Tom**: quem explica para o dono de um site pequeno (assistência técnica, confeitaria, consultório, escritório de
   contabilidade, todos fictícios). Frases curtas, "você", termo técnico explicado na 1ª vez. Texto 100% próprio: não
   copiar frases das páginas `/privacidade` e `/cookies`, da lei, dos guias da ANPD nem das ajudas do Google.

---

## B. Os 5 guias

Campos comuns: `section='guias'`, `status='published'`, `origin='manual'`, `author='Equipe CriaSite'`, `tag=NULL`
(família clássica: o "Leia também" automático sugere guias clássicos), `featured=0`, `updated_at=NULL`,
`image_url='/capas/<slug>.webp'`, `image_alt` lido da lista `CAPAS` (Parte D).

Os `title` e `meta_description` abaixo foram contados à mão; **o script conta de novo** (passo 6).

### Guia 13 · Privacidade e LGPD

| Campo | Valor |
|---|---|
| title | Política de privacidade para site pequeno: o que a LGPD pede (60) |
| slug | `politica-de-privacidade-para-site-pequeno` |
| excerpt | O formulário de contato, as estatísticas e os anúncios lidam com dados pessoais. Veja o que a LGPD pede de um site pequeno e o que escrever na política de privacidade. |
| meta_description | Entenda o que a LGPD pede de um site pequeno, o que é dado pessoal e o que escrever na política de privacidade, em linguagem simples e sem juridiquês. (~150) |
| focus_keyword | política de privacidade para site |
| tags | `["Privacidade","LGPD","Iniciante"]` |
| level | 1 |
| Etapa da trilha | `lancamento` (etapa 7) |
| Ferramentas | nenhuma (não forçar) |
| Links internos | `/guias/como-escrever-as-paginas-do-site` (formulário da página de contato), `/privacidade` (exemplo, se G4), `/guias/aviso-de-cookies-no-site` (fecho), `/trilha#lancamento` (fecho), `/guias/checklist-de-lancamento-do-site` (leia também): 5 |
| Externo | `https://www.gov.br/anpd/pt-br` |

Esqueleto e pontos-chave:
- **Lide** (sem link): todo site que recebe um contato pelo formulário, mede visitas ou mostra anúncios lida com dados
  pessoais, e a lei brasileira vale também para o negócio pequeno. A política de privacidade é a página que conta ao
  visitante o que você faz com esses dados. Ao final: o que é dado pessoal, o que a lei pede no dia a dia e o que
  escrever na sua política.
- **quote**: o aviso jurídico padrão (seção A, ajuste 2).
- **h2 O que é dado pessoal e onde ele aparece no seu site**: dado pessoal é qualquer informação que identifica ou pode
  identificar uma pessoa: nome, e-mail, telefone, CPF, endereço, e também o endereço IP e os identificadores gravados por
  cookies. `ul` de onde ele aparece num site comum: formulário de contato e de orçamento; botão do WhatsApp (o número de
  quem chama chega até você); lista de e-mails ou newsletter; comentários; área de cliente e loja; ferramentas de
  estatística; anúncios; vídeos, mapas e posts de redes incorporados. Fechar com dados sensíveis em 2 frases: saúde,
  religião, origem racial ou étnica, opinião política, filiação a sindicato, vida sexual, dados genéticos e biométricos
  têm regras mais rígidas; consultório, clínica, igreja ou sindicato devem consultar um profissional antes de coletar.
- **h2 A LGPD em poucas palavras**: a Lei Geral de Proteção de Dados (Lei 13.709/2018) vale para pessoas e empresas que
  tratam dados pessoais no Brasil, de qualquer tamanho, inclusive MEI e profissional autônomo; o uso estritamente
  particular, sem fim econômico, fica de fora. Tratar = coletar, guardar, usar, compartilhar ou apagar. A ANPD
  (Autoridade Nacional de Proteção de Dados) fiscaliza e publica guias de orientação. `ul` com 5 princípios em linguagem
  de dono de site: diga para que usa cada dado (finalidade); peça só o necessário (necessidade); conte de forma clara
  (transparência); proteja (segurança); deixe a pessoa saber o que você tem sobre ela (livre acesso).
- **h2 Por que o consentimento não é a única porta**: a lei lista hipóteses que autorizam usar um dado (as bases legais);
  o consentimento é só uma delas. Exemplos simples: responder a quem pediu orçamento é atender a um pedido da própria
  pessoa; guardar nota fiscal é cumprir uma obrigação; enviar promoção por e-mail pede, em geral, que a pessoa tenha
  concordado. Escolher a base certa para cada uso é a parte em que um profissional mais ajuda. Regras simplificadas para
  pequeno porte: a ANPD tem regras próprias para microempresas, empresas de pequeno porte, startups e pessoas que
  tratam dados com fim econômico; entre elas, a dispensa de indicar um encarregado (a pessoa responsável pelo contato
  sobre dados), desde que exista um canal para os titulares falarem com você; há exceções para quem faz tratamento de
  alto risco. Fechar com: confira a regra atual no [site da ANPD](https://www.gov.br/anpd/pt-br).
- **h2 O que a política de privacidade precisa contar** (`ul`, cada item "Tema: explicação"): quem é você (nome ou razão
  social e um contato); quais dados coleta e por onde; para que usa cada um; com quem compartilha (hospedagem, serviço
  de e-mail, estatísticas, anúncios, WhatsApp); por quanto tempo guarda e quando apaga; como protege; os direitos de quem
  é dono dos dados (confirmar se você tem dados dele, acessar, corrigir, pedir para apagar, saber com quem compartilha,
  retirar o consentimento) e como pedir; cookies, com link para a política de cookies; a data da última atualização.
  Depois da lista, 1 `p`: o formulário é o ponto que mais pede cuidado; ver a página de contato no guia
  [como escrever as páginas do site](/guias/como-escrever-as-paginas-do-site). Se G4 aprovada: "Para ver um exemplo de
  organização, a [política de privacidade do CriaSite](/privacidade) segue essa ordem; use como referência, não como texto
  para copiar".
- **h2 Se o site tem anúncios do Google**: as regras do AdSense pedem que a política de privacidade informe que
  terceiros, incluindo o Google, usam cookies para exibir anúncios com base em visitas anteriores, e que diga como o
  visitante desativa a personalização. Confira a exigência atual na ajuda do AdSense (sem link: o externo do guia é a
  ANPD). Em 1 frase: o mesmo vale, em espírito, para qualquer ferramenta de terceiros que você instalar.
- **h2 Passo a passo** (`ol`): 1) liste tudo o que coleta dado no site: formulários, botões, scripts, plugins e
  incorporações; 2) para cada item, anote o dado, a finalidade, quem mais recebe e por quanto tempo fica guardado;
  3) corte o que não precisa (CPF no formulário de contato, data de nascimento sem motivo); 4) escreva a política em
  linguagem simples, seguindo a lista da seção anterior; 5) publique numa página própria, com link no rodapé de todas as
  páginas e perto do botão de enviar dos formulários; 6) crie um e-mail para pedidos sobre dados e responda quem
  escrever; 7) revise a política sempre que trocar uma ferramenta ou acrescentar um formulário; 8) em caso de dados
  sensíveis, loja, área de cliente ou público infantil, consulte um profissional.
- **h2 Erros comuns** (`ul`, 6): copiar a política de outro site (fala de dados e serviços que você não usa, e o texto é de
  outra pessoa); prometer o que o site não faz (escrever que não usa cookies e ter anúncios); pedir dados demais no
  formulário; política escondida, sem link no rodapé; nunca atualizar depois de instalar algo novo; e-mail de contato
  para pedidos sobre dados que ninguém lê.
- **h2 Perguntas frequentes**: Meu site é uma página só, com botão do WhatsApp; preciso de política? (se recebe contato,
  mede visitas ou mostra anúncio, há dados pessoais envolvidos; uma política curta e verdadeira é o jeito mais simples de
  ser transparente) · Posso usar um modelo pronto da internet? (como ponto de partida; cada item precisa bater com o que
  o seu site faz de verdade) · Preciso contratar um encarregado? (os negócios de pequeno porte em geral são dispensados,
  mas precisam de um canal de contato; confira as exceções na ANPD) · O que acontece se eu não tiver política? (a lei
  prevê sanções aplicadas pela ANPD; antes disso, visitantes e plataformas de anúncio esperam encontrar a página; sem
  números).
- **Fecho**: com a política escrita, falta o aviso de cookies → `/guias/aviso-de-cookies-no-site` e `/trilha#lancamento`.
- **Leia também**: `/guias/checklist-de-lancamento-do-site`.

### Guia 14 · Aviso de cookies

| Campo | Valor |
|---|---|
| title | Aviso de cookies no site: quando precisa e como fazer certo (59) |
| slug | `aviso-de-cookies-no-site` |
| excerpt | Nem todo cookie precisa de permissão, mas os de anúncio e de estatística de terceiros, em geral, sim. Veja quando o aviso é necessário, como montar e como testar se ele funciona. |
| meta_description | Veja quando o site precisa de aviso de cookies, como montar um banner com aceitar e recusar no mesmo destaque e como testar se os scripts esperam a escolha. (~156) |
| focus_keyword | aviso de cookies |
| tags | `["Cookies","LGPD","Privacidade"]` |
| level | 2 |
| Etapa da trilha | `lancamento` (etapa 7) |
| Ferramentas | nenhuma |
| Links internos | `/guias/politica-de-privacidade-para-site-pequeno`, `/cookies` (exemplo, se G4), `/guias/como-medir-as-visitas-do-site` (fecho), `/trilha#lancamento` (fecho), `/guias/wordpress-ou-construtor-de-sites` (leia também): 5 |
| Externo | `https://www.gov.br/anpd/pt-br` (o guia orientativo de cookies da ANPD fica lá) |

Esqueleto e pontos-chave:
- **Lide** (sem link): cookie é um arquivo pequeno que o site grava no navegador de quem visita. Alguns são necessários
  para o site funcionar; outros servem para medir visitas e mostrar anúncios, e esses costumam pedir a permissão do
  visitante. Ao final: que tipos existem, quando o aviso é necessário, como montar um aviso honesto e como testar se ele
  funciona de verdade.
- **quote**: o aviso jurídico padrão.
- **h2 Cookies e parentes, sem mistério**: cookie próprio (gravado pelo seu domínio) e de terceiros (gravado por outro
  domínio: anúncio, vídeo incorporado, botão de rede social); de sessão (some ao fechar o navegador) e persistente (fica
  por um tempo definido). O armazenamento local do navegador, pixels e outros identificadores funcionam de forma
  parecida e entram na mesma conta. A LGPD não cita cookies pelo nome, mas o cookie que identifica uma pessoa é dado
  pessoal; a ANPD publicou um guia orientativo só sobre o tema, no [site da ANPD](https://www.gov.br/anpd/pt-br).
- **h2 Quais precisam de permissão** (`ul` por categoria, cada item "Categoria: o que faz. Permissão: …"): essenciais
  (login, carrinho, segurança, lembrar a escolha feita no próprio aviso): em geral não pedem; preferências que a pessoa
  escolheu (idioma, favoritos): costumam não pedir, porque só guardam o que ela pediu; estatísticas: as de terceiros ou que
  identificam o visitante pedem, pela orientação mais segura; publicidade e personalização: pedem; incorporações (vídeo,
  mapa, post de rede social): gravam cookies do terceiro e entram na conta. Fechar: o enquadramento exato de cada caso
  depende do uso; na dúvida, peça a permissão ou consulte um profissional.
- **h2 Como deve ser um bom aviso** (`ul`): aparece na primeira visita sem tapar o conteúdo inteiro, principalmente no
  celular; explica em 2 ou 3 frases o que é coletado e para quê; aceitar e recusar com o mesmo destaque e o mesmo número
  de cliques; nada marcado de fábrica; escolha por categoria quando houver mais de um tipo; link para a política de
  cookies; dá para mudar de ideia depois (link no rodapé); a escolha fica guardada para o aviso não voltar a cada página.
  Conferir cada item no guia da ANPD antes de escrever (Parte F); o que não estiver lá vira "boa prática", não "regra".
  Se G4: 1 frase "a [política de cookies do CriaSite](/cookies) mostra uma tabela com tipo, para que serve e se pede
  permissão".
- **h2 O ponto que mais falha: o script que não espera**: o aviso só vale se os cookies não essenciais carregarem
  **depois** do aceite; muitos sites mostram o banner e já rodam anúncio e estatística por trás. Os recursos de aviso dos
  construtores e os plugins de aviso de cookies do WordPress fazem esse bloqueio quando configurados; algumas ferramentas
  do Google têm um modo de consentimento que ajusta o que as tags gravam conforme a escolha (confira na ajuda do Google
  como ligar). Como testar: aba anônima, F12, aba de aplicativo ou armazenamento, lista de cookies, antes de clicar em
  nada; depois recuse, recarregue e confira que não apareceu cookie de anúncio nem de estatística.
- **h2 Passo a passo** (`ol`): 1) descubra os cookies do site: aba anônima, F12, navegue por 3 páginas e anote o que
  aparece; 2) separe por categoria; 3) decida: só essenciais pede uma explicação na política; estatística de terceiros
  ou anúncio pede aviso com escolha; 4) ligue o aviso pelo recurso da sua plataforma ou por um plugin; 5) teste aceitar e
  recusar, como na seção anterior; 6) escreva a política de cookies com a lista por categoria e ligue ao aviso e ao rodapé;
  7) revise tudo ao instalar qualquer ferramenta nova.
- **h2 Erros comuns** (`ul`, 6): aviso só com o botão de aceitar; frase do tipo "ao continuar navegando, você aceita";
  recusar escondido numa segunda tela; scripts de anúncio carregando antes da escolha; banner que cobre a tela inteira no
  celular; política de cookies copiada, que lista cookies que o site nem usa.
- **h2 Perguntas frequentes**: Todo site precisa de aviso de cookies? (não necessariamente; se usa só os essenciais, basta
  explicar na política; com cookies não essenciais, aviso com escolha) · O aviso atrapalha no Google? (o Google lê o
  conteúdo da página; o que atrapalha a experiência é a janela que esconde tudo no celular, então prefira uma faixa) ·
  Uso só o Search Console; preciso de aviso? (o Search Console não instala nada no site, a verificação é pelo DNS; o que
  conta são os scripts instalados) · Contagem de visitas sem cookies precisa de aviso? (se não grava nada no aparelho e não
  identifica ninguém, em geral não pede permissão, mas deve aparecer na política).
- **Fecho**: com o aviso certo, dá para medir as visitas sem surpresa → `/guias/como-medir-as-visitas-do-site` e
  `/trilha#lancamento`.
- **Leia também**: `/guias/wordpress-ou-construtor-de-sites`.

### Guia 15 · Medir visitas

| Campo | Valor |
|---|---|
| title | Como medir as visitas do site: o que olhar e o que evitar (57) |
| slug | `como-medir-as-visitas-do-site` |
| excerpt | Search Console, estatísticas no site e o painel da hospedagem contam coisas diferentes. Veja o que cada um mostra, os números que importam e como medir os contatos. |
| meta_description | Como medir as visitas do site com o Search Console e uma ferramenta de estatística: o que olhar, como contar os contatos e o que muda na privacidade. (~149) |
| focus_keyword | como medir visitas do site |
| tags | `["Estatísticas","Search Console","Privacidade"]` |
| level | 1 |
| Etapa da trilha | `google` (etapa 5) |
| Ferramentas | [QR code](/ferramentas/qr-code) (link marcado para o balcão) |
| Links internos | `/guias/google-search-console-passo-a-passo`, `/ferramentas/qr-code`, `/guias/aviso-de-cookies-no-site`, `/trilha#google` (fecho), `/guias/manutencao-do-site-backup-e-atualizacoes` (fecho), `/guias/perfil-da-empresa-no-google` (leia também): 6 |
| Externo | nenhum |

Esqueleto e pontos-chave:
- **Lide** (sem link): saber quantas pessoas chegam, de onde vêm e o que procuram ajuda a decidir o que melhorar no site;
  para isso não é preciso um painel complicado nem várias ferramentas. O jeito de medir também muda o que você precisa
  contar na política e no aviso de cookies. Ao final: as três fontes de números, o que olhar e como medir os contatos.
- **h2 Três fontes, três números diferentes** (`h3` cada): Busca: o Search Console mostra o que acontece antes do clique
  (impressões, cliques e buscas) e não instala nada no site (link [Search Console](/guias/google-search-console-passo-a-passo));
  Estatísticas no site: uma ferramenta com um script conta visitas, páginas e origem, como o Google Analytics; há também
  ferramentas de estatística que não usam cookies e contam de forma agregada (categoria, sem nomes); Painel da hospedagem:
  conta os acessos ao servidor, inclusive robôs, então costuma mostrar números maiores. Fechar: nenhum é o número certo;
  cada um mede uma coisa.
- **h2 Os números que importam para um site pequeno** (`ul`): visitas por semana ou por mês (a tendência, não o dia);
  páginas mais vistas; de onde vêm (busca, redes sociais, acesso direto, outros sites); celular ou computador; as buscas
  que trazem gente (Search Console); e, acima de todos, as ações que viram cliente: cliques no WhatsApp, formulários
  enviados, ligações.
- **h2 Como medir os contatos**: o envio do formulário pode levar a uma página de obrigado, fácil de contar; o clique no
  botão do WhatsApp e no telefone pode ser marcado como evento na ferramenta de estatística (o nome muda de uma para
  outra: confira na ajuda dela). Link marcado: parâmetros no fim do endereço (utm_source, utm_medium e utm_campaign) dizem
  de onde a visita veio; use um link marcado diferente para a bio da rede social e para o [QR code](/ferramentas/qr-code) do
  balcão. Dica sem ferramenta: uma mensagem pronta diferente em cada botão do WhatsApp (por exemplo, Vi no Instagram) mostra
  a origem na própria conversa. **Atenção de SQL**: escrever os parâmetros sem `?`, `=` e `&` encadeados entre aspas;
  pode citar os nomes soltos.
- **h2 Medir sem invadir a privacidade** (`ul`): ferramenta que usa cookies pede aviso com escolha (link
  [aviso de cookies](/guias/aviso-de-cookies-no-site)); a que não usa cookies e conta de forma agregada simplifica o aviso,
  mas ainda entra na política; o endereço IP é dado pessoal; nunca mande e-mail, telefone ou nome do visitante para a
  ferramenta de estatística (por exemplo, no endereço da página de obrigado); colete só o que vai usar.
- **h2 Passo a passo** (`ol`): 1) cadastre o site no Search Console; 2) escolha uma ferramenta de estatística só;
  3) instale pelo recurso da sua plataforma ou pelo código que a ferramenta indicar; 4) ajuste o aviso de cookies se ela
  usar cookies; 5) marque os contatos como eventos; 6) crie links marcados para a bio e para o QR code; 7) uma vez por mês,
  anote 5 números numa planilha; 8) compare com o mês anterior e escolha uma melhoria por vez.
- **h2 Erros comuns** (`ul`, 6): olhar todo dia e se assustar com a variação; instalar três ferramentas que contam a mesma
  coisa (pesa no site e na privacidade); contar as próprias visitas (filtre o seu acesso ou use outro navegador); tomar o
  número do painel da hospedagem, com robôs, como visitas de gente; medir visitas e esquecer os contatos; instalar a
  estatística e esquecer o aviso de cookies.
- **h2 Perguntas frequentes**: Quantas visitas um site pequeno deveria ter? (não existe número certo; compare o site com
  ele mesmo, mês a mês) · Por que o Search Console e a estatística mostram números diferentes? (medem coisas diferentes:
  um a busca, o outro o que acontece no site) · Preciso de ferramenta paga? (não para começar) · Bloqueadores de anúncio
  escondem visitas? (parte delas; trate os números como aproximação).
- **Fecho**: medir mostra o que melhorar; a rotina de manutenção mantém o site de pé →
  `/guias/manutencao-do-site-backup-e-atualizacoes` e `/trilha#google`.
- **Leia também**: `/guias/perfil-da-empresa-no-google` (o perfil também mostra quantas pessoas pediram rota ou ligaram).

### Guia 16 · Manutenção e backup

| Campo | Valor |
|---|---|
| title | Manutenção do site: backup, atualizações e rotina mensal (56) |
| slug | `manutencao-do-site-backup-e-atualizacoes` |
| excerpt | Plugins pedem atualização, certificados e domínios vencem e backup sem teste pode não servir. Veja a rotina curta que evita a maior parte dos sustos depois do lançamento. |
| meta_description | Rotina de manutenção para site pequeno: backup que funciona, atualizações sem quebrar nada, renovações e uma lista do que conferir todo mês. (~140) |
| focus_keyword | manutenção de site |
| tags | `["Manutenção","Backup","WordPress"]` |
| level | 1 |
| Etapa da trilha | `lancamento` (etapa 7) |
| Ferramentas | [Está fora do ar?](/ferramentas/esta-fora-do-ar) (conferência do mês, mostra também a validade do certificado) |
| Links internos | `/guias/wordpress-ou-construtor-de-sites`, `/guias/https-e-certificado-ssl`, `/ferramentas/esta-fora-do-ar`, `/trilha#lancamento` (fecho), `/guias/site-fora-do-ar-o-que-fazer` (fecho), `/guias/checklist-de-lancamento-do-site` (leia também): 6 |
| Externo | nenhum |

Esqueleto e pontos-chave:
- **Lide** (sem link): site no ar não é site pronto para sempre. Plugins pedem atualização, domínio e certificado vencem,
  formulário quebra sem aviso, e um backup que nunca foi testado pode não servir na hora do aperto. Uma rotina curta,
  uma vez por mês, evita a maior parte desses sustos. Ao final: backup, atualizações, acessos e uma lista mensal,
  trimestral e anual.
- **h2 Backup: a cópia que salva o site**: o que copiar (arquivos, banco de dados e, se for o caso, os e-mails);
  regra prática 3-2-1 (três cópias, em dois lugares diferentes, uma delas fora da hospedagem); o backup automático da
  hospedagem é bom, mas fica no mesmo lugar do site; guarde várias versões, não só a última (uma invasão pode ser
  descoberta semanas depois); frequência conforme o quanto o site muda; teste a restauração pelo menos uma vez, num
  endereço de teste.
- **h2 Atualizações sem quebrar o site**: no WordPress, núcleo, tema e plugins; atualizações de segurança primeiro;
  backup antes de atualizar; em site maior, testar antes numa cópia (ambiente de teste); apagar plugin e tema que não
  usa (desativado continua sendo código no servidor). No construtor, a plataforma atualiza, mas integrações e aplicativos
  instalados merecem uma olhada. Link [WordPress ou construtor](/guias/wordpress-ou-construtor-de-sites).
- **h2 Acessos e renovações** (`ul`): domínio e hospedagem com renovação automática e cartão válido; certificado com
  renovação automática ligada (link [HTTPS e certificado](/guias/https-e-certificado-ssl)); senhas num gerenciador e
  verificação em duas etapas nos painéis; remover o acesso de quem já não trabalha no site; o e-mail cadastrado no
  registrador e na hospedagem é lido por alguém (é por ele que chegam os avisos de vencimento).
- **h2 A rotina em três listas**: `h3` Todo mês (`ul`): abrir o site no celular; enviar um formulário de teste; conferir
  erros no Search Console; aplicar as atualizações; confirmar que existe um backup recente; testar o endereço no
  [Está fora do ar?](/ferramentas/esta-fora-do-ar), que mostra também a validade do certificado. `h3` A cada três meses
  (`ul`): restaurar um backup num endereço de teste; revisar a lista de plugins; procurar links quebrados; medir a
  velocidade; revisar preços, horários e textos que mudaram; reler a política de privacidade. `h3` Uma vez por ano (`ul`):
  conferir datas e preços de renovação; trocar senhas importantes; revisar quem tem acesso a cada conta; reler as
  páginas principais.
- **h2 Erros comuns** (`ul`, 6): backup só na hospedagem; nunca testar a restauração; atualizar tudo de uma vez sem backup;
  manter plugin abandonado pelo autor; deixar o antigo prestador com acesso de administrador; ignorar o e-mail de aviso de
  vencimento.
- **h2 Perguntas frequentes**: Com que frequência fazer backup? (depende de quanto o site muda: loja e blog ativo pedem
  cópias frequentes; site institucional, a cada mudança e numa frequência fixa) · Posso ligar a atualização automática?
  (para as de segurança costuma valer a pena; nas grandes, faça backup antes) · Quanto tempo a rotina leva? (a mensal é
  curta quando vira hábito; o que toma tempo é consertar o que ninguém olhou; sem número) · Vale contratar manutenção?
  (se você não tem tempo, sim; peça por escrito o que está incluído e mantenha as contas no seu nome).
- **Fecho**: se um dia o site não abrir, o roteiro está no guia [site fora do ar](/guias/site-fora-do-ar-o-que-fazer) e a
  etapa na `/trilha#lancamento`.
- **Leia também**: `/guias/checklist-de-lancamento-do-site`.

### Guia 17 · Site fora do ar

| Campo | Valor |
|---|---|
| title | Site fora do ar: o que fazer, passo a passo (43) |
| slug | `site-fora-do-ar-o-que-fazer` |
| excerpt | Domínio vencido, DNS alterado, certificado, hospedagem ou uma atualização que deu errado: descubra se o site caiu para todos e siga o roteiro para achar a causa. |
| meta_description | Site fora do ar? Descubra se caiu para todos, entenda a mensagem do navegador e siga o roteiro para achar a causa: domínio, DNS, certificado ou hospedagem. (~155) |
| focus_keyword | site fora do ar |
| tags | `["Fora do ar","DNS","Hospedagem"]` |
| level | 2 |
| Etapa da trilha | `lancamento` (etapa 7) |
| Ferramentas | [Está fora do ar?](/ferramentas/esta-fora-do-ar) (1º passo) |
| Links internos | `/ferramentas/esta-fora-do-ar`, `/guias/como-escolher-o-dominio-do-site`, `/guias/https-e-certificado-ssl`, `/trilha#lancamento` (fecho), `/guias/manutencao-do-site-backup-e-atualizacoes` (fecho), `/guias/como-escolher-a-hospedagem-do-site` (leia também): 6 |
| Externo | `https://registro.br` |

Esqueleto e pontos-chave:
- **Lide** (sem link): site que não abre é urgência: o cliente não acha o telefone, o formulário não chega e o anúncio
  continua gastando. A causa quase sempre está numa lista curta: a internet de quem testa, o domínio, o DNS, o certificado,
  a hospedagem ou uma mudança recente no próprio site. Ao final: um roteiro em ordem para achar a causa e o que fazer em
  cada caso.
- **h2 Primeiro: caiu para todos ou só para você?**: teste no 4G, fora do Wi-Fi, ou noutro aparelho; teste de fora no
  [Está fora do ar?](/ferramentas/esta-fora-do-ar), que também traduz o código de resposta; se só você não consegue abrir,
  o problema está no caminho (cache do navegador, DNS da operadora, VPN, bloqueador). Texto próprio: **não** reaproveitar
  frases do `explain` da ferramenta (ferramenta-fora-do-ar.md, E2).
- **h2 O que a mensagem do navegador diz** (`ul`, cada item "Mensagem: causa provável"): endereço não encontrado (DNS:
  domínio vencido ou registros errados); conexão recusada ou tempo esgotado (servidor parado ou hospedagem com problema);
  aviso de certificado (vencido ou emitido para outro endereço); erro 500 (falha no próprio site, muitas vezes depois de
  atualizar um plugin); erros 502, 503 e 504 (servidor sobrecarregado, em manutenção ou sem resposta); erro 403 (permissão
  ou bloqueio); 404 numa página só (a página saiu ou mudou de endereço, o site está no ar).
- **h2 As causas mais comuns e o que fazer** (`h3` + `p` cada): Domínio vencido (confira no registrador, ou no
  [Registro.br](https://registro.br) para .br; renove e espere a propagação; ver [domínio](/guias/como-escolher-o-dominio-do-site));
  DNS alterado (alguém mexeu nos registros ao trocar de e-mail ou de hospedagem: desfaça a última mudança); Hospedagem
  (veja no painel se o plano está ativo, se há aviso de pagamento ou de limite de uso, e abra chamado); Certificado
  (renovação automática desligada ou certificado sem a versão com www; ver [HTTPS](/guias/https-e-certificado-ssl));
  Atualização que deu errado (erro 500 logo depois de atualizar: restaure o backup ou desative o último plugin pelo
  gerenciador de arquivos da hospedagem); Invasão (páginas estranhas, redirecionamento para outro site, aviso de segurança
  no Search Console: troque as senhas, restaure um backup limpo e peça ajuda ao suporte).
- **h2 Passo a passo** (`ol`): 1) teste de fora; 2) anote a mensagem exata e o horário; 3) procure e-mails de cobrança ou
  de vencimento; 4) veja o painel da hospedagem; 5) confira se o domínio está ativo e apontando para a hospedagem;
  6) desfaça a última mudança, se houve uma; 7) abra chamado no suporte com a mensagem, o horário e o que já testou;
  8) se demorar, avise os clientes pelas redes e pelo WhatsApp.
- **h2 Erros comuns** (`ul`, 5 a 6): mexer em várias coisas ao mesmo tempo (fica impossível saber o que resolveu); apagar
  registros do DNS no desespero; reinstalar tudo sem backup; esperar sem abrir chamado; esquecer que o e-mail do domínio
  também pode ter parado; não anotar o que aconteceu.
- **h2 Perguntas frequentes**: Quanto tempo leva para voltar depois de renovar o domínio? (de minutos a algumas horas,
  pela propagação do DNS) · Perdi posição no Google? (uma queda curta raramente deixa marca; quedas longas ou repetidas
  podem fazer o Google visitar menos e tirar páginas do índice até o site voltar; sem prazo) · Como saber quando cair de
  novo? (serviços de monitoramento testam o site de tempos em tempos e avisam por e-mail; alguns planos de hospedagem
  incluem; sem nomes) · O e-mail também parou, é o mesmo problema? (se o domínio venceu ou o DNS mudou, provavelmente sim).
- **Fecho**: depois que voltar, ajuste a rotina para não repetir → `/guias/manutencao-do-site-backup-e-atualizacoes` e
  `/trilha#lancamento`.
- **Leia também**: `/guias/como-escolher-a-hospedagem-do-site`.

## C. Publicação, ordem e código

### C.1 `published_at` (relativo ao momento em que a migration roda; todos no passado)

| Guia | published_at |
|---|---|
| 17 Site fora do ar | `UTC_TIMESTAMP() - INTERVAL 45 HOUR - INTERVAL 10 MINUTE` |
| 15 Medir visitas | `UTC_TIMESTAMP() - INTERVAL 34 HOUR - INTERVAL 35 MINUTE` |
| 16 Manutenção | `UTC_TIMESTAMP() - INTERVAL 22 HOUR - INTERVAL 50 MINUTE` |
| 14 Cookies | `UTC_TIMESTAMP() - INTERVAL 11 HOUR - INTERVAL 20 MINUTE` |
| 13 Privacidade | `UTC_TIMESTAMP() - INTERVAL 2 HOUR - INTERVAL 40 MINUTE` |

A home ("Guias novos", 3 mais recentes) mostra Privacidade, Cookies e Manutenção. Todos no passado: os links entre eles
e os da 013 funcionam desde o primeiro minuto (Decisão G7).

### C.2 Forma do `012_guias_leva3.sql`

Igual à `006_guias_leva2.sql` (colunas com `image_url` e `image_alt`, `tag` NULL). Cabeçalho:
```sql
-- CriaSite · migration 012 · terceira leva de guias (privacidade e LGPD, aviso de cookies, medir visitas, manutenção, site fora do ar)
-- Escritos à mão (origem 'manual'). Revise e edite em /admin → Matérias.
-- INSERT IGNORE: se já existir um guia com o mesmo endereço (seção + slug), nada é sobrescrito.
-- Capas em public/capas/ (scripts/make-capas.mjs). Datas relativas ao momento em que a migration roda (últimas ~48 h).
```
Script temporário fora do repositório (pasta temporária do sistema), o mesmo das levas anteriores, com: lista branca da
seção A (ajustes 5 e 6); **erro** abaixo de 800 ou acima de 1.100 palavras, aviso fora de 850 a 1.000; no máximo 1
externo; `image_alt` importado de `CAPAS` (`import { CAPAS } from "<caminho>/scripts/make-capas.mjs"`); `public/capas/<slug>.webp`
existe para os 5; no 13 e no 14, `body[1]` é `quote` com o texto exato do aviso.
**Avisos de fatos** (listar, sem abortar, para o executor revisar): `\d+ ?%`, `R\$`, `multa`, `artigo`, `art\. ?\d`,
`\d+ dias`, `\d+ horas`, `garant`, `conformidade`, `100%`, `aprovad`, `hoje`, `atualmente`, `recentemente`, `20\d\d`
(exceto `13.709/2018`), e qualquer nome de empresa fora de Google, WordPress, ANPD e Registro.br (lista de suspeitos:
`Hostinger`, `Cloudflare`, `Wix`, `Meta`, `Facebook`, `Microsoft`). Exceções aceitas: `WhatsApp` como canal de contato
(os guias antigos já usam) e `Instagram` só no exemplo da mensagem pronta do guia 15 (Vi no Instagram).
Apagar o script depois de gerar.

### C.3 `GUIDE_ORDER` (`app/lib/site.ts`)

Inserir `"como-medir-as-visitas-do-site"` logo depois de `"google-search-console-passo-a-passo"`, e logo depois de
`"checklist-de-lancamento-do-site"` (antes do comentário dos guias de IA), nesta ordem:
`"politica-de-privacidade-para-site-pequeno"`, `"aviso-de-cookies-no-site"`, `"manutencao-do-site-backup-e-atualizacoes"`,
`"site-fora-do-ar-o-que-fazer"`. Nada mais muda em `site.ts` (nem `TRAIL`).

---

## D. Capas (5 artes novas, mesma moldura)

Linguagem igual à de [capas.md](capas.md): janela branca com sombra laranja sobre marinho pontilhado e a **régua da
trilha** (7 pontos) com a etapa acesa. Sem texto, sem degradê, sem pessoas. Tokens da seção C de capas.md
(`N=#0c1a4b`, `L=#ff7a1a`, `LC=#ff9a4d`, `#eef1fb`, `#dde3f6`, `#cdd5ef`, `#2a3c80`, `#c24e06`, `#3ee0b0`). Tudo dentro
de x 400 a 800, y 225 a 450; `stroke-linecap` e `stroke-linejoin` `round` (o `<g>` já leva). O executor pode mover até
12 px sem pedir (regra de capas.md).

**`privacidade`** (guia 13: folha da política + escudo com cadeado)
- Folha: `rect x=440 y=240 w=180 h=190 rx=14 fill=#eef1fb stroke=N sw=4`; título `rect x=462 y=262 w=110 h=14 rx=7 fill=N`;
  linhas `rect x=462 w=136 h=8 rx=4 fill=#cdd5ef` em y = 292, 310, 328 e `rect x=462 y=346 w=96 h=8 rx=4 fill=#cdd5ef`;
  item marcado `rect x=462 y=372 w=20 h=20 rx=5 fill=L` + `path M466 382 l4 4 l8 -9 stroke=#fff sw=3 fill=none` +
  `rect x=490 y=378 w=90 h=8 rx=4 fill=N`.
- Escudo: `path M700 250 l66 24 v50 c0 44 -28 76 -66 90 c-38 -14 -66 -46 -66 -90 v-50 Z fill=N`.
- Cadeado no escudo: arco `path M684 326 v-12 a16 16 0 0 1 32 0 v12 fill=none stroke=LC sw=6`; corpo
  `rect x=676 y=322 w=48 h=40 rx=8 fill=L`; fechadura `circle cx=700 cy=338 r=5 fill=N` + `rect x=698 y=340 w=4 h=12 rx=2 fill=N`.

**`cookie`** (guia 14: biscoito, interruptores e aviso com dois botões iguais)
- Biscoito: `circle cx=500 cy=300 r=62 fill=LC`; mordida `circle cx=552 cy=256 r=22 fill=#ffffff`; gotas `circle r=8 fill=#c24e06`
  em (478,282), (514,318), (470,330), (526,292).
- Interruptores: `rect x=620 y=262 w=56 h=30 rx=15 fill=#3ee0b0` + `circle cx=661 cy=277 r=11 fill=#fff` + linha
  `rect x=690 y=273 w=80 h=8 rx=4 fill=N`; `rect x=620 y=310 w=56 h=30 rx=15 fill=#cdd5ef` + `circle cx=635 cy=325 r=11 fill=#fff`
  + linha `rect x=690 y=321 w=64 h=8 rx=4 fill=#cdd5ef`.
- Aviso: `rect x=420 y=380 w=360 h=58 rx=14 fill=N`; linhas `rect x=440 y=396 w=120 h=8 rx=4 fill=#2a3c80` e
  `rect x=440 y=412 w=90 h=8 rx=4 fill=#2a3c80`; **dois botões iguais** `rect y=394 w=76 h=30 rx=15 fill=LC` em x = 600 e 688
  (mesmo tamanho e cor de propósito: é a regra do guia).

**`visitas`** (guia 15: cartões de números + barras das páginas mais vistas)
- 3 cartões `rect y=240 w=106 h=64 rx=10 fill=#eef1fb stroke=#dde3f6 sw=2` em x = 420, 547, 674; em cada um, número
  `rect x+14 y=256 w=52 h=16 rx=8` (`fill=N`; o do meio `fill=L`) e legenda `rect x+14 y=282 w=72 h=8 rx=4 fill=#cdd5ef`.
- 3 barras: fundo `rect x=420 w=360 h=18 rx=9 fill=#dde3f6` em y = 330, 362, 394; preenchimento por cima, mesmo `x`, `h` e `rx`:
  y=330 `w=250 fill=L`; y=362 `w=170 fill=N`; y=394 `w=110 fill=N`.

**`backup`** (guia 16: duas unidades e setas de cópia)
- Unidade 1: `rect x=430 y=270 w=130 h=150 rx=16 fill=N`; ranhuras `rect x=450 w=90 h=10 rx=5 fill=#2a3c80` em y = 296 e 316;
  luz `circle cx=530 cy=394 r=8 fill=#3ee0b0`.
- Unidade 2 (a cópia): `rect x=640 y=270 w=130 h=150 rx=16 fill=#eef1fb stroke=N sw=4`; ranhuras `rect x=660 w=90 h=10 rx=5 fill=#cdd5ef`
  em y = 296 e 316; luz `circle cx=740 cy=394 r=8 fill=L`.
- Setas: `path M572 320 H626 M614 308 l12 12 l-12 12 stroke=L sw=6 fill=none` e
  `path M628 370 H574 M586 358 l-12 12 l12 12 stroke=LC sw=6 fill=none`.

**`foradoar`** (guia 17: alerta + plugue desconectado)
- Alerta: `path M600 238 L666 350 H534 Z fill=L stroke=L sw=10` (o `linejoin=round` arredonda as pontas); exclamação
  `rect x=594 y=272 w=12 h=44 rx=6 fill=#fff` + `circle cx=600 cy=332 r=7 fill=#fff`.
- Plugue: cabo `path M420 404 H470 stroke=N sw=8`; corpo `rect x=470 y=384 w=60 h=40 rx=10 fill=N`; pinos
  `rect x=530 w=22 h=7 rx=3 fill=N` em y = 392 e 409.
- Tomada: `rect x=650 y=380 w=70 h=48 rx=12 fill=#eef1fb stroke=N sw=4`; furos `rect x=662 w=10 h=7 rx=3 fill=N` em y = 392 e 409;
  cabo `path M720 404 H780 stroke=N sw=8`.
- Faísca no vão: `path M584 404 l10 -10 l10 20 l10 -10 l10 10 stroke=LC sw=5 fill=none`.

**Entradas em `CAPAS`** (depois das 6 da 2ª leva, antes do bloco de IA):

| slug | etapa | arte | alt |
|---|---|---|---|
| `politica-de-privacidade-para-site-pequeno` | lancamento | privacidade | Ilustração de uma folha de política com linhas de texto e um item marcado em laranja, ao lado de um escudo azul-marinho com um cadeado laranja. |
| `aviso-de-cookies-no-site` | lancamento | cookie | Ilustração de um biscoito mordido, dois interruptores de preferência e um aviso de cookies com dois botões do mesmo tamanho, dentro de uma janela de navegador. |
| `como-medir-as-visitas-do-site` | google | visitas | Ilustração de um painel de estatísticas com três cartões de números e barras horizontais das páginas mais vistas, a primeira em laranja. |
| `manutencao-do-site-backup-e-atualizacoes` | lancamento | backup | Ilustração de duas unidades de armazenamento lado a lado, uma azul-marinho e outra clara, ligadas por setas laranja de cópia nos dois sentidos. |
| `site-fora-do-ar-o-que-fazer` | lancamento | foradoar | Ilustração de um triângulo de alerta laranja sobre um plugue azul-marinho desconectado da tomada, com uma faísca no espaço entre os dois. |

Gerar: `node scripts/make-capas.mjs politica-de-privacidade-para-site-pequeno aviso-de-cookies-no-site como-medir-as-visitas-do-site manutencao-do-site-backup-e-atualizacoes site-fora-do-ar-o-que-fazer --folha`.
Critério de pronto: 5 arquivos 1200×675, todos < 60 KB; na folha, as 5 parecem da mesma família das 12 clássicas (mesma
janela, sombra e régua; ponto aceso no 7 em quatro delas e no 5 na de visitas); o desenho se lê na miniatura de 60 px
(abrir a folha a 25% de zoom: biscoito, escudo, barras, duas caixas e triângulo reconhecíveis).

---

## E. Links dos guias antigos para os novos (`013_links_leva3.sql`)

Modelo: `010_links_orcamento.sql`. Regras: `SET NAMES utf8mb4;`; `JSON_ARRAY_INSERT(body, '$[N]', JSON_OBJECT('type', 'p', 'text', '…'))`
(nunca `CAST AS JSON`; vale em MySQL 8 e MariaDB); inserir **no índice do bloco âncora** (o parágrafo entra logo antes
dele); guarda por âncoras com `JSON_UNQUOTE(JSON_EXTRACT(body, '$[N].text')) = '…'`; `CAST(body AS CHAR) NOT LIKE '%<url nova>%'`;
**não alterar `updated_at`** (um link não é revisão); `AND updated_at IS NULL` em todos, **exceto hospedagem** (a 004 já
gravou `updated_at`; ali a guarda são três âncoras). Se algo não bater, nada acontece e o parágrafo entra pelo painel.
Quando um guia ganha 2 parágrafos, um único `UPDATE` com os pares em **ordem decrescente de índice** (o MySQL e o MariaDB
avaliam os pares da esquerda para a direita, então inserir primeiro o índice maior não desloca o menor).

Índices conferidos lendo 003, 004, 006 e 008, já com os parágrafos da 010:

| # | guia (slug) | inserir em | âncoras (`$[N].text`) | link novo |
|---|---|---|---|---|
| E1 | `como-escolher-o-dominio-do-site` | `$[15]` (fim de Erros comuns) | `[13]='Erros comuns'`, `[15]='Perguntas frequentes'` | fora do ar (guia + ferramenta) |
| E2 | `como-escolher-a-hospedagem-do-site` | `$[14]` (fim de Disponibilidade) | `[12]='Disponibilidade: quanto tempo o site fica no ar'`, `[14]='Quanto custa'`, `[17]='Uma nota de transparência'` | fora do ar (ferramenta + guia) |
| E3 | `https-e-certificado-ssl` | `$[25]` (depois da FAQ "O certificado vence?") | `[23]='O certificado vence?'`, `[25] LIKE 'Com o cadeado ativo%'` | ferramenta + manutenção |
| E4 | `checklist-de-lancamento-do-site` | `$[11]` e `$[9]` | `[7]='Google e privacidade'`, `[9]='Garantias para o dia seguinte'`, `[11]='Faça um ensaio geral antes de avisar'` | privacidade; manutenção + ferramenta |
| E5 | `como-escrever-as-paginas-do-site` | `$[15]` (fim de Página de contato) | `[12]='Página de contato'`, `[15]='Passo a passo'` | privacidade |
| E6 | `google-search-console-passo-a-passo` | `$[30]` (depois da FAQ do Analytics) | `[28]='Qual é a diferença para o Google Analytics?'`, `[30]='E o Bing?'` | medir visitas |
| E7 | `wordpress-ou-construtor-de-sites` | `$[5]` (fim de Comparação) | `[3]='Comparação pelo que importa'`, `[5]='E o SEO?'` | manutenção |
| E8 | `seguranca-ao-criar-site-com-ia` | `$[17]` (fim de Se uma chave vazar) | `[15]='Se uma chave ou senha vazar'`, `[17]='Erros comuns'` | privacidade |

E1, E2, E3 e E4 fecham a pendência da Parte D, item 5, de [ferramenta-fora-do-ar.md](ferramenta-fora-do-ar.md) (o link do
checklist vai em "Garantias para o dia seguinte", e não no item de HTTPS, porque é ali que o leitor pensa no "e se cair").

**SQL exato** (colar no arquivo depois do cabeçalho; o executor só confere os índices pela simulação do passo 9):
```sql
-- CriaSite · migration 013 · links dos guias antigos para a 3ª leva (privacidade, manutenção, medir visitas, site fora do ar) e para o "Está fora do ar?"
-- 8 guias ganham 1 parágrafo (o checklist ganha 2), logo antes do bloco indicado. Um link não é revisão: esta migration NÃO mexe em updated_at.
-- Segurança: só entra se os blocos âncora forem os esperados e se o link novo ainda não existir; guias editados no painel (updated_at preenchido)
-- ficam de fora, exceto o de hospedagem, cujo updated_at veio da migration 004 (ali a guarda são três âncoras). JSON_ARRAY_INSERT só insere.
-- Usa JSON_OBJECT (e não CAST AS JSON) para valer em MySQL 8 e em MariaDB. Se algo não bater, nada acontece: inclua o parágrafo pelo painel.

SET NAMES utf8mb4;

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[15]', JSON_OBJECT('type', 'p', 'text', 'Se um dia o site e o e-mail pararem juntos, o domínio vencido é um dos primeiros suspeitos. O [Está fora do ar?](/ferramentas/esta-fora-do-ar) mostra se o endereço ainda aparece no DNS, e o guia [site fora do ar: o que fazer](/guias/site-fora-do-ar-o-que-fazer) lista o resto do que conferir.'))
 WHERE section = 'guias' AND slug = 'como-escolher-o-dominio-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[13].text')) = 'Erros comuns'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[15].text')) = 'Perguntas frequentes'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/site-fora-do-ar-o-que-fazer%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[14]', JSON_OBJECT('type', 'p', 'text', 'Para saber se o site caiu para todo mundo ou só para você, use o [Está fora do ar?](/ferramentas/esta-fora-do-ar). Se caiu mesmo, o guia [site fora do ar](/guias/site-fora-do-ar-o-que-fazer) mostra o que fazer em cada caso.'))
 WHERE section = 'guias' AND slug = 'como-escolher-a-hospedagem-do-site'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[12].text')) = 'Disponibilidade: quanto tempo o site fica no ar'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[14].text')) = 'Quanto custa'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[17].text')) = 'Uma nota de transparência'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/site-fora-do-ar-o-que-fazer%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[25]', JSON_OBJECT('type', 'p', 'text', 'Para conferir a validade do certificado sem abrir o painel, teste o endereço no [Está fora do ar?](/ferramentas/esta-fora-do-ar). A renovação, o backup e as outras tarefas de rotina estão no guia de [manutenção do site](/guias/manutencao-do-site-backup-e-atualizacoes).'))
 WHERE section = 'guias' AND slug = 'https-e-certificado-ssl' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[23].text')) = 'O certificado vence?'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[25].text')) LIKE 'Com o cadeado ativo%'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/manutencao-do-site-backup-e-atualizacoes%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body,
       '$[11]', JSON_OBJECT('type', 'p', 'text', 'Depois do lançamento, a rotina de backup, atualizações e renovações está no guia de [manutenção do site](/guias/manutencao-do-site-backup-e-atualizacoes). Se um dia o site não abrir, comece pelo [Está fora do ar?](/ferramentas/esta-fora-do-ar).'),
       '$[9]', JSON_OBJECT('type', 'p', 'text', 'Para escrever a política e decidir se o site precisa de aviso de cookies, veja o guia de [política de privacidade para site pequeno](/guias/politica-de-privacidade-para-site-pequeno), que explica a LGPD sem juridiquês.'))
 WHERE section = 'guias' AND slug = 'checklist-de-lancamento-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[7].text')) = 'Google e privacidade'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[9].text')) = 'Garantias para o dia seguinte'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[11].text')) = 'Faça um ensaio geral antes de avisar'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/politica-de-privacidade-para-site-pequeno%'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/manutencao-do-site-backup-e-atualizacoes%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[15]', JSON_OBJECT('type', 'p', 'text', 'O formulário recolhe dados pessoais, como nome e telefone. Diga perto do botão de enviar para que eles servem e ponha o link da política de privacidade: o guia de [política de privacidade para site pequeno](/guias/politica-de-privacidade-para-site-pequeno) mostra o que escrever.'))
 WHERE section = 'guias' AND slug = 'como-escrever-as-paginas-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[12].text')) = 'Página de contato'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[15].text')) = 'Passo a passo'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/politica-de-privacidade-para-site-pequeno%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[30]', JSON_OBJECT('type', 'p', 'text', 'Para escolher como medir as visitas, e o que isso muda na privacidade de quem chega, veja o guia [como medir as visitas do site](/guias/como-medir-as-visitas-do-site).'))
 WHERE section = 'guias' AND slug = 'google-search-console-passo-a-passo' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[28].text')) = 'Qual é a diferença para o Google Analytics?'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[30].text')) = 'E o Bing?'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/como-medir-as-visitas-do-site%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[5]', JSON_OBJECT('type', 'p', 'text', 'Se a escolha for o WordPress, a rotina de atualizações e backup que ele pede está no guia de [manutenção do site](/guias/manutencao-do-site-backup-e-atualizacoes).'))
 WHERE section = 'guias' AND slug = 'wordpress-ou-construtor-de-sites' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[3].text')) = 'Comparação pelo que importa'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[5].text')) = 'E o SEO?'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/manutencao-do-site-backup-e-atualizacoes%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[17]', JSON_OBJECT('type', 'p', 'text', 'Para entender o que a LGPD pede de um site pequeno no dia a dia, como a política de privacidade e um canal para quem quer saber dos próprios dados, veja o guia de [política de privacidade para site pequeno](/guias/politica-de-privacidade-para-site-pequeno).'))
 WHERE section = 'guias' AND slug = 'seguranca-ao-criar-site-com-ia' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[15].text')) = 'Se uma chave ou senha vazar'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[17].text')) = 'Erros comuns'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/politica-de-privacidade-para-site-pequeno%';
```

**Links dos guias novos para as ferramentas** (já nos esqueletos da Parte B): Está fora do ar? (guias 16 e 17), QR code
(guia 15). Nenhuma outra ferramenta entra à força. A trilha não muda; os novos chegam pela `/guias`, pela busca, pela home
e pelos 9 parágrafos acima.

---

## F. Fontes oficiais a conferir (antes de escrever cada guia)

Ler na fonte, anotar o trecho que sustenta cada afirmação e escrever com palavras próprias. Se a fonte não confirmar,
tirar a frase.

| Afirmação nos guias | Onde conferir |
|---|---|
| Definições de dado pessoal, dado sensível, tratamento, titular, encarregado; quem a lei alcança e a exceção do uso particular sem fim econômico; princípios; bases legais; direitos do titular; existência de sanções | Lei 13.709/2018 no Planalto (`https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm`), artigos 1 a 7, 11, 18, 41 e 52. Sem link no texto. |
| Regras para agentes de pequeno porte: quem são, dispensa de encarregado com canal de comunicação, exceções de alto risco | Resolução CD/ANPD nº 2/2022, no site da ANPD (`https://www.gov.br/anpd/pt-br`, área de legislação/regulamentações). Conferir se houve resolução posterior que mude algo. |
| Cookies como dado pessoal, categorias, boas práticas do aviso (rejeitar com a mesma facilidade, nada pré-marcado, por categoria, revogação) | Guia orientativo "Cookies e proteção de dados pessoais" da ANPD (área de documentos e publicações do site da ANPD). |
| Segurança básica para pequeno negócio (citada no guia 16 só como princípio) | Guia orientativo de segurança da informação para agentes de tratamento de pequeno porte (ANPD). |
| AdSense pede política de privacidade com informação sobre cookies de terceiros e como desativar a personalização | Ajuda do AdSense (`https://support.google.com/adsense`), políticas do programa e "conteúdo obrigatório" / política de privacidade. |
| Modo de consentimento das ferramentas do Google | Ajuda do Google sobre o modo de consentimento (`https://support.google.com` e `https://developers.google.com/tag-platform`). Citar só como "algumas ferramentas do Google têm…". |
| Janela que esconde o conteúdo no celular atrapalha a experiência | Documentação da Busca (`https://developers.google.com/search/docs`), página sobre pop-ups intrusivos. |
| Search Console não instala nada no site (verificação por DNS); números com atraso | Ajuda do Search Console e o guia 11 já publicado. |
| Eventos e parâmetros de campanha (utm) | Ajuda do Google Analytics (`https://support.google.com/analytics`). Nomes de menu não são copiados. |
| Domínio .br vencido e consulta do domínio | `https://registro.br` (sem citar dias de congelamento). |

---

## G. Decisões para o dono (responda "ok" para aprovar todas as recomendações)

1. **Temas**: os 5 deste plano (privacidade e LGPD, aviso de cookies, medir visitas, manutenção e backup, site fora do ar),
   deixando a 2ª leva de IA para meados de dezembro, depois de 4 semanas de dados do Search Console, como já estava
   planejado. **Recomendo ok**: são buscas perenes do mesmo público e fecham o ciclo do site (lançar, medir, manter,
   consertar).
2. **Privacidade e cookies em 2 guias, não 1.** **Recomendo separar**: são buscas diferentes, e um guia só passaria de
   1.100 palavras ou ficaria raso nos dois.
3. **Aviso jurídico** em bloco de destaque no topo dos guias 13 e 14, com o texto da seção A (ajuste 2). **Recomendo ok**,
   sem colocar o aviso nos outros 3 (não são tema jurídico).
4. **Citar `/privacidade` e `/cookies` do CriaSite como exemplo** (1 link em cada guia legal). **Recomendo ok, depois que
   você aprovar o texto novo dessas páginas** (já está em "Pendências suas"); se não aprovar antes da execução, o
   executor tira esses 2 links e o resto do plano não muda.
5. **Nomes de empresas**: só Google e os produtos dele que são o assunto, o software WordPress, ANPD e Registro.br; nenhum
   plugin, serviço de banner, ferramenta de estatística alternativa ou serviço de monitoramento por nome. **Recomendo ok.**
6. **Capas**: 5 artes novas no mesmo esquema (Parte D), mostradas na folha de contato no fim da execução, sem parar
   antes. Alternativa: reaproveitar artes existentes (`cadeado`, `servidor`, `grafico`), mais rápido, mas guias diferentes
   ficariam com a mesma imagem. **Recomendo artes novas.**
7. **Publicar os 5 de uma vez** (datas nas últimas 48 h), como nas outras levas. **Recomendo ok** (links nunca dão 404).
8. **Links nos guias antigos por migration (013)**, sem mudar `updated_at`, só em guia não editado no painel (exceto
   hospedagem, protegido por âncoras), como a 010. **Recomendo ok.**
9. **Externo**: só o site da ANPD nos guias legais (a lei citada pelo número, sem link). **Recomendo ok**: a página da
   ANPD é mais útil para o leigo do que o texto da lei.
10. **Revisão**: publicar direto, e você lê os guias 13 e 14 em até 3 dias pelo painel, antes de pedir o AdSense (a
    política editorial diz "revisão humana"). Não é preciso advogado: os guias não dão orientação para um caso concreto e
    têm o aviso. **Recomendo ok.**
11. **As páginas `/privacidade` e `/cookies` ganham link para os guias?** **Recomendo não**: página legal fica só com o
    que vale para o CriaSite; os guias já apontam para elas.

---

## Passos

1. Confirmar com o dono as decisões da Parte G (um "ok" basta). Se G4 não for aprovada, tirar `/privacidade` e `/cookies`
   da lista branca e dos esqueletos.
2. Conferir que a última migration é a 011 (senão, renumerar 012/013) e que nenhum dos 9 guias da Parte E tem
   `updated_at` preenchido em produção além da hospedagem: abrir cada um no site e ver se aparece "Atualizado em" (só a
   hospedagem deve mostrar). Anotar os que mostrarem: esses vão pelo painel no passo 14.
3. Conferir as fontes da Parte F e as URLs externas com `curl -sSIL -A "Mozilla/5.0"`; anotar os trechos que sustentam
   cada afirmação.
4. Ler `app/lib/types.ts` (tipo `Block`) e um guia da 006 como exemplo de tom.
5. Escrever os 5 guias na ordem 13, 14, 15, 16, 17 seguindo a Parte B, mirando 850 a 1.000 palavras.
6. Montar o script temporário (C.2) e gerar `db/migrations/012_guias_leva3.sql`; rodar até passar em todas as validações;
   imprimir a tabela (slug, palavras, read_minutes, title, meta, internos, externos, avisos de fatos) e revisar cada aviso.
7. Caminho inverso: desfazer `''` → `'` e `JSON.parse` nos 5 bodies (ou, com MySQL/MariaDB local, `npm run db:migrate` num
   banco de teste e `SELECT slug, JSON_VALID(body), image_url FROM posts WHERE section='guias'`: 25 linhas, todas 1).
8. Capas: acrescentar as 5 artes em `ARTES` e as 5 entradas em `CAPAS` (Parte D); gerar com `--folha`; conferir o
   critério de pronto da Parte D.
9. Escrever `db/migrations/013_links_leva3.sql` com o SQL da Parte E. **Simular** num script temporário: ler os bodies das
   migrations 003, 004 (hospedagem), 006 e 008, aplicar em JS os inserts da 010 nos mesmos índices, depois conferir cada
   âncora da 013 e aplicar os inserts; imprimir, por guia, o índice e o texto da âncora e o número de links internos antes
   e depois. Todas as âncoras devem bater. Com banco local, rodar 003 a 013 e conferir com `SELECT slug, JSON_LENGTH(body)`.
10. `GUIDE_ORDER` em `app/lib/site.ts` (C.3).
11. `npm run typecheck` e `npm run build` sem erro.
12. Atualizar `docs/guias-leva3.md` (status, palavras por guia, links aplicados), `docs/ferramenta-fora-do-ar.md`
    (Parte D, item 5: feito pela 013), `docs/README.md` (status, Próximos passos, Pendências suas) e `docs/decisoes.md`.
13. Commit `feat: 3ª leva de guias (privacidade, cookies, visitas, manutenção, fora do ar) + links nos guias antigos`
    com 012, 013, as 5 capas, `make-capas.mjs` e `site.ts`; push. Na resposta ao dono: a tabela de validação, a folha de
    capas, o cabeçalho e os slugs da 012 e **o SQL inteiro da 013** (é curto; regra da casa), avisando que o servidor
    aplica sozinho.
14. Depois do deploy: "Como verificar"; para cada parágrafo da Parte E que não apareceu, inserir pelo painel com o texto
    exato da Parte E, na mesma posição.

## Riscos e cuidados

- **Promessa legal** é o risco mais caro (AdSense e leitor). O script lista as palavras suspeitas; na dúvida, reescrever
  como "ajuda a ser transparente". Nunca "em conformidade".
- **Fato errado sobre a LGPD ou a ANPD**: só afirmar o que a fonte da Parte F confirma; regra para pequeno porte sempre com
  "confira a regra atual". Sem valores de multa, sem prazos.
- **Índices da 013**: se o dono editou um guia no painel, a guarda `updated_at IS NULL` pula o guia (correto); se editou a
  hospedagem mexendo nas seções de Disponibilidade a Nota, as 3 âncoras não batem e nada acontece. O passo 9 simula a cadeia
  inteira antes do commit; o passo 14 confere em produção.
- **Ordem das migrations**: a 013 depende de a 010 já ter rodado (rodou: conferido em 2026-11-19). A 012 vem antes da 013,
  então os links novos nunca apontam para guia inexistente.
- **Aspas e barras no JSON**: os guias 14 e 15 tentam a usar mensagens de botão, nomes de parâmetro e trechos de código.
  Escrever sem aspas ASCII, sem `\`, e com os parâmetros soltos (utm_source), sem montar a URL inteira.
- **Cópia**: o guia 17 não pode repetir o `explain` da ferramenta "Está fora do ar?"; os guias 13 e 14 não podem repetir as
  páginas `/privacidade` e `/cookies`. Conteúdo duplicado é o que o AdSense penaliza.
- **Capa ausente** = imagem quebrada: o script da 012 valida os 5 `.webp`; conferir `git status` (5 arquivos novos em
  `public/capas/`, nenhuma folha nem `teste-*`).
- **Migration roda uma vez**: correção depois do deploy é pelo painel ou nova migration. INSERT IGNORE engole truncamento:
  o script valida os tamanhos (title ≤ 300, excerpt ≤ 600, meta ≤ 200, focus_keyword ≤ 120, image_alt ≤ 300).
- `featured=0` e `updated_at=NULL` nos 5. Sem coluna `coins`. React Router: `npm run build` antes do push (nada aqui mexe
  em loader).

## Como verificar

- Tabela do script: 5 linhas, 800 a 1.100 palavras (alvo 850 a 1.000), `read_minutes` 5, 3 a 6 internos, ≤ 1 externo,
  `quote` com o aviso nos guias 13 e 14, zero aviso de fatos sem revisão.
- Simulação da 013: 8 UPDATE com todas as âncoras batendo; 9 parágrafos inseridos; nenhuma URL repetida no mesmo guia.
- `npm run build` sem erro.
- Produção, depois do deploy:
  - `/guias` com 25 cards, os 5 novos com capa; os 4 de nível 1 no grupo Iniciante e cookies e fora do ar no Intermediário,
    na ordem de `GUIDE_ORDER`; home com Privacidade, Cookies e Manutenção em "Guias novos".
  - Cada guia novo abre, mostra o box "LEIA TAMBÉM" e (13 e 14) o aviso em destaque logo abaixo do lide; 2 links de cada
    abrem.
  - Links da 013: para cada um dos 8 slugs da Parte E,
    `curl -s -A "Mozilla/5.0" https://criasite.app/guias/<slug> | grep -c "<url nova>"` dá 1 ou mais (o checklist tem 3 URLs
    novas). A página da hospedagem continua com a nota de afiliado e o link da calculadora.
  - `/busca?q=lgpd` acha o guia 13; `/busca?q=cookies` acha o 14; `/busca?q=backup` acha o 16.
  - Nenhum dos 8 guias alterados passou a mostrar "Atualizado em" (só a hospedagem, que já mostrava).
  - `/sitemap.xml` com os 5 endereços novos.

## Perguntas em aberto

As 11 decisões da Parte G, cada uma com recomendação. Nada mais depende do dono para executar.


## Execução (2026-11-24)

- **Fontes conferidas** (Parte F): Lei 13.709 no Planalto (art. 4, I; 5, I e II; 6; 8, § 5; 18; 52); Resolução CD/ANPD nº 2/2022 no gov.br (art. 2, 3 e 4: pequeno porte, exclusão por alto risco ou receita acima do limite, dispensa de encarregado com canal de comunicação); guia orientativo "Cookies e proteção de dados pessoais" da ANPD, versão 1.0 de outubro de 2022 (cookies necessários e não necessários, as quatro finalidades, botão de rejeitar de fácil visualização, categorias na 2ª camada, nada ativado por padrão, o que evitar); ajuda do AdSense "Required content" (a política deve informar cookies de terceiros e como desativar a personalização); Search Console por DNS. `registro.br` respondeu 200.
- **O que o texto afirma da ANPD** vem desse guia: as recomendações do banner são escritas como boas práticas, como o próprio guia as chama. A página de intersticiais do Google não cita banners de cookies, então a frase sobre tamanho do aviso está escrita como boa prática.
- **Palavras:** privacidade 1.000, cookies 943, visitas 863, manutenção 855, fora do ar 857 (alvo 850 a 1.000), todos com 5 min de leitura. O único aviso de fatos do script foi a palavra "garante" do aviso jurídico padrão (obrigatória).
- **G4 aplicada:** os guias 13 e 14 citam `/privacidade` e `/cookies`. O texto novo dessas páginas ainda espera a aprovação do dono (pendência dele); se não aprovar, tirar os 2 links pelo painel.
- **Simulação da cadeia** (MySQL 8.4 em memória, migrations 001 a 013): 25 guias com JSON válido; as 8 UPDATE da 013 aplicaram (9 parágrafos; o checklist recebeu os 2); a hospedagem (que já tinha `updated_at`) entrou pelas 3 âncoras; nenhum `updated_at` mudou.
- **Capas:** 5 artes novas na mesma moldura (8 a 10 KB cada, sem perda). O ponto aceso é o 7 em quatro delas e o 5 na de visitas.
- Renderização local conferida: os 5 guias abrem (200), o aviso aparece só nos 2 legais, capa e "Leia também" presentes, `/guias` lista os 5, sem rolagem horizontal em 390 e 1280 px.
