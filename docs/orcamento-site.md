# Ferramenta "Quanto custa um site" (orçamento de site)

Plano escrito pelo planejador em 2026-11-19. Executor: siga a ordem dos commits (Parte J); cada passo diz como conferir.
As decisões de conteúdo, conta e design estão tomadas aqui. As que são do dono estão em "Decisões para aprovar" (Parte A),
cada uma com a recomendação que **vale até ele responder** (o plano já está escrito com a recomendação aplicada).

## Objetivo

Uma ferramenta 100% no navegador em que quem vai criar o próprio site (dono de pequeno negócio, freelancer, iniciante)
escolhe o tipo de site e o que ele precisa e recebe, em **faixas**, quanto custa montar e manter: domínio, hospedagem,
e-mail, plataforma, temas e plugins, imagens e textos, manutenção e o próprio tempo, comparando 5 caminhos (fazer com IA,
construtor, WordPress, freelancer, agência) no **1º ano** e **por mês depois**. Cada número vem de uma tabela de premissas
única, com data de revisão e critério declarado, que vence sozinha.

## Contexto

- `docs/ferramentas.md` lista "Orçamento de site para freelancer" como próxima ferramenta; o pedido do dono agora é a
  versão para **quem cria o próprio site** (estimar custo). A versão "proposta para cliente" do freelancer vira ideia
  separada (pergunta A10).
- Padrão das ferramentas recentes: função pura em `app/lib/<nome>/` (imports relativos com `.ts`, sem `~/`, sem `enum`,
  sem `import.meta.env`, sem importar `site.ts`), teste com `node scripts/test-*.ts`, tela em `app/routes/tool-*.tsx` com
  `ToolLayout` + `ToolPanel` e as peças de `app/components/ToolForm.tsx`, rascunho em `localStorage` via `app/lib/prefs.ts`.
- Honestidade de números: o mídia kit (`app/lib/media-kit/`) já tem o modelo "dado com fonte e data, que vence";
  o mesmo espírito vale aqui (Parte C). Os guias já falam de preço só em faixas e mandam comparar a renovação
  (guia de hospedagem, migration 004).
- Afiliado: o guia de hospedagem tem o link de afiliado da Hostinger com aviso na mesma frase (migration 004). AdSense
  é automático (sem caixas no layout). A ferramenta **não pode** puxar a conta para nenhuma empresa.
- O catálogo de ferramentas é código (`TOOLS` em `app/lib/site.ts`), não banco: sitemap, rodapé, mapa do site, busca e
  "Outras ferramentas" leem de lá sozinhos. A migration nova (010) só põe links nos guias antigos.
- Última migration: `009_links_ferramentas_ia.sql`. As migrations 004 e 009 **gravaram `updated_at`** nos guias que
  alteraram: o guia de hospedagem já não tem `updated_at` vazio (isso muda a guarda dele na 010, ver G3).

---

## Parte A: decisões para aprovar (com recomendação)

1. **Endereço e nome.** Recomendo slug **`quanto-custa-um-site`**, título "Quanto custa um site? Calculadora de custo do
   1º ano e por mês", nome curto "Orçamento de site". Motivo: "quanto custa um site" é o que a pessoa digita no Google;
   "orçamento de site" é mais buscado por freelancer querendo modelo de proposta. Alternativa: `orcamento-de-site`.
   (Pastas e chave seguem o pedido: `lib/orcamento/`, `criasite_orcamento`, `test:orcamento`.)
2. **Categoria:** `dia-a-dia` (público iniciante). A categoria `freelancer` continua vazia até existir a ferramenta de
   proposta (A10).
3. **Os 5 caminhos** (ordem fixa, nunca reordenada pelo resultado): Fazer sozinho com IA · Construtor de sites ·
   WordPress (você monta) · Contratar freelancer · Contratar agência. Recomendo os 5, com agência separada de freelancer
   (a diferença de preço é o que mais surpreende quem pergunta).
4. **Valores iniciais das premissas (Parte C3) são proposta do planejador, sem consulta ao vivo.** Recomendo: antes do
   commit da tela, o dono (ou o executor com o dono) confere 15 a 20 min nas páginas públicas de 2 ou 3 empresas de cada
   linha e ajusta as faixas; só então `updatedAt` recebe a data da conferência. Nenhum nome de empresa entra no arquivo.
5. **Validade das premissas: 180 dias** (revisão semestral). Passou disso, a tela mostra "Premissas em revisão" e o teste
   falha até alguém revisar. Alternativa: 90 dias, como o mídia kit (mais trabalho, preço de hospedagem não muda tão rápido).
6. **Afiliado:** recomendo **nenhum link de afiliado dentro da ferramenta** na v1. Depois do resultado, uma caixa "Para
   decidir" leva aos guias (o de hospedagem já tem o aviso e o link de afiliado). Alternativa (não recomendada agora):
   caixa "Onde o CriaSite está hospedado" com rótulo "Link de afiliado", abaixo das premissas, fora do resultado.
