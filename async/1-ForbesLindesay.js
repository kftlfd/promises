/**
 * Taken from:
 * https://www.promisejs.org/generators/
 *
 * (c) Forbes Lindesay
 * 
 * Forbes Lindesay: Promises and Generators: control flow utopia -- JSConf EU 2013
 * https://www.youtube.com/watch?v=qbKWsbJ76-s
 */

const { getAsync } = require("../utils");

function async(makeGenerator) {
  return function () {
    var generator = makeGenerator.apply(this, arguments);

    function handle(result) {
      // result => { done: [Boolean], value: [Object] }
      if (result.done) return Promise.resolve(result.value);

      return Promise.resolve(result.value).then(
        function (res) {
          return handle(generator.next(res));
        },
        function (err) {
          return handle(generator.throw(err));
        }
      );
    }

    try {
      return handle(generator.next());
    } catch (ex) {
      return Promise.reject(ex);
    }
  };
}

const main = async(function* () {
  try {
    const val1 = yield getAsync(1);
    const val2 = yield getAsync(2);
    return { val1, val2 };
  } catch (err) {
    console.log(err);
  }
});

main().then(
  (v) => {
    console.log(v);
  },
  (e) => {
    console.error(e);
  }
);
