
/*
 * 实现一个promise的异步编译
 * author: tuxingsheng
 * createTime: 2016-11-09 11:34:58
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.$http = factory());
}(this, (function () { 'use strict';

var queue = [];

var async = function async(callback) {
    queue.push(callback);
    if (queue.length == 1) {
        setTimeout(run, 0);
    }
};

var run = function run() {
    while (queue.length) {
        queue[0]();
        queue.shift();
    }
};

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var PENDING = 'pending';
var RESOLVED = 'resolved';
var REJECTED = 'rejected';

function Promise(executor) {
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
        var count = 0,
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

        for (var i = 0; i < iterable.length; i++) {
            Promise.resolve(iterable[i]).then(resolver(i), reject);
        }
    });
};

Promise.race = function (iterable) {
    return new Promise(function (resolve, reject) {
        for (var i = 0; i < iterable.length; i++) {
            Promise.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

var $promise = Promise.prototype;

$promise.constructor = Promise;

$promise.resolve = function (x) {
    var promise = this;

    if (x != promise) {

        // 如果传入的是一个Promise
        if (x instanceof Promise) {
            var _ret = function () {

                var called = false,
                    then = x && x['then'];

                if (x && (typeof x === 'undefined' ? 'undefined' : _typeof$1(x)) === 'object' && typeof then === 'function') {
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
                    return {
                        v: void 0
                    };
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof$1(_ret)) === "object") return _ret.v;
        }

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
                    if (isFunction$1(onResolved)) {
                        resolve(onResolved.call(null, promise.value));
                    } else {
                        resolve(promise.value);
                    }
                }

                // 如果是reject状态
                if (promise.state === REJECTED) {
                    if (isFunction$1(onRejected)) {
                        reject(onRejected.call(null, promise.value));
                    } else {
                        reject(promise.value);
                    }
                }
            }
        }
    });
};

function isFunction$1(obj) {
    return typeof obj === 'function';
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function $http() {}

$http.prototype.constructor = $http;

$http.prototype.all = function (iterable) {
    return Promise.all(iterable);
};

$http.prototype.race = function (iterable) {
    return Promise.race(iterable);
};

$http.prototype.post = function (url, options) {
    http.ajaxSettings.type = 'POST';
    return this.ajax(url, options);
};

$http.prototype.get = function (url, options) {
    http.ajaxSettings.type = 'GET';
    return this.ajax(url, options);
};

$http.prototype.put = function (url, options) {
    http.ajaxSettings.type = 'PUT';
    return this.ajax(url, options);
};

$http.prototype.delete = function (url, options) {
    http.ajaxSettings.type = 'DELETE';
    return this.ajax(url, options);
};

$http.prototype.ajax = function (url, options) {
    if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) === 'object') {
        options = url;
        url = undefined;
    }
    return new Promise(function (resolve, reject) {
        http.ajax(url, options, resolve, reject);
    });
};

var http = {};

http.jsonType = 'application/json';

http.htmlType = 'text/html';

http.rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

http.scriptTypeRE = /^(?:text|application)\/javascript/i;

http.xmlTypeRE = /^(?:text|application)\/xml/i;

http.blankRE = /^\s*$/;

http.ajaxSettings = {
    type: 'GET',
    beforeSend: noop,
    context: null,
    xhr: function xhr(protocol) {
        return new window.XMLHttpRequest();
    },
    accepts: {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: http.jsonType,
        xml: 'application/xml, text/xml',
        html: http.htmlType,
        text: 'text/plain'
    },
    timeout: 0,
    processData: true,
    cache: true
};

http.ajaxBeforeSend = function (xhr, settings) {
    var context = settings.context;
    if (settings.beforeSend.call(context, xhr, settings) === false) {
        return false;
    }
};

http.serialize = function (params, obj, traditional, scope) {
    var type,
        array = isArray(obj),
        hash = isPlainObject(obj);
    each(obj, function (key, value) {
        type = $type(value);
        if (scope) {
            key = traditional ? scope : scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
        }
        // handle data in serializeArray() format
        if (!scope && array) {
            params.add(value.name, value.value);
        }
        // recurse into nested objects
        else if (type === 'array' || !traditional && type === 'object') {
                http.serialize(params, value, traditional, key);
            } else {
                params.add(key, value);
            }
    });
};

http.serializeData = function (options) {
    if (options.processData && options.data && typeof options.data !== 'string') {
        options.data = $param(options.data, options.traditional);
    }
    if (options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
        options.url = http.appendQuery(options.url, options.data);
        options.data = undefined;
    }
};

http.appendQuery = function (url, query) {
    if (query === '') {
        return url;
    }
    return (url + '&' + query).replace(/[&?]{1,2}/, '?');
};

http.mimeToDataType = function (mime) {
    if (mime) {
        mime = mime.split(';', 2)[0];
    }
    return mime && (mime === http.htmlType ? 'html' : mime === http.jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
};

http.parseArguments = function (url, data, success, dataType) {
    if (isFunction(data)) {
        dataType = success, success = data, data = undefined;
    }
    if (!isFunction(success)) {
        dataType = success, success = undefined;
    }
    return {
        url: url,
        data: data,
        success: success,
        dataType: dataType
    };
};

http.ajax = function (url, options, resolve, reject) {
    var settings = options || {};
    settings.url = url || settings.url;
    for (var key in http.ajaxSettings) {
        if (settings[key] === undefined) {
            settings[key] = http.ajaxSettings[key];
        }
    }
    http.serializeData(settings);
    var dataType = settings.dataType;

    if (settings.cache === false || (!options || options.cache !== true) && 'script' === dataType) {
        settings.url = http.appendQuery(settings.url, '_=' + $.now());
    }
    var mime = settings.accepts[dataType && dataType.toLowerCase()];
    var headers = {};
    var setHeader = function setHeader(name, value) {
        headers[name.toLowerCase()] = [name, value];
    };
    var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
    var xhr = settings.xhr(settings);
    var nativeSetHeader = xhr.setRequestHeader;
    var abortTimeout;

    setHeader('X-Requested-With', 'XMLHttpRequest');
    setHeader('Accept', mime || '*/*');
    if (!!(mime = settings.mimeType || mime)) {
        if (mime.indexOf(',') > -1) {
            mime = mime.split(',', 2)[0];
        }
        xhr.overrideMimeType && xhr.overrideMimeType(mime);
    }
    if (settings.contentType || settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET') {
        setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
    }
    if (settings.headers) {
        for (var name in settings.headers) {
            setHeader(name, settings.headers[name]);
        }
    }
    xhr.setRequestHeader = setHeader;

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            xhr.onreadystatechange = noop;
            clearTimeout(abortTimeout);
            var result,
                error = false;
            var isLocal = protocol === 'file:';
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0 && isLocal && xhr.responseText) {
                dataType = dataType || http.mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                result = xhr.responseText;
                try {
                    // http://perfectionkills.com/global-eval-what-are-the-options/
                    if (dataType === 'script') {
                        (1, eval)(result);
                    } else if (dataType === 'xml') {
                        result = xhr.responseXML;
                    } else if (dataType === 'json') {
                        result = http.blankRE.test(result) ? null : parseJSON(result);
                    }
                } catch (e) {
                    error = e;
                }

                if (error) {
                    reject({
                        error: error,
                        status: 'parsererror',
                        xhr: xhr,
                        settings: settings
                    });
                } else {
                    resolve(result);
                }
            } else {
                var status = xhr.status ? 'error' : 'abort';
                var statusText = xhr.statusText || null;
                if (isLocal) {
                    status = 'error';
                    statusText = '404';
                }
                reject({
                    error: statusText,
                    status: status,
                    xhr: xhr,
                    settings: settings
                });
            }
        }
    };
    if (http.ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort();
        reject({
            error: null,
            status: 'abort',
            xhr: xhr,
            settings: settings
        });
        return xhr;
    }

    if (settings.xhrFields) {
        for (var name in settings.xhrFields) {
            xhr[name] = settings.xhrFields[name];
        }
    }

    var async = 'async' in settings ? settings.async : true;

    xhr.open(settings.type.toUpperCase(), settings.url, async, settings.username, settings.password);

    for (var name in headers) {
        nativeSetHeader.apply(xhr, headers[name]);
    }
    if (settings.timeout > 0) {
        abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = noop;
            xhr.abort();
            reject({
                error: null,
                status: 'timeout',
                xhr: xhr,
                settings: settings
            });
        }, settings.timeout);
    }
    xhr.send(settings.data ? settings.data : null);
    return xhr;
};

var isArray = Array.isArray;
var parseJSON = JSON.parse;
var class2type = {};

each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function (i, name) {
    class2type['[object ' + name + ']'] = name.toLowerCase();
});

function $type(obj) {
    return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || 'object';
}

function $param(obj, traditional) {
    var params = [];
    params.add = function (k, v) {
        this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    };
    http.serialize(params, obj, traditional);
    return params.join('&').replace(/%20/g, '+');
}

function isObject(obj) {
    return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

function isPlainObject(obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

function each(elements, callback, hasOwnProperty) {
    if (!elements) {
        return this;
    }
    if (typeof elements.length === 'number') {
        [].every.call(elements, function (el, idx) {
            return callback.call(el, idx, el) !== false;
        });
    } else {
        for (var key in elements) {
            if (hasOwnProperty) {
                if (ele.hasOwnProperty(key)) {
                    if (callback.call(elements[key], key, elements[key]) === false) {
                        return elements;
                    }
                }
            } else {
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
            }
        }
    }
}

function wran(str) {
    console.error(str);
}

function noop() {}

var index = new $http();

return index;

})));
//# sourceMappingURL=httpromise.js.map
