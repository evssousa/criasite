// Gerador do arquivo de instruções para assistentes de código (AGENTS.md, CLAUDE.md). Funções puras, sem React, sem `~/`,
// sem importar site.ts (o script de teste roda direto no Node). Ver docs/ferramenta-instrucoes-ia.md, parte A.

export type RuleId =
  | "perguntar-apagar"
  | "perguntar-instalar"
  | "perguntar-banco"
  | "sem-commit"
  | "plano-antes"
  | "escopo"
  | "reaproveitar"
  | "build-antes"
  | "listar-arquivos"
  | "pt-br"
  | "nao-inventar"
  | "acessibilidade"
  | "segredos";

export type FileChoice = "AGENTS.md" | "CLAUDE.md" | "outro";
export type RuleGroup = "antes" | "durante" | "entregar" | "conteudo";

export interface InstrState {
  v: 1;
  /** Nome do projeto (vira o título do arquivo). */
  nome: string;
  /** O que é, em 2 frases. */
  projeto: string;
  publico: string;
  /** Chips, na ordem em que foram adicionados. */
  tecnologias: string[];
  cmdInstalar: string;
  cmdRodar: string;
  cmdTestar: string;
  cmdBuild: string;
  /** Várias linhas (vira bloco de código). */
  pastas: string;
  /** Marcadas (a ordem de saída é a de RULES, não a deste array). */
  regras: RuleId[];
  /** Uma regra por linha. */
  regrasLivres: string;
  docs: string;
  arquivo: FileChoice;
  /** Usado só quando arquivo === "outro". */
  arquivoOutro: string;
}

export const LIMITS = {
  nome: 80,
  projeto: 400,
  publico: 300,
  docs: 300,
  tec: 40,
  tecMax: 20,
  cmd: 150,
  pastasChars: 4000,
  pastasLines: 80,
  regrasChars: 4000,
  regraItem: 300,
  regrasMax: 40,
  arquivoOutro: 64,
} as const;

/** Acima disso o medidor avisa (guia G3: instrução demais compete por atenção). */
export const MAX_LINES_OK = 120;

// ───────────── Regras prontas ─────────────

export const RULE_GROUPS: Record<RuleGroup, string> = {
  antes: "Antes de mexer",
  durante: "Durante o trabalho",
  entregar: "Antes de entregar",
  conteudo: "Conteúdo e segurança",
};

export const RULES: { id: RuleId; group: RuleGroup; text: string; default: boolean }[] = [
  { id: "perguntar-apagar", group: "antes", default: true, text: "Pergunte antes de apagar ou renomear arquivos." },
  { id: "perguntar-instalar", group: "antes", default: true, text: "Não instale dependências novas sem pedir; explique antes por que precisa." },
  { id: "perguntar-banco", group: "antes", default: false, text: "Pergunte antes de mudar o banco de dados (tabelas, colunas ou migrations)." },
  { id: "sem-commit", group: "antes", default: false, text: "Não faça commit nem push sem eu pedir." },
  { id: "plano-antes", group: "antes", default: false, text: "Em tarefas grandes, mostre antes o plano (arquivos e passos) e espere o meu ok para escrever código." },
  { id: "escopo", group: "durante", default: true, text: "Mude só o que foi pedido; não refatore nem reformate outras partes sem combinar." },
  { id: "reaproveitar", group: "durante", default: false, text: "Reaproveite os componentes e estilos que já existem antes de criar novos." },
  { id: "build-antes", group: "entregar", default: true, text: "" }, // texto dinâmico: buildRuleText
  { id: "listar-arquivos", group: "entregar", default: true, text: "Ao terminar, liste os arquivos que você criou ou alterou." },
  { id: "pt-br", group: "conteudo", default: true, text: "Escreva os textos do site e as mensagens para mim em português do Brasil." },
  { id: "nao-inventar", group: "conteudo", default: false, text: "Não invente textos, números, depoimentos ou dados de clientes; escreva PREENCHER onde faltar conteúdo." },
  { id: "acessibilidade", group: "conteudo", default: false, text: "Mantenha o site acessível: texto alternativo nas imagens, rótulo nos campos e contraste suficiente." },
  { id: "segredos", group: "conteudo", default: true, text: "Nunca escreva senha, chave de API ou token no código nem neste arquivo; use variáveis de ambiente." },
];

