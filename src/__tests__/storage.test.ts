import type { ProductRow } from "../types";
import storage, { LabeledRow } from "../lib/storage";

function productFactory(): () => ProductRow {
  let id = 1;
  const category = ["category-1", "category-2", "category-3"][
    Math.floor(Math.random() * 3)
  ];

  return () => ({
    id: id.toString(),
    modificado: new Date().toLocaleString(),
    categoria: category,
    nombre: `Producto-${id++}`,
    precio: 300,
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Trash storage handler", () => {
  const { key } = storage.trash;

  const getRandomProduct = productFactory();

  function getRandomProductList(length: number) {
    return new Array(length).fill(null).map(() => getRandomProduct());
  }

  function parse(string: string): LabeledRow[] {
    return JSON.parse(string);
  }

  it("stores a product", () => {
    const file = "foo";
    const product = getRandomProduct();

    storage.trash.push(product, file);

    const values = parse(localStorage.getItem(key));

    expect(values).toBeInstanceOf(Array);
    expect(values).toHaveLength(1);
    expect(values[0].filename).toBe(file);
    expect(values[0].value).toEqual(product);
  });

  it("stores multiple products", () => {
    const file = "bar";

    const products = getRandomProductList(5);

    products.forEach((product) => {
      storage.trash.push(product, file);
    });

    const values = parse(localStorage.getItem(key));

    expect(values).toHaveLength(products.length);

    values.forEach((entry, index) => {
      expect(entry.filename).toBe(file);
      expect(entry.value).toEqual(products[index]);
    });
  });

  it("restores the product values", () => {
    const file = "baz";
    const { id, ...values } = getRandomProduct();

    storage.trash.push({ id, ...values }, file);

    const recovered = storage.trash.restore(id);

    expect(recovered).toEqual(values);
  });

  it("restores multiple products correctly", () => {
    const file = "classified";
    const products = getRandomProductList(5);

    products.forEach((product) => {
      storage.trash.push(product, file);
    });

    const recovered = products.map((product) => {
      return storage.trash.restore(product.id);
    });

    recovered.forEach((value, index) => {
      delete products[index].id;

      expect(value).toEqual(products[index]);
    });
  });

  it("clears the storage correctly", () => {
    const file = "inventory";

    storage.trash.push(getRandomProduct(), file);
    storage.trash.push(getRandomProduct(), file);

    const values = parse(localStorage.getItem(key));

    expect(values).toHaveLength(2);

    storage.trash.clear();

    const empty = parse(localStorage.getItem(key));

    expect(empty).toHaveLength(0);
  });

  it("lists the current stored items", () => {
    const file1 = "shopping-list";
    const file2 = "cart";

    const products1 = getRandomProductList(5);
    const products2 = getRandomProductList(3);

    products1.forEach((product) => {
      storage.trash.push(product, file1);
    });

    products2.forEach((product) => {
      storage.trash.push(product, file2);
    });

    const list1 = storage.trash.list(file1);

    expect(list1).toHaveLength(products1.length);
    expect(list1[0]).toEqual({
      filename: file1,
      value: products1[0],
    });

    const list2 = storage.trash.list(file2);

    expect(list2).toHaveLength(products2.length);
    expect(list2[0]).toEqual({
      filename: file2,
      value: products2[0],
    });
  });
});

describe("Session storage handler", () => {
  const { key } = storage.session;

  it("stores a filename", () => {
    const file = "my-file";

    storage.session.set(file);

    expect(localStorage.getItem(key)).toBe(file);
  });

  it("returns the stored filename", () => {
    const file = "products";

    storage.session.set(file);

    const stored = storage.session.get();

    expect(stored).toBe(file);
  });

  it("clears the storage correctly", () => {
    const file = "bar";

    storage.session.set(file);

    storage.session.clear();

    const stored = storage.session.get();

    expect(stored).toBeNull();
  });

  it("returns if a filename matches the stored one", () => {
    const file = "foo";

    storage.session.set(file);

    expect(storage.session.matches(file)).toBe(true);
    expect(storage.session.matches("bar")).toBe(false);
  });
});
