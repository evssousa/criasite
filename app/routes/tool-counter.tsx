import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-counter";
import { ToolDisclaimer, ToolLayout, ToolPanel, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("contador-de-caracteres")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Contador de caracteres e palavras online", description: tool.description, path: "/ferramentas/contador-de-caracteres" });
}

/** Limites usados no dia a dia de quem cuida de um site (caracteres). */
const LIMITS = [
  { label: "Título no Google", max: 60 },
  { label: "Descrição no Google", max: 155 },
  { label: "Bio do Instagram", max: 150 },
  { label: "Post no X", max: 280 },
  { label: "SMS", max: 160 },
];

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function CounterTool() {
  const [text, setText] = useState("Padaria da Ana | Pães de fermentação natural no Recife");
  const trimmed = text.trim();
  const chars = [...text].length;
  const noSpaces = [...text.replace(/\s/g, "")].length;
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = text ? text.split(/\n/).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));

  const stats = [
    ["Caracteres", fmt(chars)],
    ["Sem espaços", fmt(noSpaces)],
    ["Palavras", fmt(words)],
    ["Linhas", fmt(lines)],
    ["Parágrafos", fmt(paragraphs)],
    ["Leitura", words ? `${minutes} min` : "0 min"],
  ];

  return (
    <ToolLayout
      tool={tool}
      lead="Cole ou digite o texto: a contagem atualiza na hora e mostra se ele cabe no Google, no Instagram, no X e no SMS."
      explain={
        <>
          <h2>Por que contar caracteres</h2>
          <p>
            Vários lugares cortam o texto quando ele passa do limite. No Google, o título de uma página aparece inteiro até cerca de 60 caracteres e a
            descrição até uns 155; o resto vira reticências. Na bio do Instagram, o campo simplesmente não aceita mais de 150. Saber o tamanho antes de
            publicar evita a frase cortada no meio.
          </p>
          <h2>Como a contagem é feita</h2>
          <p>
            Espaços, pontuação e quebras de linha contam como caracteres, porque ocupam espaço na tela. Emojis contam como um caractere aqui, mas algumas
            redes contam como dois. Palavras são separadas por espaços. O tempo de leitura considera 200 palavras por minuto, a média de um adulto lendo na
            tela.
          </p>
          <h2>Os limites do Google são exatos?</h2>
          <p>
            Não. O Google corta pela largura em pixels, não pelo número de letras: um título cheio de “m” e “w” cabe menos que um com “i” e “l”. Os números
            daqui são uma margem segura. Para ver como o seu link fica de verdade, use o <Link to="/ferramentas/meta-tags">gerador de meta tags</Link>, que
            mostra a prévia.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cnt-text" className="text-sm font-semibold text-moon-muted">
            Seu texto
          </label>
          <textarea id="cnt-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} h-auto resize-y py-3 leading-relaxed`} />
        </div>

        <dl aria-live="polite" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 rounded-xl bg-night-2 p-3.5">
              <dt className="text-xs font-semibold text-moon-muted">{k}</dt>
              <dd className="num text-2xl font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        <ul className="flex flex-col gap-2">
          {LIMITS.map((l) => {
            const over = chars > l.max;
            return (
              <li key={l.label} className="flex flex-col gap-1.5">
                <span className="flex justify-between gap-3 text-sm">
                  <span>{l.label}</span>
                  <span className={cx("num font-bold", over ? "text-down-night" : "text-up-night")}>
                    {chars}/{l.max} {over ? `· passou ${chars - l.max}` : "· cabe"}
                  </span>
                </span>
                <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-night-3">
                  <span className={cx("block h-full", over ? "bg-down-night" : "bg-brand")} style={{ width: `${Math.min(100, (chars / l.max) * 100)}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
        <ToolDisclaimer />
      </ToolPanel>
    </ToolLayout>
  );
}
