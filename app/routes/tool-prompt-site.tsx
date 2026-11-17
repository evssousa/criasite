import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-prompt-site";
import { AMBER, Box, DraftStatus, HitMsg, Icon, RadioGroup, SecretCard, Section, download } from "~/components/ToolForm";
import { ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, copyText, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import {
  ACOES,
  CLIMAS,
  DEFAULT_RESTRICOES,
  DEFAULT_STATE,
  EVITAR,
  EXAMPLE_STATE,
  FONTES,
  FORMATOS,
  HOSPEDAGENS,
  LIMITS,
  MARK_END,
  MARK_START,
  MAX_WORDS_OK,
  PAGINAS,
  RESTRICOES,
  TECNOLOGIAS,
  buildPrompt,
  colorsTooSimilar,
  countWords,
  findInjection,
  formatRatio,
  isDefaultLike,
  normalizeColor,
  parseDraft,
  promptSecretFields,
  resolvePromptFile,
  sizeStatus,
  textOn,
  type EvitarId,
  type ExtId,
  type PaginaId,
  type PromptState,
  type RestricaoId,
} from "~/lib/prompt-site/build";
import { clearPromptDraft, loadPromptDraft, savePromptDraft } from "~/lib/prefs";
import { findSecrets } from "~/lib/segredos";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("prompt-para-site")!;

const FAQ = [
  {
    q: "O que é um prompt para criar site?",
    a: "É o pedido que você escreve para a IA antes de ela criar o site: o que o negócio faz, para quem, quais páginas, o visual, a tecnologia e o que ela não deve fazer. Quanto mais completo o pedido, menos a IA inventa e menos rodadas de correção você precisa.",
  },
  {
    q: "Funciona com qualquer IA?",
    a: "Funciona com qualquer assistente que receba texto: um chat no navegador, um assistente dentro do editor de código ou um gerador de sites. O pedido é texto simples em português, sem comandos de uma ferramenta específica.",
  },
  {
    q: "O CriaSite guarda o que eu escrevo aqui?",
    a: "Não. A ferramenta roda no seu navegador e nada é enviado para o nosso servidor. O rascunho fica só no armazenamento local deste navegador, para você continuar depois, e é apagado no botão “Limpar tudo”.",
  },
  {
    q: "A IA vai seguir o pedido à risca?",
    a: "Nem sempre. O pedido reduz o que ela inventa, mas não garante nada: confira se ela listou os arquivos antes de começar, leia o que mudou e corrija com pedidos curtos, dizendo o que está errado e onde.",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...seo({ title: "Gerador de prompt para criar site com IA, em português", description: tool.description, path: "/ferramentas/prompt-para-site" }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    },
  ];
}

// ───────────── Peças locais ─────────────

function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
  onBadContrast,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  onBadContrast: (hex: string) => void;
}) {
  const hex = normalizeColor(value);
  const invalid = value.trim() !== "" && !hex;
  const t = hex ? textOn(hex) : null;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Box label={label} id={id}>
        <div className="flex gap-2">
          <label
            className="relative h-[52px] w-[52px] shrink-0 cursor-pointer overflow-hidden rounded-xl border border-night-line-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-glow"
            style={hex ? { background: hex } : undefined}
          >
            {!hex && (
              <span className="absolute inset-0 grid place-items-center bg-night-2 text-moon-muted">
                <Icon name="plus" size={18} />
              </span>
            )}
            <input
              type="color"
              aria-label={`Escolher a ${label.toLowerCase()} no seletor`}
              value={hex ? hex.toLowerCase() : "#000000"}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <input
            id={id}
            value={value}
            maxLength={LIMITS.cor}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (hex && hex !== value) onChange(hex);
              if (hex && !textOn(hex).whitePasses) onBadContrast(hex);
            }}
            placeholder="#0C1A4B"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
            aria-invalid={invalid ? true : undefined}
            aria-describedby={invalid ? `${id}-erro` : `${id}-dica`}
            className={cx(inputCls, "num min-w-0 flex-1 uppercase", invalid && "border-down-night focus:border-down-night")}
          />
        </div>
      </Box>
      {!hex && !invalid && (
        <p id={`${id}-dica`} className="text-xs text-moon-muted">
          {hint}
        </p>
      )}
      {invalid && (
        <p id={`${id}-erro`} className="text-sm text-down-night">
          Use o formato #RRGGBB, por exemplo #0C1A4B. Enquanto isso, a cor fica fora do pedido.
        </p>
      )}
      {hex && t && (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-night-2 p-3">
            <span
              aria-hidden
              className="grid h-11 w-16 shrink-0 place-items-center rounded-lg text-base font-extrabold"
              style={{ background: hex, color: t.best === "branco" ? "#FFFFFF" : "#000000" }}
            >
              Aa
            </span>
            <dl className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
              {(
                [
                  ["Texto branco", t.white, t.white >= 4.5],
                  ["Texto escuro", t.dark, t.dark >= 4.5],
                ] as const
              ).map(([name, ratio, pass]) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <dt className="text-moon-muted">{name}</dt>
                  <dd className="flex items-center gap-2">
                    <span className="num">{formatRatio(ratio)}</span>
                    <span className={cx("inline-flex items-center gap-1 font-bold", pass ? "text-up-night" : "text-down-night")}>
                      <Icon name={pass ? "check" : "x"} size={14} />
                      {pass ? "passa" : "não passa"}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {!t.whitePasses && (
            <p className="flex items-start gap-1.5 text-sm text-[#ffc857]">
              <span className="mt-0.5 shrink-0">
                <Icon name="alert" size={16} />
              </span>
              Texto branco não passa no AA sobre esta cor. O pedido orienta a IA a usar texto escuro.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Miniatura do clima, desenhada com as cores da própria pessoa (ou cores neutras enquanto ela não escolhe). */
function ClimaThumb({ id, a, b }: { id: string; a: string; b: string }) {
  return (
    <span aria-hidden className="relative block h-12 w-full overflow-hidden rounded-lg bg-night-3">
      {id === "direto" && (
        <>
          <span className="absolute top-2.5 left-2 h-2 w-3/5 rounded-sm" style={{ background: a }} />
          <span className="absolute bottom-2.5 left-2 h-4 w-12 rounded-[4px]" style={{ background: b }} />
        </>
      )}
      {id === "acolhedor" && (
        <>
          <span className="absolute top-2 left-2 h-8 w-8 rounded-full" style={{ background: b }} />
          <span className="absolute top-3 left-12 h-2 w-1/2 rounded-full" style={{ background: a }} />
          <span className="absolute top-7 left-12 h-2 w-1/3 rounded-full" style={{ background: a }} />
        </>
      )}
      {id === "elegante" && (
        <>
          <span className="absolute top-1/2 right-3 left-3 h-px" style={{ background: a }} />
          <span className="absolute top-1 right-3 font-serif text-[18px]" style={{ color: a }}>
            Aa
          </span>
        </>
      )}
      {id === "alegre" && (
        <>
          <span className="absolute top-2.5 left-2 h-7 w-7 rounded-full" style={{ background: a }} />
          <span className="absolute top-2.5 left-6 h-7 w-7 rounded-full" style={{ background: b }} />
          <span className="absolute top-2.5 left-10 h-7 w-7 rounded-full opacity-70" style={{ background: a }} />
        </>
      )}
    </span>
  );
}

const HEX = /(#[0-9A-F]{6})/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(HEX).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i}>
            <span aria-hidden className="mr-1 inline-block h-2.5 w-2.5 rounded-[3px] border border-white/30 align-baseline" style={{ background: part }} />
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** "Rótulo: resto" quando os dois pontos aparecem logo no começo; o rótulo sai em negrito. */
function Labeled({ text, weight }: { text: string; weight: string }) {
  const i = text.indexOf(": ");
  if (i < 0 || i > 40) return <Inline text={text} />;
  return (
    <>
      <span className={weight}>{text.slice(0, i + 1)}</span> <Inline text={text.slice(i + 2)} />
    </>
  );
}

function PromptPreview({ text }: { text: string }) {
  const rows = text.replace(/\n$/, "").split("\n");
  let inTexts = false;
  return (
    <div
      role="region"
      tabIndex={0}
      aria-label="Prévia do pedido"
      className="overflow-auto px-5 py-4 text-[15px] leading-relaxed break-words whitespace-pre-wrap lg:max-h-[calc(100vh-26rem)] lg:min-h-[18rem]"
    >
      {rows.map((line, i) => {
        let node: ReactNode;
        if (line === MARK_START || line === MARK_END) {
          inTexts = line === MARK_START;
          node = <span className="block font-mono text-[12px] tracking-wide text-[#ffc9a3]">{line}</span>;
        } else if (inTexts) node = <span className="block border-l-2 border-glow/40 pl-3 text-moon">{line === "" ? " " : line}</span>;
        else if (line === "") node = <span className="block h-3" />;
        else if (i === rows.length - 1) node = <span className="block font-bold text-glow">{line}</span>;
        else if (line.endsWith(":") && !line.startsWith("- ")) node = <span className="block font-bold text-glow">{line}</span>;
        else if (line.startsWith("- "))
          node = (
            <span className="block -indent-4 pl-4">
              <span className="text-moon-muted">- </span>
              <Labeled text={line.slice(2)} weight="font-semibold" />
            </span>
          );
        else
          node = (
            <span className="block">
              <Labeled text={line} weight="font-bold" />
            </span>
          );
        return <div key={i}>{node}</div>;
      })}
    </div>
  );
}

const Subtitle = ({ id, children, srOnly }: { id: string; children: ReactNode; srOnly?: boolean }) => (
  <h3 id={id} className={srOnly ? "sr-only" : "text-[13px] font-bold tracking-[0.08em] text-moon-muted uppercase"}>
    {children}
  </h3>
);

// ───────────── Página ─────────────

export default function ToolPromptSite() {
  const [s, setS] = useState<PromptState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"none" | "saved" | "nostorage">("none");
  const [confirmedSig, setConfirmedSig] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [live, setLive] = useState("");

  const set = <K extends keyof PromptState>(k: K, v: PromptState[K]) => setS((p) => ({ ...p, [k]: v }));

  const text = useMemo(() => buildPrompt(s), [s]);
  const words = countWords(text);
  const size = sizeStatus(words);
  const hits = useMemo(() => findSecrets(promptSecretFields(s)), [s]);
  const hitSig = hits.map((h) => h.fieldId + h.kind + h.masked).join("|");
  const confirmed = hits.length > 0 && confirmedSig === hitSig;
  const blocked = hits.length > 0 && !confirmed;
  const fileName = resolvePromptFile(s.arquivoNome, s.arquivoExt);
  const injection = useMemo(() => findInjection(s.textos), [s.textos]);
  const hitOf = (id: string) => hits.find((h) => h.fieldId === id);
  const empty = text === "";
  const c1 = normalizeColor(s.cor1);
  const c2 = normalizeColor(s.cor2);
  const similar = !!c1 && !!c2 && colorsTooSimilar(c1, c2);
  const thumbA = c1 ?? "#b9c3ea";
  const thumbB = c2 ?? "#ff9a4d";

  // Rascunho: lê uma vez no navegador (o servidor sempre renderiza o estado inicial) e só grava depois de ler.
  useEffect(() => {
    const d = parseDraft(loadPromptDraft());
    if (d) setS(d);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || blocked) return;
    const t = setTimeout(() => {
      if (isDefaultLike(s)) {
        clearPromptDraft();
        setSaveStatus("none");
      } else setSaveStatus(savePromptDraft(JSON.stringify(s)) ? "saved" : "nostorage");
    }, 500);
    return () => clearTimeout(t);
  }, [s, loaded, blocked]);

  // Avisos curtos para o leitor de tela (a prévia em si não é aria-live).
  const prevSize = useRef(size);
  useEffect(() => {
    if (prevSize.current === size) return;
    prevSize.current = size;
    if (size === "longo") setLive(`Pedido longo: mais de ${MAX_WORDS_OK} palavras.`);
    else if (size === "ok") setLive("Tamanho do pedido bom.");
  }, [size]);

  const prevSig = useRef("");
  useEffect(() => {
    if (hitSig && hitSig !== prevSig.current) setLive(`Possível segredo encontrado no campo ${hits[0].label}.`);
    prevSig.current = hitSig;
  }, [hitSig, hits]);

  const prevInjection = useRef(false);
  useEffect(() => {
    if (injection && !prevInjection.current) setLive("O texto colado tem frases que parecem ordens para a IA.");
    prevInjection.current = injection;
  }, [injection]);

  const status = blocked ? "paused" : saveStatus;

  async function onCopy() {
    const ok = await copyText(text);
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
    clearPromptDraft();
    setSaveStatus("none");
    setLive("Campos limpos e rascunho apagado.");
    document.getElementById("ps-negocio")?.focus();
  }

  const toggle = <T extends string>(key: "paginas" | "evitar" | "restricoes", id: T) =>
    setS((p) => {
      const list = p[key] as string[];
      return { ...p, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } as PromptState;
    });

  const fp = (id: string) => ({ "aria-invalid": hitOf(id) ? (true as const) : undefined, "aria-describedby": hitOf(id) ? `${id}-segredo` : undefined });
  const amber = (id: string) => hitOf(id) && AMBER;
  const secretAdvice = "Apague: senha e chave não fazem parte do pedido.";
  const exts: { v: ExtId; label: string }[] = [
    { v: "txt", label: ".txt" },
    { v: "md", label: ".md" },
  ];

  return (
    <ToolLayout
      tool={tool}
      lead="Responda sobre o negócio, as páginas e o visual e receba o pedido pronto para colar na IA, no formato que evita site genérico e texto inventado. Tudo fica no seu navegador."
      explain={
        <>
          <h2>Como usar o gerador</h2>
          <p>
            Preencha os campos de cima para baixo e acompanhe o pedido sendo escrito ao lado. Nenhum campo é obrigatório: o que ficar vazio simplesmente não entra no texto. Para ver um
            pedido completo, use “Preencher com exemplo”, que monta o de uma assistência técnica de celulares fictícia, e troque pelos dados do seu negócio.
          </p>
          <ul>
            <li>
              <strong>O negócio</strong>: o tipo de negócio, onde ele atende e quem visita o site. Uma frase sobre o público, dizendo o que a pessoa procura, vale mais do que uma lista
              de adjetivos.
            </li>
            <li>
              <strong>O que o visitante deve fazer</strong>: escolha uma ação só. É ela que decide o botão principal e o que aparece primeiro na página inicial. Se for pelo WhatsApp, o{" "}
              <Link to="/ferramentas/link-whatsapp">gerador de link do WhatsApp</Link> monta o link com a mensagem pronta.
            </li>
            <li>
              <strong>Páginas</strong>: marque as que o site precisa ou escolha “Uma página só” para um site de rolagem. Para decidir o que vai em cada uma, veja{" "}
              <Link to="/guias/como-escrever-as-paginas-do-site">como escrever as páginas do site</Link>.
            </li>
            <li>
              <strong>Visual</strong>: duas cores, a fonte, o clima e o que você não quer ver no site.
            </li>
            <li>
              <strong>Tecnologia e hospedagem</strong>: se ainda não decidiu entre HTML, WordPress ou um construtor, escolha “A IA sugere”.
            </li>
            <li>
              <strong>Seus textos e restrições</strong>: cole o que já escreveu sobre o negócio. As restrições recomendadas já vêm marcadas.
            </li>
          </ul>
          <h2>As cores e o contraste</h2>
          <p>
            Digite o código da cor em hexadecimal, como #0C1A4B, ou escolha no seletor. Para cada cor, a ferramenta calcula o contraste do texto branco e do texto escuro sobre ela, com a
            mesma conta do <Link to="/ferramentas/contraste-cores">verificador de contraste</Link>, e mostra qual passa no nível AA, de 4,5:1. O pedido já diz à IA qual cor de texto usar
            sobre cada uma. Laranja, amarelo e verde-claro quase nunca aceitam texto branco; nesses casos a ferramenta avisa, e o pedido manda usar texto escuro nos botões dessa cor.
          </p>
          <h2>Seus textos não viram ordens</h2>
          <p>
            O que você cola em “Textos que você já tem” entra no pedido entre duas marcas, <code>{MARK_START}</code> e <code>{MARK_END}</code>, com o aviso de que aquilo é conteúdo do site,
            e não instrução. Isso importa quando o texto vem de outro lugar, como um site antigo ou um documento: às vezes ele traz caracteres invisíveis ou frases que dão ordens à IA, a
            chamada injeção de prompt. A ferramenta apaga os caracteres invisíveis, não deixa o texto fechar a marca antes da hora e avisa quando encontra frases como “ignore as
            instruções”. O sentido do que você escreveu não muda.
          </p>
          <h2>Nada de senha nem dado de cliente</h2>
          <p>
            O pedido vai para o chat da IA, e o que você cola ali pode ficar guardado no serviço. Por isso, enquanto você digita, a ferramenta procura coisas com cara de segredo, como
            chaves de API, tokens e senhas, e bloqueia copiar e baixar até você apagar o trecho ou confirmar que não é um segredo de verdade. Dados de clientes, como nome, telefone e CPF,
            também ficam de fora: use exemplos fictícios. Mais cuidados no guia de <Link to="/guias/seguranca-ao-criar-site-com-ia">segurança ao criar site com IA</Link>.
          </p>
          <h2>Depois de copiar</h2>
          <p>
            Cole o pedido numa conversa nova, leia a lista de arquivos ou de páginas que a IA propuser e só então responda com o seu ok. Peça uma página por vez e confira cada uma antes
            de seguir; para revisar, use o checklist de <Link to="/guias/como-revisar-codigo-gerado-por-ia">como revisar código gerado por IA</Link>. Se o seu assistente edita os
            arquivos do projeto, monte também o <Link to="/ferramentas/arquivo-de-instrucoes-ia">arquivo de instruções</Link>: ele guarda as regras que valem para todos os pedidos. Por que
            cada parte do pedido importa está no guia <Link to="/guias/prompt-para-criar-site-com-ia">prompt para criar site com IA</Link>, e este passo faz parte do{" "}
            <Link to="/criar-site-com-ia#pedir">roteiro de criar site com IA</Link>.
          </p>
          <h2>Pedido longo demais?</h2>
          <p>
            O medidor ao lado do pedido conta as palavras. Até umas 600 está bom; passando disso, ele avisa, porque a IA tende a perder os detalhes do começo de um pedido muito longo. Se
            passou, deixe os textos de cada página para o pedido daquela página e mande aqui só o essencial do negócio.
          </p>
          <h2>O rascunho fica no seu navegador</h2>
          <p>
            Nada do que você digita é enviado para o CriaSite nem para outro servidor. Para você continuar depois, o rascunho fica salvo no armazenamento local deste navegador e volta quando
            você abrir a página de novo. Em computador compartilhado, use “Limpar tudo” ao terminar. Enquanto houver um possível segredo nos campos, o rascunho não é salvo.
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
                Não cole senhas, chaves de API nem dados de clientes: o pedido vai para o chat da IA. Se aparecer algo com cara de segredo, avisamos antes de copiar. Veja o{" "}
                <Link to="/guias/seguranca-ao-criar-site-com-ia" className="text-glow underline underline-offset-4">
                  guia de segurança
                </Link>
                .
              </p>
            </div>

            <Section n={1} title="O negócio" help="Diga o que é, onde atende e quem visita. Uma frase em cada campo basta.">
              <Box label="Tipo de negócio" id="ps-negocio">
                <input
                  id="ps-negocio"
                  value={s.negocio}
                  maxLength={LIMITS.negocio}
                  onChange={(e) => set("negocio", e.target.value)}
                  placeholder="Ex.: assistência técnica de celulares"
                  autoComplete="off"
                  {...fp("ps-negocio")}
                  className={cx(inputCls, amber("ps-negocio"))}
                />
                <HitMsg hit={hitOf("ps-negocio")} id="ps-negocio" advice={secretAdvice} />
              </Box>
              <div className="grid gap-4 sm:grid-cols-2">
                <Box label="Nome do negócio (opcional)" id="ps-nome">
                  <input
                    id="ps-nome"
                    value={s.nome}
                    maxLength={LIMITS.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    placeholder="Se ficar vazio, a IA marca o lugar"
                    autoComplete="off"
                    {...fp("ps-nome")}
                    className={cx(inputCls, amber("ps-nome"))}
                  />
                  <HitMsg hit={hitOf("ps-nome")} id="ps-nome" advice={secretAdvice} />
                </Box>
                <Box label="Cidade ou região" id="ps-cidade">
                  <input
                    id="ps-cidade"
                    value={s.cidade}
                    maxLength={LIMITS.cidade}
                    onChange={(e) => set("cidade", e.target.value)}
                    placeholder="Ex.: Vila Mariana, em São Paulo (SP)"
                    autoComplete="off"
                    {...fp("ps-cidade")}
                    className={cx(inputCls, amber("ps-cidade"))}
                  />
                  <HitMsg hit={hitOf("ps-cidade")} id="ps-cidade" advice={secretAdvice} />
                </Box>
              </div>
              <Box
                label="Quem visita o site e o que procura"
                id="ps-publico"
                aside={
                  <span id="ps-publico-conta" className="num text-xs text-moon-muted">
                    {Array.from(s.publico).length}/{LIMITS.publico}
                  </span>
                }
              >
                <textarea
                  id="ps-publico"
                  rows={2}
                  value={s.publico}
                  maxLength={LIMITS.publico}
                  onChange={(e) => set("publico", e.target.value)}
                  placeholder="Ex.: moradores do bairro que querem saber preço e prazo pelo celular"
                  aria-invalid={hitOf("ps-publico") ? true : undefined}
                  aria-describedby={hitOf("ps-publico") ? "ps-publico-segredo ps-publico-conta" : "ps-publico-conta"}
                  className={cx(inputCls, "h-auto resize-y py-3 leading-relaxed", amber("ps-publico"))}
                />
                <HitMsg hit={hitOf("ps-publico")} id="ps-publico" advice={secretAdvice} />
              </Box>
            </Section>

            <Section n={2} title="O que o visitante deve fazer" help="Escolha uma ação principal. Ela decide o botão mais visível do site.">
              <Subtitle id="ps-acao-titulo" srOnly>
                Ação principal
              </Subtitle>
              <RadioGroup
                labelledBy="ps-acao-titulo"
                variant="pill"
                allowClear
                value={s.acao}
                onChange={(v) => set("acao", v)}
                options={ACOES.map((a) => ({ v: a.id, label: a.label }))}
              />
              {s.acao === "outra" && (
                <Box label="Qual ação?" id="ps-acao-outra">
                  <input
                    id="ps-acao-outra"
                    value={s.acaoOutra}
                    maxLength={LIMITS.acaoOutra}
                    onChange={(e) => set("acaoOutra", e.target.value)}
                    placeholder="Ex.: assinar a lista de novidades"
                    autoComplete="off"
                    {...fp("ps-acao-outra")}
                    className={cx(inputCls, amber("ps-acao-outra"))}
                  />
                  <HitMsg hit={hitOf("ps-acao-outra")} id="ps-acao-outra" advice={secretAdvice} />
                  <p className="text-xs text-moon-muted">Complete a frase: levar o visitante a…</p>
                </Box>
              )}
            </Section>

            <Section n={3} title="Páginas" help="Marque o que o site precisa. Menos páginas bem escritas rendem mais do que muitas vazias.">
              <Subtitle id="ps-formato-titulo">Formato</Subtitle>
              <RadioGroup
                labelledBy="ps-formato-titulo"
                variant="pill"
                value={s.formato}
                onChange={(v) => v && set("formato", v)}
                options={FORMATOS.map((f) => ({ v: f.id, label: f.label }))}
              />
              <Subtitle id="ps-paginas-titulo">Páginas</Subtitle>
              <ul aria-labelledby="ps-paginas-titulo" className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {PAGINAS.map((p) => (
                  <li key={p.id}>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-night-2">
                      <input type="checkbox" checked={s.paginas.includes(p.id)} onChange={() => toggle<PaginaId>("paginas", p.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
                      <span className="text-[15px] leading-snug">{p.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <Box label="Outras páginas ou seções (separe por vírgula)" id="ps-paginas-livres">
                <input
                  id="ps-paginas-livres"
                  value={s.paginasLivres}
                  maxLength={LIMITS.paginasLivres}
                  onChange={(e) => set("paginasLivres", e.target.value)}
                  placeholder="Ex.: cardápio, área de entrega"
                  autoComplete="off"
                  {...fp("ps-paginas-livres")}
                  className={cx(inputCls, amber("ps-paginas-livres"))}
                />
                <HitMsg hit={hitOf("ps-paginas-livres")} id="ps-paginas-livres" advice={secretAdvice} />
              </Box>
            </Section>

            <Section n={4} title="Visual" help="Duas cores, a fonte e o clima. O contraste é conferido na hora.">
              <Subtitle id="ps-cores-titulo">Cores</Subtitle>
              <div role="group" aria-labelledby="ps-cores-titulo" className="grid gap-4 sm:grid-cols-2">
                <ColorField
                  id="ps-cor1"
                  label="Cor principal"
                  hint="Ex.: a cor do logo"
                  value={s.cor1}
                  onChange={(v) => set("cor1", v)}
                  onBadContrast={(hex) => setLive(`Texto branco não passa no AA sobre ${hex}.`)}
                />
                <ColorField
                  id="ps-cor2"
                  label="Cor de destaque"
                  hint="Ex.: a cor dos botões"
                  value={s.cor2}
                  onChange={(v) => set("cor2", v)}
                  onBadContrast={(hex) => setLive(`Texto branco não passa no AA sobre ${hex}.`)}
                />
              </div>
              {similar && (
                <p className="flex items-start gap-1.5 text-xs text-moon-muted">
                  <span className="mt-0.5 shrink-0">
                    <Icon name="info" size={14} />
                  </span>
                  As duas cores são parecidas: a de destaque pode não chamar atenção nos botões.
                </p>
              )}
              <p className="text-xs text-moon-muted">
                Quer testar outras combinações? Use o{" "}
                <Link to="/ferramentas/contraste-cores" className="text-glow underline underline-offset-4">
                  verificador de contraste
                </Link>
                .
              </p>
              <Subtitle id="ps-fonte-titulo">Fonte</Subtitle>
              <RadioGroup labelledBy="ps-fonte-titulo" variant="pill" allowClear value={s.fonte} onChange={(v) => set("fonte", v)} options={FONTES.map((f) => ({ v: f.id, label: f.label }))} />
              <Subtitle id="ps-clima-titulo">Clima</Subtitle>
              <RadioGroup
                labelledBy="ps-clima-titulo"
                variant="card"
                allowClear
                className="grid grid-cols-2 gap-3"
                value={s.clima}
                onChange={(v) => set("clima", v)}
                options={CLIMAS.map((c) => ({ v: c.id, label: c.label, desc: c.desc, visual: <ClimaThumb id={c.id} a={thumbA} b={thumbB} /> }))}
              />
              <Subtitle id="ps-evitar-titulo">Evitar</Subtitle>
              <div role="group" aria-labelledby="ps-evitar-titulo" className="flex flex-wrap gap-2">
                {EVITAR.map((e) => {
                  const on = s.evitar.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle<EvitarId>("evitar", e.id)}
                      className={cx(
                        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors",
                        on ? "border-brand bg-brand text-white" : "border-night-line-2 bg-night-2 text-moon hover:bg-night-3",
                      )}
                    >
                      {on && <Icon name="check" size={14} />}
                      {e.label}
                    </button>
                  );
                })}
              </div>
              <Box label="Mais alguma coisa a evitar?" id="ps-evitar-livre">
                <input
                  id="ps-evitar-livre"
                  value={s.evitarLivre}
                  maxLength={LIMITS.evitarLivre}
                  onChange={(e) => set("evitarLivre", e.target.value)}
                  placeholder="Ex.: fundo preto"
                  autoComplete="off"
                  {...fp("ps-evitar-livre")}
                  className={cx(inputCls, amber("ps-evitar-livre"))}
                />
                <HitMsg hit={hitOf("ps-evitar-livre")} id="ps-evitar-livre" advice={secretAdvice} />
              </Box>
            </Section>

            <Section n={5} title="Tecnologia e hospedagem" help="Na dúvida, deixe a IA sugerir a opção mais simples.">
              <Subtitle id="ps-tec-titulo">Tecnologia</Subtitle>
              <RadioGroup
                labelledBy="ps-tec-titulo"
                variant="card"
                allowClear
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                value={s.tecnologia}
                onChange={(v) => set("tecnologia", v)}
                options={TECNOLOGIAS.map((t) => ({ v: t.id, label: t.label, desc: t.desc }))}
              />
              <p className="text-xs text-moon-muted">
                Em dúvida? Veja{" "}
                <Link to="/guias/wordpress-ou-construtor-de-sites" className="text-glow underline underline-offset-4">
                  WordPress ou construtor de sites
                </Link>
                .
              </p>
              <Subtitle id="ps-hosp-titulo">Hospedagem</Subtitle>
              <RadioGroup labelledBy="ps-hosp-titulo" variant="pill" allowClear value={s.hospedagem} onChange={(v) => set("hospedagem", v)} options={HOSPEDAGENS.map((h) => ({ v: h.id, label: h.label }))} />
              {s.hospedagem === "outra" && (
                <Box label="Onde vai hospedar?" id="ps-hospedagem-outra">
                  <input
                    id="ps-hospedagem-outra"
                    value={s.hospedagemOutra}
                    maxLength={LIMITS.hospedagemOutra}
                    onChange={(e) => set("hospedagemOutra", e.target.value)}
                    placeholder="Ex.: a hospedagem que já uso"
                    autoComplete="off"
                    {...fp("ps-hospedagem-outra")}
                    className={cx(inputCls, amber("ps-hospedagem-outra"))}
                  />
                  <HitMsg hit={hitOf("ps-hospedagem-outra")} id="ps-hospedagem-outra" advice={secretAdvice} />
                </Box>
              )}
            </Section>

            <Section
              n={6}
              title="Seus textos e restrições"
              help="O que você já escreveu entra como conteúdo. As restrições recomendadas já vêm marcadas."
              action={
                <button type="button" onClick={() => set("restricoes", [...DEFAULT_RESTRICOES])} className="min-h-11 text-sm font-bold text-glow underline-offset-4 hover:underline">
                  Voltar às recomendadas
                </button>
              }
            >
              <Box
                label="Textos que você já tem (opcional)"
                id="ps-textos"
                aside={
                  <span id="ps-textos-conta" className="num text-xs text-moon-muted">
                    {Array.from(s.textos).length}/{LIMITS.textosChars}
                  </span>
                }
              >
                <textarea
                  id="ps-textos"
                  rows={8}
                  value={s.textos}
                  maxLength={LIMITS.textosChars}
                  onChange={(e) => set("textos", e.target.value)}
                  placeholder="Cole aqui o que já escreveu: quem é o negócio, os serviços, o horário, as perguntas que os clientes fazem…"
                  aria-invalid={hitOf("ps-textos") ? true : undefined}
                  aria-describedby={hitOf("ps-textos") ? "ps-textos-segredo ps-textos-conta ps-textos-dica" : "ps-textos-conta ps-textos-dica"}
                  className={cx(inputCls, "h-auto resize-y py-3 leading-relaxed", amber("ps-textos"))}
                />
                <HitMsg hit={hitOf("ps-textos")} id="ps-textos" advice={secretAdvice} />
                <p id="ps-textos-dica" className="text-xs text-moon-muted">
                  Entra no pedido entre marcas, como conteúdo do site. Não cole dados de clientes.
                </p>
                {injection && (
                  <p className="flex items-start gap-1.5 text-sm text-[#ffc857]">
                    <span className="mt-0.5 shrink-0">
                      <Icon name="alert" size={16} />
                    </span>
                    Esse texto tem frases que parecem ordens para a IA (ex.: “ignore as instruções”). Ele vai entre as marcas, como conteúdo do site, mas confira se veio de onde você esperava.
                  </p>
                )}
              </Box>
              <Subtitle id="ps-restricoes-titulo">Restrições</Subtitle>
              <ul aria-labelledby="ps-restricoes-titulo" className="flex flex-col gap-1">
                {RESTRICOES.map((r) => (
                  <li key={r.id}>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-night-2">
                      <input
                        type="checkbox"
                        checked={s.restricoes.includes(r.id)}
                        onChange={() => toggle<RestricaoId>("restricoes", r.id)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
                      />
                      <span className="text-[15px] leading-snug">{r.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <aside id="previa" aria-labelledby="previa-titulo" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
            <h2 id="previa-titulo" className="text-xl font-extrabold">
              Seu pedido
            </h2>

            <SecretCard
              hits={hits}
              confirmed={confirmed}
              onConfirm={(checked) => setConfirmedSig(checked ? hitSig : "")}
              intro="O pedido vai para o chat da IA, e o que você cola ali pode ficar guardado no serviço. Apague o trecho: senha e chave não fazem parte do pedido."
            />

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={onCopy} disabled={empty || blocked} className={btnCls}>
                  {copied ? "Copiado" : "Copiar pedido"}
                </button>
                <button
                  type="button"
                  onClick={() => fileName.ok && download(fileName.name, text, s.arquivoExt === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8")}
                  disabled={empty || blocked || !fileName.ok}
                  className={btnGhostCls}
                >
                  Baixar {fileName.ok ? fileName.name : "arquivo"}
                </button>
              </div>
              {blocked && <p className="text-xs text-moon-muted">Copiar e baixar ficam bloqueados enquanto houver um possível segredo.</p>}
              {copyFailed && <p className="text-sm text-glow">O navegador bloqueou a cópia. Selecione o texto da prévia e copie com Ctrl+C.</p>}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-60">
                <Box label="Nome do arquivo" id="ps-arquivo-nome">
                  <input
                    id="ps-arquivo-nome"
                    value={s.arquivoNome}
                    maxLength={LIMITS.arquivoNome}
                    onChange={(e) => set("arquivoNome", e.target.value)}
                    placeholder="pedido-site"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={fileName.ok ? undefined : true}
                    aria-describedby="ps-arquivo-msg"
                    className={cx(inputCls, "font-mono", !fileName.ok && "border-down-night focus:border-down-night")}
                  />
                </Box>
              </div>
              <span id="ps-ext-titulo" className="sr-only">
                Formato do arquivo
              </span>
              <RadioGroup labelledBy="ps-ext-titulo" variant="pill" value={s.arquivoExt} onChange={(v) => v && set("arquivoExt", v)} options={exts} />
            </div>
            <p id="ps-arquivo-msg" className={cx(fileName.ok ? "text-xs text-moon-muted" : "text-sm text-down-night")}>
              {fileName.ok ? `Vai baixar como ${fileName.name}. O texto é o mesmo nos dois formatos.` : fileName.message}
            </p>

            {!empty && !s.negocio && !s.acao && <p className="text-xs text-moon-muted">Dica: o tipo de negócio e a ação do visitante são o que mais muda o resultado. Comece por eles.</p>}

            <div className="overflow-hidden rounded-2xl border border-night-line-2 bg-[#081236]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-night-line-2 px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-bold">
                  <Icon name="chat" size={14} />
                  Pedido para a IA
                </span>
                {!empty && (
                  <span className="flex items-center gap-2 text-xs text-moon-muted">
                    <span className="num">{words} palavras</span>
                    <span aria-hidden className="relative h-1.5 w-24 rounded-full bg-night-3">
                      <span className={cx("absolute inset-y-0 left-0 rounded-full", size === "longo" ? "bg-[#ffc857]" : "bg-up-night")} style={{ width: `${Math.min(words / 800, 1) * 100}%` }} />
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
                  Mais de {MAX_WORDS_OK} palavras. Pedido longo demais faz a IA perder detalhes: deixe os textos de cada página para o pedido daquela página.
                </p>
              )}
              {empty ? (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <span className="text-moon-muted">
                    <Icon name="chat" size={32} />
                  </span>
                  <p className="font-bold">O pedido aparece aqui.</p>
                  <p className="text-sm text-moon-muted">Comece pelo tipo de negócio ou veja um exemplo pronto.</p>
                  <button type="button" onClick={onExample} className={btnGhostCls}>
                    Preencher com exemplo
                  </button>
                </div>
              ) : (
                <PromptPreview text={text} />
              )}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-night-line-2 bg-night-2 p-4 text-sm leading-relaxed">
              <span className="mt-0.5 shrink-0 text-glow">
                <Icon name="file" size={18} />
              </span>
              <div className="flex flex-col gap-1">
                <p>
                  <strong>Já tem o pedido?</strong> Se o seu assistente edita os arquivos do projeto, monte também o arquivo de instruções: as regras ficam salvas e você não repete tudo a cada
                  pedido.
                </p>
                <Link to="/ferramentas/arquivo-de-instrucoes-ia" className="inline-flex min-h-10 items-center gap-1 font-bold text-glow underline-offset-4 hover:underline">
                  Gerador de arquivo de instruções <Icon name="arrow" size={14} />
                </Link>
              </div>
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
