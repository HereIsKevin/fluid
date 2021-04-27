export { diff };

function diff(oldValues: unknown[], newValues: unknown[]): [number, number][] {
  const points: [number, number][] = [];
  let last: [number, number] = [-1, -1];

  const oldLength = oldValues.length;
  const newLength = newValues.length;
  const length = Math.max(oldLength, newLength);

  outer: for (let x = 0; x < length; x++) {
    for (let y = 0; y < x; y++) {
      if (
        x < oldLength &&
        y < newLength &&
        last[0] < x &&
        last[1] < y &&
        oldValues[x] === newValues[y]
      ) {
        last = [x, y];
        points.push(last);

        continue outer;
      } else if (
        y < oldLength &&
        x < newLength &&
        last[0] < y &&
        last[1] < x &&
        oldValues[y] === newValues[x]
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
      oldValues[x] == newValues[x]
    ) {
      last = [x, x];
      points.push(last);
    }
  }

  return points;
}
