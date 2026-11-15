import { Form, Link, NavLink, useLocation } from "react-router";
import { navFor, useAvailability } from "~/lib/availability";
import { Logo, cx } from "./ui";

/** Campo de busca compacto do topo (nas páginas internas; a home tem a busca grande). */
function TopSearch({ id, className }: { id: string; className?: string }) {
  return (
    <Form method="get" action="/busca" role="search" className={cx("h-[44px] items-center gap-2 rounded-xl bg-white px-3", className)}>
      <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6798" strokeWidth="2.4" strokeLinecap="round" className="shrink-0">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <label htmlFor={id} className="sr-only">
        Buscar
      </label>
      <input id={id} name="q" type="search" placeholder="Buscar ferramenta ou notícia" className="h-full w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
    </Form>
  );
}

export function SiteHeader() {
  const nav = navFor(useAvailability());
  const { pathname } = useLocation();
  const home = pathname === "/";
  return (
    <header className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-7 gap-y-3 px-4 py-3.5 sm:px-6">
      <Link to="/" aria-label="CriaSite, página inicial" className="-my-2 py-2">
        <Logo />
      </Link>

      <nav aria-label="Principal" className="hidden md:block">
        <ul className="flex flex-wrap gap-x-6 text-[15px] font-medium">
          {nav.map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} className={({ isActive }) => cx("inline-flex min-h-11 items-center", isActive ? "text-glow" : "text-moon-muted hover:text-moon")}>
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {!home && <TopSearch id="busca-topo" className="ml-auto hidden w-full max-w-[300px] sm:flex" />}

      {/* Menu do celular: <details> funciona sem JavaScript. key fecha ao trocar de página. */}
      <details key={pathname} className="group ml-auto md:hidden sm:ml-0">
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-night-line-2 px-3 text-sm font-bold text-moon [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="text-glow">
            ≡
          </span>
          Menu
        </summary>
        <div className="absolute inset-x-0 z-40 mt-3 border-y border-night-line bg-night px-4 pt-2 pb-5 shadow-2xl">
          <TopSearch id="busca-menu" className="mt-2 flex" />
          <ul className="mt-2 grid grid-cols-2 gap-1">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} className={({ isActive }) => cx("flex min-h-11 items-center rounded-lg px-3 font-semibold", isActive ? "bg-night-3 text-glow" : "text-moon")}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </header>
  );
}
