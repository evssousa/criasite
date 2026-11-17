// Detector simples de segredos colados em campos de texto (chaves de API, tokens, senhas, blocos de .env).
// Puro e genérico (sem React, sem `~/`): o gerador de arquivo de instruções usa agora e o de prompt pode reaproveitar.
// A checagem é simples de propósito: ajuda, mas não substitui a revisão da pessoa. Ver docs/ferramenta-instrucoes-ia.md, B2.

export interface SecretField {
  id: string;
  label: string;
  value: string;
}

export interface SecretHit {
  fieldId: string;
  label: string;
  /** Texto mostrado na tela: "Parece {kind}." */
  kind: string;
  /** Início do trecho achado, nunca o valor inteiro. */
  masked: string;
}

const PATTERNS: { kind: string; res: RegExp[] }[] = [
  {
    kind: "chave de API",
    res: [/(?<![A-Za-z0-9])sk-(?:[A-Za-z]+-)?[A-Za-z0-9_-]{20,}/, /(?<![A-Za-z0-9])(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/, /(?<![A-Za-z0-9])AIza[0-9A-Za-z_-]{30,}/],
  },
  { kind: "token do GitHub", res: [/(?<![A-Za-z0-9])(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/, /(?<![A-Za-z0-9])github_pat_[A-Za-z0-9_]{20,}/] },
  { kind: "chave de acesso da AWS", res: [/(?<![A-Z0-9])(?:AKIA|ASIA)[A-Z0-9]{16}(?![A-Z0-9])/] },
  { kind: "token do Slack", res: [/(?<![A-Za-z0-9])xox[abprs]-[A-Za-z0-9-]{10,}/] },
  { kind: "token JWT", res: [/(?<![A-Za-z0-9])eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/] },
  { kind: "chave privada", res: [/-----BEGIN [A-Z ]*PRIVATE KEY-----/] },
  { kind: "endereço com usuário e senha", res: [/[a-z][a-z0-9+.-]*:\/\/[^\s\/:@]+:[^\s\/@]+@/i] },
  {
    kind: "senha ou segredo escrito no texto",
    res: [
      // A exigência de dígito ou símbolo evita falso alarme em regras como "Senha: pergunte antes".
      /(?<![A-Za-z0-9])(?:password|passwd|pwd|senha|secret|segredo|token|api[_-]?key|apikey|client[_-]?secret|access[_-]?key)\s*[:=]\s*["']?(?=[^\s"']*[\d!@#$%^&*_-])[^\s"']{6,}/i,
      /(?<![A-Za-z0-9])[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|PASS|SENHA)[A-Z0-9_]*\s*=\s*["']?[^\s"']{6,}/,
    ],
  },
];

const ENV_LINE = /^\s*(?:export\s+)?[A-Z][A-Z0-9_]{2,}\s*=\s*\S+/gm;

/** Mostra só o começo do trecho (4 caracteres + reticências), nunca o valor inteiro. */
export function maskSecret(match: string): string {
  return `${Array.from(match).slice(0, 4).join("")}…`;
}

/** Procura segredos nos campos. No máximo 1 achado por campo e tipo. */
export function findSecrets(fields: SecretField[]): SecretHit[] {
  const hits: SecretHit[] = [];
  for (const f of fields) {
    if (!f.value) continue;
    for (const p of PATTERNS) {
      for (const re of p.res) {
        const m = re.exec(f.value);
        if (m) {
          hits.push({ fieldId: f.id, label: f.label, kind: p.kind, masked: maskSecret(m[0]) });
          break;
        }
      }
    }
    const envLines = f.value.match(ENV_LINE);
    if (envLines && envLines.length >= 2) hits.push({ fieldId: f.id, label: f.label, kind: "bloco de variáveis de ambiente (.env)", masked: maskSecret(envLines[0].trim()) });
  }
  return hits;
}
