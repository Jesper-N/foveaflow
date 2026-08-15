import { siteMetadata } from "./site";
import { safetyNote } from "./training";

export const legalPageLinks = {
  privacy: {
    label: "Privacy",
    path: "/privacy/",
  },
  terms: {
    label: "Terms",
    path: "/terms/",
  },
} as const;

export const legalPages = {
  privacy: {
    ...legalPageLinks.privacy,
    description:
      "How FoveaFlow handles locally stored browser settings, Cloudflare hosting, and basic analytics.",
    lastModified: "2026-07-10",
    metaTitle: "FoveaFlow - Privacy Policy",
    sections: [
      {
        body: [
          "You do not need to create an account to use FoveaFlow. The app does not ask for your name, email address, payment details, or health records.",
          "Your practice choices are not uploaded to a FoveaFlow account because there are no accounts.",
        ],
        heading: "Data we do not collect",
        id: "data-we-do-not-collect",
      },
      {
        body: [
          "FoveaFlow stores settings locally in your browser so the app can remember them on the current device. That can include the selected language, mode, motion pattern, speed, target size, color, opacity, trail setting, viewing distance, screen scale, and theme.",
          "Those settings stay in your browser unless your browser syncs, backs up, or exports its site data. You can remove them by clearing site data for foveaflow.com.",
        ],
        heading: "Settings saved in your browser",
        id: "browser-settings",
      },
      {
        body: [
          "The site runs on Cloudflare. Cloudflare may process request data such as IP address, user agent, requested URL, and timing data to deliver the site, protect it from abuse, and show basic traffic and performance metrics.",
          "Cloudflare Web Analytics may load a small beacon script. Cloudflare says Web Analytics measures page views and performance without collecting or using visitor personal data.",
        ],
        heading: "Cloudflare hosting and analytics",
        id: "cloudflare",
        links: [
          {
            label: "Cloudflare Web Analytics",
            url: "https://www.cloudflare.com/web-analytics/",
          },
          {
            label: "Cloudflare data collection docs",
            url: "https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/",
          },
        ],
      },
      {
        body: [
          "FoveaFlow stores your language preference in local browser storage and in a same-site preference cookie so the correct language can be selected before the app starts. The cookie can last up to 400 days, uses SameSite=Lax, and is marked Secure on HTTPS.",
          "FoveaFlow does not set advertising cookies. Cloudflare may set security cookies when it needs them to keep the site available and safe.",
        ],
        heading: "Cookies",
        id: "cookies",
        links: [
          {
            label: "Cloudflare cookie reference",
            url: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/",
          },
        ],
      },
      {
        body: [
          "Data is used to run the site, keep it secure, understand whether pages load correctly, and see which public pages people use. FoveaFlow does not sell visitor data.",
        ],
        heading: "How data is used",
        id: "how-data-is-used",
      },
      {
        body: [
          "You can clear saved FoveaFlow settings from your browser's site data controls. You can also use browser or extension settings to block optional analytics scripts.",
          "If JavaScript is turned off, the moving target app will not run. The guide and policy pages still work as normal pages.",
        ],
        heading: "Your choices",
        id: "your-choices",
      },
      {
        body: [
          "FoveaFlow can be used without sending personal details. It is not built to collect personal information from children.",
        ],
        heading: "Children",
        id: "children",
      },
      {
        body: [
          "For project questions, use the GitHub repository. Do not post private information in a public issue.",
        ],
        heading: "Contact",
        id: "contact",
        links: [
          {
            label: "FoveaFlow on GitHub",
            url: siteMetadata.repositoryUrl,
          },
        ],
      },
    ],
    summary:
      "FoveaFlow is built to work without an account. The app keeps your settings in your browser and uses Cloudflare to serve the site.",
    title: "Privacy Policy",
  },
  terms: {
    ...legalPageLinks.terms,
    description:
      "The terms for using FoveaFlow, including safety limits, medical disclaimers, free access, and acceptable use.",
    lastModified: "2026-07-10",
    metaTitle: "FoveaFlow - Terms of Use",
    sections: [
      {
        body: [
          "By using FoveaFlow, you agree to these terms. If you do not agree, do not use the site.",
        ],
        heading: "Agreement",
        id: "agreement",
      },
      {
        body: [
          "FoveaFlow is a free browser tool for visual tracking practice. It shows moving targets, reaction jumps, Lilac Chaser fixation practice, and distractor tracking patterns on a screen.",
          "The patterns are simple screen paths and timing drills. They are not a clinical program, and results will vary from person to person.",
        ],
        heading: "What the app is",
        id: "what-the-app-is",
      },
      {
        body: [
          "FoveaFlow is not medical advice, diagnosis, treatment, vision therapy, or a medical device. It does not replace an optometrist, ophthalmologist, doctor, therapist, or other qualified professional.",
          safetyNote,
          "If you have a vision condition, recent eye injury, surgery, neurological symptoms, or any concern about using moving visual targets, ask a qualified professional before using the app.",
        ],
        heading: "Not medical care",
        id: "not-medical-care",
      },
      {
        body: [
          "Use the app in a safe place where you can stop easily. Do not use it while driving, walking around, operating equipment, or doing anything that needs your full attention.",
          "You choose the settings and session length. Keep sessions short if you are unsure, and take breaks.",
        ],
        heading: "Use safely",
        id: "use-safely",
      },
      {
        body: [
          "FoveaFlow is free to use. There is no account, paid plan, subscription, or in-app purchase.",
        ],
        heading: "Free access",
        id: "free-access",
      },
      {
        body: [
          "Do not attack, overload, scrape aggressively, or try to gain unauthorized access to the site or its infrastructure.",
        ],
        heading: "Acceptable use",
        id: "acceptable-use",
      },
      {
        body: [
          "The source code is public on GitHub under the license in the repository. These terms cover use of the hosted FoveaFlow site.",
        ],
        heading: "Source code",
        id: "open-source",
        links: [
          {
            label: "FoveaFlow on GitHub",
            url: siteMetadata.repositoryUrl,
          },
        ],
      },
      {
        body: [
          "The site is provided as is. It may change, break, or go offline. To the fullest extent allowed by law, FoveaFlow is provided without warranties of any kind.",
        ],
        heading: "Availability and warranty",
        id: "availability",
      },
      {
        body: [
          "These terms may be updated when the app or site changes. The date at the top shows the latest version.",
        ],
        heading: "Changes to these terms",
        id: "changes",
      },
    ],
    summary:
      "FoveaFlow is a free browser tool. Use it safely, stop if it feels bad, and do not treat it as medical care.",
    title: "Terms of Use",
  },
} as const;

export type LegalPageContent = (typeof legalPages)[keyof typeof legalPages];
