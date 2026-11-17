// Configuração central do site. Editorias, ferramentas e a trilha alimentam rotas, menu, home e sitemap.

export const SITE = {
  name: "CriaSite",
  tagline: "Ferramentas, notícias e guias para criar e cuidar do seu site",
  description:
    "Ferramentas gratuitas que rodam no navegador (comprimir imagem, QR code, link do WhatsApp, meta tags), notícias da web e guias em português para criar e cuidar do seu site.",
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ?? "https://criasite.app",
  locale: "pt_BR",
  email: "contato@criasite.app",
  team: "Equipe CriaSite",
} as const;

/** Mantenha em sincronia com SECTION_SLUGS em app/routes.ts. */
export type SectionSlug = "noticias" | "google" | "plataformas" | "ia" | "seguranca" | "guias";

export interface Section {
  slug: SectionSlug;
  label: string;
  /** Rótulo curto usado como "kicker" nos cards. */
  kicker: string;
  description: string;
}

export const SECTIONS: Section[] = [
  {
    slug: "noticias",
    label: "Notícias",
    kicker: "Web",
    description: "O que muda na web para quem tem site: navegadores, desempenho, design e ferramentas, resumido em português.",
  },
  {
    slug: "google",
    label: "Google e SEO",
    kicker: "Google",
    description: "Atualizações do Google, Search Console e o que fazer para o seu site aparecer na busca.",
  },
  {
    slug: "plataformas",
    label: "WordPress e plataformas",
    kicker: "Plataformas",
    description: "Novidades do WordPress, Wix, Shopify, construtores de site e hospedagem.",
  },
  {
    slug: "ia",
    label: "IA",
    kicker: "IA",
    description: "IA para criar e cuidar de sites: assistentes e agentes de código, geradores de site, MCP e o que já funciona de verdade.",
  },
  {
    slug: "seguranca",
    label: "Segurança",
    kicker: "Segurança",
    description: "Falhas em plugins, golpes com domínio e o que fazer para manter o seu site seguro.",
  },
  {
    slug: "guias",
    label: "Guias",
    kicker: "Guia",
    description: "Passo a passo para criar o seu site: domínio, hospedagem, visual, textos, Google e lançamento.",
  },
];

export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);

/** Nível dos guias (aparece no card). */
export type GuideLevel = 1 | 2 | 3;
export const LEVEL_LABEL: Record<GuideLevel, string> = { 1: "Iniciante", 2: "Intermediário", 3: "Avançado" };

/**
 * Ordem de aprendizado dos guias dentro de cada nível (página /guias). Guia que não estiver aqui vai para o fim do seu
 * nível, em ordem de publicação. Ao criar um guia novo, acrescente o slug na posição certa.
 */
export const GUIDE_ORDER = [
  "como-escolher-o-dominio-do-site",
  "como-escolher-a-hospedagem-do-site",
  "wordpress-ou-construtor-de-sites",
  "cores-fonte-e-favicon-do-site",
  "como-escrever-as-paginas-do-site",
  "seo-basico-para-aparecer-no-google",
  "https-e-certificado-ssl",
  "perfil-da-empresa-no-google",
  "email-com-dominio-proprio",
  "google-search-console-passo-a-passo",
  "site-lento-causas-e-como-otimizar-imagens",
  "checklist-de-lancamento-do-site",
  // Guias do roteiro "Criar site com IA" (tag "Com IA"): depois dos clássicos, dentro de cada nível.
  "criar-site-com-ia-do-jeito-certo",
  "prompt-para-criar-site-com-ia",
  "site-feito-com-ia-seo-acessibilidade-e-velocidade",
  "seguranca-ao-criar-site-com-ia",
  "arquivo-de-instrucoes-para-assistente-de-codigo",
  "como-revisar-codigo-gerado-por-ia",
  "skills-para-assistentes-de-ia",
  "o-que-e-mcp-servidores-mcp",
];

