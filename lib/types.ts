import type { ClauseType, Extraction, InputKind } from "@/lib/ai/schema";

export type { ClauseType, Extraction, InputKind };

export const SAMPLE_IDS = ["fine-arlington", "scam-facebook", "lease-photo", "injection"] as const;
export type SampleId = (typeof SAMPLE_IDS)[number];

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

export interface Overrides {
  rent?: number;
  bedrooms?: number;
  zip?: string;
}

export interface CheckRequest {
  text?: string;
  image?: { mimeType: ImageMime; data: string };
  zip?: string;
  overrides?: Overrides;
  extraction?: Extraction;
  sampleId?: SampleId;
  /** SHA-256 of normalized phone numbers / emails, computed in the browser before redaction. */
  contactHashes?: string[];
}

export interface SourceRef {
  name: string;
  url: string;
}

export interface Evidence {
  label: string;
  quote?: string;
  quoteFrom?: "text" | "image";
  counted: boolean;
  value?: string;
  source?: SourceRef;
}

export type Jurisdiction = "VA" | "DC" | "MD";

export interface PriceCheck {
  status: "below" | "typical" | "above" | "unknown";
  headline: string;
  detail: string;
  rent: number | null;
  bedrooms: number | null;
  zip: string | null;
  areaName: string | null;
  benchmark: { amount: number; level: "zip" | "county" | "metro"; year: string; live: boolean } | null;
  census: { amount: number; geography: string; vintage: string; live: boolean; topCoded: boolean } | null;
  ratio: number | null;
  range: { low: number; high: number } | null;
  farBelow: boolean;
  missing: ("rent" | "bedrooms" | "zip" | "area")[];
  evidence: Evidence[];
}

export type ScamFlagId =
  | "priceFarBelow"
  | "riskyPayment"
  | "payBeforeViewing"
  | "noInPersonViewing"
  | "landlordAway"
  | "pressure"
  | "sensitiveInfoEarly"
  | "offPlatformContact"
  | "aiInstructions";

export interface ScamFlag {
  id: ScamFlagId;
  label: string;
  weight: 1 | 2;
  heuristic: boolean;
  evidence: Evidence[];
}

export interface ScamCheck {
  status: "none_found" | "some" | "likely";
  headline: string;
  detail: string;
  flagged: number;
  checked: number;
  flags: ScamFlag[];
  dropped: Evidence[];
}

export interface LawRef {
  rule: string;
  citation: string;
  url: string;
}

export interface ClauseFinding {
  type: ClauseType;
  severity: "conflict" | "ask" | "standard";
  title: string;
  plain: string;
  why: string;
  law: LawRef | null;
  evidence: Evidence[];
}

export interface LeaseCheck {
  status: "not_provided" | "standard" | "ask" | "fix";
  headline: string;
  detail: string;
  jurisdiction: Jurisdiction | null;
  findings: ClauseFinding[];
}

export interface Question {
  text: string;
  why: string;
}

export interface HelpLink {
  label: string;
  url: string;
}

export interface CheckResult {
  read: {
    rent: number | null;
    bedrooms: number | null;
    zip: string | null;
    kinds: InputKind[];
    jurisdiction: Jurisdiction | null;
    areaName: string | null;
  };
  price: PriceCheck;
  scam: ScamCheck;
  lease: LeaseCheck;
  questions: Question[];
  aiInstructions: { detected: boolean; quote: string | null };
  /** Anonymous community flags (null when the counter is off or Firestore didn't answer). */
  community: { ids: string[]; address: number; contact: number; firstSeen: string | null } | null;
  help: HelpLink[];
  meta: {
    model: string;
    mode: "live" | "mock" | "rules-only";
    dataLive: boolean;
    latencyMs: number;
    usage: { promptTokens: number; outputTokens: number } | null;
    imageRead: boolean;
    notes: string[];
  };
  extraction: Extraction;
}

export type CheckErrorCode =
  | "rate_limited"
  | "too_large"
  | "bad_input"
  | "model_busy"
  | "model_failed"
  | "invalid_output";

export interface CheckError {
  error: { code: CheckErrorCode; message: string };
}
