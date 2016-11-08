'use strict';
let queue = [];

export function async(callback) {
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
