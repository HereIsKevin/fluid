export { arrangement };

import { Directive } from "./directive";
import { Hole, clearNodes, renderTemplate } from "./render";
import { Template } from "./template";
import { BoundUpdater } from "./updater";

type Key = string | number;

type KeyGenerator = (value: unknown) => Key;
type TemplateGenerator = (value: unknown) => Template;

interface ArrangementValues {
  keys: Key[];
  templates: Template[];
}

function arrangementUpdater(node: Node): BoundUpdater {
  const oldKeys: Key[] = [];
  const holes: Hole[] = [];

  const startMarker = new Comment();
  const endMarker = new Comment();

  (node as ChildNode).replaceWith(startMarker, endMarker);

  return (value) => {
    const { keys, templates } = value as ArrangementValues;

    if (oldKeys.length === 0) {
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const template = templates[index];

        const start = new Comment();
        const end = new Comment();

        endMarker.before(start, end);
        renderTemplate(start, end, template);

        oldKeys.push(key);
        holes.push({ start, end });
      }

      return;
    }

    if (keys.length === 0) {
      clearNodes(startMarker, endMarker);

      keys.length = 0;
      holes.length = 0;

      return;
    }
  };
}

function arrangement(
  values: unknown[],
  keyGenerator: KeyGenerator,
  templateGenerator: TemplateGenerator
): Directive {
  const keys: Key[] = [];
  const templates: Template[] = [];

  for (const value of values) {
    keys.push(keyGenerator(value));
    templates.push(templateGenerator(value));
  }

  return {
    values: { keys, templates },
    base: arrangementUpdater,
  };
}
