// export { renderArrangement };

// import { renderTemplate } from "./render";
// import { Template } from "./template";

// interface Hole {
//   key: Key;
//   start: Comment;
//   end: Comment;
// }

// type Key = string | number;
// type Arrangement = [Key, Template];

// const holes = new WeakMap<Comment, Hole[]>();

// function diff(oldValues: Key[], newValues: Key[]): [number, number][] {
//   const points: [number, number][] = [];
//   let last: [number, number] = [-1, -1];

//   const oldLength = oldValues.length;
//   const newLength = newValues.length;
//   const length = Math.max(oldLength, newLength);

//   outer: for (let x = 0; x < length; x++) {
//     for (let y = 0; y < x; y++) {
//       if (
//         x < oldLength &&
//         y < newLength &&
//         last[0] < x &&
//         last[1] < y &&
//         oldValues[x] === newValues[y]
//       ) {
//         last = [x, y];
//         points.push(last);

//         continue outer;
//       } else if (
//         y < oldLength &&
//         x < newLength &&
//         last[0] < y &&
//         last[1] < x &&
//         oldValues[y] === newValues[x]
//       ) {
//         last = [y, x];
//         points.push(last);

//         continue outer;
//       }
//     }

//     if (
//       x < oldLength &&
//       x < newLength &&
//       last[0] < x &&
//       last[1] < x &&
//       oldValues[x] == newValues[x]
//     ) {
//       last = [x, x];
//       points.push(last);
//     }
//   }

//   return points;
// }

// function renderArrangement(
//   startMarker: Comment,
//   endMarker: Comment,
//   arrangements: Arrangement[]
// ) {
//   const places = holes.get(startMarker);

//   if (typeof places === "undefined") {
//     const stuff: Hole[] = [];

//     for (const [key, template] of arrangements) {
//       const start = new Comment();
//       const end = new Comment();

//       endMarker.before(start, end);
//       renderTemplate(start, end, template);

//       stuff.push({ key, start, end });
//     }

//     holes.set(startMarker, stuff);

//     return;
//   }

//   if (arrangements.length === 0) {
//     clearNodes(startMarker, endMarker);
//   }
// }
