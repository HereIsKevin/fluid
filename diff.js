const oldValues = [0, 1, 2, 3, 4, 5, 6];
const newValues = [0, 2, 1, 4, 3, 7, 6];

let oldIndex = 0;
let newIndex = 0;

console.log(oldValues);

while (oldIndex <= oldValues.length && newIndex <= newValues.length) {
  if (oldValues[oldIndex] === newValues[newIndex]) {
    // same

    oldIndex++;
    newIndex++;
  } else {
    if (newValues.includes(oldValues[oldIndex])) {
      // move

      oldValues.splice(
        newValues.indexOf(oldValues[oldIndex]),
        0,
        oldValues.splice(oldIndex, 1)[0]
      );
    } else if (!oldValues.includes(newValues[newIndex])) {
      // insert

      oldValues.splice(oldIndex, 0, newValues[newIndex]);
    } else {
      // remove

      oldValues.splice(oldIndex, 1);
    }
  }
}

console.log(oldValues);
