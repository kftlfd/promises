/**
 * Taken from:
 * https://github.com/lowbyteproductions/Promises-From-Scratch/blob/master/index.js
 *
 * Building Async/Await FROM SCRATCH using Generators
 * (c) Low Byte Productions
 * https://www.youtube.com/watch?v=Em2jqwROdZc
 */

const { getAsync, isThenable } = require("../utils");

const asyncFn =
  (promiseGeneratorFn) =>
  (...args) => {
    const producer = promiseGeneratorFn(...args);

    const interpreter = (lastValue, wasError) => {
      const { value, done } = wasError
        ? producer.throw(lastValue)
        : producer.next(lastValue);

      if (!done) {
        if (isThenable(value)) {
          return value.then(
            (resolvedValue) => interpreter(resolvedValue),
            (rejectedValue) => interpreter(rejectedValue, true)
          );
        } else {
          return interpreter(value);
        }
      } else {
        if (!isThenable(value)) {
          return Promise.resolve(value);
        }
        return value;
      }
    };

    return interpreter();
  };

const doAsyncStuff = asyncFn(function* () {
  try {
    const text = yield getAsync("some text from file");
    console.log(`${text.length} characters read`);

    const withoutVowels = yield getAsync(
      text.replace(/[aeiou]/g, ""),
      null,
      2_000
    );
    console.log(withoutVowels);
  } catch (err) {
    console.error("An error occured!");
    console.error(err);
  }
  console.log("--- All done! ---");
});

doAsyncStuff();
