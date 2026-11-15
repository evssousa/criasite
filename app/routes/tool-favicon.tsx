import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-favicon";
import { ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, copyText, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("gerador-favicon")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Gerador de favicon grátis (ICO e PNG)", description: tool.description, path: "/ferramentas/gerador-favicon" });
}

const SIZES = [
  { size: 16, file: "favicon-16x16.png", use: "Aba do navegador" },
  { size: 32, file: "favicon-32x32.png", use: "Aba em telas de alta densidade" },
  { size: 48, file: "favicon-48x48.png", use: "Atalho no Windows" },
  { size: 180, file: "apple-touch-icon.png", use: "Tela inicial do iPhone" },
  { size: 192, file: "android-chrome-192x192.png", use: "Tela inicial do Android" },
  { size: 512, file: "android-chrome-512x512.png", use: "Android e instalação do site" },
];

const HTML = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

type Fit = "contain" | "cover";

/** Desenha a imagem num quadrado (centralizada) e devolve o canvas. */
function render(bmp: ImageBitmap, size: number, fit: Fit, bg: string | null, round: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  if (round) {
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.22);
    ctx.clip();
  }
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }
  const scale = fit === "cover" ? Math.max(size / bmp.width, size / bmp.height) : Math.min(size / bmp.width, size / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

const toBlob = (c: HTMLCanvasElement) => new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));

/** ICO com várias imagens PNG dentro (formato aceito por todos os navegadores atuais). */
async function buildIco(blobs: { size: number; blob: Blob }[]) {
  const pngs = await Promise.all(blobs.map(async (b) => ({ size: b.size, data: new Uint8Array(await b.blob.arrayBuffer()) })));
  const head = 6 + pngs.length * 16;
  const total = head + pngs.reduce((n, p) => n + p.data.length, 0);
  const buf = new ArrayBuffer(total);
  const dv = new DataView(buf);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, pngs.length, true);
  let offset = head;
  pngs.forEach((p, i) => {
    const e = 6 + i * 16;
    dv.setUint8(e, p.size);
    dv.setUint8(e + 1, p.size);
    dv.setUint16(e + 4, 1, true);
    dv.setUint16(e + 6, 32, true);
    dv.setUint32(e + 8, p.data.length, true);
    dv.setUint32(e + 12, offset, true);
    new Uint8Array(buf, offset, p.data.length).set(p.data);
    offset += p.data.length;
  });
  return new Blob([buf], { type: "image/x-icon" });
}

