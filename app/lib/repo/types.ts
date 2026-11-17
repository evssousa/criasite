// Contrato das fontes de dados. Há duas implementações:
// - mock.server.ts: dados de exemplo em memória (desenvolvimento, sem banco);
// - mysql.server.ts: MySQL da Hostinger (produção).
// content.server.ts escolhe a fonte e cuida da formatação para as telas.
import type { SectionSlug } from "../site";
import type { Post } from "../types";

export interface PostFilter {
  section?: SectionSlug;
  /** Deixa uma editoria de fora (o feed de notícias não mostra os guias). */
  excludeSection?: SectionSlug;
  exclude?: string[];
  /** Só estes endereços (página do roteiro de IA). Lista vazia não devolve nada. */
  slugs?: string[];
  /** String: só posts com esta tag. null: só posts sem tag. undefined: sem filtro. */
  tag?: string | null;
}

export interface Repo {
  findPosts(filter: PostFilter, offset: number, limit: number): Promise<{ items: Post[]; total: number }>;
  findFeatured(): Promise<Post | null>;
  findMostRead(limit: number, exclude: string[]): Promise<Post[]>;
  /** unpublished: inclui rascunhos e arquivadas (só para a pré-visualização do admin). */
  findPost(section: string, slug: string, unpublished?: boolean): Promise<Post | null>;
  /** Todos os posts publicados (sitemap, RSS). */
  allPosts(limit?: number): Promise<Post[]>;
  /** Busca: todos os termos precisam aparecer (sem diferenciar acentos). */
  searchPosts(terms: string[], limit: number): Promise<Post[]>;
  countPostsSince(isoDate: string): Promise<number>;
  sectionStats(): Promise<{ section: SectionSlug; total: number; latest: string | null }[]>;

}
