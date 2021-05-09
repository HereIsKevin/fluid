export {
  BoundDirective,
  ElementDirective,
  ElementTransformer,
  ValueDirective,
  ValueTransformer,
};

interface ElementTransformer {
  extractor: RegExp;
  verifier: (value: unknown) => boolean;
}

interface ValueTransformer {
  verifier: (value: unknown) => boolean;
}

type BoundDirective<T> = (values: T) => void;

class ElementDirective<T> {
  public static transformer?: ElementTransformer;

  protected name: string;
  protected values: T;

  public constructor(name: string, values: T) {
    this.name = name;
    this.values = values;
  }

  public attach(element: Element): BoundDirective<T> {
    throw new Error("unimplemented attach for element directive");
  }
}

class ValueDirective<T> {
  public static transformer?: ValueTransformer;

  protected values: T;

  public constructor(values: T) {
    this.values = values;
  }

  public attach(node: Node): BoundDirective<T> {
    throw new Error("unimplemented attach for value directive");
  }
}
