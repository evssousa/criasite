// Regras puras do mídia kit (datas, estado dos números, validação do arquivo de dados, link de e-mail).
// Módulo COMUM aos sites. Datas como texto AAAA-MM-DD, contas em UTC para não depender do fuso. Ver docs/midia-kit.md, A2.
import type { IsoDate, MediaKit, MediaKitMetric, MetricRow, MetricState } from "./types.ts";

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const toMs = (d: IsoDate) => {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
};

export function addDays(date: IsoDate, days: number): IsoDate {
  return new Date(toMs(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** b menos a, em dias inteiros. */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((toMs(b) - toMs(a)) / DAY_MS);
}

export const validUntil = (kit: MediaKit): IsoDate => addDays(kit.updatedAt, kit.validDays);
export const isKitExpired = (kit: MediaKit, today: IsoDate): boolean => today > validUntil(kit);

export function metricState(m: MediaKitMetric, today: IsoDate, maxAgeDays: number): MetricState {
  if (m.value === null) return "sem-dados";
  if (!m.updatedAt || daysBetween(m.updatedAt, today) > maxAgeDays) return "vencido";
  return "ok";
}

/** Automáticos primeiro (auto: true), depois os manuais, cada um com o seu estado. */
export function resolveMetrics(auto: MediaKitMetric[], manual: MediaKitMetric[], today: IsoDate, maxAgeDays: number): MetricRow[] {
  return [
    ...auto.map((m): MetricRow => ({ ...m, state: metricState(m, today, maxAgeDays), auto: true })),
    ...manual.map((m): MetricRow => ({ ...m, state: metricState(m, today, maxAgeDays), auto: false })),
  ];
}

const AUDIENCE_CLAIM = /\b(milhares|milh(ão|ões)|mil (visitas|visitantes|acessos|leitores|usuários))\b|\d[\d.,]*\s*(visitas|visitantes|acessos|leitores|usuários|pageviews|seguidores)\b/i;
const BRAG_CLAIM = /(prêmio|premiad|líder|nº ?1|número 1|o maior|a maior)/i;

function validDate(d: unknown): d is IsoDate {
  return typeof d === "string" && DATE_RE.test(d) && !Number.isNaN(toMs(d)) && new Date(toMs(d)).toISOString().slice(0, 10) === d;
}

/** Textos do kit que não podem trazer número de audiência nem vaidade sem fonte. */
function allTexts(kit: MediaKit): string[] {
  return [
    kit.pitch.title,
    kit.pitch.lead,
    kit.audience.intro,
    kit.audience.note,
    ...kit.audience.why,
    ...kit.audience.categories,
    ...kit.audience.personas.flatMap((p) => [p.title, p.who, ...p.seeks]),
    ...kit.formats.flatMap((f) => [f.name, f.summary, ...f.includes, ...f.excludes, f.delivery, f.duration, f.marking, f.price ?? ""]),
    kit.adsenseNote.title,
    kit.adsenseNote.text,
    kit.sharedExcludes,
    ...kit.rules,
    ...kit.refused,
    ...kit.process.flatMap((p) => [p.title, p.text]),
    ...kit.firstEmail,
    kit.responseTime,
    ...kit.faq.flatMap((f) => [f.q, f.a]),
    kit.audienceOnRequest ?? "",
  ];
}

/** Lista de erros do arquivo de dados (vazia = ok). */
export function validateKit(kit: MediaKit, today: IsoDate): string[] {
  const errors: string[] = [];
  if (!validDate(kit.updatedAt)) errors.push(`kit: updatedAt inválido (${String(kit.updatedAt)})`);
  else if (kit.updatedAt > today) errors.push("kit: updatedAt no futuro");
  if (!validDate(kit.brand.launchedAt)) errors.push("kit: brand.launchedAt inválido");
  for (const m of kit.metrics) {
    if (m.value !== null) {
      if (!m.source) errors.push(`número ${m.id}: sem fonte`);
      if (!m.updatedAt) errors.push(`número ${m.id}: sem data`);
    }
    if (m.updatedAt !== null) {
      if (!validDate(m.updatedAt)) errors.push(`número ${m.id}: data inválida`);
      else if (m.updatedAt > today) errors.push(`número ${m.id}: data no futuro`);
    }
    if (m.series) {
      if (m.series.length < 3) errors.push(`número ${m.id}: série com menos de 3 pontos`);
      for (const p of m.series) if (!validDate(p.date)) errors.push(`número ${m.id}: ponto da série sem data válida`);
    }
  }
  for (const f of kit.formats) {
    if (f.includes.length === 0) errors.push(`formato ${f.id}: includes vazio`);
    if (f.excludes.length === 0) errors.push(`formato ${f.id}: excludes vazio`);
    if (f.price === "") errors.push(`formato ${f.id}: price vazio (use null para "Sob consulta")`);
  }
  for (const t of allTexts(kit)) {
    if (AUDIENCE_CLAIM.test(t)) errors.push(`número de audiência fora de metrics: "${t.slice(0, 60)}"`);
    if (BRAG_CLAIM.test(t)) errors.push(`frase de vaidade sem fonte: "${t.slice(0, 60)}"`);
  }
  return errors;
}

/** mailto: com assunto "[Comercial] " e corpo do modelo, com o formato de interesse preenchido. */
export function mailtoHref(kit: MediaKit, formatName?: string): string {
  const body = kit.mailTemplate.map((l) => (l.startsWith("Formato de interesse:") ? `Formato de interesse: ${formatName ?? "ainda não sei"}` : l)).join("\r\n");
  return `mailto:${kit.brand.email}?subject=${encodeURIComponent(`[${kit.brand.mailSubject}] `)}&body=${encodeURIComponent(body)}`;
}

/** DD/MM/AAAA, sem Intl (igual em qualquer máquina). */
export function formatDateBR(date: IsoDate): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/** Data de hoje no Brasil (AAAA-MM-DD). */
export function todayInBrazil(now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}
