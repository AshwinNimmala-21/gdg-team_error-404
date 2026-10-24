import { describe, expect, it } from "vitest";
import { redact } from "@/lib/client/redact";
import { HASH_RE, normalizeAddress, normalizeContact, sha256Hex } from "@/lib/community";

describe("redaction before sending", () => {
  it("removes phones, emails and long ID numbers but keeps prices, ZIPs and the scam wording", () => {
    const r = redact("Text me on WhatsApp at (571) 555-0142 or bob.landlord@gmail.com. $1,650/month, VA 22201-1234. SSN 123-45-6789, acct 4111 1111 1111 1111.");
    expect(r.text).toBe(
      "Text me on WhatsApp at [phone removed] or [email removed]. $1,650/month, VA 22201-1234. SSN [number removed], acct [number removed].",
    );
    expect(r.contacts).toEqual(["bob.landlord@gmail.com", "(571) 555-0142"]);
    expect(r.removed).toBe(4);
  });
});

describe("community fingerprints", () => {
  it("normalizes addresses so small differences match", () => {
    expect(normalizeAddress("123 Sample Street, Apt 4B, Arlington, VA 22201", "22201")).toBe("123 sample st|22201");
    expect(normalizeAddress("123 SAMPLE ST. #4b", "22201")).toBe("123 sample st|22201");
    expect(normalizeAddress("Clarendon, Arlington", "22201")).toBeNull();
    expect(normalizeAddress("123 Sample St", null)).toBeNull();
  });
  it("normalizes contacts", () => {
    expect(normalizeContact("+1 (571) 555-0142")).toBe("phone:5715550142");
    expect(normalizeContact("571.555.0142")).toBe("phone:5715550142");
    expect(normalizeContact(" Bob@Example.com ")).toBe("email:bob@example.com");
    expect(normalizeContact("555-0142")).toBeNull();
  });
  it("hashes to 64 hex chars", async () => {
    expect(await sha256Hex("phone:5715550142")).toMatch(HASH_RE);
  });
});
