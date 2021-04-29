export { CompiledAttribute, CompiledValue, Compiler };

import { Template } from "./template";

interface CompiledAttribute {
  elementId: string;
  attribute: string;
}

interface CompiledValue {
  nodeId: string;
}

class Compiler {
  public attributes: Record<number, CompiledAttribute>;
  public values: Record<number, CompiledValue>;

  public template: Template;
  public fragment: DocumentFragment;

  private id: number;

  public constructor(template: Template) {
    this.attributes = {};
    this.values = {};

    this.template = template;
    this.fragment = this.template.generate();

    this.id = 0;

    this.compile(this.fragment);
  }

  private createId(): string {
    const id = String(this.id);
    this.id++;

    return id;
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
    let elementId: string | undefined;
    const originalId = element.id;

    for (const attribute of element.getAttributeNames()) {
      const value = element.getAttribute(attribute) ?? "";
      const matches = value.match(/^<!--([0-9]+)-->$/);

      if (matches !== null) {
        if (typeof elementId === "undefined") {
          elementId = this.createId();
          element.setAttribute("data-fluid-id", elementId);
        }

        const index = Number(matches[1]);

        this.attributes[index] = { elementId, attribute };

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

        const nodeId = this.createId();
        const node = document.createElement("span");

        node.setAttribute("data-fluid-id", nodeId);

        this.values[index] = { nodeId };

        comment.replaceWith(node);
      }
    }
  }
}
