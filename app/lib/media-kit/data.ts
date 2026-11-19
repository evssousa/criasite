// Mídia kit do CriaSite (/anuncie). Específico do site: nos outros sites este é o único arquivo de conteúdo que muda.
// Regras: nenhum número de audiência fora de `metrics`, nenhum número sem fonte e data, nada de preço negociado nem nome de
// cliente (o repositório é público). `node scripts/test-midia-kit.ts` confere tudo isto. Ver docs/midia-kit.md, parte B.
// Sem imports de `~/` (o teste roda direto no Node): nome, domínio e e-mail repetidos como texto; o teste confere com SITE.
import type { MediaKit } from "./types.ts";

export const MEDIA_KIT: MediaKit = {
  version: 1,
  updatedAt: "2026-11-19",
  validDays: 90,
  brand: { name: "CriaSite", domain: "criasite.app", email: "contato@criasite.app", mailSubject: "Comercial", launchedAt: "2026-11-14" },

  pitch: {
    title: "Fale com quem está criando o próprio site",
    lead: "Donos de pequenos negócios, freelancers e iniciantes usam o CriaSite para escolher hospedagem e plataforma, deixar o site rápido e aparecer no Google. Aqui a sua marca entra no assunto certo, marcada como patrocínio.",
  },

  audience: {
    intro:
      "O CriaSite é para quem quer colocar um site no ar e mantê-lo funcionando sem depender de agência: gente que faz quase tudo sozinha e precisa de ferramenta que resolve e de explicação em português claro.",
    personas: [
      {
        code: "PERFIL 01",
        title: "Dono de pequeno negócio",
        who: "Loja, consultório, restaurante, prestador de serviço. Quer o site, o WhatsApp e o Google funcionando juntos.",
        seeks: ["domínio e hospedagem confiáveis, com preço claro", "aparecer no Google e no Perfil da Empresa", "QR code, link do WhatsApp e imagens leves"],
      },
      {
        code: "PERFIL 02",
        title: "Freelancer e quem faz site para clientes",
        who: "Designers, desenvolvedores e social media que entregam sites para pequenos clientes.",
        seeks: ["ferramentas rápidas: favicon, meta tags, sitemap, contraste", "plataformas e hospedagem para indicar aos clientes", "o que mudou no Google e no WordPress"],
      },
      {
        code: "PERFIL 03",
        title: "Quem está criando o primeiro site",
        who: "Iniciantes, inclusive quem está criando o site com ajuda de IA.",
        seeks: ["passo a passo do domínio ao lançamento", "escolher entre WordPress, construtor de sites ou IA", "segurança básica e o que não fazer"],
      },
    ],
    why: [
      "Quem chega aqui está decidindo: qual hospedagem, qual domínio, qual plataforma, que ferramenta usar. É a hora em que uma marca útil é lembrada.",
      "Os assuntos do site são os do seu produto: hospedagem e domínio, plataformas e construtores, design e imagens, Google e SEO, segurança e IA para criar sites.",
      "Conteúdo em português do Brasil, escrito para quem não é técnico.",
      "Poucos formatos, todos marcados: o leitor sabe o que é anúncio e, por isso, confia no resto.",
    ],
    categories: ["Hospedagem", "Registro de domínio", "Plataformas e construtores de site", "E-mail profissional", "Design, imagens e fontes", "SEO e Search Console", "IA para criar sites", "Cursos para quem cria site"],
    note: "Perfil descrito a partir do que o site publica e das ferramentas que oferece. Não é uma pesquisa com leitores.",
  },

  // Hoje nenhum número de audiência é publicado. Os 2 manuais ficam cadastrados sem valor: a tabela mostra
  // "ainda sem dado público". Para publicar: Search Console → Desempenho → Resultados da pesquisa → "Últimos 28 dias",
  // copiar o total de cliques e de impressões para `value`, pôr a data do dia em `updatedAt` e em `MEDIA_KIT.updatedAt`,
  // rodar o teste e fazer commit. Repetir todo mês. Passados 90 dias sem atualizar, o número some sozinho.
  metrics: [
    { id: "gsc-clicks-28d", label: "Cliques vindos do Google", value: null, unit: "cliques", period: "últimos 28 dias", source: "Google Search Console", updatedAt: null },
    { id: "gsc-impressions-28d", label: "Vezes que o site apareceu no Google", value: null, unit: "impressões", period: "últimos 28 dias", source: "Google Search Console", updatedAt: null },
  ],
  audienceOnRequest:
    "O CriaSite está no ar desde 14/11/2026 e ainda está juntando o primeiro trimestre de dados de audiência. Se você precisa dos números atuais (cliques e impressões no Google), pedimos por e-mail e enviamos com a captura de tela do Google Search Console, com a data.",

  sharedExcludes: "Nenhum formato garante posição no Google, cliques ou vendas, nem muda notícias, guias ou o funcionamento das ferramentas.",
  formats: [
    {
      id: "guia-patrocinado",
      code: "FORMATO 01",
      name: "Guia patrocinado",
      summary:
        "Um guia novo, escrito pela Equipe CriaSite, sobre um assunto ligado ao seu produto e útil para quem cria site. Por exemplo: como migrar o site de hospedagem ou como montar uma loja virtual pequena.",
      includes: [
        "pauta combinada com a marca e texto escrito pela nossa equipe, no padrão dos guias do site",
        "selo “Patrocinado por” com o nome da marca no topo do guia e nos cards",
        `até 3 links para o site da marca, com rel="sponsored"`,
        "número de leituras contado pelo site, enviado 30 dias depois da publicação",
      ],
      excludes: [
        "publicar texto pronto da marca como se fosse nosso",
        "comparação que coloque a marca como “a melhor” ou esconda pontos de atenção da categoria",
        "aprovação de opinião: a marca confere só os dados do próprio produto",
      ],
      delivery: "até 15 dias úteis depois da pauta aprovada",
      duration: "no ar por pelo menos 12 meses",
      marking: `selo “Patrocinado” no topo e nos cards, nome da marca e links com rel="sponsored"`,
      price: null,
      available: true,
    },
    {
      id: "oferta-em-guia",
      code: "FORMATO 02",
      name: "Oferta em guia relacionado",
      summary:
        "Uma caixa separada do texto, marcada como “Patrocinado”, no fim de um guia do mesmo assunto. Por exemplo: uma oferta de e-mail profissional no guia de e-mail com domínio próprio.",
      includes: [`caixa com o nome da marca, uma frase de até 160 caracteres e um link com rel="sponsored"`, "escolha do guia entre os do assunto do produto", "30 dias no ar, renováveis"],
      excludes: ["mudança no texto do guia ou na ordem das recomendações", "exclusividade de categoria"],
      delivery: "até 5 dias úteis depois de receber a frase e o link",
      duration: "30 dias, renováveis",
      marking: `caixa com rótulo “Patrocinado”, fora do corpo do guia, e link com rel="sponsored"`,
      price: null,
      available: true,
    },
    {
      id: "apoio-ferramenta",
      code: "FORMATO 03",
      name: "Apoio a uma ferramenta",
      summary: "Uma faixa discreta abaixo do painel de uma ferramenta, com o logo da marca, uma frase curta e um link.",
      includes: ["logo (guardado no próprio CriaSite) e frase de até 90 caracteres", `link com rel="sponsored"`, "escolha entre as ferramentas no ar", "30 dias no ar, renováveis"],
      excludes: [
        "mudança no funcionamento ou no resultado da ferramenta",
        "pop-up, vídeo automático, script, pixel ou cookie da marca",
        "acesso ao que a pessoa digita ou envia na ferramenta (isso não sai do navegador)",
      ],
      delivery: "até 5 dias úteis depois de receber o logo, a frase e o link",
      duration: "30 dias, renováveis",
      marking: `faixa com rótulo “Patrocinado” e link com rel="sponsored"`,
      price: null,
      available: true,
    },
  ],
  adsenseNote: {
    title: "Banners do Google AdSense",
    text: "Quando estão ligados, os anúncios em banner do site são do Google AdSense: o Google escolhe e vende esses anúncios, não nós. Por isso não vendemos espaço de banner direto nem mudamos onde eles aparecem.",
  },

  rules: [
    "Todo conteúdo pago leva o selo “Patrocinado” no topo, com o nome de quem pagou. O selo aparece também nos cards e nas listas do site.",
    `Todo link pago leva o atributo rel="sponsored", como o Google pede para links pagos. Não vendemos link sem essa marcação.`,
    "Patrocínio não muda notícias, guias nem o funcionamento das ferramentas. Nenhum guia ganha ou perde menção por causa de anunciante.",
    "Conteúdo patrocinado é escrito pela Equipe CriaSite. A marca confere os dados do próprio produto (nome, preço, recursos) antes da publicação, mas não aprova opinião nem pede para apagar pontos de atenção.",
    "Nenhum texto pago promete posição no Google, vendas ou resultado garantido.",
    "Sem rastreamento de terceiros: logos e imagens ficam guardados no próprio CriaSite, sem script, pixel ou cookie da marca. Os links podem ter parâmetros de campanha (UTM).",
    "Avaliamos cada proposta e podemos recusar qualquer uma. Só publicamos depois de combinar por e-mail o texto, o link, a data e o período.",
    "Seguimos o Código de Defesa do Consumidor (art. 36: a publicidade tem que ser identificada como tal, fácil e imediatamente) e as orientações do CONAR sobre identificação de publicidade.",
  ],

  refused: [
    "apostas, cassinos on-line, rifas e jogos de azar;",
    "“renda extra garantida”, marketing multinível, pirâmides e cursos que prometem faturamento;",
    "investimentos e criptomoedas com promessa de ganho;",
    "produtos de saúde, estética ou emagrecimento com promessa de resultado;",
    "venda de links e de backlinks, redes de blogs para SEO e “primeira página do Google garantida”;",
    "seguidores, curtidas e avaliações falsas;",
    "temas, plugins e programas piratas ou “nulled”, e ferramentas que coletam dados dos visitantes sem dizer isso com clareza;",
    "empréstimo com juros escondidos, conteúdo adulto, armas e propaganda política.",
  ],

  process: [
    { title: "Você escreve", text: "Mande um e-mail com o assunto [Comercial] contando a marca, o produto e o formato que interessa." },
    { title: "Respondemos em até 5 dias úteis", text: "Dizemos se a proposta se encaixa e mandamos as condições. Se não aceitarmos, dizemos isso na resposta." },
    { title: "Combinamos tudo por e-mail", text: "Pauta ou frase, link, data de início, período e valor. Nada é publicado sem esse acordo escrito." },
    { title: "Publicamos marcado", text: `No prazo do formato, com o selo “Patrocinado” e o link com rel="sponsored".` },
  ],
  firstEmail: [
    "nome da empresa e endereço do site;",
    "o produto ou serviço e para quem ele é;",
    "o formato que interessa e o período;",
    "se você já tem o material (logo, frase, link) ou quer que a gente escreva;",
    "o orçamento aproximado, se já tiver.",
  ],
  responseTime: "Respondemos em até 5 dias úteis.",
  mailTemplate: ["Olá, equipe CriaSite.", "", "Empresa ou marca:", "Site:", "Produto ou serviço:", "Formato de interesse:", "Período desejado:", "Orçamento aproximado (opcional):"],

  faq: [
    {
      q: "O CriaSite publica texto pronto enviado pela marca?",
      a: `Não. O conteúdo patrocinado é escrito pela Equipe CriaSite, leva o selo “Patrocinado” no topo e os links pagos levam rel="sponsored". A marca confere só os dados do próprio produto.`,
    },
    {
      q: "Vocês garantem posição no Google ou número de cliques?",
      a: "Não. Nenhum formato garante posição na busca, cliques ou vendas. Entregamos o espaço combinado, marcado, pelo prazo combinado e, no guia patrocinado, o número de leituras contado pelo site.",
    },
    {
      q: "De onde vêm os números deste mídia kit?",
      a: "Da contagem do próprio site (ferramentas, guias e notícias publicados) e, para audiência, do Google Search Console. Cada número mostra a fonte e a data. Quando ainda não há dado confiável, a página diz isso.",
    },
    {
      q: "Quanto custa anunciar?",
      a: "Os valores são sob consulta, porque dependem do formato e do período. Escreva para contato@criasite.app com o assunto [Comercial] e respondemos em até 5 dias úteis.",
    },
  ],
};
