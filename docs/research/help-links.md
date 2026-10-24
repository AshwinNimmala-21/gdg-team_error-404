# Help links, Gemma 4 licensing/features/pricing, `@google/genai` call shape

Researched 2026-10-24. Each URL below was fetched during this session unless it is marked UNVERIFIED.
Labels: `VERIFIED` means the page was fetched and the quoted text was seen. `UNVERIFIED` means the claim is inferred, the fetch failed, or the content could not be read.
"Secondary" marks a non-government, non-vendor source that is used only because no primary source was available.

---

## 1. Help links (render under every result, next to "This is not legal advice")

### Recommended list for the UI (copy into a constant)

| Jurisdiction | Label | URL | Page title as fetched | Status |
|---|---|---|---|---|
| VA | Virginia landlord-tenant handbook (DHCD) | https://www.dhcd.virginia.gov/landlord-tenant-resources | "Tenant and Landlord Resources \| DHCD" | VERIFIED |
| VA | Handbook PDF (direct) | https://www.dhcd.virginia.gov/sites/default/files/DocX/landlord-tenant/landlord-tenant-handbook-final.pdf | PDF loaded (890.2 KB, 99 pages). Title not readable, see notes | VERIFIED live, title UNVERIFIED |
| VA | Virginia Law Help: Before You Sign a Lease | https://www.virginialawhelp.org/node/711 | "Before You Sign a Lease in Virginia \| Virginia Law Help" | VERIFIED |
| VA | Virginia legal aid (find local office) | https://www.virginialawhelp.org/get-legal-help | "Get Legal Help \| Virginia Law Help" | VERIFIED |
| DC | DC Office of the Tenant Advocate | https://ota.dc.gov/ | "Office of the Tenant Advocate - OTA" | VERIFIED |
| DC | OTA: Information for Tenants | https://ota.dc.gov/page/information-tenants | "Information for Tenants \| ota" | VERIFIED |
| DC | Legal Aid DC: apply for help | https://www.legalaiddc.org/how-to-apply-for-help | "How to apply for help at Legal Aid \| Legal Aid - District of Columbia" | VERIFIED |
| DC | DC Bar Pro Bono: Landlord Tenant Resource Center | https://dcbar.org/pro-bono/free-legal-help/help-for-individuals/landlord-tenant-resource-center | "DC Bar - Housing Legal Assistance" | VERIFIED |
| MD | MD Attorney General: Landlord/Tenant Disputes | https://oag.maryland.gov/i-need-to/Pages/landlord-tenant-disputes.aspx | "Attorney General of Maryland - Landlord-Tenant Disputes" | VERIFIED |
| MD | Maryland Legal Aid | https://www.mdlab.org/ | "Home - Maryland Legal Aid" | VERIFIED |
| All | Report a scam to the FTC | https://reportfraud.ftc.gov/ | "ReportFraud.ftc.gov" (the page is a JS app and this is the only server-rendered text) | VERIFIED live |
| All | FTC: Rental Listing Scams | https://consumer.ftc.gov/articles/rental-listing-scams | "Rental Listing Scams \| Consumer Advice" | VERIFIED |
| VT students | VT Off-Campus Life / VTOCH | https://dos.vt.edu/office/offcampus.html | "Off-Campus Life at Virginia Tech \| Dean of Students \| Virginia Tech" | VERIFIED |
| VT students | Student Legal Services at VT | https://legal.uss.vt.edu/ | "Student Legal Services at Virginia Tech" | VERIFIED |

### Per-link details and quotes

**Virginia DHCD handbook** (VERIFIED, landing page)
- URL: https://www.dhcd.virginia.gov/landlord-tenant-resources. Title: "Tenant and Landlord Resources | DHCD".
- Quotes from the page: "please refer to the Virginia Residential Landlord and Tenant handbook" and "The handbook provides further information on the rental process."
- The only handbook link on the page is "Landlord Tenant Handbook", which points to `/sites/default/files/DocX/landlord-tenant/landlord-tenant-handbook-final.pdf`.
- The PDF loads at both `www.dhcd.virginia.gov` and `dhcd.ko.virginia.gov` (VERIFIED: 890.2 KB, 99 pages). Its text streams are compressed, so the title and effective date could not be read. The readable link annotations point to valegalaid.org, vplc.org, law.lis.virginia.gov (VRLTA popular-name page), and the DHCD landlord-tenant page.
- UNVERIFIED: a web search snippet says the current edition is "Effective July 1, 2026". The PDF text was not readable, so this is unconfirmed. Link to the landing page, not the PDF, so the link keeps working when DHCD posts a new edition.

