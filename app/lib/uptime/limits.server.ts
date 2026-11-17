// Limites da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md, A7). Tudo em memória, sem banco: por IP do
// visitante, por alvo, global e cache de 30 s. Memória é por processo (se a hospedagem rodar mais de um, o limite real
// fica multiplicado; o limite global segura). Nada daqui é gravado em disco nem em log.
import type { CheckResult } from "./types.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const CACHE_MS = 30_000;

const IP_PER_MINUTE = 5;
const IP_PER_HOUR = 30;
const TARGET_PER_MINUTE = 4;
const GLOBAL_PER_MINUTE = 60;
const GLOBAL_PARALLEL = 8;
const MAX_KEYS = 20_000;

const byIp = new Map<string, number[]>();
const byTarget = new Map<string, number[]>();
const cache = new Map<string, { at: number; result: CheckResult }>();
let globalTimes: number[] = [];
let running = 0;
let calls = 0;

/**
 * IP do visitante para o limite. Por padrão, o ÚLTIMO valor do x-forwarded-for (o que o proxy mais próximo anotou; o
 * primeiro pode ser forjado pelo visitante), depois x-real-ip, depois "local". A regra final depende do diagnóstico
 * /api/cron/cabecalhos (ver docs/ferramenta-fora-do-ar.md, pergunta em aberto 1).
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  const last = xff?.split(",").at(-1)?.trim();
  return last || request.headers.get("x-real-ip")?.trim() || "local";
}

function prune(times: number[], now: number, window: number) {
  let i = 0;
  while (i < times.length && now - times[i] >= window) i++;
  if (i > 0) times.splice(0, i);
  return times;
}

function sweep(now: number) {
  calls++;
  if (calls % 200 !== 0 && byIp.size < MAX_KEYS && byTarget.size < MAX_KEYS && cache.size < MAX_KEYS) return;
  for (const [k, v] of byIp) if (prune(v, now, HOUR).length === 0) byIp.delete(k);
  for (const [k, v] of byTarget) if (prune(v, now, MINUTE).length === 0) byTarget.delete(k);
  for (const [k, v] of cache) if (now - v.at > CACHE_MS) cache.delete(k);
}

export type Take = { ok: true } | { ok: false; retryAfter: number };

/** Conta uma chamada válida (inclusive as respondidas pelo cache) para o IP. */
export function takeIp(ip: string, now = Date.now()): Take {
  sweep(now);
  const times = prune(byIp.get(ip) ?? [], now, HOUR);
  const lastMinute = times.filter((t) => now - t < MINUTE);
  if (lastMinute.length >= IP_PER_MINUTE) return { ok: false, retryAfter: Math.max(1, Math.ceil((lastMinute[0] + MINUTE - now) / 1000)) };
  if (times.length >= IP_PER_HOUR) return { ok: false, retryAfter: Math.max(1, Math.ceil((times[0] + HOUR - now) / 1000)) };
  times.push(now);
  byIp.set(ip, times);
  return { ok: true };
}

/** Resultado guardado há menos de 30 s para o mesmo endereço normalizado. */
export function cachedResult(key: string, now = Date.now()): CheckResult | null {
  const hit = cache.get(key);
  if (!hit || now - hit.at > CACHE_MS) return null;
  return { ...hit.result, cached: true };
}

export function remember(key: string, result: CheckResult, now = Date.now()) {
  cache.set(key, { at: now, result });
}

/** No máximo 4 checagens reais por minuto para o mesmo site. */
export function takeTarget(host: string, now = Date.now()): Take {
  const times = prune(byTarget.get(host) ?? [], now, MINUTE);
  if (times.length >= TARGET_PER_MINUTE) return { ok: false, retryAfter: Math.max(1, Math.ceil((times[0] + MINUTE - now) / 1000)) };
  times.push(now);
  byTarget.set(host, times);
  return { ok: true };
}

/** 60 checagens reais por minuto no total e no máximo 8 ao mesmo tempo. Chame release() num finally. */
export function takeGlobal(now = Date.now()): boolean {
  globalTimes = prune(globalTimes, now, MINUTE);
  if (globalTimes.length >= GLOBAL_PER_MINUTE || running >= GLOBAL_PARALLEL) return false;
  globalTimes.push(now);
  running++;
  return true;
}

export function release() {
  running = Math.max(0, running - 1);
}
