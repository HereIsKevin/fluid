export { render };

import { mount } from "./mount";
import { Template } from "./template";

interface Cache {
  start: Comment;
  end: Comment;
}

const caches = new WeakMap<Element, Cache>();

function render(target: Element, template: Template): void {
  let cache = caches.get(target);

  if (typeof cache === "undefined") {
    const start = new Comment();
    const end = new Comment();

    target.append(start, end);
    cache = { start, end };

    caches.set(target, cache);
  }

  mount(cache.start, cache.end, template);
}
