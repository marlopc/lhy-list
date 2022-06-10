function priceToString(price: number): string {
  const splitted = price.toString().split(".");

  if (splitted.length < 2) {
    return splitted[0];
  }

  splitted[1] = `${splitted[1]}0`.slice(0, 2);

  return splitted.join(".");
}

export { priceToString };
