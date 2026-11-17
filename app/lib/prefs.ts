// Preferências do visitante guardadas no navegador (localStorage): ferramentas favoritas, a
// trilha do site no ar, o roteiro de criar site com IA, as últimas checagens do "Está fora do ar?" e os rascunhos dos geradores de prompt e de arquivo de instruções. Nada vai para o servidor. Sem localStorage (aba anônima, bloqueio), o
// site funciona igual, só não lembra na próxima visita.
//
// O servidor sempre renderiza o valor padrão; o navegador lê o salvo depois de hidratar
// (useSyncExternalStore com getServerSnapshot), então não há diferença de hidratação.
import { useCallback, useSyncExternalStore } from "react";
import { AI_TRACK, TOOLS, TRAIL, type ToolSlug } from "./site";
import type { Verdict } from "./uptime/types";

const FAV_KEY = "criasite_favs";
const TRAIL_KEY = "criasite_trail";
const AI_TRACK_KEY = "criasite_trilha_ia";
const EVENT = "criasite:prefs";

/** Favoritas de quem nunca escolheu: as ferramentas mais usadas, para a área não começar vazia. */
const DEFAULT_FAVS: ToolSlug[] = ["comprimir-imagem", "qr-code", "link-whatsapp"];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento: a escolha vale só nesta visita.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// Valor em memória para quando o localStorage falha (a escolha ainda funciona na visita).
const memory: Record<string, string> = {};
const snapshot = (key: string) => () => read(key) ?? memory[key] ?? null;

function parseFavs(raw: string | null): ToolSlug[] {
  if (raw == null) return DEFAULT_FAVS;
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((s): s is ToolSlug => TOOLS.some((t) => t.slug === s)) : DEFAULT_FAVS;
  } catch {
    return DEFAULT_FAVS;
  }
}

const favSnapshot = snapshot(FAV_KEY);
const trailSnapshot = snapshot(TRAIL_KEY);
const aiTrackSnapshot = snapshot(AI_TRACK_KEY);

/** Ferramentas favoritas, na ordem em que foram fixadas. */
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, favSnapshot, () => null);
  const favs = parseFavs(raw);
  const toggle = useCallback(
    (slug: ToolSlug) => {
      const next = favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug];
      memory[FAV_KEY] = JSON.stringify(next);
      write(FAV_KEY, memory[FAV_KEY]);
    },
    [favs],
  );
  return { favs, toggle, isFav: (slug: ToolSlug) => favs.includes(slug) };
}

/** Checklist de etapas guardado no navegador: só os ids válidos são considerados. */
function useChecklist(key: string, snap: () => string | null, validIds: string[]) {
  const raw = useSyncExternalStore(subscribe, snap, () => null);
  let done: string[] = [];
  try {
    const list = raw ? JSON.parse(raw) : [];
    done = Array.isArray(list) ? list.filter((id) => validIds.includes(id)) : [];
  } catch {
    done = [];
  }
  const toggle = useCallback(
    (id: string) => {
      const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
      memory[key] = JSON.stringify(next);
      write(key, memory[key]);
    },
    [done, key],
  );
  return { done, toggle, isDone: (id: string) => done.includes(id) };
}

const TRAIL_IDS = TRAIL.map((s) => s.id);
const AI_TRACK_IDS = AI_TRACK.map((s) => s.id);

/** Etapas da trilha concluídas (ids de TRAIL). */
export const useTrail = () => useChecklist(TRAIL_KEY, trailSnapshot, TRAIL_IDS);

/** Etapas do roteiro "Criar site com IA" concluídas (ids de AI_TRACK). */
export const useAiTrack = () => useChecklist(AI_TRACK_KEY, aiTrackSnapshot, AI_TRACK_IDS);

// ───────────── Últimas checagens da ferramenta "Está fora do ar?" ─────────────

const CHECKS_KEY = "criasite_checagens";
const CHECKS_MAX = 5;
const checksSnapshot = snapshot(CHECKS_KEY);
const VERDICTS: Verdict[] = ["no-ar", "alerta", "fora-do-ar", "nao-encontrado"];

export interface CheckHistoryItem {
  /** Endereço como foi digitado/exibido. */
  target: string;
  verdict: Verdict;
  /** Momento da checagem (ms desde 1970). */
  at: number;
}

function parseChecks(raw: string | null): CheckHistoryItem[] {
  try {
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((i): i is CheckHistoryItem => !!i && typeof i.target === "string" && i.target.length > 0 && i.target.length <= 300 && VERDICTS.includes(i.verdict) && Number.isFinite(i.at))
      .slice(0, CHECKS_MAX);
  } catch {
    return [];
  }
}

/** Últimas 5 checagens, só neste navegador (o servidor nunca recebe esta lista). */
export function useCheckHistory() {
  const raw = useSyncExternalStore(subscribe, checksSnapshot, () => null);
  const items = parseChecks(raw);
  const add = useCallback(
    (item: CheckHistoryItem) => {
      const next = [item, ...items.filter((i) => i.target !== item.target)].slice(0, CHECKS_MAX);
      memory[CHECKS_KEY] = JSON.stringify(next);
      write(CHECKS_KEY, memory[CHECKS_KEY]);
    },
    [items],
  );
  const clear = useCallback(() => {
    memory[CHECKS_KEY] = "[]";
    write(CHECKS_KEY, "[]");
  }, []);
  return { items, add, clear };
}

// ───────────── Rascunho do gerador de arquivo de instruções ─────────────
// Não dispara o evento criasite:prefs (ninguém assina o rascunho). Nunca vai para o servidor.

const INSTR_KEY = "criasite_instrucoes";
const INSTR_MAX_CHARS = 50_000;

export function loadInstrDraft(): string | null {
  return read(INSTR_KEY);
}

/** False se o rascunho for grande demais ou se o navegador não deixar gravar. */
export function saveInstrDraft(json: string): boolean {
  if (json.length > INSTR_MAX_CHARS) return false;
  try {
    localStorage.setItem(INSTR_KEY, json);
    return true;
  } catch {
    return false;
  }
}

export function clearInstrDraft(): void {
  try {
    localStorage.removeItem(INSTR_KEY);
  } catch {
    // Sem armazenamento: nada a apagar.
  }
}

// ───────────── Rascunho do gerador de prompt para site ─────────────
// Mesmo estilo do rascunho de instruções: não dispara o evento criasite:prefs e nunca vai para o servidor.

const PROMPT_KEY = "criasite_prompt_site";
const PROMPT_MAX_CHARS = 20_000;

export function loadPromptDraft(): string | null {
  return read(PROMPT_KEY);
}

/** False se o rascunho for grande demais ou se o navegador não deixar gravar. */
export function savePromptDraft(json: string): boolean {
  if (json.length > PROMPT_MAX_CHARS) return false;
  try {
    localStorage.setItem(PROMPT_KEY, json);
    return true;
  } catch {
    return false;
  }
}

export function clearPromptDraft(): void {
  try {
    localStorage.removeItem(PROMPT_KEY);
  } catch {
    // Sem armazenamento: nada a apagar.
  }
}
