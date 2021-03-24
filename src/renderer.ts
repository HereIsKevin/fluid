export { render };

import { Template } from "./template";
import {
  CompiledAttribute,
  CompiledTemplate,
  CompiledValue,
} from "./compiled-template";

const compiledCache = new WeakMap<Comment, CompiledTemplate>();
const templateCache = new WeakMap<Comment, Template>();

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
    renderRange(start, end, newValue as Template);
  } else if (kind === "text") {
    if (start.nextSibling === null || start.nextSibling === end) {
      start.after(new Text(String(newValue)));
    } else {
      start.nextSibling.nodeValue = String(newValue);
    }
  }
}

function renderRange(start: Comment, end: Comment, template: Template): void {
  let compiled = compiledCache.get(start);

  if (typeof compiled === "undefined") {
    compiled = new CompiledTemplate(template);
    start.after(compiled.fragment);
  }

  const oldValues = templateCache.get(start)?.values ?? [];
  const newValues = template.values;

  for (let index = 0; index < newValues.length; index++) {
    const oldValue = oldValues[index];
    const newValue = newValues[index];

    if (oldValues.length === 0 || oldValue !== newValue) {
      if (index in compiled.attributes) {
        renderAttribute(compiled.attributes[index], oldValue, newValue);
      } else if (index in compiled.values) {
        renderValues(compiled.values[index], oldValue, newValue);
      }
    }
  }

  compiledCache.set(start, compiled);
  templateCache.set(start, template);
}

function render(target: Element, template: Template): void {
  if (target.childNodes.length === 0) {
    while (target.firstChild) {
      target.firstChild.remove();
    }

    target.append(new Comment(), new Comment());
  }

  const start = target.firstChild;
  const end = target.lastChild;

  if (start instanceof Comment && end instanceof Comment) {
    renderRange(start, end, template);
  }
}
