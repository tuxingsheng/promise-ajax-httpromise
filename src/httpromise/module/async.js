'use strict';
let queue = [];

export const async = (callback)=> {
    queue.push(callback);
    if (queue.length == 1) {
        setTimeout(run, 0);
    }
};

const run = ()=> {
    while (queue.length) {
        queue[0]();
        queue.shift();
    }
};
