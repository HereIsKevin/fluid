export { register };

import { Compiler } from "./compiler";
import { ElementDirective, ValueDirective } from "./directives/base";

function register(
  directive: typeof ElementDirective | typeof ValueDirective
): void {
  if (directive.transformer === undefined) {
    throw new Error("cannot register directive");
  }

  if ("extractor" in directive.transformer) {
    Compiler.elementDirectives.push(directive as typeof ElementDirective);
  } else {
    Compiler.valueDirectives.push(directive as typeof ValueDirective);
  }
}
