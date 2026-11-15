import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-convert";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("converter-imagem")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Converter imagem para WebP, PNG ou JPG online", description: tool.description, path: "/ferramentas/converter-imagem" });
}

type Target = "image/webp" | "image/png" | "image/jpeg";
const TARGETS: { type: Target; label: string; ext: string; lossy: boolean }[] = [
  { type: "image/webp", label: "WebP", ext: "webp", lossy: true },
  { type: "image/png", label: "PNG", ext: "png", lossy: false },
  { type: "image/jpeg", label: "JPG", ext: "jpg", lossy: true },
];
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
}

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

async function convert(file: File, target: Target, quality: number) {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d")!;
  // JPG não tem transparência: fundo branco no lugar do preto.
  if (target === "image/jpeg") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bmp, 0, 0);
  const w = bmp.width;
  const h = bmp.height;
  bmp.close();
  const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, target, quality / 100));
  if (!out || out.type !== target) throw new Error("formato não suportado");
  const ext = TARGETS.find((t) => t.type === target)!.ext;
  return { out, name: `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, w, h };
}

export default function ConvertTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState<Target>("image/webp");
  const [quality, setQuality] = useState(85);
  const [drag, setDrag] = useState(false);
  const [notice, setNotice] = useState("");
  const nextId = useRef(1);
  const urls = useRef<string[]>([]);
  const lossy = TARGETS.find((t) => t.type === target)!.lossy;

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  async function run(list: Item[]) {
    for (const it of list) {
      try {
        const r = await convert(it.file, target, quality);
        const url = URL.createObjectURL(r.out);
        urls.current.push(url);
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "done", out: r.out, outName: r.name, url, width: r.w, height: r.h } : x)));
      } catch {
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: "error" } : x)));
      }
    }
  }

  function add(files: FileList | File[]) {
    const all = [...files];
    const imgs = all.filter((f) => f.type.startsWith("image/"));
    const room = MAX_FILES - items.length;
    const list = imgs.slice(0, Math.max(0, room)).map((file): Item => ({ id: nextId.current++, file, status: "working" }));
    setNotice([all.length - imgs.length > 0 && `${all.length - imgs.length} arquivo(s) não são imagens e ficaram de fora.`, imgs.length > room && `Limite de ${MAX_FILES} imagens por vez.`].filter(Boolean).join(" "));
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

  return (
    <ToolLayout
      tool={tool}
      lead="Arraste as imagens, escolha o formato de saída e baixe. A conversão acontece no seu navegador: nenhum arquivo é enviado."
      explain={
        <>
          <h2>Quando converter a imagem</h2>
          <p>
            Cada formato serve para um uso. Converter para o formato certo antes de publicar deixa o site mais leve sem mudar o visual, e evita problemas de
            compatibilidade com e-mail, gráficas e sistemas antigos.
          </p>
          <ul>
            <li>
              <strong>Para WebP</strong>: fotos e imagens do site. É 25% a 35% menor que o JPG na mesma qualidade e aceita transparência.
            </li>
            <li>
              <strong>Para JPG</strong>: quando o destino não aceita WebP (alguns e-mails, gráficas, sistemas de cadastro). O fundo transparente vira branco.
            </li>
            <li>
              <strong>Para PNG</strong>: logos, ícones e prints com texto e cores chapadas, quando você precisa de transparência sem perda.
            </li>
          </ul>
          <h2>Converter perde qualidade?</h2>
          <p>
            WebP e JPG são formatos com perda: cada vez que você converte e salva, parte da informação é descartada. Por isso, guarde sempre o arquivo
            original e converta a partir dele, não de uma cópia já convertida. PNG não perde qualidade, mas fica bem maior em fotos. Entre 80 e 90 de
            qualidade a diferença quase nunca aparece.
          </p>
          <h2>Quero também diminuir o tamanho</h2>
          <p>
            Esta ferramenta só troca o formato e mantém as dimensões. Para reduzir a largura e o peso de uma vez, use o{" "}
            <Link to="/ferramentas/comprimir-imagem">compressor de imagem</Link>.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div className="flex flex-wrap gap-4">
          <Field label="Converter para" htmlFor="cv-fmt">
            <select id="cv-fmt" value={target} onChange={(e) => setTarget(e.target.value as Target)} className={inputCls}>
              {TARGETS.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={lossy ? `Qualidade: ${quality}` : "Qualidade"} htmlFor="cv-q" hint={lossy ? "80 a 90 é o ponto certo para fotos." : "PNG não perde qualidade."}>
            <input id="cv-q" type="range" min={40} max={100} step={5} value={quality} disabled={!lossy} onChange={(e) => setQuality(Number(e.target.value))} className="h-[52px] w-full accent-[var(--color-brand)] disabled:opacity-40" />
          </Field>
        </div>

        <label
          htmlFor="cv-files"
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
          className={cx("flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center", drag ? "border-brand bg-night-3" : "border-night-line-2 bg-night-2 hover:border-glow")}
        >
          <span className="text-lg font-bold">Arraste as imagens aqui ou toque para escolher</span>
          <span className="text-sm text-moon-muted">JPG, PNG, WebP, GIF ou AVIF · até {MAX_FILES} por vez</span>
          <input
            id="cv-files"
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
            <ul className="flex flex-col gap-2">
              {items.map((it) => (
                <li key={it.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-night-2 p-3">
                  {it.url ? <img src={it.url} alt="" className="h-14 w-14 rounded-lg bg-night-3 object-cover" /> : <span className="h-14 w-14 rounded-lg bg-night-3" />}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{it.file.name}</span>
                    <span className="text-[13px] text-moon-muted">
                      {it.status === "working" && "Convertendo…"}
                      {it.status === "error" && <span className="text-down-night">Não deu para converter. O arquivo pode estar corrompido ou o navegador não gera esse formato.</span>}
                      {it.status === "done" && it.out && (
                        <>
                          {kb(it.file.size)} → <b className="text-moon">{kb(it.out.size)}</b> · {it.width}×{it.height}
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
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={!done.length} onClick={() => done.forEach((it, i) => setTimeout(() => save(it), i * 250))} className={btnCls}>
                Baixar todas
              </button>
              <button type="button" onClick={redo} className={btnGhostCls}>
                Converter de novo com as opções novas
              </button>
              <button type="button" onClick={() => setItems([])} className={btnGhostCls}>
                Limpar
              </button>
            </div>
          </>
        )}
        <ToolDisclaimer>As imagens não saem do seu computador: a conversão acontece no seu navegador, sem envio para nenhum servidor.</ToolDisclaimer>
      </ToolPanel>
    </ToolLayout>
  );
}
