// Tudo o que muda de um site para outro no módulo de Google Analytics + consentimento. O resto da pasta se copia igual
// (veio do animeprofile; plano: animeprofile/docs/plano-google-analytics.md). Instalação em outro site: ./README.md.
// No criasite o ID do GA vem da variável de ambiente GA_MEASUREMENT_ID (lida no servidor, em app/lib/ads.ts) e chega ao
// navegador pelo loader da raiz: trocar o ID não pede build novo, só reiniciar o app.

/** Onde a escolha de cookies fica no navegador (a Política de Cookies cita este nome). */
export const CONSENT_KEY = "criasite_consent";
/** Mude quando a política mudar de forma relevante: quem escolheu numa versão anterior vê o banner de novo. */
export const CONSENT_VERSION = 2;
/** "Preferências de cookies" no rodapé dispara este evento para reabrir o banner. */
export const OPEN_CONSENT_EVENT = "criasite:cookies";
/** Disparado quando a escolha muda (o GA escuta). */
export const CONSENT_CHANGED_EVENT = "criasite:consent-changed";
/** Marca "não medir este navegador" (ligada com ?nao-medir=1, desligada com ?nao-medir=0). */
export const NAO_MEDIR_KEY = "criasite-nao-medir";
/** Liga o DebugView do GA até fechar a aba (?ga_debug=1). */
export const GA_DEBUG_KEY = "criasite-ga-debug";
/** Caminhos sem GA e sem banner. */
export const SEM_ANALYTICS = /^\/(admin|api)(\/|$)/;
/** Domínio dos cookies _ga (para apagar ao revogar). */
export const COOKIE_DOMAIN = ".criasite.app";

/** Devolve o ID se tiver o formato do GA4 (G-XXXXXXX); senão, null (GA desligado). */
export function gaIdValido(id: string | null | undefined): string | null {
  return id && /^G-[A-Z0-9]{6,12}$/.test(id) ? id : null;
}
