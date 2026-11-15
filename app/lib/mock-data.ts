// Dados de exemplo (fictícios) para desenvolver o site sem banco.
// Nunca aparecem em produção: com DB_NAME/DB_USER definidos, o site lê só o MySQL.
// As notícias daqui NÃO são reais.
import type { Block, Post } from "./types";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const p = (text: string): Block => ({ type: "p", text });
const h2 = (text: string): Block => ({ type: "h2", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });

/** Corpo padrão dos exemplos (para a página da notícia ter conteúdo). */
const body = (topic: string): Block[] => [
  p(`Este é um texto de exemplo sobre ${topic}. Ele existe só para mostrar como a notícia aparece no site enquanto o robô de notícias não está ligado.`),
  p(
    "As notícias reais vão citar as fontes com link, explicar o contexto para quem tem um site pequeno e dizer o que fazer na prática. Veja também o [gerador de meta tags](/ferramentas/meta-tags) e a [trilha do site no ar](/trilha).",
  ),
  h2("O que isso muda para o seu site"),
  p("Aqui entra a parte prática: o que muda para quem tem um site institucional, uma loja virtual ou um blog."),
  ul("Ponto importante número um, em uma frase.", "Ponto importante número dois, com um [link interno](/ferramentas).", "Ponto importante número três."),
  h2("O que fazer agora"),
  p("Um passo a passo curto, com as ferramentas do CriaSite que ajudam nesta tarefa."),
];

interface Seed {
  slug: string;
  title: string;
  excerpt: string;
  section: Post["section"];
  tag?: string;
  level?: Post["level"];
  tags?: string[];
  h: number;
  read?: number;
  views?: number;
  featured?: boolean;
}

const SEEDS: Seed[] = [
  {
    slug: "atualizacao-do-google-de-novembro-o-que-fazer-se-o-trafego-caiu",
    title: "Atualização do Google de novembro: o que fazer se o tráfego caiu",
    excerpt: "Um passo a passo para conferir no Search Console antes de mudar qualquer coisa no site.",
    section: "google",
    tags: ["Google", "Search Console"],
    h: 2,
    read: 5,
    views: 3200,
    featured: true,
  },
  {
    slug: "nova-versao-do-wordpress-traz-edicao-em-tempo-real",
    title: "Nova versão do WordPress traz edição em tempo real",
    excerpt: "Dois autores no mesmo post, como no Google Docs. O que muda para quem mantém um blog.",
    section: "plataformas",
    tags: ["WordPress"],
    h: 5,
    views: 2100,
  },
  {
    slug: "criar-site-com-ia-o-que-ja-funciona-de-verdade",
    title: "Criar site com IA: o que já funciona de verdade",
    excerpt: "Testamos os geradores de site com inteligência artificial. Onde eles ajudam e onde ainda atrapalham.",
    section: "ia",
    tag: "Explicado",
    tags: ["IA"],
    h: 6,
    views: 2600,
  },
  {
    slug: "falha-em-plugin-popular-de-formulario-atualize-hoje",
    title: "Falha em plugin popular de formulário: atualize hoje",
    excerpt: "A brecha permite enviar arquivos para o servidor. Veja se o seu site usa o plugin e como atualizar.",
    section: "seguranca",
    tags: ["WordPress", "Segurança"],
    h: 9,
    views: 1800,
  },
  {
    slug: "chrome-muda-o-aviso-de-site-nao-seguro",
    title: "Chrome muda o aviso de site não seguro",
    excerpt: "Sites sem HTTPS vão mostrar um alerta mais visível. Como conferir se o seu certificado está em dia.",
    section: "noticias",
    tags: ["Chrome", "HTTPS"],
    h: 20,
    views: 1500,
  },
  {
    slug: "search-console-ganha-relatorio-de-paginas-lentas",
    title: "Search Console ganha relatório de páginas lentas",
    excerpt: "O novo relatório separa as páginas por tipo de problema. O que olhar primeiro.",
    section: "google",
    tags: ["Search Console", "Velocidade"],
    h: 26,
    views: 1300,
  },
  {
    slug: "imagens-em-webp-ja-sao-maioria-na-web",
    title: "Imagens em WebP já são maioria na web",
    excerpt: "O formato mais leve passou o JPG pela primeira vez. Vale converter as fotos do seu site?",
    section: "noticias",
    tags: ["Imagens", "Velocidade"],
    h: 40,
    views: 900,
  },
  {
    slug: "como-escolher-um-dominio",
    title: "Como escolher um domínio para o seu site",
    excerpt: "Curto, fácil de falar e com a terminação certa. O que pesar antes de registrar.",
    section: "guias",
    level: 1,
    h: 60,
    read: 6,
    views: 1100,
  },
  {
    slug: "o-que-e-um-redirecionamento-301",
    title: "O que é um redirecionamento 301",
    excerpt: "Quando usar, como configurar e o erro que faz o site perder posições no Google.",
    section: "guias",
    level: 2,
    h: 80,
    read: 4,
    views: 700,
  },
  {
    slug: "imagem-webp-vale-a-pena",
    title: "Imagem WebP: vale a pena?",
    excerpt: "Quanto o site fica mais leve, quais navegadores abrem e como converter de graça.",
    section: "guias",
    level: 1,
    h: 100,
    read: 5,
    views: 650,
  },
];

export const MOCK_POSTS: Post[] = SEEDS.map((s) => ({
  slug: s.slug,
  title: s.title,
  excerpt: s.excerpt,
  section: s.section,
  tag: s.tag,
  level: s.level,
  publishedAt: hoursAgo(s.h),
  author: "Equipe CriaSite",
  readMinutes: s.read ?? 3,
  tags: s.tags,
  body: body(s.title.toLowerCase()),
  featured: s.featured,
  views: s.views ?? 500,
  source: s.section === "guias" ? undefined : { name: "Fonte de exemplo", url: "https://example.com" },
}));
