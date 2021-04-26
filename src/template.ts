export { Template, html };

class Template {
  private static cache: Record<string, DocumentFragment> = {};

  public strings: TemplateStringsArray;
  public values: unknown[];

  public constructor(strings: TemplateStringsArray, values: unknown[]) {
    this.strings = strings;
    this.values = values;
  }

  public equalStrings(template: Template): boolean {
    if (this.strings.length !== template.strings.length) {
      return false;
    }

    for (let index = 0; index < this.strings.length; index++) {
      if (this.strings[index] !== template.strings[index]) {
        return false;
      }
    }

    return true;
  }

  public generate(): DocumentFragment {
    let result = this.strings[0];

    for (let index = 1; index < this.strings.length; index++) {
      result += `<!--${index - 1}-->`;
      result += this.strings[index];
    }

    const cached = Template.cache[result];

    if (typeof cached == "undefined") {
      const template = document.createElement("template");
      template.innerHTML = result;

      const fragment = template.content;
      Template.cache[result] = fragment;

      return fragment.cloneNode(true) as DocumentFragment;
    } else {
      return cached.cloneNode(true) as DocumentFragment;
    }
  }
}

function html(strings: TemplateStringsArray, ...values: unknown[]): Template {
  return new Template(strings, values);
}