/** Compara dois guias: nível (do mais básico ao mais avançado), depois GUIDE_ORDER, depois data de publicação. */
export function compareGuides(a: { level?: number; slug: string; publishedAt: string }, b: { level?: number; slug: string; publishedAt: string }) {
  const la = a.level ?? 99;
  const lb = b.level ?? 99;
  if (la !== lb) return la - lb;
  const ia = GUIDE_ORDER.indexOf(a.slug);
  const ib = GUIDE_ORDER.indexOf(b.slug);
  const oa = ia < 0 ? 1000 : ia;
  const ob = ib < 0 ? 1000 : ib;
  if (oa !== ob) return oa - ob;
  return a.publishedAt.localeCompare(b.publishedAt);
}

// ───────────── Ferramentas ─────────────

export type ToolCategoryId = "dia-a-dia" | "google" | "visual" | "freelancer" | "tecnico";

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  /** Cor do marcador da categoria no diretório. */
  color: string;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: "dia-a-dia", label: "Dia a dia", color: "#ff7a1a" },
  { id: "google", label: "Google e redes", color: "#7c5cff" },
  { id: "visual", label: "Visual", color: "#16b37a" },
  { id: "freelancer", label: "Freelancer", color: "#e8467c" },
  { id: "tecnico", label: "Técnico", color: "#2a8bd8" },
];

/** Mantenha em sincronia com as rotas de ferramentas em app/routes.ts. */
export type ToolSlug =
  | "comprimir-imagem"
  | "converter-imagem"
  | "qr-code"
  | "link-whatsapp"
  | "meta-tags"
  | "contador-de-caracteres"
  | "contraste-cores"
  | "gerador-favicon"
  | "sitemap-robots"
  | "status-http"
  | "tamanhos-de-imagem"
  | "esta-fora-do-ar";

export interface Tool {
  slug: ToolSlug;
  /** Título da página (H1). */
  title: string;
  /** Nome curto (diretório, menu, favoritas). */
  short: string;
  /** Uma linha no diretório. */
  hint: string;
  description: string;
  category: ToolCategoryId;
  /** Palavras extras para a busca da home (sinônimos, termos que as pessoas digitam). */
  keywords: string;
}

