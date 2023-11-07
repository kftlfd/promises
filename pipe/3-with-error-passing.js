/**
 * pipe with explicit error handling. Each callback (except the first one)
 * receives the return value (or resolved/awaited value) and the error thrown
 * (or promise rejection) from the previous callback.
 *
 * If callback return a value, next callback gets (value, null), if it throws
 * an error -- (null, value).
 *
 * Regular errors (promise rejections) don't stop the execution of the callbacks,
 * errors just get passed as arguments to a next callback. To stop the execution
 * a callback has to throw the AbortPipe error.
 *
 * pipe returns a Promise that is resolved with the return value of the last
 * callback, is rejected with the error thrown in the last callback, or
 * rejected with the AbortPipe error thrown in any of the callbacks.
 */

const { action } = require("../utils");

class AbortPipe extends Error {}

function pipe(...cbs) {
  if (cbs.length < 1) {
    return Promise.resolve();
  }

  function handler(cbIndex, prevVal, prevErr) {
    if (cbIndex >= cbs.length) {
      // finished all callbacks
      if (prevErr !== null) {
        return Promise.reject(prevErr);
      } else {
        return Promise.resolve(prevVal);
      }
    }

    try {
      const val = cbs[cbIndex](prevVal, prevErr);

      return Promise.resolve(val).then(
        (res) => handler(cbIndex + 1, res, null),
        (err) => {
          if (err instanceof AbortPipe) {
            return Promise.reject(err);
          }
          return handler(cbIndex + 1, null, err);
        }
      );
    } catch (err) {
      if (err instanceof AbortPipe) {
        return Promise.reject(err);
      }

      return handler(cbIndex + 1, null, err);
    }
  }

  return handler(0, null, null);
}

pipe(
  () => action("first", 1),
  (v, e) => v + 10,
  (v, e) => action("second", v + 1),
  (v, e) => action("third", v + 1, false && "reject promise"),
  (v, e) => {
    console.log(v, e);
    return e === null ? v : 0;
    throw new Error("throw error");
  },
  (v, e) => {
    console.log(v, e);
    if (e !== null) {
      throw new AbortPipe("stop execution");
      throw new Error("continue with new error");
    }

    return v + 100;
  },
  (v, e) => {
    console.log(v, e);
    if (e !== null) {
      return action("with error", -1);
    }

    return action("no error", v + 1000, false && "final rejection");
    throw new Error("final throw");
  }
).then(
  (res) => {
    console.log("--pipe finished--", res);
  },
  (err) => {
    console.log("--pipe error caught--", err);
  }
);
