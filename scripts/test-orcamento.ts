// Testes da ferramenta "Quanto custa um site" (docs/orcamento-site.md, Parte H).
// Rodar: node scripts/test-orcamento.ts (ou npm run test:orcamento). Também falha quando as premissas vencem.
import assert from "node:assert/strict";
import { ORCAMENTO_DATA } from "../app/lib/orcamento/data.ts";
import {
  addDays,
  buildResumo,
  DEFAULT_STATE,
  estimate,
  EXAMPLE_STATE,
  formatBRL,
  formatDateBR,
  formatFaixa,
  formatHoras,
  isDefaultLike,
  isStale,
  lineCost,
  parseDraft,
  resumoFileName,
  roundFaixa,
  todayInBrazil,
  unicoCost,
  validateData,
} from "../app/lib/orcamento/calc.ts";
import type { OrcamentoData, OrcamentoState, Premissa } from "../app/lib/orcamento/types.ts";

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
const HOJE = "2026-11-19";
const clone = (): OrcamentoData => JSON.parse(JSON.stringify(ORCAMENTO_DATA));
const st = (patch: Partial<OrcamentoState> = {}): OrcamentoState => ({ ...EXAMPLE_STATE, ...patch });
const prem = (patch: Partial<Premissa>): Premissa => ({
  id: "hosp-compartilhada",
  label: "X",
  cobranca: "mensal",
  primeiroAno: { min: 10, max: 35 },
  depois: { min: 20, max: 60 },
  base: "Critério de mentira só para o teste de conta.",
  ...patch,
});
const est = (s: OrcamentoState, data = ORCAMENTO_DATA) => estimate(s, HOJE, data)!;
const caminho = (s: OrcamentoState, id: string) => est(s).caminhos.find((c) => c.id === id)!;
const ids = (s: OrcamentoState, id: string) => caminho(s, id).linhas.map((l) => l.id);

// ───────────── Fórmulas ─────────────

ok("1. lineCost mensal", () => {
  const r = lineCost(prem({}));
  assert.deepEqual(r.ano1, { min: 120, max: 420 });
  assert.deepEqual(r.mes, { min: 20, max: 60 });
});
ok("2. lineCost anual", () => {
  const r = lineCost(prem({ cobranca: "anual", primeiroAno: { min: 40, max: 60 }, depois: { min: 40, max: 60 } }));
  assert.deepEqual(r.ano1, { min: 40, max: 60 });
  assert.deepEqual(r.mes, { min: 3, max: 5 });
});
ok("3. unicoCost com fator", () => {
  const r = unicoCost({ min: 800, max: 3000 }, { min: 150, max: 200 });
  assert.deepEqual(r.ano1, { min: 1200, max: 6000 });
  assert.deepEqual(r.mes, { min: 0, max: 0 });
  const p = lineCost(prem({ cobranca: "unico", primeiroAno: { min: 800, max: 3000 }, depois: { min: 0, max: 0 } }), 1, { min: 150, max: 200 });
  assert.deepEqual(p.ano1, { min: 1200, max: 6000 });
});
ok("4. lineCost com quantidade", () => {
  const r = lineCost(prem({ primeiroAno: { min: 0, max: 15 }, depois: { min: 0, max: 15 } }), 2);
  assert.deepEqual(r.ano1, { min: 0, max: 360 });
  assert.deepEqual(r.mes, { min: 0, max: 30 });
});
ok("5. roundFaixa", () => {
  assert.deepEqual(roundFaixa({ min: 23, max: 147 }), { min: 23, max: 150 });
  assert.deepEqual(roundFaixa({ min: 123, max: 987 }), { min: 120, max: 990 });
  assert.deepEqual(roundFaixa({ min: 1234, max: 5678 }), { min: 1200, max: 5700 });
  assert.deepEqual(roundFaixa({ min: 12345, max: 23456 }), { min: 12000, max: 23500 });
  assert.deepEqual(roundFaixa({ min: 0, max: 0 }), { min: 0, max: 0 });
});
ok("6. formatBRL", () => {
  assert.equal(formatBRL(1234), "R$ 1.234");
  assert.equal(formatBRL(0), "R$ 0");
  assert.equal(formatBRL(12500), "R$ 12.500");
});
ok("7. formatFaixa e formatHoras", () => {
  assert.equal(formatFaixa({ min: 0, max: 0 }), "R$ 0");
  assert.equal(formatFaixa({ min: 40, max: 40 }), "R$ 40");
  assert.equal(formatFaixa({ min: 0, max: 360 }), "R$ 0 a R$ 360");
  assert.equal(formatHoras({ min: 6, max: 16 }), "6 a 16 h");
  assert.equal(formatHoras({ min: 0, max: 0 }), "0 h");
});
ok("8. datas", () => {
  assert.equal(formatDateBR("2026-11-19"), "19/11/2026");
  assert.equal(addDays("2026-11-19", 180), "2027-05-18");
  assert.equal(todayInBrazil(new Date("2026-11-20T01:30:00Z")), "2026-11-19");
});

