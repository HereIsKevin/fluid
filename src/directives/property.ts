export { PropertyDirective };

import { BoundDirective, ElementDirective } from "./base";

class PropertyDirective extends ElementDirective<unknown> {
  public static transformer = {
    extractor: /^\.(.+)$/,
    verifier: () => true,
  };

  public attach(element: Element): BoundDirective<unknown> {
    let oldValue: unknown;

    return (newValue: unknown) => {
      if (oldValue !== newValue) {
        Reflect.set(element, this.name, newValue);
      }

      oldValue = newValue;
    };
  }
}