7. **"Fatos" no comparativo:** recomendo mostrar 3 selos calculados, neutros ("Menor custo no 1º ano", "Menor custo por
   mês depois", "Menos do seu tempo") e **nenhum** selo de "recomendado". Alternativa: sem selos.
8. **1º ano = montar + 12 meses de custos fixos.** Recomendo assim (simples de explicar e um pouco conservador).
9. **Seu tempo:** horas sempre aparecem; em dinheiro só se a pessoa digitar o valor da hora, e **separado** do total
   (nunca somado ao custo em reais). Recomendo assim.
10. **Proposta para cliente (freelancer):** fica como ideia separada (categoria `freelancer`), na Caixa de entrada.
    Recomendo não misturar nesta ferramenta.
11. **Impressão:** recomendo incluir "Imprimir ou salvar em PDF" (só CSS de impressão, como o mídia kit). Custa ~30 min.
12. **Links nos guias pela migration 010** (domínio, hospedagem, WordPress ou construtor, e-mail), sem mexer em
    `updated_at` (G3). Recomendo assim.

---

## Arquivos afetados

Novos:
- `app/lib/orcamento/types.ts`: tipos (estado, premissas, resultado).
- `app/lib/orcamento/data.ts`: **único** arquivo de dados (premissas, horas, regras por recurso, textos de aviso), com `updatedAt` e `validDays`.
- `app/lib/orcamento/calc.ts`: funções puras (conta, arredondamento, formatação, validação, rascunho, resumo em texto).
- `scripts/test-orcamento.ts`: testes.
- `app/routes/tool-orcamento.tsx`: a tela.
- `db/migrations/010_links_orcamento.sql`: links nos 4 guias.

Alterados:
- `app/lib/site.ts`: `ToolSlug` + item em `TOOLS`; `TRAIL` (etapa `hospedagem`) e `AI_TRACK` (etapa `planejar`) ganham a ferramenta.
- `app/routes.ts`: rota `ferramentas/quanto-custa-um-site`.
- `app/lib/prefs.ts`: `loadOrcDraft`, `saveOrcDraft`, `clearOrcDraft` (chave `criasite_orcamento`), iguais aos do prompt.
- `app/lib/robot/assemble.ts`: termo novo em `TOOL_TERMS`.
- `app/components/ToolLayout.tsx`: `print:hidden` no caminho, no botão de favorito, no texto explicativo e em "Outras ferramentas".
- `app/app.css`: bloco `@media print` da ferramenta (`.orc-*`).
- `package.json`: `"test:orcamento": "node scripts/test-orcamento.ts"`.
- `docs/ferramentas.md`, `docs/arquitetura.md`, `docs/README.md`, `docs/decisoes.md`.

Sem mudança: privacidade e cookies (os textos já falam de "rascunhos das ferramentas" de forma genérica; conferir com
`grep -n "rascunho" app/routes/privacy.tsx app/routes/cookies.tsx`), sitemap (lê `TOOLS`).

---

## Parte B: o que a pessoa informa (estado)

### B1. Tipos (`app/lib/orcamento/types.ts`)

```ts
export type TipoId = "pagina-unica" | "institucional" | "blog" | "loja";
export type RecursoId = "formulario" | "agendamento" | "pagamento" | "blog" | "idiomas" | "login";
export type DominioId = "com-br" | "com" | "tenho";
export type EmailTipoId = "simples" | "suite";
export type ImagensId = "minhas" | "banco-gratis" | "banco-pago";
export type TextosId = "eu" | "contrato";
export type ManutencaoId = "eu" | "contrato";
export type CaminhoId = "ia" | "construtor" | "wordpress" | "freelancer" | "agencia";
export type Cobranca = "unico" | "mensal" | "anual";
export type IsoDate = string; // AAAA-MM-DD

/** Faixa em reais (inteiros) ou horas (inteiros). Sempre min <= max. */
export interface Faixa { min: number; max: number }

export interface OrcamentoState {
  v: 1;
  tipo: TipoId | "";
  grande: boolean;               // mais de 15 páginas ou mais de 100 produtos
  recursos: RecursoId[];         // ordem de saída = ordem de RECURSOS em data.ts
  dominio: DominioId;
  caixas: number;                // 0 a 50, inteiro
  emailTipo: EmailTipoId;
  imagens: ImagensId;
  textos: TextosId;
  manutencao: ManutencaoId;
  valorHora: number | null;      // 1 a 2000, inteiro; null = não informado
}

export interface Premissa {
  id: PremissaId;
  label: string;          // nome da linha na conta
  cobranca: Cobranca;
  primeiroAno: Faixa;     // por unidade de cobrança no 1º ano (mensal = por mês)
  depois: Faixa;          // por unidade depois (renovação); unico = {0,0}
  base: string;           // critério ou fonte declarada (mín. 30 caracteres)
  nota?: string;          // aparece na tabela de premissas
}

export interface Linha {
  id: string;             // id da premissa ou "projeto", "recurso-<id>", "redacao"
  label: string;
  qtd?: number;           // caixas de e-mail
  ano1: Faixa;            // já multiplicado (sem arredondar)
  mes: Faixa;             // por mês depois (sem arredondar)
  premissa?: PremissaId;  // para o link "ver critério"
}

export interface ResultadoCaminho {
  id: CaminhoId;
  nome: string;
  linhas: Linha[];
  ano1: Faixa;            // arredondado (roundFaixa)
  mes: Faixa;             // arredondado
  ano1Bruto: Faixa;       // soma exata das linhas (para teste)
  mesBruto: Faixa;
  horasMontar: Faixa;
  horasMes: Faixa;
  alertas: AlertaId[];
  selos: SeloId[];        // calculados depois, comparando os 5
}

export interface Estimativa {
  caminhos: ResultadoCaminho[];  // sempre 5, na ordem fixa
  avisos: AvisoId[];             // avisos gerais (não ligados a um caminho)
  stale: boolean;
}
```

`PremissaId`, `AlertaId`, `AvisoId` e `SeloId` são uniões de texto declaradas em `types.ts` com os ids das Partes C e D.

### B2. Estados prontos (`calc.ts`)

- `DEFAULT_STATE`: `{ v:1, tipo:"", grande:false, recursos:[], dominio:"com-br", caixas:1, emailTipo:"simples", imagens:"minhas", textos:"eu", manutencao:"eu", valorHora:null }`.
- `EXAMPLE_STATE` (botão "Preencher com exemplo"): `{ ...DEFAULT_STATE, tipo:"institucional", recursos:["formulario","agendamento"], caixas:2, imagens:"banco-gratis", valorHora:50 }`.
- `isDefaultLike(s)`: igual ao padrão (compara campo a campo, `recursos` ignorando a ordem).
- `parseDraft(raw: string | null): OrcamentoState | null`: JSON inválido, `v !== 1` ou não objeto → `null`. Campo a campo:
  valor fora das uniões vira o padrão; `recursos` sem ids desconhecidos e sem repetição; `caixas` inteiro entre 0 e 50
  (fora disso, o padrão 1); `valorHora` inteiro entre 1 e 2000, senão `null`.

---

## Parte C: dados (`app/lib/orcamento/data.ts`), o único lugar com números

### C1. Forma

```ts
export const ORCAMENTO_DATA = {
  version: 1,
  updatedAt: "AAAA-MM-DD",       // data da conferência (A4)
  validDays: 180,                // A5
  premissas: { ... } satisfies Record<PremissaId, Premissa>,
  horas: { ... },                // C4: Record<CaminhoId, Record<TipoId, Faixa>>
  horasTextos: { ... },          // Record<TipoId, Faixa>
  horasMes: { ... },             // Record<CaminhoId, Faixa> (manutenção feita por você)
  projeto: { freelancer: {...}, agencia: {...} },  // Record<TipoId, Faixa> cada
  redacao: { ... },              // Record<TipoId, Faixa>
  recursos: { ... },             // C5: Record<RecursoId, Record<CaminhoId, RegraRecurso>>
  fatorGrandePct: { min: 150, max: 200 },
  fatorIdiomasPct: { min: 130, max: 160 },
  textosBase: { projeto: "...", redacao: "...", horas: "..." },  // critérios das tabelas sem Premissa
} as const;
```

`RegraRecurso = { premissa?: PremissaId; horas?: Faixa; alerta?: AlertaId; projeto?: Faixa }` (`projeto` só em freelancer
e agência: valor somado ao projeto).

**Regras do arquivo:** sem nome de empresa, sem URL (a única referência de site permitida é `registro.br`, escrita sem
`http`), sem "garantido", "oficial", "exato", "melhor preço". Tudo checado pelo `validateData` (Parte E).

### C2. Ordem e rótulos de tela

`CAMINHOS` (ordem fixa): `ia` "Fazer sozinho com IA" · `construtor` "Construtor de sites" · `wordpress` "WordPress (você monta)" ·
`freelancer` "Contratar freelancer" · `agencia` "Contratar agência".

`TIPOS`:
| id | label | desc (cartão) |
|---|---|---|
| `pagina-unica` | Página única | Cartão de visita on-line: quem é, o que faz, contato. |
| `institucional` | Site institucional | De 3 a 8 páginas: início, sobre, serviços, contato. |
| `blog` | Blog ou site de conteúdo | Artigos publicados com frequência. |
| `loja` | Loja virtual pequena | Até uns 100 produtos, com carrinho e pagamento. |

`RECURSOS` (chips, nesta ordem): `formulario` "Formulário de contato" · `agendamento` "Agendamento on-line" ·
`pagamento` "Receber pagamento on-line" · `blog` "Blog ou notícias" · `idiomas` "Mais de um idioma" ·
`login` "Área de clientes com login". Com `tipo === "loja"` o chip `pagamento` fica marcado e desabilitado com o texto
"já incluso na loja"; com `tipo === "blog"` o chip `blog` idem ("já é um blog"). Na conta, esses dois são ignorados
nesses tipos (não somam duas vezes).

### C3. Premissas (valores iniciais: **proposta, conferir antes do commit da tela**, ver A4)

Valores em reais, inteiros. `mensal` = por mês; `anual` = por ano; `unico` = uma vez.

| id | label | cobrança | 1º ano | depois | base (texto exato) |
|---|---|---|---|---|---|
| `dominio-com-br` | Domínio .com.br | anual | 40–60 | 40–60 | Preço anual do .br na tabela pública do Registro.br (registro.br), mais a margem comum de quem revende. Confira o valor do dia lá. |
| `dominio-com` | Domínio .com | anual | 40–100 | 70–130 | Critério: registradores que vendem em reais. O .com acompanha o dólar e a renovação costuma custar mais que o 1º ano. |
| `hosp-estatica` | Hospedagem de site estático | mensal | 0–25 | 0–25 | Site só de arquivos (HTML, CSS e JavaScript), sem banco de dados: há planos gratuitos com limite de uso; acima do limite, um plano pago simples. |
| `hosp-compartilhada` | Hospedagem compartilhada | mensal | 10–35 | 20–60 | Critério: planos de entrada vendidos no Brasil. O 1º período tem desconto e costuma exigir pagar 12 meses ou mais adiantado; depois vale o preço de renovação. |
| `hosp-loja` | Hospedagem para loja | mensal | 25–80 | 40–150 | Critério: planos intermediários de hospedagem (mais memória e banco de dados) usados para loja com WordPress, no 1º período e na renovação. |
| `construtor-basico` | Plano do construtor de sites | mensal | 30–90 | 40–110 | Critério: planos pagos anualmente de construtores populares no Brasil que aceitam domínio próprio e tiram a marca do construtor. O plano gratuito não entra (usa o endereço do construtor). |
| `construtor-loja` | Plano do construtor com loja | mensal | 60–200 | 70–250 | Critério: planos de construtores e plataformas de loja que liberam carrinho e pagamento, pagos anualmente. Não inclui a taxa por venda. |
| `construtor-app` | Recurso extra do construtor | mensal | 0–60 | 0–60 | Critério: aplicativos e complementos cobrados à parte em alguns construtores (agenda, idiomas, área de membros). Às vezes já vêm no plano. |
| `wp-tema` | Tema do WordPress | anual | 0–400 | 0–300 | Tema gratuito do diretório oficial do WordPress (R$ 0) ou licença de tema comercial, em geral cobrada em dólar por ano. A renovação da licença é opcional, mas traz as atualizações. |
| `wp-plugin` | Plugin pago | anual | 0–600 | 0–600 | Critério: plugins com versão gratuita e licença anual paga para recursos a mais, cobrada em dólar. Muitas vezes a versão gratuita resolve. |
| `wp-loja-extensoes` | Extensões da loja | anual | 0–1000 | 0–1000 | O plugin de loja mais usado no WordPress é gratuito; frete, meios de pagamento e notas podem pedir extensões pagas por ano. |
| `wp-seguranca` | Backup e segurança | anual | 0–400 | 0–400 | Muitos planos de hospedagem já incluem backup; quando não incluem, um plugin de backup e segurança com licença anual. |
| `ia-assinatura` | Assistente de IA enquanto constrói | unico | 0–400 | 0–0 | Plano gratuito ou até 3 meses de um plano pago de assistente de IA enquanto o site é feito. Depois, só se continuar usando para mudar o site. |
| `ia-servico` | Serviço externo para o recurso | mensal | 0–60 | 0–60 | Site feito com IA, sem banco de dados, costuma usar um serviço pronto para formulário, agenda ou login. Muitos têm plano gratuito com limite de uso. |
| `email-hosp` | E-mail na hospedagem | mensal | 0–15 | 0–15 | Muitos planos de hospedagem incluem algumas caixas de e-mail sem custo extra; quando não incluem, a caixa simples é cobrada à parte. Valor por caixa. |
| `email-avulso` | E-mail profissional simples | mensal | 5–20 | 5–20 | Critério: e-mail com domínio próprio vendido por caixa, sem agenda nem documentos. Valor por caixa. |
| `email-suite` | E-mail com agenda e documentos | mensal | 20–45 | 20–45 | Critério: pacotes de escritório com e-mail, agenda e documentos, cobrados por usuário; o preço em reais acompanha o dólar. Valor por caixa. |
| `imagens-banco-pago` | Banco de imagens pago | anual | 100–1200 | 100–1200 | Critério: assinatura ou pacote de imagens para um site pequeno. Bancos gratuitos com licença comercial custam R$ 0 (confira a licença de cada imagem). |
| `manut-freelancer` | Manutenção por freelancer | mensal | 100–500 | 100–500 | Critério do CriaSite: plano mensal de atualizações, backup e pequenos ajustes para site pequeno. Varia com o que está incluído. |
| `manut-agencia` | Manutenção por agência | mensal | 300–1500 | 300–1500 | Critério do CriaSite: contrato mensal de agência com atualizações, backup, suporte e horas de ajuste. |

Tabelas sem `Premissa` (cada uma com o critério de `textosBase`):

- `projeto` (unico), texto `textosBase.projeto`: **"Critério do CriaSite, sem pesquisa formal de mercado: faixa ampla para projeto simples no Brasil, com visual a partir de um modelo e sem sistema feito sob medida. Varia com a região, a experiência e o escopo: peça pelo menos 3 orçamentos com o mesmo pedido."**

  | tipo | freelancer | agência |
  |---|---|---|
  | pagina-unica | 800–3000 | 2500–8000 |
  | institucional | 1500–6000 | 5000–20000 |
  | blog | 1500–6000 | 5000–20000 |
  | loja | 3000–12000 | 10000–40000 |

- `redacao` (unico, só com `textos === "contrato"`), texto `textosBase.redacao`: **"Critério do CriaSite: redator contratado para escrever as páginas fixas do site (não inclui posts de blog)."**
  `pagina-unica` 300–1000 · `institucional` 600–2500 · `blog` 600–2500 · `loja` 800–3000.

- `horas` (horas do **seu** tempo para montar, sem escrever os textos), texto `textosBase.horas`: **"Critério do CriaSite: horas de quem nunca fez um site desse tipo, contando aprender, montar, revisar e publicar. Quem já fez antes gasta menos."**

  | caminho | pagina-unica | institucional | blog | loja |
  |---|---|---|---|---|
  | ia | 6–16 | 15–40 | 15–40 | 40–100 |
  | construtor | 4–12 | 10–30 | 10–30 | 25–70 |
  | wordpress | 8–20 | 20–50 | 20–50 | 40–120 |
  | freelancer | 3–8 | 6–15 | 6–15 | 10–25 |
  | agencia | 3–8 | 6–15 | 6–15 | 10–25 |

  (Em freelancer e agência são as horas de conversa, envio de material e revisões.)
- `horasTextos` (se `textos === "eu"`, em todos os caminhos): `pagina-unica` 2–5 · `institucional` 5–15 · `blog` 5–15 · `loja` 8–25.
- `horasMes` (manutenção feita por você, por mês): `ia` 1–4 · `construtor` 1–2 · `wordpress` 2–4 · `freelancer` 1–3 · `agencia` 1–3.

### C4. Regras por recurso (`recursos`)

| recurso | ia | construtor | wordpress | freelancer (projeto) | agência (projeto) |
|---|---|---|---|---|---|
| `formulario` | `ia-servico`, horas 1–3 | horas 0–1 | horas 1–2 | 0–300 | 0–1000 |
| `agendamento` | `ia-servico`, horas 2–6 | `construtor-app`, horas 1–3 | `wp-plugin`, horas 2–5 | 300–1500 | 1000–4000 |
| `pagamento` | horas 2–6 | horas 1–3 | horas 2–5 | 300–1500 | 1000–4000 |
| `blog` | horas 4–10, alerta `ia-blog` | horas 1–3 | horas 1–3 | 300–1500 | 1000–4000 |
| `idiomas` | fator `fatorIdiomasPct` nas horas base | `construtor-app` + fator nas horas | `wp-plugin` + fator nas horas | 800–3000 | 2500–8000 |
| `login` | `ia-servico`, horas 20–60, alerta `ia-login`, hospedagem vira `hosp-compartilhada` | `construtor-app`, horas 4–10 | `wp-plugin`, horas 6–15 | 2000–8000 | 6000–25000 |

O fator de idiomas multiplica só `horas[caminho][tipo]` (não as horas dos outros recursos). Em freelancer/agência o
idioma é o valor da tabela (não fator).

### C5. Textos de alertas, avisos e selos (exatos)

Alertas (por caminho, chip âmbar + texto no "Ver a conta"):
- `ia-loja`: **Loja feita do zero com IA lida com pagamento, estoque e dados de clientes. Se você nunca fez isso, uma plataforma de loja pronta é mais segura.**
- `ia-login`: **Área com login feita do zero exige banco de dados, senhas e cuidado com dados pessoais (LGPD). Para quem está começando, é o caminho mais arriscado.**
- `ia-blog`: **Para publicar posts sem mexer no código, peça à IA um gerenciador de conteúdo; senão, cada post novo vira um pedido à IA.**
- `construtor-saida`: **Levar o site para outro lugar depois costuma exigir refazer o site.**
- `wp-atualizacoes`: **O WordPress pede atualização do tema e dos plugins todo mês. Sem isso, o site fica vulnerável.**
- `contratar-escopo`: **Peça o orçamento por escrito com o que está incluído (páginas, revisões, textos, prazo) e deixe domínio e hospedagem no seu nome.**

Chip curto do alerta (no cartão): `ia-loja` "Loja do zero: arriscado" · `ia-login` "Login do zero: arriscado" · `ia-blog`
"Posts exigem mais trabalho" · `construtor-saida` "Difícil de mudar depois" · `wp-atualizacoes` "Atualizar todo mês" ·
`contratar-escopo` "Combine o escopo por escrito".

Avisos gerais (lista abaixo do comparativo):
- `sempre-faixa` (sempre): **São faixas amplas, montadas com os critérios da tabela de premissas. Não é orçamento nem oferta: o preço de cada empresa muda e precisa ser conferido antes de contratar.**
- `renovacao` (sempre): **O 1º ano usa os preços de entrada, que costumam ter desconto. A coluna "por mês depois" usa o preço de renovação.**
- `taxa-venda` (tipo `loja` ou recurso `pagamento`): **Receber pagamento on-line tem taxa por venda, em geral alguns por cento do valor, que não entra nesta conta.**
- `dominio-tenho` (domínio `tenho`): **Você já tem domínio: a renovação dele continua, mas não entra nesta conta.**
- `banco-gratis` (imagens `banco-gratis`): **Banco de imagens grátis: confira se a licença de cada imagem permite uso comercial.**
- `grande` (`grande`): **Site grande: as faixas ficam mais largas. Vale pedir orçamento detalhado a quem for fazer.**
- `fontes` (sempre): **Fontes de licença livre não custam nada. Fonte comercial é paga à parte e não entra na conta.**

Selos (calculados, Parte D5): `menor-ano1` "Menor custo no 1º ano" · `menor-mes` "Menor custo por mês depois" · `menos-tempo` "Menos do seu tempo".

---

## Parte D: a conta (`app/lib/orcamento/calc.ts`)

Todas as funções são puras e recebem `data` como parâmetro com padrão `ORCAMENTO_DATA` (o teste usa dados de mentira).

### D1. Custo de uma linha

`lineCost(p: Premissa, qtd = 1, pct: Faixa = {min:100,max:100}): { ano1: Faixa; mes: Faixa }`
- `ano1`: `unico` → `primeiroAno`; `mensal` → `primeiroAno × 12`; `anual` → `primeiroAno`.
- `mes`: `unico` → `{0,0}`; `mensal` → `depois`; `anual` → `{ min: floor(depois.min / 12), max: ceil(depois.max / 12) }`.
- Depois multiplica por `qtd`; e `min` por `pct.min/100`, `max` por `pct.max/100`, com `Math.round`.
- Tabela sem premissa (projeto, redação) usa `unicoCost(f: Faixa, pct)` = `{ ano1: f × pct, mes: {0,0} }`.

### D2. Linhas de cada caminho (`buildLines(state, caminho, data)`)

Seja `T = state.tipo`, `G = grande ? fatorGrandePct : {100,100}`, `R` = recursos efetivos (sem `pagamento` se loja, sem `blog` se blog).

1. **Domínio**: `com-br` → `dominio-com-br`; `com` → `dominio-com`; `tenho` → nenhuma linha.
2. **Plataforma/hospedagem**:
   - `ia`: `T === "loja"` → `hosp-loja`; senão `R` tem `login` → `hosp-compartilhada`; senão `hosp-estatica`. Mais `ia-assinatura`.
   - `construtor`: `T === "loja"` → `construtor-loja`; senão `construtor-basico`.
   - `wordpress`: `T === "loja"` → `hosp-loja` + `wp-loja-extensoes`; senão `hosp-compartilhada`. Sempre `wp-tema` e `wp-seguranca`.
   - `freelancer`/`agencia`: `T === "loja"` → `hosp-loja`; senão `hosp-compartilhada`. Mais a linha `projeto` = `projeto[caminho][T]` com `G`,
     rótulo "Projeto (criação do site)". Tema e plugins ficam dentro do projeto (nota na linha: "tema e plugins incluídos no projeto").
3. **Recursos** (para cada `r` de `R`, na ordem de `RECURSOS`): `freelancer`/`agencia` → soma `regra.projeto` (com `G`) numa linha
   `recurso-<r>` com o rótulo do recurso; nos outros, se a regra tiver `premissa`, uma linha com essa premissa e rótulo
   "<premissa.label>: <rótulo do recurso>" (ex.: "Plugin pago: Agendamento on-line"). Recurso sem premissa não gera linha (só horas).
4. **E-mail** (se `caixas > 0`): `suite` → `email-suite`; `simples` → `email-avulso` em `construtor` e em `ia` com `hosp-estatica`;
   senão `email-hosp`. `qtd = caixas`; rótulo "<label> (N caixas)" ou "(1 caixa)".
5. **Imagens**: `banco-pago` → `imagens-banco-pago`.
6. **Textos**: `contrato` → linha `redacao` = `redacao[T]` com `G`, rótulo "Redação dos textos".
7. **Manutenção**: `contrato` → `manut-agencia` no caminho `agencia`; `manut-freelancer` nos outros 4. `eu` → nenhuma linha.

### D3. Horas

- `horasMontar` = `horas[caminho][T]` × `G` × (fator de idiomas se `idiomas ∈ R` e caminho não é freelancer/agência)
  \+ Σ `regra.horas` dos recursos (sem `G`) + (`textos === "eu"` ? `horasTextos[T]` × `G` : 0). Arredondar com `Math.round`.
- `horasMes` = `manutencao === "eu"` ? `horasMes[caminho]` : `{0,1}`.

### D4. Totais, alertas e avisos

- `ano1Bruto` = soma de `ano1` das linhas; `mesBruto` = soma de `mes`. `ano1` = `roundFaixa(ano1Bruto)`; `mes` = `roundFaixa(mesBruto)`.
- Alertas por caminho: `ia` + loja → `ia-loja`; `ia` + login → `ia-login`; `ia` + (`blog` ∈ R ou `T === "blog"`) → `ia-blog`;
  `construtor` → `construtor-saida` sempre; `wordpress` → `wp-atualizacoes` sempre; `freelancer`/`agencia` → `contratar-escopo` sempre.
- Avisos gerais na ordem da lista C5, cada um só quando a condição vale.

### D5. Selos (comparando os 5)

`meio(f) = (f.min + f.max) / 2`. `menor-ano1` vai para todo caminho cujo `meio(ano1)` é igual ao menor; idem `menor-mes`
com `mes` e `menos-tempo` com `horasMontar`. Empate dá o selo a todos os empatados. Os selos **não** mudam a ordem.

### D6. Arredondamento e formatação (sem `Intl`, para o teste dar o mesmo em qualquer máquina)

- `roundFaixa(f)`: passo pelo tamanho de cada número: < 100 → 1; < 1.000 → 10; < 10.000 → 50; senão 500.
  `min` arredonda **para baixo** e `max` **para cima**, cada um com o seu passo.
- `formatBRL(n)`: `"R$ " + milhar com ponto` (ex.: `1234` → `R$ 1.234`).
- `formatFaixa(f)`: `{0,0}` → `R$ 0`; `min === max` → `R$ X`; senão `R$ X a R$ Y`.
- `formatHoras(f)`: `{0,0}` → `0 h`; `min === max` → `X h`; senão `X a Y h`.
- `formatDateBR("2026-11-19")` → `19/11/2026`; `todayInBrazil()` igual ao de `media-kit/rules.ts` (copiar a função; não importar de lá).

### D7. Função principal

`estimate(state, today: IsoDate, data = ORCAMENTO_DATA): Estimativa | null` → `null` se `tipo === ""`; senão os 5 caminhos
(D2 a D5), `avisos` e `stale = isStale(data, today)`.

`isStale(data, today)` = `today > addDays(data.updatedAt, data.validDays)` (copiar `addDays` do mídia kit).

### D8. Resumo em texto (`buildResumo(state, est, today, data)`) e nome do arquivo

Texto simples, linhas terminadas em `\n`, sem Markdown. Modelo exato (exemplo com valores fictícios):

```
Quanto custa o meu site: estimativa do CriaSite
Feita em 19/11/2026 · premissas revisadas em 19/11/2026

O QUE VOCÊ INFORMOU
- Tipo: Site institucional
- Recursos: Formulário de contato, Agendamento on-line
- Domínio: .com.br
- E-mail: 2 caixas, simples
- Imagens: banco de imagens grátis
- Textos: eu escrevo
- Manutenção: eu mesmo

COMPARAÇÃO (1º ano = montar + 12 meses)
Fazer sozinho com IA
  1º ano: R$ 300 a R$ 1.100 · por mês depois: R$ 25 a R$ 60
  Seu tempo: 23 a 61 h para montar, 1 a 4 h por mês
  (… um bloco por caminho, na ordem fixa; selos entre colchetes no fim da linha do nome, ex.: "[Menor custo no 1º ano]")

AVISOS
- (cada aviso geral)

Estimativa em faixas, não é orçamento nem oferta. Os preços mudam: confira nas empresas antes de contratar.
Premissas e critérios: https://criasite.app/ferramentas/quanto-custa-um-site#premissas
```

- Linha "Site grande (mais de 15 páginas ou 100 produtos)" logo depois do tipo, só se `grande`.
- Recursos vazio → `- Recursos: nenhum extra`. Caixas 0 → `- E-mail: não preciso agora`.
- Com `valorHora`: depois de "Seu tempo", linha `  No seu valor de hora (R$ 50): R$ 1.150 a R$ 3.050, fora do custo acima`.
- `resumoFileName(today)` → `orcamento-site-AAAA-MM-DD.txt`. O domínio `https://criasite.app` vem de um parâmetro
  `siteUrl` com padrão `"https://criasite.app"` (o arquivo puro não lê `SITE`; o teste confere com o valor esperado).

---

## Parte E: validação dos dados (`validateData(data, today): string[]`)

Erro (texto em pt-BR, um por problema) quando:
1. `updatedAt` fora do formato `AAAA-MM-DD` ou no futuro em relação a `today`.
2. `validDays` não inteiro ou fora de 30..365.
3. Qualquer `Faixa` (premissas, horas, projeto, redação, recursos, fatores) com número não inteiro, negativo ou `min > max`.
4. `premissa.id` diferente da chave; `base` com menos de 30 caracteres; `cobranca === "unico"` com `depois` diferente de `{0,0}`.
5. Falta premissa usada por `buildLines` (lista exportada `REQUIRED_PREMISSAS`) ou falta algum tipo/caminho nas tabelas.
6. Algum texto do arquivo (labels, bases, notas, textosBase, textos de alertas e avisos) casa com
   `/\b(hostinger|locaweb|hostgator|kinghost|umbler|godaddy|wix|squarespace|shopify|nuvemshop|tray|loja integrada|webflow|hostnet|google workspace|microsoft 365|zoho|envato|themeforest|elementor|wordpress\.com)\b/i`
   (nomes de empresa) ou com `/(garantid|oficial|exato|melhor preço|mais barato do mercado|promoção imperdível)/i`.
7. Algum texto contém `http`, `www.`, `ref=`, `utm_`, `REFERRAL` ou `afiliad` (link e afiliado não entram nos dados).

Exportar também `isStale` (D7). A tela usa `isStale`; o **teste** falha quando `validateData` tem erro **ou** quando
`isStale(ORCAMENTO_DATA, todayInBrazil())` é verdadeiro (mensagem: "Premissas vencidas: revise app/lib/orcamento/data.ts
e atualize updatedAt"). É assim que a validação "vence".

---

## Parte F: a tela (`app/routes/tool-orcamento.tsx`)

### F1. Direção visual

"Planilha honesta em réguas": o mesmo painel marinho das ferramentas, com o resultado desenhado como **réguas de faixa**
(barra laranja sobre trilho escuro) em vez de um preço único. Nada de gráfico de pizza, "a partir de", preço riscado,
cronômetro, logo de empresa ou selo "recomendado". O olho vê **primeiro** o comparativo dos 5 caminhos (nome, 1º ano em
número grande, régua), **depois** "por mês depois" e o tempo, **por último** a conta linha a linha, os avisos e as premissas.

### F2. Estrutura

`ToolLayout` (título, lead, favorito) → `ToolPanel` → texto explicativo (`explain`) → Outras ferramentas.

Dentro do `ToolPanel`, na ordem:
1. **Barra de topo** igual à do prompt (`DraftStatus` à esquerda; à direita "Ver a estimativa" (`#estimativa`, só `lg:hidden`),
   "Preencher com exemplo" (`btnGhostCls`), "Limpar tudo").
2. `<p className="sr-only" aria-live="polite">` para avisos curtos.
3. Grade `grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start`:
   - **Coluna 1, formulário**: 5 `Section` numeradas (F3).
   - **Coluna 2, `<aside id="estimativa" aria-labelledby="orc-est-t" className="orc-result flex min-w-0 flex-col gap-4">`**: resultado (F4).
     Não é `sticky` (é mais alto que a tela).
4. `ToolDisclaimer`: "Roda no seu navegador: nada do que você escolhe aqui sai do seu computador. O rascunho fica salvo só neste navegador; use “Limpar tudo” para apagá-lo. Detalhes na [política de privacidade](/privacidade)."

**390 px:** uma coluna; formulário em cima, resultado embaixo; o link "Ver a estimativa" no topo leva ao resultado;
números do comparativo em 2 linhas (1º ano em cima, por mês embaixo); tabela da conta sem rolagem horizontal (F4.4).
**1280 px:** formulário (~430 px) à esquerda, resultado (~590 px) à direita.

### F3. Formulário (reusar `Section`, `Box`, `RadioGroup`, `Icon`, `inputCls`)

1. `Section n=1 "O site"`, help "Escolha o que mais se parece com o seu site."
   - `RadioGroup variant="card"` com os 4 `TIPOS` (label + desc), `className="grid grid-cols-1 gap-3 sm:grid-cols-2"`,
     `labelledBy="orc-tipo-t"` (título `sr-only` "Tipo de site"). Sem `allowClear`.
   - Checkbox nativo (mesmo estilo do `SecretCard`: `h-5 w-5 accent-[var(--color-brand)]`, `min-h-11` na label):
     "Site grande (mais de 15 páginas ou mais de 100 produtos)".
2. `Section n=2 "O que ele precisa"`, help "Marque só o que precisa no começo. Botão do WhatsApp não custa nada e não entra aqui."
   - Chips `role="checkbox"`? **Não**: usar `<button type="button" aria-pressed>` em pílula, igual às páginas do prompt
     (copiar a classe da pílula do `RadioGroup`: marcado `border-brand bg-brand text-white` com `Icon check 14`; desmarcado
     `border-night-line-2 bg-night-2 text-moon hover:bg-night-3`). Desabilitado (incluso no tipo): `opacity-60 cursor-not-allowed`,
     `aria-disabled`, texto auxiliar abaixo do grupo: "Pagamento já está incluso na loja." / "Blog já é o tipo escolhido.".
3. `Section n=3 "Domínio e e-mail"`, help "O domínio é o endereço; o e-mail usa o mesmo nome (voce@seusite.com.br)."
   - `RadioGroup pill` "Domínio": `.com.br` · `.com` · `Já tenho`.
   - "Caixas de e-mail": controle numérico com botões − e + (`min-h-11 w-11`, `aria-label` "Menos uma caixa"/"Mais uma caixa")
     e `<input type="text" inputMode="numeric" id="orc-caixas">` de 4 caracteres no meio. Valor fora de 0..50 ou não inteiro:
     borda `border-down-night`, mensagem `text-sm text-down-night` "Use um número de 0 a 50." e a conta usa o último valor válido.
     0 → texto auxiliar "Sem e-mail por enquanto."
   - `RadioGroup pill` "Tipo de e-mail": `Simples` · `Com agenda e documentos` (desabilitado visualmente e ignorado com 0 caixas).
4. `Section n=4 "Conteúdo e manutenção"`, help "Quem faz o quê depois que o site estiver no ar."
   - `RadioGroup pill` "Imagens": `Fotos minhas` · `Banco grátis` · `Banco pago`.
   - `RadioGroup pill` "Textos": `Eu escrevo` · `Contrato quem escreva`.
   - `RadioGroup pill` "Manutenção": `Eu mesmo` · `Pago alguém por mês`.
5. `Section n=5 "Seu tempo (opcional)"`, help "Se quiser, diga quanto vale uma hora sua. O tempo aparece em reais ao lado, mas não entra no total."
   - `Box` "Valor da sua hora, em reais": `input inputMode="numeric"` com prefixo visual "R$" (span absoluto à esquerda, `pl-11`),
     placeholder "Ex.: 50". Vazio = `null`. Inválido (não inteiro, 0 ou > 2000): mensagem "Use um valor de 1 a 2.000." e ignora.

Títulos dos grupos dentro das seções: o mesmo `Subtitle` do prompt (`text-[13px] font-bold tracking-[0.08em] text-moon-muted uppercase`).

### F4. Resultado (coluna 2)

**4.1 Cabeçalho**: `h2 id="orc-est-t"` "Estimativa" (`text-xl font-extrabold`) + à direita `text-xs text-moon-muted`
"Premissas de DD/MM/AAAA" com link "ver" para `#premissas` (`text-glow underline`).
Se `stale`: faixa `rounded-xl border border-[#ffc857] bg-[#ffc857]/10 p-3 text-sm` com `Icon alert`:
**"Premissas em revisão: os valores têm mais de 6 meses e podem estar defasados. Use como ordem de grandeza."**

**4.2 Estado vazio** (`tipo === ""`): caixa `rounded-2xl border border-night-line-2 bg-[#081236] px-6 py-12 text-center`
(igual ao vazio do prompt), ícone de calculadora em SVG inline 32 px, `aria-hidden`, local no arquivo da rota (não mexer
no `Icon` comum): `viewBox 0 0 24 24`, traço 2, `currentColor`, `rect x=5 y=3 w=14 h=18 rx=2`, visor `rect x=8 y=6 w=8 h=3`,
e 6 pontos (`path` com `M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01`). Textos: "**A estimativa aparece aqui.**",
"Escolha o tipo de site para começar ou veja um exemplo pronto." e botão "Preencher com exemplo" (`btnGhostCls`).

**4.3 Comparativo** (`ol aria-label="Comparação dos 5 caminhos"`, `flex flex-col gap-3`). Cada `li` é um cartão
`rounded-2xl border border-night-line-2 bg-night-2 p-4 flex flex-col gap-3`:
- Linha 1: nome do caminho `font-extrabold text-[17px]` + selos à direita (quebram linha em 390): chip
  `rounded-full bg-up-night/15 px-2.5 py-0.5 text-xs font-bold text-up-night` com `Icon check 12`.
- Linha 2: grade `grid grid-cols-1 gap-2 sm:grid-cols-2`:
  - "1º ano" (`text-xs font-bold uppercase tracking-[0.08em] text-moon-muted`) e o valor `num text-2xl font-bold text-glow`;
  - "Por mês depois" e o valor `num text-lg font-bold text-moon`.
- Linha 3, **régua** (`aria-hidden`; os números já estão em texto): trilho `relative h-2 rounded-full bg-night-3`; faixa
  `absolute inset-y-0 rounded-full bg-brand` com `left = min/escala` e `width = max(2%, (max−min)/escala)`, onde
  `escala` = maior `ano1.max` entre os 5 (escala linear e comum a todos, sem log: a diferença real tem que aparecer).
  Abaixo, à direita, só no 1º cartão: `text-[11px] text-moon-muted` "Régua: 1º ano, mesma escala para os 5 caminhos".
- Linha 4: "Seu tempo: **23 a 61 h** para montar · 1 a 4 h por mês" (`text-sm text-moon-muted`, números `num text-moon`).
  Com `valorHora`: na linha de baixo "No seu valor de hora: R$ 1.150 a R$ 3.050 (fora do total)".
- Linha 5: chips de alerta `rounded-full border border-[#ffc857]/60 px-2.5 py-0.5 text-xs font-bold text-[#ffc857]` com `Icon alert 12`.
- Linha 6: botão `aria-expanded aria-controls="orc-conta-<id>"` "Ver a conta" / "Esconder a conta"
  (`min-h-11 text-sm font-bold text-glow underline-offset-4 hover:underline`, `Icon arrow` girando 90° quando aberto, `transition-transform`).

**4.4 A conta (aberta por caminho)**: `div id="orc-conta-<id>"` com tabela `w-full text-sm`:
`caption` sr-only "Conta do caminho <nome>"; colunas `Item` · `1º ano` · `Por mês depois` (`th scope="col"`, `text-xs uppercase text-moon-muted`);
cada linha `th scope="row"` com o rótulo (e, abaixo, `text-xs text-moon-muted` a nota quando houver) e valores `num text-right`
com `formatFaixa`. Última linha "Total" em negrito, com os valores arredondados e, embaixo, `text-xs text-moon-muted`
"Totais arredondados para fora: o mínimo para baixo e o máximo para cima." Depois da tabela, os textos completos dos alertas
do caminho (`text-sm`, `Icon alert` âmbar). Sem `min-width` na tabela: em 390 px os rótulos quebram linha.

**4.5 Ações** (`flex flex-wrap gap-3 print:hidden`): "Copiar resumo" (`btnCls`) → `copyText(buildResumo(...))`, troca para
"Copiado" por 1,8 s; falha → "O navegador bloqueou a cópia. Use “Baixar .txt”." (`text-sm text-glow`).
"Baixar .txt" (`btnGhostCls`) → `download(resumoFileName(today), texto, "text/plain;charset=utf-8")`.
"Imprimir ou salvar PDF" (`btnGhostCls`) → `window.print()`. Os 3 só aparecem com estimativa (não no vazio).

**4.6 Avisos** (`ul` com `Icon info 16` em `text-moon-muted`, `text-sm leading-relaxed`): os `avisos` da estimativa (C5).

**4.7 Para decidir** (caixa `rounded-2xl border border-night-line-2 bg-night-2 p-4 text-sm`, `Icon file`):
"**Para decidir com calma**" e links (`text-glow font-bold`, cada um `min-h-10`):
[Como escolher a hospedagem](/guias/como-escolher-a-hospedagem-do-site) ·
[WordPress ou construtor de sites](/guias/wordpress-ou-construtor-de-sites) ·
[Como escolher o domínio](/guias/como-escolher-o-dominio-do-site) ·
[E-mail com domínio próprio](/guias/email-com-dominio-proprio) ·
[Criar site com IA do jeito certo](/guias/criar-site-com-ia-do-jeito-certo).
Se o caminho `ia` estiver aberto em "Ver a conta", acrescentar o [gerador de prompt para site](/ferramentas/prompt-para-site).
Nada de link externo ou de afiliado aqui (A6).

### F5. Estados

| Situação | O que aparece |
|---|---|
| Sem tipo (inicial) | vazio da 4.2; ações escondidas |
| Exemplo | `EXAMPLE_STATE`; se havia algo diferente do padrão, `confirm("Trocar o que você escolheu pelo exemplo?")` |
| Limpar tudo | `confirm("Apagar as escolhas e o rascunho salvo neste navegador?")` se não for padrão; foco no 1º cartão de tipo |
| Caixas ou valor da hora inválidos | borda vermelha clara + mensagem; a conta segue com o último válido |
| Premissas vencidas | faixa âmbar (4.1); a conta funciona |
| Sem `localStorage` | `DraftStatus` "nostorage" |
| Rascunho salvo | `DraftStatus` "saved" (salva 500 ms depois da última mudança; padrão = apaga) |
| Carregando | não existe (SSR mostra o vazio; o rascunho entra depois de hidratar) |

Avisos ao leitor de tela (`live`): "Exemplo preenchido.", "Campos limpos e rascunho apagado.", "Copiado.", e, quando o
tipo é escolhido pela primeira vez, "Estimativa pronta: 5 caminhos." (não anunciar a cada clique).

### F6. Tokens (todos existem em `app/app.css`; nenhuma cor nova)

| Uso | Token |
|---|---|
| Painel | `night #0c1a4b`, cartões `night-2 #14245e`, trilho/hover `night-3 #1d2c66`, bordas `night-line-2 #2a3c80` |
| Texto | `moon #ffffff`, secundário `moon-muted #b9c3ea` |
| Valor do 1º ano, links | `glow #ff9a4d` |
| Faixa da régua, botão principal, pílula marcada | `brand #ff7a1a` (botão: `btnCls` existente) |
| Selos | `up-night #3ee0b0` sobre `up-night/15` |
| Alertas | âmbar `#ffc857` (o mesmo `AMBER` do `ToolForm`) |
| Erro de campo | `down-night #ff9b9b` |
| Fundo vazio | `#081236` (o mesmo da prévia do prompt) |
| Fontes | Schibsted Grotesk; números em `.num` (JetBrains Mono) |
| Raios | cartões `rounded-2xl`, botões `rounded-xl`, chips e réguas `rounded-full` |
| Sombra | nenhuma |

### F7. Acessibilidade

- Um `h1` (do `ToolLayout`); `h2` "Estimativa"; tabelas com `caption`, `th scope`.
- Grupos com `fieldset/legend` (já no `Section`); `RadioGroup` com setas; pílulas de recurso com `aria-pressed`.
- Régua `aria-hidden` (o valor está em texto); ícones `aria-hidden`.
- Alvos ≥ 44 px; foco visível (o painel tem a classe `night`, que troca o contorno para `glow`).
- Sem animação além de `transition-colors` e o giro da seta (o site já zera transições com `prefers-reduced-motion`).

### F8. Impressão (A11)

No fim de `app/app.css`:

```css
@media print {
  .orc-form, .orc-actions, .orc-decide { display: none !important; }
  .orc-panel { background: #fff !important; color: #0c1a4b !important; padding: 0 !important; }
  .orc-panel * { color: #0c1a4b !important; border-color: #cdd5ef !important; background: transparent !important; }
  .orc-panel .orc-bar { background: #ff7a1a !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .orc-card { break-inside: avoid; }
  .orc-conta[hidden] { display: block !important; }
}
```

Classes: `orc-panel` no `ToolPanel` (via `className`), `orc-form` na coluna 1, `orc-actions` (4.5), `orc-decide` (4.7),
`orc-card` nos cartões, `orc-bar` na faixa da régua, `orc-conta` nas contas (impressão abre todas as contas: renderize as 5
sempre, com `hidden` nas fechadas). Em `ToolLayout.tsx`: `print:hidden` no `nav`, no `FavoriteButton` (envolver num `span`),
no `div.article-body` do explain e na seção "Outras ferramentas". Topo, rodapé e cookies já têm `print:hidden` (mídia kit).
Alvo: o exemplo cabe em 2 páginas A4.

---

## Parte G: textos, SEO, catálogo, links

### G1. `TOOLS` (`app/lib/site.ts`, depois de `prompt-para-site`)

```ts
{
  slug: "quanto-custa-um-site",
  title: "Quanto custa um site? Calculadora de custo do 1º ano e por mês",
  short: "Orçamento de site",
  hint: "domínio, hospedagem e o resto, em faixas",
  description: "Estime quanto custa criar e manter um site: domínio, hospedagem, e-mail, plataforma e manutenção. Compare fazer com IA, construtor, WordPress e contratar.",
  category: "dia-a-dia",
  keywords: "quanto custa um site quanto custa fazer um site preço de site valor de site orçamento de site custo de site calculadora hospedagem domínio e-mail profissional manutenção freelancer agência construtor wordpress loja virtual",
},
```
Conferir a descrição no contador de caracteres do site: até 155. `ToolSlug` ganha `"quanto-custa-um-site"`.
`TRAIL` etapa `hospedagem`: `tools: ["quanto-custa-um-site"]`. `AI_TRACK` etapa `planejar`: `tools: ["quanto-custa-um-site"]`.
Rota em `app/routes.ts`: `route("ferramentas/quanto-custa-um-site", "routes/tool-orcamento.tsx")`.

### G2. Página

- `lead`: **"Escolha o tipo de site e o que ele precisa e veja, em faixas, quanto custa montar e manter: no 1º ano e por mês depois, em 5 caminhos, do faça você mesmo à agência. Tudo fica no seu navegador."**
- `meta`: `seo({ title: tool.title, description: tool.description, path: "/ferramentas/quanto-custa-um-site" })` + JSON-LD `FAQPage` montado do `FAQ` (mesmo código do prompt).
- `explain` (classes do `article-body`; textos exatos):

**Como a conta é feita**
Cada escolha acrescenta linhas a cada um dos 5 caminhos: domínio, hospedagem ou plano da plataforma, e-mail, temas e plugins, imagens, textos e manutenção. O 1º ano soma o que se paga para montar o site com 12 meses dos custos fixos, nos preços de entrada. A coluna "por mês depois" mostra o que fica a partir do 2º ano, já com o preço de renovação, e os custos anuais divididos por 12. Os totais são arredondados para fora: o mínimo para baixo e o máximo para cima.

**Os 5 caminhos**
- **Fazer sozinho com IA**: você pede o site a um assistente de IA e publica numa hospedagem. Custa pouco em dinheiro e bastante em tempo; veja [como criar site com IA do jeito certo](/guias/criar-site-com-ia-do-jeito-certo).
- **Construtor de sites**: o plano mensal inclui editor e hospedagem. É o mais simples de começar e o mais difícil de levar para outro lugar.
- **WordPress (você monta)**: hospedagem, tema e plugins por sua conta, com mais liberdade e atualização todo mês. A comparação completa está em [WordPress ou construtor de sites](/guias/wordpress-ou-construtor-de-sites).
- **Contratar freelancer** e **contratar agência**: você paga o projeto e participa com conversas, textos e revisões. A agência costuma custar mais e entregar com mais gente e mais processo.

**O que não entra na conta**
Taxa por venda de quem recebe pagamento on-line, anúncios pagos, fotos profissionais, logotipo, posts de blog depois do lançamento, impostos e o seu tempo em dinheiro (ele aparece separado, se você informar o valor da sua hora).

**Por que faixas, e não um preço**
O preço de hospedagem, domínio e plataforma muda com promoções, com o dólar e com o plano escolhido, e o de um projeto muda com quem faz e com o que está incluído. Um número único passaria uma certeza que não existe. As faixas mostram a ordem de grandeza para você planejar e comparar; antes de contratar, confira o preço do dia na empresa e peça orçamento por escrito.

**Premissas e fontes** (`h2 id="premissas"`)
Parágrafo: "Revisadas em DD/MM/AAAA (`updatedAt`). Revisamos a cada 6 meses; passado esse prazo, a calculadora avisa." +
tabela (`div.table-wrap`) gerada de `ORCAMENTO_DATA`: colunas Item · Cobrança (`por mês`/`por ano`/`uma vez`) · 1º ano · Depois · Critério;
mais 3 linhas para Projeto (freelancer e agência, "varia com o tipo de site"), Redação e Horas, com os `textosBase`.

**Ninguém paga para aparecer aqui**
Nenhuma empresa paga para entrar nesta calculadora, e ela não cita marcas: as faixas valem para o mercado, não para uma empresa. O CriaSite participa do programa de afiliados de uma empresa de hospedagem, com aviso no [guia de hospedagem](/guias/como-escolher-a-hospedagem-do-site); isso não entra na conta, nas faixas nem na ordem dos caminhos, que é sempre a mesma.

**O rascunho fica no seu navegador**
Nada do que você escolhe é enviado para o CriaSite nem para outro servidor. As escolhas ficam salvas no armazenamento local deste navegador para você voltar depois; "Limpar tudo" apaga.

**Perguntas frequentes** (`FAQ`, também no JSON-LD):
1. **Quanto custa um site simples?** — **Para uma página única ou um site institucional pequeno, feito por você, o maior custo em dinheiro costuma ser o domínio e a hospedagem, e o maior custo de verdade é o seu tempo. Contratando alguém, o projeto passa a ser a maior parte da conta. Use a calculadora com o seu caso para ver as faixas.**
2. **Os valores são de alguma empresa?** — **Não. São faixas montadas com critérios declarados na tabela de premissas, sem citar empresas, e revisadas a cada 6 meses. Antes de contratar, confira o preço do dia e o preço de renovação na empresa escolhida.**
3. **Fazer sozinho é sempre mais barato?** — **Em dinheiro, quase sempre. Em tempo, não: montar, aprender e manter o site pode levar dezenas de horas. Informe o valor da sua hora para ver esse tempo em reais, ao lado do total.**
4. **O CriaSite guarda as minhas escolhas?** — **Não. A calculadora roda no seu navegador e nada é enviado para o nosso servidor. O rascunho fica só no armazenamento local deste navegador e é apagado no botão “Limpar tudo”.**

Na tela, os valores citados do exemplo de C3 **não** são repetidos em texto corrido (os textos não têm números de preço, só a tabela de premissas, que lê o `data.ts`): assim a revisão de preços é feita em um lugar só.

### G3. Migration `db/migrations/010_links_orcamento.sql` (MySQL 8 e MariaDB)

Mesmo modelo da 009 (`SET NAMES utf8mb4;`, `JSON_ARRAY_INSERT` + `JSON_OBJECT('type','p','text', ...)`, ponto de inserção
conferido por `JSON_UNQUOTE(JSON_EXTRACT(body, '$[N].text')) = '<título esperado>'`, e
`CAST(body AS CHAR) NOT LIKE '%/ferramentas/quanto-custa-um-site%'`). **Diferenças da 009:**
- **Não alterar `updated_at`** (um link não é revisão do texto; e o guia segue "não editado" para migrations futuras).
- Os 3 guias com `updated_at` vazio levam `AND updated_at IS NULL`. O de **hospedagem** não (a 004 já gravou `updated_at`):
  a guarda dele são **duas** âncoras e o `NOT LIKE`. Como `JSON_ARRAY_INSERT` só insere (nunca sobrescreve), uma edição do
  dono fora desse ponto não se perde; se ele mexeu nesse ponto, as âncoras não batem e nada acontece.

Os índices `N` saem do corpo em `003_guias_iniciais.sql` (linha do domínio), `004_afiliado_hostinger.sql` (hospedagem) e
`006_guias_leva2.sql` (WordPress e e-mail): conte os blocos a partir de 0 (script de uma linha com `JSON.parse` no corpo
copiado). Inserir **no índice do `h2` âncora** (o parágrafo entra logo antes dele):

| guia (slug) | inserir antes do h2 | guarda extra | parágrafo (texto exato) |
|---|---|---|---|
| `como-escolher-o-dominio-do-site` | "Erros comuns" (logo depois de "Quanto custa") | `updated_at IS NULL` | Para somar o domínio com a hospedagem, o e-mail e o resto do site, e comparar os caminhos no 1º ano e por mês, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site). |
| `como-escolher-a-hospedagem-do-site` | "Uma nota de transparência" (índice 16; conferir que o 14 é "Quanto custa") | `$[14].text = 'Quanto custa'` **e** `$[16].text = 'Uma nota de transparência'` | Para ver a hospedagem junto com o domínio, o e-mail e a plataforma, já com o preço de renovação, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site). Ela não indica empresa: mostra faixas e o critério de cada uma. |
| `wordpress-ou-construtor-de-sites` | "Passo a passo para escolher" | `updated_at IS NULL` | Para comparar o custo do WordPress e do construtor no seu caso, com o tempo que cada um pede de você, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site). |
| `email-com-dominio-proprio` | "Passo a passo" | `updated_at IS NULL` | Para somar as caixas de e-mail ao custo do site inteiro, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site). |

