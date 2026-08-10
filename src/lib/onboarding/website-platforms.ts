import type { WebsitePlatform } from "@/lib/types/database";

export const WEBSITE_PLATFORMS: Array<{
  id: WebsitePlatform;
  label: string;
  instructions: string[];
}> = [
  {
    id: "wordpress",
    label: "WordPress",
    instructions: [
      "Log in to your WordPress admin dashboard.",
      "Go to Users → Add New.",
      "Invite or create an Administrator or Editor account for the JMCG team email provided by your account manager.",
      "Send confirmation that access was granted, then mark this step complete below.",
    ],
  },
  {
    id: "webflow",
    label: "Webflow",
    instructions: [
      "Open your Webflow site settings.",
      "Go to Site → Members / Workspace members.",
      "Invite the JMCG team email as a site member with Designer or Editor access as instructed.",
      "Mark this step complete after the invite is sent.",
    ],
  },
  {
    id: "shopify",
    label: "Shopify",
    instructions: [
      "In Shopify Admin, open Settings → Users and permissions.",
      "Add staff member using the JMCG team email.",
      "Grant store permissions needed for marketing and content updates.",
      "Mark this step complete after the invite is accepted or sent.",
    ],
  },
  {
    id: "squarespace",
    label: "Squarespace",
    instructions: [
      "Open Settings → Permissions / Contributor permissions.",
      "Invite the JMCG team email as a contributor.",
      "Choose Admin or Website Editor access as directed by JMCG.",
      "Mark this step complete after inviting JMCG.",
    ],
  },
  {
    id: "wix",
    label: "Wix",
    instructions: [
      "Open your Wix site dashboard → Site & App → Roles & Permissions (or Team Management).",
      "Invite the JMCG team email with a role that can edit site content.",
      "Mark this step complete after the invitation is sent.",
    ],
  },
  {
    id: "godaddy",
    label: "GoDaddy",
    instructions: [
      "Sign in to your GoDaddy account and open the website product.",
      "Open sharing / user permissions for the site.",
      "Invite the JMCG team email with editing access, or share account collaborator access if that is how your plan works.",
      "Do not paste website passwords into OnboardBox. Prefer invite/collaborator access.",
      "Mark this step complete when access has been granted.",
    ],
  },
  {
    id: "other",
    label: "Other",
    instructions: [
      "Identify how collaborators are invited on your platform.",
      "Invite the JMCG team email using an official collaborator/staff invite when possible.",
      "If your platform only supports shared logins, contact JMCG by email/phone — do not enter passwords here.",
      "Mark this step complete after you have granted access or contacted JMCG.",
    ],
  },
  {
    id: "unknown",
    label: "I don't know",
    instructions: [
      "That's okay — many clients are unsure which platform they use.",
      "Check your hosting invoice, domain registrar, or ask whoever built the site.",
      "If you still aren't sure, email JMCG and we will help identify the platform.",
      "You can return here once you know the platform, or mark this complete after contacting JMCG.",
    ],
  },
];

export function getWebsitePlatform(id: WebsitePlatform | null) {
  return WEBSITE_PLATFORMS.find((p) => p.id === id) ?? null;
}
