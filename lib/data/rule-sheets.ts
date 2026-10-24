import type { ClauseType, Jurisdiction, LawRef } from "@/lib/types";

// Jurisdiction rule sheets. Every rule is from docs/research/tenant-law-dc-md-va.md (checked 2026-10-24).
// Rules marked UNVERIFIED there are left out or phrased as "ask". This is information, not legal advice.

const VA = (section: string) => `https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-${section}/`;
const DC = (section: string) => `https://code.dccouncil.gov/us/dc/council/code/sections/42-${section}`;
const MD = (section: string) =>
  `https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-${section}&enactments=false`;
const DC_OTA_BILL_OF_RIGHTS =
  "https://apia.dc.gov/sites/default/files/dc/sites/apia/publication/attachments/261018445-Bill-of-Rights.pdf";

export interface RuleSheet {
  jurisdiction: Jurisdiction;
  name: string;
  depositCapMonths: number;
  entry: { noticeRequired: true; minHours: number | null };
  lateFeeCapPercent: number;
  lateFeeMinGraceDays: number | null;
  autoRenewalMaxNoticeDays: number | null;
  attorneyFeesProhibited: boolean;
  maintenanceWaiverProhibited: boolean;
  laws: Partial<Record<ClauseType, LawRef>>;
}

export const RULE_SHEETS: Record<Jurisdiction, RuleSheet> = {
  VA: {
    jurisdiction: "VA",
    name: "Virginia",
    depositCapMonths: 2,
    entry: { noticeRequired: true, minHours: null },
    lateFeeCapPercent: 10,
    lateFeeMinGraceDays: null,
    autoRenewalMaxNoticeDays: null,
    attorneyFeesProhibited: true,
    maintenanceWaiverProhibited: false,
    laws: {
      security_deposit: {
        rule: "A landlord can't demand a security deposit of more than two months' rent.",
        citation: "Va. Code § 55.1-1226(A)",
        url: VA("1226"),
      },
      landlord_entry: {
        rule: "Except in an emergency, the landlord must give notice before entering, at reasonable times, and at least 72 hours' notice for routine maintenance you didn't ask for.",
        citation: "Va. Code § 55.1-1229(A)",
        url: VA("1229"),
      },
      late_fee: {
        rule: "A late fee can't be more than 10% of the monthly rent (or 10% of the balance owed, if less), and only if the written lease provides for it.",
        citation: "Va. Code § 55.1-1204(E)",
        url: VA("1204"),
      },
      waiver_of_rights: {
        rule: "A lease can't make you waive your rights under Virginia's landlord-tenant law or limit the landlord's legal liability to you. Such terms are unenforceable.",
        citation: "Va. Code § 55.1-1208(A)(1), (A)(5), (B)",
        url: VA("1208"),
      },
      attorney_fees: {
        rule: "A lease can't make you agree to pay the landlord's attorney fees except as Virginia's landlord-tenant law provides.",
        citation: "Va. Code § 55.1-1208(A)(4)",
        url: VA("1208"),
      },
      auto_renewal: {
        rule: "Automatic renewal is allowed in a written lease, along with notice requirements for leaving. Know the deadline.",
        citation: "Va. Code § 55.1-1204(A)",
        url: VA("1204"),
      },
      early_termination: {
        rule: "Service members with orders and survivors of family or sexual abuse can end a lease early without liquidated damages, with written notice and documents.",
        citation: "Va. Code §§ 55.1-1235, 55.1-1236",
        url: VA("1235"),
      },
      repairs_on_tenant: {
        rule: "Unless you caused the problem, a landlord can't charge you a fee for maintenance or repair of the unit.",
        citation: "Va. Code § 55.1-1208(C)",
        url: VA("1208"),
      },
      rent_increase: {
        rule: "Landlords with more than four units must give written notice of a rent increase at least 60 days before the lease ends.",
        citation: "Va. Code § 55.1-1204(K)",
        url: VA("1204"),
      },
      other_fee: {
        rule: "Deposits, rent and one-time fees must be itemized on the first page of the written lease.",
        citation: "Va. Code § 55.1-1204.1",
        url: VA("1204.1"),
      },
    },
  },
  DC: {
    jurisdiction: "DC",
    name: "DC",
    depositCapMonths: 1,
    entry: { noticeRequired: true, minHours: 48 },
    lateFeeCapPercent: 5,
    lateFeeMinGraceDays: 5,
    autoRenewalMaxNoticeDays: 30,
    attorneyFeesProhibited: true,
    maintenanceWaiverProhibited: true,
    laws: {
      security_deposit: {
        rule: "A security deposit can't be more than one month's rent.",
        citation: "14 DCMR §§ 308–311 (DC Tenant Bill of Rights)",
        url: DC_OTA_BILL_OF_RIGHTS,
      },
      landlord_entry: {
        rule: "Except in an emergency, the landlord must give at least 48 hours' written notice and enter only 9 a.m.–5 p.m., not on Sundays or federal holidays, unless you agree otherwise.",
        citation: "D.C. Code § 42-3505.51",
        url: DC("3505.51"),
      },
      late_fee: {
        rule: "A late fee can't be more than 5% of the rent due, and only after rent is 5 days late (or a longer grace period in the lease).",
        citation: "D.C. Code § 42-3505.31",
        url: DC("3505.31"),
      },
      waiver_of_rights: {
        rule: "Clauses that waive the landlord's liability for injuries from conditions they're responsible for, or waive a jury trial, are unenforceable in DC.",
        citation: "14 DCMR § 304 (per the DC Office of the Tenant Advocate)",
        url: "https://ota.dc.gov/page/information-tenants",
      },
      attorney_fees: {
        rule: "A clause assigning attorney fees to you regardless of what a court decides is unenforceable in DC.",
        citation: "14 DCMR § 304 (per the DC Office of the Tenant Advocate)",
        url: "https://ota.dc.gov/page/information-tenants",
      },
      auto_renewal: {
        rule: "A clause requiring more than 30 days' notice to move out at the end of the first lease term is void. After the first term, you can usually stay month to month.",
        citation: "D.C. Code §§ 42-3505.53, 42-3505.01",
        url: DC("3505.53"),
      },
      early_termination: {
        rule: "Survivors of intrafamily offenses can be released from a lease with documentation. Service members are covered by the federal SCRA.",
        citation: "D.C. Code § 42-3505.07; 50 U.S.C. § 3955",
        url: DC("3505.07"),
      },
      repairs_on_tenant: {
        rule: "A clause waiving the landlord's responsibility for basic maintenance is unenforceable, and landlords can't charge fees for services needed to keep the unit habitable.",
        citation: "14 DCMR § 304; D.C. Code § 42-3505.10(b-2)",
        url: DC("3505.10"),
      },
      rent_increase: {
        rule: "Before you apply, the landlord must tell you the rent and whether the unit is rent-controlled or exempt, which affects how much rent can go up.",
        citation: "D.C. Code § 42-3502.22",
        url: DC("3502.22"),
      },
      other_fee: {
        rule: "Before signing, only an application fee may be charged. Fees for services needed to keep the unit habitable are banned.",
        citation: "D.C. Code § 42-3505.10(b)(3), (b-2)",
        url: DC("3505.10"),
      },
    },
  },
  MD: {
    jurisdiction: "MD",
    name: "Maryland",
    depositCapMonths: 1,
    entry: { noticeRequired: true, minHours: 24 },
    lateFeeCapPercent: 5,
    lateFeeMinGraceDays: null,
    autoRenewalMaxNoticeDays: null,
    attorneyFeesProhibited: false,
    maintenanceWaiverProhibited: false,
    laws: {
      security_deposit: {
        rule: "A security deposit can't be more than one month's rent (a narrow exception allows two months for some utility-assistance tenants).",
        citation: "Md. Code, Real Prop. § 8-203(b)",
        url: MD("203"),
      },
      landlord_entry: {
        rule: "Except in an emergency, the landlord must give at least 24 hours' written notice and enter only 7 a.m.–7 p.m., Monday to Saturday, unless you agree in writing.",
        citation: "Md. Code, Real Prop. § 8-221",
        url: MD("221"),
      },
      late_fee: {
        rule: "A lease can't set a late fee above 5% of the unpaid rent.",
        citation: "Md. Code, Real Prop. § 8-208(d)(3)",
        url: MD("208"),
      },
      waiver_of_rights: {
        rule: "A lease can't make you waive legal rights or a jury trial, or excuse the landlord's negligence. Such terms are unenforceable.",
        citation: "Md. Code, Real Prop. §§ 8-208(d), 8-105",
        url: MD("208"),
      },
      auto_renewal: {
        rule: "An automatic-renewal clause must be set apart in the lease with a space for you to initial it, or the landlord can't enforce it.",
        citation: "Md. Code, Real Prop. § 8-208(e)",
        url: MD("208"),
      },
      early_termination: {
        rule: "Service members with new orders and victims of abuse can end a lease early with limited rent owed, with written notice and documents.",
        citation: "Md. Code, Real Prop. §§ 8-212.1, 8-5A-02",
        url: MD("212.1"),
      },
    },
  },
};
