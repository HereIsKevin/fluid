export { renderSequence, renderTemplate, render };

import { Instance } from "./instance";
import { Template } from "./template";
import { BoundUpdater } from "./updater";

interface Hole {
  start: Comment;
  end: Comment;
}

interface Cache {
  template: Template;
  updaters: Record<number, BoundUpdater>;
}

const holes = new WeakMap<Element, Hole>();
const caches = new WeakMap<Comment, Cache>();
const sequences = new WeakMap<Comment, Hole[]>();

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
  templates: Template[]
): void {
  const sequence = sequences.get(startMarker);

  if (typeof sequence === "undefined" || sequence.length === 0) {
    const sequence: Hole[] = [];

    for (const template of templates) {
      const start = new Comment();
      const end = new Comment();

      endMarker.before(start, end);
      renderTemplate(start, end, template);

      sequence.push({ start, end });
    }

    sequences.set(startMarker, sequence);

    return;
  }

  if (templates.length === 0) {
    clearNodes(startMarker, endMarker);

    if (typeof sequence !== "undefined") {
      sequence.length = 0;
    }

    return;
  }

  if (templates.length < sequence.length) {
    const start = sequence[templates.length].start;
    const end = sequence[sequence.length - 1].end;

    clearNodes(start, end);

    start.remove();
    end.remove();

    sequence.length = templates.length;
  }

  while (templates.length > sequence.length) {
    const start = new Comment();
    const end = new Comment();

    endMarker.before(start, end);
    renderTemplate(start, end, templates[sequence.length]);

    sequence.push({ start, end });
  }

  for (let index = 0; index < sequence.length; index++) {
    const { start, end } = sequence[index];

    renderTemplate(start, end, templates[index]);
  }
}

function renderTemplate(
  start: Comment,
  end: Comment,
  template: Template
): void {
  const cache = caches.get(start);

  if (typeof cache === "undefined" || !cache.template.equals(template)) {
    const instance = new Instance(template);

    clearNodes(start, end);
    start.after(instance.fragment);

    for (let index = 0; index < template.values.length; index++) {
      const updater = instance.updaters[index];
      const value = template.values[index];

      updater(value);
    }

    caches.set(start, { template, updaters: instance.updaters });

    return;
  }

  for (let index = 0; index < template.values.length; index++) {
    const oldValue = cache.template.values[index];
    const newValue = template.values[index];

    if (oldValue !== newValue) {
      const updater = cache.updaters[index];

      updater(newValue);
    }
  }

  cache.template = template;
}

function render(target: Element, template: Template): void {
  let hole = holes.get(target);

  if (typeof hole === "undefined") {
    const start = new Comment();
    const end = new Comment();

    target.append(start, end);
    hole = { start, end };

    holes.set(target, hole);
  }

  renderTemplate(hole.start, hole.end, template);
}
