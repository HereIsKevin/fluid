export { TemplateDirective };

import { mount } from "../mount";
import { Template } from "../template";

import { BoundDirective, ValueDirective } from "./base";

class TemplateDirective extends ValueDirective<Template> {
  public static transformer = {
    verifier: (value: unknown) => value instanceof Template,
  };

  public attach(node: ChildNode): BoundDirective<Template> {
    const start = new Comment();
    const end = new Comment();

    node.replaceWith(start, end);

    return (value: Template) => {
      mount(start, end, value);
    };
  }
}
