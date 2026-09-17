import { describe, expect, it } from "vitest";
import { normalizeArgentinePhone } from "./phone";

describe("normalizeArgentinePhone", () => {
  it("passes through a number already in E.164 mobile form", () => {
    expect(normalizeArgentinePhone("+5493425782402")).toBe("+5493425782402");
  });

  it("accepts the international form without the plus", () => {
    expect(normalizeArgentinePhone("5493425782402")).toBe("+5493425782402");
  });

  it("adds the mobile 9 to an international number missing it", () => {
    expect(normalizeArgentinePhone("+543425782402")).toBe("+5493425782402");
  });

  it("strips the national trunk prefix 0", () => {
    expect(normalizeArgentinePhone("03425782402")).toBe("+5493425782402");
  });

  it("strips the local mobile marker 15 after the area code", () => {
    expect(normalizeArgentinePhone("0342155782402")).toBe("+5493425782402");
  });

  it("handles a bare national number with no prefixes", () => {
    expect(normalizeArgentinePhone("3425782402")).toBe("+5493425782402");
  });

  it.each([
    ["0342 15 578-2402", "+5493425782402"],
    ["(0342) 15 5782402", "+5493425782402"],
    ["+54 9 342 578-2402", "+5493425782402"],
    ["342.578.2402", "+5493425782402"],
    ["  3425782402  ", "+5493425782402"],
  ])("ignores punctuation and spacing in %s", (input, expected) => {
    expect(normalizeArgentinePhone(input)).toBe(expected);
  });

  it("normalizes a Buenos Aires number with its 2-digit area code", () => {
    expect(normalizeArgentinePhone("011 15 3428-6716")).toBe("+5491134286716");
    expect(normalizeArgentinePhone("+5491134286716")).toBe("+5491134286716");
  });

  it("normalizes a 4-digit area code", () => {
    // 2966 = Río Gallegos, subscriber 6 digits.
    expect(normalizeArgentinePhone("02966 15 420123")).toBe("+5492966420123");
  });

  it("treats two spellings of one number as the same canonical value", () => {
    expect(normalizeArgentinePhone("0342 15 578-2402")).toBe(
      normalizeArgentinePhone("+54 9 342 578 2402"),
    );
  });

  it.each([
    ["", "empty"],
    ["   ", "blank"],
    ["abc", "no digits"],
    ["12345", "too short"],
    ["342578240", "nine digits"],
    ["34257824021234", "too long"],
  ])("returns null for an unreadable number (%s)", (input) => {
    expect(normalizeArgentinePhone(input)).toBeNull();
  });

  it("does not mangle a subscriber number that contains 15", () => {
    // Area code 341, subscriber 152-3456. The marker sitting after the area
    // code is stripped; the 15 that opens the subscriber number survives.
    expect(normalizeArgentinePhone("0341 15 152-3456")).toBe("+5493411523456");
  });
});
