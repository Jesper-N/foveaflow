// schema.org JSON-LD for search engines. Every page links into one graph
// through stable `@id`s: the website, the organization, and the app.
import type { Article } from "$lib/content/articles";
import { indexableDrillRoutes } from "$lib/content/drill-routes";
import type { DrillRoute } from "$lib/content/drill-routes";
import { audiences, referenceLinks, guideMetadata } from "$lib/content/guide";
import type { LegalPage } from "$lib/content/legal";
import { siteMetadata } from "$lib/content/site";

import { absoluteUrl } from "./site-url";

const organizationId = (site: URL) => `${absoluteUrl("/", site)}#organization`;
const websiteId = (site: URL) => `${absoluteUrl("/", site)}#website`;
const softwareId = (site: URL) => `${absoluteUrl("/", site)}#software`;

const organizationNode = (site: URL) => ({
  "@id": organizationId(site),
  "@type": "Organization",
  alternateName: siteMetadata.alternateName,
  description: siteMetadata.entityDescription,
  image: absoluteUrl(siteMetadata.imagePath, site),
  logo: {
    "@type": "ImageObject",
    height: 192,
    url: absoluteUrl("/metadata/android-chrome-192x192.png", site),
    width: 192,
  },
  name: siteMetadata.name,
  sameAs: siteMetadata.sameAs,
  url: absoluteUrl("/", site),
});

const websiteNode = (site: URL) => ({
  "@id": websiteId(site),
  "@type": "WebSite",
  alternateName: siteMetadata.alternateName,
  description: siteMetadata.shortDescription,
  inLanguage: "en",
  name: siteMetadata.name,
  publisher: { "@id": organizationId(site) },
  url: absoluteUrl("/", site),
});

const appNode = (site: URL) => ({
  "@id": softwareId(site),
  "@type": "WebApplication",
  applicationCategory: "HealthApplication",
  audience: audiences.map((audience) => ({
    "@type": "Audience",
    audienceType: audience.title,
  })),
  browserRequirements: "Requires JavaScript and a modern browser.",
  creator: { "@id": organizationId(site) },
  description: siteMetadata.description,
  featureList: [
    "Smooth Pursuit visual tracking drill",
    "Reaction Jumps quick refocus drill",
    "Multiple Distractions distractor tracking drill",
    "Lilac Chaser fixation and peripheral awareness drill",
    "Adjustable speed, target size, color, opacity, trail, shape, and path",
  ],
  image: absoluteUrl(siteMetadata.imagePath, site),
  isAccessibleForFree: true,
  license: siteMetadata.licenseUrl,
  name: siteMetadata.name,
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    price: "0",
    priceCurrency: "USD",
    url: absoluteUrl("/pricing.md", site),
  },
  operatingSystem: "Any modern browser",
  publisher: { "@id": organizationId(site) },
  sameAs: siteMetadata.sameAs,
  url: absoluteUrl("/", site),
});

interface WebPageInput {
  site: URL;
  pageUrl: string;
  name: string;
  headline: string;
  description: string;
  image?: string;
  citation?: readonly string[];
  /** Pages describe the app unless the page itself is the app. */
  aboutApp?: boolean;
  mainEntity?: Record<string, string>;
}

const webPageNode = ({
  site,
  pageUrl,
  name,
  headline,
  description,
  image,
  citation,
  aboutApp = true,
  mainEntity,
}: WebPageInput) => ({
  "@id": `${pageUrl}#webpage`,
  "@type": "WebPage",
  about: aboutApp ? { "@id": softwareId(site) } : undefined,
  citation,
  description,
  headline,
  image,
  inLanguage: "en",
  isPartOf: { "@id": websiteId(site) },
  mainEntity,
  name,
  publisher: { "@id": organizationId(site) },
  url: pageUrl,
});

const breadcrumbNode = (site: URL, pageUrl: string, pageName: string) => ({
  "@id": `${pageUrl}#breadcrumb`,
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      item: absoluteUrl("/", site),
      name: siteMetadata.name,
      position: 1,
    },
    { "@type": "ListItem", item: pageUrl, name: pageName, position: 2 },
  ],
});

const graph = (nodes: readonly unknown[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

export type StructuredData = ReturnType<typeof graph>;

/** The homepage also defines the shared website, organization, and app nodes. */
export const homeStructuredData = (site: URL) =>
  graph([
    websiteNode(site),
    organizationNode(site),
    appNode(site),
    webPageNode({
      aboutApp: false,
      description: siteMetadata.description,
      headline: siteMetadata.title,
      image: absoluteUrl(siteMetadata.imagePath, site),
      mainEntity: { "@id": softwareId(site) },
      name: siteMetadata.title,
      pageUrl: absoluteUrl("/", site),
      site,
    }),
  ]);

export const guideStructuredData = (site: URL) => {
  const guideUrl = absoluteUrl("/guide/", site);
  return graph([
    webPageNode({
      citation: referenceLinks.map((reference) => reference.url),
      description: guideMetadata.description,
      headline: guideMetadata.title,
      image: absoluteUrl(siteMetadata.imagePath, site),
      name: guideMetadata.title,
      pageUrl: guideUrl,
      site,
    }),
    {
      "@id": `${guideUrl}#routes`,
      "@type": "ItemList",
      itemListElement: indexableDrillRoutes.map((route, index) => ({
        "@type": "ListItem",
        description: route.description,
        name: route.label,
        position: index + 1,
        url: absoluteUrl(route.path, site),
      })),
      name: "FoveaFlow practice routes",
    },
    breadcrumbNode(site, guideUrl, "Guide"),
  ]);
};

export const articleStructuredData = (article: Article, site: URL) => {
  const pageUrl = absoluteUrl(article.path, site);
  return graph([
    webPageNode({
      citation: article.comparison
        ? [article.comparison.source.href]
        : undefined,
      description: article.description,
      headline: article.heading,
      image: absoluteUrl(siteMetadata.imagePath, site),
      name: article.title,
      pageUrl,
      site,
    }),
    breadcrumbNode(site, pageUrl, article.heading),
  ]);
};

export const drillRouteStructuredData = (route: DrillRoute, site: URL) => {
  const pageUrl = absoluteUrl(route.path, site);
  return graph([
    webPageNode({
      description: route.description,
      headline: route.title,
      image: absoluteUrl(siteMetadata.imagePath, site),
      name: route.title,
      pageUrl,
      site,
    }),
    breadcrumbNode(site, pageUrl, route.label),
  ]);
};

export const legalStructuredData = (page: LegalPage, site: URL) => {
  const pageUrl = absoluteUrl(page.path, site);
  return graph([
    webPageNode({
      description: page.description,
      headline: page.title,
      name: page.metaTitle,
      pageUrl,
      site,
    }),
    breadcrumbNode(site, pageUrl, page.label),
  ]);
};
