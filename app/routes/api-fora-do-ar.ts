// API da ferramenta "Está fora do ar?" (POST /api/fora-do-ar, JSON). Ver docs/ferramenta-fora-do-ar.md, parte A8.
// Fica sob /api/: o Express já põe noindex e no-store, e o robots.txt já tem Disallow. Nunca registra o endereço digitado
// nem o IP em log (a política de privacidade promete isso): por isso é POST com JSON, e não GET com o endereço na URL.
import { isbot } from "isbot";
import type { Route } from "./+types/api-fora-do-ar";
import { checkTarget } from "~/lib/uptime/check.server";
import { normalizeTarget } from "~/lib/uptime/guard.server";
import { cachedResult, clientIp, release, remember, takeGlobal, takeIp, takeTarget } from "~/lib/uptime/limits.server";
import type { ApiError } from "~/lib/uptime/types";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "application/json; charset=utf-8" };
const MAX_BODY = 4096;

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });
const fail = (status: number, error: ApiError["error"], message: string, retryAfter?: number) =>
  json({ error, message, ...(retryAfter ? { retryAfter } : {}) } satisfies ApiError, status, retryAfter ? { "Retry-After": String(retryAfter) } : {});

export async function loader() {
  return new Response(null, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
  if (isbot(request.headers.get("user-agent") ?? "")) return fail(403, "proibido", "Acesso não permitido.");

  // Só do próprio site: Origin obrigatório e com o mesmo host da requisição.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost = "";
  try {
    originHost = origin ? new URL(origin).host : "";
  } catch {
    originHost = "";
  }
  if (!origin || !host || originHost !== host) return fail(403, "proibido", "Acesso não permitido.");
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return json({ error: "invalido", message: "Formato não aceito." }, 415);

  // Tamanho do pedido.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return fail(413, "invalido", "Endereço longo demais.");
  const text = await request.text();
  if (text.length > MAX_BODY) return fail(413, "invalido", "Endereço longo demais.");
  let raw: unknown;
  try {
    raw = (JSON.parse(text) as { url?: unknown }).url;
  } catch {
    return fail(400, "invalido", "Pedido inválido.");
  }
  if (typeof raw !== "string") return fail(400, "invalido", "Digite o endereço do site.");

  const target = normalizeTarget(raw);
  if (!target.ok) return fail(target.code === "bloqueado" ? 422 : 400, target.code, target.message);

  // Limites: por IP (conta até as respostas do cache), cache do alvo, por alvo e global.
  const ip = takeIp(clientIp(request));
  if (!ip.ok) return fail(429, "limite", `Você fez muitas checagens seguidas. Tente de novo em ${ip.retryAfter} segundos.`, ip.retryAfter);
  const key = target.url.href;
  const hit = cachedResult(key);
  if (hit) return json(hit);
  const perTarget = takeTarget(target.url.hostname);
  if (!perTarget.ok) return fail(429, "limite-alvo", `Esse site acabou de ser checado várias vezes. Tente de novo em ${perTarget.retryAfter} segundos.`, perTarget.retryAfter);
  if (!takeGlobal()) return fail(503, "ocupado", "Muita gente checando agora. Tente de novo em alguns segundos.", 5);

  try {
    const result = await checkTarget(target.url, target.typedScheme, target.display);
    if ("blocked" in result) return fail(422, "bloqueado", "Esse endereço aponta para uma rede interna e não pode ser checado.");
    remember(key, result);
    return json(result);
  } catch (e) {
    console.error("[fora-do-ar]", (e as { code?: string })?.code ?? "erro");
    return fail(503, "ocupado", "Não foi possível checar agora. Tente de novo em alguns segundos.", 5);
  } finally {
    release();
  }
}
