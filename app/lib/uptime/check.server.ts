// Checagem da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md, partes A3 a A6 e B3).
// Ciclo de cada salto: valida a entrada → resolve o DNS → valida TODOS os IPs → conecta no IP validado (com o nome no
// Host e no SNI) → lê só os cabeçalhos e fecha. Nunca usa fetch() nem deixa o http.request resolver o nome sozinho
// (anti-DNS-rebinding). Imports relativos com extensão .ts para rodar no script de teste sem bundler.
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import type { TLSSocket } from "node:tls";
import { domainToUnicode } from "node:url";
import { isBlockedIp, normalizeTarget } from "./guard.server.ts";
import type { Alert, CheckResult, Hop, Reason, Verdict } from "./types.ts";

const TOTAL_MS = 9000;
const SOCKET_MS = 8000;
const MAX_REDIRECTS = 5;
const MAX_REQUESTS = 7;
const USER_AGENT = "Mozilla/5.0 (compatible; CriaSiteCheck/1.0; +https://criasite.app/ferramentas/esta-fora-do-ar)";
const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

const resolver = new dns.promises.Resolver({ timeout: 2500, tries: 2 });

const code = (e: unknown) => String((e as { code?: string } | null)?.code ?? "");
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Rejeita quando o orçamento total de tempo acaba (o resolvedor de DNS não aceita AbortSignal). */
function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) return reject({ code: "ABORT_ERR" });
    const onAbort = () => reject({ code: "ABORT_ERR" });
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (v) => {
        signal.removeEventListener("abort", onAbort);
        resolve(v);
      },
      (e) => {
        signal.removeEventListener("abort", onAbort);
        reject(e);
      },
    );
  });
}

// ───────────── DNS ─────────────

export type DnsResult =
  | { kind: "ok"; ip: string; family: 4 | 6; v4: boolean; v6: boolean; ms: number }
  | { kind: "fail"; reason: "dns-nao-encontrado" | "dns-sem-endereco" | "dns-falhou" | "tempo-esgotado"; ms: number }
  | { kind: "blocked"; ms: number };

export async function resolveHost(host: string, signal: AbortSignal): Promise<DnsResult> {
  const t0 = performance.now();
  const elapsed = () => Math.round(performance.now() - t0);
  let v4: string[] = [];
  let v6: string[] = [];
  let errors: string[] = [];
  try {
    const [a, aaaa] = await withAbort(Promise.allSettled([resolver.resolve4(host), resolver.resolve6(host)]), signal);
    if (a.status === "fulfilled") v4 = a.value;
    else errors.push(code(a.reason));
    if (aaaa.status === "fulfilled") v6 = aaaa.value;
    else errors.push(code(aaaa.reason));
  } catch (e) {
    if (code(e) === "ABORT_ERR") return { kind: "fail", reason: "tempo-esgotado", ms: elapsed() };
    errors = [code(e)];
  }

  // Plano B (uma vez): resolvedor do servidor inacessível nos dois.
  if (v4.length === 0 && v6.length === 0 && errors.length === 2 && errors.every((c) => c === "ECONNREFUSED")) {
    try {
      const all = await withAbort(dns.promises.lookup(host, { all: true, verbatim: true }), signal);
      v4 = all.filter((x) => x.family === 4).map((x) => x.address);
      v6 = all.filter((x) => x.family === 6).map((x) => x.address);
    } catch (e) {
      if (code(e) === "ABORT_ERR") return { kind: "fail", reason: "tempo-esgotado", ms: elapsed() };
      errors = [code(e)];
    }
  }

  if (v4.length === 0 && v6.length === 0) {
    if (errors.length > 0 && errors.every((c) => c === "ENOTFOUND")) return { kind: "fail", reason: "dns-nao-encontrado", ms: elapsed() };
    if (errors.includes("ENODATA")) return { kind: "fail", reason: "dns-sem-endereco", ms: elapsed() };
    return { kind: "fail", reason: "dns-falhou", ms: elapsed() };
  }

  // Qualquer endereço bloqueado (v4 ou v6) derruba a checagem inteira: pega 127.0.0.1.nip.io e domínios mistos.
  if ([...v4, ...v6].some(isBlockedIp)) return { kind: "blocked", ms: elapsed() };

  // Conecta no 1º IPv4 (ou no 1º IPv6). Não há segunda consulta de DNS para essa conexão.
  return v4.length > 0
    ? { kind: "ok", ip: v4[0], family: 4, v4: true, v6: v6.length > 0, ms: elapsed() }
    : { kind: "ok", ip: v6[0], family: 6, v4: false, v6: true, ms: elapsed() };
}

