import { guideMetadata } from "./content/page-copy";
import { siteMetadata } from "./content/site";
import type { SupportPage } from "./content/support-pages";
import { audienceNotes, referenceLinks } from "./content/training";
import {
  indexableTrainerRoutes,
  type TrainerRoute,
} from "./content/trainer-routes";
import type { LegalPageContent } from "./content/legal";

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
    "@type": "Organization",
    "@id": getOrganizationId(site),
    name: siteMetadata.name,
    alternateName: siteMetadata.alternateName,
    url: appUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 192,
      height: 192,
    },
    image: imageUrl,
    description: siteMetadata.entityDescription,
    sameAs: siteMetadata.sameAs,
  };
};

const buildWebsiteStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);

  return {
    "@type": "WebSite",
    "@id": `${appUrl}#website`,
    name: siteMetadata.name,
    alternateName: siteMetadata.alternateName,
    url: appUrl,
    description: siteMetadata.shortDescription,
    inLanguage: "en",
    publisher: {
      "@id": getOrganizationId(site),
    },
  };
};

const buildAppStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@type": "WebApplication",
    "@id": getSoftwareId(site),
    name: siteMetadata.name,
    url: appUrl,
    image: imageUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any modern browser",
    browserRequirements: "Requires JavaScript and a modern browser.",
    isAccessibleForFree: true,
    publisher: {
      "@id": getOrganizationId(site),
    },
    creator: {
      "@id": getOrganizationId(site),
    },
    license: siteMetadata.licenseUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing.md", site),
    },
    description: siteMetadata.description,
    audience: audienceNotes.map((audienceNote) => ({
      "@type": "Audience",
      audienceType: audienceNote.title,
    })),
    featureList: [
      "Smooth Pursuit visual tracking drill",
      "Reaction Jumps quick refocus drill",
      "Multiple Distractions distractor tracking drill",
      "Lilac Chaser fixation and peripheral awareness drill",
      "Adjustable speed, target size, color, opacity, trail, shape, and path",
    ],
    sameAs: siteMetadata.sameAs,
  };
};

type WebPageNodeInput = {
  site: URL;
  pageUrl: string;
  name: string;
  headline: string;
  description: string;
  image?: string;
  citation?: readonly string[];
  aboutSoftware?: boolean;
  mainEntity?: Record<string, string>;
};

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
  "@type": "WebPage",
  "@id": `${pageUrl}#webpage`,
  name,
  headline,
  url: pageUrl,
  description,
  ...(image ? { image } : {}),
  inLanguage: "en",
  publisher: {
    "@id": getOrganizationId(site),
  },
  ...(citation ? { citation } : {}),
  isPartOf: {
    "@id": `${absoluteUrl("/", site)}#website`,
  },
  ...(aboutSoftware
    ? {
        about: {
          "@id": getSoftwareId(site),
        },
      }
    : {}),
  ...(mainEntity ? { mainEntity } : {}),
});

const buildBreadcrumbNode = (site: URL, pageUrl: string, pageName: string) => ({
  "@type": "BreadcrumbList",
  "@id": `${pageUrl}#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: siteMetadata.name,
      item: absoluteUrl("/", site),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: pageName,
      item: pageUrl,
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
      site,
      pageUrl: appUrl,
      name: siteMetadata.title,
      headline: siteMetadata.title,
      description: siteMetadata.description,
      image: imageUrl,
      aboutSoftware: false,
      mainEntity: {
        "@id": getSoftwareId(site),
      },
    }),
  ]);
};

export const buildGuideStructuredData = (site: URL) => {
  const guideUrl = absoluteUrl("/guide/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildPageGraph([
    buildWebPageNode({
      site,
      pageUrl: guideUrl,
      name: guideMetadata.title,
      headline: guideMetadata.title,
      description: guideMetadata.description,
      image: imageUrl,
      citation: referenceLinks.map((referenceLink) => referenceLink.url),
    }),
    {
      "@type": "ItemList",
      "@id": `${guideUrl}#routes`,
      name: "FoveaFlow practice routes",
      itemListElement: indexableTrainerRoutes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: route.label,
        url: absoluteUrl(route.path, site),
        description: route.description,
      })),
    },
    buildBreadcrumbNode(site, guideUrl, "Guide"),
  ]);
};

export const buildSupportPageStructuredData = (
  page: SupportPage,
  site: URL,
) => {
  const pageUrl = absoluteUrl(page.path, site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildPageGraph([
    buildWebPageNode({
      site,
      pageUrl,
      name: page.title,
      headline: page.heading,
      description: page.description,
      image: imageUrl,
      citation: page.sourceLink ? [page.sourceLink.href] : undefined,
    }),
    buildBreadcrumbNode(site, pageUrl, page.heading),
  ]);
};

export const buildTrainerRouteStructuredData = (
  route: TrainerRoute,
  site: URL,
) => {
  const routeUrl = absoluteUrl(route.path, site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return buildPageGraph([
    buildWebPageNode({
      site,
      pageUrl: routeUrl,
      name: route.title,
      headline: route.title,
      description: route.description,
      image: imageUrl,
    }),
    buildBreadcrumbNode(site, routeUrl, route.label),
  ]);
};

export const buildLegalStructuredData = (page: LegalPageContent, site: URL) => {
  const pageUrl = absoluteUrl(page.path, site);

  return buildPageGraph([
    buildWebPageNode({
      site,
      pageUrl,
      name: page.metaTitle,
      headline: page.title,
      description: page.description,
    }),
    buildBreadcrumbNode(site, pageUrl, page.label),
  ]);
};
