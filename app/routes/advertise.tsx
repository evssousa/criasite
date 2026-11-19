// Mídia kit do CriaSite (/anuncie). Conteúdo em app/lib/media-kit/data.ts; tela em components/MediaKit.tsx. Ver docs/midia-kit.md.
import type { Route } from "./+types/advertise";
import { MEDIA_KIT_TOC, MediaKitPrintHeader, MediaKitView } from "~/components/MediaKit";
import { StaticPage } from "~/components/StaticPage";
import { getInventory } from "~/lib/content.server";
import { MEDIA_KIT } from "~/lib/media-kit/data";
import { resolveMetrics, todayInBrazil } from "~/lib/media-kit/rules";
import type { MediaKitMetric } from "~/lib/media-kit/types";
import { seo } from "~/lib/seo";

export async function loader() {
  return { inventory: await getInventory(), today: todayInBrazil() };
}

export function meta(_: Route.MetaArgs) {
  return [
    ...seo({
      title: "Anuncie: mídia kit, formatos e regras",
      description: "Mídia kit do CriaSite: quem lê, números com fonte e data, formatos de patrocínio marcados e o que não aceitamos. Fale com a equipe pelo e-mail.",
      path: "/anuncie",
    }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: MEDIA_KIT.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    },
  ];
}

export default function Advertise({ loaderData }: Route.ComponentProps) {
  const { inventory, today } = loaderData;
  // Números automáticos: contagem do próprio site, só com banco (nunca do mock).
  const auto: MediaKitMetric[] = inventory
    ? [
        { id: "tools", label: "Ferramentas gratuitas no ar", value: inventory.tools, period: "hoje", source: "Contagem do próprio site", updatedAt: today },
        { id: "guides", label: "Guias publicados", value: inventory.guides, period: "hoje", source: "Contagem do próprio site", updatedAt: today },
        { id: "news", label: "Notícias publicadas", value: inventory.news, period: "hoje", source: "Contagem do próprio site", updatedAt: today },
      ]
    : [];
  const rows = resolveMetrics(auto, MEDIA_KIT.metrics, today, MEDIA_KIT.validDays);
  return (
    <StaticPage
      path="/anuncie"
      title="Anuncie no CriaSite"
      lead="Mídia kit com quem lê, números com fonte e data, formatos marcados e as regras que valem para todo patrocínio."
      toc={MEDIA_KIT_TOC}
      printHeader={<MediaKitPrintHeader kit={MEDIA_KIT} />}
    >
      <MediaKitView kit={MEDIA_KIT} rows={rows} inventory={inventory} today={today} />
    </StaticPage>
  );
}
