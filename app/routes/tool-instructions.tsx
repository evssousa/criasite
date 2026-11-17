import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-instructions";
import { AMBER, Box, DraftStatus, HitMsg, Icon, SecretCard, Section, download } from "~/components/ToolForm";
import { ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, copyText, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import {
  DEFAULT_RULES,
  DEFAULT_STATE,
  EXAMPLE_STATE,
  LIMITS,
  MAX_LINES_OK,
  RULES,
  RULE_GROUPS,
  buildInstructions,
  countLines,
  isDefaultLike,
  parseDraft,
  resolveFileName,
  sizeStatus,
  type FileChoice,
  type InstrState,
  type RuleGroup,
  type RuleId,
} from "~/lib/instrucoes/build";
import { clearInstrDraft, loadInstrDraft, saveInstrDraft } from "~/lib/prefs";
import { findSecrets, type SecretField, type SecretHit } from "~/lib/segredos";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("arquivo-de-instrucoes-ia")!;

const FAQ = [
  {
    q: "O que é um arquivo AGENTS.md?",
    a: "É um arquivo de texto em Markdown, na pasta principal do projeto, com as regras que o assistente de código deve seguir: o que é o projeto, as tecnologias, os comandos e os cuidados. O nome AGENTS.md é uma convenção aberta, lida por várias ferramentas; outras usam nomes próprios, como o CLAUDE.md.",
  },
  {
    q: "Qual a diferença entre AGENTS.md e CLAUDE.md?",
    a: "Só o nome e a ferramenta que procura cada um. O conteúdo pode ser o mesmo: este gerador monta um texto só e muda apenas o nome do arquivo baixado. Confira na documentação da sua ferramenta qual nome ela lê.",
  },
  {
    q: "O CriaSite guarda o que eu escrevo aqui?",
    a: "Não. A ferramenta roda no seu navegador e nada é enviado para o nosso servidor. O rascunho fica só no armazenamento local deste navegador, para você continuar depois, e é apagado no botão “Limpar tudo”.",
  },
  {
    q: "O assistente vai seguir todas as regras?",
    a: "Não há garantia. O arquivo orienta o assistente, mas não trava nada: para o que é crítico, como apagar arquivos ou mexer no banco, use também as permissões da ferramenta e revise o que mudou antes de publicar.",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...seo({ title: "Gerador de AGENTS.md e CLAUDE.md: arquivo de instruções para IA", description: tool.description, path: "/ferramentas/arquivo-de-instrucoes-ia" }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    },
  ];
}

const SUGGESTIONS = ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vite", "Tailwind CSS", "Astro", "WordPress", "PHP", "Node.js", "Python", "MySQL"];

// ───────────── Utilitários ─────────────

const fieldsOf = (s: InstrState): SecretField[] => [
  { id: "ins-nome", label: "Nome do projeto", value: s.nome },
  { id: "ins-projeto", label: "O que é o projeto", value: s.projeto },
  { id: "ins-publico", label: "Público", value: s.publico },
  { id: "ins-tec", label: "Tecnologias", value: s.tecnologias.join(" ") },
  { id: "ins-cmd-instalar", label: "Instalar", value: s.cmdInstalar },
  { id: "ins-cmd-rodar", label: "Rodar", value: s.cmdRodar },
  { id: "ins-cmd-testar", label: "Testar", value: s.cmdTestar },
  { id: "ins-cmd-build", label: "Gerar a versão de produção", value: s.cmdBuild },
  { id: "ins-pastas", label: "Estrutura de pastas", value: s.pastas },
  { id: "ins-regras-livres", label: "Regras do seu projeto", value: s.regrasLivres },
  { id: "ins-docs", label: "Onde está a documentação", value: s.docs },
];

// ───────────── Peças da tela ─────────────

function TechChips({ techs, onChange, hit }: { techs: string[]; onChange: (next: string[]) => void; hit?: SecretHit }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const has = (t: string) => techs.some((x) => x.toLowerCase() === t.toLowerCase());
  const full = techs.length >= LIMITS.tecMax;

  function flash(m: string) {
    setNote(m);
    setTimeout(() => setNote(""), 2000);
  }

  function addMany(raw: string) {
    let next = [...techs];
    const dup: string[] = [];
    for (const part of raw.split(/[,\n]/)) {
      const t = Array.from(part.trim()).slice(0, LIMITS.tec).join("");
      if (!t) continue;
      if (next.some((x) => x.toLowerCase() === t.toLowerCase())) dup.push(t);
      else if (next.length < LIMITS.tecMax) next = [...next, t];
    }
    if (next.length !== techs.length) onChange(next);
    if (dup.length) flash(`${dup[0]} já está na lista.`);
    setText("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addMany(text);
    }
  }

  const extras = techs.filter((t) => !SUGGESTIONS.some((s) => s.toLowerCase() === t.toLowerCase()));
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Sugestões de tecnologias" className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((t) => {
          const on = has(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => onChange(on ? techs.filter((x) => x.toLowerCase() !== t.toLowerCase()) : [...techs, t])}
              className={cx(
                "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors disabled:opacity-50",
                on ? "border-brand bg-brand text-white" : "border-night-line-2 bg-night-2 text-moon hover:bg-night-3",
              )}
            >
              {on && <Icon name="check" size={14} />}
              {t}
            </button>
          );
        })}
      </div>
      <Box label="Outra tecnologia" id="ins-tec">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="ins-tec"
            value={text}
            maxLength={LIMITS.tec}
            disabled={full}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (/[,\n]/.test(pasted)) {
                e.preventDefault();
                addMany(pasted);
              }
            }}
            placeholder="Ex.: Laravel"
            autoComplete="off"
            aria-invalid={hit ? true : undefined}
            aria-describedby={hit ? "ins-tec-segredo" : undefined}
            className={cx(inputCls, "min-w-0 flex-1", hit && AMBER)}
          />
          <button type="button" disabled={full || !text.trim()} onClick={() => addMany(text)} className={cx(btnGhostCls, "shrink-0")}>
            Adicionar
          </button>
        </div>
        <HitMsg hit={hit} id="ins-tec" />
        {note && <p className="text-xs text-moon-muted">{note}</p>}
        {full && <p className="text-xs text-moon-muted">Limite de {LIMITS.tecMax} tecnologias.</p>}
      </Box>
      {extras.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Outras tecnologias escolhidas">
          {extras.map((t) => (
            <li key={t} className="inline-flex min-h-10 items-center gap-1 rounded-full bg-brand pr-1 pl-4 text-sm font-bold text-white">
              {t}
              <button
                type="button"
                aria-label={`Remover ${t}`}
                onClick={() => {
                  onChange(techs.filter((x) => x !== t));
                  inputRef.current?.focus();
                }}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/20"
              >
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RuleList({ chosen, onToggle }: { chosen: RuleId[]; onToggle: (id: RuleId) => void }) {
  const groups = Object.keys(RULE_GROUPS) as RuleGroup[];
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g} className="flex flex-col gap-1">
          <h3 className="text-[13px] font-bold tracking-[0.08em] text-moon-muted uppercase">{RULE_GROUPS[g]}</h3>
          <ul className="flex flex-col gap-1">
            {RULES.filter((r) => r.group === g).map((r) => (
              <li key={r.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-night-2">
                  <input type="checkbox" checked={chosen.includes(r.id)} onChange={() => onToggle(r.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
                  <span className="text-[15px] leading-snug">
                    {r.id === "build-antes" ? (
                      <>
                        Antes de dizer que terminou, rode o build e os testes e corrija os erros.
                        <span className="block text-xs text-moon-muted">Usa os comandos que você preencher acima.</span>
                      </>
                    ) : (
                      r.text
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FileNamePicker({ s, set, final }: { s: InstrState; set: <K extends keyof InstrState>(k: K, v: InstrState[K]) => void; final: ReturnType<typeof resolveFileName> }) {
  const options: { v: FileChoice; label: string }[] = [
    { v: "AGENTS.md", label: "AGENTS.md" },
    { v: "CLAUDE.md", label: "CLAUDE.md" },
    { v: "outro", label: "Outro nome" },
  ];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length;
    set("arquivo", options[next].v);
    refs.current[next]?.focus();
  }
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="Nome do arquivo" className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button
            key={o.v}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={s.arquivo === o.v}
            tabIndex={s.arquivo === o.v ? 0 : -1}
            onClick={() => set("arquivo", o.v)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx("min-h-10 rounded-full px-4 text-sm font-bold transition-colors", s.arquivo === o.v ? "bg-brand text-white" : "bg-night-2 text-moon hover:bg-night-3")}
          >
            {o.label}
          </button>
        ))}
      </div>
      {s.arquivo === "outro" && (
        <Box label="Nome do arquivo" id="ins-nome-outro">
          <input
            id="ins-nome-outro"
            value={s.arquivoOutro}
            maxLength={LIMITS.arquivoOutro}
            onChange={(e) => set("arquivoOutro", e.target.value)}
            placeholder="INSTRUCOES.md"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={final.ok ? undefined : true}
            aria-describedby="ins-nome-outro-msg"
            className={cx(inputCls, "font-mono", !final.ok && "border-down-night focus:border-down-night")}
          />
          <p id="ins-nome-outro-msg" className={cx("text-xs", final.ok ? "text-moon-muted" : "text-sm text-down-night")}>
            {final.ok ? `Vai baixar como ${final.name}.` : final.message}
          </p>
        </Box>
      )}
      <p className="text-xs text-moon-muted">O conteúdo é o mesmo; muda só o nome. Confira na documentação da sua ferramenta qual nome ela lê.</p>
    </div>
  );
}

function PreviewBody({ md, name }: { md: string; name: string }) {
  const rows = md.replace(/\n$/, "").split("\n");
  let inCode = false;
  return (
    <div
      role="region"
      tabIndex={0}
      aria-label={`Prévia de ${name}`}
      className="max-h-none overflow-auto py-3 font-mono text-[13px] leading-relaxed lg:max-h-[calc(100vh-24rem)] lg:min-h-[18rem]"
    >
      {rows.map((line, i) => {
        const isFence = /^(`{3,}|~{3,})/.test(line);
        let tone = "text-moon";
        let content: ReactNode = line === "" ? " " : line;
        if (isFence) {
          tone = "text-[#ffc9a3]";
          inCode = !inCode;
        } else if (inCode) tone = "text-[#ffc9a3]";
        else if (line.startsWith("#")) tone = "font-bold text-glow";
        else if (line.includes("`")) {
          content = line.split(/(`+[^`]*`+)/).map((part, k) =>
            k % 2 === 1 ? (
              <span key={k} className="text-[#ffc9a3]">
                {part}
              </span>
            ) : (
              part
            ),
          );
        }
        return (
          <div key={i} className="grid grid-cols-[2.75rem_minmax(0,1fr)]">
            <span aria-hidden className="pr-3 text-right text-moon-muted/50 select-none">
              {i + 1}
            </span>
            <span className={cx("pr-4 break-words whitespace-pre-wrap", tone)}>{content}</span>
          </div>
        );
      })}
    </div>
  );
}

// ───────────── Página ─────────────

export default function ToolInstructions() {
  const [s, setS] = useState<InstrState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"none" | "saved" | "nostorage">("none");
  const [confirmedSig, setConfirmedSig] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [live, setLive] = useState("");

  const set = <K extends keyof InstrState>(k: K, v: InstrState[K]) => setS((p) => ({ ...p, [k]: v }));

  const md = useMemo(() => buildInstructions(s), [s]);
  const lines = countLines(md);
  const size = sizeStatus(lines);
  const hits = useMemo(() => findSecrets(fieldsOf(s)), [s]);
  const hitSig = hits.map((h) => h.fieldId + h.kind + h.masked).join("|");
  const confirmed = hits.length > 0 && confirmedSig === hitSig;
  const blocked = hits.length > 0 && !confirmed;
  const fileName = resolveFileName(s.arquivo, s.arquivoOutro);
  const hitOf = (id: string) => hits.find((h) => h.fieldId === id);

  // Rascunho: lê uma vez no navegador (o servidor sempre renderiza o estado inicial) e só grava depois de ler.
  useEffect(() => {
    const d = parseDraft(loadInstrDraft());
    if (d) setS(d);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || blocked) return;
    const t = setTimeout(() => {
      if (isDefaultLike(s)) {
        clearInstrDraft();
        setSaveStatus("none");
      } else setSaveStatus(saveInstrDraft(JSON.stringify(s)) ? "saved" : "nostorage");
    }, 500);
    return () => clearTimeout(t);
  }, [s, loaded, blocked]);

  // Avisos curtos para o leitor de tela (a prévia em si não é aria-live).
  const prevSize = useRef(size);
  useEffect(() => {
    if (prevSize.current === size) return;
    prevSize.current = size;
    if (size === "longo") setLive(`Arquivo longo: mais de ${MAX_LINES_OK} linhas.`);
    else if (size === "ok") setLive("Tamanho do arquivo bom.");
  }, [size]);

  const prevSig = useRef("");
  useEffect(() => {
    if (hitSig && hitSig !== prevSig.current) setLive(`Possível segredo encontrado no campo ${hits[0].label}.`);
    prevSig.current = hitSig;
  }, [hitSig, hits]);

  const status = blocked ? "paused" : saveStatus;
  const empty = md === "";

  async function onCopy() {
    const ok = await copyText(md);
    setCopyFailed(!ok);
    if (ok) {
      setCopied(true);
      setLive("Copiado.");
      setTimeout(() => setCopied(false), 1800);
    }
  }

  function onExample() {
    if (!isDefaultLike(s) && !window.confirm("Trocar o que você escreveu pelo exemplo?")) return;
    setS(EXAMPLE_STATE);
    setLive("Exemplo preenchido.");
  }

  function onClear() {
    if (!isDefaultLike(s) && !window.confirm("Apagar todos os campos e o rascunho salvo neste navegador?")) return;
    setS(DEFAULT_STATE);
    clearInstrDraft();
    setSaveStatus("none");
    setLive("Campos limpos e rascunho apagado.");
    document.getElementById("ins-nome")?.focus();
  }

  const toggleRule = (id: RuleId) => setS((p) => ({ ...p, regras: p.regras.includes(id) ? p.regras.filter((r) => r !== id) : [...p.regras, id] }));

  const fp = (id: string) => ({ "aria-invalid": hitOf(id) ? (true as const) : undefined, "aria-describedby": hitOf(id) ? `${id}-segredo` : undefined });
  const cmdCls = (id: string) => cx(inputCls, "font-mono text-[15px]", hitOf(id) && AMBER);
  const cmdProps = { spellCheck: false, autoCapitalize: "none", autoComplete: "off", autoCorrect: "off", maxLength: LIMITS.cmd } as const;

  return (
    <ToolLayout
      tool={tool}
      lead="Preencha o projeto, as tecnologias, os comandos e as regras e baixe o AGENTS.md ou o CLAUDE.md pronto para a pasta do projeto. Tudo fica no seu navegador."
      explain={
        <>
          <h2>Como usar o gerador</h2>
          <p>
            Preencha os campos de cima para baixo e acompanhe o arquivo sendo montado na prévia. Nenhum campo é obrigatório: o que ficar vazio não entra no arquivo, então dá para
            começar pelo básico e voltar depois. Para ver como fica um arquivo completo, use “Preencher com exemplo”, que monta as instruções de uma confeitaria fictícia, e troque
            pelos dados do seu projeto.
          </p>
          <ul>
            <li>
              <strong>O projeto</strong>: duas frases dizendo o que o site faz e o que fica de fora, e uma sobre quem usa. É isso que ajuda o assistente a decidir o tom, as
              prioridades e o que não inventar.
            </li>
            <li>
              <strong>Tecnologias</strong>: marque as sugestões ou digite as suas e aperte Enter. Liste só as principais; o resto o assistente descobre lendo o código.
            </li>
            <li>
              <strong>Comandos</strong>: copie do seu projeto os comandos de instalar, rodar, testar e gerar a versão de produção, exatamente como você digita no terminal. A regra
              de rodar o build antes de dizer que terminou usa esses comandos.
            </li>
            <li>
              <strong>Pastas</strong>: poucas linhas, só as pastas que importam, com uma explicação curta ao lado de cada uma.
            </li>
            <li>
              <strong>Regras</strong>: as recomendadas já vêm marcadas. Desmarque o que não vale para você e escreva as regras do seu projeto, uma por linha.
            </li>
            <li>
              <strong>Documentação</strong>: diga onde ficam as anotações do projeto, como um docs/README.md, para o assistente ler antes de mudar algo.
            </li>
          </ul>
          <h2>AGENTS.md, CLAUDE.md ou outro nome?</h2>
          <p>
            O conteúdo é o mesmo; muda só o nome do arquivo baixado. O AGENTS.md é uma convenção aberta, lida por várias ferramentas de código. O CLAUDE.md é o nome que o Claude
            Code procura. Outras ferramentas usam nomes ou pastas próprias, então confira na documentação da sua qual arquivo ela lê. Se você usa mais de uma, escolha um arquivo
            principal e mantenha os outros iguais a ele: duas versões diferentes das regras confundem mais do que ajudam.
          </p>
          <h2>Onde salvar e como saber se funcionou</h2>
          <p>
            Salve o arquivo na pasta principal do projeto, a mesma do package.json ou do index.html, e inclua no Git com o resto do código: assim as regras valem para qualquer
            conversa nova e para quem mais trabalhar no projeto. Depois, abra uma conversa nova e peça ao assistente um resumo das regras do projeto. Se ele citar os seus comandos
            e as suas regras, o arquivo foi lido.
          </p>
          <h2>Nada de senha nem chave no arquivo</h2>
          <p>
            O arquivo de instruções vai para o Git e para o contexto da IA, então tudo o que estiver nele pode ser lido por outras pessoas e por outros serviços. Por isso, enquanto
            você digita, a ferramenta procura coisas com cara de segredo: chaves de API, tokens, senhas escritas como password= e blocos copiados de um arquivo .env. Se achar algo,
            ela avisa no campo e bloqueia copiar e baixar até você apagar o trecho ou confirmar que não é um segredo de verdade. A checagem é simples e pode deixar passar algum
            formato: ela ajuda, mas não substitui a sua revisão. Senhas e chaves ficam em variáveis de ambiente, como explica o guia de{" "}
            <Link to="/guias/seguranca-ao-criar-site-com-ia">segurança ao criar site com IA</Link>.
          </p>
          <h2>O rascunho fica no seu navegador</h2>
          <p>
            Tudo acontece no seu navegador: o que você digita não é enviado para o CriaSite nem para nenhum outro servidor. Para você não perder o trabalho, o rascunho fica salvo
            no armazenamento local deste navegador e volta quando você abrir a página de novo. Em computador compartilhado, use “Limpar tudo” ao terminar. Enquanto houver um
            possível segredo nos campos, o rascunho não é salvo.
          </p>
          <h2>Curto é melhor</h2>
          <p>
            O medidor ao lado da prévia conta as linhas do arquivo. Até umas 120 linhas está bom; passando disso, ele avisa. Instrução demais compete pela atenção do assistente, e
            as regras importantes se perdem no meio. Se o arquivo cresceu, corte o que o assistente descobre sozinho lendo o código e transforme procedimentos longos, usados só de
            vez em quando, em <Link to="/guias/skills-para-assistentes-de-ia">skills</Link>. O que colocar e o que deixar de fora está no guia{" "}
            <Link to="/guias/arquivo-de-instrucoes-para-assistente-de-codigo">arquivo de instruções para IA</Link>; com as regras prontas, o próximo passo do roteiro é{" "}
            <Link to="/criar-site-com-ia#pedir">pedir em partes pequenas</Link>, com a ajuda do <Link to="/ferramentas/prompt-para-site">gerador de prompt</Link>.
          </p>
          <h2>Perguntas frequentes</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </>
      }
    >
      <ToolPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DraftStatus status={status} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="#previa" className="inline-flex min-h-11 items-center text-sm font-bold text-glow underline-offset-4 hover:underline lg:hidden">
              Ver a prévia
            </a>
            <button type="button" onClick={onExample} className={btnGhostCls}>
              Preencher com exemplo
            </button>
            <button type="button" onClick={onClear} className="min-h-11 px-2 text-sm font-bold text-moon-muted underline-offset-4 hover:text-moon hover:underline">
              Limpar tudo
            </button>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {live}
        </p>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex gap-3 rounded-xl border border-night-line-2 bg-night-2 p-3.5 text-sm leading-relaxed">
              <span className="mt-0.5 shrink-0 text-glow">
                <Icon name="lock" size={18} />
              </span>
              <p>
                Não cole senhas, chaves de API nem tokens aqui: o arquivo vai para o Git e é lido pela IA. Se aparecer algo com cara de segredo, avisamos antes de copiar. Veja o{" "}
                <Link to="/guias/seguranca-ao-criar-site-com-ia" className="text-glow underline underline-offset-4">
                  guia de segurança
                </Link>
                .
              </p>
            </div>

            <Section n={1} title="O projeto" help="Duas frases bastam: o que o site faz e para quem.">
              <Box label="Nome do projeto" id="ins-nome">
                <input
                  id="ins-nome"
                  value={s.nome}
                  maxLength={LIMITS.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  placeholder="Ex.: Site da Confeitaria Doce Bairro"
                  autoComplete="off"
                  {...fp("ins-nome")}
                  className={cx(inputCls, hitOf("ins-nome") && AMBER)}
                />
                <HitMsg hit={hitOf("ins-nome")} id="ins-nome" />
              </Box>
              <Box
                label="O que é o projeto"
                id="ins-projeto"
                aside={
                  <span id="ins-projeto-conta" className="num text-xs text-moon-muted">
                    {Array.from(s.projeto).length}/{LIMITS.projeto}
                  </span>
                }
              >
                <textarea
                  id="ins-projeto"
                  rows={3}
                  value={s.projeto}
                  maxLength={LIMITS.projeto}
                  onChange={(e) => set("projeto", e.target.value)}
                  placeholder="Ex.: Site de uma confeitaria com cardápio e encomendas pelo WhatsApp. Não tem loja virtual."
                  aria-invalid={hitOf("ins-projeto") ? true : undefined}
                  aria-describedby={hitOf("ins-projeto") ? "ins-projeto-segredo ins-projeto-conta" : "ins-projeto-conta"}
                  className={cx(inputCls, "h-auto resize-y py-3 leading-relaxed", hitOf("ins-projeto") && AMBER)}
                />
                <HitMsg hit={hitOf("ins-projeto")} id="ins-projeto" />
              </Box>
              <Box label="Público" id="ins-publico">
                <input
                  id="ins-publico"
                  value={s.publico}
                  maxLength={LIMITS.publico}
                  onChange={(e) => set("publico", e.target.value)}
                  placeholder="Ex.: moradores da região que encomendam pelo celular"
                  autoComplete="off"
                  {...fp("ins-publico")}
                  className={cx(inputCls, hitOf("ins-publico") && AMBER)}
                />
                <HitMsg hit={hitOf("ins-publico")} id="ins-publico" />
              </Box>
            </Section>

            <Section n={2} title="Tecnologias" help="Só as principais. O assistente descobre o resto lendo o código.">
              <TechChips techs={s.tecnologias} onChange={(next) => set("tecnologias", next)} hit={hitOf("ins-tec")} />
            </Section>

            <Section n={3} title="Comandos" help="Exatamente como você digita no terminal. Deixe vazio o que o projeto não tem.">
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["ins-cmd-instalar", "Instalar", "npm install", "cmdInstalar"],
                    ["ins-cmd-rodar", "Rodar", "npm run dev", "cmdRodar"],
                    ["ins-cmd-testar", "Testar", "npm test", "cmdTestar"],
                    ["ins-cmd-build", "Gerar a versão de produção", "npm run build", "cmdBuild"],
                  ] as const
                ).map(([id, label, ph, key]) => (
                  <Box key={id} label={label} id={id}>
                    <input id={id} value={s[key]} onChange={(e) => set(key, e.target.value)} placeholder={ph} {...cmdProps} {...fp(id)} className={cmdCls(id)} />
                    <HitMsg hit={hitOf(id)} id={id} />
                  </Box>
                ))}
              </div>
            </Section>

            <Section n={4} title="Pastas e documentação" help="Poucas linhas, só as pastas que importam, com uma explicação curta ao lado.">
              <Box label="Estrutura de pastas" id="ins-pastas">
                <textarea
                  id="ins-pastas"
                  rows={6}
                  wrap="off"
                  value={s.pastas}
                  maxLength={LIMITS.pastasChars}
                  onChange={(e) => set("pastas", e.target.value)}
                  placeholder={"src/          código do site\npublic/       imagens e ícones\ndocs/         anotações do projeto"}
                  spellCheck={false}
                  aria-invalid={hitOf("ins-pastas") ? true : undefined}
                  aria-describedby={hitOf("ins-pastas") ? "ins-pastas-segredo" : undefined}
                  className={cx(inputCls, "h-auto resize-y py-3 font-mono text-[14px] leading-relaxed", hitOf("ins-pastas") && AMBER)}
                />
                <HitMsg hit={hitOf("ins-pastas")} id="ins-pastas" />
              </Box>
              <Box label="Onde está a documentação" id="ins-docs">
                <input
                  id="ins-docs"
                  value={s.docs}
                  maxLength={LIMITS.docs}
                  onChange={(e) => set("docs", e.target.value)}
                  placeholder="Ex.: docs/README.md (status e o que falta)"
                  autoComplete="off"
                  {...fp("ins-docs")}
                  className={cx(inputCls, hitOf("ins-docs") && AMBER)}
                />
                <HitMsg hit={hitOf("ins-docs")} id="ins-docs" />
              </Box>
            </Section>

            <Section
              n={5}
              title="Regras"
              help="As recomendadas já vêm marcadas. Desmarque o que não vale para o seu projeto."
              action={
                <button
                  type="button"
                  onClick={() => set("regras", [...DEFAULT_RULES])}
                  className="min-h-11 text-sm font-bold text-glow underline-offset-4 hover:underline"
                >
                  Voltar às recomendadas
                </button>
              }
            >
              <RuleList chosen={s.regras} onToggle={toggleRule} />
              <Box label="Regras do seu projeto (uma por linha)" id="ins-regras-livres">
                <textarea
                  id="ins-regras-livres"
                  rows={4}
                  value={s.regrasLivres}
                  maxLength={LIMITS.regrasChars}
                  onChange={(e) => set("regrasLivres", e.target.value)}
                  placeholder="Ex.: Fotos novas em WebP, no máximo 200 KB."
                  aria-invalid={hitOf("ins-regras-livres") ? true : undefined}
                  aria-describedby={hitOf("ins-regras-livres") ? "ins-regras-livres-segredo" : undefined}
                  className={cx(inputCls, "h-auto resize-y py-3 leading-relaxed", hitOf("ins-regras-livres") && AMBER)}
                />
                <HitMsg hit={hitOf("ins-regras-livres")} id="ins-regras-livres" />
              </Box>
            </Section>
          </div>

          <aside id="previa" aria-labelledby="previa-titulo" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
            <h2 id="previa-titulo" className="text-xl font-extrabold">
              Seu arquivo
            </h2>
            <FileNamePicker s={s} set={set} final={fileName} />

            <SecretCard
              hits={hits}
              confirmed={confirmed}
              onConfirm={(checked) => setConfirmedSig(checked ? hitSig : "")}
              intro="O arquivo vai para o Git e para a IA. Apague o trecho e guarde o valor em uma variável de ambiente."
            />

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={onCopy} disabled={empty || blocked} className={btnCls}>
                  {copied ? "Copiado" : "Copiar Markdown"}
                </button>
                <button
                  type="button"
                  onClick={() => fileName.ok && download(fileName.name, md)}
                  disabled={empty || blocked || !fileName.ok}
                  className={btnGhostCls}
                >
                  Baixar {fileName.ok ? fileName.name : "arquivo"}
                </button>
              </div>
              {blocked && <p className="text-xs text-moon-muted">Copiar e baixar ficam bloqueados enquanto houver um possível segredo.</p>}
              {copyFailed && <p className="text-sm text-glow">O navegador bloqueou a cópia. Selecione o texto da prévia e copie com Ctrl+C.</p>}
            </div>

            {!empty && !s.projeto && !s.cmdInstalar && !s.cmdRodar && !s.cmdTestar && !s.cmdBuild && (
              <p className="text-xs text-moon-muted">Dica: o projeto e os comandos são o que o assistente mais usa. Comece por eles.</p>
            )}

            <div className="overflow-hidden rounded-2xl border border-night-line-2 bg-[#081236]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-night-line-2 px-4 py-2.5">
                <span className="num inline-flex items-center gap-2 text-sm font-bold text-moon">
                  <Icon name="file" size={14} />
                  {fileName.ok ? fileName.name : "arquivo.md"}
                </span>
                {!empty && (
                  <span className="flex items-center gap-2 text-xs text-moon-muted">
                    <span className="num">{lines} linhas</span>
                    <span aria-hidden className="relative h-1.5 w-24 rounded-full bg-night-3">
                      <span className={cx("absolute inset-y-0 left-0 rounded-full", size === "longo" ? "bg-[#ffc857]" : "bg-up-night")} style={{ width: `${Math.min(lines / 160, 1) * 100}%` }} />
                      <span className="absolute top-[-2px] h-[10px] w-px bg-moon-muted/60" style={{ left: "75%" }} />
                    </span>
                    <span className={cx("inline-flex items-center gap-1 font-bold", size === "longo" ? "text-[#ffc857]" : "text-up-night")}>
                      <Icon name={size === "longo" ? "alert" : "check"} size={14} />
                      {size === "longo" ? "Longo" : "Tamanho bom"}
                    </span>
                  </span>
                )}
              </div>
              {size === "longo" && (
                <p className="bg-[#ffc857]/10 px-4 py-2.5 text-sm">
                  Mais de {MAX_LINES_OK} linhas. Instrução demais compete pela atenção do assistente: corte o que ele descobre lendo o código e passe procedimentos longos para{" "}
                  <Link to="/guias/skills-para-assistentes-de-ia" className="text-glow underline underline-offset-4">
                    skills
                  </Link>
                  .
                </p>
              )}
              {empty ? (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <span className="text-moon-muted">
                    <Icon name="file" size={32} />
                  </span>
                  <p className="font-bold">A prévia do arquivo aparece aqui.</p>
                  <p className="text-sm text-moon-muted">Comece pelo projeto ou veja um exemplo pronto.</p>
                  <button type="button" onClick={onExample} className={btnGhostCls}>
                    Preencher com exemplo
                  </button>
                </div>
              ) : (
                <PreviewBody md={md} name={fileName.ok ? fileName.name : "arquivo.md"} />
              )}
            </div>
          </aside>
        </div>

        <ToolDisclaimer>
          Roda no seu navegador: nada do que você digita aqui sai do seu computador. O rascunho fica salvo só neste navegador; use “Limpar tudo” para apagá-lo. Detalhes na{" "}
          <Link to="/privacidade" className="text-glow underline underline-offset-4">
            política de privacidade
          </Link>
          .
        </ToolDisclaimer>
      </ToolPanel>
    </ToolLayout>
  );
}
