// Testes da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md, "Como verificar").
// Parte pura (tabelas 1 e 2, sem rede): node scripts/test-fora-do-ar.ts
import assert from "node:assert/strict";
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

console.log(process.exitCode ? `\nHá falhas (${count} testes passaram).` : `OK: ${count} testes passaram.`);
