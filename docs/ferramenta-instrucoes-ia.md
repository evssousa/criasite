# Ferramenta "Gerador de arquivo de instruções" (`/ferramentas/arquivo-de-instrucoes-ia`) — fatia F6

Plano escrito pelo planejador em 2026-11-17. Executor: siga os passos na ordem; cada um diz como conferir.
As decisões de design, de texto e de segurança já estão tomadas aqui. Onde a decisão é do dono, está em "Perguntas em
aberto", com a recomendação que vale até ele responder.

## Objetivo

A pessoa preenche campos curtos (projeto, público, tecnologias, comandos, pastas, regras, documentação) e recebe, ao vivo,
o arquivo Markdown de instruções para o assistente de código, pronto para copiar ou baixar como `AGENTS.md`, `CLAUDE.md`
ou outro nome. Roda 100% no navegador, sem cadastro; o rascunho fica no `localStorage`.

## Contexto

- É a fatia F6 do eixo "criar site com IA" ([ia-desenvolvimento.md](ia-desenvolvimento.md), seção E). Casa com o guia G3
  `arquivo-de-instrucoes-para-assistente-de-codigo` e com a etapa `contexto` do hub `/criar-site-com-ia`, que hoje não tem
  ferramenta (`AI_TRACK[1].tools = []`).
- A F5 (gerador de prompt, `/ferramentas/prompt-para-site`) está prevista para antes (dom 29/11), mas **este plano não
  depende dela**. Onde muda alguma coisa se a F5 já estiver no ar, o passo diz "se a F5 já existir".
- Hoje há 12 ferramentas (11 no navegador + "Está fora do ar?" no servidor). As contagens nas telas são dinâmicas
  (`tools.tsx` conta `TOOLS`); só o `README.md` de portfólio tem número escrito à mão.
- Padrões que já existem e serão reaproveitados: `ToolLayout`/`ToolPanel`/`Field`/`inputCls`/`btnCls`/`btnGhostCls`/
  `copyText`/`ToolDisclaimer` (`app/components/ToolLayout.tsx`); botões-pílula com `aria-pressed`
  (`tool-status.tsx`, `tool-uptime.tsx`); caixa de código `bg-[#081236] text-[#ffc9a3]` (`tool-meta.tsx`); função
  `download()` com Blob (`tool-sitemap.tsx`); FAQ + JSON-LD de um único array (`tool-uptime.tsx`); script de testes com
  `node:assert/strict` e imports relativos `.ts` (`scripts/test-fora-do-ar.ts`).
- Nada de servidor, banco, migration ou serviço pago.

## Arquivos afetados

Novos:
- `app/lib/instrucoes/build.ts` — tipos, regras prontas, exemplo, `buildInstructions`, `countLines`, `sizeStatus`,
  `parseDraft`, `resolveFileName`. Funções puras, **sem React, sem `~/`, sem importar `site.ts`**.
- `app/lib/segredos.ts` — `findSecrets` e `maskSecret` (puro, genérico, para a F5 poder reaproveitar).
- `app/routes/tool-instructions.tsx` — a página.
- `scripts/test-instrucoes.ts` — testes puros (`node scripts/test-instrucoes.ts`).

Alterados:
- `app/lib/site.ts` (`ToolSlug`, `TOOLS`, `AI_TRACK` etapa `contexto`, `DOC_PAGES` de `/privacidade` e `/cookies`)
- `app/routes.ts` (1 rota)
- `app/lib/prefs.ts` (chave `criasite_instrucoes` e 3 funções)
- `app/lib/robot/assemble.ts` (`TOOL_TERMS`)
- `app/routes/privacy.tsx`, `app/routes/cookies.tsx`
- `README.md` (portfólio), `docs/ferramentas.md`, `docs/arquitetura.md`, `docs/README.md`, `docs/decisoes.md`,
  `docs/ia-desenvolvimento.md`

Regra para `app/lib/instrucoes/` e `app/lib/segredos.ts`: imports relativos com extensão `.ts`
(`import { findSecrets } from "../segredos.ts"`), nenhum `~/`, nada de `enum` (o Node não remove), só tipos e funções.
Assim `node scripts/test-instrucoes.ts` roda sem bundler, como o teste do "fora do ar".

---

## Parte A: o Markdown gerado (`app/lib/instrucoes/build.ts`)

### A1. Tipos e limites

```ts
export type RuleId =
  | "perguntar-apagar" | "perguntar-instalar" | "perguntar-banco" | "sem-commit" | "plano-antes"
  | "escopo" | "reaproveitar" | "build-antes" | "listar-arquivos"
  | "pt-br" | "nao-inventar" | "acessibilidade" | "segredos";

export type FileChoice = "AGENTS.md" | "CLAUDE.md" | "outro";

export interface InstrState {
  v: 1;
  nome: string;            // nome do projeto (vira o título do arquivo)
  projeto: string;         // o que é, em 2 frases
  publico: string;         // para quem é
  tecnologias: string[];   // chips, na ordem em que foram adicionados
  cmdInstalar: string;
  cmdRodar: string;
  cmdTestar: string;
  cmdBuild: string;
  pastas: string;          // várias linhas (vira bloco de código)
  regras: RuleId[];        // marcadas (a ordem de saída é a de RULES, não a deste array)
  regrasLivres: string;    // uma regra por linha
  docs: string;            // onde está a documentação
  arquivo: FileChoice;
  arquivoOutro: string;    // usado só quando arquivo === "outro"
}

export const LIMITS = {
  nome: 80, projeto: 400, publico: 300, docs: 300,
  tec: 40, tecMax: 20, cmd: 150,
  pastasChars: 4000, pastasLines: 80,
  regrasChars: 4000, regraItem: 300, regrasMax: 40,
  arquivoOutro: 64,
} as const;

export const MAX_LINES_OK = 120;   // acima disso, o medidor avisa (guia G3: instrução demais compete por atenção)
```

`EMPTY_STATE`: todos os textos `""`, `tecnologias: []`, `regras: []`, `arquivo: "AGENTS.md"`, `arquivoOutro: ""`.
`DEFAULT_STATE`: igual, mas `regras: DEFAULT_RULES` (as 7 com "padrão = sim" na tabela A2). É o estado inicial da página.

### A2. Regras prontas (texto exato; a ordem da tabela é a ordem no arquivo e na tela)

`export const RULES: { id: RuleId; group: RuleGroup; text: string; default: boolean }[]`, com
`type RuleGroup = "antes" | "durante" | "entregar" | "conteudo"` e `RULE_GROUPS` com os rótulos da tela.

| # | id | grupo | padrão | Texto no arquivo |
|---|---|---|---|---|
| 1 | `perguntar-apagar` | antes | sim | Pergunte antes de apagar ou renomear arquivos. |
| 2 | `perguntar-instalar` | antes | sim | Não instale dependências novas sem pedir; explique antes por que precisa. |
| 3 | `perguntar-banco` | antes | não | Pergunte antes de mudar o banco de dados (tabelas, colunas ou migrations). |
| 4 | `sem-commit` | antes | não | Não faça commit nem push sem eu pedir. |
| 5 | `plano-antes` | antes | não | Em tarefas grandes, mostre antes o plano (arquivos e passos) e espere o meu ok para escrever código. |
| 6 | `escopo` | durante | sim | Mude só o que foi pedido; não refatore nem reformate outras partes sem combinar. |
| 7 | `reaproveitar` | durante | não | Reaproveite os componentes e estilos que já existem antes de criar novos. |
| 8 | `build-antes` | entregar | sim | *(texto dinâmico, ver abaixo)* |
| 9 | `listar-arquivos` | entregar | sim | Ao terminar, liste os arquivos que você criou ou alterou. |
| 10 | `pt-br` | conteudo | sim | Escreva os textos do site e as mensagens para mim em português do Brasil. |
| 11 | `nao-inventar` | conteudo | não | Não invente textos, números, depoimentos ou dados de clientes; escreva PREENCHER onde faltar conteúdo. |
| 12 | `acessibilidade` | conteudo | não | Mantenha o site acessível: texto alternativo nas imagens, rótulo nos campos e contraste suficiente. |
| 13 | `segredos` | conteudo | sim | Nunca escreva senha, chave de API ou token no código nem neste arquivo; use variáveis de ambiente. |

Rótulos dos grupos na tela: `antes` "Antes de mexer", `durante` "Durante o trabalho", `entregar` "Antes de entregar",
`conteudo` "Conteúdo e segurança".

**Regra 8 (`build-antes`)**, função `buildRuleText(s)`, usando os comandos já limpos (A4) e `inlineCode` (A4):
- testar e build preenchidos: `Antes de dizer que terminou, rode {testar} e {build} e corrija os erros.`
- só build: `Antes de dizer que terminou, rode {build} e corrija os erros.`
- só testar: `Antes de dizer que terminou, rode {testar} e corrija os erros.`
- nenhum: `Antes de dizer que terminou, rode o build e os testes do projeto e corrija os erros.`

Na tela, o rótulo da regra 8 é fixo: "Antes de dizer que terminou, rode o build e os testes e corrija os erros." com a
dica `text-xs text-moon-muted` "Usa os comandos que você preencher acima."

### A3. Modelo exato do arquivo

Blocos separados por **exatamente uma linha vazia**; nenhuma linha termina com espaço; o texto termina com **um** `\n`.
Um bloco cujo conteúdo ficar vazio **some inteiro**, com o título. Ordem fixa:

