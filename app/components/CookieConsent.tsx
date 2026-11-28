// Banner de consentimento de cookies (LGPD + Modo de Consentimento v2 do Google), em 2 camadas: "resumo" (Só os essenciais /
// Aceitar todos / Personalizar) e "personalizar" (chaves Estatística e Anúncios). A lógica fica em ~/analytics/use-consentimento
// (módulo copiado do animeprofile); aqui só o visual do criasite. "Preferências de cookies" no rodapé reabre direto em
// "personalizar". Só existe com anúncios (ADSENSE_CLIENT) ou Google Analytics (GA_MEASUREMENT_ID) ligados.
import { useEffect, useId, useRef } from "react";
import { Link, useLocation } from "react-router";
import { OPEN_CONSENT_EVENT } from "~/analytics/config";
import { useConsentimento } from "~/analytics/use-consentimento";

export { OPEN_CONSENT_EVENT };

const BTN_CONTORNO = "min-h-11 rounded-xl border border-night-line-2 px-5 text-sm font-bold hover:border-glow hover:text-glow";
const BTN_ACEITAR = "min-h-11 rounded-xl bg-violet px-5 text-sm font-extrabold text-white hover:bg-violet-deep";
const BTN_TEXTO =
  "order-last min-h-11 px-2 text-sm font-bold text-moon-muted underline decoration-night-line-2 underline-offset-4 hover:text-glow sm:order-first sm:mr-auto";

function textoResumo(analytics: boolean, ads: boolean) {
  if (analytics && ads)
    return "Usamos cookies essenciais para o site funcionar. Com a sua permissão, também usamos o Google Analytics para saber quais páginas são lidas e o Google AdSense para mostrar anúncios do seu interesse.";
  if (analytics) return "Usamos cookies essenciais para o site funcionar. Com a sua permissão, também usamos o Google Analytics para saber quais páginas são lidas.";
  return "Usamos cookies essenciais para o site funcionar. Com a sua permissão, o Google também usa cookies para mostrar anúncios personalizados e medir o resultado deles.";
}

function Chave({ ligado, aoMudar, rotulo, descricao }: { ligado: boolean; aoMudar: (v: boolean) => void; rotulo: string; descricao: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-labelledby={rotulo}
      aria-describedby={descricao}
      onClick={() => aoMudar(!ligado)}
      className="-m-[9px] shrink-0 rounded-full p-[9px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
    >
      <span className={`flex h-[26px] w-11 items-center rounded-full border ${ligado ? "border-violet bg-violet" : "border-night-line-2 bg-night"}`}>
        <span
          className={`h-5 w-5 rounded-full transition-transform duration-150 ease-out motion-reduce:transition-none ${ligado ? "translate-x-[20px] bg-white" : "translate-x-[2px] bg-moon-muted"}`}
        />
      </span>
    </button>
  );
}

function Linha({ nome, sub, texto, children }: { nome: string; sub?: string; texto: string; children: (ids: { rotulo: string; descricao: string }) => React.ReactNode }) {
  const id = useId();
  const ids = { rotulo: `${id}-n`, descricao: `${id}-d` };
  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-4 py-3">
      <div>
        <p id={ids.rotulo} className="text-sm font-bold text-moon">
          {nome}
          {sub && <span className="ml-2 text-xs font-normal text-moon-muted">{sub}</span>}
        </p>
        <p id={ids.descricao} className="mt-1 text-[13px] leading-relaxed text-moon-muted">
          {texto}
        </p>
      </div>
      {children(ids)}
    </li>
  );
}

export function CookieConsent({ ads, analytics }: { ads: boolean; analytics: boolean }) {
  const { pathname } = useLocation();
  const c = useConsentimento({ analytics, ads }, pathname);
  const titulo = useRef<HTMLHeadingElement | null>(null);

  // ao trocar de camada, o foco vai para o título
  useEffect(() => {
    if (c.aberto && c.camada === "personalizar") titulo.current?.focus();
  }, [c.aberto, c.camada]);

  // Esc fecha só quando reaberto pelo rodapé (na 1ª visita é preciso escolher)
  useEffect(() => {
    if (!c.aberto || !c.reaberto) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && c.fechar();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [c.aberto, c.reaberto, c]);

  if (!c.aberto) return null;
  const personalizar = c.camada === "personalizar";
  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookies-titulo"
      className="night fixed inset-x-3 bottom-3 z-50 mx-auto flex max-h-[calc(100dvh-1.5rem)] max-w-3xl flex-col gap-4 overflow-y-auto rounded-[22px] border border-night-line-2 bg-night-2 p-5 text-moon shadow-2xl print:hidden sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id="cookies-titulo" ref={titulo} tabIndex={-1} className="eyebrow text-glow outline-none">
          {personalizar ? "PREFERÊNCIAS DE COOKIES" : "COOKIES"}
        </h2>
        {personalizar ? (
          <ul className="divide-y divide-night-line-2">
            <Linha nome="Essenciais" texto="Esta escolha e o funcionamento básico do site. Sem eles o site não funciona.">
              {() => <span className="pt-0.5 text-xs font-bold text-glow">Sempre ativos</span>}
            </Linha>
            {analytics && (
              <Linha nome="Estatística" sub="Google Analytics" texto="Mostra quais páginas são lidas e por quanto tempo, sem identificar você. O Google não guarda o seu IP.">
                {(ids) => <Chave {...ids} ligado={c.rascunho.analytics} aoMudar={(v) => c.setRascunho({ ...c.rascunho, analytics: v })} />}
              </Linha>
            )}
            {ads && (
              <Linha nome="Anúncios personalizados" sub="Google AdSense" texto="Mostra anúncios de acordo com os seus interesses. Sem isso, os anúncios continuam, mas genéricos.">
                {(ids) => <Chave {...ids} ligado={c.rascunho.ads} aoMudar={(v) => c.setRascunho({ ...c.rascunho, ads: v })} />}
              </Linha>
            )}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-moon-muted">
            {textoResumo(analytics, ads)} Você pode mudar de ideia quando quiser pelo link “Preferências de cookies” no rodapé. Saiba mais na{" "}
            <Link to="/cookies" className="text-moon underline decoration-glow underline-offset-4 hover:text-glow">
              política de cookies
            </Link>
            .
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {personalizar ? (
          <>
            {c.podeVoltar && (
              <button type="button" onClick={c.voltar} className={BTN_TEXTO}>
                Voltar
              </button>
            )}
            <button type="button" onClick={c.salvar} className={BTN_CONTORNO}>
              Salvar escolhas
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={c.abrirPersonalizar} className={BTN_TEXTO}>
              Personalizar
            </button>
            <button type="button" onClick={c.soEssenciais} className={BTN_CONTORNO}>
              Só os essenciais
            </button>
          </>
        )}
        <button type="button" onClick={c.aceitarTodos} className={BTN_ACEITAR}>
          Aceitar todos
        </button>
      </div>
    </section>
  );
}

/** Link do rodapé que reabre o banner (o rodapé só o mostra com anúncios ou Google Analytics ligados). */
export function CookiePrefsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className={className}>
      Preferências de cookies
    </button>
  );
}
