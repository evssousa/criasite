// Ponte com o banco do site (ESPECÍFICO DO SITE: ao copiar o módulo, ajuste estas poucas linhas).
import type { ResultSetHeader } from "mysql2";
import { db, hasDatabase, query } from "~/lib/db.server";

export { hasDatabase, query };

/** INSERT/UPDATE/DELETE: devolve quantas linhas foram afetadas. */
export async function exec(sql: string, params: unknown[] = []): Promise<{ affected: number }> {
  const [res] = await db().query<ResultSetHeader>(sql, params);
  return { affected: res.affectedRows };
}
