export { Instance };

import { Compiler } from "./compiler";
import { Template } from "./template";
import { CompiledUpdater } from "./updater";

const compilers: Compiler[] = [];

class Instance {
  public updaters: Record<number, CompiledUpdater>;

  public template: Template;
  public fragment: DocumentFragment;

  private compiler: Compiler;

  public constructor(template: Template) {
    this.updaters = {};

    this.template = template;
    this.compiler = this.getCompiler(this.template);
    this.fragment = this.compiler.fragment.cloneNode(true) as DocumentFragment;

    this.instantiate();
  }

  private getCompiler(template: Template): Compiler {
    for (const compiler of compilers) {
      if (compiler.template.equalStrings(template)) {
        return compiler;
      }
    }

    const compiler = new Compiler(template);
    compilers.unshift(compiler);

    return compiler;
  }

  private instantiate(): void {
    const targets = new Set<Element>();

    for (const key in this.compiler.updaters) {
      const { id, base } = this.compiler.updaters[key];
      const target = this.fragment.querySelector(
        `[data-fluid-id="${id}"]`
      ) as Element;

      let node: Node;

      if (target?.hasAttribute("data-fluid-replace")) {
        node = new Comment();
        target?.replaceWith(node);
      } else {
        node = target;
        targets.add(target);
      }

      this.updaters[key] = base(node);
    }

    for (const target of targets) {
      target.removeAttribute("data-fluid-id");
    }
  }
}
