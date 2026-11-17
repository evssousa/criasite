// Tipos da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md). Compartilhados entre a página e o servidor:
// sem imports de node:* e sem enum (o script de teste roda direto no Node, sem bundler).

export type Verdict = "no-ar" | "alerta" | "fora-do-ar" | "nao-encontrado";

export type Reason =
  | "ok" // 2xx (ou 304) no fim
  | "http-acesso-negado" // 401, 403, 429 (servidor respondeu, mas recusou a checagem)
  | "http-nao-encontrada" // 404, 410 (site no ar, página não existe)
  | "http-outro-4xx" // demais 4xx
  | "http-erro-servidor" // 500, 502, 504 e outros 5xx
  | "http-manutencao" // 503
  | "dns-nao-encontrado"
  | "dns-sem-endereco"
  | "dns-falhou"
  | "conexao-recusada"
  | "conexao-interrompida"
  | "tempo-esgotado"
  | "tls-falhou"
  | "erro-rede"
  | "resposta-invalida"
  | "muitos-redirecionamentos"
  | "redirecionamento-bloqueado";

export type Alert = "sem-https" | "certificado-vence-logo" | "certificado-problema" | "lento";

/** Salto de redirecionamento. url em formato de exibição, cortada em 120 caracteres. */
export interface Hop {
  url: string;
  status: number;
}

export interface CheckResult {
  /** Endereço pedido, em formato de exibição (ex.: "pão.com.br/contato"). */
  target: string;
  /** Último endereço que respondeu, em formato de exibição. */
  finalUrl: string | null;
  verdict: Verdict;
  reason: Reason;
  alerts: Alert[];
  /** Código da última resposta. */
  status: number | null;
  /** "OK", "Not Found"... (cortado em 40). */
  statusText: string;
  /** Tempo até os cabeçalhos da 1ª resposta. */
  ttfbMs: number | null;
  /** DNS + todos os saltos. */
  totalMs: number;
  /** Os IPs resolvidos não voltam para o navegador. */
  dns: { ok: boolean; v4: boolean; v6: boolean; ms: number };
  /** Saltos 3xx, em ordem (vazio se nenhum). */
  redirects: Hop[];
  https: null | { state: "valido" | "vencido" | "outro-nome" | "nao-confiavel"; validTo: string | null; daysLeft: number | null; issuer: string };
  /** Cabeçalho Server, cortado em 40. */
  server: string | null;
  /** ISO. */
  checkedAt: string;
  cached: boolean;
}

export interface ApiError {
  error: "invalido" | "bloqueado" | "limite" | "limite-alvo" | "ocupado" | "proibido";
  /** Pronto para mostrar, em pt-BR. */
  message: string;
  /** Segundos. */
  retryAfter?: number;
}
