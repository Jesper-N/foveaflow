import type { LegalPageContent } from "./content/legal";
import { guideMetadata } from "./content/page-copy";
import { siteMetadata } from "./content/site";
import type { SupportPage } from "./content/support-pages";
import { indexableTrainerRoutes } from "./content/trainer-routes";
import type { TrainerRoute } from "./content/trainer-routes";
import { audienceNotes, referenceLinks } from "./content/training";

const defaultSiteUrl = "https://foveaflow.com";

export const getSiteOrigin = (site: URL | undefined) => {
  const siteUrl = site ?? new URL(defaultSiteUrl);
  return new URL(siteUrl.origin);
};

export const absoluteUrl = (path: string, site: URL) =>
  new URL(path, site).toString();

const getOrganizationId = (site: URL) =>
  `${absoluteUrl("/", site)}#organization`;

const getSoftwareId = (site: URL) => `${absoluteUrl("/", site)}#software`;

const buildOrganizationStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);
  const logoUrl = absoluteUrl("/metadata/android-chrome-192x192.png", site);

  return {
    "@id": getOrganizationId(site),
    "@type": "Organization",
    alternateName: siteMetadata.alternateName,
    description: siteMetadata.entityDescription,
    image: imageUrl,
    logo: {
      "@type": "ImageObject",
      height: 192,
      url: logoUrl,
      width: 192,
    },
    name: siteMetadata.name,
    sameAs: siteMetadata.sameAs,
    url: appUrl,
  };
};

const buildWebsiteStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);

  return {
    "@id": `${appUrl}#website`,
    "@type": "WebSite",
    alternateName: siteMetadata.alternateName,
    description: siteMetadata.shortDescription,
    inLanguage: "en",
    name: siteMetadata.name,
    publisher: {
      "@id": getOrganizationId(site),
    },
    url: appUrl,
  };
};

const buildAppStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@id": getSoftwareId(site),
    "@type": "WebApplication",
    applicationCategory: "HealthApplication",
    audience: audienceNotes.map((audienceNote) => ({
      "@type": "Audience",
      audienceType: audienceNote.title,
    })),
    browserRequirements: "Requires JavaScript and a modern browser.",
    creator: {
      "@id": getOrganizationId(site),
    },
    description: siteMetadata.description,
    featureList: [
      "Smooth Pursuit visual tracking drill",
      "Reaction Jumps quick refocus drill",
      "Multiple Distractions distractor tracking drill",
      "Lilac Chaser fixation and peripheral awareness drill",
      "Adjustable speed, target size, color, opacity, trail, shape, and path",
    ],
    image: imageUrl,
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
    publisher: {
      "@id": getOrganizationId(site),
    },
    sameAs: siteMetadata.sameAs,
    url: appUrl,
  };
};

interface WebPageNodeInput {
  site: URL;
  pageUrl: string;
  name: string;
  headline: string;
  description: string;
  image?: string;
  citation?: readonly string[];
  aboutSoftware?: boolean;
  mainEntity?: Record<string, string>;
}

const buildWebPageNode = ({
  site,
  pageUrl,
  name,
  headline,
  description,
  image,
  citation,
  aboutSoftware = true,
  mainEntity,
}: WebPageNodeInput) => ({
  "@id": `${pageUrl}#webpage`,
  "@type": "WebPage",
  about: aboutSoftware
    ? {
        "@id": getSoftwareId(site),
      }
    : undefined,
  citation,
  description,
  headline,
  image,
  inLanguage: "en",
  isPartOf: {
    "@id": `${absoluteUrl("/", site)}#website`,
  },
  mainEntity,
  name,
  publisher: {
    "@id": getOrganizationId(site),
  },
  url: pageUrl,
});

const buildBreadcrumbNode = (site: URL, pageUrl: string, pageName: string) => ({
  "@id": `${pageUrl}#breadcrumb`,
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      item: absoluteUrl("/", site),
      name: siteMetadata.name,
      position: 1,
    },
    {
      "@type": "ListItem",
      item: pageUrl,
      name: pageName,
      position: 2,
    },
  ],
});

const buildStructuredGraph = (site: URL, nodes: readonly unknown[]) => ({
  "@context": "https://schema.org",
  "@graph": [
    buildWebsiteStructuredData(site),
    buildOrganizationStructuredData(site),
    buildAppStructuredData(site),
    ...nodes,
  ],
});

const buildPageGraph = (nodes: readonly unknown[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

export const buildStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildStructuredGraph(site, [
    buildWebPageNode({
      aboutSoftware: false,
      description: siteMetadata.description,
      headline: siteMetadata.title,
      image: imageUrl,
      mainEntity: {
        "@id": getSoftwareId(site),
      },
      name: siteMetadata.title,
      pageUrl: appUrl,
      site,
    }),
  ]);
};

export const buildGuideStructuredData = (site: URL) => {
  const guideUrl = absoluteUrl("/guide/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildPageGraph([
    buildWebPageNode({
      citation: referenceLinks.map((referenceLink) => referenceLink.url),
      description: guideMetadata.description,
      headline: guideMetadata.title,
      image: imageUrl,
      name: guideMetadata.title,
      pageUrl: guideUrl,
      site,
    }),
    {
      "@id": `${guideUrl}#routes`,
      "@type": "ItemList",
      itemListElement: indexableTrainerRoutes.map((route, index) => ({
        "@type": "ListItem",
        description: route.description,
        name: route.label,
        position: index + 1,
        url: absoluteUrl(route.path, site),
      })),
      name: "FoveaFlow practice routes",
    },
    buildBreadcrumbNode(site, guideUrl, "Guide"),
  ]);
};

export const buildSupportPageStructuredData = (
  page: SupportPage,
  site: URL
) => {
  const pageUrl = absoluteUrl(page.path, site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildPageGraph([
    buildWebPageNode({
      citation: page.sourceLink ? [page.sourceLink.href] : undefined,
      description: page.description,
      headline: page.heading,
      image: imageUrl,
      name: page.title,
      pageUrl,
      site,
    }),
    buildBreadcrumbNode(site, pageUrl, page.heading),
  ]);
};

export const buildTrainerRouteStructuredData = (
  route: TrainerRoute,
  site: URL
) => {
  const routeUrl = absoluteUrl(route.path, site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildPageGraph([
    buildWebPageNode({
      description: route.description,
      headline: route.title,
      image: imageUrl,
      name: route.title,
      pageUrl: routeUrl,
      site,
    }),
    buildBreadcrumbNode(site, routeUrl, route.label),
  ]);
};

export const buildLegalStructuredData = (page: LegalPageContent, site: URL) => {
  const pageUrl = absoluteUrl(page.path, site);

  return buildPageGraph([
    buildWebPageNode({
      description: page.description,
      headline: page.title,
      name: page.metaTitle,
      pageUrl,
      site,
    }),
    buildBreadcrumbNode(site, pageUrl, page.label),
  ]);
};
