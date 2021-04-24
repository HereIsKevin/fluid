export { render };

import { CompiledAttribute, CompiledValue, Compiler } from "./compiler";
import { Template } from "./template";

interface RenderCache {
  attributes: Record<number, CompiledAttribute>;
  values: Record<number, CompiledValue>;
}

const templates = new WeakMap<Element, Template>();
const caches = new WeakMap<Comment, RenderCache>();

function clearElement(element: Element): void {
  while (element.firstChild) {
    element.firstChild.remove();
  }
}

function clearNodes(start: Node, end: Node): void {
  let current = start.nextSibling;

  while (current !== null && current !== end) {
    current.remove();
    current = start.nextSibling;
  }
}

function renderTemplate(
  start: Comment,
  end: Comment,
  oldTemplate: Template | undefined,
  newTemplate: Template
): void {
  if (
    typeof oldTemplate === "undefined" ||
    !oldTemplate.equalStrings(newTemplate)
  ) {
    clearNodes(start, end);

    const compiler = new Compiler(newTemplate);
    const cache = {
      attributes: compiler.attributes,
      values: compiler.values,
    };

    start.after(compiler.fragment);

    for (let index = 0; index < newTemplate.values.length; index++) {
      const value = newTemplate.values[index];

      if (index in cache.attributes) {
        renderAttribute(cache.attributes[index], undefined, value);
      } else if (index in cache.values) {
        renderValue(cache.values[index], undefined, value);
      }
    }

    caches.set(start, cache);

    return;
  }

  const cache = caches.get(start);

  if (typeof cache === "undefined") {
    throw new Error("render cache is missing");
  }

  for (let index = 0; index < newTemplate.values.length; index++) {
    const oldValue = oldTemplate.values[index];
    const newValue = newTemplate.values[index];

    if (oldValue !== newValue) {
      if (index in cache.attributes) {
        renderAttribute(cache.attributes[index], oldValue, newValue);
      } else if (index in cache.values) {
        renderValue(cache.values[index], oldValue, newValue);
      }
    }
  }
}

function renderText(start: Comment, end: Comment, value: string): void {
  const next = start.nextSibling;

  if (next instanceof Text && next.nextSibling === end) {
    next.nodeValue = value;
  } else {
    clearNodes(start, end);
    start.after(new Text(value));
  }
}

function renderValue(
  { kind, start, end }: CompiledValue,
  oldValue: unknown,
  newValue: unknown
): void {
  if (kind === "template") {
    renderTemplate(start, end, oldValue as Template, newValue as Template);
  } else if (kind === "text") {
    renderText(start, end, String(newValue));
  }
}

function renderAttribute(
  { kind, name, element }: CompiledAttribute,
  oldValue: unknown,
  newValue: unknown
): void {
  if (kind === "event") {
    if (typeof oldValue !== "undefined") {
      element.removeEventListener(name, oldValue as EventListener);
    }

    element.addEventListener(name, newValue as EventListener);
  } else if (kind === "toggle") {
    if (newValue) {
      element.setAttribute(name, "");
    } else {
      element.removeAttribute(name);
    }
  } else if (kind === "value") {
    element.setAttribute(name, String(newValue));
  }
}

function render(target: Element, template: Template): void {
  if (!templates.has(target)) {
    clearElement(target);
    target.append(new Comment(), new Comment());
  }

  const start = target.firstChild;
  const end = target.lastChild;

  if (start instanceof Comment && end instanceof Comment) {
    renderTemplate(start, end, templates.get(target), template);
  } else {
    throw new Error("start or end markers missing");
  }

  templates.set(target, template);
}
