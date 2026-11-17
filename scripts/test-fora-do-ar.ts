// Testes da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md, "Como verificar").
// Parte pura (tabelas 1 e 2, sem rede): node scripts/test-fora-do-ar.ts
// Parte de rede (tabela 3, usa a internet de verdade): node scripts/test-fora-do-ar.ts --rede
import assert from "node:assert/strict";
import { checkTarget } from "../app/lib/uptime/check.server.ts";
import { isBlockedIp, normalizeTarget } from "../app/lib/uptime/guard.server.ts";

let count = 0;
const ok = (name: string, fn: () => void) => {
  try {
    fn();
    count++;
  } catch (e) {
    console.error(`FALHOU: ${name}\n  ${(e as Error).message}`);
    process.exitCode = 1;
  }
};

const okAsync = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    count++;
  } catch (e) {
    console.error(`FALHOU: ${name}
  ${(e as Error).message}`);
    process.exitCode = 1;
  }
};

// ───────────── Tabela 1: normalizeTarget ─────────────

const accepted = (input: string) => {
  const r = normalizeTarget(input);
  assert.equal(r.ok, true, `${JSON.stringify(input.slice(0, 40))} devia ser aceito: ${r.ok ? "" : r.message}`);
  return r as Extract<ReturnType<typeof normalizeTarget>, { ok: true }>;
};
const rejected = (input: string, code: "invalido" | "bloqueado") => {
  const r = normalizeTarget(input);
  assert.equal(r.ok, false, `${JSON.stringify(input.slice(0, 40))} devia ser recusado`);
  assert.equal((r as { code: string }).code, code, `${JSON.stringify(input.slice(0, 40))}: código ${(r as { code: string }).code}, esperado ${code}`);
};

ok("trim e minúsculas", () => {
  const r = accepted("  Exemplo.com.br  ");
  assert.equal(r.url.href, "https://exemplo.com.br/");
  assert.equal(r.display, "exemplo.com.br");
  assert.equal(r.typedScheme, false);
});
ok("caminho e query ficam, hash some", () => {
  const r = accepted("exemplo.com.br/contato?x=1#topo");
  assert.equal(r.url.pathname, "/contato");
  assert.equal(r.url.search, "?x=1");
  assert.equal(r.url.hash, "");
  assert.equal(r.display, "exemplo.com.br/contato?x=1");
});
ok("http digitado", () => {
  const r = accepted("http://exemplo.com.br");
  assert.equal(r.url.protocol, "http:");
  assert.equal(r.typedScheme, true);
});
ok("porta padrão some", () => assert.equal(accepted("https://exemplo.com.br:443/").url.port, ""));
ok("ponto final some", () => assert.equal(accepted("exemplo.com.br.").url.hostname, "exemplo.com.br"));
ok("IDN vira punycode", () => {
  const r = accepted("pão.com.br");
  assert.ok(r.url.hostname.startsWith("xn--"), r.url.hostname);
  assert.equal(r.display, "pão.com.br");
});

for (const bad of ["", "a b.com", `${"a".repeat(2100)}.com`]) ok(`inválido: ${bad.slice(0, 12)}`, () => rejected(bad, "invalido"));
for (const bad of ["exemplo.c0m", "-exemplo.com", "exemplo..com"]) ok(`inválido: ${bad}`, () => rejected(bad, "invalido"));

for (const bad of ["localhost", "foo.localhost", "intranet", "impressora.local", "metadata.google.internal", "roteador.home.arpa", "site.test"])
  ok(`rede interna: ${bad}`, () => rejected(bad, "bloqueado"));

for (const bad of [
  "127.0.0.1",
  "http://2130706433",
  "http://0x7f.1",
  "http://017700000001",
  "[::1]",
  "http://[::ffff:127.0.0.1]",
  "http://169.254.169.254/latest/meta-data/",
  "8.8.8.8",
])
  ok(`IP literal: ${bad}`, () => rejected(bad, "bloqueado"));

for (const bad of ["ftp://exemplo.com", "file:///etc/passwd", "javascript:alert(1)", "gopher://exemplo.com", "data:text/html,oi"]) ok(`esquema: ${bad}`, () => rejected(bad, "bloqueado"));

ok("credenciais", () => rejected("https://user:senha@exemplo.com", "bloqueado"));
for (const bad of ["exemplo.com:8080", "https://exemplo.com:22", "http://exemplo.com:443"]) ok(`porta: ${bad}`, () => rejected(bad, "bloqueado"));

// ───────────── Tabela 2: isBlockedIp ─────────────

