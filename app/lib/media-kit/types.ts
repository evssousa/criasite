// Tipos do mídia kit (/anuncie). Módulo COMUM aos sites: copie igual para os outros e troque só o data.ts.
// Ver docs/midia-kit.md. Sem imports de `~/`, sem enum, sem import.meta.env (o teste roda direto no Node).

/** Data no formato AAAA-MM-DD. */
export type IsoDate = string;

export interface MediaKitMetric {
  /** Ex.: "gsc-clicks-28d". */
  id: string;
  /** Ex.: "Cliques vindos do Google". */
  label: string;
  /** null = ainda sem dado público. */
  value: number | null;
  /** Ex.: "cliques". */
  unit?: string;
  /** Ex.: "últimos 28 dias". */
  period: string;
  /** Ex.: "Google Search Console". */
  source: string;
  /** Obrigatório quando value != null. */
  updatedAt: IsoDate | null;
  /** Aparece pequeno abaixo do número. */
  note?: string;
  /** Futuro (mini-gráfico): só com 3+ pontos reais, cada um com data. Não usar agora. */
  series?: { date: IsoDate; value: number }[];
}

export interface Persona {
  code: string;
  title: string;
  who: string;
  seeks: string[];
}

export interface AdFormat {
  /** Ex.: "guia-patrocinado". */
  id: string;
  /** Ex.: "FORMATO 01". */
  code: string;
  name: string;
  summary: string;
  includes: string[];
  excludes: string[];
  /** Prazo de entrega. */
  delivery: string;
  /** Tempo no ar. */
  duration: string;
  /** Como é marcado. */
  marking: string;
  /** null = "Sob consulta". */
  price: string | null;
  /** false = o card some da tela e do PDF. */
  available: boolean;
}

export interface MediaKit {
  version: 1;
  /** Revisão do kit inteiro (aparece no topo, no PDF e na validade). */
  updatedAt: IsoDate;
  /** Validade do PDF e idade máxima de um número manual. */
  validDays: number;
  brand: { name: string; domain: string; email: string; mailSubject: string; launchedAt: IsoDate };
  pitch: { title: string; lead: string };
  audience: { intro: string; personas: Persona[]; why: string[]; categories: string[]; note: string };
  /** Só os manuais; os automáticos vêm do loader. */
  metrics: MediaKitMetric[];
  /** Texto da caixa "números sob pedido"; null = não mostra. */
  audienceOnRequest: string | null;
  formats: AdFormat[];
  adsenseNote: { title: string; text: string };
  /** Frase única "nenhum formato garante...", usada também no PDF. */
  sharedExcludes: string;
  rules: string[];
  refused: string[];
  process: { title: string; text: string }[];
  /** "O que enviar no primeiro e-mail". */
  firstEmail: string[];
  responseTime: string;
  /** Linhas do corpo do e-mail. */
  mailTemplate: string[];
  faq: { q: string; a: string }[];
}

/** Linha pronta para a tela. */
export type MetricState = "ok" | "sem-dados" | "vencido";
export interface MetricRow extends MediaKitMetric {
  state: MetricState;
  auto: boolean;
}
