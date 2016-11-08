
/*
 * 实现一个promise的异步编译
 * author: tuxingsheng
 * createTime: 2016-11-08 18:00:52
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Promise = factory());
}(this, (function () { 'use strict';

var queue = [];

function async(callback) {
    queue.push(callback);
    if (queue.length == 1) {
        setTimeout(run, 0);
    }
}

function run() {
    while (queue.length) {
        queue[0]();
        queue.shift();
    }
}

var PENDING = 'pending';
var RESOLVED = 'resolved';
var REJECTED = 'rejected';

function Promise$1(executor) {
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

Promise$1.resolve = function (x) {
    return new Promise$1(function (resolve, reject) {
        resolve(x);
    });
};

Promise$1.reject = function (r) {
    return new Promise$1(function (resolve, reject) {
        reject(r);
    });
};

var $promise = Promise$1.prototype;

$promise.constructor = Promise$1;

$promise.resolve = function (x) {
    var promise = this;

    if (x != promise) {
        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

$promise.reject = function (r) {
    var promise = this;

    if (r != promise) {
        promise.state = REJECTED;
        promise.value = r;
        promise.notify();
    }
};

$promise.then = function (onResolved, onRejected) {
    var promise = this;

    return new Promise$1(function (resolve, reject) {
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
    var promise = this;

    async(function () {
        if (promise.state != PENDING) {
            while (promise.defers.length) {
                var defer = promise.defers.shift(),
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

return Promise$1;

})));
//# sourceMappingURL=promise.js.map