// ───────────── Montagem ─────────────

ok("9. sem tipo, sem estimativa", () => assert.equal(estimate({ ...DEFAULT_STATE }, HOJE), null));
ok("10. exemplo: 5 caminhos em ordem fixa, totais coerentes", () => {
  const e = est(EXAMPLE_STATE);
  assert.deepEqual(e.caminhos.map((c) => c.id), ["ia", "construtor", "wordpress", "freelancer", "agencia"]);
  for (const c of e.caminhos) {
    assert.ok(c.ano1.min >= 0 && c.ano1.min <= c.ano1.max, c.id);
    assert.ok(c.mes.min >= 0 && c.mes.min <= c.mes.max, c.id);
    assert.deepEqual(c.ano1Bruto, { min: c.linhas.reduce((a, l) => a + l.ano1.min, 0), max: c.linhas.reduce((a, l) => a + l.ano1.max, 0) });
    assert.ok(c.ano1.min <= c.ano1Bruto.min && c.ano1.max >= c.ano1Bruto.max, c.id);
    assert.ok(c.mes.min <= c.mesBruto.min && c.mes.max >= c.mesBruto.max, c.id);
  }
});
ok("11. caixas de e-mail", () => {
  for (const c of ["ia", "construtor", "wordpress", "freelancer", "agencia"]) assert.ok(!ids(st({ caixas: 0 }), c).some((i) => i.startsWith("email")), c);
  const l = caminho(st({ caixas: 3 }), "wordpress").linhas.find((x) => x.id.startsWith("email"))!;
  assert.equal(l.qtd, 3);
  assert.ok(l.label.includes("3 caixas"));
});
ok("12. domínio que já tenho", () => {
  const e = est(st({ dominio: "tenho" }));
  for (const c of e.caminhos) assert.ok(!c.linhas.some((l) => l.id.startsWith("dominio")));
  assert.ok(e.avisos.includes("dominio-tenho"));
});
ok("13. loja", () => {
  const s = st({ tipo: "loja", recursos: ["pagamento"] });
  assert.ok(ids(s, "construtor").includes("construtor-loja"));
  assert.ok(ids(s, "wordpress").includes("hosp-loja") && ids(s, "wordpress").includes("wp-loja-extensoes"));
  assert.ok(est(s).avisos.includes("taxa-venda"));
  assert.deepEqual(ids(s, "ia"), ids(st({ tipo: "loja", recursos: [] }), "ia"));
  assert.ok(caminho(s, "ia").alertas.includes("ia-loja"));
  assert.ok(!ids(s, "freelancer").includes("recurso-pagamento"));
});
ok("14. login com IA", () => {
  const s = st({ recursos: ["login"] });
  assert.ok(ids(s, "ia").includes("hosp-compartilhada"));
  assert.ok(caminho(s, "ia").alertas.includes("ia-login"));
});
ok("15. IA simples e e-mail", () => {
  const s = st({ recursos: [] });
  assert.ok(ids(s, "ia").includes("hosp-estatica"));
  assert.ok(ids(s, "ia").includes("email-avulso"));
  assert.ok(ids(s, "wordpress").includes("email-hosp"));
  assert.ok(ids(s, "construtor").includes("email-avulso"));
});
ok("16. site grande alarga as faixas", () => {
  const a = est(st({ grande: false }));
  const b = est(st({ grande: true }));
  for (const id of ["freelancer", "agencia"] as const) {
    const x = a.caminhos.find((c) => c.id === id)!;
    const y = b.caminhos.find((c) => c.id === id)!;
    assert.ok(y.ano1.max > x.ano1.max, id);
    assert.ok(y.horasMontar.max > x.horasMontar.max, id);
  }
  assert.ok(b.avisos.includes("grande"));
});
ok("17. textos contratados", () => {
  for (const c of ["ia", "construtor", "wordpress", "freelancer", "agencia"]) {
    assert.ok(ids(st({ textos: "contrato" }), c).includes("redacao"), c);
    assert.ok(!ids(st({ textos: "eu" }), c).includes("redacao"), c);
    assert.ok(caminho(st({ textos: "eu" }), c).horasMontar.max > caminho(st({ textos: "contrato" }), c).horasMontar.max, c);
  }
});
ok("18. manutenção contratada", () => {
  const s = st({ manutencao: "contrato" });
  assert.ok(ids(s, "agencia").includes("manut-agencia"));
  for (const c of ["ia", "construtor", "wordpress", "freelancer"]) assert.ok(ids(s, c).includes("manut-freelancer"), c);
  assert.deepEqual(caminho(s, "ia").horasMes, { min: 0, max: 1 });
});
ok("19. selos: empate dá o selo a todos os empatados", () => {
  const d = clone();
  d.horas.construtor.institucional = { ...d.horas.wordpress.institucional };
  d.horasTextos.institucional = { min: 0, max: 0 };
  for (const c of ["ia", "freelancer", "agencia"] as const) d.horas[c].institucional = { min: 500, max: 600 };
  for (const c of ["construtor", "wordpress"] as const) d.horas[c].institucional = { min: 1, max: 2 };
  const e = est(st({ recursos: [], textos: "contrato", caixas: 0 }), d);
  const tempo = e.caminhos.filter((c) => c.selos.includes("menos-tempo")).map((c) => c.id);
  assert.deepEqual(tempo, ["construtor", "wordpress"]);
  assert.deepEqual(e.caminhos.map((c) => c.id), ["ia", "construtor", "wordpress", "freelancer", "agencia"]);
});
ok("20. sanidade: agência não custa menos que freelancer no 1º ano", () => {
  for (const tipo of ["pagina-unica", "institucional", "blog", "loja"] as const) {
    const e = est(st({ tipo, recursos: [] }));
    const f = e.caminhos.find((c) => c.id === "freelancer")!;
    const a = e.caminhos.find((c) => c.id === "agencia")!;
    assert.ok(a.ano1.min >= f.ano1.min, tipo);
  }
});
ok("20b. blog: recurso blog não soma duas vezes", () => {
  assert.deepEqual(ids(st({ tipo: "blog", recursos: ["blog"] }), "freelancer"), ids(st({ tipo: "blog", recursos: [] }), "freelancer"));
});
ok("20c. idiomas aumentam só as horas dos caminhos que você monta", () => {
  const a = caminho(st({ recursos: [] }), "wordpress").horasMontar;
  const b = caminho(st({ recursos: ["idiomas"] }), "wordpress").horasMontar;
  assert.ok(b.max > a.max);
  assert.deepEqual(caminho(st({ recursos: ["idiomas"] }), "ia").horasMontar.min >= caminho(st({ recursos: [] }), "ia").horasMontar.min, true);
});

