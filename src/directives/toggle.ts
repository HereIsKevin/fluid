export { ToggleDirective };

import { BoundDirective, ElementDirective } from "./base";

class ToggleDirective extends ElementDirective<boolean> {
  public static transformer = {
    extractor: /^(.+)\?$/,
    verifier: () => true,
  };

  public attach(element: Element): BoundDirective<boolean> {
    let oldValue: boolean | undefined;

    return (newValue: boolean) => {
      if (oldValue !== newValue) {
        if (newValue) {
          element.setAttribute(this.name, "");
        } else {
          element.removeAttribute(this.name);
        }
      }

      oldValue = newValue;
    };
  }
}