export const TOOLS: Tool[] = [
  {
    slug: "comprimir-imagem",
    title: "Comprimir imagem online",
    short: "Comprimir imagem",
    hint: "JPG, PNG e WebP menores",
    description: "Diminua o tamanho de fotos JPG, PNG e WebP sem perder qualidade visível. Tudo acontece no seu navegador.",
    category: "dia-a-dia",
    keywords: "reduzir foto diminuir peso otimizar webp jpg png converter",
  },
  {
    slug: "qr-code",
    title: "Gerador de QR code grátis",
    short: "QR code",
    hint: "cardápio, cartão, panfleto",
    description: "Crie um QR code para link, Wi-Fi, WhatsApp ou texto e baixe em PNG ou SVG. Sem cadastro e sem validade.",
    category: "dia-a-dia",
    keywords: "qrcode gerar código cardápio wifi",
  },
  {
    slug: "link-whatsapp",
    title: "Gerador de link do WhatsApp",
    short: "Link do WhatsApp",
    hint: "wa.me com mensagem pronta",
    description: "Crie o link wa.me com a mensagem já escrita, para o botão do site, a bio do Instagram ou um QR code.",
    category: "dia-a-dia",
    keywords: "whatsapp wa.me botão contato zap",
  },
  {
    slug: "contador-de-caracteres",
    title: "Contador de caracteres e palavras",
    short: "Contador de caracteres",
    hint: "com os limites do Google",
    description: "Conte caracteres, palavras e linhas e veja se o texto cabe no título e na descrição do Google e das redes.",
    category: "dia-a-dia",
    keywords: "contar letras palavras texto limite",
  },
  {
    slug: "meta-tags",
    title: "Gerador de meta tags",
    short: "Meta tags",
    hint: "como o link aparece no Google e no WhatsApp",
    description: "Escreva título e descrição, veja a prévia no Google e no WhatsApp e copie o código pronto para o seu site.",
    category: "google",
    keywords: "seo title description open graph og prévia google",
  },
  {
    slug: "converter-imagem",
    title: "Converter imagem para WebP, PNG ou JPG",
    short: "Converter imagem",
    hint: "WebP, PNG e JPG, sem enviar nada",
    description: "Converta imagens entre WebP, PNG e JPG no navegador, com a qualidade que você escolher. Nada é enviado para servidor.",
    category: "dia-a-dia",
    keywords: "webp png jpg jpeg converter formato transformar avif",
  },
  {
    slug: "contraste-cores",
    title: "Verificador de contraste de cores (WCAG)",
    short: "Contraste de cores",
    hint: "o texto passa no teste de leitura?",
    description: "Veja se a cor do texto e a do fundo têm contraste suficiente (WCAG AA e AAA) e como o texto fica na tela.",
    category: "visual",
    keywords: "acessibilidade wcag cores paleta legibilidade texto fundo",
  },
  {
    slug: "gerador-favicon",
    title: "Gerador de favicon a partir de uma imagem",
    short: "Gerador de favicon",
    hint: "ícone da aba em todos os tamanhos",
    description: "Envie o seu logo e baixe o favicon.ico e os PNGs nos tamanhos certos, com o código HTML pronto para colar.",
    category: "visual",
    keywords: "icone ícone aba navegador logo apple touch ico",
  },
  {
    slug: "sitemap-robots",
    title: "Gerador de sitemap.xml e robots.txt",
    short: "Sitemap e robots.txt",
    hint: "os dois arquivos que o Google lê",
    description: "Cole a lista de páginas do seu site e gere o sitemap.xml e o robots.txt prontos para publicar.",
    category: "google",
    keywords: "mapa do site seo indexar google search console xml",
  },
  {
    slug: "status-http",
    title: "Códigos de status HTTP: o que cada um significa",
    short: "Status HTTP",
    hint: "200, 301, 404, 503 explicados",
    description: "Guia rápido dos códigos de status HTTP (200, 301, 404, 500, 503 e outros) e o que fazer no seu site em cada caso.",
    category: "tecnico",
    keywords: "erro 404 301 500 503 redirecionamento código http",
  },
  {
    slug: "esta-fora-do-ar",
    title: "Está fora do ar? Teste se o site caiu",
    short: "Está fora do ar?",
    hint: "caiu para todos ou só para você?",
    description: "Veja se um site está fora do ar para todo mundo ou só para você: código HTTP, tempo de resposta, HTTPS e DNS, com o que fazer em cada caso.",
    category: "tecnico",
    keywords: "site caiu fora do ar offline down não abre não carrega teste verificar site funcionando disponibilidade uptime ping certificado ssl dns",
  },
  {
    slug: "tamanhos-de-imagem",
    title: "Tamanhos de imagem para site e redes sociais",
    short: "Tamanhos de imagem",
    hint: "medidas para site, Instagram e WhatsApp",
    description: "Tabela com as medidas de imagem para o site, o Instagram, o WhatsApp, o YouTube e as redes, com a proporção de cada uma.",
    category: "visual",
    keywords: "dimensões medidas pixels instagram youtube capa banner og facebook linkedin",
  },
];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolCategory = (id: ToolCategoryId) => TOOL_CATEGORIES.find((c) => c.id === id)!;
export const toolUrl = (slug: ToolSlug) => `/ferramentas/${slug}`;

// ───────────── Trilha do site no ar ─────────────

export interface TrailStep {
  id: string;
  title: string;
  /** Nome curto (faixa da home). */
  short: string;
  text: string;
  /** Ferramentas que ajudam nesta etapa. */
  tools: ToolSlug[];
  /** Slug do guia desta etapa (seção guias). Sem guia: omitir. */
  guide?: string;
}

