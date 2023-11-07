const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

class MyPromise {
  #state = STATE.PENDING;
  #value = undefined;
  #thenCbs = [];
  #catchCbs = [];

  constructor(cb) {
    try {
      cb(this.#resolve, this.#reject);
    } catch (err) {
      this.#reject(err);
    }
  }

  #resolve = (value) => {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (value && typeof value.then === "function") {
        // value is a promise
        value.then(this.#resolve, this.#reject);
        return;
      }

      this.#state = STATE.FULFILLED;
      this.#value = value;

      for (const cb of this.#thenCbs) {
        cb(this.#value);
      }
      this.#thenCbs = [];
    });
  };

  #reject = (reason) => {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (reason && typeof reason.then === "function") {
        // value is a promise
        reason.then(this.#resolve, this.#reject);
        return;
      }

      this.#state = STATE.REJECTED;
      this.#value = reason;

      for (const cb of this.#catchCbs) {
        cb(this.#value);
      }
      this.#catchCbs = [];
    });
  };

  then = (onFulfilled, onRejected) => {
    return new MyPromise((resolve, reject) => {
      this.#thenCbs.push((value) => {
        if (typeof onFulfilled === "function") {
          try {
            resolve(onFulfilled(value));
          } catch (err) {
            reject(err);
          }
        } else {
          resolve(value);
        }
      });

      this.#catchCbs.push((reason) => {
        if (typeof onRejected === "function") {
          try {
            resolve(onRejected(reason));
          } catch (err) {
            reject(err);
          }
        } else {
          resolve(reason);
        }
      });
    });
  };

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(cb) {
    return this.then(
      (value) => {
        cb();
        return value;
      },
      (reason) => {
        cb();
        throw reason;
      }
    );
  }

  static resolve(value) {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason) {
    return new MyPromise((_, reject) => {
      reject(reason);
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = [];
      let settled = 0;

      promises.forEach((promise, i) => {
        promise
          .then(
            (res) => {
              results[i] = { status: STATE.FULFILLED, value: res };
            },
            (err) => {
              results[i] = { status: STATE.REJECTED, reason: err };
            }
          )
          .finally(() => {
            if (++settled === promises.length) {
              resolve(results);
            }
          });
      });
    });
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let completed = 0;

      promises.forEach((promise, i) => {
        promise
          .then(
            (res) => {
              results[i] = res;
            },
            (err) => {
              reject(err);
            }
          )
          .finally(() => {
            if (++completed === promises.length) {
              resolve(results);
            }
          });
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  static any(promises) {
    return new Promise((resolve, reject) => {
      let errors = 0;

      promises.forEach((promise) => {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => {
            if (++errors === promises.length) {
              reject();
            }
          }
        );
      });
    });
  }
}

module.exports = MyPromise;
