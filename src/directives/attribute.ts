export { AttributeDirective };

import { BoundDirective, ElementDirective } from "./base";

class AttributeDirective extends ElementDirective<string> {
  public static transformer = {
    extractor: /^(.+)$/,
    verifier: () => true,
  };

  public attach(element: Element): BoundDirective<string> {
    let oldValue: string | undefined;

    return (newValue: string) => {
      if (oldValue !== newValue) {
        element.setAttribute(this.name, String(newValue));
      }

      oldValue = newValue;
    };
  }
}
