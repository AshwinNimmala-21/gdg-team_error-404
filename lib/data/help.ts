import type { HelpLink, Jurisdiction } from "@/lib/types";

// Every URL was fetched and confirmed live on 2026-10-24 (docs/research/help-links.md).

export const FTC_SCAMS = "https://consumer.ftc.gov/articles/rental-listing-scams";
export const FTC_REPORT = "https://reportfraud.ftc.gov/";
export const FTC_PAID_SCAMMER = "https://consumer.ftc.gov/articles/what-do-if-you-were-scammed";
export const DC_OAG_ALERT = "https://oag.dc.gov/blog/consumer-alert-looking-place-rent-dc-watch-out";

const BY_JURISDICTION: Record<Jurisdiction, HelpLink[]> = {
  VA: [
    { label: "Virginia landlord-tenant handbook (DHCD)", url: "https://www.dhcd.virginia.gov/landlord-tenant-resources" },
    { label: "Virginia Law Help: before you sign a lease", url: "https://www.virginialawhelp.org/node/711" },
    { label: "Free legal aid in Virginia (866-534-5243)", url: "https://www.virginialawhelp.org/get-legal-help" },
  ],
  DC: [
    { label: "DC Office of the Tenant Advocate (202-719-6560)", url: "https://ota.dc.gov/" },
    { label: "Legal Aid DC (202-628-1161)", url: "https://www.legalaiddc.org/how-to-apply-for-help" },
    {
      label: "DC Bar Landlord Tenant Resource Center",
      url: "https://dcbar.org/pro-bono/free-legal-help/help-for-individuals/landlord-tenant-resource-center",
    },
  ],
  MD: [
    { label: "Maryland Attorney General: landlord-tenant disputes", url: "https://oag.maryland.gov/i-need-to/Pages/landlord-tenant-disputes.aspx" },
    { label: "Maryland Legal Aid (888-465-2468)", url: "https://www.mdlab.org/" },
  ],
};

const ALWAYS: HelpLink[] = [
  { label: "Report a rental scam to the FTC", url: FTC_REPORT },
  { label: "Already paid? FTC steps to try to get money back", url: FTC_PAID_SCAMMER },
];

const VT: HelpLink[] = [
  { label: "Virginia Tech Student Legal Services (540-231-4720)", url: "https://legal.uss.vt.edu/" },
];

export function helpLinksFor(jurisdiction: Jurisdiction | null, zip: string | null): HelpLink[] {
  const local = jurisdiction ? BY_JURISDICTION[jurisdiction] : [...BY_JURISDICTION.VA.slice(0, 1), BY_JURISDICTION.DC[0], BY_JURISDICTION.MD[0]];
  const vt = zip?.startsWith("240") || zip?.startsWith("241") ? VT : [];
  return [...local, ...vt, ...ALWAYS];
}
