export {
  BaseUpdater,
  BoundUpdater,
  attributeUpdater,
  eventUpdater,
  propertyUpdater,
  referenceUpdater,
  styleUpdater,
  templateUpdater,
  textUpdater,
  toggleUpdater,
};

import { mount } from "./mount";
import { Template } from "./template";

type BaseUpdater = (node: Node) => BoundUpdater;
type BoundUpdater = (value: any) => void;

function eventUpdater(name: string): BaseUpdater {
  return (node) => {
    const element = node as Element;

    let oldValue: EventListener;

    return (value: EventListener) => {
      const newValue = value as EventListener;

      if (oldValue !== newValue) {
        if (typeof oldValue !== "undefined") {
          element.removeEventListener(name, oldValue);
        }

        element.addEventListener(name, newValue);
      }

      oldValue = newValue;
    };
  };
}

function toggleUpdater(name: string): BaseUpdater {
  return (node) => {
    const element = node as Element;

    let oldValue: boolean;

    return (value) => {
      const newValue = value as boolean;

      if (oldValue !== newValue) {
        if (value) {
          element.setAttribute(name, "");
        } else {
          element.removeAttribute(name);
        }
      }

      oldValue = newValue;
    };
  };
}

function propertyUpdater(name: string): BaseUpdater {
  return (node) => {
    const element = node as Element;

    let oldValue: unknown;

    return (value) => {
      const newValue = value as unknown;

      if (oldValue !== newValue) {
        Reflect.set(element, name, value);
      }

      oldValue = newValue;
    };
  };
}

function referenceUpdater(): BaseUpdater {
  return (node) => {
    const element = node as Element;

    let oldValue: unknown;

    return (value) => {
      const newValue = value as (node: Node) => void;

      if (oldValue !== newValue) {
        newValue(node);
      }

      oldValue = newValue;
    };
  };
}

function styleUpdater(): BaseUpdater {
  return (node) => {
    const element = node as HTMLElement | SVGElement;

    let oldValues: Record<string, unknown> = {};

    return (value) => {
      const newValues = value as Record<string, unknown>;

      for (const key in newValues) {
        const oldValue = oldValues[key];
        const newValue = newValues[key];

        if (oldValue !== newValue) {
          Reflect.set(element.style, key, newValue);
        }
      }

      oldValues = newValues;
    };
  };
}

function attributeUpdater(name: string): BaseUpdater {
  return (node) => {
    const element = node as Element;

    let oldValue: unknown;

    return (value) => {
      const newValue = value as unknown;

      if (oldValue !== newValue) {
        element.setAttribute(name, String(value));
      }

      oldValue = newValue;
    };
  };
}

function templateUpdater(): BaseUpdater {
  return (node) => {
    const start = new Comment();
    const end = new Comment();

    (node as ChildNode).replaceWith(start, end);

    return (value) => {
      mount(start, end, value as Template);
    };
  };
}

function textUpdater(): BaseUpdater {
  return (node) => {
    const text = new Text();

    (node as ChildNode).replaceWith(text);

    let oldValue: unknown;

    return (value) => {
      text.nodeValue = String(value);
    };
  };
}
