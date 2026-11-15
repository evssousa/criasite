// Preferências do visitante guardadas no navegador (localStorage): ferramentas favoritas e a
// trilha do site no ar. Nada vai para o servidor. Sem localStorage (aba anônima, bloqueio), o
// site funciona igual, só não lembra na próxima visita.
//
// O servidor sempre renderiza o valor padrão; o navegador lê o salvo depois de hidratar
// (useSyncExternalStore com getServerSnapshot), então não há diferença de hidratação.
import { useCallback, useSyncExternalStore } from "react";
import { TOOLS, TRAIL, type ToolSlug } from "./site";

const FAV_KEY = "criasite_favs";
const TRAIL_KEY = "criasite_trail";
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

/** Etapas da trilha concluídas (ids de TRAIL). */
export function useTrail() {
  const raw = useSyncExternalStore(subscribe, trailSnapshot, () => null);
  let done: string[] = [];
  try {
    const list = raw ? JSON.parse(raw) : [];
    done = Array.isArray(list) ? list.filter((id) => TRAIL.some((s) => s.id === id)) : [];
  } catch {
    done = [];
  }
  const toggle = useCallback(
    (id: string) => {
      const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
      memory[TRAIL_KEY] = JSON.stringify(next);
      write(TRAIL_KEY, memory[TRAIL_KEY]);
    },
    [done],
  );
  return { done, toggle, isDone: (id: string) => done.includes(id) };
}
