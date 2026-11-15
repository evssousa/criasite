// O que tem conteúdo: editorias e ferramentas.
// Página vazia não aparece em menu, rodapé, home nem sitemap, e leva noindex (o AdSense
// reprova sites com páginas "em construção"). Calculado em content.server.ts (getAvailability)
// e entregue pelo loader da raiz. Mesma regra do Respawnou e do Vibecoin.
import { useRouteLoaderData } from "react-router";
import { SECTIONS, TOOLS, type SectionSlug, type ToolSlug } from "./site";

export interface Availability {
  sections: SectionSlug[];
  tools: ToolSlug[];
}

/** Sem dados (ex.: página de erro): mostra tudo. */
export const ALL_AVAILABLE: Availability = {
  sections: SECTIONS.map((s) => s.slug),
  tools: TOOLS.map((t) => t.slug),
};

export function useAvailability(): Availability {
  const data = useRouteLoaderData("root") as { available?: Availability } | undefined;
  return data?.available ?? ALL_AVAILABLE;
}

/** Menu principal: ferramentas, notícias, trilha e guias (editorias com conteúdo). */
export const navFor = (a: Availability) => [
  ...(a.tools.length ? [{ to: "/ferramentas", label: "Ferramentas" }] : []),
  { to: "/noticias", label: "Notícias" },
  { to: "/trilha", label: "Trilha" },
  ...(a.sections.includes("guias") ? [{ to: "/guias", label: "Guias" }] : []),
];

/** Editorias de notícias com conteúdo (sem "noticias", que lista tudo, e sem guias). */
export const newsSectionsFor = (a: Availability) => SECTIONS.filter((s) => s.slug !== "noticias" && s.slug !== "guias" && a.sections.includes(s.slug));

export const toolsFor = (a: Availability) => TOOLS.filter((t) => a.tools.includes(t.slug));
