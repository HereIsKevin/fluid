export { EventDirective };

import { BoundDirective, ElementDirective } from "./base";

class EventDirective extends ElementDirective<EventListener> {
  public static transformer = {
    extractor: /^@(.+)$/,
    verifier: () => true,
  };

  public attach(element: Element): BoundDirective<EventListener> {
    let oldValue: EventListener | undefined;

    return (newValue: EventListener) => {
      if (oldValue !== newValue) {
        if (oldValue !== undefined) {
          element.removeEventListener(this.name, oldValue);
        }

        element.addEventListener(this.name, newValue);
      }

      oldValue = newValue;
    };
  }
}