Cabeçalho do arquivo (comentário) no estilo da 009, dizendo o que faz, as guardas e "se algo não bater, nada acontece:
inclua o parágrafo pelo painel (/admin → Matérias)". **Colar o SQL inteiro no chat** ao terminar (regra do dono).
O texto do link usa `[...](...)`, que o `RichText` já transforma em link interno.

### G4. Robô (`app/lib/robot/assemble.ts`, `TOOL_TERMS`)

Acrescentar no fim:
`{ re: /(?<![\p{L}\d])(quanto custa (?:fazer |criar |ter )?(?:um |o )?sites?|custo de (?:criar |manter )?(?:um |o )?sites?|orçamento de sites?)(?![\p{L}\d])/iu, url: "/ferramentas/quanto-custa-um-site" }`.

### G5. Docs

- `docs/ferramentas.md`: linha na tabela "No ar" (resumo do funcionamento) e trocar "Orçamento de site para freelancer" em
  "Próximas" por "Proposta de orçamento para cliente (freelancer)".
- `docs/arquitetura.md`: `lib/orcamento/` na árvore; rota na lista de ferramentas; `criasite_orcamento` em "Estado no navegador".

---

## Parte H: testes (`scripts/test-orcamento.ts`)

Mesmo estilo de `scripts/test-prompt-site.ts` (`ok(name, fn)`, `assert/strict`, contagem no fim, `process.exitCode = 1`).
Os testes de fórmula usam **premissas de mentira** montadas no próprio teste (não os valores reais, que mudam).

