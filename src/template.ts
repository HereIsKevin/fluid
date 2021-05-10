export { Template, html };

class Template {
  public strings: TemplateStringsArray;
  public values: unknown[];

  private interpolated?: string;

  public constructor(strings: TemplateStringsArray, values: unknown[]) {
    this.strings = strings;
    this.values = values;
  }

  public interpolate(): string {
    if (this.interpolated === undefined) {
      this.interpolated = this.strings[0];

      for (let index = 1; index < this.strings.length; index++) {
        this.interpolated += `<!--${index - 1}-->`;
        this.interpolated += this.strings[index];
      }
    }

    return this.interpolated;
  }

  public generate(): DocumentFragment {
    const template = document.createElement("template");
    template.innerHTML = this.interpolate();

    return template.content;
  }
}

function html(strings: TemplateStringsArray, ...values: unknown[]): Template {
  return new Template(strings, values);
}
