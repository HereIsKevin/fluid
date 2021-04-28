export { render };

import { InstanceAttribute, InstanceValue, Instance } from "./instance";
import { Template } from "./template";

interface Cache {
  attributes: Record<number, InstanceAttribute>;
  values: Record<number, InstanceValue>;
}

interface Sequence {
  start: Comment;
  end: Comment;
}

const templates = new WeakMap<Element, Template>();
const caches = new WeakMap<Comment, Cache>();
const sequences = new WeakMap<Comment, Sequence[]>();

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

function renderSequence(
  startMarker: Comment,
  endMarker: Comment,
  oldTemplates: Template[] | undefined,
  newTemplates: Template[]
): void {
  if (typeof oldTemplates === "undefined" || oldTemplates.length === 0) {
    clearNodes(startMarker, endMarker);

    const sequence: Sequence[] = [];

    for (const template of newTemplates) {
      const start = new Comment();
      const end = new Comment();

      endMarker.before(start, end);
      renderTemplate(start, end, undefined, template);

      sequence.push({ start, end });
    }

    sequences.set(startMarker, sequence);

    return;
  }

  if (newTemplates.length === 0) {
    clearNodes(startMarker, endMarker);
    sequences.set(startMarker, []);

    return;
  }

  const sequence = sequences.get(startMarker);

  if (typeof sequence === "undefined") {
    throw new Error("sequence missing");
  }

  while (newTemplates.length < sequence.length) {
    const popped = sequence.pop();

    if (typeof popped === "undefined") {
      throw new Error("cannot align sequence length");
    }

    const { start, end } = popped;

    clearNodes(start, end);

    start.remove();
    end.remove();
  }

  while (newTemplates.length > sequence.length) {
    const start = new Comment();
    const end = new Comment();

    endMarker.before(start, end);
    renderTemplate(start, end, undefined, newTemplates[sequence.length]);

    sequence.push({ start, end });
  }

  for (let index = 0; index < sequence.length; index++) {
    const { start, end } = sequence[index];
    const oldTemplate = oldTemplates[index];
    const newTemplate = newTemplates[index];

    renderTemplate(start, end, oldTemplate, newTemplate);
  }

  sequences.set(startMarker, sequence);
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

    const instance = new Instance(newTemplate);
    const cache = {
      attributes: instance.attributes,
      values: instance.values,
    };

    start.after(instance.fragment);

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
  { kind, start, end }: InstanceValue,
  oldValue: unknown,
  newValue: unknown
): void {
  if (kind === "sequence") {
    renderSequence(start, end, oldValue as Template[], newValue as Template[]);
  } else if (kind === "template") {
    renderTemplate(start, end, oldValue as Template, newValue as Template);
  } else if (kind === "text") {
    renderText(start, end, String(newValue));
  }
}

function renderAttribute(
  { kind, name, element }: InstanceAttribute,
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
