import { gaIdValido } from "~/analytics/config";

// Anúncios (Google AdSense) e Google Analytics.
//
// Tudo fica desligado até existir a variável de ambiente ADSENSE_CLIENT (ex.: ca-pub-1234567890123456,
// dada pelo Google na inscrição). Com ela, sem novo build:
//   - o <head> carrega o Modo de Consentimento v2 (tudo negado por padrão) e o script do AdSense;
//   - /ads.txt passa a responder com o ID do editor;
//   - o banner de cookies aparece para quem ainda não escolheu.
// O Google Analytics segue a mesma regra com GA_MEASUREMENT_ID (ex.: G-XXXXXXXXXX).
// Lido em tempo de execução (process.env), por isso só no servidor; o loader da raiz repassa.

// O consentimento de cookies (Modo de Consentimento v2, escolha por categoria) fica em app/analytics/ (módulo copiado do
// animeprofile): consentBootstrap() vem de lá.

export function adsenseClient(): string | null {
  const id = process.env.ADSENSE_CLIENT?.trim();
  return id && /^ca-pub-\d{10,20}$/.test(id) ? id : null;
}

/** ID de medição do Google Analytics 4 (variável GA_MEASUREMENT_ID). Vazio ou inválido = GA desligado. */
export function gaMeasurementId(): string | null {
  return gaIdValido(process.env.GA_MEASUREMENT_ID?.trim());
}
