function outside(boundary, point) {
  if (typeof boundary === "undefined") {
    return true;
  } else {
    return boundary[0] < point[0] && boundary[1] < point[1];
  }
}

function diff(oldValues, newValues) {
  const points = [];
  const length = Math.max(oldValues.length, newValues.length);

  for (let x = 0; x < length; x++) {
    let ended = false;
    const boundary = points[points.length - 1];

    for (let y = 0; y < x; y++) {
      const firstPoint = [x, y];

      if (
        x < oldValues.length &&
        y < newValues.length &&
        outside(boundary, firstPoint) &&
        oldValues[x] === newValues[y]
      ) {
        points.push(firstPoint);
        ended = true;
        break;
      }

      const secondPoint = [y, x];

      if (
        y < oldValues.length &&
        x < newValues.length &&
        outside(boundary, secondPoint) &&
        oldValues[y] === newValues[x]
      ) {
        points.push(secondPoint);
        ended = true;
        break;
      }
    }

    if (ended) {
      continue;
    }

    const thirdPoint = [x, x];

    if (
      x < oldValues.length &&
      x < newValues.length &&
      outside(boundary, thirdPoint) &&
      oldValues[x] === newValues[x]
    ) {
      points.push(thirdPoint);
    }
  }

  return points;
}

const oldValues = ["a", "b", "c", "d", "c", "e"];
const newValues = ["e", "b", "d", "c", "a", "f", "g"];

console.log(diff(oldValues, newValues));
