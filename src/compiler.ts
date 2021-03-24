export { CompiledAttribute, CompiledValue, Compiler };

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

class Compiler {
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

  private matchAttribute(
    attribute: string
  ): { kind: "event" | "toggle" | "value"; name: string } {
    const eventMatches = attribute.match(/^@(.+)$/);
    const toggleMatches = attribute.match(/^(.+)\?$/);

    if (eventMatches !== null && toggleMatches !== null) {
      throw new Error("attribute kind cannot be both event and toggle");
    }

    if (eventMatches !== null) {
      return { kind: "event", name: eventMatches[1] };
    } else if (toggleMatches !== null) {
      return { kind: "toggle", name: toggleMatches[1] };
    } else {
      return { kind: "value", name: attribute };
    }
  }

  private compileAttributes(element: Element): void {
    for (const attribute of element.getAttributeNames()) {
      const value = element.getAttribute(attribute) ?? "";
      const matches = value.match(/^<!--([0-9]+)-->$/);

      if (matches !== null) {
        const index = Number(matches[1]);
        const { kind, name } = this.matchAttribute(attribute);

        this.attributes[index] = { kind, element, name };
        console.log(this.attributes[index]);

        element.removeAttribute(attribute);
      }
    }
  }

  private findComments(node: Node): Comment[] {
    const result: Comment[] = [];

    for (const child of node.childNodes) {
      if (child instanceof Comment) {
        result.push(child);
      }
    }

    return result;
  }

  private compileValues(node: Node): void {
    for (const comment of this.findComments(node)) {
      const value = comment.nodeValue ?? "";
      const matches = value.match(/^([0-9]+)$/);

      if (matches !== null) {
        const index = Number(matches[1]);
        const actual = this.template.values[index];
        const kind = actual instanceof Template ? "template" : "text";
        const start = new Comment();
        const end = new Comment();

        this.values[index] = { kind, start, end };

        comment.replaceWith(start, end);
      }
    }
  }
}
