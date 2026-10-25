import { describe, expect, it } from "vitest";
import { highlightRanges } from "../highlight";

const marked = (src: string, quotes: string[]) => highlightRanges(src, quotes).map(([s, e]) => src.slice(s, e));

describe("highlightRanges", () => {
  it("marks an exact quote", () => {
    expect(marked("Rent is $1,650/month. Wire it today.", ["Wire it today"])).toEqual(["Wire it today"]);
  });

  it("matches across case, curly quotes and extra spaces", () => {
    expect(marked("I’m   OVERSEAS right now", ["i'm overseas right now"])).toEqual(["I’m   OVERSEAS right now"]);
  });

  it("marks each piece of a quote the model shortened with ...", () => {
    expect(marked("Send the deposit by Zelle and then I will mail the keys to you.", ["Send the deposit ... mail the keys"])).toEqual([
      "Send the deposit",
      "mail the keys",
    ]);
  });

  it("merges overlapping quotes and ignores quotes that aren't there", () => {
    expect(marked("1BR in Clarendon for $1,650", ["1BR in Clarendon", "Clarendon for $1,650", "not in the text"])).toEqual([
      "1BR in Clarendon for $1,650",
    ]);
  });
});
