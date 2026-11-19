import { Link } from "react-router";
import { navFor, toolsFor, useAvailability } from "~/lib/availability";
import { DOC_PAGES, SITE, toolUrl } from "~/lib/site";
import { CookiePrefsButton } from "./CookieConsent";
import { Logo } from "./ui";

export function Footer({ adsOn }: { adsOn: boolean }) {
  const available = useAvailability();
  const groups = [
    { title: "Navegue", links: navFor(available) },
    { title: "Ferramentas", links: toolsFor(available).map((t) => ({ to: toolUrl(t.slug), label: t.short })) },
    { title: "Institucional", links: DOC_PAGES.filter((d) => d.group === "site") },
    { title: "Legal", links: DOC_PAGES.filter((d) => d.group === "legal") },
  ];
  return (
    <footer className="night mt-16 bg-night text-moon print:hidden">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex max-w-md flex-col gap-3">
            <Logo />
            <p className="text-[15px] leading-relaxed text-moon-muted">{SITE.description}</p>
          </div>
          <a href="/rss.xml" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-night-line-2 px-4 text-sm font-bold text-glow hover:border-glow">
            RSS das notícias
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {groups
            .filter((g) => g.links.length)
            .map((g) => (
              <nav key={g.title} aria-label={g.title} className="flex flex-col gap-1">
                <h2 className="mb-1 text-sm font-bold text-moon">{g.title}</h2>
                {g.links.map((l) => (
                  <Link key={l.to} to={l.to} className="py-1.5 text-sm text-moon-muted hover:text-moon">
                    {l.label}
                  </Link>
                ))}
              </nav>
            ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-night-line pt-6 text-sm text-moon-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>As ferramentas rodam no seu navegador: o que você digita ou envia nelas não sai do seu computador.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {adsOn && <CookiePrefsButton className="text-left hover:text-moon" />}
            <span>
              © {new Date().getFullYear()} {SITE.team} · criasite.app
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