export const TRAIL: TrailStep[] = [
  {
    id: "dominio",
    title: "Escolha e registre o domínio",
    short: "Domínio",
    text: "Nome curto, fácil de falar ao telefone e com .com.br se o seu público está no Brasil. Registre no seu nome (CPF ou CNPJ), nunca no nome de quem faz o site.",
    tools: [],
    guide: "como-escolher-o-dominio-do-site",
  },
  {
    id: "hospedagem",
    title: "Contrate a hospedagem",
    short: "Hospedagem",
    text: "Para um site institucional ou um blog, uma hospedagem compartilhada resolve. Confira se inclui certificado SSL (o cadeado) e e-mail com o seu domínio.",
    tools: [],
    guide: "como-escolher-a-hospedagem-do-site",
  },
  {
    id: "visual",
    title: "Defina cores, fonte e logo",
    short: "Visual",
    text: "Duas cores, uma fonte para títulos e um favicon já deixam o site com cara de marca. Prefira contraste alto: o texto precisa ser lido no sol, no celular.",
    tools: ["contraste-cores", "gerador-favicon"],
    guide: "cores-fonte-e-favicon-do-site",
  },
  {
    id: "paginas",
    title: "Escreva as páginas principais",
    short: "Páginas",
    text: "Início, sobre, serviços e contato. Escreva o texto antes de pensar no design: ele decide o tamanho de cada bloco. Coloque o botão do WhatsApp em todas.",
    tools: ["link-whatsapp", "contador-de-caracteres"],
    guide: "como-escrever-as-paginas-do-site",
  },
  {
    id: "google",
    title: "Prepare para o Google",
    short: "Google",
    text: "Cada página precisa de título e descrição próprios. Eles decidem como o seu link aparece na busca e quando alguém compartilha no WhatsApp.",
    tools: ["meta-tags", "sitemap-robots", "contador-de-caracteres"],
    guide: "seo-basico-para-aparecer-no-google",
  },
  {
    id: "velocidade",
    title: "Deixe rápido no celular",
    short: "Velocidade",
    text: "Imagens pesadas são a causa número um de site lento. Comprima todas antes de subir e use a largura certa para cada lugar.",
    tools: ["comprimir-imagem", "converter-imagem", "tamanhos-de-imagem"],
    guide: "site-lento-causas-e-como-otimizar-imagens",
  },
  {
    id: "lancamento",
    title: "Publique e avise o Google",
    short: "Lançamento",
    text: "Confira se tudo abre com HTTPS, cadastre o site no Google Search Console e envie o sitemap. Imprima um QR code para levar clientes da loja física ao site.",
    tools: ["qr-code", "status-http", "esta-fora-do-ar"],
    guide: "checklist-de-lancamento-do-site",
  },
];

// ───────────── Roteiro "Criar site com IA" (/criar-site-com-ia) ─────────────

/** Tag dos guias do roteiro (kicker e pílula no card). Os guias continuam na seção "guias". */
export const AI_TAG = "Com IA";

export interface AiStep {
  id: string;
  title: string;
  /** Nome curto (lista lateral). */
  short: string;
  text: string;
  /** Slugs dos guias desta etapa, em ordem (seção guias). Guia que não existir no banco não aparece. */
  guides: string[];
  tools: ToolSlug[];
}

