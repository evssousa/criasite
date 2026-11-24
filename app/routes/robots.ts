import { absoluteUrl } from "~/lib/site";

// /busca NÃO entra no Disallow de propósito: a página tem noindex e o Google só lê o noindex se puder rastrear a página
// (com Disallow ele indexa o endereço "mesmo bloqueado", sem o conteúdo). Painel e API continuam bloqueados.
export function loader() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
