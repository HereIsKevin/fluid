export { clearBetween, clearFrom };

function clearBetween(start: Node, end: Node): void {
  let current = start.nextSibling;

  while (current !== null && current !== end) {
    current.remove();
    current = start.nextSibling;
  }
}

function clearFrom(start: Node, end: Node): void {
  clearBetween(start, end);

  (start as ChildNode).remove();
  (end as ChildNode).remove();
}
