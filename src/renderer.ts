export { RendererAttribute, RendererValue, Renderer };

import { Template } from "./template";

interface RendererAttribute {
  element: Element;
  name: string;
}

interface RendererValue {
  start: Comment;
  end: Comment;
}

class Renderer {
  protected static instances: WeakMap<Comment, Renderer> = new WeakMap();
  protected static values: WeakMap<Comment, unknown[]> = new WeakMap();

  protected attributes: Record<number, RendererAttribute>;
  protected values: Record<number, RendererValue>;

  protected fragment?: DocumentFragment;

  public constructor(template: Template) {
    this.attributes = {};
    this.values = {};

    this.fragment = template.generate();
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
        const attribute = { element, name };

        this.attributes[index] = attribute;
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
          const value = { start, end };

          this.values[index] = value;
        }
      }

      current = current.nextSibling;
    }
  }

  private clearNodes(start: Comment, end: Comment) {
    let current = start.nextSibling;

    while (current !== null && current !== end) {
      current.remove();
      current = start.nextSibling;
    }
  }

  private updateAttribute(
    { element, name }: RendererAttribute,
    oldValue: unknown,
    newValue: unknown
  ): void {
    element.setAttribute(name, String(newValue));
  }

  private updateValue(
    { start, end }: RendererValue,
    oldValue: unknown,
    newValue: unknown
  ): void {
    if (typeof newValue === "string") {
      if (typeof oldValue !== "string") {
        this.clearNodes(start, end);
      }

      if (start.nextSibling !== null && start.nextSibling !== end) {
        start.nextSibling.nodeValue = newValue;
      } else {
        start.after(new Text(newValue));
      }
    } else if (newValue instanceof Template) {
      if (!(oldValue instanceof Template)) {
        this.clearNodes(start, end);
      }

      let instance = Renderer.instances.get(start);

      if (typeof instance === "undefined") {
        instance = new Renderer(newValue);
      }

      instance.renderRange(start, end, newValue.values);
    }
  }

  public update(index: number, oldValue: unknown, newValue: unknown): void {
    if (index in this.attributes) {
      this.updateAttribute(this.attributes[index], oldValue, newValue);
    } else if (index in this.values) {
      this.updateValue(this.values[index], oldValue, newValue);
    }
  }

  private renderRange(start: Comment, end: Comment, newValues: unknown[]) {
    const oldValues = Renderer.values.get(start) ?? [];

    Renderer.values.set(start, newValues);
    Renderer.instances.set(start, this);

    if (typeof this.fragment !== "undefined") {
      start.after(this.fragment);
      this.fragment = undefined;
    }

    for (let index = 0; index < newValues.length; index++) {
      const oldValue = oldValues[index];
      const newValue = newValues[index];

      if (oldValue !== newValue) {
        this.update(index, oldValue, newValue);
      }
    }
  }

  public render(target: Element, values: unknown[]): void {
    if (!(target.firstChild instanceof Comment)) {
      target.append(new Comment());
    }

    if (
      target.lastChild === target.firstChild ||
      !(target.lastChild instanceof Comment)
    ) {
      target.append(new Comment());
    }

    this.renderRange(
      target.firstChild as Comment,
      target.lastChild as Comment,
      values
    );
  }
}
