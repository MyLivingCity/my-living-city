import { cleanAddress } from "../helpers";

describe("cleanAddress", () => {
  test.each([
    ["123 Example Street", "Example Street"],
    [" 321 Example Street", "Example Street"],
    ["  456 Example Street", "Example Street"],
    ["     124642    Example Street", "Example Street"],
  ])("'%s' should return '%s'", (input, expected) => {
    expect(cleanAddress(input)).toBe(expected);
  });

  it("clean input should return identical", () => {
    expect(cleanAddress("Example Street")).toBe("Example Street");
  });
});
