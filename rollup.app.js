'use strict';

// output format - 'amd', 'cjs', 'es6', 'iife', 'umd'
// amd – 使用像requirejs一样的模块定义
// cjs – CommonJS，适用于node和browserify / Webpack
// es6 (default) – 保持ES6的格式
// iife – 使用于<script> 标签引用的方式
// umd – 适用于CommonJs和AMD风格通用模式
module.exports = [
    // 打包promise.js
    {
        format: 'umd',
        isUglify: false,
        sourceMap: true,
        moduleName: 'Promise',
        entry: 'src/promise/index.js',
        dest: 'dist/promise/promise.js'
    },
    // 打包promise.js压缩min文件
    {
        format: 'umd',
        isUglify: true,
        sourceMap: false,
        moduleName: 'Promise',
        entry: 'src/promise/index.js',
        dest: 'dist/promise/promise.min.js'
    },
    // 打包ajax.js
    {
        format: 'umd',
        isUglify: false,
        sourceMap: true,
        moduleName: '$http',
        entry: 'src/ajax/index.js',
        dest: 'dist/ajax/ajax.js'
    },
    // 打包ajax.js压缩min文件
    {
        format: 'umd',
        isUglify: true,
        sourceMap: false,
        moduleName: '$http',
        entry: 'src/ajax/index.js',
        dest: 'dist/ajax/ajax.min.js'
    },
    // 打包httpromise.js
    {
        format: 'umd',
        isUglify: false,
        sourceMap: true,
        moduleName: '$http',
        entry: 'src/httpromise/index.js',
        dest: 'dist/httpromise/httpromise.js'
    },
    // 打包httpromise.js压缩min文件
    {
        format: 'umd',
        isUglify: true,
        sourceMap: false,
        moduleName: '$http',
        entry: 'src/httpromise/index.js',
        dest: 'dist/httpromise/httpromise.min.js'
    }
];

