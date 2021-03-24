export { render };

import { CompiledAttribute, CompiledValue, Compiler } from "./compiler";
import { Template } from "./template";

interface RenderCache {
  attributes: Record<number, CompiledAttribute>;
  values: Record<number, CompiledValue>;
  template: Template;
}

const rendered = new WeakSet<Node>();
const caches = new WeakMap<Comment, RenderCache>();

function renderAttribute(
  { kind, element, name }: CompiledAttribute,
  oldValue: unknown,
  newValue: unknown
): void {
  if (kind === "event") {
    element.removeEventListener(name, oldValue as EventListener);
    element.addEventListener(name, newValue as EventListener);
  } else if (kind === "toggle") {
    if (Boolean(newValue)) {
      element.setAttribute(name, "");
    } else {
      element.removeAttribute(name);
    }
  } else if (kind === "value") {
    element.setAttribute(name, String(newValue));
  }
}

function renderValues(
  { kind, start, end }: CompiledValue,
  oldValue: unknown,
  newValue: unknown
): void {
  if (kind === "template") {
    if (newValue instanceof Template) {
      renderTemplate(start, end, newValue);
    } else {
      throw new Error("value must remain as a template");
    }
  } else if (kind === "text") {
    const value = String(newValue);

    if (start.nextSibling === null || start.nextSibling === end) {
      start.after(new Text(value));
    } else {
      start.nextSibling.nodeValue = value;
    }
  }
}

function renderTemplate(
  start: Comment,
  end: Comment,
  template: Template
): void {
  let rendered = true;
  let cache = caches.get(start);

  if (typeof cache === "undefined") {
    const compiler = new Compiler(template);

    rendered = false;
    cache = {
      attributes: compiler.attributes,
      values: compiler.values,
      template: compiler.template,
    };

    start.after(compiler.fragment);
  }

  const oldValues = cache.template.values;
  const newValues = template.values;

  for (let index = 0; index < newValues.length; index++) {
    const oldValue = oldValues[index];
    const newValue = newValues[index];

    if (oldValue === newValue && rendered) {
      continue;
    }

    if (index in cache.attributes) {
      renderAttribute(cache.attributes[index], oldValue, newValue);
    } else if (index in cache.values) {
      renderValues(cache.values[index], oldValue, newValue);
    } else {
      throw new Error("index does not exist in template");
    }
  }

  cache.template = template;
  caches.set(start, cache);
}

function render(target: Element, template: Template): void {
  if (!rendered.has(target)) {
    while (target.firstChild) {
      target.firstChild.remove();
    }

    target.append(new Comment(), new Comment());
    rendered.add(target);
  }

  const start = target.firstChild;
  const end = target.lastChild;

  if (start instanceof Comment && end instanceof Comment) {
    renderTemplate(start, end, template);
  } else {
    throw new Error("start and end markers are missing");
  }
}
