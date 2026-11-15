import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-image";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("comprimir-imagem")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Comprimir imagem online grátis (JPG, PNG e WebP)", description: tool.description, path: "/ferramentas/comprimir-imagem" });
}

type Format = "image/webp" | "image/jpeg" | "same";
const MAX_FILES = 20;

interface Item {
  id: number;
  file: File;
  status: "working" | "done" | "error";
  out?: Blob;
  outName?: string;
  url?: string;
  width?: number;
  height?: number;
  error?: string;
}

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const extOf = (type: string) => (type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg");

async function compress(file: File, format: Format, quality: number, maxWidth: number) {
  const bmp = await createImageBitmap(file);
  const scale = maxWidth > 0 && bmp.width > maxWidth ? maxWidth / bmp.width : 1;
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const type = format === "same" ? (file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg") : format;
  // JPG não tem transparência: fundo branco no lugar do preto.
  if (type === "image/jpeg") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality / 100));
  if (!blob) throw new Error("O navegador não conseguiu gerar a imagem.");
  // Sem redimensionar e no mesmo formato, às vezes o original já é menor: fica com ele.
  const out = blob.size >= file.size && scale === 1 && type === file.type ? file : blob;
  const name = file.name.replace(/\.[^.]+$/, "") + `-otimizada.${extOf(out.type || type)}`;
  return { out, name, w, h };
}

