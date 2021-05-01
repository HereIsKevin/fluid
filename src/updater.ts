export {
  BaseUpdater,
  CompiledUpdater,
  attributeUpdater,
  eventUpdater,
  sequenceUpdater,
  templateUpdater,
  textUpdater,
  toggleUpdater,
};

import { renderSequence, renderTemplate } from "./render";
import { Template } from "./template";

type BaseUpdater = (node: Node) => CompiledUpdater;
type CompiledUpdater = (oldValue: unknown, newValue: unknown) => void;

function eventUpdater(name: string): BaseUpdater {
  return (node) => {
    if (!(node instanceof Element)) {
      throw new Error("can only bind event updater to element");
    }

    return (oldValue, newValue) => {
      if (typeof oldValue !== "undefined") {
        node.removeEventListener(name, oldValue as EventListener);
      }

      node.addEventListener(name, newValue as EventListener);
    };
  };
}

function toggleUpdater(name: string): BaseUpdater {
  return (node) => {
    if (!(node instanceof Element)) {
      throw new Error("can only toggle event updater to element");
    }

    return (oldValue, newValue) => {
      if (newValue) {
        node.setAttribute(name, "");
      } else {
        node.removeAttribute(name);
      }
    };
  };
}

function attributeUpdater(name: string): BaseUpdater {
  return (node) => {
    if (!(node instanceof Element)) {
      throw new Error("can only bind attribute updater to element");
    }

    return (oldValue, newValue) => {
      node.setAttribute(name, String(newValue));
    };
  };
}

function sequenceUpdater(): BaseUpdater {
  return (node) => {
    const start = new Comment();
    const end = new Comment();

    (node as ChildNode).replaceWith(start, end);

    return (oldValue, newValue) => {
      renderSequence(start, end, newValue as Template[]);
    };
  };
}

function templateUpdater(): BaseUpdater {
  return (node) => {
    const start = new Comment();
    const end = new Comment();

    (node as ChildNode).replaceWith(start, end);

    return (oldValue, newValue) => {
      renderTemplate(start, end, newValue as Template);
    };
  };
}

function textUpdater(): BaseUpdater {
  return (node) => {
    const text = new Text();

    (node as ChildNode).replaceWith(text);

    return (oldValue, newValue) => {
      text.nodeValue = String(newValue);
    };
  };
}