// ───────────── Um salto HTTP(S): só os cabeçalhos ─────────────

interface TlsInfo {
  state: "valido" | "vencido" | "outro-nome" | "nao-confiavel";
  validTo: string | null;
  daysLeft: number | null;
  issuer: string;
}

export type HopResult =
  | { ok: true; status: number; statusText: string; location: string | null; server: string | null; ttfbMs: number; tls: TlsInfo | null }
  | { ok: false; reason: Reason };

function mapError(e: unknown): Reason {
  const c = code(e);
  const name = (e as { name?: string } | null)?.name;
  if (c === "ECONNREFUSED") return "conexao-recusada";
  if (c === "ECONNRESET" || c === "EPIPE" || c === "ERR_SOCKET_CLOSED") return "conexao-interrompida";
  if (c === "ETIMEDOUT" || c === "ABORT_ERR" || name === "AbortError" || name === "TimeoutError") return "tempo-esgotado";
  if (c === "EPROTO" || c.startsWith("ERR_SSL_") || c.startsWith("ERR_TLS_")) return "tls-falhou";
  if (c === "EHOSTUNREACH" || c === "ENETUNREACH") return "erro-rede";
  if (c.startsWith("HPE_")) return "resposta-invalida";
  return "erro-rede";
}

function tlsInfo(socket: TLSSocket): TlsInfo {
  const err = String(socket.authorizationError ?? "");
  const cert = socket.getPeerCertificate();
  const to = cert?.valid_to ? new Date(cert.valid_to) : null;
  const validTo = to && !Number.isNaN(to.getTime()) ? to.toISOString() : null;
  const daysLeft = to && validTo ? Math.floor((to.getTime() - Date.now()) / 86_400_000) : null;
  const issuerRaw = cert?.issuer as { O?: string; CN?: string } | undefined;
  const issuer = cut(String(issuerRaw?.O ?? issuerRaw?.CN ?? ""), 60);
  let state: TlsInfo["state"];
  if (socket.authorized) state = "valido";
  else if (err === "CERT_HAS_EXPIRED") state = "vencido";
  else if (err === "ERR_TLS_CERT_ALTNAME_INVALID") state = "outro-nome";
  else state = "nao-confiavel";
  return { state, validTo, daysLeft, issuer };
}

export function request(url: URL, ip: string, family: 4 | 6, signal: AbortSignal): Promise<HopResult> {
  return new Promise((resolve) => {
    const isHttps = url.protocol === "https:";
    const t0 = performance.now();
    let settled = false;
    const done = (r: HopResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };
    const lib = isHttps ? https : http;
    const req = lib.request(
      {
        host: ip, // IP já validado: o Node não resolve o nome de novo
        family,
        port: isHttps ? 443 : 80,
        path: url.pathname + url.search,
        method: "GET",
        ...(isHttps ? { servername: url.hostname, rejectUnauthorized: false } : {}), // rejectUnauthorized false: para LER o problema do certificado
        headers: {
          Host: url.host,
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9",
          "Accept-Encoding": "identity",
          Connection: "close",
        },
        agent: false,
        maxHeaderSize: 16384,
        signal,
        timeout: SOCKET_MS,
      },
      (res) => {
        const ttfbMs = Math.round(performance.now() - t0);
        let tls: TlsInfo | null = null;
        if (isHttps) {
          try {
            tls = tlsInfo(res.socket as TLSSocket);
          } catch {
            tls = null;
          }
        }
        const location = typeof res.headers.location === "string" ? res.headers.location : null;
        const server = typeof res.headers.server === "string" ? cut(res.headers.server, 40) : null;
        const status = res.statusCode ?? 0;
        const statusText = cut(res.statusMessage ?? "", 40);
        // O corpo nunca é lido: fecha a conexão na hora.
        res.destroy();
        req.destroy();
        done({ ok: true, status, statusText, location, server, ttfbMs, tls });
      },
    );
    req.on("error", (e) => done({ ok: false, reason: mapError(e) }));
    req.on("timeout", () => {
      req.destroy();
      done({ ok: false, reason: "tempo-esgotado" });
    });
    req.end();
  });
}