**Virginia legal aid** (VERIFIED, build-relevant)
- `https://www.valegalaid.org/` now returns **301 Moved Permanently** to `https://www.virginialawhelp.org/`. Use virginialawhelp.org directly.
- Homepage title: "Virginia Law Help". Per the page, the site is maintained by the Virginia Poverty Law Center.
- Quote: "Call 866-LEGLAID (866-534-5243) or click the button below to connect with your local legal aid office."
- On https://www.virginialawhelp.org/get-legal-help: "Call 866-LEGLAID (866-534-5243) to find and connect with your local legal aid office." and "Virginia's legal aid offices may be able to provide free legal help."
- Rental Housing topic: https://www.virginialawhelp.org/en/topics/housing/rental-housing (title "Rental Housing | Virginia Law Help"). Article links on that page, as relative hrefs:
  - `/node/710` "Renting in Virginia: What You Need to Know"
  - `/node/711` "Before You Sign a Lease in Virginia" (fetched, title verified)
  - `/node/712` "Fees, Deposits, and Rent: What Can My Landlord Charge?"
  - `/node/715` "Getting Your Security Deposit Back"
  - Only `/node/711` was fetched directly. The other three hrefs were read from the topic page.

**DC Office of the Tenant Advocate** (VERIFIED)
- https://ota.dc.gov/. Title: "Office of the Tenant Advocate - OTA".
- Phone: "(202) 719-6560 (TTY: 711)". Address: "899 North Capitol Street, NE, Suite 6200, Washington, DC 20002".
- Intake: walk-ins M-Th, 9 am-3 pm. Phone intakes M-F, 8:45 am-4:45 pm.
- Subpages: "Information for Tenants" at https://ota.dc.gov/page/information-tenants, which lists "Residential Lease Law FAQ", "Late Fee FAQs", "OTA's District of Columbia Tenant Bill of Rights", and "Tenant Resource Guide". Tenant Bill of Rights: https://ota.dc.gov/publication/tenant-bill-rights (linked from the homepage, not fetched directly).

**DC legal aid** (VERIFIED)
- Legal Aid DC: https://www.legalaiddc.org/how-to-apply-for-help. Title: "How to apply for help at Legal Aid | Legal Aid - District of Columbia".
  - "Call our intake line at 202-628-1161."
  - "You can apply for help with a legal matter in any of Legal Aid's practice areas at any time by using our online form."
- DC Bar Pro Bono Center: https://dcbar.org/pro-bono/free-legal-help/help-for-individuals/landlord-tenant-resource-center. Title: "DC Bar - Housing Legal Assistance".
  - The older URL `https://www.dcbar.org/pro-bono/resources-and-information/landlord-tenant-resource-center` returns **404**. Do not use it.
  - Location: "The LTRC is located in Room 223 on the second floor of the D.C. Superior Courthouse, Building B," "510 4th St NW, Washington, DC 20001." Hours: "Tuesdays: 10 a.m. – 1 p.m."
  - LTLAN phone: "202-780-2575", "Monday to Thursday: 9 a.m. - 4 p.m."
  - "Please note that our services are limited to individuals and households with income below 400% of the Federal Poverty Line."

**Maryland Attorney General** (VERIFIED)
- The old `https://www.marylandattorneygeneral.gov/Pages/CPD/landlord.aspx` redirects (301) to `https://oag.maryland.gov/`, the homepage, not a landlord page. Use the URL below.
- https://oag.maryland.gov/i-need-to/Pages/landlord-tenant-disputes.aspx. Title: "Attorney General of Maryland - Landlord-Tenant Disputes".
  - "Landlord-tenant disputes are among our most common cases."
  - "This guide outlines Maryland rental housing laws and explains the rights and responsibilities of both parties."
  - Mediation Unit hotline: 410-528-8662 or 888-743-0023. Main: 410-576-6300. Spanish: 410-230-1712.
  - "File a complaint" links to https://portal.oag.state.md.us/cpdportal/ (not fetched).
  - Guide PDF: https://oag.maryland.gov/i-need-to/Documents/pdfs/landlordTenantPDF.pdf. The PDF loaded (4.7 MB) and its text layer begins "DEAR MARYLANDER: A good relationship between you and your land…". File metadata shows it was modified 2023-03-08.

