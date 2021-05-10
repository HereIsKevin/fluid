export { Compiler, Instruction };

import { Template } from "./template";
import {
  Base,
  attributeUpdater,
  eventUpdater,
  propertyUpdater,
  referenceUpdater,
  sequenceUpdater,
  templateUpdater,
  textUpdater,
  toggleUpdater,
} from "./updater";

interface Instruction {
  index: number;
  base: Base;
}

class Compiler {
  public instructions: Record<string, Instruction[]>;

  public template: Template;
  public fragment: DocumentFragment;

  public constructor(template: Template) {
    this.instructions = {};

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
    let id: string | undefined;

    for (const attribute of element.getAttributeNames()) {
      const value = element.getAttribute(attribute) ?? "";
      const matches = value.match(/^<!--([0-9]+)-->$/);

      if (matches !== null) {
        if (typeof id === "undefined") {
          id = matches[1];
          this.instructions[id] = [];

          element.setAttribute("data-fluid-id", id);
        }

        const index = Number(matches[1]);

        const eventMatches = attribute.match(/^@(.+)$/);
        const toggleMatches = attribute.match(/^(.+)\?$/);
        const propertyMatches = attribute.match(/^\.(.+)$/);

        element.removeAttribute(attribute);

        let base: Base;

        if (eventMatches !== null) {
          base = eventUpdater(eventMatches[1]);
        } else if (toggleMatches !== null) {
          base = toggleUpdater(toggleMatches[1]);
        } else if (propertyMatches !== null) {
          base = propertyUpdater(propertyMatches[1]);
        } else if (attribute === "ref") {
          base = referenceUpdater();
        } else {
          base = attributeUpdater(attribute);
        }

        this.instructions[id].push({ index, base });

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

        const id = matches[1];
        const node = document.createElement("span");

        node.setAttribute("data-fluid-id", id);

        let base: Base;

        if (Array.isArray(actual)) {
          base = sequenceUpdater();
        } else if (actual instanceof Template) {
          base = templateUpdater();
        } else {
          base = textUpdater();
        }

        this.instructions[id] = [{ index, base }];

        comment.replaceWith(node);
      }
    }
  }
}
