export { arrayEqual, clearBetween };

function arrayEqual(
  first: ArrayLike<unknown>,
  second: ArrayLike<unknown>
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  for (let index = 0; index < first.length; index++) {
    if (first[index] !== second[index]) {
      return false;
    }
  }

  return true;
}

function clearBetween(start: Node, end: Node): void {
  let current = start.nextSibling;

  while (current !== null && current !== end) {
    current.remove();
    current = start.nextSibling;
  }
}