export const AI_TRACK: AiStep[] = [
  {
    id: "planejar",
    title: "Planeje antes de pedir",
    short: "Planejar",
    text: "Escreva em um parágrafo o que o site precisa ter, para quem é e o que fica de fora. Domínio, hospedagem e contas no seu nome continuam sendo decisão sua, não da IA.",
    guides: ["criar-site-com-ia-do-jeito-certo"],
    tools: [],
  },
  {
    id: "contexto",
    title: "Dê contexto ao assistente",
    short: "Contexto",
    text: "Um arquivo de instruções com as regras do projeto evita repetir tudo a cada conversa e deixa as respostas mais previsíveis.",
    guides: ["arquivo-de-instrucoes-para-assistente-de-codigo"],
    tools: [],
  },
  {
    id: "pedir",
    title: "Peça em partes pequenas",
    short: "Pedir",
    text: "Uma página ou uma mudança por pedido, com objetivo, público e restrições. Salve uma versão antes de cada pedido para poder voltar.",
    guides: ["prompt-para-criar-site-com-ia"],
    tools: ["contraste-cores"],
  },
  {
    id: "revisar",
    title: "Revise e teste o que a IA fez",
    short: "Revisar",
    text: "Leia o que mudou, teste no celular e confira formulários, títulos, contraste e peso das imagens antes de publicar.",
    guides: ["como-revisar-codigo-gerado-por-ia", "site-feito-com-ia-seo-acessibilidade-e-velocidade"],
    tools: ["meta-tags", "comprimir-imagem"],
  },
  {
    id: "publicar",
    title: "Proteja e publique",
    short: "Publicar",
    text: "Senha, chave de API e dado de cliente não vão para o chat nem para o código. O checklist de lançamento vale para qualquer site, feito com IA ou não.",
    guides: ["seguranca-ao-criar-site-com-ia", "checklist-de-lancamento-do-site"],
    tools: ["status-http"],
  },
  {
    id: "alem",
    title: "Vá além: skills e MCP",
    short: "Ir além",
    text: "Para quem já trabalha com assistente de código: receitas reutilizáveis (skills) e conexões com outras ferramentas (MCP), com permissões mínimas.",
    guides: ["skills-para-assistentes-de-ia", "o-que-e-mcp-servidores-mcp"],
    tools: [],
  },
];

export const absoluteUrl = (path: string) => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Páginas institucionais (não dependem do banco). Alimentam rodapé, sitemap,
 * mapa do site e a navegação lateral entre documentos.
 */
export interface DocPage {
  to: string;
  label: string;
  group: "site" | "legal";
  /** Data da última revisão do texto (AAAA-MM-DD). */
  updated: string;
}

export const DOC_PAGES: DocPage[] = [
  { to: "/sobre", label: "Sobre", group: "site", updated: "2026-11-14" },
  { to: "/contato", label: "Contato", group: "site", updated: "2026-11-14" },
  { to: "/faq", label: "Perguntas frequentes", group: "site", updated: "2026-11-14" },
  { to: "/politica-editorial", label: "Política editorial", group: "site", updated: "2026-11-17" },
  { to: "/anuncie", label: "Anuncie", group: "site", updated: "2026-11-14" },
  { to: "/termos", label: "Termos de uso", group: "legal", updated: "2026-11-17" },
  { to: "/privacidade", label: "Privacidade", group: "legal", updated: "2026-11-17" },
  { to: "/cookies", label: "Cookies", group: "legal", updated: "2026-11-14" },
  { to: "/acessibilidade", label: "Acessibilidade", group: "legal", updated: "2026-11-14" },
  { to: "/mapa-do-site", label: "Mapa do site", group: "legal", updated: "2026-11-14" },
];

export const docPage = (to: string) => DOC_PAGES.find((d) => d.to === to);

/**
 * Links de afiliado: ganham rel="sponsored" (regra do Google para links pagos) onde o texto é renderizado.
 * O aviso de afiliado fica no próprio texto, na mesma frase ou logo antes do link (ver docs/guias.md, seção F).
 */
const AFFILIATE_LINKS = [/^https:\/\/(www\.)?hostinger\.com\/br\?REFERRALCODE=/i];
export const isAffiliateLink = (href: string) => AFFILIATE_LINKS.some((re) => re.test(href));

/** Link "mailto" com assunto preenchido, para separar os pedidos na caixa de entrada. */
export const mailto = (subject: string) => `mailto:${SITE.email}?subject=${encodeURIComponent(`[${subject}] `)}`;
