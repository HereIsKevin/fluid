export {
  BaseUpdater,
  BoundUpdater,
  attributeUpdater,
  eventUpdater,
  propertyUpdater,
  referenceUpdater,
  sequenceUpdater,
  styleUpdater,
  templateUpdater,
  textUpdater,
  toggleUpdater,
};

import {
  Arrangement,
  renderArrangement,
  renderSequence,
  renderTemplate,
} from "./render";
import { Template } from "./template";

type BaseUpdater = (node: Node) => BoundUpdater;
type BoundUpdater = (value: unknown) => void;

function eventUpdater(name: string): BaseUpdater {
  return (node) => {
    let last: EventListener | undefined;

    return (value) => {
      if (typeof last !== "undefined") {
        node.removeEventListener(name, last);
      }

      last = value as EventListener;
      node.addEventListener(name, last);
    };
  };
}

function toggleUpdater(name: string): BaseUpdater {
  return (node) => {
    return (value) => {
      if (value) {
        (node as Element).setAttribute(name, "");
      } else {
        (node as Element).removeAttribute(name);
      }
    };
  };
}

function propertyUpdater(name: string): BaseUpdater {
  return (node) => {
    return (value) => {
      Reflect.set(node, name, value);
    };
  };
}

function referenceUpdater(): BaseUpdater {
  return (node) => {
    return (value) => {
      (value as (node: Node) => void)(node);
    };
  };
}

function styleUpdater(): BaseUpdater {
  return (node) => {
    let oldValues: Record<string, unknown> = {};

    return (value) => {
      const element = node as HTMLElement;
      const values = value as Record<string, unknown>;

      for (const key in values) {
        const oldValue = oldValues[key];
        const newValue = values[key];

        if (oldValue !== newValue) {
          Reflect.set(element.style, key, newValue);
        }
      }

      oldValues = values;
    };
  };
}

function attributeUpdater(name: string): BaseUpdater {
  return (node) => {
    return (value) => {
      (node as Element).setAttribute(name, String(value));
    };
  };
}

function sequenceUpdater(): BaseUpdater {
  return (node) => {
    const start = new Comment();
    const end = new Comment();

    (node as ChildNode).replaceWith(start, end);

    let keyed: boolean | undefined;

    return (value) => {
      if (
        typeof keyed === "undefined" &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        keyed = Array.isArray(value[0]);
      }

      if (keyed) {
        renderArrangement(start, end, value as Arrangement[]);
      } else {
        renderSequence(start, end, value as Template[]);
      }
    };
  };
}

function templateUpdater(): BaseUpdater {
  return (node) => {
    const start = new Comment();
    const end = new Comment();

    (node as ChildNode).replaceWith(start, end);

    return (value) => {
      renderTemplate(start, end, value as Template);
    };
  };
}

function textUpdater(): BaseUpdater {
  return (node) => {
    const text = new Text();

    (node as ChildNode).replaceWith(text);

    return (value) => {
      text.nodeValue = String(value);
    };
  };
}
