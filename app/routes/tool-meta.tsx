import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-meta";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnCls, copyText, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("meta-tags")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Gerador de meta tags com prévia no Google e no WhatsApp", description: tool.description, path: "/ferramentas/meta-tags" });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cut = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

/** Endereço digitado sem https:// vira https://. */
function fullUrl(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return <span className={cx("num text-xs font-bold", n > max ? "text-down-night" : n >= max * 0.6 ? "text-up-night" : "text-moon-muted")}>{n}/{max}</span>;
}

export default function MetaTool() {
  const [title, setTitle] = useState("Padaria da Ana | Pães artesanais no Recife");
  const [desc, setDesc] = useState("Pães de fermentação natural assados todo dia às 6h. Encomende pelo WhatsApp e retire na loja da Torre.");
  const [url, setUrl] = useState("padariadaana.com.br");
  const [image, setImage] = useState("");
  const [site, setSite] = useState("Padaria da Ana");
  const [copied, setCopied] = useState<boolean | null>(null);

  const href = fullUrl(url);
  const host = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const img = fullUrl(image);

  const code = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    href && `<link rel="canonical" href="${esc(href)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    href && `<meta property="og:url" content="${esc(href)}">`,
    site && `<meta property="og:site_name" content="${esc(site)}">`,
    img && `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:locale" content="pt_BR">`,
    `<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">`,
  ]
    .filter(Boolean)
    .join("\n");

  async function copy() {
    setCopied(await copyText(code));
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <ToolLayout
      tool={tool}
      lead="Escreva o título e a descrição da página, veja como o link aparece no Google e no WhatsApp e copie o código para o <head> do site."
      explain={
        <>
          <h2>O que são meta tags</h2>
          <p>
            Meta tags são linhas no código da página que dizem ao Google e às redes sociais qual é o título, o resumo e a imagem do seu site. Quem visita a
            página não vê essas linhas, mas elas decidem como o link aparece na busca e quando alguém compartilha no WhatsApp, no Facebook ou no LinkedIn.
          </p>
          <h2>Título e descrição que fazem as pessoas clicarem</h2>
          <ul>
            <li>Comece o título pelo que a pessoa procura (“Pães artesanais no Recife”) e deixe o nome da empresa no fim.</li>
            <li>Use um título diferente em cada página do site. Títulos repetidos confundem o Google.</li>
            <li>
              Escreva a descrição como uma resposta: o que a pessoa encontra e por que clicar. Entre 120 e 155 caracteres ela aparece inteira (confira no{" "}
              <Link to="/ferramentas/contador-de-caracteres">contador de caracteres</Link>).
            </li>
            <li>O Google pode trocar a descrição por um trecho da página, mas uma boa descrição aumenta a chance de ele usar a sua.</li>
          </ul>
          <h2>Open Graph: a prévia no WhatsApp e nas redes</h2>
          <p>
            As tags que começam com <strong>og:</strong> são do protocolo Open Graph, criado pelo Facebook e lido pelo WhatsApp, LinkedIn, X e Telegram. A
            mais importante é a <strong>og:image</strong>: sem ela, o link vai sem foto. Use uma imagem de 1200 por 630 pixels, com o endereço completo
            (começando com https://).
          </p>
          <h2>Onde colar o código</h2>
          <p>
            Dentro da tag &lt;head&gt; de cada página. No WordPress, plugins de SEO como Yoast e Rank Math têm campos para título, descrição e imagem: use
            esta ferramenta para escrever e conferir o texto, e cole cada parte no campo do plugin.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 [&>*]:flex-none">
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between">
                <label htmlFor="mt-title" className="text-sm font-semibold text-moon-muted">
                  Título da página
                </label>
                <Counter value={title} max={60} />
              </span>
              <input id="mt-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between">
                <label htmlFor="mt-desc" className="text-sm font-semibold text-moon-muted">
                  Descrição
                </label>
                <Counter value={desc} max={155} />
              </span>
              <textarea id="mt-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className={`${inputCls} h-auto resize-y py-3`} />
            </div>
            <Field label="Endereço da página" htmlFor="mt-url">
              <input id="mt-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="seusite.com.br/servicos" className={inputCls} />
            </Field>
            <Field label="Imagem para redes (opcional)" htmlFor="mt-img" hint="Endereço de uma imagem de 1200×630 já publicada no site.">
              <input id="mt-img" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://seusite.com.br/capa.jpg" className={inputCls} />
            </Field>
            <Field label="Nome do site" htmlFor="mt-site">
              <input id="mt-site" value={site} onChange={(e) => setSite(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-moon-muted">Prévia no Google</span>
              <div className="rounded-xl bg-white p-4 font-[Arial,sans-serif] text-[#202124]">
                <div className="text-xs break-all text-[#4d5156]">{host || "seusite.com.br"}</div>
                <div className="mt-0.5 text-[19px] leading-snug break-words text-[#1a0dab]">{cut(title, 60) || "Título da página"}</div>
                <div className="mt-1 text-[13px] leading-normal break-words text-[#4d5156]">{cut(desc, 158) || "Descrição da página"}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-moon-muted">Prévia no WhatsApp</span>
              <div className="rounded-xl bg-[#e7ddd3] p-3">
                <div className="ml-auto max-w-[320px] rounded-lg bg-[#d9fdd3] p-1.5 text-[#111b21]">
                  {img ? (
                    <img src={img} alt="" className="aspect-[1200/630] w-full rounded-md bg-[#c8bfb5] object-cover" />
                  ) : (
                    <div className="grid aspect-[1200/630] w-full place-items-center rounded-md bg-[#c8bfb5] px-4 text-center text-sm font-semibold text-[#5b5148]">
                      Sem imagem: o link vai sem foto
                    </div>
                  )}
                  <div className="px-1.5 pt-2 pb-1 text-[13px]">
                    <b className="block leading-snug">{title || "Título da página"}</b>
                    <span className="block leading-snug text-[#3b4a54]">{cut(desc, 90)}</span>
                    <small className="text-[#667781]">{host.split("/")[0] || "seusite.com.br"}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-moon-muted">Código para colar no &lt;head&gt;</span>
          <pre className="overflow-x-auto rounded-xl bg-[#081236] p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[#ffc9a3]">{code}</pre>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={copy} className={btnCls}>
            {copied ? "Código copiado" : "Copiar código"}
          </button>
          {copied === false && <span className="text-sm text-glow">O navegador bloqueou a cópia. Selecione o código e copie com Ctrl+C.</span>}
        </div>
        <ToolDisclaimer />
      </ToolPanel>
    </ToolLayout>
  );
}