Fórmulas:
1. `lineCost` mensal `{10,35}`/`{20,60}` → `ano1 {120,420}`, `mes {20,60}`.
2. `lineCost` anual `{40,60}`/`{40,60}` → `ano1 {40,60}`, `mes {3,5}`.
3. `lineCost` único `{800,3000}` com `pct {150,200}` → `ano1 {1200,6000}`, `mes {0,0}`.
4. `lineCost` mensal `{0,15}`/`{0,15}` com `qtd 2` → `ano1 {0,360}`, `mes {0,30}`.
5. `roundFaixa`: `{23,147}` → `{23,150}`; `{123,987}` → `{120,990}`; `{1234,5678}` → `{1200,5700}`; `{12345,23456}` → `{12000,23500}`; `{0,0}` → `{0,0}`.
6. `formatBRL(1234)` = `R$ 1.234`; `formatBRL(0)` = `R$ 0`; `formatBRL(12500)` = `R$ 12.500`.
7. `formatFaixa`: `{0,0}` → `R$ 0`; `{40,40}` → `R$ 40`; `{0,360}` → `R$ 0 a R$ 360`. `formatHoras({6,16})` = `6 a 16 h`.
8. `formatDateBR("2026-11-19")` = `19/11/2026`; `addDays("2026-11-19", 180)` = `2027-05-18`.

