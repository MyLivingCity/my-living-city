import { exampleFunction } from "../example";

describe("exampleFunction", () => {
  it("should display string parameter", () => {
    const testString = "this is a test";
    expect(exampleFunction(testString)).toContain(testString);
  });
});
