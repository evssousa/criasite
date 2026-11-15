import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-sitemap";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, copyText, inputCls } from "~/components/ToolLayout";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("sitemap-robots")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Gerador de sitemap.xml e robots.txt grátis", description: tool.description, path: "/ferramentas/sitemap-robots" });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function download(name: string, text: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const EXAMPLE_URLS = "/\n/sobre\n/servicos\n/contato\n/blog/como-escolher-um-dominio";
const EXAMPLE_BLOCK = "/admin\n/carrinho\n/minha-conta";

export default function SitemapTool() {
  const [site, setSite] = useState("https://padariadaana.com.br");
  const [paths, setPaths] = useState(EXAMPLE_URLS);
  const [blocked, setBlocked] = useState(EXAMPLE_BLOCK);
  const [lastmod, setLastmod] = useState(true);
  const [copied, setCopied] = useState<"sitemap" | "robots" | "erro" | null>(null);

  const base = useMemo(() => {
    let v = site.trim().replace(/\/+$/, "");
    if (v && !/^https?:\/\//i.test(v)) v = `https://${v}`;
    return v;
  }, [site]);

  const { sitemap, robots, count, ignored } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen = new Set<string>();
    const urls: string[] = [];
    let ignored = 0;
    for (const raw of paths.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      // Aceita endereço completo ou só o caminho (/sobre); outro domínio é ignorado.
      let full: string;
      if (/^https?:\/\//i.test(line)) {
        if (!base || !line.toLowerCase().startsWith(base.toLowerCase())) {
          ignored++;
          continue;
        }
        full = line;
      } else {
        full = `${base}${line.startsWith("/") ? line : `/${line}`}`;
      }
      if (!seen.has(full)) {
        seen.add(full);
        urls.push(full);
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url>\n    <loc>${esc(u)}</loc>${lastmod ? `\n    <lastmod>${today}</lastmod>` : ""}\n  </url>`)
      .join("\n")}\n</urlset>\n`;
    const dis = blocked
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => `Disallow: ${l.startsWith("/") ? l : `/${l}`}`);
    const txt = ["User-agent: *", ...(dis.length ? dis : ["Disallow:"]), "", base ? `Sitemap: ${base}/sitemap.xml` : "# Preencha o endereço do site para incluir o sitemap"].join("\n") + "\n";
    return { sitemap: xml, robots: txt, count: urls.length, ignored };
  }, [paths, blocked, base, lastmod]);

  async function copy(what: "sitemap" | "robots") {
    const ok = await copyText(what === "sitemap" ? sitemap : robots);
    setCopied(ok ? what : "erro");
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <ToolLayout
      tool={tool}
      lead="Informe o endereço do site e a lista de páginas: a ferramenta monta o sitemap.xml e o robots.txt prontos para publicar."
      explain={
        <>
          <h2>O que é o sitemap.xml</h2>
          <p>
            O sitemap é a lista das páginas do seu site em um arquivo que o Google lê. Ele não garante que as páginas apareçam na busca, mas ajuda o Google a
            encontrar todas, principalmente em sites novos, com poucos links vindos de fora. Sites pequenos, de até algumas dezenas de páginas, podem ter um
            sitemap feito à mão como este.
          </p>
          <h2>O que é o robots.txt</h2>
          <p>
            É um arquivo de texto que diz aos robôs de busca o que eles podem ou não visitar. Use-o para tirar do caminho áreas que não fazem sentido na busca,
            como o painel, o carrinho e a conta do cliente. E atenção: o robots.txt não esconde nada de ninguém. Quem tem o endereço consegue abrir a página, e o
            arquivo é público. Para proteger uma área, use senha.
          </p>
          <h2>Onde publicar e como avisar o Google</h2>
          <ol>
            <li>Salve os dois arquivos na pasta principal do site, de modo que abram em seusite.com.br/sitemap.xml e seusite.com.br/robots.txt.</li>
            <li>No Google Search Console, abra a seção Sitemaps e envie o endereço do sitemap.</li>
            <li>No WordPress, plugins como Yoast e Rank Math já geram os dois arquivos sozinhos: use esta ferramenta se o seu site não é WordPress.</li>
          </ol>
          <h2>Erros comuns</h2>
          <ul>
            <li>Listar no sitemap páginas que redirecionam ou dão erro. Confira os <Link to="/ferramentas/status-http">códigos de status</Link> antes.</li>
            <li>Bloquear o site inteiro no robots.txt com “Disallow: /” e esquecer. É o motivo de muitos sites que “não aparecem no Google”.</li>
            <li>Misturar http e https ou com e sem www. Use o mesmo endereço que o seu site usa de verdade.</li>
          </ul>
        </>
      }
    >
      <ToolPanel>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Endereço do site" htmlFor="sm-site">
              <input id="sm-site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://seusite.com.br" className={inputCls} />
            </Field>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sm-paths" className="text-sm font-semibold text-moon-muted">
                Páginas do site (uma por linha)
              </label>
              <textarea id="sm-paths" rows={7} value={paths} onChange={(e) => setPaths(e.target.value)} spellCheck={false} className={`${inputCls} h-auto resize-y py-3 font-mono text-[15px]`} />
              <span className="text-xs text-moon-muted" aria-live="polite">
                {count} {count === 1 ? "página" : "páginas"} no sitemap
                {ignored > 0 && ` · ${ignored} de outro endereço ficou de fora`}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sm-block" className="text-sm font-semibold text-moon-muted">
                Áreas que os robôs não devem visitar (uma por linha)
              </label>
              <textarea id="sm-block" rows={3} value={blocked} onChange={(e) => setBlocked(e.target.value)} spellCheck={false} className={`${inputCls} h-auto resize-y py-3 font-mono text-[15px]`} />
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={lastmod} onChange={(e) => setLastmod(e.target.checked)} className="h-5 w-5 accent-[var(--color-brand)]" />
              Incluir a data de hoje como última atualização
            </label>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-semibold text-moon-muted">sitemap.xml</span>
              <pre className="max-h-64 overflow-auto rounded-xl bg-[#081236] p-4 font-mono text-[12.5px] leading-relaxed text-[#ffc9a3]">{sitemap}</pre>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => copy("sitemap")} className={btnCls}>
                  {copied === "sitemap" ? "Copiado" : "Copiar"}
                </button>
                <button type="button" onClick={() => download("sitemap.xml", sitemap, "application/xml")} className={btnGhostCls}>
                  Baixar sitemap.xml
                </button>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-semibold text-moon-muted">robots.txt</span>
              <pre className="overflow-auto rounded-xl bg-[#081236] p-4 font-mono text-[12.5px] leading-relaxed text-[#ffc9a3]">{robots}</pre>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => copy("robots")} className={btnCls}>
                  {copied === "robots" ? "Copiado" : "Copiar"}
                </button>
                <button type="button" onClick={() => download("robots.txt", robots, "text/plain")} className={btnGhostCls}>
                  Baixar robots.txt
                </button>
              </div>
            </div>
            {copied === "erro" && <p className="text-sm text-glow">O navegador bloqueou a cópia. Selecione o texto e copie com Ctrl+C.</p>}
          </div>
        </div>
        <ToolDisclaimer />
      </ToolPanel>
    </ToolLayout>
  );
}
