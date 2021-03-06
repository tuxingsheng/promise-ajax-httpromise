import {async} from './async';

const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';


export function Promise(executor) {
    this.defers = [];
    // 设置默认状态
    this.state = PENDING;
    // 初始值为undefined
    this.value = undefined;

    var promise = this;

    // 无法准确的判断传入的是否是一个包含了resolve和reject的函数
    // 因此，只能通过try-catch进行处理
    try {
        executor(function (x) {
            promise.resolve(x);
        }, function (r) {
            promise.reject(r);
        });
    } catch (e) {
        promise.reject(e);
    }
}

Promise.resolve = function (x) {
    return new Promise(function (resolve, reject) {
        resolve(x);
    });
};

Promise.reject = function (r) {
    return new Promise(function (resolve, reject) {
        reject(r);
    });
};

Promise.all = function (iterable) {
    return new Promise(function (resolve, reject) {
        let count = 0,
            result = [];

        if (iterable.length === 0) {
            resolve(result);
        }

        function resolver(i) {
            return function (x) {
                result[i] = x;
                count += 1;

                if (count === iterable.length) {
                    resolve(result);
                }
            };
        }

        for (let i = 0; i < iterable.length; i++) {
            Promise.resolve(iterable[i]).then(resolver(i), reject);
        }
    })
};

Promise.race = function (iterable) {
    return new Promise(function (resolve, reject) {
        for (let i = 0; i < iterable.length; i++) {
            Promise.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

const $promise = Promise.prototype;

$promise.constructor = Promise;

$promise.resolve = function (x) {
    const promise = this;

    if (x != promise) {

        // 如果传入的是一个Promise
        if (x instanceof Promise) {

            let called = false,
                then = x && x['then'];

            if (x && typeof x === 'object' && typeof then === 'function') {
                then.call(x, function (x) {
                    if (!called) {
                        promise.resolve(x);
                    }
                    called = true;
                }, function (r) {
                    if (!called) {
                        promise.reject(r);
                    }
                    called = true;
                });
                return;
            }
        }

        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

$promise.reject = function (r) {
    const promise = this;

    if (r != promise) {
        promise.state = REJECTED;
        promise.value = r;
        promise.notify();
    }
};

$promise.then = function (onResolved, onRejected) {
    const promise = this;

    return new Promise(function (resolve, reject) {
        promise.defers.push({
            onResolved: onResolved,
            onRejected: onRejected,
            resolve: resolve,
            reject: reject
        });
        promise.notify();
    });
};

$promise.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

$promise.notify = function () {
    const promise = this;

    async(function () {
        if (promise.state != PENDING) {
            while (promise.defers.length) {
                let defer = promise.defers.shift(),
                    onResolved = defer.onResolved,
                    onRejected = defer.onRejected,
                    resolve = defer.resolve,
                    reject = defer.reject;

                // 如果是resolve状态
                if (promise.state === RESOLVED) {
                    if (isFunction(onResolved)) {
                        resolve(onResolved.call(null, promise.value));
                    } else {
                        resolve(promise.value);
                    }
                }

                // 如果是reject状态
                if (promise.state === REJECTED) {
                    if (isFunction(onRejected)) {
                        reject(onRejected.call(null, promise.value));
                    } else {
                        reject(promise.value);
                    }
                }
            }
        }
    });
};

function isFunction(obj) {
    return typeof obj === 'function';
}
