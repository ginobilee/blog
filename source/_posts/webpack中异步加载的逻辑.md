---
title: webpack中异步加载的逻辑
date: 2019-01-28 11:17:41
tags: webpack
---
### webpack打包后的入口文件
webpack的输出是一个立即执行表达式。  
其参数是一个对象(modules)。对象的键是文件名字，值是一个函数，函数体就是 `evel(//原模块的内容)`。    
立即执行表达式的函数体部分是加载模块的逻辑。这个函数的行参接收的就是上面的`modules`。在函数体中，用 `installedModules` 来对模块的 `exports` 做缓存。

### `modules` 和 `installedModules`
其中两个关键的对象: `modules` 和 `installedModules` :
1. `modules` 对模块的源码做缓存(即使是异步加载的模块，也会在加载后放入 `modules` 中)
2. `installedModules` :
    1. 对模块解析后的输出(`exports`)做缓存，这样在解析过一次后就不再需要进行再次解析
    2. 对异步加载的文件用 0 标记已经被加载。

### 异步文件的加载
一个异步文件的加载，可以分成以下步骤:
1. 用 `__webpack_require__.e` 加载该文件，传入的参数是文件的名字id(比如打包成了`0.[chunkname].js`，这里传入`0`，`chunkname`在 `__webpack_require__.e`内以对象映射的方式(`{0: [chunkname]}`)匹配)。它执行了以下操作:
    1. 将该文件内的  `exports.modules` 以源码形式存入 `modules` 对象中，使得其他文件中的模块源码也增加到了本地的 `modules` 缓存中；
    2. 将该文件对应的 `chunkId` 添加在 `installedModules`中，值为 0 标记该文件已经被加载。这样后面其它文件再去请求同样的文件时不会重复执行。
2. 在异步加载该文件的模块内，用 `__webpack_require__` 加载对应的模块，即 `__webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./b */ \"./b.js\"))`。从注释中也可以看出webpack将 `import()` 语句转成了 `__webpack_require__.e()`，这个函数返回一个 promise。  

### 异步加载函数 `__webpack_require__.e`
`__webpack_require__.e`的关键代码如下:
```javascript
// ...
var chunk = require("./" + ({}[chunkId]||chunkId) + "." + {"0":"081d69d7289d20fd61af"}[chunkId] + ".js");
var moreModules = chunk.modules, chunkIds = chunk.ids;
for(var moduleId in moreModules) {
    modules[moduleId] = moreModules[moduleId];
}
for(var i = 0; i < chunkIds.length; i++)
    installedChunks[chunkIds[i]] = 0;
// ...
```
