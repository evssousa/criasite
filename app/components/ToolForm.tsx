// Peças comuns dos geradores (arquivo de instruções e prompt para site): ícones, caixa de campo, seção numerada,
// mensagem e cartão de segredo, status do rascunho e download. Moradas aqui para não duplicar o código entre as ferramentas.
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "~/components/ui";
import type { SecretHit } from "~/lib/segredos";

// ───────────── Ícones (SVG inline, sem biblioteca) ─────────────

export type IconName = "check" | "x" | "alert" | "lock" | "file" | "disk" | "info" | "plus" | "chat" | "arrow";

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  switch (name) {
    case "check":
      return (
        <svg {...p}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case "x":
      return (
        <svg {...p}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "alert":
      return (
        <svg {...p}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 10v4.5M12 17.5v.01" />
        </svg>
      );
    case "lock":
      return (
        <svg {...p}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "file":
      return (
        <svg {...p}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "plus":
      return (
        <svg {...p}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "chat":
      return (
        <svg {...p}>
          <path d="M4 5h16v11H9l-5 4V5Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...p}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "disk":
      return (
        <svg {...p}>
          <path d="M5 4h11l3 3v13H5V4Z" />
          <path d="M8 4v5h7V4M8 20v-6h8v6" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8v.01" />
        </svg>
      );
  }
}

/** Baixa um texto como arquivo. O tipo padrão é Markdown em UTF-8. */
export function download(name: string, text: string, type = "text/markdown;charset=utf-8") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export const AMBER = "border-[#ffc857] focus:border-[#ffc857]";

export function Box({ label, id, aside, children }: { label: string; id: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-moon-muted">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function HitMsg({ hit, id, advice = "Apague e guarde em uma variável de ambiente." }: { hit?: SecretHit; id: string; advice?: string }) {
  if (!hit) return null;
  return (
    <p id={`${id}-segredo`} className="flex items-start gap-1.5 text-sm text-[#ffc857]">
      <span className="mt-0.5 shrink-0">
        <Icon name="alert" size={16} />
      </span>
      Parece {hit.kind}. {advice}
    </p>
  );
}

export function Section({ n, title, help, action, children }: { n: number; title: string; help: string; action?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 border-t border-night-line pt-6 first:border-0 first:pt-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <legend className="float-left flex items-center gap-3 text-lg font-extrabold">
            <span aria-hidden className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-glow">
              {n}
            </span>
            {title}
          </legend>
          {action}
        </div>
        <p className="clear-both text-sm text-moon-muted">{help}</p>
      </div>
      {children}
    </fieldset>
  );
}

/** Cartão "Isso parece um segredo", com a lista de achados, o atalho para cada campo e a confirmação. */
export function SecretCard({ hits, confirmed, onConfirm, intro }: { hits: SecretHit[]; confirmed: boolean; onConfirm: (checked: boolean) => void; intro: string }) {
  if (hits.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#ffc857] bg-[#ffc857]/10 p-4">
      <div className="flex items-center gap-2 text-[#ffc857]">
        <Icon name="alert" size={18} />
        <h3 className="text-base font-extrabold text-moon">Isso parece um segredo</h3>
      </div>
      <p className="text-sm">{intro}</p>
      <ul className="flex flex-col text-sm">
        {hits.map((h) => (
          <li key={h.fieldId + h.kind} className="flex flex-wrap items-center justify-between gap-x-3">
            <span>
              {h.label}: {h.kind} <span className="num text-moon-muted">({h.masked})</span>
            </span>
            <button type="button" onClick={() => document.getElementById(h.fieldId)?.focus()} className="min-h-10 text-glow underline underline-offset-4">
              Ir para o campo
            </button>
          </li>
        ))}
      </ul>
      <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm">
        <input type="checkbox" checked={confirmed} onChange={(e) => onConfirm(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
        Não é um segredo de verdade (por exemplo, um valor de teste). Liberar copiar e baixar.
      </label>
    </div>
  );
}

/** Estado do rascunho na barra de topo dos geradores. */
export function DraftStatus({ status }: { status: "none" | "saved" | "nostorage" | "paused" }) {
  return (
    <span className="inline-flex min-h-5 items-center gap-1.5 text-xs text-moon-muted">
      {status === "saved" && (
        <>
          <Icon name="disk" size={14} /> Rascunho salvo neste navegador.
        </>
      )}
      {status === "nostorage" && (
        <>
          <Icon name="info" size={14} /> Sem armazenamento: o rascunho vale só nesta visita.
        </>
      )}
      {status === "paused" && (
        <span className="inline-flex items-center gap-1.5 text-[#ffc857]">
          <Icon name="alert" size={14} /> Rascunho pausado: há um possível segredo nos campos.
        </span>
      )}
    </span>
  );
}

/** Escolha única (radio) em pílulas ou cartões, com roving tabindex e setas que já marcam. */
export function RadioGroup<T extends string>({
  labelledBy,
  options,
  value,
  onChange,
  variant,
  className,
  allowClear,
}: {
  labelledBy: string;
  options: { v: T; label: string; desc?: string; visual?: ReactNode }[];
  value: T | "";
  onChange: (v: T | "") => void;
  variant: "pill" | "card";
  className?: string;
  allowClear?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = options.findIndex((o) => o.v === value);
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!forward && !back) return;
    e.preventDefault();
    const next = (i + (forward ? 1 : options.length - 1)) % options.length;
    onChange(options[next].v);
    refs.current[next]?.focus();
  }
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-labelledby={labelledBy} className={className ?? (variant === "pill" ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-3")}>
        {options.map((o, i) => {
          const on = o.v === value;
          return (
            <button
              key={o.v}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (checkedIndex < 0 && i === 0) ? 0 : -1}
              onClick={() => onChange(o.v)}
              onKeyDown={(e) => onKey(e, i)}
              className={
                variant === "pill"
                  ? cx(
                      "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors",
                      on ? "border-brand bg-brand text-white" : "border-night-line-2 bg-night-2 text-moon hover:bg-night-3",
                    )
                  : cx("relative flex min-h-11 flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-colors", on ? "border-brand bg-brand/10" : "border-night-line-2 bg-night-2 hover:bg-night-3")
              }
            >
              {variant === "pill" ? (
                <>
                  {on && <Icon name="check" size={14} />}
                  {o.label}
                </>
              ) : (
                <>
                  {on && (
                    <span className="absolute top-2.5 right-2.5 z-10 grid h-[22px] w-[22px] place-items-center rounded-full bg-brand text-white">
                      <Icon name="check" size={14} />
                    </span>
                  )}
                  {o.visual}
                  <span className="pr-7 text-[15px] leading-snug font-bold">{o.label}</span>
                  {o.desc && <span className="text-xs leading-snug text-moon-muted">{o.desc}</span>}
                </>
              )}
            </button>
          );
        })}
      </div>
      {allowClear && value !== "" && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            refs.current[0]?.focus();
          }}
          className="min-h-10 w-fit text-sm font-bold text-moon-muted underline-offset-4 hover:text-moon hover:underline"
        >
          Limpar escolha
        </button>
      )}
    </div>
  );
}
