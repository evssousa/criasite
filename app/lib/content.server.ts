// Camada de dados do site. Só roda no servidor (sufixo .server).
//
// Os dados vêm de uma "fonte" (repo): MySQL quando DB_NAME/DB_USER estão definidos,
// senão os dados de exemplo em mock-data.ts (que nunca aparecem em produção).
// Aqui ficam só as regras de exibição (paginação, rótulos de data calculados no servidor).
import type { Availability } from "./availability";
import { hasDatabase } from "./db.server";
import { formatDate, formatTime, normalize, timeAgo } from "./format";
import { mockRepo } from "./repo/mock.server";
import { mysqlRepo } from "./repo/mysql.server";
import type { Repo } from "./repo/types";
import { SECTIONS, TOOLS, sectionBySlug, type SectionSlug } from "./site";
import type { Post, PostView } from "./types";

const repo = (): Repo => (hasDatabase() ? mysqlRepo : mockRepo);

export const postUrl = (p: Pick<Post, "section" | "slug">) => `/${p.section}/${p.slug}`;

function toView(post: Post, now = Date.now()): PostView {
  const { body: _body, ...rest } = post;
  return {
    ...rest,
    url: postUrl(post),
    kicker: post.tag ?? sectionBySlug(post.section)?.kicker ?? "Notícias",
    ago: timeAgo(post.publishedAt, now),
    dateLabel: formatDate(post.publishedAt),
    timeLabel: formatTime(post.publishedAt),
  };
}

export interface ListOptions {
  section?: SectionSlug;
  excludeSection?: SectionSlug;
  exclude?: string[];
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

export async function listPosts(opts: ListOptions = {}): Promise<Paginated<PostView>> {
  const { page = 1, perPage = 12, ...filter } = opts;
  const requested = Math.max(1, Math.floor(page) || 1);
  let { items, total } = await repo().findPosts(filter, (requested - 1) * perPage, perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  // Página além do fim: mostra a última.
  const current = Math.min(requested, totalPages);
  if (current !== requested) ({ items, total } = await repo().findPosts(filter, (current - 1) * perPage, perPage));
  const now = Date.now();
  return { items: items.map((p) => toView(p, now)), page: current, totalPages, total };
}

export async function getFeatured(): Promise<PostView | null> {
  const post = await repo().findFeatured();
  return post ? toView(post) : null;
}

export async function getMostRead(limit = 5, exclude: string[] = []): Promise<PostView[]> {
  const now = Date.now();
  return (await repo().findMostRead(limit, exclude)).map((p) => toView(p, now));
}

export async function getPost(section: string, slug: string, unpublished = false) {
  const post = await repo().findPost(section, slug, unpublished);
  if (!post) return null;
  return { ...toView(post), body: post.body };
}

export async function getAllPosts(limit?: number): Promise<Post[]> {
  return repo().allPosts(limit);
}

export async function searchPosts(query: string): Promise<PostView[]> {
  const terms = normalize(query).split(/\s+/).filter(Boolean).slice(0, 8);
  if (!terms.length) return [];
  const now = Date.now();
  return (await repo().searchPosts(terms, 50)).map((p) => toView(p, now));
}

let availabilityCache: { at: number; value: Availability } | undefined;

/** O que tem conteúdo (ver availability.ts). Cache de 5 min. */
export async function getAvailability(): Promise<Availability> {
  if (availabilityCache && Date.now() - availabilityCache.at < 5 * 60_000) return availabilityCache.value;
  const stats = await repo().sectionStats();
  const sections = SECTIONS.filter((s) => s.slug === "noticias" || stats.some((x) => x.section === s.slug && x.total > 0)).map((s) => s.slug);
  // Ferramentas rodam no navegador e não dependem de dados: todas as cadastradas aparecem.
  const value: Availability = { sections, tools: TOOLS.map((t) => t.slug) };
  availabilityCache = { at: Date.now(), value };
  return value;
}
