import { guideFaqItems, guideMetadata } from "./content/page-copy";
import { siteMetadata } from "./content/site";
import type { SupportPage } from "./content/support-pages";
import { audienceNotes, referenceLinks } from "./content/training";
import {
  indexableTrainerRoutes,
  type TrainerRoute,
} from "./content/trainer-routes";
import type { LegalPageContent } from "./content/legal";

export const defaultSiteUrl = "https://foveaflow.com";

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
  const logoUrl = absoluteUrl("/metadata/favicon-96x96.png", site);

  return {
    "@type": "Organization",
    "@id": getOrganizationId(site),
    name: siteMetadata.name,
    alternateName: siteMetadata.alternateName,
    url: appUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 96,
      height: 96,
    },
    image: imageUrl,
    description: siteMetadata.entityDescription,
    sameAs: siteMetadata.sameAs,
    knowsAbout: siteMetadata.keywords,
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
    keywords: siteMetadata.keywords.join(", "),
    publisher: {
      "@id": getOrganizationId(site),
    },
  };
};

const buildAppStructuredData = (site: URL) => {
  const appUrl = absoluteUrl("/", site);
  const imageUrl = absoluteUrl(siteMetadata.imagePath, site);

  return {
    "@type": "SoftwareApplication",
    "@id": getSoftwareId(site),
    name: siteMetadata.name,
    url: appUrl,
    image: imageUrl,
    applicationCategory: "WebApplication",
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
    keywords: siteMetadata.keywords.join(", "),
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
    dateModified: siteMetadata.lastUpdated,
    sameAs: siteMetadata.sameAs,
    citation: referenceLinks.map((referenceLink) => referenceLink.url),
  };
};

type WebPageNodeInput = {
  site: URL;
  pageUrl: string;
  name: string;
  headline: string;
  description: string;
  image?: string;
  keywords?: string | null;
  dateModified?: string;
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
  keywords = siteMetadata.keywords.join(", "),
  dateModified = siteMetadata.lastUpdated,
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
  ...(keywords === null ? {} : { keywords }),
  dateModified,
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

const buildStructuredGraph = (
  site: URL,
  nodes: readonly unknown[],
  { includeApp = true } = {},
) => ({
  "@context": "https://schema.org",
  "@graph": [
    buildWebsiteStructuredData(site),
    buildOrganizationStructuredData(site),
    ...(includeApp ? [buildAppStructuredData(site)] : []),
    ...nodes,
  ],
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

  return buildStructuredGraph(site, [
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
      "@type": "FAQPage",
      "@id": `${guideUrl}#faq`,
      isPartOf: {
        "@id": `${guideUrl}#webpage`,
      },
      mainEntity: guideFaqItems.map((faqItem) => ({
        "@type": "Question",
        name: faqItem.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqItem.answer,
        },
      })),
    },
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

  return buildStructuredGraph(site, [
    buildWebPageNode({
      site,
      pageUrl,
      name: page.title,
      headline: page.heading,
      description: page.description,
      image: imageUrl,
      citation: page.sourceLink
        ? [page.sourceLink.href, ...referenceLinks.map((link) => link.url)]
        : referenceLinks.map((link) => link.url),
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

  return buildStructuredGraph(site, [
    buildWebPageNode({
      site,
      pageUrl: routeUrl,
      name: route.title,
      headline: route.title,
      description: route.description,
      image: imageUrl,
      citation: referenceLinks.map((referenceLink) => referenceLink.url),
    }),
    buildBreadcrumbNode(site, routeUrl, route.label),
  ]);
};

export const buildLegalStructuredData = (page: LegalPageContent, site: URL) => {
  const pageUrl = absoluteUrl(page.path, site);

  return buildStructuredGraph(
    site,
    [
      buildWebPageNode({
        site,
        pageUrl,
        name: page.metaTitle,
        headline: page.title,
        description: page.description,
        keywords: null,
      }),
      buildBreadcrumbNode(site, pageUrl, page.label),
    ],
    { includeApp: false },
  );
};
