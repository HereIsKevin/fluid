export { Instance };

import { Compiler } from "./compiler";
import { Template } from "./template";
import { BoundUpdater } from "./updater";
import { arrayEqual } from "./utilities";

class Instance {
  private static compilers: Compiler[] = [];

  public updaters: BoundUpdater[];

  public template: Template;
  public fragment: DocumentFragment;

  private compiler: Compiler;

  public constructor(template: Template) {
    this.updaters = [];

    this.template = template;
    this.compiler = this.getCompiler(this.template);
    this.fragment = this.compiler.fragment.cloneNode(true) as DocumentFragment;

    this.instantiate();
  }

  private getCompiler(template: Template): Compiler {
    for (const compiler of Instance.compilers) {
      if (arrayEqual(compiler.template.strings, template.strings)) {
        return compiler;
      }
    }

    const compiler = new Compiler(template);
    Instance.compilers.push(compiler);

    return compiler;
  }

  private instantiate(): void {
    for (const target of this.fragment.querySelectorAll("[data-fluid-id]")) {
      const id = Number(target.getAttribute("data-fluid-id"));

      for (const { index, base } of this.compiler.updaters[id]) {
        this.updaters[index] = base(target);
      }

      target.removeAttribute("data-fluid-id");
    }
  }
}
