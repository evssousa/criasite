import { Link } from "react-router";
import { StaticPage } from "~/components/StaticPage";
import { navFor, toolsFor, useAvailability } from "~/lib/availability";
import { seo } from "~/lib/seo";
import { DOC_PAGES, SECTIONS } from "~/lib/site";

export const meta = () => seo({ title: "Mapa do site", description: "Todas as seções, ferramentas e páginas institucionais do CriaSite.", path: "/mapa-do-site" });

export default function SitemapPage() {
  const available = useAvailability();
  const groups = [
    { title: "Seções", links: [{ to: "/", label: "Início" }, ...navFor(available)] },
    { title: "Editorias", links: SECTIONS.filter((s) => available.sections.includes(s.slug)).map((s) => ({ to: `/${s.slug}`, label: s.label })) },
    { title: "Ferramentas", links: toolsFor(available).map((t) => ({ to: `/ferramentas/${t.slug}`, label: t.title })) },
    { title: "Institucional e legal", links: DOC_PAGES },
  ];
  return (
    <StaticPage path="/mapa-do-site" title="Mapa do site" lead="Tudo o que existe no CriaSite, em uma página.">
      <div className="grid gap-6 sm:grid-cols-2">
        {groups
          .filter((g) => g.links.length)
          .map((g) => (
            <section key={g.title} className="rounded-[22px] border border-line bg-card p-5">
              <h2 className="text-base font-extrabold">{g.title}</h2>
              <ul className="mt-2">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="flex min-h-11 items-center border-b border-line text-[15px] hover:text-violet">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </StaticPage>
  );
}