Montagem (dados reais, sem conferir valores):
9. `estimate({...DEFAULT_STATE}, hoje)` = `null`.
10. Exemplo: 5 caminhos na ordem `ia, construtor, wordpress, freelancer, agencia`; todo total com `0 <= min <= max`;
    `ano1Bruto` = soma das linhas; `ano1.min <= ano1Bruto.min` e `ano1.max >= ano1Bruto.max`.
11. `caixas: 0` → nenhuma linha com id começando por `email`. `caixas: 3` → linha de e-mail com `qtd 3`.
12. `dominio: "tenho"` → sem linha `dominio-*` e com aviso `dominio-tenho`.
13. `tipo: "loja"` → `construtor` tem `construtor-loja`; `wordpress` tem `hosp-loja` e `wp-loja-extensoes`; aviso `taxa-venda`;
    recurso `pagamento` marcado não gera linha extra; `ia` tem alerta `ia-loja`.
14. `recursos: ["login"]` em institucional → `ia` usa `hosp-compartilhada` e tem `ia-login`.
15. `ia` simples (institucional, sem login) usa `hosp-estatica` e e-mail `email-avulso`; `wordpress` usa `email-hosp`.
16. `grande: true` aumenta `horasMontar.max` e o `ano1.max` de freelancer e agência em relação a `grande: false`.
17. `textos: "contrato"` → linha `redacao` nos 5 caminhos; `"eu"` → horas maiores e sem `redacao`.
18. `manutencao: "contrato"` → `agencia` tem `manut-agencia`, os outros `manut-freelancer`.
19. Selos: com dados de mentira em que dois caminhos empatam no menor meio do 1º ano, os dois recebem `menor-ano1`; a ordem não muda.
20. Sanidade dos dados reais, para cada tipo: `agencia.ano1.min >= freelancer.ano1.min`.

