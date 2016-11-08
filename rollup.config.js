'use strict';

const rollup = require('rollup').rollup;
const rollupApp = require('./rollup.app');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const npm = require('rollup-plugin-node-resolve');

const banner = `
/*
 * 实现一个promise的异步编译
 * author: tuxingsheng
 * createTime: ${new Date().toLocaleString()}
 */
`;


rollupApp.forEach(function (roll) {
    rollup({
        entry: roll.entry,
        plugins: [
            npm({jsnext: true, main: true}),
            babel({
                exclude: 'node_modules/**',
                presets: [
                    [
                        'es2015',
                        {
                            'modules': false
                        }
                    ]
                ]
            }),
            roll.isUglify && uglify()
        ]
    }).then(function (bundle) {
        bundle.write({
            banner: banner,
            dest: roll.dest,
            format: roll.format,
            sourceMap: roll.sourceMap,
            moduleName: roll.moduleName
        });
    }).catch(function (err) {
        console.log('错误信息：\n' + err);
    });
});
