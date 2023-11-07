/**
 * pipe function takes callback functions and executes them in order, passing
 * the return value of one callback to the next.
 *
 * If callback return a promise, pipe waits until the promise is resolved and
 * passes the resolved value to the next callback
 *
 * If any of the callbacks throws an error or returns a promise that gets rejected,
 * execution stops.
 *
 * pipe itself returns a promise that resolves with the return value of the last
 * callback, or is rejected with the first error that is thrown / promise rejection.
 *
 * Logic is the same as in implementing async/await with generators.
 */

const { action } = require("../utils");

function pipe(...cbs) {
  if (cbs.length < 1) {
    return Promise.resolve();
  }

  function handler(cbIndex, prevVal) {
    if (cbIndex >= cbs.length) return Promise.resolve(prevVal);

    return Promise.resolve(cbs[cbIndex](prevVal)).then((res) =>
      handler(cbIndex + 1, res)
    );
  }

  return handler(0);
}

pipe(
  () => action("first", 1),
  (v) => {
    console.log("regular function", v + 10);
    return v + 10;
  },
  (v) => action("second", v + 1),
  (v) => action("third", v + 1),
  (v) => {
    return v;
    throw new Error("throw error");
  },
  (v) => v + 100
).then(
  (res) => {
    console.log("--pipe finished--", res);
  },
  (err) => {
    console.log("--pipe error caught--", err);
  }
);