**Maryland Legal Aid** (VERIFIED)
- https://www.mdlab.org/. Title: "Home - Maryland Legal Aid".
- "Main Intake Number: 888-465-2468". The same page also says "You can apply online, call us at (410) 951-7750, attend a clinic, or visit an office." The page shows two numbers. Show 888-465-2468, which is labeled "Main Intake".
- Online intake: `https://mdlaboi.legalserver.org/modules/matter/extern_intake.php?pid=129&h=daa817&` (read from the page, not fetched).

**FTC** (VERIFIED)
- https://reportfraud.ftc.gov/ is live. The FTC homepage (https://www.ftc.gov/) links to it with the text "Report Fraud" and href `https://reportfraud.ftc.gov/`. The page is a client-rendered app, so its only server-rendered text is "ReportFraud.ftc.gov".
- https://consumer.ftc.gov/articles/rental-listing-scams. Title: "Rental Listing Scams | Consumer Advice". Dated "June 2026".
  - "If the rent is a lot cheaper than most rents in the area, it could be a sign of a scam."
  - "If you notice a rental listing scam, report it to your local law enforcement agency and the website where the ad was posted."
  - UNVERIFIED: the "pay before you've met / signed a lease" bullet that people usually quote was **not** on this page in this fetch. Do not quote it as FTC text.

**Virginia Tech** (VERIFIED)
- https://dos.vt.edu/office/offcampus.html. Title: "Off-Campus Life at Virginia Tech | Dean of Students | Virginia Tech".
  - "The Basic Needs and Off-Campus Student Support unit helps students meet essential needs and thrive on and off campus". Email: VTOCH@vt.edu. Listings: https://offcampus.vt.edu/ (not fetched).
  - No phone number is listed on this page. A search snippet gave (540) 231-3466 (secondary, UNVERIFIED).
- https://legal.uss.vt.edu/. Title: "Student Legal Services at Virginia Tech". Phone "540-231-4720". Email "studentlegalservices@vt.edu". The page lists "Leasing terms", "Leasing Tips", and "Renting". Whether they do lease review is UNVERIFIED.

---

## 2. Gemma: license, terms, model IDs, features

### License / terms (VERIFIED)
- **Gemma Terms of Use**: https://ai.google.dev/gemma/terms. Title: "Gemma Terms of Use | Google AI for Developers". Last modified April 1, 2026.
  - "The terms below apply to Gemma models listed in the Appendix at bottom of this page."
  - "For Gemma 4 terms, see the Gemma 4 license", which links to `/gemma/apache_2`.
