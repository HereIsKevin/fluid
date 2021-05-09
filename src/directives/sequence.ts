export { SequenceDirective };

import { mount } from "../mount";
import { Template } from "../template";

import { BoundDirective, ValueDirective } from "./base";

interface Hole {
  start: Comment;
  end: Comment;
}

class SequenceDirective extends ValueDirective<Template[]> {
  public static transformer = {
    verifier: (value: unknown) => Array.isArray(value),
  };

  public attach(node: ChildNode): BoundDirective<Template[]> {
    const holes: Hole[] = [];

    const startMarker = new Comment();
    const endMarker = new Comment();

    node.replaceWith(startMarker, endMarker);

    return (templates: Template[]) => {
      if (holes.length === 0) {
        for (const template of templates) {
          const start = new Comment();
          const end = new Comment();

          endMarker.before(start, end);
          mount(start, end, template);

          holes.push({ start, end });
        }

        return;
      }

      if (templates.length === 0) {
        let current = startMarker.nextSibling;

        while (current !== null && current !== endMarker) {
          current.remove();
          current = startMarker.nextSibling;
        }

        holes.length = 0;

        return;
      }

      if (templates.length < holes.length) {
        const start = holes[templates.length].start;
        const end = holes[holes.length - 1].end;

        let current = start.nextSibling;

        while (current !== null && current !== end) {
          current.remove();
          current = start.nextSibling;
        }

        start.remove();
        end.remove();

        holes.length = templates.length;
      }

      while (templates.length > holes.length) {
        const start = new Comment();
        const end = new Comment();

        endMarker.before(start, end);

        holes.push({ start, end });
      }

      for (let index = 0; index < holes.length; index++) {
        const { start, end } = holes[index];
        const template = templates[index];

        mount(start, end, template);
      }
    };
  }
}