```
# {nome limpo}                                   ← vazio: "# Instruções do projeto"

Instruções para o assistente de código deste projeto. Siga estas regras em todas as tarefas.

## Projeto                                       ← some se projeto e público vazios

{projeto}                                        ← some se vazio

Público: {publico}                               ← some se vazio

## Tecnologias                                   ← some se não houver chip

{chip1}, {chip2}, {chip3}.                       ← ponto final só se o último chip não terminar em . ! ?

## Comandos                                      ← some se os 4 estiverem vazios

- Instalar: {inlineCode(cmdInstalar)}            ← cada linha some se o comando estiver vazio
- Rodar: {inlineCode(cmdRodar)}
- Testar: {inlineCode(cmdTestar)}
- Gerar a versão de produção: {inlineCode(cmdBuild)}

## Estrutura de pastas                           ← some se pastas vazio

{fence}text
{linhas das pastas}
{fence}

## Regras                                        ← some se nenhuma marcada e regras livres vazias

- {regras marcadas, na ordem de RULES}
- {regras livres, na ordem digitada}

## Documentação                                  ← some se vazio

{docs}
```

**Estado totalmente vazio** (nenhum campo, nenhuma regra, nenhuma regra livre; `arquivo` não conta) → `buildInstructions`
devolve `""` e a página mostra o estado vazio. Basta qualquer bloco ter conteúdo para sair o título + a frase fixa.

### A4. Limpeza e escapes (funções exportadas para os testes)

1. `stripControls(s)`: remove `[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]` e os caracteres de direção
   `[\u200E\u200F\u202A-\u202E\u2066-\u2069]` (evita texto "invertido" escondido, o truque *trojan source*).
2. `clean(s, max)` (campos de uma linha): `stripControls` → troca `\t`, `\r`, `\n` e qualquer `\s+` por um espaço →
   `trim()` → corta em `max` caracteres (por code point: `Array.from(s).slice(0, max).join("")`) → `trimEnd()` → escapa
   `<` quando vier seguido de letra, `!`, `/` ou `?` (`s.replace(/<(?=[A-Za-z!\/?])/g, "\\<")`, impede tag e comentário
   HTML que escondem texto na visualização).