- **Gemma 4 license**: https://ai.google.dev/gemma/apache_2. Title: "Apache License 2.0 | Gemma | Google AI for Developers". "Last updated 2026-04-01 UTC". The page shows the full Apache License text ("Version 2.0, January 2004").
- **Model card** (https://ai.google.dev/gemma/docs/core/model_card_4, title "Gemma 4 model card | Google AI for Developers", last updated 2026-07-30): "**License**: [Apache 2.0](https://ai.google.dev/gemma/apache_2)". The Hugging Face card for google/gemma-4-26B-A4B-it says "License: apache-2.0".
- **Conclusion**: the Gemma 4 weights are Apache-2.0. The Gemma Terms of Use cover earlier Gemma models, not Gemma 4. When the model is called through the Gemini API, the **Gemini API Additional Terms of Service** also apply (next item).
- **Gemini API Additional Terms** (https://ai.google.dev/gemini-api/terms, title "Gemini API Additional Terms of Service | Google AI for Developers", last modified 2026-04-28 UTC). **These terms affect the build:**
  - "To help with quality and improve our products, human reviewers may read, annotate, and process your API input and output."
  - "Do not submit sensitive, confidential, or personal information to the Unpaid Services."
  - "You must be 18 years of age or older to use the APIs."
- Docs move: both https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api and the model card now say "This documentation is deprecated. Please visit the new documentation at gemma.ai." The new page is https://gemma.ai/deployment/gemini-api/ (title "Gemini API - Gemma Documentation"), which has the same content.

### Model IDs (VERIFIED)
Source: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api ("Run Gemma with the Gemini API | Google AI for Developers"), confirmed again on https://gemma.ai/deployment/gemini-api/.
- `gemma-4-26b-a4b-it`
- `gemma-4-31b-it`

The Gemini API model list (https://ai.google.dev/gemini-api/docs/models) does **not** list Gemma (VERIFIED). The endpoint `GET https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it` returned 403 without a key. To get `inputTokenLimit`/`outputTokenLimit`, call it with the `x-goog-api-key` header, or call `ai.models.get({ model: 'gemma-4-26b-a4b-it' })`. The `Model` type has `inputTokenLimit?: number`, `outputTokenLimit?: number`, and `thinking?: boolean` (genai.d.ts lines 11899-11930).

### Specs from the model card (VERIFIED, https://ai.google.dev/gemma/docs/core/model_card_4)
| | 26B A4B (MoE) | 31B (Dense) |
|---|---|---|
| Total params | "25.2B" | "30.7B" |
| Active params | "3.8B" (8 of 128 experts active + 1 shared) | not stated |
| Context | "256K tokens" | "256K tokens" |
| Modalities | "Text, Image" | "Text, Image" |

- "The small models feature a 128K context window, while the medium models support 256K."
- "Images can be processed at variable aspect ratios and resolutions."
- "The supported token budgets are: **70**, **140**, **280**, **560**, and **1120**." The card does not state a default budget.
- "Gemma 4 introduces native support for the `system` role."
- Function calling: "Native support for structured tool use, enabling agentic workflows."
- Max output tokens: not stated on the model card. The Vertex MaaS page says "128,000 maximum output, 262,144 context length" for `gemma-4-26b-a4b-it-maas` (VERIFIED, see section 3). The Gemini API value is UNVERIFIED.

### Gemini API feature support for Gemma 4
| Feature | Status | Evidence |
|---|---|---|
| Image input | VERIFIED | "Gemma 4 models can process images, enabling many frontier developer use cases". The official example uses `ai.files.upload` with `createPartFromUri`. **No official Gemma example uses inline base64.** |
| System instructions | VERIFIED | "You can pass a system instruction to set the model's behavior:". The JS sample uses `config: { systemInstruction: "..." }` with `model: "gemma-4-26b-a4b-it"`. |
| Function calling | VERIFIED | "Define tools as function declarations. The model decides when to call them:". The sample uses `config: { tools: [{ functionDeclarations: [get_weather] }] }` and reads `response.functionCalls`. |
| Thinking | VERIFIED | "you can control it using the API by setting the thinking level to `"high"` for enabled or `"minimal"` for disabled." The sample uses `config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }`. |
| Google Search grounding | CONFLICT | The Gemma doc shows `tools: [{ googleSearch: {} }]`, but the pricing page lists "Grounding with Google Search: Not available" for Gemma 4 on both tiers. Do not rely on it. |
| JSON mode / `responseSchema` / `responseJsonSchema` | **UNVERIFIED** | Neither the Gemma-on-Gemini-API page nor gemma.ai mentions structured output. The Gemini structured-output page (https://ai.google.dev/gemini-api/docs/structured-output) does not mention Gemma. Vertex MaaS says "Structured output: Supported" for `gemma-4-26b-a4b-it-maas`, but that is Vertex, not the Gemini API. Secondary sources (philschmid.de, Vercel) say structured JSON output works. |
| Context caching | VERIFIED (pricing only) | The pricing page lists "Context caching price: Free of charge" on the free tier. |

**Build implication**: send `responseMimeType: 'application/json'` together with `responseJsonSchema`. **Always** validate the result with zod. On a 400 `INVALID_ARGUMENT` or unparseable output, retry without the schema, keeping a JSON-only instruction in the system prompt plus the zod parse. The Gemini docs say "Very large or deeply nested schemas may be rejected with a `400 INVALID_ARGUMENT` error" and "To enforce the other constraints, validate the parsed output on the client side" (VERIFIED, structured-output page). Run one smoke call on day 1 to confirm schema support.

### Image limits
- Gemini API image docs (https://ai.google.dev/gemini-api/docs/image-understanding, "Image understanding | Gemini API | Google AI for Developers"). These docs are written for Gemini models and do not mention Gemma (VERIFIED). Applying them to Gemma is UNVERIFIED.
  - Inline data "limits your total request size (text prompts, system instructions, and inline bytes) to 20MB."
  - MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif`.
  - Max 3,600 image files per request.
- **Tokens per image for Gemma 4**: UNVERIFIED on the Gemini API. The model supports budgets of 70/140/280/560/1120 visual tokens (VERIFIED, model card). The Gemini media-resolution page gives 1120 tokens for default `unspecified`, 280 for `low`, 560 for `medium`, 1120 for `high`, and 2240 for `ultra_high`. That page applies to "Gemini 4 and Gemini 3 models" and does not mention Gemma. The Gemini 2.x rule ("258 tokens if both dimensions <= 384 pixels", tiled 768x768) is for older Gemini models.
  - **For the cost table, use 1120 tokens/image as a conservative upper bound** (the largest Gemma budget). Measure the real number with `ai.models.countTokens(...)` or from `response.usageMetadata.promptTokenCount` / `promptTokensDetails` on the first real call.

---

## 3. Pricing and rate limits

### Gemini Developer API (VERIFIED)
Source: https://ai.google.dev/gemini-api/docs/pricing ("Gemini Developer API pricing | Gemini API | Google AI for Developers", "Last updated 2026-10-22 UTC"). There is one section, "Gemma 4", described as "Our lightweight, state-of the art, open model built from the same technology that powers our Gemini models." The page does not break out per-model IDs.

| Item | Free Tier | Paid Tier |
|---|---|---|
| Input price | Free of charge | Not available |
| Output price | Free of charge | Not available |
| Context caching price | Free of charge | Not available |
| Context caching (storage) | Free of charge | Not available |
| Tuning price | Not available | Not available |
| Grounding with Google Search | Not available | Not available |
| Used to improve our products | Yes | No |

**Free tier only.** Gemma 4 has **no paid price on the Gemini API**. Because the free tier is the only option, inputs are "used to improve our products" and may be read by human reviewers (see the terms quotes above).

### Rate limits (UNVERIFIED for Gemma)
- https://ai.google.dev/gemini-api/docs/rate-limits ("Rate limits | Gemini API | Google AI for Developers", last updated 2026-10-15) has **no Gemma rows** and no published free-tier numbers for any model (VERIFIED).
- Quote: "Rate limits are usually measured across three dimensions:" requests per minute (RPM), input tokens per minute (TPM), and requests per day (RPD). "Your usage is evaluated against each limit, and exceeding any of them will trigger a rate limit error." Actual limits are shown in AI Studio ("View your active rate limits in AI Studio").
- Error: `429 RESOURCE_EXHAUSTED`. In the SDK this surfaces as `ApiError` with `status: number` (genai.d.ts line 551). Handle `status === 429` with backoff and a user-facing "busy, retry" state.
- **Action:** a team member with the API key should read the Gemma 4 RPM/TPM/RPD from AI Studio and paste the values here. Until then, the numbers are unknown.

### Reference price for the cost table (estimate, secondary)
- Vertex AI MaaS: `gemma-4-26b-a4b-it-maas` exists (VERIFIED, https://docs.cloud.google.com/vertex-ai/generative-ai/docs/maas/google/gemma-4-26b-a4b-it, title "Gemma 4 26B A4B IT | Gemini Enterprise Agent Platform | Google Cloud Documentation", last updated 2026-10-22).
  - Launch stage "Experimental". Release date "April 3, 2026".
  - "`global`: 128,000 maximum output, 262,144 context length".
  - Structured output "Supported". Function calling "Supported". Thinking "Not supported". Image "Input only".
  - Pricing links to https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing. That page renders client-side, so **the Vertex price could not be read (UNVERIFIED)**.
- **Secondary**, Vercel AI Gateway (fetched):
  - https://vercel.com/ai-gateway/models/gemma-4-26b-a4b-it: "$0.13/1M input tokens", "$0.4/1M output tokens". Providers: novita, parasail, vertex, gmicloud.
  - https://vercel.com/ai-gateway/models/gemma-4-31b-it: "$0.14/1M input tokens", "$0.4/1M output tokens".
  - The same pages list a 1,048,576-token context, which contradicts Google's 256K. Treat these pages as price references only.
- Other secondary aggregators disagree. Search snippets (not fetched) give $0.07/$0.34 (getmaxim.ai) and $0.15/$0.60 (cloudprice.net) for Vertex.
- **Cost-table line (label it "reference estimate, hosted 26B-A4B")**: $0.13 / 1M input, $0.40 / 1M output.
  - Example: one check = 1 image (≤1120 tok) + ~1,500 tok prompt + ~800 tok output ≈ 2,620 in / 800 out.
  - Math: 2,620 × $0.13/1M + 800 × $0.40/1M ≈ $0.00034 + $0.00032 ≈ **$0.0007 per check**.
  - On the Gemini API itself the cost is $0.

---

## 4. `@google/genai` call shape (installed v2.31.0, from `node_modules/@google/genai/dist/genai.d.ts`)

VERIFIED against the local type file:
- `class GoogleGenAI` (line 7361), constructor `(options?: GoogleGenAIOptions)`. Options include `apiKey?: string`, `vertexai?: boolean`, `apiVersion?: string`, and `httpOptions?: HttpOptions`. If `vertexai`/`enterprise` is unset, "default SDK behavior is to use the Gemini API service". `new GoogleGenAI()` with no args reads the key from the environment, as the official Gemma samples show. Whether the env var is `GEMINI_API_KEY` or `GOOGLE_API_KEY` was not checked in source (UNVERIFIED), so pass `apiKey` explicitly.
- `models.generateContent: (params: GenerateContentParameters) => Promise<GenerateContentResponse>` (line 12045).
- `GenerateContentParameters { model: string; contents: ContentListUnion; config?: GenerateContentConfig }` (line 6281).
- `ContentListUnion = Content | Content[] | PartUnion | PartUnion[]`. `PartUnion = Part | string`. `ContentUnion = Content | PartUnion[] | PartUnion` (used by `systemInstruction`).
- `GenerateContentConfig` (line 6097) fields used here:
  - `systemInstruction?: ContentUnion`
  - `temperature?: number`
  - `maxOutputTokens?: number`
  - `responseMimeType?: string`. The doc comment says it supports `application/json`, and that "The model needs to be prompted to output the appropriate response type, otherwise the behavior is undefined."
  - `responseSchema?: SchemaUnion` (OpenAPI 3.0 subset). The doc comment says: "If `response_schema` doesn't process your schema correctly, try using `response_json_schema` instead."
  - `responseJsonSchema?: unknown` (JSON Schema). "If set, `response_schema` must be omitted, but `response_mime_type` is required." The supported keywords are `$id $defs $ref $anchor type format title description enum items prefixItems minItems maxItems minimum maximum anyOf oneOf properties additionalProperties required`, plus `propertyOrdering`.
  - `thinkingConfig?: ThinkingConfig` = `{ includeThoughts?: boolean; thinkingBudget?: number; thinkingLevel?: ThinkingLevel }`. `ThinkingLevel` is an enum: `MINIMAL | LOW | MEDIUM | HIGH | THINKING_LEVEL_UNSPECIFIED`.
  - `mediaResolution?: MediaResolution`
  - `tools?`
  - `safetySettings?`
- `Part.inlineData?: Blob` = `{ data?: string /* base64 */; mimeType?: string; displayName?: string }` (line 1411). `Part.text?: string`.
- Helper functions:
  - `createPartFromBase64(data: string, mimeType: string, mediaResolution?: PartMediaResolutionLevel): Part`
  - `createUserContent(partOrString)`
  - `createPartFromText(text)`
- Response: `response.text` is a getter returning `string | undefined` (line 6338). `response.usageMetadata` has `promptTokenCount`, `candidatesTokenCount`, `thoughtsTokenCount`, and `promptTokensDetails`.
- Errors: `class ApiError extends Error { status: number }`.
- Other methods: `ai.models.countTokens(params)` and `ai.models.get({ model })`.

### Recommended call (server-only; types verified, Gemma acceptance of schema UNVERIFIED)
```ts
import { GoogleGenAI, ApiError } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const res = await ai.models.generateContent({
  model: 'gemma-4-26b-a4b-it',            // fallback: 'gemma-4-31b-it'
  contents: [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Jpeg } }, // no data: prefix
        { text: 'Extract the lease terms and flag risks. Return JSON only.' },
      ],
    },
  ],
  config: {
    systemInstruction: SYSTEM_PROMPT,      // string is a valid ContentUnion
    responseMimeType: 'application/json',
    responseJsonSchema: leaseJsonSchema,   // plain JSON Schema object; omit responseSchema
    temperature: 0.2,
    maxOutputTokens: 2048,
  },
});
const parsed = LeaseResultZod.safeParse(JSON.parse(res.text ?? '{}'));
// catch (e) { if (e instanceof ApiError && e.status === 429) ... ; if (e.status === 400) retry without responseJsonSchema }
```
- Gemma + `systemInstruction`: **VERIFIED** (official JS sample).
- Gemma + `responseMimeType`/`responseJsonSchema`: **UNVERIFIED**. Smoke-test it first and keep the no-schema fallback.
- Gemma + inline base64 image: the `inlineData` type is VERIFIED in the SDK. Gemma acceptance is UNVERIFIED, because the only official sample uses Files API upload (`ai.files.upload` and `createPartFromUri`). Inline should work under the generic 20 MB request limit, but test it.
- Keep the key server-side. `apiKey` is "Required on browser runtimes" per the type comment, which means a browser call would expose the key.

---

## Sources
- https://www.dhcd.virginia.gov/landlord-tenant-resources
- https://www.dhcd.virginia.gov/sites/default/files/DocX/landlord-tenant/landlord-tenant-handbook-final.pdf
- https://www.virginialawhelp.org/ (redirect target of https://www.valegalaid.org/)
- https://www.virginialawhelp.org/get-legal-help
- https://www.virginialawhelp.org/en/topics/housing/rental-housing
- https://www.virginialawhelp.org/node/711
- https://ota.dc.gov/
- https://ota.dc.gov/page/information-tenants
- https://www.legalaiddc.org/
- https://www.legalaiddc.org/how-to-apply-for-help
- https://dcbar.org/pro-bono/free-legal-help/help-for-individuals/landlord-tenant-resource-center
- https://oag.maryland.gov/
- https://oag.maryland.gov/i-need-to/Pages/landlord-tenant-disputes.aspx
- https://oag.maryland.gov/i-need-to/Documents/pdfs/landlordTenantPDF.pdf
- https://www.mdlab.org/
- https://reportfraud.ftc.gov/
- https://www.ftc.gov/
- https://consumer.ftc.gov/articles/rental-listing-scams
- https://dos.vt.edu/office/offcampus.html
- https://legal.uss.vt.edu/
- https://ai.google.dev/gemma/terms
- https://ai.google.dev/gemma/apache_2
- https://ai.google.dev/gemma/docs/core/model_card_4
- https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
- https://gemma.ai/deployment/gemini-api/
- https://gemma.ai/get-started/capabilities/image/
- https://gemma.ai/resources/vision-token-budget/
- https://huggingface.co/google/gemma-4-26B-A4B-it
- https://ai.google.dev/gemini-api/terms
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/gemini-api/docs/image-understanding
- https://ai.google.dev/gemini-api/docs/media-resolution
- https://ai.google.dev/gemini-api/docs/models
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/maas/google/gemma-4-26b-a4b-it
- Secondary: https://vercel.com/ai-gateway/models/gemma-4-26b-a4b-it, https://vercel.com/ai-gateway/models/gemma-4-31b-it, https://www.philschmid.de/gemma-4-gemini-api
