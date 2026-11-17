import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-contrast";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnGhostCls, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { contrastRatio, normalizeHex } from "~/lib/contraste";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("contraste-cores")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Verificador de contraste de cores (WCAG AA e AAA)", description: tool.description, path: "/ferramentas/contraste-cores" });
}

const CHECKS = [
  { label: "Texto normal", level: "AA", min: 4.5 },
  { label: "Texto normal", level: "AAA", min: 7 },
  { label: "Texto grande", level: "AA", min: 3 },
  { label: "Texto grande", level: "AAA", min: 4.5 },
  { label: "Botões e ícones", level: "AA", min: 3 },
];

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const hex = normalizeHex(value);
  return (
    <Field label={label} htmlFor={id} hint={hex ? undefined : "Use um código como #0c1a4b."}>
      <span className="flex gap-2">
        <input
          type="color"
          aria-label={`${label} (seletor de cor)`}
          value={hex ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-[52px] w-[60px] shrink-0 cursor-pointer rounded-xl border border-night-line-2 bg-night-2 p-1.5"
        />
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className={cx(inputCls, "num", !hex && "border-down-night")} />
      </span>
    </Field>
  );
}

export default function ContrastTool() {
  const [fg, setFg] = useState("#0c1a4b");
  const [bg, setBg] = useState("#ffffff");
  const f = normalizeHex(fg);
  const b = normalizeHex(bg);
  const r = f && b ? contrastRatio(f, b) : null;

  return (
    <ToolLayout
      tool={tool}
      lead="Escolha a cor do texto e a do fundo: a ferramenta calcula o contraste e diz se passa nos testes de acessibilidade do WCAG."
      explain={
        <>
          <h2>O que é contraste e por que importa</h2>
          <p>
            Contraste é a diferença de luminosidade entre o texto e o fundo. Quando ele é baixo, o texto cansa a vista, some no sol e não é lido por quem tem
            baixa visão. É a falha de acessibilidade mais comum em sites, e também a mais fácil de corrigir.
          </p>
          <h2>Como ler o resultado</h2>
          <p>
            O contraste é uma razão de 1 a 21: preto sobre branco dá 21:1; duas cores iguais dão 1:1. As regras do WCAG, o padrão internacional de
            acessibilidade na web, pedem:
          </p>
          <ul>
            <li>
              <strong>Nível AA</strong> (o mínimo recomendado): 4,5:1 para texto normal e 3:1 para texto grande (a partir de 24 px, ou 19 px em negrito) e para
              botões e ícones.
            </li>
            <li>
              <strong>Nível AAA</strong> (o mais exigente): 7:1 para texto normal e 4,5:1 para texto grande.
            </li>
          </ul>
          <h2>Dicas para escolher cores</h2>
          <ul>
            <li>Cinza claro sobre branco é a combinação que mais reprova. Escureça o texto antes de clarear o fundo.</li>
            <li>Cores vivas (laranja, amarelo, verde-claro) raramente servem como cor de texto sobre branco; use-as em botões com texto escuro ou branco que passe.</li>
            <li>Não use só a cor para passar informação (erro em vermelho, por exemplo): acrescente um ícone ou uma palavra.</li>
          </ul>
          <p>
            Depois de definir as cores do site, gere o <Link to="/ferramentas/gerador-favicon">favicon</Link> com o mesmo visual.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <ColorField id="ct-fg" label="Cor do texto" value={fg} onChange={setFg} />
            <ColorField id="ct-bg" label="Cor do fundo" value={bg} onChange={setBg} />
            <div>
              <button
                type="button"
                onClick={() => {
                  setFg(bg);
                  setBg(fg);
                }}
                className={btnGhostCls}
              >
                Trocar texto e fundo
              </button>
            </div>
          </div>

          <div aria-live="polite" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 rounded-2xl bg-lime p-5 text-night">
              <span className="text-sm font-bold">Contraste</span>
              <span className="num text-4xl font-bold">{r ? `${r.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}:1` : "—"}</span>
              <span className="text-sm font-semibold">{r === null ? "Digite duas cores válidas." : r >= 7 ? "Excelente: passa em todos os testes." : r >= 4.5 ? "Bom: passa no AA para texto normal." : r >= 3 ? "Só serve para texto grande e ícones." : "Fraco: o texto será difícil de ler."}</span>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {CHECKS.map((c) => {
                const ok = r !== null && r >= c.min;
                return (
                  <li key={c.label + c.level} className="flex items-center justify-between gap-2 rounded-xl bg-night-2 px-3.5 py-2.5 text-sm">
                    <span>
                      {c.label} <b className="text-moon-muted">{c.level}</b>
                    </span>
                    <b className={cx(r === null ? "text-moon-muted" : ok ? "text-up-night" : "text-down-night")}>{r === null ? "—" : ok ? "Passa" : "Reprova"}</b>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: b ?? "#ffffff", color: f ?? "#000000" }}>
          <p className="text-[28px] leading-tight font-extrabold">Texto grande de exemplo</p>
          <p className="mt-2 text-base leading-relaxed">
            Este é um texto normal de exemplo, do tamanho de um parágrafo. Confira se você consegue ler sem esforço, também com o brilho da tela baixo.
          </p>
        </div>
        <ToolDisclaimer />
      </ToolPanel>
    </ToolLayout>
  );
}