export const DEFAULT_RULES: RuleId[] = RULES.filter((r) => r.default).map((r) => r.id);
const RULE_IDS = new Set<string>(RULES.map((r) => r.id));

export const EMPTY_STATE: InstrState = {
  v: 1,
  nome: "",
  projeto: "",
  publico: "",
  tecnologias: [],
  cmdInstalar: "",
  cmdRodar: "",
  cmdTestar: "",
  cmdBuild: "",
  pastas: "",
  regras: [],
  regrasLivres: "",
  docs: "",
  arquivo: "AGENTS.md",
  arquivoOutro: "",
};

export const DEFAULT_STATE: InstrState = { ...EMPTY_STATE, regras: [...DEFAULT_RULES] };

export const EXAMPLE_STATE: InstrState = {
  v: 1,
  nome: "Site da Confeitaria Doce Bairro",
  projeto: "Site de uma confeitaria de bairro com cardápio, encomendas pelo WhatsApp e página de contato. Não tem loja virtual nem pagamento online.",
  publico: "moradores da região que encomendam bolos e doces para festas, quase sempre pelo celular.",
  tecnologias: ["HTML", "CSS", "JavaScript", "Vite"],
  cmdInstalar: "npm install",
  cmdRodar: "npm run dev",
  cmdTestar: "",
  cmdBuild: "npm run build",
  pastas: "index.html        página inicial\nsrc/paginas/      cardápio, encomendas e contato\nsrc/estilos/      CSS do site\npublic/imagens/   fotos dos bolos (já comprimidas)",
  regras: [...DEFAULT_RULES, "nao-inventar", "acessibilidade"],
  regrasLivres: "Fotos novas: no máximo 200 KB, em WebP.\nO botão de encomenda sempre abre o WhatsApp com a mensagem pronta.",
  docs: "docs/README.md (o que já foi feito e o que falta) e docs/decisoes.md (por que cada escolha foi feita).",
  arquivo: "AGENTS.md",
  arquivoOutro: "",
};

// ───────────── Limpeza e escapes ─────────────

/** Remove caracteres de controle e de direção de texto (evita texto "invertido" escondido, o truque trojan source). */
export function stripControls(s: string): string {
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[‎‏‪-‮⁦-⁩]/g, "");
}

const cutChars = (s: string, max: number) => Array.from(s).slice(0, max).join("");

/** Campo de uma linha: sem controles, espaços normalizados, cortado no limite e com `<` de tag/comentário escapado. */
export function clean(s: string, max: number, escapeTags = true): string {
  const t = cutChars(stripControls(String(s ?? "")).replace(/\s+/g, " ").trim(), max).trimEnd();
  return escapeTags ? t.replace(/<(?=[A-Za-z!/?])/g, "\\<") : t;
}

/** Escapa o começo da linha para o texto do usuário não virar título, citação, lista, linha horizontal ou bloco de código. */
export function safeLine(s: string): string {
  if (/^#{1,6}(\s|$)/.test(s)) return `\\${s}`;
  if (/^>/.test(s)) return `\\${s}`;
  if (/^([-*_=])\s*(?:\1\s*){2,}$/.test(s)) return `\\${s}`;
  if (/^[-+*](\s|$)/.test(s)) return `\\${s}`;
  const m = s.match(/^(\d{1,9})([.)])(\s|$)/);
  if (m) return `${m[1]}\\${s.slice(m[1].length)}`;
  if (/^(`{3,}|~{3,})/.test(s)) return `\\${s}`;
  return s;
}

/** Comando dentro de crases, com cerca maior quando o próprio comando tem crases. */
export function inlineCode(cmd: string): string {
  const longest = Math.max(0, ...(cmd.match(/`+/g) ?? []).map((r) => r.length));
  const fence = "`".repeat(longest + 1);
  const pad = cmd.startsWith("`") || cmd.endsWith("`") ? " " : "";
  return `${fence}${pad}${cmd}${pad}${fence}`;
}

/** Bloco de várias linhas (pastas): sem escape, porque vai dentro de um bloco de código. */
export function cleanBlock(s: string, maxChars: number, maxLines: number): string {
  const text = cutChars(stripControls(String(s ?? "")).replace(/\r\n?/g, "\n").replace(/\t/g, "  "), maxChars);
  const lines = text.split("\n").map((l) => l.trimEnd());
  while (lines.length && lines[0] === "") lines.shift();
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  const out: string[] = [];
  for (const l of lines) {
    if (l === "" && out[out.length - 1] === "") continue;
    out.push(l);
  }
  return out.slice(0, maxLines).join("\n");
}

