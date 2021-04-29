export { InstanceAttribute, InstanceValue, Instance };

import { Compiler } from "./compiler";
import { Template } from "./template";

interface InstanceAttribute {
  kind: "event" | "toggle" | "value";
  element: Element;
  name: string;
}

interface InstanceValue {
  kind: "sequence" | "template" | "text";
  start: Comment;
  end: Comment;
}

const compilers: Compiler[] = [];

class Instance {
  public attributes: Record<number, InstanceAttribute>;
  public values: Record<number, InstanceValue>;

  public template: Template;
  public fragment: DocumentFragment;

  private compiler: Compiler;

  public constructor(template: Template) {
    this.attributes = {};
    this.values = {};

    this.template = template;
    this.compiler = this.getCompiler(this.template);
    this.fragment = this.compiler.fragment.cloneNode(true) as DocumentFragment;

    this.instantiateAttributes();
    this.instantiateValues();
  }

  private getCompiler(template: Template): Compiler {
    for (const compiler of compilers) {
      if (compiler.template.equalStrings(template)) {
        return compiler;
      }
    }

    const compiler = new Compiler(template);
    compilers.unshift(compiler);

    return compiler;
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

  private instantiateAttributes(): void {
    for (const key in this.compiler.attributes) {
      const { elementId, attribute } = this.compiler.attributes[key];
      const { kind, name } = this.matchAttribute(attribute);
      const element = this.fragment.querySelector(
        `[data-fluid-id="${elementId}"]`
      );

      if (element === null) {
        throw new Error("cached fragment missing element");
      }

      this.attributes[key] = { kind, element, name };
    }

    for (const { element } of Object.values(this.attributes)) {
      element.removeAttribute("data-fluid-id");
    }
  }

  private matchValue(value: unknown): "sequence" | "template" | "text" {
    if (Array.isArray(value)) {
      return "sequence";
    } else if (value instanceof Template) {
      return "template";
    } else {
      return "text";
    }
  }

  private instantiateValues(): void {
    for (const key in this.compiler.values) {
      const { nodeId } = this.compiler.values[key];
      const kind = this.matchValue(this.template.values[key]);

      const start = new Comment();
      const end = new Comment();

      this.fragment
        .querySelector(`[data-fluid-id="${nodeId}"`)
        ?.replaceWith(start, end);

      this.values[key] = { kind, start, end };
    }
  }
}
