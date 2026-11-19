// Títulos das páginas do painel (ESPECÍFICO DO SITE): o endereço vira o nome do conteúdo (matéria, guia, ferramenta).
import { VISITAS } from "./config";
import { query } from "./db";
import { TOOLS } from "~/lib/site";

type Item = { path: string; kind: string };

// Cache simples de 10 min por conjunto de endereços (o painel é de uma pessoa só).
const guardado = new Map<string, { t: number; v: Map<string, string> }>();
const TTL = 10 * 60_000;

/** Títulos por endereço. O que não for achado (matéria apagada) fica de fora: o painel mostra o endereço. */
export async function titulos(itens: Item[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const i of itens) {
    const fixo = VISITAS.fixos[i.path];
    if (fixo) out.set(i.path, fixo);
    else if (i.kind === "ferramenta") {
      const t = TOOLS.find((x) => `/ferramentas/${x.slug}` === i.path);
      if (t) out.set(i.path, t.short);
    }
  }
  const posts = itens.filter((i) => !out.has(i.path) && (i.kind === "materia" || i.kind === "guia"));
  if (!posts.length) return out;
  const chave = posts.map((i) => i.path).sort().join("\n");
  const antigo = guardado.get(chave);
  if (antigo && Date.now() - antigo.t < TTL) {
    for (const [k, v] of antigo.v) out.set(k, v);
    return out;
  }
  const achados = new Map<string, string>();
  const slugs = [...new Set(posts.map((i) => i.path.split("/")[2]))].filter(Boolean);
  if (slugs.length) {
    const rows = await query<{ section: string; slug: string; title: string }>(`SELECT section, slug, title FROM posts WHERE slug IN (${slugs.map(() => "?").join(",")})`, slugs);
    for (const r of rows) achados.set(`/${r.section}/${r.slug}`, r.title);
  }
  if (guardado.size > 200) guardado.clear();
  guardado.set(chave, { t: Date.now(), v: achados });
  for (const [k, v] of achados) out.set(k, v);
  return out;
}