3. `safeLine(s)` (aplicado ao **conteúdo** de toda linha de texto do usuário que abre bloco: título, parágrafo, item de
   lista), um único escape no começo, na ordem:
   - `^#{1,6}(\s|$)` → prefixa `\` (`# x` → `\# x`)
   - `^>` → prefixa `\`
   - `^([-*_=])\s*(?:\1\s*){2,}$` (linha só de `---`, `***`, `___`, `===`) → prefixa `\`
   - `^[-+*](\s|$)` → prefixa `\`
   - `^(\d{1,9})([.)])(\s|$)` → `$1\$2$3` (`1. x` → `1\. x`)
   - `^(`{3,}|~{3,})` → prefixa `\`
   Texto que não casa nada fica igual (sem escapes desnecessários: o arquivo é lido cru pela IA e precisa ficar legível).
4. Linhas com prefixo fixo ("Público: ", "- Instalar: ") não precisam de `safeLine` no conteúdo depois do prefixo; os
   itens de lista ("- " + texto) precisam (`- # x` viraria título dentro do item).
5. `inlineCode(cmd)`: `n` = maior sequência de crases dentro de `cmd` + 1; `fence = "`".repeat(n)`; se `cmd` começa ou
   termina com crase, põe um espaço de cada lado; devolve `fence + pad + cmd + pad + fence`. Ex.: `npm test` →
   `` `npm test` ``; ``echo `date` `` → ``` `` echo `date` `` ```.
6. Pastas (`cleanBlock`): `stripControls` (mantém `\n`) → `\r\n`/`\r` → `\n` → `\t` → 2 espaços → `trimEnd` em cada
   linha → remove linhas vazias do começo e do fim → várias linhas vazias seguidas viram uma → no máximo
   `LIMITS.pastasLines` linhas (as de depois são descartadas) → texto **sem escape** (vai dentro do bloco de código).
   `fence` = crases em número `max(3, maior sequência de crases em qualquer lugar do texto + 1)`. Assim uma linha
   ` ``` ` digitada não fecha o bloco.
7. Regras livres (`cleanRules`): divide por linha; em cada uma remove marcador de lista já digitado
   (`/^\s*(?:[-+*•]|\d{1,3}[.)])\s+/`), aplica `clean(linha, LIMITS.regraItem)`, descarta vazias, no máximo
   `LIMITS.regrasMax` itens; cada item sai como `- ` + `safeLine(item)`.
8. Tecnologias: cada chip `clean(chip, LIMITS.tec)`, sem vazios, sem repetidos (comparação sem maiúsculas), no máximo
   `LIMITS.tecMax`; a linha `chips.join(", ") + "."` passa por `safeLine`.
9. Regra desconhecida em `s.regras` é ignorada; regras repetidas saem uma vez.

### A5. Demais funções puras

- `buildInstructions(s: InstrState): string` — A3 + A4.
- `countLines(md: string): number` — `md === "" ? 0 : md.replace(/\n$/, "").split("\n").length`.
- `sizeStatus(lines: number): "vazio" | "ok" | "longo"` — `0` → `vazio`; `≤ MAX_LINES_OK` → `ok`; acima → `longo`.
- `isDefaultLike(s)` — `true` se `s` for igual ao `DEFAULT_STATE` ou ao `EMPTY_STATE` (para não gravar rascunho inútil).
- `parseDraft(raw: string | null): InstrState | null` — `JSON.parse` em try; precisa ser objeto com `v === 1` (senão
  `null`); cada campo de texto: se não for string vira `""`, e é cortado no limite (sem `clean`, só o corte, para não
  mudar o que a pessoa digitou); `tecnologias`: só strings, sem repetidas, até `tecMax`, cada uma cortada; `regras`: só
  ids de `RULES`, sem repetidas; `arquivo` fora de `"AGENTS.md" | "CLAUDE.md" | "outro"` vira `"AGENTS.md"`.
- `resolveFileName(choice: FileChoice, outro: string): { ok: true; name: string } | { ok: false; message: string }`:
  - `"AGENTS.md"` e `"CLAUDE.md"` → ok com o próprio nome.
  - `"outro"`: `t = outro.trim()`, na ordem:
    1. vazio → "Digite um nome para o arquivo."
    2. mais de 64 caracteres → "Use até 64 caracteres."
    3. começa com `.` → "O nome não pode começar com ponto."
    4. não casa `/^[A-Za-z0-9][A-Za-z0-9._-]*$/` ou contém `..` → "Use só letras, números, ponto, hífen e sublinhado,
       sem pastas (ex.: INSTRUCOES.md)."
    5. parte antes do 1º ponto casa `/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i` → "Esse nome é reservado pelo Windows.
       Escolha outro."
    6. termina em `.md` (sem diferenciar maiúsculas) → ok com `t`; senão → ok com `t + ".md"`.
- `EXAMPLE_STATE` (A6) e `DEFAULT_RULES` (ids com `default: true`).

### A6. Exemplo ("Preencher com exemplo": confeitaria fictícia do G3)

```ts
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
```

Saída esperada de `buildInstructions(EXAMPLE_STATE)` (**46 linhas**, termina com `\n`; é o "arquivo de ouro" do teste B3):

````
# Site da Confeitaria Doce Bairro

Instruções para o assistente de código deste projeto. Siga estas regras em todas as tarefas.

## Projeto

Site de uma confeitaria de bairro com cardápio, encomendas pelo WhatsApp e página de contato. Não tem loja virtual nem pagamento online.

Público: moradores da região que encomendam bolos e doces para festas, quase sempre pelo celular.

## Tecnologias

HTML, CSS, JavaScript, Vite.

## Comandos

- Instalar: `npm install`
- Rodar: `npm run dev`
- Gerar a versão de produção: `npm run build`

## Estrutura de pastas

```text
index.html        página inicial
src/paginas/      cardápio, encomendas e contato
src/estilos/      CSS do site
public/imagens/   fotos dos bolos (já comprimidas)
```

## Regras

- Pergunte antes de apagar ou renomear arquivos.
- Não instale dependências novas sem pedir; explique antes por que precisa.
- Mude só o que foi pedido; não refatore nem reformate outras partes sem combinar.
- Antes de dizer que terminou, rode `npm run build` e corrija os erros.
- Ao terminar, liste os arquivos que você criou ou alterou.
- Escreva os textos do site e as mensagens para mim em português do Brasil.
- Não invente textos, números, depoimentos ou dados de clientes; escreva PREENCHER onde faltar conteúdo.
- Mantenha o site acessível: texto alternativo nas imagens, rótulo nos campos e contraste suficiente.
- Nunca escreva senha, chave de API ou token no código nem neste arquivo; use variáveis de ambiente.
- Fotos novas: no máximo 200 KB, em WebP.
- O botão de encomenda sempre abre o WhatsApp com a mensagem pronta.

## Documentação

docs/README.md (o que já foi feito e o que falta) e docs/decisoes.md (por que cada escolha foi feita).
````

---

## Parte B: segurança do que a pessoa digita

### B1. Princípios

- Nada sai do navegador: sem `fetch`, sem `sendBeacon`, sem `console.log` do conteúdo dos campos.
- Aviso **sempre visível** no topo do formulário (C4, "Aviso de segredos") com link para o guia
  `/guias/seguranca-ao-criar-site-com-ia`.
- Checagem simples de segredos enquanto a pessoa digita; se achar algo, **bloqueia copiar e baixar** e **pausa o
  rascunho** até a pessoa apagar o trecho ou confirmar que não é segredo.
- Markdown escapado (A4): campo nenhum cria título, lista, bloco de código, linha horizontal ou HTML fora do lugar.
- Nome do arquivo baixado validado (A5, `resolveFileName`).

### B2. `app/lib/segredos.ts`

```ts
export interface SecretField { id: string; label: string; value: string }
export interface SecretHit { fieldId: string; label: string; kind: string; masked: string }
export function findSecrets(fields: SecretField[]): SecretHit[];   // no máximo 1 hit por campo + tipo
export function maskSecret(match: string): string;                // 4 primeiros caracteres + "…"
```

Padrões (o `kind` é o texto mostrado na tela):

| kind | Regex |
|---|---|
| chave de API | `/(?<![A-Za-z0-9])sk-(?:[A-Za-z]+-)?[A-Za-z0-9_-]{20,}/` · `/(?<![A-Za-z0-9])(?:sk\|rk)_(?:live\|test)_[A-Za-z0-9]{16,}/` · `/(?<![A-Za-z0-9])AIza[0-9A-Za-z_-]{30,}/` |
| token do GitHub | `/(?<![A-Za-z0-9])(?:ghp\|gho\|ghu\|ghs\|ghr)_[A-Za-z0-9]{20,}/` · `/(?<![A-Za-z0-9])github_pat_[A-Za-z0-9_]{20,}/` |
| chave de acesso da AWS | `/(?<![A-Z0-9])(?:AKIA\|ASIA)[A-Z0-9]{16}(?![A-Z0-9])/` |
| token do Slack | `/(?<![A-Za-z0-9])xox[abprs]-[A-Za-z0-9-]{10,}/` |
| token JWT | `/(?<![A-Za-z0-9])eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/` |
| chave privada | `/-----BEGIN [A-Z ]*PRIVATE KEY-----/` |
| endereço com usuário e senha | `/[a-z][a-z0-9+.-]*:\/\/[^\s\/:@]+:[^\s\/@]+@/i` |
| senha ou segredo escrito no texto | `/(?<![A-Za-z0-9])(?:password\|passwd\|pwd\|senha\|secret\|segredo\|token\|api[_-]?key\|apikey\|client[_-]?secret\|access[_-]?key)\s*[:=]\s*["']?(?=[^\s"']*[\d!@#$%^&*_-])[^\s"']{6,}/i` · `/(?<![A-Za-z0-9])[A-Z0-9_]*(?:KEY\|TOKEN\|SECRET\|PASSWORD\|PASSWD\|PASS\|SENHA)[A-Z0-9_]*\s*=\s*["']?[^\s"']{6,}/` |
| bloco de variáveis de ambiente (.env) | 2 ou mais linhas no mesmo campo casando `/^\s*(?:export\s+)?[A-Z][A-Z0-9_]{2,}\s*=\s*\S+/m` (contar com a flag `gm`) |

(Na tabela, `\|` é só o escape da tabela Markdown: no código é `|`.)

Notas:
- A exigência de dígito ou símbolo no padrão "senha ou segredo" evita falso alarme em regras como "Senha: pergunte antes".
- O `(?<![A-Za-z0-9])` antes de `sk-` evita "desk-top" e "risk-assessment".
- `maskSecret` nunca mostra o valor inteiro: `Array.from(m).slice(0, 4).join("") + "…"`.
- Campos checados (id = id do campo na tela, rótulo = rótulo da tela): `ins-nome` "Nome do projeto", `ins-projeto` "O que
  é o projeto", `ins-publico` "Público", `ins-tec` "Tecnologias" (chips juntados com espaço), `ins-cmd-instalar`
  "Instalar", `ins-cmd-rodar` "Rodar", `ins-cmd-testar` "Testar", `ins-cmd-build` "Gerar a versão de produção",
  `ins-pastas` "Estrutura de pastas", `ins-regras-livres` "Regras do seu projeto", `ins-docs` "Onde está a documentação".
  O nome do arquivo não é checado. O texto fixo das regras prontas nunca é checado (só o que a pessoa digitou).
- A checagem roda sobre os valores crus do estado (antes de `clean`), com `useMemo` a cada mudança. É barata (texto
  pequeno, limites de A1).

### B3. Comportamento na tela

- Com `hits.length > 0` e sem confirmação:
  - cada campo com hit ganha `aria-invalid="true"`, borda `border-[#ffc857]` e, abaixo, mensagem
    `text-sm text-[#ffc857]` com ícone de triângulo: "Parece {kind}. Apague e guarde em uma variável de ambiente."
    (ligada por `aria-describedby`);
  - o cartão "Isso parece um segredo" aparece na coluna da prévia (C4) e os botões Copiar/Baixar ficam `disabled`, com a
    frase abaixo deles: "Copiar e baixar ficam bloqueados enquanto houver um possível segredo.";
  - o rascunho **não é gravado** (fica valendo o último gravado sem segredo) e o status mostra "Rascunho pausado: há um
    possível segredo nos campos.".
- Confirmação: caixa de marcar no cartão, "Não é um segredo de verdade (por exemplo, um valor de teste). Liberar copiar e
  baixar." Ao marcar: libera os botões e volta a gravar o rascunho; as mensagens dos campos continuam visíveis. A
  confirmação vale para a "assinatura" atual dos hits (`hits.map(h => h.fieldId + h.kind + h.masked).join("|")`): se a
  assinatura mudar (novo segredo), a confirmação é desfeita sozinha.
- Ao zerar os hits, o cartão some e tudo volta ao normal.

---

## Parte C: visual

### C1. Direção visual

Um **editor de texto calmo**: à esquerda, um formulário em seções numeradas que lê como checklist; à direita, uma "aba de
editor" escura com o nome do arquivo, numeração de linhas e o Markdown sendo escrito ao vivo. Mesmo marinho/laranja das
outras ferramentas, painel chapado, sem sombra. Referências internas: a caixa de código de `tool-meta.tsx` e as pílulas
de `tool-status.tsx`. Evitar: assistente em etapas que esconde campos (a prévia ao vivo precisa de tudo à vista),
gradiente, emoji, ícones decorativos, cor como único sinal.

Hierarquia: (1) o título do arquivo e as primeiras linhas na prévia + o botão laranja "Copiar Markdown"; (2) a seção 1
"O projeto" do formulário; (3) o medidor de tamanho; (4) as demais seções; (5) texto explicativo e FAQ abaixo do painel.

### C2. Estrutura (dentro do `ToolLayout`, que já dá caminho, H1, lead, estrela, texto e "Outras ferramentas")

Um `ToolPanel` com, em ordem:

1. **Barra de topo** (`flex flex-wrap items-center justify-between gap-3`):
   - esquerda: status do rascunho (C4);
   - direita: link `lg:hidden` "Ver a prévia" (âncora para `#previa`, `text-sm font-bold text-glow underline-offset-4
     hover:underline min-h-11 inline-flex items-center`), botão `btnGhostCls` "Preencher com exemplo" e botão de texto
     "Limpar tudo" (`min-h-11 px-2 text-sm font-bold text-moon-muted hover:text-moon hover:underline underline-offset-4`).
2. **Grade principal**: `grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start`.
   - Coluna esquerda: **Aviso de segredos** + 5 seções (`fieldset`) separadas por `border-t border-night-line pt-6`
     (a 1ª sem borda).
   - Coluna direita: `aside id="previa" aria-labelledby="previa-titulo"` com `lg:sticky lg:top-6` (o cabeçalho do site
     não é fixo; mesmo valor de `trail.tsx`), contendo: título "Seu arquivo", escolha do nome, cartão de segredo (se
     houver), botões, cartão da prévia.
   - < 1024 px: tudo empilhado na mesma ordem (formulário inteiro, depois o `aside`).
3. **Aviso de privacidade** (`ToolDisclaimer` com texto próprio, E4) no fim do painel, largura total.

Seções do formulário (o `legend` de cada uma: círculo 28 px `rounded-full bg-brand/15 text-glow num text-sm font-bold
grid place-items-center` com o número + título `text-lg font-extrabold`; abaixo do legend, uma linha
`text-sm text-moon-muted` de ajuda):

| # | Título | Ajuda | Campos |
|---|---|---|---|
| 1 | O projeto | Duas frases bastam: o que o site faz e para quem. | `Field` "Nome do projeto" (`input`, `maxLength 80`, placeholder "Ex.: Site da Confeitaria Doce Bairro"); "O que é o projeto" (`textarea rows=3`, `maxLength 400`, contador `num text-xs` "{n}/400" à direita do rótulo, placeholder "Ex.: Site de uma confeitaria com cardápio e encomendas pelo WhatsApp. Não tem loja virtual."); "Público" (`input`, `maxLength 300`, placeholder "Ex.: moradores da região que encomendam pelo celular") |
| 2 | Tecnologias | Só as principais. O assistente descobre o resto lendo o código. | Chips (C4) |
| 3 | Comandos | Exatamente como você digita no terminal. Deixe vazio o que o projeto não tem. | 4 `Field` em `grid gap-4 sm:grid-cols-2`: "Instalar" (placeholder "npm install"), "Rodar" ("npm run dev"), "Testar" ("npm test"), "Gerar a versão de produção" ("npm run build"); `input` com `inputCls + " font-mono text-[15px]"`, `maxLength 150`, `spellCheck={false}`, `autoCapitalize="none"`, `autoComplete="off"`, `autoCorrect="off"` |
| 4 | Pastas e documentação | Poucas linhas, só as pastas que importam, com uma explicação curta ao lado. | "Estrutura de pastas" (`textarea rows=6`, `inputCls + " h-auto resize-y py-3 font-mono text-[14px] leading-relaxed"`, `maxLength 4000`, `spellCheck={false}`, `wrap="off"`, placeholder em 3 linhas "src/          código do site\npublic/       imagens e ícones\ndocs/         anotações do projeto"); "Onde está a documentação" (`input`, `maxLength 300`, placeholder "Ex.: docs/README.md (status e o que falta)") |
| 5 | Regras | As recomendadas já vêm marcadas. Desmarque o que não vale para o seu projeto. | 4 grupos de regras (C4) + botão de texto "Voltar às recomendadas" + `Field` "Regras do seu projeto (uma por linha)" (`textarea rows=4`, `maxLength 4000`, placeholder "Ex.: Fotos novas em WebP, no máximo 200 KB.") |

Não usar `<form>` (Enter num campo não deve enviar nada); `fieldset` funciona fora de `form`.

### C3. Tokens (todos já existem; nenhuma cor nova)

| Uso | Valor |
|---|---|
| Fundo do painel | `bg-night` #0c1a4b |
| Campos, cartões, pílulas inativas | `bg-night-2` #14245e; hover `bg-night-3` #1d2c66 |
| Bordas | `border-night-line-2` #2a3c80; divisórias `border-night-line` #1d2c66 |
| Texto | `text-moon` #ffffff; secundário `text-moon-muted` #b9c3ea |
| Ação principal, chip marcado | `bg-brand` #ff7a1a (hover #ec6a0c), texto branco |
| Links, títulos na prévia | `text-glow` #ff9a4d |
| Fundo da prévia | `bg-[#081236]` (mesmo da caixa de código de `tool-meta.tsx`) |
| Código na prévia | `text-[#ffc9a3]` (mesmo de `tool-meta.tsx`) |
| Tamanho bom | `up-night` #3ee0b0 |
| Alerta (arquivo longo, segredo) | #ffc857 (`text-[#ffc857]`, `bg-[#ffc857]/10`, `border-[#ffc857]`, já usado em `tool-uptime.tsx`) |
| Erro de nome de arquivo | `text-down-night` #ff9b9b, borda `border-down-night` |
| Fontes | Schibsted Grotesk (padrão); comandos, pastas, prévia e números em mono (`font-mono` / `.num`) |
| Raios | painel 20 px (do `ToolPanel`); cartões `rounded-2xl`; campos `rounded-xl` (do `inputCls`); pílulas `rounded-full` |
| Espaços | painel `p-5 sm:p-7` (do `ToolPanel`); seções `gap-4` internas; cartões `p-4`; linhas de regra `py-2.5 px-3` |
| Sombra | nenhuma |

O site só tem tema claro com painel escuro; não há modo escuro separado.

### C4. Componentes

**Status do rascunho** (barra de topo, `text-xs text-moon-muted inline-flex items-center gap-1.5`, ícone 14 px):
- antes de carregar o rascunho ou com estado padrão/vazio: nada (span vazio, para não pular o layout);
- gravado: ícone de disco + "Rascunho salvo neste navegador.";
- gravação falhou (sem `localStorage`): ícone de info + "Sem armazenamento: o rascunho vale só nesta visita.";
- pausado por segredo: ícone de triângulo em `text-[#ffc857]` + "Rascunho pausado: há um possível segredo nos campos.".

**Aviso de segredos** (topo da coluna do formulário, sempre visível): `rounded-xl border border-night-line-2 bg-night-2
p-3.5 text-sm leading-relaxed flex gap-3`, ícone de cadeado 18 px `text-glow` `aria-hidden`. Texto: "Não cole senhas,
chaves de API nem tokens aqui: o arquivo vai para o Git e é lido pela IA. Se aparecer algo com cara de segredo, avisamos
antes de copiar. Veja o [guia de segurança](/guias/seguranca-ao-criar-site-com-ia)." (link `text-glow underline
underline-offset-4`).

**Chips de tecnologias** (seção 2):
- Sugestões, nesta ordem: HTML, CSS, JavaScript, TypeScript, React, Next.js, Vite, Tailwind CSS, Astro, WordPress, PHP,
  Node.js, Python, MySQL. Linha `flex flex-wrap gap-2` com `role="group" aria-label="Sugestões de tecnologias"`.
- Cada sugestão é `button type="button"` com `aria-pressed`: inativa `min-h-10 rounded-full border border-night-line-2
  bg-night-2 px-4 text-sm font-bold text-moon hover:bg-night-3 transition-colors`; ativa `border-brand bg-brand
  text-white` com ícone ✓ 14 px antes do texto (forma, não só cor). Clique liga/desliga (liga = acrescenta no fim).
- Campo "Outra tecnologia" (`label` visível, `id="ins-tec"`, `inputCls`, `maxLength 40`, placeholder "Ex.: Laravel")
  + botão `btnGhostCls` "Adicionar" ao lado (`flex gap-2`; em 390 px o campo `flex-1` e o botão `shrink-0`). Enter ou
  vírgula adiciona; colar "Laravel, Alpine.js" adiciona os dois. Repetido (sem diferenciar maiúsculas) não entra:
  mensagem `text-xs text-moon-muted` "{x} já está na lista." por 2 s. No limite de 20: campo `disabled` e
  "Limite de 20 tecnologias.".
- Escolhidas que **não** são sugestão aparecem abaixo, na mesma ordem do estado: pílula `inline-flex items-center gap-1
  min-h-10 rounded-full bg-brand pl-4 pr-1 text-sm font-bold text-white` com botão interno 32 px `rounded-full
  hover:bg-white/20 grid place-items-center` (ícone × 14 px, `aria-label="Remover {x}"`). Depois de remover, o foco vai
  para o campo "Outra tecnologia".

**Regras** (seção 5): para cada grupo, subtítulo `text-[13px] font-bold uppercase tracking-[0.08em] text-moon-muted`
(rótulos de A2) e lista `flex flex-col gap-1`. Cada regra: `label` `flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5
hover:bg-night-2 cursor-pointer` com `input type="checkbox"` `h-5 w-5 mt-0.5 shrink-0 accent-[var(--color-brand)]` e o
texto da tabela A2 em `text-[15px] leading-snug`. "Voltar às recomendadas": botão de texto `text-sm font-bold text-glow
hover:underline underline-offset-4 min-h-11` alinhado à direita do título da seção.

**Título do `aside`**: `h2 id="previa-titulo"` "Seu arquivo" `text-xl font-extrabold`.

**Escolha do nome** (`role="radiogroup" aria-label="Nome do arquivo"`, 3 pílulas iguais às de `tool-status.tsx`, mas
`role="radio" aria-checked`, setas ←/→ mudam a escolha): "AGENTS.md", "CLAUDE.md", "Outro nome". Com "Outro nome": `Field`
"Nome do arquivo" (`id="ins-nome-outro"`, `inputCls + " font-mono"`, `maxLength 64`, placeholder "INSTRUCOES.md"); erro
de `resolveFileName` em `text-sm text-down-night` abaixo, com `aria-invalid` e borda `border-down-night`; sem erro, dica
`text-xs text-moon-muted` "Vai baixar como {nome final}.". Sempre abaixo das pílulas: `text-xs text-moon-muted` "O
conteúdo é o mesmo; muda só o nome. Confira na documentação da sua ferramenta qual nome ela lê."

**Cartão "Isso parece um segredo"** (só com hits): `rounded-2xl border border-[#ffc857] bg-[#ffc857]/10 p-4 flex flex-col
gap-2`. Linha de título com ícone de triângulo 18 px `text-[#ffc857]` + `h3 text-base font-extrabold` "Isso parece um
segredo". Texto `text-sm`: "O arquivo vai para o Git e para a IA. Apague o trecho e guarde o valor em uma variável de
ambiente." Lista `ul text-sm`: "{label}: {kind} ({masked})" + botão de texto "Ir para o campo" (`text-glow underline
underline-offset-4 min-h-10`) que foca o campo (`document.getElementById(fieldId)?.focus()`). Por último a caixa de marcar
da confirmação (B3).

**Botões**: `flex flex-wrap gap-3`: `btnCls` "Copiar Markdown" (vira "Copiado" por 1,8 s) e `btnGhostCls` "Baixar
{nome final}" (`disabled` também quando o nome é inválido). Ambos `disabled` no estado vazio e com segredo não
confirmado. Falha ao copiar: `text-sm text-glow` "O navegador bloqueou a cópia. Selecione o texto da prévia e copie com
Ctrl+C.". O texto copiado e o baixado são **exatamente** o retorno de `buildInstructions` (já termina com `\n`). Download:
mesma função `download()` de `tool-sitemap.tsx` (copiar para o arquivo novo), tipo `text/markdown;charset=utf-8`.

**Cartão da prévia** (`rounded-2xl border border-night-line-2 bg-[#081236] overflow-hidden`):
- Cabeçalho (`flex flex-wrap items-center justify-between gap-3 border-b border-night-line-2 px-4 py-2.5`): à esquerda,
  a "aba" com ícone de arquivo 14 px + nome final do arquivo em `num text-sm font-bold text-moon`; à direita, o
  **medidor**.
- **Medidor**: `num text-xs text-moon-muted` "{n} linhas" + barra `h-1.5 w-24 rounded-full bg-night-3 relative` com
  preenchimento `min(n/160, 1) * 100%` (`bg-up-night` se `ok`, `bg-[#ffc857]` se `longo`) e um traço fino em 75%
  (= 120 linhas, `absolute top-[-2px] h-[10px] w-px bg-moon-muted/60`) + selo de texto com ícone: `ok` → ✓ "Tamanho bom";
  `longo` → triângulo "Longo". Abaixo do cabeçalho, só no `longo`: faixa `bg-[#ffc857]/10 px-4 py-2.5 text-sm` "Mais de
  120 linhas. Instrução demais compete pela atenção do assistente: corte o que ele descobre lendo o código e passe
  procedimentos longos para [skills](/guias/skills-para-assistentes-de-ia)."
- Corpo: `div role="region" tabIndex={0} aria-label="Prévia de {nome final}"` com `font-mono text-[13px]
  leading-relaxed overflow-auto max-h-none lg:max-h-[calc(100vh-24rem)] lg:min-h-[18rem] py-3`. Cada linha do Markdown
  é uma linha da grade `grid grid-cols-[2.75rem_minmax(0,1fr)]`: número `select-none pr-3 text-right text-moon-muted/50`
  (`aria-hidden`) + texto `whitespace-pre-wrap break-words pr-4`. Cor por linha (sem parser de Markdown):
  linhas que começam com `#` → `text-glow font-bold`; linhas dentro do bloco de código (entre as cercas, cercas
  inclusive) → `text-[#ffc9a3]`; demais → `text-moon`, com trechos entre crases em `text-[#ffc9a3]`. Linha vazia
  renderiza um espaço (`"\u00a0"`) para manter a altura.
- Dica acima do cartão (só quando há conteúdo e projeto + os 4 comandos estão vazios): `text-xs text-moon-muted` "Dica:
  o projeto e os comandos são o que o assistente mais usa. Comece por eles."

**Estados**:
- *Inicial* (visita sem rascunho): `DEFAULT_STATE` → a prévia já mostra título padrão + frase + "## Regras" com as 7
  recomendadas (mostra na hora como o arquivo nasce). Medidor "13 linhas · Tamanho bom".
- *Vazio* (`buildInstructions` devolve `""`, ex.: a pessoa desmarcou tudo): o corpo da prévia mostra, centralizado
  (`py-12 px-6 text-center flex flex-col items-center gap-3`), ícone de arquivo 32 px `text-moon-muted`, "A prévia do
  arquivo aparece aqui." (`font-bold`), "Comece pelo projeto ou veja um exemplo pronto." (`text-sm text-moon-muted`) e
  `btnGhostCls` "Preencher com exemplo". Medidor some; botões `disabled`.
- *Preenchido*: prévia com numeração, medidor `ok`.
- *Longo*: medidor âmbar + faixa de aviso (não bloqueia nada).
- *Segredo*: B3.
- *Nome inválido*: só o "Baixar" fica `disabled`; "Copiar" continua.
- *Foco*: campos com `focus:border-glow` (do `inputCls`); botões, pílulas, caixas e a região da prévia com o anel padrão
  `.night :focus-visible` (já no `app.css`).
- *Carregando rascunho*: não há tela de espera; o rascunho entra no 1º `useEffect` (C5) e troca os valores de uma vez.

**Ícones**: SVG inline 14 a 18 px, traço 2, `aria-hidden`, num componente local `Icon({ name })` em
`tool-instructions.tsx` (mesma solução de `tool-uptime.tsx`; não há biblioteca de ícones): `check`, `x`, `alert`
(triângulo), `lock`, `file`, `disk`, `info`.

**Microdetalhes**: só `transition-colors` em hovers e pílulas; nenhuma animação de entrada; nada pisca ao digitar.

### C5. Estado, rascunho e acessibilidade

- `const [s, setS] = useState<InstrState>(DEFAULT_STATE)`; `md = useMemo(() => buildInstructions(s), [s])`;
  `hits = useMemo(() => findSecrets(fieldsOf(s)), [s])`.
- Rascunho (`criasite_instrucoes`, ver passo 3): no 1º `useEffect` (só no navegador) ler com `loadInstrDraft()` →
  `parseDraft` → se válido, `setS(draft)`; depois `setLoaded(true)`. **Nunca gravar antes de `loaded`** (senão o
  `DEFAULT_STATE` apagaria o rascunho). Gravação com atraso de 500 ms após a última mudança: se houver segredo não
  confirmado → não grava (status "pausado"); se `isDefaultLike(s)` → `clearInstrDraft()`; senão
  `saveInstrDraft(JSON.stringify(s))` (devolve `false` se falhar ou se o JSON passar de 50.000 caracteres → status "sem
  armazenamento"). O servidor sempre renderiza o `DEFAULT_STATE` (sem diferença de hidratação).
- "Preencher com exemplo": se o estado atual não for `isDefaultLike`, `window.confirm("Trocar o que você escreveu pelo
  exemplo?")`; aplica `EXAMPLE_STATE`; anuncia "Exemplo preenchido." na região viva.
- "Limpar tudo": se não for `isDefaultLike`, `window.confirm("Apagar todos os campos e o rascunho salvo neste
  navegador?")`; aplica `DEFAULT_STATE`, chama `clearInstrDraft()`, anuncia "Campos limpos e rascunho apagado." e foca
  `#ins-nome`.
- Região viva: um `p className="sr-only" aria-live="polite"` único na página, que recebe só mensagens curtas e raras:
  troca de `sizeStatus` ("Arquivo longo: mais de 120 linhas." / "Tamanho do arquivo bom."), "Copiado.", "Exemplo
  preenchido.", "Campos limpos…", e "Possível segredo encontrado no campo {label}." (uma vez por assinatura nova).
  **A prévia não é `aria-live`** (ler o arquivo inteiro a cada tecla seria inútil); ela é uma região rolável focável
  com rótulo.
- Rótulos: todo campo com `label` visível (`Field` ou `label htmlFor`); cada `fieldset` com `legend`; contador do
  projeto com `aria-describedby` no `textarea`.
- Não depender só de cor: chip marcado tem ✓; medidor tem texto e ícone; segredo tem ícone e frase; erro de nome tem
  frase.
- Teclado: ordem natural do DOM (formulário → aside); pílulas de nome com setas; Enter no campo de tecnologia adiciona
  (sem enviar nada); Esc não faz nada especial.

### C6. Critério de pronto (visual)

Em 390 px (DevTools, iPhone 12/13/14) e 1280 px:
- 390: barra de topo quebra em 2 linhas sem cortar botões; "Ver a prévia" aparece e leva ao `aside`; formulário inteiro
  em uma coluna; comandos em 1 coluna; prévia abaixo, sem rolagem interna, sem rolagem horizontal da página (linha longa
  quebra; pastas longas quebram dentro da prévia; o `textarea` de pastas rola na horizontal por ter `wrap="off"`, e isso
  é esperado).
- 1280: formulário à esquerda (~600 px) e `aside` à direita (~480 px) colado no topo ao rolar; o corpo da prévia rola
  por dentro e os botões continuam visíveis sem rolar a página.
- Com o exemplo: prévia igual ao arquivo de ouro (A6), 46 linhas, "Tamanho bom".
- Colando 130 linhas em "Estrutura de pastas" (só 80 entram) mais 40 regras livres: medidor âmbar "Longo" e a faixa.
- Escala de cinza (DevTools → Rendering → Emulate vision deficiencies → Achromatopsia): chips marcados, medidor e cartão
  de segredo continuam distinguíveis pelo ícone e pelo texto.
- Teclado: Tab passa por todos os campos, chips, caixas, pílulas de nome, botões e pela região da prévia, com foco
  visível.

---

## Parte D: integração

1. `app/lib/site.ts`:
   - `ToolSlug` ganha `| "arquivo-de-instrucoes-ia"`.
   - Entrada em `TOOLS` **logo depois de `esta-fora-do-ar`** (se a F5 já existir, logo depois de `prompt-para-site`):
     ```
     slug: "arquivo-de-instrucoes-ia",
     title: "Gerador de arquivo de instruções para IA (AGENTS.md)",
     short: "Arquivo de instruções",
     hint: "AGENTS.md e CLAUDE.md prontos",
     description: "Monte o arquivo de instruções do seu projeto para o assistente de código (AGENTS.md, CLAUDE.md): tecnologias, comandos e regras, sem enviar nada.",
     category: "tecnico",
     keywords: "agents.md claude.md agents claude instruções ia assistente de código agente regras do projeto contexto markdown cursor copilot gemini vibe coding prompt",
     ```
   - `AI_TRACK` etapa `contexto`: `tools: ["arquivo-de-instrucoes-ia"]`. (`TRAIL` não muda.)
   - `DOC_PAGES`: `/privacidade` e `/cookies` → `updated` com a data do dia da execução.
2. `app/routes.ts`: `route("ferramentas/arquivo-de-instrucoes-ia", "routes/tool-instructions.tsx"),` logo depois da
   linha de `esta-fora-do-ar` (ou da do `prompt-para-site`, se existir). O slug tem que bater com o `ToolSlug`.
3. `TOOL_TERMS` (`app/lib/robot/assemble.ts`): nova linha **no topo da lista** (o robô põe 1 link de ferramenta por
   matéria, o 1º termo que casar; este é o mais específico):
   `{ re: /(?<![\p{L}\d])(AGENTS\.md|CLAUDE\.md|arquivos? de instruções|arquivo de regras do projeto)(?![\p{L}\d])/iu, url: "/ferramentas/arquivo-de-instrucoes-ia" },`
4. Já leem `TOOLS` sozinhos, só conferir: diretório da home e `/ferramentas` (card e contagem), busca da home, "Outras
   ferramentas", sitemap, `/mapa-do-site`, `getAvailability` e o `TOOL_PAGES` do redator (`writer.server.ts`).
5. Contagens escritas à mão:
   - `README.md` (portfólio), linha 34: "**12 ferramentas: 11 rodando 100% no navegador…**" → "**13 ferramentas: 12
     rodando 100% no navegador…**" (se a F5 já estiver no ar: 14 e 13); na lista da mesma frase, acrescentar
     "gerador de arquivo de instruções para IA (AGENTS.md/CLAUDE.md, com alerta de segredos colados)" antes de "guia de
     status HTTP"; e "Nas 11 do navegador" → "Nas 12 do navegador" (ou 13). Na frase sobre `localStorage` (linha 40),
     acrescentar "e o rascunho do gerador de instruções" depois de "marca as etapas da trilha".
   - `docs/README.md` linha "11 ferramentas com texto explicativo" é histórica (fase 1): **não mexer**; a ferramenta
     ganha linha própria na tabela de status.
   - `docs/arquitetura.md`: a lista de rotas de ferramentas (linha 45) está sem `esta-fora-do-ar`; acrescentar as duas
     (`esta-fora-do-ar` e `arquivo-de-instrucoes-ia`); em "Estado no navegador", nova linha
     "`criasite_instrucoes`: rascunho do gerador de arquivo de instruções (JSON com `v: 1`); nunca vai para o servidor;
     apagado no botão Limpar tudo."; na árvore de pastas, `lib/instrucoes/` (gerador de instruções, puro) e
     `lib/segredos.ts` (detector de segredos colados, puro).
   - `docs/ferramentas.md`: linha na tabela "No ar" (passo 11).
6. Link do guia G3 para a ferramenta (**não editar agora**; depois do deploy, **pelo painel** `/admin/materias`, guia
   `arquivo-de-instrucoes-para-assistente-de-codigo`): no corpo, logo depois da lista da seção `## Modelo para começar`,
   inserir um parágrafo novo (linha vazia antes e depois):
   `Para montar o seu campo a campo, com as regras prontas para marcar e o arquivo pronto para baixar, use o [gerador de arquivo de instruções](/ferramentas/arquivo-de-instrucoes-ia).`
   Com isso o G3 passa de 5 para 6 links internos (dentro da faixa de 3 a 6 do validador). Painel em vez de migration
   porque é um parágrafo só e as migrations rodam uma vez (ver pergunta 6). O hub `/criar-site-com-ia#contexto` mostra a
   ferramenta sozinho pelo `AI_TRACK`.

---

## Parte E: texto explicativo, FAQ, SEO e privacidade

### E1. SEO

- `meta`: `[...seo({ title: "Gerador de AGENTS.md e CLAUDE.md: arquivo de instruções para IA", description:
  tool.description, path: "/ferramentas/arquivo-de-instrucoes-ia" }), { "script:ld+json": FAQPage }]`, com o JSON-LD
  montado do array `FAQ` (E3), igual a `tool-uptime.tsx`.
- H1 = `tool.title` ("Gerador de arquivo de instruções para IA (AGENTS.md)"). O guia G3 mira "arquivo de instruções
  para ia" (o que pôr); a ferramenta mira "gerador AGENTS.md / CLAUDE.md" (fazer). Não repetir o conteúdo do guia.
- `lead`: "Preencha o projeto, as tecnologias, os comandos e as regras e baixe o AGENTS.md ou o CLAUDE.md pronto para a
  pasta do projeto. Tudo fica no seu navegador."

### E2. `explain` (texto exato; links com `Link` do React Router; `strong` onde há negrito)

**h2 Como usar o gerador**

p: Preencha os campos de cima para baixo e acompanhe o arquivo sendo montado na prévia. Nenhum campo é obrigatório: o
que ficar vazio não entra no arquivo, então dá para começar pelo básico e voltar depois. Para ver como fica um arquivo
completo, use “Preencher com exemplo”, que monta as instruções de uma confeitaria fictícia, e troque pelos dados do seu
projeto.

ul:
- **O projeto**: duas frases dizendo o que o site faz e o que fica de fora, e uma sobre quem usa. É isso que ajuda o
  assistente a decidir o tom, as prioridades e o que não inventar.
- **Tecnologias**: marque as sugestões ou digite as suas e aperte Enter. Liste só as principais; o resto o assistente
  descobre lendo o código.
- **Comandos**: copie do seu projeto os comandos de instalar, rodar, testar e gerar a versão de produção, exatamente
  como você digita no terminal. A regra de rodar o build antes de dizer que terminou usa esses comandos.
- **Pastas**: poucas linhas, só as pastas que importam, com uma explicação curta ao lado de cada uma.
- **Regras**: as recomendadas já vêm marcadas. Desmarque o que não vale para você e escreva as regras do seu projeto,
  uma por linha.
- **Documentação**: diga onde ficam as anotações do projeto, como um docs/README.md, para o assistente ler antes de
  mudar algo.

**h2 AGENTS.md, CLAUDE.md ou outro nome?**

p: O conteúdo é o mesmo; muda só o nome do arquivo baixado. O AGENTS.md é uma convenção aberta, lida por várias
ferramentas de código. O CLAUDE.md é o nome que o Claude Code procura. Outras ferramentas usam nomes ou pastas
próprias, então confira na documentação da sua qual arquivo ela lê. Se você usa mais de uma, escolha um arquivo
principal e mantenha os outros iguais a ele: duas versões diferentes das regras confundem mais do que ajudam.

**h2 Onde salvar e como saber se funcionou**

p: Salve o arquivo na pasta principal do projeto, a mesma do package.json ou do index.html, e inclua no Git com o resto
do código: assim as regras valem para qualquer conversa nova e para quem mais trabalhar no projeto. Depois, abra uma
conversa nova e peça ao assistente um resumo das regras do projeto. Se ele citar os seus comandos e as suas regras, o
arquivo foi lido.

**h2 Nada de senha nem chave no arquivo**

p: O arquivo de instruções vai para o Git e para o contexto da IA, então tudo o que estiver nele pode ser lido por
outras pessoas e por outros serviços. Por isso, enquanto você digita, a ferramenta procura coisas com cara de segredo:
chaves de API, tokens, senhas escritas como password= e blocos copiados de um arquivo .env. Se achar algo, ela avisa no
campo e bloqueia copiar e baixar até você apagar o trecho ou confirmar que não é um segredo de verdade. A checagem é
simples e pode deixar passar algum formato: ela ajuda, mas não substitui a sua revisão. Senhas e chaves ficam em
variáveis de ambiente, como explica o guia de [segurança ao criar site com IA](/guias/seguranca-ao-criar-site-com-ia).

**h2 O rascunho fica no seu navegador**

p: Tudo acontece no seu navegador: o que você digita não é enviado para o CriaSite nem para nenhum outro servidor. Para
você não perder o trabalho, o rascunho fica salvo no armazenamento local deste navegador e volta quando você abrir a
página de novo. Em computador compartilhado, use “Limpar tudo” ao terminar. Enquanto houver um possível segredo nos
campos, o rascunho não é salvo.

**h2 Curto é melhor**

p: O medidor ao lado da prévia conta as linhas do arquivo. Até umas 120 linhas está bom; passando disso, ele avisa.
Instrução demais compete pela atenção do assistente, e as regras importantes se perdem no meio. Se o arquivo cresceu,
corte o que o assistente descobre sozinho lendo o código e transforme procedimentos longos, usados só de vez em quando,
em [skills](/guias/skills-para-assistentes-de-ia). O que colocar e o que deixar de fora está no guia
[arquivo de instruções para IA](/guias/arquivo-de-instrucoes-para-assistente-de-codigo); com as regras prontas, o
próximo passo do roteiro é [pedir em partes pequenas](/criar-site-com-ia#pedir).

(Se a F5 já estiver no ar, terminar a última frase com: "…é [pedir em partes pequenas](/criar-site-com-ia#pedir), com a
ajuda do [gerador de prompt](/ferramentas/prompt-para-site).")

**h2 Perguntas frequentes** (h3 + p para cada item da E3)

(~620 palavras sem o FAQ; com o lead, o formulário e o FAQ, a página não é fina.)

### E3. FAQ (4 perguntas; o mesmo array `FAQ` alimenta o texto e o JSON-LD)

1. **O que é um arquivo AGENTS.md?** É um arquivo de texto em Markdown, na pasta principal do projeto, com as regras
   que o assistente de código deve seguir: o que é o projeto, as tecnologias, os comandos e os cuidados. O nome
   AGENTS.md é uma convenção aberta, lida por várias ferramentas; outras usam nomes próprios, como o CLAUDE.md.
2. **Qual a diferença entre AGENTS.md e CLAUDE.md?** Só o nome e a ferramenta que procura cada um. O conteúdo pode ser
   o mesmo: este gerador monta um texto só e muda apenas o nome do arquivo baixado. Confira na documentação da sua
   ferramenta qual nome ela lê.
3. **O CriaSite guarda o que eu escrevo aqui?** Não. A ferramenta roda no seu navegador e nada é enviado para o nosso
   servidor. O rascunho fica só no armazenamento local deste navegador, para você continuar depois, e é apagado no
   botão “Limpar tudo”.
4. **O assistente vai seguir todas as regras?** Não há garantia. O arquivo orienta o assistente, mas não trava nada:
   para o que é crítico, como apagar arquivos ou mexer no banco, use também as permissões da ferramenta e revise o que
   mudou antes de publicar.

### E4. Privacidade e textos legais (textos exatos)

- `ToolDisclaimer` (com `children`): "Roda no seu navegador: nada do que você digita aqui sai do seu computador. O
  rascunho fica salvo só neste navegador; use “Limpar tudo” para apagá-lo. Detalhes na política de privacidade." (com
  "política de privacidade" como `Link` para `/privacidade`).
- `privacy.tsx`, tabela "Quais dados coletamos", linha "Ferramentas favoritas e progresso da trilha" passa a ser:
  - DADO: "Ferramentas favoritas, progresso da trilha e rascunhos das ferramentas"
  - QUANDO: "Quando você fixa uma ferramenta, marca uma etapa da trilha ou preenche o gerador de arquivo de instruções."
  - PARA QUÊ: "Lembrar as suas escolhas e o seu rascunho na próxima visita. Ficam só no armazenamento local do seu
    navegador (localStorage); não chegam até nós. O rascunho do gerador de arquivo de instruções pode ser apagado a
    qualquer momento no botão “Limpar tudo” da ferramenta."
  - Se a F5 já tiver mudado essa linha para o rascunho do gerador de prompt: QUANDO "…ou preenche os geradores de prompt
    e de arquivo de instruções." e a última frase do PARA QUÊ "Os rascunhos dos geradores podem ser apagados a qualquer
    momento no botão de limpar de cada ferramenta."
  - A linha "Arquivos e textos usados nas ferramentas" **não muda** (continua verdadeira: nada vai ao servidor).
- `cookies.tsx`, tipo "Preferências", campo `use`: "Guardam no seu navegador (armazenamento local) a escolha no aviso de
  cookies, as ferramentas favoritas, o progresso da trilha e os rascunhos das ferramentas que salvam o que você
  digitou."
- `DOC_PAGES`: `/privacidade` e `/cookies` com a data do dia.
- `terms.tsx`, `about.tsx`, `faq.tsx`, `tools.tsx`: **não mudam** (a regra "roda no navegador" vale para esta ferramenta).

---

## Passos (ordem de execução)

1. **Detector de segredos.** Criar `app/lib/segredos.ts` (B2). Conferir: `npm run typecheck`.
2. **Gerador puro.** Criar `app/lib/instrucoes/build.ts` (Parte A inteira: tipos, `LIMITS`, `RULES`, `RULE_GROUPS`,
   `DEFAULT_RULES`, `EMPTY_STATE`, `DEFAULT_STATE`, `EXAMPLE_STATE`, `stripControls`, `clean`, `safeLine`, `inlineCode`,
   `buildInstructions`, `countLines`, `sizeStatus`, `isDefaultLike`, `parseDraft`, `resolveFileName`). Importa só
   `../segredos.ts` se precisar (de preferência não).
3. **Testes.** Criar `scripts/test-instrucoes.ts` (cabeçalho igual ao de `test-fora-do-ar.ts`, com `ok(name, fn)` e
   `node:assert/strict`) com todos os casos de "Como verificar". Rodar `node scripts/test-instrucoes.ts` até passar
   (saída final "N testes ok", `process.exitCode = 1` em falha).
4. **Rascunho no navegador.** Em `app/lib/prefs.ts`: `const INSTR_KEY = "criasite_instrucoes";` e três funções que
   **não** disparam o evento `criasite:prefs` (o rascunho não tem assinantes):
   `loadInstrDraft(): string | null` (try `localStorage.getItem`), `saveInstrDraft(json: string): boolean` (false se
   `json.length > 50_000` ou se o `setItem` falhar), `clearInstrDraft(): void` (try `removeItem`). Atualizar o comentário
   do topo ("…as últimas checagens do Está fora do ar? e o rascunho do gerador de instruções. Nada vai para o servidor.").
5. **Integração.** `site.ts` (D1), `routes.ts` (D2), `assemble.ts` (D3). Conferir: `npm run typecheck` (vai acusar a
   rota sem arquivo até o passo 6; tudo bem fazer os dois juntos).
6. **Página.** Criar `app/routes/tool-instructions.tsx` (Parte C + E1 a E3): `meta`, `FAQ`, `Icon`, `download`, e os
   componentes locais `TechChips`, `RuleList`, `FileNamePicker`, `SecretCard`, `Preview` (com o medidor). Seguir C5 para
   estado/rascunho. Nada de `fetch`.
7. **Textos legais e portfólio** (E4 e D5): `privacy.tsx`, `cookies.tsx`, `DOC_PAGES`, `README.md`.
8. **Conferir a tela** (C6 e "Como verificar → Tela") com `npm run dev`, em 390 e 1280 px.
9. **Comandos finais**: `node scripts/test-instrucoes.ts` → `npm run typecheck` → `npm run build`.
10. **Commit + push** (ver "Ordem de commit").
11. **Docs** (no mesmo commit, antes do push): `docs/ferramentas.md` — linha nova em "No ar":
    `| Arquivo de instruções | /ferramentas/arquivo-de-instrucoes-ia | campos (projeto, público, tecnologias em chips, 4 comandos, pastas, 13 regras prontas + livres, documentação) → Markdown ao vivo (função pura em lib/instrucoes/build.ts, escapes contra títulos e blocos injetados); copiar e baixar como AGENTS.md, CLAUDE.md ou nome validado; detector de segredos colados bloqueia copiar/baixar; medidor de linhas (aviso acima de 120); rascunho em criasite_instrucoes |`
    e tirar o item de "Próximas"; `docs/arquitetura.md` (D5); `docs/README.md` (status ✅, próximos passos, pendência do
    link no G3); `docs/ia-desenvolvimento.md` (F6 ✅ na linha 70 e na tabela K); `docs/decisoes.md` ("feito", com
    desvios, se houver).
12. **Depois do deploy**: conferir em produção (lista "Produção" abaixo) e passar ao dono a pendência do link no G3 (D6),
    ou fazê-la se o chat tiver acesso ao painel.

## Como verificar

### Testes puros (`node scripts/test-instrucoes.ts`)

**Importante:** nos testes, monte os segredos falsos **por concatenação** (`"gh" + "p_" + "a".repeat(36)`,
`"sk-" + "proj-" + "x".repeat(24)`), para o texto literal de um token não existir no repositório (a proteção de
segredos do GitHub pode barrar o push, e o repositório é público). Exceção: `AKIAIOSFODNN7EXAMPLE`, que é o exemplo
oficial da documentação da AWS.

Gerador:

| # | Entrada | Esperado |
|---|---|---|
| B1 | `EMPTY_STATE` | `""`; `countLines` 0; `sizeStatus` `vazio` |
| B2 | `DEFAULT_STATE` | começa com `# Instruções do projeto\n\nInstruções para o assistente…`; tem `## Regras` com 7 itens; não tem `## Projeto`, `## Comandos`, `## Tecnologias`; regra 8 = "…rode o build e os testes do projeto e corrija os erros."; 13 linhas |
| B3 | `EXAMPLE_STATE` | **igual, caractere por caractere**, ao arquivo de ouro da A6 (colar o texto no teste); 46 linhas; `sizeStatus` `ok` |
| B4 | só `publico: "lojistas"` | `## Projeto\n\nPúblico: lojistas\n`, sem parágrafo do projeto |
| B5 | `cmdTestar: "npm test"`, `cmdBuild: "npm run build"`, regra 8 marcada | 2 itens na ordem Testar, Gerar; regra 8 "…rode `npm test` e `npm run build` e corrija os erros." |
| B6 | só `cmdTestar: "npm test"`, regra 8 | "…rode `npm test` e corrija os erros." |
| B7 | `cmdRodar: "echo `date`"` | ``- Rodar: `` echo `date` `` `` |
| B8 | `nome: "# Hack\n## Injetado"` | 1ª linha `# \# Hack ## Injetado`; nenhuma linha igual a `## Injetado` |
| B9 | `projeto: "1. primeiro passo"` | parágrafo `1\. primeiro passo` |
| B10 | `regrasLivres: "- Use Tailwind\n* Sem jQuery\n\n3) Teste no celular\n# Título falso"` | itens `- Use Tailwind`, `- Sem jQuery`, `- Teste no celular`, `- \# Título falso` |
| B11 | `regrasLivres: "---"` e `"> citação"` | `- \---` e `- \> citação` |
| B12 | `docs: "<!-- escondido --> e <b>negrito</b>"` | `\<!-- escondido --> e \<b>negrito\</b>` |
| B13 | `pastas: "src/\n```\nfim"` | cerca de 4 crases: `` ````text `` … `` ```` `` |
| B14 | `pastas: "\n\n\tsrc/  \n\n\n\npublic/\n\n"` | bloco com `  src/`, uma linha vazia, `public/` |
| B15 | `pastas` com 100 linhas | bloco com 80 linhas |
| B16 | `tecnologias: ["HTML", "html", "CSS", ""]` | `HTML, CSS.` |
| B17 | `projeto: "abc\u202Edef\u0007 ghi"` | `abcdef ghi` |
| B18 | `regras: ["xyz", "segredos", "perguntar-apagar", "segredos"]` (forçado com `as`) | 2 itens, na ordem de `RULES` (apagar antes de segredos) |
| B19 | todos os casos acima | nenhum `\n\n\n`; nenhuma linha com espaço no fim (`/[ \t]+$/m`); termina com um único `\n` (quando não vazio) |
| B20 | `projeto` com 500 caracteres | parágrafo com 400 caracteres |

Medidor: `sizeStatus(120)` = `ok`; `sizeStatus(121)` = `longo`; estado com 80 linhas de pastas + 40 regras livres +
os 13 regras marcadas → `longo`.

Rascunho (`parseDraft`):

| # | Entrada | Esperado |
|---|---|---|
| P1 | `null`, `"lixo"`, `"[]"`, `"{}"` | `null` |
| P2 | `JSON.stringify(EXAMPLE_STATE)` | igual a `EXAMPLE_STATE` (`deepEqual`) |
| P3 | o mesmo com `v: 2` | `null` |
| P4 | `projeto: 5`, `nome: null` | `""` nos dois |
| P5 | `tecnologias: ["A", 3, "a", "B", …25 itens]` | só strings, sem repetidas, no máximo 20 |
| P6 | `regras: ["escopo", "inventada"]` | `["escopo"]` |
| P7 | `arquivo: "../x"` | `"AGENTS.md"` |

Nome do arquivo (`resolveFileName`):

| Entrada | Esperado |
|---|---|
| `("AGENTS.md", "qualquer")`, `("CLAUDE.md", "")` | ok, o próprio nome |
| `("outro", "INSTRUCOES")` / `"regras.md"` / `"Regras.MD"` / `"notas.txt"` | `INSTRUCOES.md` / `regras.md` / `Regras.MD` / `notas.txt.md` |
| `("outro", "")`, `"   "` | "Digite um nome para o arquivo." |
| `"a".repeat(65)` | "Use até 64 caracteres." |
| `".cursorrules"`, `".env"` | "O nome não pode começar com ponto." |
| `"../segredo"`, `"pasta/arquivo"`, `"C:\\x"`, `"a b"`, `"arq*?.md"`, `"arq..md"`, `"-x"` | mensagem de caracteres |
| `"con"`, `"CON.md"`, `"nul"`, `"lpt1.md"` | "Esse nome é reservado pelo Windows. Escolha outro." |

Segredos (`findSecrets`, cada valor num campo de teste):

| Deve achar (kind) | Não deve achar |
|---|---|
| `sk-proj-` + 24 letras (chave de API) | "Nunca escreva senha no código" |
| `gh` + `p_` + 36 letras (token do GitHub) | "Senha: pergunte antes" |
| `AKIAIOSFODNN7EXAMPLE` (AWS) | `sk-8` |
| `password=hunter2!` (senha ou segredo) | "use process.env.API_KEY" |
| `DB_PASSWORD=s3nh4forte` (senha ou segredo) | `API_KEY=` (sem valor) |
| `API_URL=https://x.com` + `\n` + `NODE_ENV=production` no campo pastas (bloco .env) | "o token fica no .env" |
| `-----BEGIN OPENSSH PRIVATE KEY-----` (chave privada) | `https://exemplo.com.br/contato` |
| `postgres://admin:` + `s3cr3t@db.exemplo.com/app` (endereço com usuário e senha) | "desk-top-application", "risk-assessment-framework-v2-final" |
| `eyJ` + 12 letras + `.` + 12 + `.` + 12 (JWT) | `ghp_curto` |
| `AIza` + 35 letras (chave de API) · `xox` + `b-` + 12 letras (Slack) | "Pergunte antes de mudar o banco" |

E ainda: `maskSecret("sk-proj-abc…")` = `"sk-p…"`; dois segredos do mesmo tipo no mesmo campo → 1 hit.

### Tela (`npm run dev`, `/ferramentas/arquivo-de-instrucoes-ia`)

- 1ª visita (aba anônima): prévia com 13 linhas e as 7 regras; status de rascunho vazio.
- "Preencher com exemplo": prévia = arquivo de ouro; recarregar a página → o exemplo volta (rascunho); status "Rascunho
  salvo neste navegador.".
- Digitar `password=hunter2!` em "Regras do seu projeto": borda âmbar + mensagem no campo, cartão de segredo, Copiar e
  Baixar desabilitados, status "Rascunho pausado"; recarregar → o segredo **não** volta. Marcar "Não é um segredo de
  verdade" → botões liberados; colar outro segredo em outro campo → confirmação desfeita sozinha.
- "Ir para o campo" foca o campo certo.
- "Copiar Markdown" → colar num editor: texto idêntico à prévia. "Baixar AGENTS.md" → arquivo `AGENTS.md`, UTF-8,
  acentos certos, termina com uma linha vazia. "CLAUDE.md" → baixa `CLAUDE.md`. "Outro nome" com `../x` → erro e só o
  Baixar desabilitado; `INSTRUCOES` → "Vai baixar como INSTRUCOES.md.".
- Chips: Enter, vírgula e colar com vírgulas; repetido não entra; × remove e devolve o foco ao campo.
- "Limpar tudo" → confirma, volta ao estado inicial, rascunho apagado (DevTools → Application → Local Storage sem
  `criasite_instrucoes`).
- Medidor: colar 130 linhas em pastas → "Longo" âmbar + faixa; apagar → "Tamanho bom".
- DevTools → Network: nenhuma requisição ao digitar, copiar ou baixar.
- C6 completo (390, 1280, escala de cinza, teclado). Leitor de tela (NVDA): ao passar de 120 linhas, ouve "Arquivo longo";
  ao copiar, "Copiado"; a prévia não é lida a cada tecla.
- `/criar-site-com-ia`: etapa "Contexto" mostra a ferramenta. `/ferramentas`, busca da home ("agents.md", "claude",
  "instruções"), "Outras ferramentas", `/sitemap.xml` e `/mapa-do-site` listam a ferramenta.
- `/privacidade` e `/cookies` com os textos novos e a data do dia.
- `view-source`: `<title>`, description, canonical e o JSON-LD do FAQ com 4 perguntas.

### Produção (depois do deploy)

A mesma lista da tela em `https://criasite.app/ferramentas/arquivo-de-instrucoes-ia` (exemplo, segredo, baixar),
`/criar-site-com-ia#contexto` com o card da ferramenta e o sitemap.

## Riscos e cuidados

- **Hidratação e rascunho**: ler o `localStorage` só no `useEffect` e nunca gravar antes de `loaded`; senão a 1ª
  renderização apaga o rascunho salvo.
- **Segredo em `localStorage`**: com hit não confirmado, não gravar (B3). Não pôr o conteúdo dos campos em
  `console.log`, em URL ou em evento de analytics.
- **Push barrado por "segredo" nos testes**: montar os tokens falsos por concatenação (ver "Testes puros").
- **Regex com lookbehind** (`(?<!…)`): suportado nos navegadores atuais e no Node; não trocar por `\b` (deixaria passar
  "desk-…" como falso positivo).
- **Escapes demais deixam o arquivo feio para a IA**: só os escapes de A4, no começo da linha e o `<` de tag; não
  escapar `*`, `_` ou crase no meio do texto.
- **Fatos voláteis** nos textos: nada de lista de ferramentas com nome de arquivo além de AGENTS.md (convenção aberta) e
  CLAUDE.md (Claude Code); o resto manda "conferir na documentação da sua ferramenta".
- **Import em `build.ts`**: não importar `site.ts` (usa `import.meta.env`) nem nada com `~/`, senão o teste com `node`
  quebra.
- **TOOL_TERMS no topo**: "arquivo de instruções" pode aparecer em notícia que não é sobre IA (raro). Se aparecer link
  estranho no robô, tirar o termo genérico e deixar só `AGENTS.md|CLAUDE.md`.
- React Router: `npm run build` antes do push (pega erro de rota que o typecheck não pega). A página não tem loader.
- Nada de migration nesta tarefa; o link do G3 é pelo painel.

## Estimativa

**M** (uma sessão): ~250 linhas de lógica pura (`build.ts` + `segredos.ts`), ~420 da página, ~200 do script de teste,
mais textos e docs.

## Ordem de commit e push

Um commit só: "Ferramenta: gerador de arquivo de instruções para IA (AGENTS.md/CLAUDE.md)".
`node scripts/test-instrucoes.ts` → `npm run typecheck` → `npm run build` → conferir a tela → atualizar os docs (passo
11) → commit → push → conferir o deploy na Hostinger e a tela em produção.

## Perguntas em aberto (com recomendação)

1. **Endereço e nome**: `/ferramentas/arquivo-de-instrucoes-ia` com H1 "Gerador de arquivo de instruções para IA
   (AGENTS.md)" e title "Gerador de AGENTS.md e CLAUDE.md…"? Alternativa: `/ferramentas/gerador-agents-md`.
   **Recomendo o do plano**: já está em `ia-desenvolvimento.md`, casa com o guia G3, e o termo "AGENTS.md" fica no title
   e no H1.
2. **Ordem F5 → F6**: manter o gerador de prompt primeiro (dom 29/11) e este na semana seguinte? **Recomendo manter**;
   o plano funciona nas duas ordens (os passos dizem o que muda se a F5 já estiver no ar).
3. **Regras marcadas de fábrica**: as 7 da tabela A2 (apagar, instalar, escopo, build, listar arquivos, pt-BR,
   segredos)? **Recomendo essas 7**: são as do guia G3; as outras 6 dependem do projeto.
4. **Segredo bloqueia ou só avisa?** **Recomendo bloquear com confirmação** (B3): o custo é um clique a mais num falso
   alarme raro, e o erro que evita (chave no Git público) é caro.
5. **Rascunho automático** (a cada mudança, com 500 ms de atraso) ou só num botão "Salvar"? **Recomendo automático**,
   pausado quando há segredo, com "Limpar tudo" bem visível e o aviso para computador compartilhado.
6. **Link do G3 para a ferramenta**: pelo painel (frase da D6) ou por migration de UPDATE? **Recomendo o painel**: é um
   parágrafo em um guia; migration para isso não compensa.
7. **Mais nomes prontos** (GEMINI.md, `.github/copilot-instructions.md`, regras do Cursor)? **Recomendo não**: são
   detalhes que mudam com as ferramentas (fato volátil) e alguns ficam em subpastas, que o download não cria. "Outro
   nome" cobre quem precisa.
8. **Arquivo em inglês** (opção de idioma)? **Recomendo não agora**: o site é pt-BR e a IA entende instruções em
   português; rever se aparecer pedido.