function download(name: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

interface Out {
  name: string;
  size: number;
  use: string;
  blob: Blob;
  url: string;
}

export default function FaviconTool() {
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [fileName, setFileName] = useState("");
  const [fit, setFit] = useState<Fit>("contain");
  const [useBg, setUseBg] = useState(false);
  const [bg, setBg] = useState("#ffffff");
  const [round, setRound] = useState(false);
  const [outs, setOuts] = useState<Out[]>([]);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState<boolean | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  // Refaz os arquivos sempre que a imagem ou uma opção muda.
  useEffect(() => {
    if (!bmp) return;
    let cancelled = false;
    (async () => {
      const list: Out[] = [];
      for (const s of SIZES) {
        const blob = await toBlob(render(bmp, s.size, fit, useBg ? bg : null, round));
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        list.push({ name: s.file, size: s.size, use: s.use, blob, url });
      }
      const ico = await buildIco(list.filter((o) => o.size <= 48).map((o) => ({ size: o.size, blob: o.blob })));
      const icoUrl = URL.createObjectURL(ico);
      urls.current.push(icoUrl);
      if (!cancelled) setOuts([{ name: "favicon.ico", size: 48, use: "Ícone clássico (16, 32 e 48 px juntos)", blob: ico, url: icoUrl }, ...list]);
    })().catch(() => !cancelled && setError("Não deu para gerar os ícones com esta imagem."));
    return () => {
      cancelled = true;
    };
  }, [bmp, fit, useBg, bg, round]);

  async function load(files: FileList | File[]) {
    const file = [...files].find((f) => f.type.startsWith("image/"));
    setError("");
    if (!file) {
      setError("Escolha um arquivo de imagem (PNG, JPG, WebP ou SVG).");
      return;
    }
    try {
      const b = await createImageBitmap(file);
      setBmp(b);
      setFileName(file.name);
      if (Math.min(b.width, b.height) < 512) setError(`A imagem tem ${b.width}×${b.height} px. Para um ícone nítido em todos os tamanhos, use pelo menos 512×512.`);
    } catch {
      setError("Não deu para abrir esta imagem. Ela pode estar corrompida ou em um formato que o navegador não lê.");
    }
  }

  async function copy() {
    setCopied(await copyText(HTML));
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <ToolLayout
      tool={tool}
      lead="Envie o seu logo e baixe o favicon.ico e os PNGs nos tamanhos que os navegadores e os celulares pedem, com o código para colar no site."
      explain={
        <>
          <h2>O que é o favicon</h2>
          <p>
            Favicon é o ícone pequeno que aparece na aba do navegador, nos favoritos e nos resultados do Google no celular. Um site sem favicon parece
            inacabado, e o Google mostra um globo cinza no lugar da sua marca.
          </p>
          <h2>Qual imagem enviar</h2>
          <ul>
            <li>Uma imagem quadrada, com pelo menos 512 × 512 pixels. Se não for quadrada, escolha se ela deve caber inteira ou preencher o quadrado.</li>
            <li>Um desenho simples: em 16 pixels, detalhes e texto viram borrão. Use só o símbolo do logo, sem o nome da empresa.</li>
            <li>PNG com fundo transparente funciona melhor. Se o seu logo tem fundo transparente e é escuro, ative uma cor de fundo para ele aparecer em abas escuras.</li>
          </ul>
          <h2>Para que serve cada arquivo</h2>
          <ul>
            <li>
              <strong>favicon.ico</strong>: o formato clássico, lido por qualquer navegador. Esta ferramenta coloca 16, 32 e 48 pixels no mesmo arquivo.
            </li>
            <li>
              <strong>PNGs de 16 e 32 px</strong>: o que os navegadores modernos preferem.
            </li>
            <li>
              <strong>apple-touch-icon.png</strong> (180 px): o ícone quando alguém adiciona o site à tela inicial do iPhone.
            </li>
            <li>
              <strong>PNGs de 192 e 512 px</strong>: usados pelo Android e por sites instaláveis.
            </li>
          </ul>
          <h2>Como instalar</h2>
          <p>
            Coloque os arquivos na pasta principal do site (a mesma do index) e cole o código acima dentro do &lt;head&gt; de todas as páginas. No WordPress, o
            caminho mais simples é Aparência → Personalizar → Identidade do site → Ícone do site, enviando a imagem de 512 px. Depois confira as cores do site
            com o <Link to="/ferramentas/contraste-cores">verificador de contraste</Link>.
          </p>
        </>
      }
    >
      <ToolPanel>
        <label
          htmlFor="fv-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void load(e.dataTransfer.files);
          }}
          className={cx("flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center", drag ? "border-brand bg-night-3" : "border-night-line-2 bg-night-2 hover:border-glow")}
        >
          <span className="text-lg font-bold">{bmp ? `Imagem: ${fileName}` : "Arraste o seu logo aqui ou toque para escolher"}</span>
          <span className="text-sm text-moon-muted">{bmp ? "Toque para trocar a imagem" : "PNG, JPG, WebP ou SVG, de preferência quadrada e com 512 px ou mais"}</span>
          <input
            id="fv-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void load(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {error && <p className="text-sm text-glow">{error}</p>}

        {bmp && (
          <>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                <label htmlFor="fv-fit" className="text-sm font-semibold text-moon-muted">
                  Imagem no quadrado
                </label>
                <select id="fv-fit" value={fit} onChange={(e) => setFit(e.target.value as Fit)} className={inputCls}>
                  <option value="contain">Caber inteira (sobram bordas)</option>
                  <option value="cover">Preencher (corta as sobras)</option>
                </select>
              </div>
              <label className="flex min-h-[52px] items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={useBg} onChange={(e) => setUseBg(e.target.checked)} className="h-5 w-5 accent-[var(--color-brand)]" />
                Cor de fundo
              </label>
              {useBg && <input type="color" aria-label="Cor de fundo do ícone" value={bg} onChange={(e) => setBg(e.target.value)} className="h-[52px] w-[60px] cursor-pointer rounded-xl border border-night-line-2 bg-night-2 p-1.5" />}
              <label className="flex min-h-[52px] items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} className="h-5 w-5 accent-[var(--color-brand)]" />
                Cantos arredondados
              </label>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {outs.map((o) => (
                <li key={o.name} className="flex flex-col gap-2 rounded-xl bg-night-2 p-3">
                  <span className="grid h-20 place-items-center rounded-lg bg-[repeating-conic-gradient(#1d2c66_0%_25%,#14245e_0%_50%)] bg-[length:16px_16px]">
                    <img src={o.url} alt="" width={Math.min(o.size, 64)} height={Math.min(o.size, 64)} style={{ imageRendering: o.size <= 32 ? "pixelated" : "auto" }} />
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-sm">{o.name}</b>
                    <span className="block text-[12px] text-moon-muted">{o.use}</span>
                  </span>
                  <button type="button" onClick={() => download(o.name, o.blob)} className="min-h-10 rounded-lg bg-brand px-3 text-sm font-bold text-white hover:bg-[#ec6a0c]">
                    Baixar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => outs.forEach((o, i) => setTimeout(() => download(o.name, o.blob), i * 250))} className={btnCls} disabled={!outs.length}>
                Baixar todos
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-moon-muted">Código para colar no &lt;head&gt;</span>
              <pre className="overflow-x-auto rounded-xl bg-[#081236] p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[#ffc9a3]">{HTML}</pre>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={copy} className={btnGhostCls}>
                  {copied ? "Código copiado" : "Copiar código"}
                </button>
                {copied === false && <span className="text-sm text-glow">O navegador bloqueou a cópia. Selecione o código e copie com Ctrl+C.</span>}
              </div>
            </div>
          </>
        )}
        <ToolDisclaimer>A imagem não sai do seu computador: os ícones são gerados no seu navegador, sem envio para nenhum servidor.</ToolDisclaimer>
      </ToolPanel>
    </ToolLayout>
  );
}