Rascunho:
21. `parseDraft(null)`, `parseDraft("x")`, `parseDraft('{"v":2}')` → `null`.
22. `parseDraft` com `caixas: 99`, `caixas: 1.5`, `recursos: ["login","foo","login"]`, `valorHora: 0`, `tipo: "x"` →
    `caixas 1`, `caixas 1`, `["login"]`, `null`, `""`.
23. `isDefaultLike(DEFAULT_STATE)` verdadeiro; `isDefaultLike(EXAMPLE_STATE)` falso.

Resumo:
24. `buildResumo(EXAMPLE_STATE, ...)` contém "não é orçamento", "19/11/2026" (com `today` fixo), os 5 nomes, "fora do custo acima"
    (valorHora 50), `https://criasite.app/ferramentas/quanto-custa-um-site#premissas`; termina em `\n`; nenhuma linha passa de 110 caracteres.
25. `resumoFileName("2026-11-19")` = `orcamento-site-2026-11-19.txt`.

Validação:
26. `validateData` acusa: `min > max`; valor negativo; `1.5`; `base` curta; label "Plano Hostinger"; base com "preço garantido";
    base com `https://`; `updatedAt` no futuro; premissa obrigatória faltando; único com `depois` diferente de zero.
27. `isStale` com `updatedAt` de 181 dias atrás → verdadeiro; 180 → falso.
28. **Dados reais:** `validateData(ORCAMENTO_DATA, todayInBrazil())` = `[]` **e** `isStale(...)` falso (senão a mensagem de "Premissas vencidas").

