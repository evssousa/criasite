// Tipos da ferramenta "Quanto custa um site" (docs/orcamento-site.md, Parte B).
// Sem imports de `~/`, sem enum, sem import.meta.env (o teste roda direto no Node).

export type TipoId = "pagina-unica" | "institucional" | "blog" | "loja";
export type RecursoId = "formulario" | "agendamento" | "pagamento" | "blog" | "idiomas" | "login";
export type DominioId = "com-br" | "com" | "tenho";
export type EmailTipoId = "simples" | "suite";
export type ImagensId = "minhas" | "banco-gratis" | "banco-pago";
export type TextosId = "eu" | "contrato";
export type ManutencaoId = "eu" | "contrato";
export type CaminhoId = "ia" | "construtor" | "wordpress" | "freelancer" | "agencia";
export type Cobranca = "unico" | "mensal" | "anual";
/** Data no formato AAAA-MM-DD. */
export type IsoDate = string;

export type PremissaId =
  | "dominio-com-br"
  | "dominio-com"
  | "hosp-estatica"
  | "hosp-compartilhada"
  | "hosp-loja"
  | "construtor-basico"
  | "construtor-loja"
  | "construtor-app"
  | "wp-tema"
  | "wp-plugin"
  | "wp-loja-extensoes"
  | "wp-seguranca"
  | "ia-assinatura"
  | "ia-servico"
  | "email-hosp"
  | "email-avulso"
  | "email-suite"
  | "imagens-banco-pago"
  | "manut-freelancer"
  | "manut-agencia";

export type AlertaId = "ia-loja" | "ia-login" | "ia-blog" | "construtor-saida" | "wp-atualizacoes" | "contratar-escopo";
export type AvisoId = "sempre-faixa" | "renovacao" | "taxa-venda" | "dominio-tenho" | "banco-gratis" | "grande" | "fontes";
export type SeloId = "menor-ano1" | "menor-mes" | "menos-tempo";

/** Faixa em reais (inteiros) ou horas (inteiros). Sempre min <= max. */
export interface Faixa {
  min: number;
  max: number;
}

export interface OrcamentoState {
  v: 1;
  tipo: TipoId | "";
  /** Mais de 15 páginas ou mais de 100 produtos. */
  grande: boolean;
  recursos: RecursoId[];
  dominio: DominioId;
  /** 0 a 50, inteiro. */
  caixas: number;
  emailTipo: EmailTipoId;
  imagens: ImagensId;
  textos: TextosId;
  manutencao: ManutencaoId;
  /** 1 a 2000, inteiro; null = não informado. */
  valorHora: number | null;
}

export interface Premissa {
  id: PremissaId;
  label: string;
  cobranca: Cobranca;
  /** Por unidade de cobrança no 1º ano (mensal = por mês). */
  primeiroAno: Faixa;
  /** Por unidade depois (renovação); "unico" = {0,0}. */
  depois: Faixa;
  /** Critério ou fonte declarada (mínimo 30 caracteres). */
  base: string;
  nota?: string;
}

export interface RegraRecurso {
  premissa?: PremissaId;
  horas?: Faixa;
  alerta?: AlertaId;
  /** Só em freelancer e agência: valor somado ao projeto. */
  projeto?: Faixa;
  /** Idiomas: multiplica as horas base do caminho. */
  fatorHoras?: boolean;
}

export interface Linha {
  id: string;
  label: string;
  qtd?: number;
  nota?: string;
  ano1: Faixa;
  mes: Faixa;
  premissa?: PremissaId;
}

export interface ResultadoCaminho {
  id: CaminhoId;
  nome: string;
  linhas: Linha[];
  ano1: Faixa;
  mes: Faixa;
  ano1Bruto: Faixa;
  mesBruto: Faixa;
  horasMontar: Faixa;
  horasMes: Faixa;
  alertas: AlertaId[];
  selos: SeloId[];
}

export interface Estimativa {
  caminhos: ResultadoCaminho[];
  avisos: AvisoId[];
  stale: boolean;
}

export interface OrcamentoData {
  version: 1;
  updatedAt: IsoDate;
  validDays: number;
  premissas: Record<PremissaId, Premissa>;
  horas: Record<CaminhoId, Record<TipoId, Faixa>>;
  horasTextos: Record<TipoId, Faixa>;
  horasMes: Record<CaminhoId, Faixa>;
  projeto: { freelancer: Record<TipoId, Faixa>; agencia: Record<TipoId, Faixa> };
  redacao: Record<TipoId, Faixa>;
  recursos: Record<RecursoId, Record<CaminhoId, RegraRecurso>>;
  fatorGrandePct: Faixa;
  fatorIdiomasPct: Faixa;
  textosBase: { projeto: string; redacao: string; horas: string };
  alertas: Record<AlertaId, { chip: string; texto: string }>;
  avisos: Record<AvisoId, string>;
}
