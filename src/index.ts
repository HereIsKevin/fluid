// export { html, render };

// class Template {
//   public strings: TemplateStringsArray;
//   public values: unknown[];

//   public constructor(strings: TemplateStringsArray, values: unknown[]) {
//     this.strings = strings;
//     this.values = values;
//   }

//   public equalStrings(template: Template): boolean {
//     if (this.strings.length !== template.strings.length) {
//       return false;
//     }

//     for (let index = 0; index < this.strings.length; index++) {
//       if (this.strings[index] !== template.strings[index]) {
//         return false;
//       }
//     }

//     return true;
//   }

//   public generate(): DocumentFragment {
//     let result = this.strings[0];

//     for (let index = 1; index < this.strings.length; index++) {
//       result += `<!--${index - 1}-->`;
//       result += this.strings[index];
//     }

//     const template = document.createElement("template");
//     template.innerHTML = result;

//     return template.content;
//   }
// }

// function html(strings: TemplateStringsArray, ...values: unknown[]): Template {
//   return new Template(strings, values);
// }

// type Updater = (oldValue: unknown, newValue: unknown) => void;

// class Compiler {
//   updaters: Record<number, Updater>;

//   template: Template;
//   fragment: DocumentFragment;

//   constructor(template: Template) {
//     this.updaters = {};

//     this.template = template;
//     this.fragment = this.template.generate();

//     this.compile(this.fragment);
//   }

//   compile(node: Node): void {
//     if (node instanceof Element) {
//       this.compileAttribute(node);
//     }

//     this.compileValues(node);

//     for (const child of node.childNodes) {
//       this.compile(child);
//     }
//   }

//   compileAttribute(element: Element): void {
//     for (const attribute of element.getAttributeNames()) {
//       const value = element.getAttribute(attribute) ?? "";
//       const matches = value.match(/^<!--([0-9]+)-->$/);

//       if (matches !== null) {
//         const index = Number(matches[1]);

//         const eventMatches = attribute.match(/^@(.+)$/);
//         const toggleMatches = attribute.match(/^(.+)\?$/);

//         element.removeAttribute(attribute);

//         if (eventMatches !== null) {
//           const name = eventMatches[1];

//           this.updaters[index] = (oldValue, newValue) => {
//             if (typeof oldValue !== "undefined") {
//               element.removeEventListener(name, oldValue as EventListener);
//             }

//             element.addEventListener(name, newValue as EventListener);
//           };
//         } else if (toggleMatches !== null) {
//           const name = toggleMatches[1];

//           this.updaters[index] = (oldValue, newValue) => {
//             if (newValue) {
//               element.removeAttribute(name);
//             } else {
//               element.setAttribute(name, "");
//             }
//           };
//         } else {
//           const name = attribute;

//           this.updaters[index] = (oldValue, newValue) => {
//             element.setAttribute(name, String(newValue));
//           };
//         }
//       }
//     }
//   }

//   compileValues(node: Node): void {
//     for (const child of [...node.childNodes]) {
//       if (child instanceof Comment) {
//         const value = child.nodeValue ?? "";
//         const matches = value.match(/^([0-9]+)$/);

//         if (matches !== null) {
//           const index = Number(matches[1]);

//           const start = child;
//           const end = new Comment();

//           child.nodeValue = "";
//           child.after(end);

//           const value = this.template.values[index];

//           if (value instanceof Template) {
//             this.updaters[index] = (oldValue, newValue) => {
//               renderTemplate(start, end, oldValue, newValue);
//             };
//           } else if (Array.isArray(value)) {
//             this.updaters[index] = (oldValue, newValue) => {
//               renderSequence(start, end, oldValue, newValue);
//             };
//           } else {
//             const text = new Text();
//             start.after(text);

//             this.updaters[index] = (oldValue, newValue) => {
//               text.nodeValue = String(newValue);
//             };
//           }
//         }
//       }
//     }
//   }
// }

// function render(target: Element, template: Template): void {
//   const template = templates.get(target);

//   if (!templates.has(target)) {
//     target.append(new Comment(), new Comment());
//   }

//   renderTemplate(target.firstChild, target.lastChild, )
// }

export { Template, html } from "./template";
export { render } from "./render";