Comando: `npm run test:orcamento`.

---

## Parte I: riscos e cuidados

- **Número com cara de oficial:** só faixas, critério escrito ao lado, nenhum nome de empresa (o teste barra). Os valores
  de C3 são proposta e precisam da conferência A4 **antes** de ir ao ar.
- **Viés de afiliado:** ordem fixa, selos calculados, sem link de afiliado na ferramenta; a "hospedagem compartilhada" é
  uma faixa do mercado. Ninguém deve "ajustar" uma faixa para favorecer um caminho; mudança de premissa vai para `decisoes.md`.
- **Defasagem:** 180 dias e o teste falha; anotar a revisão em "Pendências suas" com a data (por volta de 6 meses depois de `updatedAt`).
- **Taxa de venda e impostos** ficam fora e isso está dito (aviso e "O que não entra").
- **Dados pessoais:** nenhum campo de texto livre (por isso não há detector de segredos); nada sai do navegador.
- **Hidratação:** o servidor renderiza o vazio; `todayInBrazil()` só no cliente para o resumo (no SSR, a data do
  cabeçalho vem de `ORCAMENTO_DATA.updatedAt`, que é estática). Não usar `Date` no render inicial.
- **Impressão:** `md:`/`lg:` não valem no A4; o CSS de F8 força uma coluna escondendo o formulário.
- **Migration:** MySQL 8 e MariaDB (usar `JSON_OBJECT`, não `CAST AS JSON`); idempotente pelo `NOT LIKE`; não mexer em `updated_at`;
  colar o SQL no chat.
