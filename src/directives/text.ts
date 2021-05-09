export { TextDirective };

import { BoundDirective, ValueDirective } from "./base";

class TextDirective extends ValueDirective<string> {
  public static transformer = {
    verifier: () => true,
  };

  public attach(node: ChildNode): BoundDirective<string> {
    let oldValue: string | undefined;

    const text = new Text();

    node.replaceWith(text);

    return (newValue: string) => {
      if (oldValue !== newValue) {
        text.nodeValue = newValue;
      }

      oldValue = newValue;
    };
  }
}
