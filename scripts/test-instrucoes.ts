// Testes do gerador de arquivo de instruções e do detector de segredos (docs/ferramenta-instrucoes-ia.md, "Como verificar").
// Rodar: node scripts/test-instrucoes.ts
// Os segredos falsos são montados por concatenação, para o texto literal de um token não existir no repositório
// (a proteção de segredos do GitHub pode barrar o push, e o repositório é público).
import assert from "node:assert/strict";
import {
  DEFAULT_RULES,
  DEFAULT_STATE,
  EMPTY_STATE,
  EXAMPLE_STATE,
  RULES,
  buildInstructions,
  countLines,
  isDefaultLike,
  parseDraft,
  resolveFileName,
  sizeStatus,
  type InstrState,
  type RuleId,
} from "../app/lib/instrucoes/build.ts";
import { findSecrets, maskSecret } from "../app/lib/segredos.ts";

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
const st = (patch: Partial<InstrState>): InstrState => ({ ...EMPTY_STATE, ...patch });
const lines = (md: string) => md.replace(/\n$/, "").split("\n");

// ───────────── Gerador ─────────────

ok("B1 estado vazio", () => {
  assert.equal(buildInstructions(EMPTY_STATE), "");
  assert.equal(countLines(""), 0);
  assert.equal(sizeStatus(0), "vazio");
});

ok("B2 estado inicial", () => {
  const md = buildInstructions(DEFAULT_STATE);
  assert.ok(md.startsWith("# Instruções do projeto\n\nInstruções para o assistente de código deste projeto."));
  assert.equal(lines(md).filter((l) => l.startsWith("- ")).length, 7);
  for (const h of ["## Projeto", "## Comandos", "## Tecnologias", "## Estrutura de pastas", "## Documentação"]) assert.ok(!md.includes(h), h);
  assert.ok(md.includes("- Antes de dizer que terminou, rode o build e os testes do projeto e corrija os erros.\n"));
  assert.equal(countLines(md), 13);
});

const GOLD = [
  "# Site da Confeitaria Doce Bairro",
  "",
  "Instruções para o assistente de código deste projeto. Siga estas regras em todas as tarefas.",
  "",
  "## Projeto",
  "",
  "Site de uma confeitaria de bairro com cardápio, encomendas pelo WhatsApp e página de contato. Não tem loja virtual nem pagamento online.",
  "",
  "Público: moradores da região que encomendam bolos e doces para festas, quase sempre pelo celular.",
  "",
  "## Tecnologias",
  "",
  "HTML, CSS, JavaScript, Vite.",
  "",
  "## Comandos",
  "",
  "- Instalar: `npm install`",
  "- Rodar: `npm run dev`",
  "- Gerar a versão de produção: `npm run build`",
  "",
  "## Estrutura de pastas",
  "",
  "```text",
  "index.html        página inicial",
  "src/paginas/      cardápio, encomendas e contato",
  "src/estilos/      CSS do site",
  "public/imagens/   fotos dos bolos (já comprimidas)",
  "```",
  "",
  "## Regras",
  "",
  "- Pergunte antes de apagar ou renomear arquivos.",
  "- Não instale dependências novas sem pedir; explique antes por que precisa.",
  "- Mude só o que foi pedido; não refatore nem reformate outras partes sem combinar.",
  "- Antes de dizer que terminou, rode `npm run build` e corrija os erros.",
  "- Ao terminar, liste os arquivos que você criou ou alterou.",
  "- Escreva os textos do site e as mensagens para mim em português do Brasil.",
  "- Não invente textos, números, depoimentos ou dados de clientes; escreva PREENCHER onde faltar conteúdo.",
  "- Mantenha o site acessível: texto alternativo nas imagens, rótulo nos campos e contraste suficiente.",
  "- Nunca escreva senha, chave de API ou token no código nem neste arquivo; use variáveis de ambiente.",
  "- Fotos novas: no máximo 200 KB, em WebP.",
  "- O botão de encomenda sempre abre o WhatsApp com a mensagem pronta.",
  "",
  "## Documentação",
  "",
  "docs/README.md (o que já foi feito e o que falta) e docs/decisoes.md (por que cada escolha foi feita).",
  "",
].join("\n");

