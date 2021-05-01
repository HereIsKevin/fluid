export { Compiler, Updater };

import { Template } from "./template";
import {
  BaseUpdater,
  attributeUpdater,
  eventUpdater,
  sequenceUpdater,
  templateUpdater,
  textUpdater,
  toggleUpdater,
} from "./updater";

interface Updater {
  id: string;
  base: BaseUpdater;
}

class Compiler {
  public updaters: Record<number, Updater>;

  public template: Template;
  public fragment: DocumentFragment;

  private id: number;

  public constructor(template: Template) {
    this.updaters = {};

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
    let id: string | undefined;

    for (const attribute of element.getAttributeNames()) {
      const value = element.getAttribute(attribute) ?? "";
      const matches = value.match(/^<!--([0-9]+)-->$/);

      if (matches !== null) {
        if (typeof id === "undefined") {
          id = this.createId();
          element.setAttribute("data-fluid-id", id);
        }

        const index = Number(matches[1]);

        const eventMatches = attribute.match(/^@(.+)$/);
        const toggleMatches = attribute.match(/^(.+)\?$/);

        element.removeAttribute(attribute);

        if (eventMatches !== null) {
          this.updaters[index] = { id, base: eventUpdater(eventMatches[1]) };
        } else if (toggleMatches !== null) {
          this.updaters[index] = { id, base: toggleUpdater(toggleMatches[1]) };
        } else {
          this.updaters[index] = { id, base: attributeUpdater(attribute) };
        }

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

        const id = this.createId();
        const node = document.createElement("span");

        node.setAttribute("data-fluid-id", id);
        node.setAttribute("data-fluid-replace", "");

        if (Array.isArray(actual)) {
          this.updaters[index] = { id, base: sequenceUpdater() };
        } else if (actual instanceof Template) {
          this.updaters[index] = { id, base: templateUpdater() };
        } else {
          this.updaters[index] = { id, base: textUpdater() };
        }

        comment.replaceWith(node);
      }
    }
  }
}
