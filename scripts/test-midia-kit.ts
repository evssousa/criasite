// Testes do mídia kit (docs/midia-kit.md, A3). Rodar: node scripts/test-midia-kit.ts (ou npm run test:midia-kit).
// Também valida o kit real (app/lib/media-kit/data.ts): tem que passar antes de cada commit que mexe nele.
import assert from "node:assert/strict";
import { MEDIA_KIT } from "../app/lib/media-kit/data.ts";
import { addDays, daysBetween, formatDateBR, isKitExpired, mailtoHref, metricState, resolveMetrics, todayInBrazil, validUntil, validateKit } from "../app/lib/media-kit/rules.ts";
import type { MediaKit, MediaKitMetric } from "../app/lib/media-kit/types.ts";

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
const clone = (): MediaKit => JSON.parse(JSON.stringify(MEDIA_KIT));
const TODAY = "2026-11-19";
const metric = (patch: Partial<MediaKitMetric>): MediaKitMetric => ({ id: "x", label: "X", value: 10, period: "últimos 28 dias", source: "Fonte", updatedAt: "2026-11-10", ...patch });

// ───────────── Datas ─────────────

ok("addDays", () => {
  assert.equal(addDays("2026-11-19", 90), "2027-02-17");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});
ok("daysBetween", () => {
  assert.equal(daysBetween("2026-11-14", "2026-11-19"), 5);
  assert.equal(daysBetween("2026-11-19", "2026-11-14"), -5);
});
ok("formatDateBR", () => assert.equal(formatDateBR("2026-11-19"), "19/11/2026"));
ok("todayInBrazil devolve AAAA-MM-DD", () => assert.match(todayInBrazil(new Date("2026-11-19T12:00:00Z")), /^2026-11-19$/));
ok("todayInBrazil usa o fuso do Brasil", () => assert.equal(todayInBrazil(new Date("2026-11-20T01:30:00Z")), "2026-11-19"));
ok("validade do kit", () => {
  const kit = clone();
  kit.updatedAt = "2026-11-19";
  assert.equal(validUntil(kit), "2027-02-17");
  assert.equal(isKitExpired(kit, "2027-02-17"), false);
  assert.equal(isKitExpired(kit, "2027-02-18"), true);
});

// ───────────── Números ─────────────

ok("metricState", () => {
  assert.equal(metricState(metric({ value: null, updatedAt: null }), TODAY, 90), "sem-dados");
  assert.equal(metricState(metric({ updatedAt: "2026-08-21" }), TODAY, 90), "ok"); // 90 dias
  assert.equal(metricState(metric({ updatedAt: "2026-08-20" }), TODAY, 90), "vencido"); // 91 dias
  assert.equal(metricState(metric({ updatedAt: null }), TODAY, 90), "vencido");
});
ok("resolveMetrics: automáticos primeiro", () => {
  const rows = resolveMetrics([metric({ id: "a" })], [metric({ id: "m", value: null, updatedAt: null })], TODAY, 90);
  assert.deepEqual(rows.map((r) => [r.id, r.auto, r.state]), [["a", true, "ok"], ["m", false, "sem-dados"]]);
});

// ───────────── Validação ─────────────