const blockedIps = [
  "0.0.0.0",
  "10.1.2.3",
  "100.64.0.1",
  "127.0.0.1",
  "127.255.255.254",
  "169.254.169.254",
  "172.16.0.1",
  "172.31.255.255",
  "192.0.0.1",
  "192.168.1.1",
  "198.18.0.1",
  "224.0.0.1",
  "255.255.255.255",
  "::",
  "::1",
  "::ffff:127.0.0.1",
  "::ffff:7f00:1",
  "::ffff:10.0.0.1",
  "64:ff9b::7f00:1",
  "2002:7f00:1::1",
  "2001:db8::1",
  "2001::1",
  "fc00::1",
  "fd00:ec2::254",
  "fe80::1",
  "ff02::1",
  "lixo",
  "fe80::1%eth0",
  "",
];
const openIps = ["8.8.8.8", "1.1.1.1", "172.32.0.1", "100.128.0.1", "2606:4700:4700::1111", "2001:4860:4860::8888"];
for (const ip of blockedIps) ok(`bloqueia ${ip || "(vazio)"}`, () => assert.equal(isBlockedIp(ip), true, `${ip} devia ser bloqueado`));
for (const ip of openIps) ok(`libera ${ip}`, () => assert.equal(isBlockedIp(ip), false, `${ip} devia ser liberado`));


// ───────────── Redirecionamentos para destinos bloqueados (DNS e conexão falsos, sem rede) ─────────────
// O httpbin recusa redirecionar para endereços internos, então o caminho é testado com um servidor de mentira.

{
  const calls: string[] = [];
  const fakeResolve = (blockedHosts: string[] = []) =>
    (async (host: string) => {
      calls.push(`dns:${host}`);
      return blockedHosts.includes(host) ? { kind: "blocked" as const, ms: 1 } : { kind: "ok" as const, ip: "8.8.8.8", family: 4 as const, v4: true, v6: false, ms: 1 };
    }) as unknown as Parameters<typeof checkTarget>[3] extends infer T ? (T extends { resolve?: infer R } ? R : never) : never;
  const redirectTo = (location: string, status = 302) =>
    (async (url: URL) => {
      calls.push(`req:${url.href}`);
      return url.pathname === "/" || url.pathname === ""
        ? { ok: true as const, status, statusText: "Found", location, server: null, ttfbMs: 5, tls: null }
        : { ok: true as const, status: 200, statusText: "OK", location: null, server: null, ttfbMs: 5, tls: null };
    }) as never;

  for (const dest of ["http://127.0.0.1/", "http://169.254.169.254/latest/meta-data/", "http://intranet/", "http://localhost/", "https://outro.com:8080/", "ftp://outro.com/", "file:///etc/passwd", "http://[::1]/", "http://2130706433/"]) {
    await okAsync(`redirecionamento para ${dest} é bloqueado`, async () => {
      calls.length = 0;
      const n = normalizeTarget("exemplo.com.br");
      assert.ok(n.ok);
      const r = (await checkTarget(n.url, n.typedScheme, n.display, { resolve: fakeResolve(), request: redirectTo(dest) })) as { verdict: string; reason: string };
      assert.equal(r.reason, "redirecionamento-bloqueado", `${dest}: ${r.reason}`);
      assert.deepEqual(calls.filter((c) => c.startsWith("req:")), ["req:https://exemplo.com.br/"], `${dest}: seguiu o redirecionamento`);
    });
  }

  await okAsync("DNS do destino do redirecionamento que aponta para rede interna é bloqueado (rebinding)", async () => {
    calls.length = 0;
    const n = normalizeTarget("exemplo.com.br");
    assert.ok(n.ok);
    const r = (await checkTarget(n.url, n.typedScheme, n.display, { resolve: fakeResolve(["interno.exemplo.com"]), request: redirectTo("https://interno.exemplo.com/") })) as { reason: string };
    assert.equal(r.reason, "redirecionamento-bloqueado");
    assert.deepEqual(calls.filter((c) => c.startsWith("req:")), ["req:https://exemplo.com.br/"]);
  });

  await okAsync("DNS do alvo inicial que aponta para rede interna devolve blocked", async () => {
    const n = normalizeTarget("exemplo.com.br");
    assert.ok(n.ok);
    const r = await checkTarget(n.url, n.typedScheme, n.display, { resolve: fakeResolve(["exemplo.com.br"]), request: redirectTo("https://x.com/") });
    assert.deepEqual(r, { blocked: true });
  });

  await okAsync("redirecionamento para destino público é seguido e listado", async () => {
    const n = normalizeTarget("exemplo.com.br");
    assert.ok(n.ok);
    const r = (await checkTarget(n.url, n.typedScheme, n.display, { resolve: fakeResolve(), request: redirectTo("https://www.exemplo.com.br/inicio", 301) })) as { verdict: string; redirects: { status: number }[] };
    assert.equal(r.verdict, "no-ar");
    assert.equal(r.redirects.length, 1);
    assert.equal(r.redirects[0].status, 301);
  });

  await okAsync("laço de redirecionamento para", async () => {
    const n = normalizeTarget("exemplo.com.br");
    assert.ok(n.ok);
    const loop = (async (url: URL) => ({ ok: true as const, status: 302, statusText: "Found", location: url.href.endsWith("/a") ? "https://exemplo.com.br/b" : "https://exemplo.com.br/a", server: null, ttfbMs: 5, tls: null })) as never;
    const r = (await checkTarget(n.url, n.typedScheme, n.display, { resolve: fakeResolve(), request: loop })) as { reason: string };
    assert.equal(r.reason, "muitos-redirecionamentos");
  });
}

