import type { GuideLevel, SectionSlug } from "./site";

/**
 * Blocos do corpo. Em p, ul e quote o texto aceita links no formato [texto](url):
 * url começando com "/" é link interno; o resto abre em outra aba.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "img"; src: string; alt: string; width?: number; height?: number; credit?: string }
  | { type: "video"; youtubeId: string; title: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  section: SectionSlug;
  /** Rótulo opcional que substitui o da seção no card (ex.: "Análise", "Explicado"). */
  tag?: string;
  /** Só nos guias. */
  level?: GuideLevel;
  publishedAt: string; // ISO
  updatedAt?: string; // ISO
  author: string;
  readMinutes: number;
  image?: { src: string; alt: string; credit?: string };
  /** SEO: descrição para o Google (120–160 caracteres); sem ela, usa o excerpt. */
  metaDescription?: string;
  focusKeyword?: string;
  tags?: string[];
  body: Block[];
  featured?: boolean;
  views: number;
  /** Só na pré-visualização do admin (rascunho/arquivada). */
  status?: string;
  source?: { name: string; url: string };
}

/** Post como chega nos componentes: com textos de data já calculados no servidor. */
export interface PostView extends Omit<Post, "body"> {
  url: string;
  kicker: string;
  ago: string;
  dateLabel: string;
  /** Horário de publicação, ex.: "09:12". */
  timeLabel: string;
}
