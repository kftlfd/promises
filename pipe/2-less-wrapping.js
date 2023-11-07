/**
 * Works the same as the first pipe function, but if the first pipe always
 * wrapped the result value of the callback in a Promise, this one first checks
 * whether the value is already a Promise, if it is, then don't wrap it in
 * another promise.
 */

const { action, isThenable } = require("../utils");

function pipe(...cbs) {
  if (cbs.length < 1) {
    return Promise.resolve();
  }

  function handler(cbIndex, prevVal) {
    if (cbIndex >= cbs.length) {
      // finished all callbacks

      if (isThenable(prevVal)) {
        return prevVal;
      } else {
        return Promise.resolve(prevVal);
      }
    }

    const nextCb = cbs[cbIndex];
    const currVal = nextCb(prevVal);

    if (isThenable(currVal)) {
      return currVal.then((res) => handler(cbIndex + 1, res));
    } else {
      return handler(cbIndex + 1, currVal);
    }
  }

  return handler(0);
}

pipe(
  () => action("first", 1),
  (v) => {
    console.log("regular function 1", v + 10);
    return v + 10;
  },
  (v) => action("second", v + 1),
  (v) => action("third", v + 1, false && "reject promise"),
  (v) => {
    console.log("regular function 2", v);
    return v;
    throw new Error("throw error");
  },
  (v) => {
    console.log("regular function 3", v + 100);
    return v + 100;
  }
).then(
  (res) => {
    console.log("--pipe finished--", res);
  },
  (err) => {
    console.log("--pipe error caught--", err);
  }
);