export default function ImageTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<Format>("image/webp");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [drag, setDrag] = useState(false);
  const [notice, setNotice] = useState("");
  const nextId = useRef(1);
  const urls = useRef<string[]>([]);

  // Libera a memória das prévias ao sair da página.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  async function run(list: Item[]) {
    for (const it of list) {
      try {
        const r = await compress(it.file, format, quality, maxWidth);
        const url = URL.createObjectURL(r.out);
        urls.current.push(url);
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "done", out: r.out, outName: r.name, url, width: r.w, height: r.h } : x)));
      } catch {
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "error", error: "Não deu para abrir esta imagem. Ela pode estar corrompida ou em um formato que o navegador não lê (como HEIC)." } : x)));
      }
    }
  }

  function add(files: FileList | File[]) {
    const imgs = [...files].filter((f) => f.type.startsWith("image/"));
    const skipped = [...files].length - imgs.length;
    const room = MAX_FILES - items.length;
    const list = imgs.slice(0, Math.max(0, room)).map((file): Item => ({ id: nextId.current++, file, status: "working" }));
    setNotice(
      [skipped > 0 && `${skipped} arquivo(s) não são imagens e ficaram de fora.`, imgs.length > room && `Limite de ${MAX_FILES} imagens por vez.`].filter(Boolean).join(" "),
    );
    if (!list.length) return;
    setItems((prev) => [...prev, ...list]);
    void run(list);
  }

  function redo() {
    const list = items.map((it) => ({ ...it, status: "working" as const, out: undefined, url: undefined }));
    setItems(list);
    void run(list);
  }

  function save(it: Item) {
    if (!it.url || !it.outName) return;
    const a = document.createElement("a");
    a.href = it.url;
    a.download = it.outName;
    a.click();
  }

  const done = items.filter((i) => i.status === "done" && i.out);
  const before = done.reduce((s, i) => s + i.file.size, 0);
  const after = done.reduce((s, i) => s + (i.out?.size ?? 0), 0);

  return (
    <ToolLayout
      tool={tool}
      lead="Arraste as fotos, escolha o formato e baixe as versões leves. As imagens não são enviadas para lugar nenhum: tudo acontece no seu navegador."
      explain={
        <>
          <h2>Por que comprimir as imagens do site</h2>
          <p>
            Fotos direto do celular têm 3 a 6 MB. Em um site, a mesma foto pode ter 150 KB sem diferença que alguém perceba na tela. Imagem pesada é a causa
            mais comum de site lento no celular, e o Google usa a velocidade como um dos critérios para ordenar os resultados. Comprimir antes de subir é o
            ganho mais fácil que existe.
          </p>
          <h2>WebP, JPG ou PNG?</h2>
          <ul>
            <li>
              <strong>WebP</strong> (recomendado): em geral 25% a 35% menor que o JPG na mesma qualidade, com transparência. Todos os navegadores atuais
              abrem.
            </li>
            <li>
              <strong>JPG</strong>: o formato mais aceito em qualquer lugar (e-mail, sistemas antigos, gráficas). Não tem transparência: o fundo vira branco.
            </li>
            <li>
              <strong>PNG</strong>: para logos e prints com texto e cores chapadas. Para fotos, fica muito pesado. Em “manter o formato”, o PNG continua PNG
              e só diminui se você reduzir a largura.
            </li>
          </ul>
          <h2>Qual largura usar</h2>
          <p>
            Uma imagem que ocupa a tela inteira no computador raramente precisa de mais de 1920 pixels de largura. Foto de produto ou de post de blog fica
            bem com 1200. Miniaturas e fotos de equipe, 600 a 800. Medir antes evita mandar ao celular uma imagem quatro vezes maior do que a tela dele.
          </p>
          <h2>Qualidade: quanto baixar?</h2>
          <p>
            Entre 75 e 85 a diferença para o original quase nunca aparece. Abaixo de 60 começam a surgir borrões em céu, pele e degradês. Compare a prévia
            com o original antes de publicar. Depois de comprimir, confira se o título e a descrição da página também estão no ponto com o{" "}
            <Link to="/ferramentas/meta-tags">gerador de meta tags</Link>.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div className="flex flex-wrap gap-4">
          <Field label="Formato de saída" htmlFor="img-fmt">
            <select id="img-fmt" value={format} onChange={(e) => setFormat(e.target.value as Format)} className={inputCls}>
              <option value="image/webp">WebP (recomendado)</option>
              <option value="image/jpeg">JPG</option>
              <option value="same">Manter o formato</option>
            </select>
          </Field>
          <Field label={`Qualidade: ${quality}`} htmlFor="img-q" hint="75 a 85 é o ponto certo para fotos.">
            <input id="img-q" type="range" min={40} max={95} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="h-[52px] w-full accent-[var(--color-brand)]" />
          </Field>
          <Field label="Largura máxima" htmlFor="img-w">
            <select id="img-w" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className={inputCls}>
              <option value={0}>Manter a original</option>
              <option value={2560}>2560 px</option>
              <option value={1920}>1920 px (tela cheia)</option>
              <option value={1200}>1200 px (blog, produto)</option>
              <option value={800}>800 px (miniatura)</option>
            </select>
          </Field>
        </div>

        <label
          htmlFor="img-files"
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add(e.dataTransfer.files);
          }}
          className={cx(
            "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center",
            drag ? "border-brand bg-night-3" : "border-night-line-2 bg-night-2 hover:border-glow",
          )}
        >
          <span className="text-lg font-bold">Arraste as imagens aqui ou toque para escolher</span>
          <span className="text-sm text-moon-muted">JPG, PNG ou WebP · até {MAX_FILES} por vez</span>
          <input
            id="img-files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) add(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {notice && <p className="text-sm text-glow">{notice}</p>}

        {items.length > 0 && (
          <>
            {done.length > 0 && (
              <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-lime p-5 text-night">
                <span className="flex flex-col">
                  <span className="text-sm font-bold">Economia total</span>
                  <span className="num text-3xl font-bold">{before > 0 ? `${Math.max(0, Math.round((1 - after / before) * 100))}%` : "0%"}</span>
                </span>
                <span className="text-sm font-semibold">
                  {kb(before)} → {kb(after)}
                </span>
              </div>
            )}
            <ul className="flex flex-col gap-2">
              {items.map((it) => {
                const saved = it.out ? Math.round((1 - it.out.size / it.file.size) * 100) : 0;
                return (
                  <li key={it.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-night-2 p-3">
                    {it.url ? <img src={it.url} alt="" className="h-14 w-14 rounded-lg bg-night-3 object-cover" /> : <span className="h-14 w-14 rounded-lg bg-night-3" />}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-semibold">{it.file.name}</span>
                      <span className="text-[13px] text-moon-muted">
                        {it.status === "working" && "Comprimindo…"}
                        {it.status === "error" && <span className="text-down-night">{it.error}</span>}
                        {it.status === "done" && it.out && (
                          <>
                            {kb(it.file.size)} → <b className="text-moon">{kb(it.out.size)}</b> ·{" "}
                            <b className={saved > 0 ? "text-up-night" : "text-moon-muted"}>{saved > 0 ? `${saved}% menor` : "já estava otimizada"}</b> · {it.width}×{it.height}
                          </>
                        )}
                      </span>
                    </span>
                    {it.status === "done" && (
                      <button type="button" onClick={() => save(it)} className="min-h-11 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-[#ec6a0c]">
                        Baixar
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => done.forEach((it, i) => setTimeout(() => save(it), i * 250))} disabled={!done.length} className={btnCls}>
                Baixar todas
              </button>
              <button type="button" onClick={redo} className={btnGhostCls}>
                Refazer com as opções novas
              </button>
              <button type="button" onClick={() => setItems([])} className={btnGhostCls}>
                Limpar
              </button>
            </div>
          </>
        )}
        <ToolDisclaimer>As imagens não saem do seu computador: a compressão acontece no seu navegador, sem envio para nenhum servidor.</ToolDisclaimer>
      </ToolPanel>
    </ToolLayout>
  );
}
