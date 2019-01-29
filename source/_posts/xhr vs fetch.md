---
title: fetch返回一个promise，所以它在收到响应时直接进入微任务队列么？
date: 2019-01-28 09:17:41
tags: fetch promise
---
文章起源于 XHR(XMLHttpRequest) 与 Fetch 的比较。Fetch 的重大改变之一就是它返回一个 Promise，而在 XHR 中是利用回调的方式进行响应。XHR 响应后，会将对应的回调推入对应于网络请求的task(是一个macro task)中。而 Fetch 返回一个promise，浏览器会把 promise 的回调放入微任务中，那么是不是 Fetch 的响应也会更早的执行呢？   

### 实验
为了验证 Fetch 的回调是不是直接放入微任务中，我设计了这样一个实验：同时用fetch发出两个相同的请求，在其回调中，利用while循环阻塞一定时间，之后再直接resolve一个promise。如果fetch的回调直接放入微任务中，在前一个请求的响应被阻塞的时候，后一个响应应该也触发了，那么后一个响应的回调会直接进入微任务队列中，从而早于在前一个fetch回调中新resolve的promise被执行。结果是不是这样呢？      
```javascript
const p1 = fetch("http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=shoe&bk_length=60", {
  method: "POST"
})
const p2 = fetch("http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=shoe&bk_length=60", {
  method: "POST"
})
p1.then(response => {
  const start = Date.now()
  // wait for 3 s
  console.log("in p1 callback, before wait, and now is : ", start)
  while (Date.now() < start + 5 * 1000) {}
  console.log("in p1 callback, after wait, and now is : ", start)
  Promise.resolve(1).then(v => {
    console.log("promise initiated in p1 fire")
  })
})

p2.then(response => {
  const start = Date.now()
  // wait for 3 s
  console.log("in p2 callback, before wait, and now is : ", start)
  while (Date.now() < start + 5 * 1000) {}
  console.log("in p2 callback, after wait, and now is : ", start)
  Promise.resolve(1).then(v => {
    console.log("promise initiated in p2 fire")
  })
})

// result:
// in p2 callback, before wait, and now is :  1548601804877
// in p2 callback, after wait, and now is :  1548601804877
// promise initiated in p2 fire
// in p1 callback, before wait, and now is :  1548601809880
// in p1 callback, after wait, and now is :  1548601809880
// promise initiated in p1 fire
```
显然，输出并非如此，在首先响应的fetch的回调中，触发的promise仍然早于另外一个fetch的回调被调用了。    
这样的结果显然跟 XHR 没有区别。那么是不是两个请求的响应时间差超过了3s呢？尝试加大`while`循环的时延后，仍然不行。


### 模拟一个单纯的promise的fetch
索性来模拟一个按照上述思路触发的fetch:   
```javascript
// 模拟一个 纯 promise 的 fetch
let r = []
const fetch = function(uri, options) {
  return new Promise(function(resovle, reject) {
    r.push(resovle)
  })
}
const f1 = fetch("x").then(function(res) {
  console.log("promise f1 fire: ", res)
  Promise.resolve("f1").then(function() {
    console.log("f1")
  })
})
const f2 = fetch("y").then(function(res) {
  console.log("promise f2 fire: ", res)
  Promise.resolve("f2").then(function() {
    console.log("f2")
  })
})
// after 100ms, f1 and f2 fires. note here they are fired in the 'same tick'
setTimeout(function() {
  r.forEach(fn => {
    fn(1)
  })
}, 100)

// result:
// promise f1 fire:  1
// promise f2 fire:  1
// f1
// f2
```
在这段代码中，我以一种纯粹promise的方式模拟fetch的行为。这样两个fetch在100ms后被同时resolve，于是先后进入微任务队列；而在首先执行的回调中触发的promise，确实会晚于另一个fetch的回调执行。   

### 结论
到这里足可看出，fetch绝不是如模拟代码中的一个单纯的promise。关键在于，fetch会发起一个网络请求，当请求被响应时，怎么通知主线程来处理回调? 在 XHR 中，是将回调放入对应于网络请求的任务队列中，fetch是否也是这样呢？   
查找 WHATWG 的对应规范，其中确实提到收到响应后，会在网络请求的任务队列中推入任务:   
> Queue a task to run an operation on request’s client’s responsible event loop using the networking task source.

即将task推入对应的event loop的网络请求任务队列中。至此可以认为，fetch的工作模式实际上是:
1. 请求被响应，在网络请求任务队列中推入一个任务。这个任务应该是执行 enqueue promise的操作(虽然规范中并没有提到)
2. 主线程的event loop执行到网络请求任务队列的该任务时，把对应promise的回调推入微任务
3. 主线程的event loop在执行到当前循环的微任务检查点时执行该promise的响应

如此，说明从event loop的执行流程上，xhr 与 fetch的差别其实不大。两者都会首先通过网络请求的宏任务来触发。

<hr />

### 搞清楚这个问题有什么用？    
在使用 xhr 时，在其回调中利用 promise 将任务放入微任务队列中，这个微任务一定会早于其它触发的 xhr 执行；如果对 fetch 上述模型不了解，会去想是否 fetch 中新触发的 promise 会晚于其它并发收到 fetch 的响应？在对处理顺序有要求的场合，这里就会影响到是否可以在回调中使用 promise 进行异步处理。搞清楚多个 fetch 的回调仍然会走 event loop 的多个loop，就明白是否会对程序的执行流产生影响。   

<hr />

ref:   
1. [Fetch Living Standard](https://fetch.spec.whatwg.org/)   
2. [event loop in HTML](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)

