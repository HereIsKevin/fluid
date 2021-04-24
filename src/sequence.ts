export { Sequence };

import { clearNodes, renderTemplate } from "./render";
import { Template } from "./template";

interface Group {
  start: Comment;
  end: Comment;
}

class Sequence {
  private start: Comment;
  private end: Comment;

  private oldTemplates: Template[];
  private newTemplates: Template[];

  private groups: Group[];

  public constructor(start: Comment, end: Comment) {
    this.start = start;
    this.end = end;

    this.oldTemplates = [];
    this.newTemplates = [];

    this.groups = [];
  }

  private renderAll(): void {
    for (const template of this.newTemplates) {
      const start = new Comment();
      const end = new Comment();

      end.before(start, end);
      renderTemplate(start, end, undefined, template);

      this.groups.push({ start, end });
    }
  }

  private clearAll(): void {
    let current = this.start.nextSibling;

    while (current !== null && current !== this.end) {
      current.remove();
      current = this.start.nextSibling;
    }

    this.groups = [];
  }

  private findKeep(): [number, number][] {
    const points: [number, number][] = [];
    let last: [number, number] = [-1, -1];

    const oldLength = this.oldTemplates.length;
    const newLength = this.newTemplates.length;
    const length = Math.max(oldLength, newLength);

    outer: for (let x = 0; x < length; x++) {
      for (let y = 0; y < x; y++) {
        if (
          x < oldLength &&
          y < newLength &&
          last[0] < x &&
          last[1] < y &&
          this.oldTemplates[x].equalStrings(this.newTemplates[y])
        ) {
          last = [x, y];
          points.push(last);

          continue outer;
        } else if (
          y < oldLength &&
          x < newLength &&
          last[0] < y &&
          last[1] < x &&
          this.oldTemplates[y].equalStrings(this.newTemplates[x])
        ) {
          last = [y, x];
          points.push(last);

          continue outer;
        }
      }

      if (
        x < oldLength &&
        x < newLength &&
        last[0] < x &&
        last[1] < x &&
        this.oldTemplates[x].equalStrings(this.newTemplates[x])
      ) {
        last = [x, x];
        points.push(last);
      }
    }

    return points;
  }

  private updateAll(): void {
    const keep = this.findKeep();
    const keepOld = keep.map((x) => x[0]);
    const keepNew = keep.map((x) => x[1]);
    const oldKeys = [...this.oldTemplates.keys()];
    const newKeys = [...this.newTemplates.keys()];
    const remove = oldKeys.filter((x) => !keepOld.includes(x));
    const insert = newKeys.filter((x) => !keepNew.includes(x));

    for (const [x, y] of keep) {
      const { start, end } = this.groups[x];
      const oldTemplate = this.oldTemplates[x];
      const newTemplate = this.newTemplates[y];

      renderTemplate(start, end, oldTemplate, newTemplate);
    }

    for (const [modifier, index] of remove.entries()) {
      const position = modifier - index;
      const { start, end } = this.groups[position];

      clearNodes(start, end);
      start.remove();
      end.remove();

      this.groups.splice(index - modifier, 1);
    }

    for (const index of insert) {
      const place = this.groups[index + 1]?.start ?? this.end;
      const template = this.newTemplates[index];
      const start = new Comment();
      const end = new Comment();

      place.before(start, end);
      renderTemplate(start, end, undefined, template);

      this.groups.splice(index, 0, { start, end });
    }
  }

  public render(templates: Template[]): void {
    this.oldTemplates = this.newTemplates;
    this.newTemplates = templates;

    if (this.oldTemplates.length === 0) {
      this.renderAll();
    } else if (this.newTemplates.length === 0) {
      this.clearAll();
    } else {
      this.updateAll();
    }
  }
}
