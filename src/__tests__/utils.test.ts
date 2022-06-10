import * as utils from "../lib/utils";

describe("Price to string", () => {
  it("parses an integer correctly", () => {
    const price = 106;

    const parsed = utils.priceToString(price);

    expect(parsed).toBe(price.toString());
  });

  it("parses and pad with zeros a float number", () => {
    const price = 350.5;

    const parsed = utils.priceToString(price);

    expect(parsed).toBe(`${price.toString()}0`);
  });

  it("doesn't pad a float number if it isn't necessary", () => {
    const price = 360.72;

    const parsed = utils.priceToString(price);

    expect(parsed).toBe(price.toString());
  });
});
