export { mount };

import { clearBetween } from "./helper";
import { compile } from "./instance";
import { Template } from "./template";
import { Updater } from "./updater";

interface Cache {
  interpolated: string;
  updaters: Record<number, Updater>;
}

const caches = new WeakMap<Comment, Cache>();

function mount(start: Comment, end: Comment, template: Template): void {
  let cache = caches.get(start);

  const interpolated = template.interpolate();

  if (typeof cache === "undefined" || cache.interpolated !== interpolated) {
    const { updaters, fragment } = compile(template);

    clearBetween(start, end);
    start.after(fragment);

    cache = { interpolated, updaters };
    caches.set(start, cache);
  }

  for (let index = 0; index < template.values.length; index++) {
    const updater = cache.updaters[index];
    const value = template.values[index];

    updater(value);
  }
}