/** Regras livres: uma por linha, sem marcador de lista já digitado, limpas e sem vazias. */
export function cleanRules(s: string): string[] {
  const text = cutChars(String(s ?? ""), LIMITS.regrasChars);
  const items: string[] = [];
  for (const raw of stripControls(text).split(/\r\n?|\n/)) {
    const item = clean(raw.replace(/^\s*(?:[-+*•]|\d{1,3}[.)])\s+/, ""), LIMITS.regraItem);
    if (item) items.push(item);
    if (items.length >= LIMITS.regrasMax) break;
  }
  return items;
}

function cleanTechs(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const t = clean(raw, LIMITS.tec);
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= LIMITS.tecMax) break;
  }
  return out;
}

// ───────────── O arquivo ─────────────

/** Texto da regra "build-antes", que usa os comandos preenchidos. */
export function buildRuleText(testar: string, build: string): string {
  if (testar && build) return `Antes de dizer que terminou, rode ${inlineCode(testar)} e ${inlineCode(build)} e corrija os erros.`;
  if (build) return `Antes de dizer que terminou, rode ${inlineCode(build)} e corrija os erros.`;
  if (testar) return `Antes de dizer que terminou, rode ${inlineCode(testar)} e corrija os erros.`;
  return "Antes de dizer que terminou, rode o build e os testes do projeto e corrija os erros.";
}

