import { findDrillRoute, slugFromPath } from "$lib/content/drill-routes";
import { siteMetadata } from "$lib/content/site";

import { robotsMeta } from "./robots";
import { absoluteUrl } from "./site-url";
import {
  drillRouteStructuredData,
  homeStructuredData,
} from "./structured-data";
import type { StructuredData } from "./structured-data";

const setMetaContent = (selector: string, content: string) => {
  document.head
    .querySelector<HTMLMetaElement>(selector)
    ?.setAttribute("content", content);
};

const setStructuredData = (data: StructuredData | undefined) => {
  let script = document.head.querySelector<HTMLScriptElement>(
    "script[data-seo-structured-data]"
  );
  if (!data) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoStructuredData = "";
    document.head.append(script);
  }
  script.textContent = JSON.stringify(data);
};

/**
 * Matches the head to a trainer route after the URL changed without a page
 * load, so the title, canonical link, and structured data stay correct.
 */
export const syncDocumentHead = (path: string) => {
  const route = findDrillRoute(slugFromPath(path));
  const site = new URL(window.location.origin);
  const title = route?.title ?? siteMetadata.title;
  const description = route?.description ?? siteMetadata.description;
  const ogDescription = route?.description ?? siteMetadata.ogDescription;
  const twitterDescription =
    route?.description ?? siteMetadata.twitterDescription;
  const canonicalUrl = absoluteUrl(route?.path ?? "/", site);
  const robots =
    route?.indexable === false ? robotsMeta.noindex : robotsMeta.index;

  document.title = title;
  document.head
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute("href", canonicalUrl);
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[name="robots"]', robots);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', ogDescription);
  setMetaContent('meta[property="og:url"]', canonicalUrl);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', twitterDescription);

  if (!route) {
    setStructuredData(homeStructuredData(site));
  } else if (route.indexable) {
    setStructuredData(drillRouteStructuredData(route, site));
  } else {
    setStructuredData(undefined);
  }
};
