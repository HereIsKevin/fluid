export {
  Base,
  Updater,
  attributeUpdater,
  eventUpdater,
  propertyUpdater,
  referenceUpdater,
  sequenceUpdater,
  templateUpdater,
  textUpdater,
  toggleUpdater,
};

import { clearBetween, clearFrom } from "./helper";
import { mount } from "./mount";
import { Template } from "./template";

interface Hole {
  start: Comment;
  end: Comment;
}

type Base = (node: Node) => Updater;
type Updater = (value: unknown) => void;

function eventUpdater(name: string): Base {
  return (node) => {
    let oldValue: EventListener | undefined;

    return (newValue) => {
      if (oldValue === newValue) {
        return;
      }

      if (typeof oldValue !== "undefined") {
        node.removeEventListener(name, oldValue);
      }

      oldValue = newValue as EventListener;
      node.addEventListener(name, oldValue);
    };
  };
}

function toggleUpdater(name: string): Base {
  return (node) => {
    let oldValue: unknown;

    if (!(node instanceof Element)) {
      throw new Error("toggle updater target must be element");
    }

    return (newValue) => {
      if (oldValue === newValue) {
        return;
      }

      oldValue = newValue;

      if (oldValue) {
        node.setAttribute(name, "");
      } else {
        node.removeAttribute(name);
      }
    };
  };
}

function propertyUpdater(name: string): Base {
  return (node) => {
    let oldValue: unknown;

    return (newValue) => {
      if (oldValue === newValue) {
        return;
      }

      oldValue = newValue;
      Reflect.set(node, name, oldValue);
    };
  };
}

function referenceUpdater(): Base {
  return (node) => {
    let oldValue: (node: Node) => void | undefined;

    return (newValue) => {
      if (oldValue === newValue) {
        return;
      }

      oldValue = newValue as (node: Node) => void;
      oldValue(node);
    };
  };
}

function attributeUpdater(name: string): Base {
  return (node) => {
    let oldValue: unknown;

    if (!(node instanceof Element)) {
      throw new Error("attribute updater target must be element");
    }

    return (newValue) => {
      if (oldValue === newValue) {
        return;
      }

      oldValue = newValue;
      node.setAttribute(name, String(oldValue));
    };
  };
}

function sequenceUpdater(): Base {
  return (node) => {
    const startMarker = new Comment();
    const endMarker = new Comment();

    (node as ChildNode).replaceWith(startMarker, endMarker);

    const holes: Hole[] = [];

    return (value) => {
      const templates = value as Template[];

      if (holes.length == 0) {
        for (const template of templates) {
          const start = new Comment();
          const end = new Comment();

          endMarker.before(start, end);
          mount(start, end, template);

          holes.push({ start, end });
        }

        return;
      }

      if (templates.length === 0) {
        clearBetween(startMarker, endMarker);
        holes.length = 0;

        return;
      }

      if (templates.length < holes.length) {
        const start = holes[templates.length].start;
        const end = holes[holes.length - 1].end;

        clearFrom(start, end);

        holes.length = templates.length;
      }

      while (templates.length > holes.length) {
        const start = new Comment();
        const end = new Comment();

        endMarker.before(start, end);
        holes.push({ start, end });
      }

      for (let index = 0; index < templates.length; index++) {
        const template = templates[index];
        const { start, end } = holes[index];

        mount(start, end, template);
      }
    };
  };
}

function templateUpdater(): Base {
  return (node) => {
    const start = new Comment();
    const end = new Comment();

    (node as ChildNode).replaceWith(start, end);

    return (value) => {
      mount(start, end, value as Template);
    };
  };
}

function textUpdater(): Base {
  return (node) => {
    let oldValue: unknown;

    const text = new Text();
    (node as ChildNode).replaceWith(text);

    return (newValue) => {
      if (oldValue === newValue) {
        return;
      }

      oldValue = newValue;
      text.nodeValue = String(oldValue);
    };
  };
}