ok("validateKit: kit real sem erros", () => assert.deepEqual(validateKit(MEDIA_KIT, todayInBrazil()), []));
ok("validateKit: número com valor e sem data", () => {
  const kit = clone();
  kit.metrics[0] = metric({ id: "gsc", updatedAt: null });
  assert.ok(validateKit(kit, TODAY).some((e) => e.includes("sem data")));
});
ok("validateKit: número com valor e sem fonte", () => {
  const kit = clone();
  kit.metrics[0] = metric({ id: "gsc", source: "" });
  assert.ok(validateKit(kit, TODAY).some((e) => e.includes("sem fonte")));
});
ok("validateKit: data no futuro", () => {
  const kit = clone();
  kit.metrics[0] = metric({ id: "gsc", updatedAt: "2026-12-01" });
  assert.ok(validateKit(kit, TODAY).some((e) => e.includes("futuro")));
  const k2 = clone();
  k2.updatedAt = "2026-12-01";
  assert.ok(validateKit(k2, TODAY).some((e) => e.includes("updatedAt no futuro")));
});
ok("validateKit: série com 2 pontos", () => {
  const kit = clone();
  kit.metrics[0] = metric({ series: [{ date: "2026-10-01", value: 1 }, { date: "2026-11-01", value: 2 }] });
  assert.ok(validateKit(kit, TODAY).some((e) => e.includes("série")));
});
ok("validateKit: preço vazio", () => {
  const kit = clone();
  kit.formats[0].price = "";
  assert.ok(validateKit(kit, TODAY).some((e) => e.includes("price")));
});
ok("validateKit: formato sem 'inclui'", () => {
  const kit = clone();
  kit.formats[0].includes = [];
  assert.ok(validateKit(kit, TODAY).some((e) => e.includes("includes")));
});
for (const [campo, texto] of [
  ["milhares de leitores", "Milhares de leitores todos os meses."],
  ["número solto", "Mais de 2.000 acessos por mês."],
  ["mil visitantes", "Temos mil visitantes por semana."],
  ["líder", "O site é líder em ferramentas de site."],
  ["prêmio", "Site premiado em 2026."],
] as const) {
  ok(`validateKit: barra "${campo}" no pitch e na FAQ`, () => {
    const a = clone();
    a.pitch.lead = texto;
    assert.ok(validateKit(a, TODAY).length > 0, "pitch");
    const b = clone();
    b.faq[2].a = texto;
    assert.ok(validateKit(b, TODAY).length > 0, "faq");
  });
}
ok("validateKit: não barra frases normais do kit", () => {
  const kit = clone();
  kit.pitch.lead = "Donos de pequenos negócios usam o CriaSite para escolher hospedagem e aparecer no Google.";
  assert.deepEqual(validateKit(kit, TODAY), []);
});

// ───────────── E-mail ─────────────

ok("mailtoHref com formato", () => {
  const href = mailtoHref(MEDIA_KIT, "Guia patrocinado");
  assert.ok(href.startsWith("mailto:contato@criasite.app?subject="));
  assert.ok(href.includes("subject=%5BComercial%5D%20"));
  assert.ok(href.includes("Guia%20patrocinado"));
  assert.ok(href.includes("%0D%0A"));
});
ok("mailtoHref sem formato", () => assert.ok(mailtoHref(MEDIA_KIT).includes("ainda%20n%C3%A3o%20sei")));

// ───────────── O kit real ─────────────

ok("kit real: marca", () => {
  assert.equal(MEDIA_KIT.brand.email, "contato@criasite.app");
  assert.equal(MEDIA_KIT.brand.domain, "criasite.app");
  assert.equal(MEDIA_KIT.brand.name, "CriaSite");
});
ok("kit real: formatos disponíveis têm preço nulo ou texto", () => {
  for (const f of MEDIA_KIT.formats.filter((x) => x.available)) assert.ok(f.price === null || f.price.length > 0, f.id);
});
ok("kit real: 3 formatos, 8 regras, 8 recusas, 4 perguntas, 4 passos", () => {
  assert.equal(MEDIA_KIT.formats.length, 3);
  assert.equal(MEDIA_KIT.rules.length, 8);
  assert.equal(MEDIA_KIT.refused.length, 8);
  assert.equal(MEDIA_KIT.faq.length, 4);
  assert.equal(MEDIA_KIT.process.length, 4);
});
ok("kit real: nenhum texto promete resultado", () => {
  for (const f of MEDIA_KIT.formats) assert.ok(!/garant/i.test(f.summary), f.id);
  assert.ok(/Nenhum formato garante/.test(MEDIA_KIT.sharedExcludes));
});

console.log(process.exitCode ? `\nHá falhas (${count} testes passaram).` : `OK: ${count} testes passaram.`);