// ───────────── Rascunho ─────────────

ok("21. rascunho inválido", () => {
  assert.equal(parseDraft(null), null);
  assert.equal(parseDraft("x"), null);
  assert.equal(parseDraft('{"v":2}'), null);
  assert.equal(parseDraft("[]"), null);
});
ok("22. rascunho com campos ruins", () => {
  const base = { v: 1 };
  assert.equal(parseDraft(JSON.stringify({ ...base, caixas: 99 }))!.caixas, 1);
  assert.equal(parseDraft(JSON.stringify({ ...base, caixas: 1.5 }))!.caixas, 1);
  assert.equal(parseDraft(JSON.stringify({ ...base, caixas: 0 }))!.caixas, 0);
  assert.deepEqual(parseDraft(JSON.stringify({ ...base, recursos: ["login", "foo", "login"] }))!.recursos, ["login"]);
  assert.equal(parseDraft(JSON.stringify({ ...base, valorHora: 0 }))!.valorHora, null);
  assert.equal(parseDraft(JSON.stringify({ ...base, valorHora: 50 }))!.valorHora, 50);
  assert.equal(parseDraft(JSON.stringify({ ...base, tipo: "x" }))!.tipo, "");
  assert.equal(parseDraft(JSON.stringify({ ...base, dominio: "x" }))!.dominio, "com-br");
});
ok("22b. rascunho completo volta igual", () => assert.deepEqual(parseDraft(JSON.stringify(EXAMPLE_STATE)), EXAMPLE_STATE));
ok("23. isDefaultLike", () => {
  assert.equal(isDefaultLike(DEFAULT_STATE), true);
  assert.equal(isDefaultLike(EXAMPLE_STATE), false);
  assert.equal(isDefaultLike({ ...DEFAULT_STATE, recursos: ["login"] }), false);
});