ok("B3 exemplo = arquivo de ouro", () => {
  const md = buildInstructions(EXAMPLE_STATE);
  assert.equal(md, GOLD);
  assert.equal(countLines(md), 46);
  assert.equal(sizeStatus(46), "ok");
});

ok("B4 só público", () => assert.equal(buildInstructions(st({ publico: "lojistas" })).includes("## Projeto\n\nPúblico: lojistas\n"), true));

ok("B5 regra do build com testar e build", () => {
  const md = buildInstructions(st({ cmdTestar: "npm test", cmdBuild: "npm run build", regras: ["build-antes"] }));
  assert.ok(md.includes("- Testar: `npm test`\n- Gerar a versão de produção: `npm run build`"));
  assert.ok(md.includes("- Antes de dizer que terminou, rode `npm test` e `npm run build` e corrija os erros."));
});

ok("B6 regra do build só com testar", () => {
  assert.ok(buildInstructions(st({ cmdTestar: "npm test", regras: ["build-antes"] })).includes("- Antes de dizer que terminou, rode `npm test` e corrija os erros."));
});

ok("B7 comando com crase", () => {
  const md = buildInstructions(st({ cmdRodar: "echo `date`" }));
  assert.ok(md.includes("- Rodar: `` echo `date` ``\n"), md);
});

ok("B8 nome com título injetado", () => {
  const md = buildInstructions(st({ nome: "# Hack\n## Injetado" }));
  assert.equal(lines(md)[0], "# \\# Hack ## Injetado");
  assert.ok(!lines(md).includes("## Injetado"));
});

ok("B9 lista numerada no projeto", () => assert.ok(buildInstructions(st({ projeto: "1. primeiro passo" })).includes("\n\n1\\. primeiro passo\n")));

ok("B10 regras livres", () => {
  const md = buildInstructions(st({ regrasLivres: "- Use Tailwind\n* Sem jQuery\n\n3) Teste no celular\n# Título falso" }));
  for (const item of ["- Use Tailwind", "- Sem jQuery", "- Teste no celular", "- \\# Título falso"]) assert.ok(lines(md).includes(item), item);
});

ok("B11 linha horizontal e citação", () => {
  const md = buildInstructions(st({ regrasLivres: "---\n> citação" }));
  assert.ok(lines(md).includes("- \\---"));
  assert.ok(lines(md).includes("- \\> citação"));
});

ok("B12 HTML escapado", () => assert.ok(buildInstructions(st({ docs: "<!-- escondido --> e <b>negrito</b>" })).includes("\\<!-- escondido --> e \\<b>negrito\\</b>")));

ok("B13 cerca de crases maior", () => {
  const md = buildInstructions(st({ pastas: "src/\n```\nfim" }));
  assert.ok(md.includes("````text\nsrc/\n```\nfim\n````\n"));
});

ok("B14 pastas limpas", () => assert.ok(buildInstructions(st({ pastas: "\n\n\tsrc/  \n\n\n\npublic/\n\n" })).includes("```text\n  src/\n\npublic/\n```")));

ok("B15 pastas limitadas a 80 linhas", () => {
  const md = buildInstructions(st({ pastas: Array.from({ length: 100 }, (_, i) => `pasta${i}/`).join("\n") }));
  const inside = md.split("```text\n")[1].split("\n```")[0].split("\n");
  assert.equal(inside.length, 80);
});

ok("B16 tecnologias sem repetidas", () => assert.ok(buildInstructions(st({ tecnologias: ["HTML", "html", "CSS", ""] })).includes("## Tecnologias\n\nHTML, CSS.\n")));

ok("B17 caracteres de controle e de direção", () => assert.ok(buildInstructions(st({ projeto: "abc\u202Edef\u0007 ghi" })).includes("\n\nabcdef ghi\n")));

ok("B18 regras repetidas e desconhecidas", () => {
  const md = buildInstructions(st({ regras: ["xyz", "segredos", "perguntar-apagar", "segredos"] as unknown as RuleId[] }));
  const items = lines(md).filter((l) => l.startsWith("- "));
  assert.equal(items.length, 2);
  assert.ok(items[0].includes("apagar"));
  assert.ok(items[1].includes("senha"));
});

