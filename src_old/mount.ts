export { mount };

import { Instance } from "./instance";
import { Template } from "./template";
import { BoundUpdater } from "./updater";
import { arrayEqual, clearBetween } from "./utilities";

interface Cache {
  strings: TemplateStringsArray;
  updaters: BoundUpdater[];
}

const caches = new WeakMap<Comment, Cache>();

function update(updaters: BoundUpdater[], values: unknown[]): void {
  for (let index = 0; index < values.length; index++) {
    const updater = updaters[index];
    const value = values[index];

    updater(value);
  }
}

function mount(start: Comment, end: Comment, template: Template): void {
  let cache = caches.get(start);

  if (
    typeof cache === "undefined" ||
    !arrayEqual(cache.strings, template.strings)
  ) {
    const instance = new Instance(template);

    clearBetween(start, end);
    start.after(instance.fragment);

    cache = {
      strings: template.strings,
      updaters: instance.updaters,
    };

    caches.set(start, cache);
  }

  update(cache.updaters, template.values);
}
