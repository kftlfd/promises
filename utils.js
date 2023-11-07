function getAsync(v, e, t = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (e) {
        reject(e);
      } else {
        resolve(v);
      }
    }, t);
  });
}

function isThenable(v) {
  return v && typeof v.then === "function";
}

function action(msg = "action", val, err) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(msg, val);
      if (err) {
        reject(err);
      } else {
        resolve(val);
      }
    }, 500);
  });
}

module.exports = {
  getAsync,
  isThenable,
  action,
};