ok("B19 formato: sem linhas vazias seguidas, sem espaço no fim, um \\n no final", () => {
  const all: InstrState[] = [
    DEFAULT_STATE,
    EXAMPLE_STATE,
    st({ publico: "lojistas" }),
    st({ cmdRodar: "echo `date`" }),
    st({ nome: "# Hack\n## Injetado" }),
    st({ pastas: "src/\n```\nfim" }),
    st({ pastas: "\n\n\tsrc/  \n\n\n\npublic/\n\n" }),
    st({ regrasLivres: "- a\n\n\n- b  " }),
  ];
  for (const s of all) {
    const md = buildInstructions(s);
    // (as linhas vazias seguidas dentro do bloco de pastas são colapsadas em uma, então a regra vale para o arquivo todo)
    assert.ok(!md.includes("\n\n\n"), JSON.stringify(s).slice(0, 60));
    assert.ok(!/[ \t]+$/m.test(md));
    assert.ok(md.endsWith("\n") && !md.endsWith("\n\n"));
  }
});

ok("B20 projeto cortado em 400 caracteres", () => {
  const md = buildInstructions(st({ projeto: "a".repeat(500) }));
  assert.ok(md.includes(`\n\n${"a".repeat(400)}\n`) && !md.includes("a".repeat(401)));
});

ok("medidor", () => {
  assert.equal(sizeStatus(120), "ok");
  assert.equal(sizeStatus(121), "longo");
  const big = st({
    pastas: Array.from({ length: 100 }, (_, i) => `p${i}/`).join("\n"),
    regrasLivres: Array.from({ length: 50 }, (_, i) => `regra ${i}`).join("\n"),
    regras: RULES.map((r) => r.id),
  });
  assert.equal(sizeStatus(countLines(buildInstructions(big))), "longo");
});

ok("regras prontas: 13, 7 marcadas", () => {
  assert.equal(RULES.length, 13);
  assert.equal(DEFAULT_RULES.length, 7);
});

ok("isDefaultLike", () => {
  assert.equal(isDefaultLike(DEFAULT_STATE), true);
  assert.equal(isDefaultLike(EMPTY_STATE), true);
  assert.equal(isDefaultLike(EXAMPLE_STATE), false);
  assert.equal(isDefaultLike({ ...DEFAULT_STATE, nome: "x" }), false);
});

// ───────────── Rascunho ─────────────

for (const bad of [null, "lixo", "[]", "{}"]) ok(`P1 rascunho inválido ${bad}`, () => assert.equal(parseDraft(bad), null));
ok("P2 exemplo volta igual", () => assert.deepEqual(parseDraft(JSON.stringify(EXAMPLE_STATE)), EXAMPLE_STATE));
ok("P3 versão desconhecida", () => assert.equal(parseDraft(JSON.stringify({ ...EXAMPLE_STATE, v: 2 })), null));
ok("P4 campos com tipo errado", () => {
  const d = parseDraft(JSON.stringify({ ...EXAMPLE_STATE, projeto: 5, nome: null }));
  assert.equal(d?.projeto, "");
  assert.equal(d?.nome, "");
});
ok("P5 tecnologias", () => {
  const many = Array.from({ length: 25 }, (_, i) => `T${i}`);
  const d = parseDraft(JSON.stringify({ ...EXAMPLE_STATE, tecnologias: ["A", 3, "a", "B", ...many] }));
  assert.ok(d);
  assert.equal(d.tecnologias.length, 20);
  assert.deepEqual(d.tecnologias.slice(0, 2), ["A", "B"]);
  assert.ok(d.tecnologias.every((t) => typeof t === "string"));
});
ok("P6 regras desconhecidas", () => assert.deepEqual(parseDraft(JSON.stringify({ ...EXAMPLE_STATE, regras: ["escopo", "inventada"] }))?.regras, ["escopo"]));
ok("P7 arquivo inválido", () => assert.equal(parseDraft(JSON.stringify({ ...EXAMPLE_STATE, arquivo: "../x" }))?.arquivo, "AGENTS.md"));

// ───────────── Nome do arquivo ─────────────

