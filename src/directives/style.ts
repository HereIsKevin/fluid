export { StyleDirective };

import { BoundDirective, ElementDirective } from "./base";

type Styles = Record<string, unknown>;

class StyleDirective extends ElementDirective<Styles> {
  public static transformer = {
    extractor: /^style$/,
    verifier: (value: unknown) => typeof value !== "string",
  };

  public attach(element: HTMLElement): BoundDirective<Styles> {
    let oldValues: Styles = {};

    return (newValues: Styles) => {
      for (const key in newValues) {
        const oldValue = oldValues[key];
        const newValue = newValues[key];

        if (oldValue !== newValue) {
          Reflect.set(element.style, key, newValue);
        }
      }

      oldValues = newValues;
    };
  }
}
