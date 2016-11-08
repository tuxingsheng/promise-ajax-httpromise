export function $http() {

}

$http.prototype.constructor = $http;

$http.prototype.post = function (url, options) {
    http.ajaxSettings.type = 'POST';
    return this.ajax(url, options)
};

$http.prototype.get = function (url, options) {
    http.ajaxSettings.type = 'GET';
    return this.ajax(url, options)
};

$http.prototype.put = function (url, options) {
    http.ajaxSettings.type = 'PUT';
    return this.ajax(url, options)
};

$http.prototype.delete = function (url, options) {
    http.ajaxSettings.type = 'DELETE';
    return this.ajax(url, options)
};

$http.prototype.ajax = function (url, options) {
    if (typeof url === 'object') {
        options = url;
        url = undefined;
    }
    http.ajax(url, options);
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
    success: noop,
    error: noop,
    complete: noop,
    context: null,
    xhr: function (protocol) {
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

http.ajaxSuccess = function (data, xhr, settings) {
    settings.success.call(settings.context, data, 'success', xhr);
    http.ajaxComplete('success', xhr, settings);
};

http.ajaxError = function (error, type, xhr, settings) {
    settings.error.call(settings.context, xhr, type, error);
    http.ajaxComplete(type, xhr, settings);
};

http.ajaxComplete = function (status, xhr, settings) {
    settings.complete.call(settings.context, xhr, status);
};

http.serialize = function (params, obj, traditional, scope) {
    var type, array = isArray(obj),
        hash = isPlainObject(obj);
    each(obj, function (key, value) {
        type = $type(value);
        if (scope) {
            key = traditional ? scope :
            scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
        }
        // handle data in serializeArray() format
        if (!scope && array) {
            params.add(value.name, value.value);
        }
        // recurse into nested objects
        else if (type === 'array' || (!traditional && type === 'object')) {
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
    return mime && (mime === http.htmlType ? 'html' :
            mime === http.jsonType ? 'json' :
                scriptTypeRE.test(mime) ? 'script' :
                xmlTypeRE.test(mime) && 'xml') || 'text';
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

http.ajax = function (url, options) {
    var settings = options || {};
    settings.url = url || settings.url;
    for (var key in http.ajaxSettings) {
        if (settings[key] === undefined) {
            settings[key] = http.ajaxSettings[key];
        }
    }
    http.serializeData(settings);
    var dataType = settings.dataType;

    if (settings.cache === false || ((!options || options.cache !== true) && ('script' === dataType))) {
        settings.url = http.appendQuery(settings.url, '_=' + $.now());
    }
    var mime = settings.accepts[dataType && dataType.toLowerCase()];
    var headers = {};
    var setHeader = function (name, value) {
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
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')) {
        setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
    }
    if (settings.headers) {
        for (var name in settings.headers)
            setHeader(name, settings.headers[name]);
    }
    xhr.setRequestHeader = setHeader;

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            xhr.onreadystatechange = noop;
            clearTimeout(abortTimeout);
            var result, error = false;
            var isLocal = protocol === 'file:';
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && isLocal && xhr.responseText)) {
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
                    http.ajaxError(error, 'parsererror', xhr, settings);
                } else {
                    http.ajaxSuccess(result, xhr, settings);
                }
            } else {
                var status = xhr.status ? 'error' : 'abort';
                var statusText = xhr.statusText || null;
                if (isLocal) {
                    status = 'error';
                    statusText = '404';
                }
                http.ajaxError(statusText, status, xhr, settings);
            }
        }
    };
    if (http.ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort();
        http.ajaxError(null, 'abort', xhr, settings);
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
            http.ajaxError(null, 'timeout', xhr, settings);
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
    return obj !== null && typeof obj === 'object';
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
        })
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

function noop() {

}