ok("nome pronto", () => {
  assert.deepEqual(resolveFileName("AGENTS.md", "qualquer"), { ok: true, name: "AGENTS.md" });
  assert.deepEqual(resolveFileName("CLAUDE.md", ""), { ok: true, name: "CLAUDE.md" });
});
for (const [input, name] of [["INSTRUCOES", "INSTRUCOES.md"], ["regras.md", "regras.md"], ["Regras.MD", "Regras.MD"], ["notas.txt", "notas.txt.md"]])
  ok(`nome outro ${input}`, () => assert.deepEqual(resolveFileName("outro", input), { ok: true, name }));
const msg = (input: string) => {
  const r = resolveFileName("outro", input);
  assert.equal(r.ok, false);
  return (r as { message: string }).message;
};
for (const e of ["", "   "]) ok(`nome vazio "${e}"`, () => assert.equal(msg(e), "Digite um nome para o arquivo."));
ok("nome longo", () => assert.equal(msg("a".repeat(65)), "Use até 64 caracteres."));
for (const e of [".cursorrules", ".env"]) ok(`nome com ponto ${e}`, () => assert.equal(msg(e), "O nome não pode começar com ponto."));
for (const e of ["../segredo", "pasta/arquivo", "C:\\x", "a b", "arq*?.md", "arq..md", "-x"]) ok(`nome com caractere inválido ${e}`, () => assert.ok(msg(e).startsWith("Use só letras")));
for (const e of ["con", "CON.md", "nul", "lpt1.md"]) ok(`nome reservado ${e}`, () => assert.equal(msg(e), "Esse nome é reservado pelo Windows. Escolha outro."));

// ───────────── Segredos ─────────────

const find = (value: string, id = "ins-regras-livres") => findSecrets([{ id, label: "Campo", value }]);
const A = (n: number) => "a".repeat(n);
const mustFind: [string, string, string?][] = [
  ["chave de API", "sk-" + "proj-" + "x".repeat(24)],
  ["chave de API", "AIza" + A(35)],
  ["token do GitHub", "gh" + "p_" + A(36)],
  ["chave de acesso da AWS", "AKIAIOSFODNN7EXAMPLE"],
  ["senha ou segredo escrito no texto", "password=hunter2!"],
  ["senha ou segredo escrito no texto", "DB_PASSWORD=s3nh4forte"],
  ["bloco de variáveis de ambiente (.env)", "API_URL=https://x.com\nNODE_ENV=production", "ins-pastas"],
  ["chave privada", "-----BEGIN OPENSSH PRIVATE KEY-----"],
  ["endereço com usuário e senha", "postgres://admin:" + "s3cr3t@db.exemplo.com/app"],
  ["token JWT", "eyJ" + A(12) + "." + A(12) + "." + A(12)],
  ["token do Slack", "xox" + "b-" + A(12)],
];
for (const [kind, value, id] of mustFind) ok(`segredo: ${kind} (${value.slice(0, 8)}…)`, () => assert.ok(find(value, id).some((h) => h.kind === kind), JSON.stringify(find(value, id))));

const mustNot = [
  "Nunca escreva senha no código",
  "Senha: pergunte antes",
  "sk-8",
  "use process.env.API_KEY",
  "API_KEY=",
  "o token fica no .env",
  "https://exemplo.com.br/contato",
  "desk-top-application",
  "risk-assessment-framework-v2-final",
  "ghp_curto",
  "Pergunte antes de mudar o banco",
];
for (const value of mustNot) ok(`sem segredo: ${value}`, () => assert.deepEqual(find(value), []));

ok("maskSecret mostra só o começo", () => assert.equal(maskSecret("sk-proj-abc123456789"), "sk-p…"));
ok("dois segredos do mesmo tipo no mesmo campo: 1 achado", () => assert.equal(find("gh" + "p_" + A(36) + " e " + "gh" + "o_" + A(36)).length, 1));
ok("o texto fixo das regras prontas não dispara", () => {
  const md = buildInstructions(st({ regras: RULES.map((r) => r.id) }));
  assert.deepEqual(find(md), []);
});

console.log(process.exitCode ? `\nHá falhas (${count} testes passaram).` : `OK: ${count} testes passaram.`);
