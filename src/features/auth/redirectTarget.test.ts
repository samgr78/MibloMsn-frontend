import { describe, expect, test } from "vitest";
import { DEFAULT_TARGET, readRedirectTarget } from "./redirectTarget";

describe("readRedirectTarget", () => {
  test("restitue le chemin interne mémorisé par ProtectedRoute", () => {
    expect(readRedirectTarget({ from: "/posts/42" })).toBe("/posts/42");
  });

  test("retombe sur le fil quand rien n'a été mémorisé", () => {
    expect(readRedirectTarget(undefined)).toBe(DEFAULT_TARGET);
    expect(readRedirectTarget(null)).toBe(DEFAULT_TARGET);
    expect(readRedirectTarget({})).toBe(DEFAULT_TARGET);
  });

  test("refuse une redirection ouverte vers un autre site", () => {
    // Protocol-relative: starts with a slash but points at another domain.
    expect(readRedirectTarget({ from: "//exemple.com" })).toBe(DEFAULT_TARGET);
    expect(readRedirectTarget({ from: "https://exemple.com" })).toBe(DEFAULT_TARGET);
  });

  test("ignore un état dont la forme ne correspond pas", () => {
    expect(readRedirectTarget({ from: 42 })).toBe(DEFAULT_TARGET);
    expect(readRedirectTarget("/posts/42")).toBe(DEFAULT_TARGET);
  });
});
