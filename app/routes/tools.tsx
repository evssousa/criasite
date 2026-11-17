import { useState } from "react";
import type { Route } from "./+types/tools";
import { ToolDirectory, filterTools } from "~/components/directory";
import { toolsFor, useAvailability } from "~/lib/availability";
import { seo } from "~/lib/seo";

export function meta(_: Route.MetaArgs) {
  return seo({
    title: "Ferramentas gratuitas para o seu site",
    description: "Comprimir imagem, gerador de QR code, link do WhatsApp, meta tags e contador de caracteres. Grátis, sem cadastro e rodando no seu navegador.",
    path: "/ferramentas",
  });
}

export default function Tools() {
  const tools = toolsFor(useAvailability());
  const [query, setQuery] = useState("");
  const count = filterTools(tools, query).length;
  return (
    <main id="conteudo" className="mx-auto flex max-w-[1180px] flex-col gap-7 px-4 pt-8 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-[36px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[48px]">Ferramentas</h1>
        <p className="max-w-2xl text-lg text-muted">
          Grátis, sem cadastro e quase todas rodando no seu navegador: o que você digita ou envia não sai do seu computador (a exceção, avisada na página, é a “Está fora do ar?”).
          Marque a estrela para fixar as que você mais usa na página inicial.
        </p>
      </header>
      <div className="flex max-w-xl flex-col gap-1.5">
        <label htmlFor="filtro" className="text-sm font-semibold text-muted">
          Filtrar ferramentas
        </label>
        <input
          id="filtro"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: imagem, Google, WhatsApp"
          className="h-12 rounded-xl border border-line-2 bg-card px-3.5 text-[16px] outline-none focus:border-ink"
        />
        <span className="text-[13px] text-muted" aria-live="polite">
          {count} {count === 1 ? "ferramenta" : "ferramentas"}
        </span>
      </div>
      <ToolDirectory tools={tools} query={query} />
    </main>
  );
}