/** Monta o Markdown. Estado totalmente vazio devolve "". Seção sem conteúdo some inteira. */
export function buildInstructions(s: InstrState): string {
  const nome = clean(s.nome, LIMITS.nome);
  const projeto = clean(s.projeto, LIMITS.projeto);
  const publico = clean(s.publico, LIMITS.publico);
  const techs = cleanTechs(Array.isArray(s.tecnologias) ? s.tecnologias : []);
  const cmds = {
    instalar: clean(s.cmdInstalar, LIMITS.cmd, false),
    rodar: clean(s.cmdRodar, LIMITS.cmd, false),
    testar: clean(s.cmdTestar, LIMITS.cmd, false),
    build: clean(s.cmdBuild, LIMITS.cmd, false),
  };
  const pastas = cleanBlock(s.pastas, LIMITS.pastasChars, LIMITS.pastasLines);
  const chosen = new Set((Array.isArray(s.regras) ? s.regras : []).filter((r) => RULE_IDS.has(r)));
  const rules = [
    ...RULES.filter((r) => chosen.has(r.id)).map((r) => safeLine(r.id === "build-antes" ? buildRuleText(cmds.testar, cmds.build) : r.text)),
    ...cleanRules(s.regrasLivres).map(safeLine),
  ];
  const docs = clean(s.docs, LIMITS.docs);

  const blocks: string[] = [];
  if (projeto || publico) blocks.push(["## Projeto", ...(projeto ? [safeLine(projeto)] : []), ...(publico ? [`Público: ${publico}`] : [])].join("\n\n"));
  if (techs.length) {
    const last = techs[techs.length - 1];
    blocks.push(`## Tecnologias\n\n${safeLine(techs.join(", ") + (/[.!?]$/.test(last) ? "" : "."))}`);
  }
  const cmdLines = [
    cmds.instalar && `- Instalar: ${inlineCode(cmds.instalar)}`,
    cmds.rodar && `- Rodar: ${inlineCode(cmds.rodar)}`,
    cmds.testar && `- Testar: ${inlineCode(cmds.testar)}`,
    cmds.build && `- Gerar a versão de produção: ${inlineCode(cmds.build)}`,
  ].filter(Boolean);
  if (cmdLines.length) blocks.push(`## Comandos\n\n${cmdLines.join("\n")}`);
  if (pastas) {
    const longest = Math.max(0, ...(pastas.match(/`+/g) ?? []).map((r) => r.length));
    const fence = "`".repeat(Math.max(3, longest + 1));
    blocks.push(`## Estrutura de pastas\n\n${fence}text\n${pastas}\n${fence}`);
  }
  if (rules.length) blocks.push(`## Regras\n\n${rules.map((r) => `- ${r}`).join("\n")}`);
  if (docs) blocks.push(`## Documentação\n\n${safeLine(docs)}`);

  if (!nome && blocks.length === 0) return "";
  const head = `# ${nome ? safeLine(nome) : "Instruções do projeto"}\n\nInstruções para o assistente de código deste projeto. Siga estas regras em todas as tarefas.`;
  return `${[head, ...blocks].join("\n\n")}\n`;
}

// ───────────── Medidor, rascunho e nome do arquivo ─────────────

export const countLines = (md: string): number => (md === "" ? 0 : md.replace(/\n$/, "").split("\n").length);

export function sizeStatus(lines: number): "vazio" | "ok" | "longo" {
  return lines === 0 ? "vazio" : lines <= MAX_LINES_OK ? "ok" : "longo";
}

const sameRules = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/** True para o estado inicial ou o vazio (não vale a pena gravar rascunho). */
export function isDefaultLike(s: InstrState): boolean {
  const empty = !s.nome && !s.projeto && !s.publico && !s.cmdInstalar && !s.cmdRodar && !s.cmdTestar && !s.cmdBuild && !s.pastas && !s.regrasLivres && !s.docs;
  return empty && s.tecnologias.length === 0 && s.arquivo === "AGENTS.md" && !s.arquivoOutro && (sameRules(s.regras, DEFAULT_RULES) || s.regras.length === 0);
}

/** Lê o rascunho guardado, aceitando só o formato conhecido (v: 1). Campo fora do esperado vira vazio. */
export function parseDraft(raw: string | null): InstrState | null {
  if (!raw) return null;
  let d: unknown;
  try {
    d = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!d || typeof d !== "object" || Array.isArray(d) || (d as { v?: unknown }).v !== 1) return null;
  const o = d as Record<string, unknown>;
  const text = (k: string, max: number) => (typeof o[k] === "string" ? cutChars(o[k] as string, max) : "");
  const seen = new Set<string>();
  const techs: string[] = [];
  if (Array.isArray(o.tecnologias)) {
    for (const t of o.tecnologias) {
      if (typeof t !== "string") continue;
      const c = cutChars(t, LIMITS.tec);
      if (!c || seen.has(c.toLowerCase())) continue;
      seen.add(c.toLowerCase());
      techs.push(c);
      if (techs.length >= LIMITS.tecMax) break;
    }
  }
  const regras: RuleId[] = [];
  if (Array.isArray(o.regras)) for (const r of o.regras) if (typeof r === "string" && RULE_IDS.has(r) && !regras.includes(r as RuleId)) regras.push(r as RuleId);
  return {
    v: 1,
    nome: text("nome", LIMITS.nome),
    projeto: text("projeto", LIMITS.projeto),
    publico: text("publico", LIMITS.publico),
    tecnologias: techs,
    cmdInstalar: text("cmdInstalar", LIMITS.cmd),
    cmdRodar: text("cmdRodar", LIMITS.cmd),
    cmdTestar: text("cmdTestar", LIMITS.cmd),
    cmdBuild: text("cmdBuild", LIMITS.cmd),
    pastas: text("pastas", LIMITS.pastasChars),
    regras,
    regrasLivres: text("regrasLivres", LIMITS.regrasChars),
    docs: text("docs", LIMITS.docs),
    arquivo: o.arquivo === "AGENTS.md" || o.arquivo === "CLAUDE.md" || o.arquivo === "outro" ? o.arquivo : "AGENTS.md",
    arquivoOutro: text("arquivoOutro", LIMITS.arquivoOutro),
  };
}

/** Nome do arquivo baixado: sem pastas, sem ponto no começo, sem nomes reservados do Windows, sempre termina em .md. */
export function resolveFileName(choice: FileChoice, outro: string): { ok: true; name: string } | { ok: false; message: string } {
  if (choice !== "outro") return { ok: true, name: choice };
  const t = String(outro ?? "").trim();
  if (!t) return { ok: false, message: "Digite um nome para o arquivo." };
  if (Array.from(t).length > LIMITS.arquivoOutro) return { ok: false, message: "Use até 64 caracteres." };
  if (t.startsWith(".") && !/[/\\]/.test(t)) return { ok: false, message: "O nome não pode começar com ponto." };
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(t) || t.includes("..")) return { ok: false, message: "Use só letras, números, ponto, hífen e sublinhado, sem pastas (ex.: INSTRUCOES.md)." };
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(t.split(".")[0])) return { ok: false, message: "Esse nome é reservado pelo Windows. Escolha outro." };
  return { ok: true, name: /\.md$/i.test(t) ? t : `${t}.md` };
}