// ───────────── Resumo ─────────────

ok("24. resumo", () => {
  const e = est(EXAMPLE_STATE);
  const t = buildResumo(EXAMPLE_STATE, e, HOJE);
  assert.ok(t.includes("não é orçamento"));
  assert.ok(t.includes("19/11/2026"));
  for (const c of e.caminhos) assert.ok(t.includes(c.nome), c.nome);
  assert.ok(t.includes("fora do custo acima"));
  assert.ok(t.includes("https://criasite.app/ferramentas/quanto-custa-um-site#premissas"));
  assert.ok(t.endsWith("\n"));
  for (const l of t.split("\n")) assert.ok(l.length <= 110, `linha longa (${l.length}): ${l}`);
  const sem = buildResumo({ ...EXAMPLE_STATE, valorHora: null }, e, HOJE);
  assert.ok(!sem.includes("fora do custo acima"));
});
ok("24b. resumo: recursos vazios e sem e-mail", () => {
  const s = st({ recursos: [], caixas: 0 });
  const t = buildResumo(s, est(s), HOJE);
  assert.ok(t.includes("- Recursos: nenhum extra"));
  assert.ok(t.includes("- E-mail: não preciso agora"));
});
ok("25. nome do arquivo", () => assert.equal(resumoFileName("2026-11-19"), "orcamento-site-2026-11-19.txt"));

// ───────────── Validação dos dados ─────────────

const algum = (erros: string[], trecho: string) => assert.ok(erros.some((e) => e.includes(trecho)), `esperava "${trecho}" em ${JSON.stringify(erros)}`);
ok("26. validateData acusa os problemas", () => {
  let d = clone();
  d.premissas["hosp-loja"].primeiroAno = { min: 90, max: 10 };
  algum(validateData(d, HOJE), "mínimo maior");
  d = clone();
  d.premissas["hosp-loja"].depois = { min: -1, max: 10 };
  algum(validateData(d, HOJE), "negativo");
  d = clone();
  d.premissas["hosp-loja"].depois = { min: 1.5, max: 10 };
  algum(validateData(d, HOJE), "inteiros");
  d = clone();
  d.premissas["hosp-loja"].base = "curta";
  algum(validateData(d, HOJE), "menos de 30");
  d = clone();
  d.premissas["hosp-loja"].label = "Plano Hostinger";
  algum(validateData(d, HOJE), "nome de empresa");
  d = clone();
  d.premissas["hosp-loja"].base = "Critério: preço garantido para quem contratar por um ano.";
  algum(validateData(d, HOJE), "promessa");
  d = clone();
  d.premissas["hosp-loja"].base = "Critério: veja https://exemplo.com para o valor do dia na empresa.";
  algum(validateData(d, HOJE), "link");
  d = clone();
  d.updatedAt = "2026-12-01";
  algum(validateData(d, HOJE), "futuro");
  d = clone();
  delete (d.premissas as Record<string, unknown>)["wp-tema"];
  algum(validateData(d, HOJE), "premissa ausente");
  d = clone();
  d.premissas["ia-assinatura"].depois = { min: 0, max: 10 };
  algum(validateData(d, HOJE), "cobrança única");
  d = clone();
  d.validDays = 10;
  algum(validateData(d, HOJE), "validDays");
});
ok("27. isStale", () => {
  const d = clone();
  d.updatedAt = addDays(HOJE, -181);
  assert.equal(isStale(d, HOJE), true);
  d.updatedAt = addDays(HOJE, -180);
  assert.equal(isStale(d, HOJE), false);
  assert.equal(est(st(), d).stale, false);
  d.updatedAt = addDays(HOJE, -181);
  assert.equal(est(st(), d).stale, true);
});
ok("28. dados reais: sem erros e não vencidos", () => {
  assert.deepEqual(validateData(ORCAMENTO_DATA, todayInBrazil()), []);
  assert.equal(isStale(ORCAMENTO_DATA, todayInBrazil()), false, "Premissas vencidas: revise app/lib/orcamento/data.ts e atualize updatedAt");
});

console.log(process.exitCode ? `\nHá falhas (${count} testes passaram).` : `OK: ${count} testes passaram.`);
