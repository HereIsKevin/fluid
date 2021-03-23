export { Template, html };

class Template {
  public strings: TemplateStringsArray;
  public values: unknown[];

  public constructor(strings: TemplateStringsArray, values: unknown[]) {
    this.strings = strings;
    this.values = values;
  }

  public generate(): DocumentFragment {
    let result = this.strings[0];

    for (let index = 1; index < this.strings.length; index++) {
      result += `<!--${index - 1}-->`;
      result += this.strings[index];
    }

    const template = document.createElement("template");
    template.innerHTML = result;

    return template.content;
  }
}

function html(strings: TemplateStringsArray, ...values: unknown[]): Template {
  return new Template(strings, values);
}
