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

function renderSequence(
  start: Comment,
  end: Comment,
  oldTemplates: Template[],
  newTemplates: Template[]
): void {
  if (start.nextSibling === end) {
    for (const template of newTemplates) {
      const separator = new Comment("separator");

      end.before(separator);
      renderTemplate(separator, end, template);
    }

    return;
  }

  const separators: Comment[] = [];

  let current = start.nextSibling;

  while (current !== null && current !== end) {
    if (current instanceof Comment && current.nodeValue === "separator") {
      separators.push(current);
    }

    current = current.nextSibling;
  }

  let length = newTemplates.length;

  while (length > oldTemplates.length) {
    const separator = separators[separators.length - 1];

    while (end.previousSibling !== null && end.previousSibling !== separator) {
      end.previousSibling.remove();
    }

    separator.remove();
    separators.pop();
    length--;
  }

  while (length < newTemplates.length) {
    const separator = new Comment("separator");

    end.before(separator);
    renderTemplate(separator, end, newTemplates[length - 1]);

    separators.push(separator);
    length++;
  }

  for (let index = 0; index < separators.length; index++) {
    const startSeparator = separators[index];
    const endSeparator = separators[index + 1] ?? end;
    const template = newTemplates[index];

    renderTemplate(startSeparator, endSeparator, template);
  }
}

function renderValues(
  { kind, start, end }: CompiledValue,
  oldValue: unknown,
  newValue: unknown
): void {
  if (kind === "sequence") {
    renderSequence(start, end, oldValue as Template[], newValue as Template[]);
  } else if (kind === "template") {
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

function arrayEqual(
  firstArray: ArrayLike<unknown>,
  secondArray: ArrayLike<unknown>
): boolean {
  if (firstArray.length !== secondArray.length) {
    return false;
  }

  for (let index = 0; index < firstArray.length; index++) {
    const firstValue = firstArray[index];
    const secondValue = secondArray[index];

    if (firstValue !== secondValue) {
      return false;
    }
  }

  return true;
}

function renderTemplate(
  start: Comment,
  end: Comment,
  template: Template
): void {
  let rendered = true;
  let cache = caches.get(start);

  if (
    typeof cache === "undefined" ||
    !arrayEqual(cache.template.strings, template.strings)
  ) {
    const compiler = new Compiler(template);

    let current = start.nextSibling;

    while (current !== null && current !== end) {
      current.remove();
      current = start.nextSibling;
    }

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
