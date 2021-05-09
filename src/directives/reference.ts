export { ReferenceDirective };

import { BoundDirective, ElementDirective } from "./base";

type Callback = (element: Element) => void;

class ReferenceDirective extends ElementDirective<Callback> {
  public static transformer = {
    extractor: /^ref$/,
    verifier: () => true,
  };

  public attach(element: Element): BoundDirective<Callback> {
    let oldValue: Callback | undefined;

    return (newValue: Callback) => {
      if (oldValue !== newValue) {
        newValue(element);
      }

      oldValue = newValue;
    };
  }
}
