export { compile };

import { Compiler, Instruction } from "./compiler";
import { Template } from "./template";
import { Updater } from "./updater";

const cache: Record<string, CachedTemplate> = {};

interface CachedTemplate {
  instructions: Record<string, Instruction[]>;
  fragment: DocumentFragment;
}

interface CompiledTemplate {
  updaters: Record<number, Updater>;
  fragment: DocumentFragment;
}

function initial(template: Template): CachedTemplate {
  const compiler = new Compiler(template);

  const interpolated = template.interpolate();
  const compiled = {
    instructions: compiler.instructions,
    fragment: compiler.fragment,
  };

  cache[interpolated] = compiled;

  return compiled;
}

function compile(template: Template): CompiledTemplate {
  const interpolated = template.interpolate();
  const cached = cache[interpolated] ?? initial(template);

  const updaters: Record<number, Updater> = {};
  const fragment = cached.fragment.cloneNode(true) as DocumentFragment;

  for (const target of fragment.querySelectorAll("[data-fluid-id]")) {
    const id = target.getAttribute("data-fluid-id");

    if (id === null) {
      continue;
    }

    for (const { index, base } of cached.instructions[id]) {
      updaters[index] = base(target);
    }

    target.removeAttribute("data-fluid-id");
  }

  return { updaters, fragment };
}
