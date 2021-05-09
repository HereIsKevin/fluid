export { Compiler };

import {
  BoundDirective,
  ElementDirective,
  ValueDirective,
} from "./directives/base";
import { Template } from "./template";

interface Updater {
  index: number;
  base: BoundDirective<unknown>;
}

class Compiler {
  public static elementDirectives: typeof ElementDirective[] = [];
  public static valueDirectives: typeof ValueDirective[] = [];

  public updaters: Record<string, Updater[]>;

  public template: Template;
  public fragment: DocumentFragment;

  public constructor(template: Template) {
    this.updaters = {};

    this.template = template;
    this.fragment = this.template.generate();

    this.compile(this.fragment);
  }

  private compile(node: Node): void {
    if (node instanceof Element) {
      this.compileElement(node);
    }

    this.compileValues(node);

    for (const child of node.childNodes) {
      this.compile(child);
    }
  }

  private compileElement(element: Element): void {
    let id: string | undefined;

    for (const attribute of element.getAttributeNames()) {
      const value = element.getAttribute(attribute) ?? "";
      const matches = value.match(/^<!--([0-9]+)-->$/);

      if (matches !== null) {
        if (id === undefined) {
          id = matches[1];
          this.updaters[id] = [];

          element.setAttribute("fluid-id", id);
        }

        const index = Number(matches[1]);
        const actual = this.template.values[index];

        element.removeAttribute(attribute);

        const base =

        let base: BaseUpdater;

        if (eventMatches !== null) {
          base = updaters.event();
        }
      }
    }
  }
}