console.log(process.exitCode ? `
Há falhas (${count} testes passaram).` : `OK: ${count} testes passaram.`);

// ───────────── Tabela 3: rede ─────────────

if (process.argv.includes("--rede")) {
  type Res = Exclude<Awaited<ReturnType<typeof checkTarget>>, { blocked: true }>;
  // [entrada, veredito esperado ("bloqueado" = o DNS aponta para rede interna), reason esperado, conferência extra]
  const cases: [string, string, string | null, ((r: Res) => string | null) | null][] = [
    ["criasite.app", "no-ar", "ok", (r) => (r.https?.state === "valido" ? null : `https ${r.https?.state}`)],
    ["http://criasite.app", "no-ar", "ok", (r) => (r.redirects.length > 0 ? null : "sem redirecionamento listado")],
    ["127.0.0.1.nip.io", "bloqueado", null, null],
    ["10.0.0.1.nip.io", "bloqueado", null, null],
    ["169.254.169.254.nip.io", "bloqueado", null, null],
    ["localtest.me", "bloqueado", null, null],
    ["https://httpbin.org/redirect/7", "alerta", "muitos-redirecionamentos", null],
    ["https://httpbin.org/status/503", "fora-do-ar", "http-manutencao", null],
    ["https://httpbin.org/status/500", "fora-do-ar", "http-erro-servidor", null],
    ["https://httpbin.org/status/404", "alerta", "http-nao-encontrada", null],
    ["https://httpbin.org/delay/10", "fora-do-ar", "tempo-esgotado", (r) => (r.totalMs <= 9500 ? null : `totalMs ${r.totalMs}`)],
    ["https://expired.badssl.com", "alerta", null, (r) => (r.https?.state === "vencido" ? null : `https ${r.https?.state}`)],
    ["https://wrong.host.badssl.com", "alerta", null, (r) => (r.https?.state === "outro-nome" ? null : `https ${r.https?.state}`)],
    ["https://self-signed.badssl.com", "alerta", null, (r) => (r.https?.state === "nao-confiavel" ? null : `https ${r.https?.state}`)],
    ["nao-existe-criasite-teste-8271.com.br", "nao-encontrado", "dns-nao-encontrado", null],
  ];
  console.log("\nTabela 3 (rede). httpbin e badssl são serviços públicos de teste; se algum estiver fora, anote e siga.\n");
  for (const [input, expected, reason, extra] of cases) {
    const t0 = Date.now();
    try {
      const n = normalizeTarget(input);
      if (!n.ok) throw new Error(`normalizeTarget recusou: ${n.message}`);
      const r = await checkTarget(n.url, n.typedScheme, n.display);
      const got = "blocked" in r ? "bloqueado" : r.verdict;
      let problem: string | null = null;
      if (got !== expected) problem = `veredito ${got}, esperado ${expected}`;
      else if (!("blocked" in r)) {
        if (reason && r.reason !== reason) problem = `reason ${r.reason}, esperado ${reason}`;
        else if (extra) problem = extra(r);
      }
      const detail = "blocked" in r ? "" : ` ${r.reason}${r.alerts.length ? ` [${r.alerts.join(",")}]` : ""} status ${r.status ?? "-"} ${r.totalMs}ms`;
      console.log(`${problem ? "FALHOU" : "ok    "}  ${input}  →  ${got}${detail}${problem ? `\n        ${problem}` : ""}`);
      if (problem) process.exitCode = 1;
    } catch (e) {
      console.log(`FALHOU  ${input}  →  erro: ${(e as Error).message}`);
      process.exitCode = 1;
    }
  }
}