- **Build:** `npm run typecheck`, `npm run test:orcamento` e `npm run build` antes de cada push. A rota não tem loader
  (nada de `routePath`), mas confira o `.data` ao navegar pelo menu.
- **Conteúdo fino:** o `explain` + tabela de premissas passam de 700 palavras; não encurtar.

---

## Parte J: ordem dos commits (pequenos)

1. **"Orçamento de site: tipos, dados e conta (sem tela)"**: `types.ts`, `data.ts` (valores de C3, `updatedAt` = data do commit),
   `calc.ts`, `scripts/test-orcamento.ts`, script no `package.json`. Conferir: `npm run typecheck` e `npm run test:orcamento` passam.
2. **Conferência das premissas (A4)**: ajustar faixas em `data.ts` com o dono, `updatedAt` = dia da conferência, teste passa.
   Commit "Orçamento de site: premissas conferidas em DD/MM/AAAA". (Se o dono preferir conferir depois, a tela não vai ao ar sem isso.)
3. **"Orçamento de site: tela"**: `prefs.ts`, `tool-orcamento.tsx`, `routes.ts`, `TOOLS`/`ToolSlug`, `TRAIL`, `AI_TRACK`,
   `ToolLayout` (`print:hidden`), CSS de impressão, `TOOL_TERMS`. Conferir: checklist abaixo (tela, impressão, SEO), `npm run build`.
4. **"Orçamento de site: links nos guias (migration 010)"**: só o SQL. Colar no chat.
5. **"Docs: orçamento de site"**: `ferramentas.md`, `arquitetura.md`, `README.md` (status ✅, Próximos passos, Pendências suas:
   data da próxima revisão de premissas), `decisoes.md` (execução e desvios). Marcar `[x]` no `PLANEJAMENTO.md` se a tarefa estiver lá.

Push depois de cada commit que passa no build (ou no fim, todos juntos, se o dono preferir).

---

## Parte K: como verificar

Tela (`npm run dev`):
- [ ] **390 px:** sem rolagem horizontal (inclusive nas 5 contas abertas); formulário em cima, "Ver a estimativa" leva ao resultado;
  cartões de tipo em 1 coluna; botões ≥ 44 px; números do cartão em 2 linhas.
- [ ] **1280 px:** formulário à esquerda, estimativa à direita; cartões de tipo em 2 colunas; "1º ano" e "por mês" lado a lado.
- [ ] Inicial: vazio da 4.2, sem ações. "Preencher com exemplo" → 5 cartões na ordem fixa, selos e régua.
- [ ] Régua: o caminho mais caro ocupa até o fim do trilho; o mais barato aparece com pelo menos 2% de largura.
- [ ] Loja: chip "Receber pagamento" desabilitado com o texto; aviso de taxa; alerta "Loja do zero" no cartão de IA.
- [ ] Caixas: − e + funcionam; "99" mostra o erro e a conta não muda; 0 esconde a linha de e-mail e desabilita o tipo de e-mail.
- [ ] Valor da hora 50: aparece "No seu valor de hora" em cada cartão; o total em reais não muda.
- [ ] "Ver a conta": tabela com linhas, total igual ao do cartão, nota de arredondamento e alertas completos.
- [ ] "Copiar resumo" e "Baixar .txt" (nome `orcamento-site-AAAA-MM-DD.txt`, UTF-8 com acentos certos).
- [ ] Recarregar a página mantém as escolhas; "Limpar tudo" apaga e volta ao vazio; aba anônima sem erro.
- [ ] Simular `updatedAt` antigo (só local, sem commit): faixa âmbar "Premissas em revisão".
- [ ] Teclado: setas nos grupos, Tab por tudo com foco visível; leitor de tela anuncia "Estimativa pronta: 5 caminhos." uma vez.
- [ ] DevTools → Rede: nenhuma requisição ao mexer nos campos.
- [ ] Ctrl+F na página: nenhum nome de empresa no formulário e no resultado; "Hostinger" não aparece (só existe no guia de hospedagem).
- [ ] Impressão (Chrome, A4): sem topo, rodapé, formulário, botões e texto explicativo; 5 cartões com as contas abertas; até 2 páginas no exemplo; régua visível.

SEO e catálogo:
- [ ] `view-source`: título, descrição (≤ 155), `index, follow`, JSON-LD `FAQPage` com as 4 perguntas iguais às da tela.
- [ ] `/sitemap.xml`, `/mapa-do-site`, rodapé, `/ferramentas` e busca da home ("quanto custa") mostram a ferramenta.
- [ ] `/trilha` (etapa Hospedagem) e `/criar-site-com-ia#planejar` mostram a ferramenta.
- [ ] Depois do deploy: os 4 guias com o parágrafo e o link (ou, se a guarda barrou, anotar em "Pendências suas" para o painel).

Comandos: `npm run typecheck` · `npm run test:orcamento` · `npm run build`.

## Estimativa

**M, ~4 a 5 h**: dados, conta e testes ~1 h 30; conferência de premissas com o dono ~20 min; tela ~2 h; impressão,
catálogo, robô e migration ~45 min; docs ~15 min.

## Perguntas em aberto

As 12 da Parte A. As que mais mudam o trabalho: **A1** (slug), **A4** (quem confere os valores e quando), **A5** (validade)
e **A6** (afiliado fora da ferramenta).
