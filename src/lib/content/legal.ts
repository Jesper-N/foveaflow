import { siteMetadata } from "./site";
import { safetyNote } from "./training";

export const legalPageLinks = {
  privacy: {
    path: "/privacy/",
    label: "Privacy",
  },
  terms: {
    path: "/terms/",
    label: "Terms",
  },
} as const;

export const legalPages = {
  privacy: {
    ...legalPageLinks.privacy,
    metaTitle: "Privacy Policy | Eye Trainer",
    title: "Privacy Policy",
    description:
      "How Eye Trainer handles locally stored browser settings, Cloudflare hosting, and basic analytics.",
    summary:
      "Eye Trainer is built to work without an account. The app keeps your settings in your browser and uses Cloudflare to serve the site.",
    sections: [
      {
        id: "data-we-do-not-collect",
        heading: "Data we do not collect",
        body: [
          "You do not need to create an account to use Eye Trainer. The app does not ask for your name, email address, payment details, or health records.",
          "Your practice choices are not uploaded to an Eye Trainer account because there are no accounts.",
        ],
      },
      {
        id: "browser-settings",
        heading: "Settings saved in your browser",
        body: [
          "Eye Trainer stores settings locally in your browser so the app can remember them on the current device. That can include the selected mode, motion pattern, speed, target size, color, opacity, trail setting, viewing distance, screen scale, and theme.",
          "Those settings stay in your browser unless your browser syncs, backs up, or exports its site data. You can remove them by clearing site data for eye-trainer.app.",
        ],
      },
      {
        id: "cloudflare",
        heading: "Cloudflare hosting and analytics",
        body: [
          "The site runs on Cloudflare. Cloudflare may process request data such as IP address, user agent, requested URL, and timing data to deliver the site, protect it from abuse, and show basic traffic and performance metrics.",
          "Cloudflare Web Analytics may load a small beacon script. Cloudflare says Web Analytics measures page views and performance without collecting or using visitor personal data.",
        ],
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
        id: "cookies",
        heading: "Cookies",
        body: [
          "Eye Trainer does not set advertising cookies. Cloudflare may set security cookies when it needs them to keep the site available and safe.",
        ],
        links: [
          {
            label: "Cloudflare cookie reference",
            url: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/",
          },
        ],
      },
      {
        id: "how-data-is-used",
        heading: "How data is used",
        body: [
          "Data is used to run the site, keep it secure, understand whether pages load correctly, and see which public pages people use. Eye Trainer does not sell visitor data.",
        ],
      },
      {
        id: "your-choices",
        heading: "Your choices",
        body: [
          "You can clear saved Eye Trainer settings from your browser's site data controls. You can also use browser or extension settings to block optional analytics scripts.",
          "If JavaScript is turned off, the moving target app will not run. The guide and policy pages still work as normal pages.",
        ],
      },
      {
        id: "children",
        heading: "Children",
        body: [
          "Eye Trainer can be used without sending personal details. It is not built to collect personal information from children.",
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        body: [
          "For project questions, use the GitHub repository. Do not post private information in a public issue.",
        ],
        links: [
          {
            label: "Eye Trainer on GitHub",
            url: siteMetadata.repositoryUrl,
          },
        ],
      },
    ],
  },
  terms: {
    ...legalPageLinks.terms,
    metaTitle: "Terms of Use | Eye Trainer",
    title: "Terms of Use",
    description:
      "The terms for using Eye Trainer, including safety limits, medical disclaimers, free access, and acceptable use.",
    summary:
      "Eye Trainer is a free browser tool. Use it safely, stop if it feels bad, and do not treat it as medical care.",
    sections: [
      {
        id: "agreement",
        heading: "Agreement",
        body: [
          "By using Eye Trainer, you agree to these terms. If you do not agree, do not use the site.",
        ],
      },
      {
        id: "what-the-app-is",
        heading: "What the app is",
        body: [
          "Eye Trainer is a free browser tool for visual tracking practice. It shows moving targets, reaction jumps, Lilac Chaser fixation practice, and distractor tracking patterns on a screen.",
          "The patterns are simple screen paths and timing drills. They are not a clinical program, and results will vary from person to person.",
        ],
      },
      {
        id: "not-medical-care",
        heading: "Not medical care",
        body: [
          "Eye Trainer is not medical advice, diagnosis, treatment, vision therapy, or a medical device. It does not replace an optometrist, ophthalmologist, doctor, therapist, or other qualified professional.",
          safetyNote,
          "If you have a vision condition, recent eye injury, surgery, neurological symptoms, or any concern about using moving visual targets, ask a qualified professional before using the app.",
        ],
      },
      {
        id: "use-safely",
        heading: "Use safely",
        body: [
          "Use the app in a safe place where you can stop easily. Do not use it while driving, walking around, operating equipment, or doing anything that needs your full attention.",
          "You choose the settings and session length. Keep sessions short if you are unsure, and take breaks.",
        ],
      },
      {
        id: "free-access",
        heading: "Free access",
        body: [
          "Eye Trainer is free to use. There is no account, paid plan, subscription, or in-app purchase.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        body: [
          "Do not attack, overload, scrape aggressively, or try to gain unauthorized access to the site or its infrastructure.",
        ],
      },
      {
        id: "open-source",
        heading: "Source code",
        body: [
          "The source code is public on GitHub under the license in the repository. These terms cover use of the hosted Eye Trainer site.",
        ],
        links: [
          {
            label: "Eye Trainer on GitHub",
            url: siteMetadata.repositoryUrl,
          },
        ],
      },
      {
        id: "availability",
        heading: "Availability and warranty",
        body: [
          "The site is provided as is. It may change, break, or go offline. To the fullest extent allowed by law, Eye Trainer is provided without warranties of any kind.",
        ],
      },
      {
        id: "changes",
        heading: "Changes to these terms",
        body: [
          "These terms may be updated when the app or site changes. The date at the top shows the latest version.",
        ],
      },
    ],
  },
} as const;

export type LegalPageContent = (typeof legalPages)[keyof typeof legalPages];
