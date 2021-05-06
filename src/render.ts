export {
  Arrangement,
  renderArrangement,
  renderSequence,
  renderTemplate,
  render,
};

import { Instance } from "./instance";
import { Template } from "./template";
import { BoundUpdater } from "./updater";

type Key = string | number;
type Arrangement = [Key, Template];

interface Hole {
  start: Comment;
  end: Comment;
}

interface Burrow {
  key: Key;
  start: Comment;
  end: Comment;
}

interface Cache {
  template: Template;
  updaters: Record<number, BoundUpdater>;
}

const holes = new WeakMap<Element, Hole>();
const burrows = new WeakMap<Comment, Burrow[]>();
const caches = new WeakMap<Comment, Cache>();
const sequences = new WeakMap<Comment, Hole[]>();

function clearNodes(start: Node, end: Node): void {
  let current = start.nextSibling;

  while (current !== null && current !== end) {
    current.remove();
    current = start.nextSibling;
  }
}

function renderArrangement(
  startMarker: Comment,
  endMarker: Comment,
  arrangements: Arrangement[]
): void {
  const burrow = burrows.get(startMarker);

  if (typeof burrow === "undefined" || burrow.length === 0) {
    const burrow: Burrow[] = [];

    for (const [key, template] of arrangements) {
      const start = new Comment();
      const end = new Comment();

      endMarker.before(start, end);
      renderTemplate(start, end, template);

      burrow.push({ key, start, end });
    }

    burrows.set(startMarker, burrow);

    return;
  }

  if (arrangements.length === 0) {
    clearNodes(startMarker, endMarker);

    if (typeof burrow !== "undefined") {
      burrow.length = 0;
    }

    return;
  }

  const oldKeys = burrow.map((value) => value.key);
  const newKeys = arrangements.map((value) => value[0]);

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex <= oldKeys.length && newIndex <= newKeys.length) {
    const oldKey = oldKeys[oldIndex];
    const newKey = newKeys[newIndex];

    if (typeof oldKey === "undefined" && typeof newKey === "undefined") {
      break;
    }

    if (oldKey === newKey) {
      const { start, end } = burrow[oldIndex];
      const template = arrangements[newIndex][1];

      renderTemplate(start, end, template);

      oldIndex++;
      newIndex++;
    } else if (oldKeys.length < newKeys.length) {
      const marker = burrow[oldIndex]?.start ?? endMarker;
      const start = new Comment();
      const end = new Comment();

      marker.before(start, end);
      burrow.splice(oldIndex, 0, { key: newKey, start, end });

      oldKeys.splice(oldIndex, 0, newKey);
    } else {
      const { start, end } = burrow.splice(oldIndex, 1)[0];

      clearNodes(start, end);

      start.remove();
      end.remove();

      oldKeys.splice(oldIndex, 1);
    }
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