// ───────────── Veredito ─────────────

function verdictOf(status: number): { verdict: Verdict; reason: Reason } {
  if ((status >= 200 && status < 300) || status === 304) return { verdict: "no-ar", reason: "ok" };
  if (status === 401 || status === 403 || status === 429) return { verdict: "alerta", reason: "http-acesso-negado" };
  if (status === 404 || status === 410) return { verdict: "alerta", reason: "http-nao-encontrada" };
  if (status >= 400 && status < 500) return { verdict: "alerta", reason: "http-outro-4xx" };
  if (status === 503) return { verdict: "fora-do-ar", reason: "http-manutencao" };
  if (status >= 500) return { verdict: "fora-do-ar", reason: "http-erro-servidor" };
  return { verdict: "fora-do-ar", reason: "resposta-invalida" }; // 1xx ou 3xx sem Location
}

const verdictOfReason = (reason: Reason): Verdict => {
  if (reason === "dns-nao-encontrado" || reason === "dns-sem-endereco") return "nao-encontrado";
  if (reason === "muitos-redirecionamentos" || reason === "redirecionamento-bloqueado") return "alerta";
  return "fora-do-ar";
};

// ───────────── Checagem completa ─────────────

/** Checa o endereço (já normalizado por normalizeTarget). `{ blocked: true }` quando o DNS aponta para rede interna. */
export async function checkTarget(
  url: URL,
  typedScheme: boolean,
  display?: string,
  /** Só para testes: troca o DNS e a conexão por versões falsas (scripts/test-fora-do-ar.ts). */
  io?: { resolve?: typeof resolveHost; request?: typeof request },
): Promise<CheckResult | { blocked: true }> {
  const doResolve = io?.resolve ?? resolveHost;
  const doRequest = io?.request ?? request;
  const started = performance.now();
  const signal = AbortSignal.timeout(TOTAL_MS);
  const target = display ?? normalizeTargetDisplay(url);

  const redirects: Hop[] = [];
  const visited = new Set<string>();
  const ipCache = new Map<string, Extract<DnsResult, { kind: "ok" }>>();
  let firstDns: { ok: boolean; v4: boolean; v6: boolean; ms: number } | null = null;
  let firstTtfb: number | null = null;
  let tls: TlsInfo | null = null;
  let server: string | null = null;
  let requests = 0;
  const extraAlerts: Alert[] = [];

  const result = (r: Partial<CheckResult> & { verdict: Verdict; reason: Reason }): CheckResult => ({
    target,
    finalUrl: null,
    alerts: [],
    status: null,
    statusText: "",
    ttfbMs: firstTtfb,
    totalMs: Math.round(performance.now() - started),
    dns: firstDns ?? { ok: false, v4: false, v6: false, ms: 0 },
    redirects,
    https: null,
    server,
    checkedAt: new Date().toISOString(),
    cached: false,
    ...r,
  });

  try {
    let current = url;
    let currentDisplay = target;
    let schemeFallbackUsed = false;

    for (let hopIndex = 0; ; hopIndex++) {
      visited.add(current.href);

      // DNS (uma vez por nome) e validação de todos os IPs.
      let ipInfo = ipCache.get(current.hostname);
      if (!ipInfo) {
        const d = await doResolve(current.hostname, signal);
        if (hopIndex === 0) firstDns = { ok: d.kind === "ok", v4: d.kind === "ok" && d.v4, v6: d.kind === "ok" && d.v6, ms: d.ms };
        if (d.kind === "blocked") {
          if (hopIndex === 0) return { blocked: true };
          return result({ verdict: "alerta", reason: "redirecionamento-bloqueado", finalUrl: null });
        }
        if (d.kind === "fail") {
          const reason: Reason = hopIndex === 0 ? d.reason : d.reason === "tempo-esgotado" ? "tempo-esgotado" : "dns-falhou";
          return result({ verdict: verdictOfReason(reason), reason });
        }
        ipInfo = d;
        ipCache.set(current.hostname, d);
      }

      // Conexão no IP validado.
      requests++;
      let hop = await doRequest(current, ipInfo.ip, ipInfo.family, signal);
      if (!hop.ok && hopIndex === 0 && !typedScheme && current.protocol === "https:" && !schemeFallbackUsed && (hop.reason === "conexao-recusada" || hop.reason === "tls-falhou") && requests < MAX_REQUESTS) {
        // Plano B (uma vez): tenta http no mesmo IP já validado.
        schemeFallbackUsed = true;
        const httpUrl = new URL(current.href);
        httpUrl.protocol = "http:";
        requests++;
        const second = await doRequest(httpUrl, ipInfo.ip, ipInfo.family, signal);
        if (second.ok) {
          hop = second;
          current = httpUrl;
          visited.add(current.href);
          extraAlerts.push("sem-https");
        }
      }
      if (!hop.ok) {
        const reason = hop.reason;
        return result({ verdict: verdictOfReason(reason), reason, finalUrl: hopIndex > 0 ? currentDisplay : null });
      }

      if (hopIndex === 0) firstTtfb = hop.ttfbMs;
      server = hop.server ?? server;
      tls = current.protocol === "https:" ? hop.tls : null;

      // Redirecionamento.
      if (REDIRECT_STATUS.has(hop.status) && hop.location) {
        if (hop.location.length > 2048) return result({ verdict: "fora-do-ar", reason: "resposta-invalida", status: hop.status, statusText: hop.statusText, finalUrl: currentDisplay });
        let next: URL;
        try {
          next = new URL(hop.location, current);
        } catch {
          return result({ verdict: "fora-do-ar", reason: "resposta-invalida", status: hop.status, statusText: hop.statusText, finalUrl: currentDisplay });
        }
        const normalized = normalizeTarget(next.href);
        if (!normalized.ok) return result({ verdict: "alerta", reason: "redirecionamento-bloqueado", status: hop.status, statusText: hop.statusText, finalUrl: currentDisplay });
        redirects.push({ url: cut(normalized.url.href, 120), status: hop.status });
        if (redirects.length > MAX_REDIRECTS || visited.has(normalized.url.href) || requests >= MAX_REQUESTS) {
          return result({ verdict: "alerta", reason: "muitos-redirecionamentos", status: hop.status, statusText: hop.statusText, finalUrl: currentDisplay });
        }
        current = normalized.url;
        currentDisplay = normalized.display;
        continue;
      }

      // Resposta final.
      const { verdict: baseVerdict, reason } = verdictOf(hop.status);
      let verdict = baseVerdict;
      const alerts: Alert[] = [...extraAlerts];
      const live = verdict === "no-ar" || verdict === "alerta";
      if (live) {
        if (current.protocol === "http:" && !alerts.includes("sem-https")) alerts.push("sem-https");
        if (hop.ttfbMs > 2000 || (firstTtfb ?? 0) > 2000) alerts.push("lento");
        if (tls) {
          if (tls.state !== "valido") {
            alerts.push("certificado-problema");
            if (verdict === "no-ar") verdict = "alerta";
          } else if (tls.daysLeft !== null && tls.daysLeft < 15) alerts.push("certificado-vence-logo");
        }
      }
      return result({
        verdict,
        reason,
        alerts,
        status: hop.status,
        statusText: hop.statusText,
        finalUrl: currentDisplay,
        https: tls,
      });
    }
  } catch (e) {
    console.error("[fora-do-ar]", code(e) || "erro");
    return result({ verdict: "fora-do-ar", reason: "erro-rede" });
  }
}

function normalizeTargetDisplay(url: URL) {
  const path = url.pathname === "/" ? "" : url.pathname;
  return `${domainToUnicode(url.hostname)}${path}${url.search}`;
}
