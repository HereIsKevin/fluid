export { CompiledAttribute, CompiledTemplate, CompiledValue };

import { Template } from "./template";

interface CompiledAttribute {
  kind: "event" | "toggle" | "value";
  element: Element;
  name: string;
}

interface CompiledValue {
  kind: "template" | "text";
  start: Comment;
  end: Comment;
}

class CompiledTemplate {
  public attributes: Record<number, CompiledAttribute>;
  public values: Record<number, CompiledValue>;

  public template: Template;
  public fragment: DocumentFragment;

  public constructor(template: Template) {
    this.attributes = {};
    this.values = {};

    this.template = template;
    this.fragment = this.template.generate();

    this.compile(this.fragment);
  }

  private compile(node: Node): void {
    if (node instanceof Element) {
      this.compileAttributes(node);
    }

    this.compileValues(node);

    for (const child of node.childNodes) {
      this.compile(child);
    }
  }

  private compileAttributes(element: Element): void {
    for (const name of element.getAttributeNames()) {
      const value = element.getAttribute(name) ?? "";
      const matches = value.match(/^<!--([0-9]+)-->$/);

      if (matches !== null) {
        const index = Number(matches[1]);
        const eventMatches = name.match(/^@(.+)$/);
        const toggleMatches = name.match(/^(.+)\?$/);

        if (eventMatches !== null) {
          this.attributes[index] = {
            kind: "event",
            element: element,
            name: eventMatches[1],
          };
        } else if (toggleMatches !== null) {
          this.attributes[index] = {
            kind: "toggle",
            element: element,
            name: toggleMatches[1],
          };
        } else {
          this.attributes[index] = {
            kind: "value",
            element: element,
            name: name,
          };
        }

        element.removeAttribute(name);
      }
    }
  }

  private compileValues(node: Node): void {
    let current = node.firstChild;

    while (current !== null) {
      if (current instanceof Comment) {
        const value = current.nodeValue ?? "";
        const matches = value.match(/^([0-9]+)$/);

        if (matches !== null) {
          const start = new Comment();
          const end = new Comment();

          current.replaceWith(start, end);
          current = end;

          const index = Number(matches[1]);
          const actual = this.template.values[index];

          if (actual instanceof Template) {
            this.values[index] = {
              kind: "template",
              start: start,
              end: end,
            };
          } else {
            this.values[index] = {
              kind: "text",
              start: start,
              end: end,
            };
          }
        }
      }

      current = current.nextSibling;
    }
  }
}
