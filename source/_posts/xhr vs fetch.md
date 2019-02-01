---
title: fetch返回一个promise，所以它在收到响应时直接进入微任务队列么？
date: 2019-01-28 09:17:41
tags: fetch promise
---
文章起源于 XHR(XMLHttpRequest) 与 Fetch 的比较。Fetch 的重大改变之一就是它返回一个 Promise，而在 XHR 中是利用回调的方式进行响应。XHR 响应后，会将对应的回调推入对应于网络请求的task(是一个macro task)中。而 Fetch 返回一个promise，浏览器会把 promise 的回调放入微任务中，那么是不是 Fetch 的响应也会更早的执行呢？   

### 实验
为了验证 Fetch 的回调是不是直接放入微任务中，我设计了这样一个实验：同时用fetch发出两个相同的请求，在其回调中，利用while循环阻塞一定时间，之后再直接resolve一个promise。如果fetch的回调直接放入微任务中，在前一个请求的响应被阻塞的时候，后一个响应应该也触发了，那么后一个响应的回调会直接进入微任务队列中，从而早于在前一个fetch回调中resolve的promise被执行。结果是不是这样呢？      
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
这样的结果显然跟 XHR 没有区别。那么是不是两个请求的响应时间差超过了3s呢？尝试加大`while`循环的时延后，表现仍然一如既往。

### 对比 MutationObserver 
MutationObserver 的回调也会放入微任务，它的表现会跟fetch一样么？  
同样，为一个dom元素绑定两个监听事件，在其回调中触发一个微任务，观察触发顺序。
```html
  <div id='con' name='name'>this is con</div>
  <script>
    const log = console.log
    function cbFactory(name) {
      return function callback(mutationList, observer) {
        mutationList.forEach((mutation) => {
          switch(mutation.type) {
            case 'attributes':
              log('attribute change : ', name)
              Promise.resolve().then(() => {
                log('Promise: ', name)
              })
              break;
          }
        });
      }
    }

    var targetNode = document.querySelector("#con");
    var observerOptions = {
      attributes: true,
    }

    var observer = new MutationObserver(cbFactory(1));
    observer.observe(targetNode, observerOptions);

    var observe2 = new MutationObserver(cbFactory(2))
    observe2.observe(targetNode, observerOptions)

    targetNode.attributes.removeNamedItem('name')
  </script>
```
结果如下: 
```
attribute change :  1
attribute change :  2
Promise:  1
Promise:  2
```
显然与浏览器中fetch表现不一致。看起来，MutationObserver 的回调是一个“干净”的微任务。  
其实，这也很好理解。MutationObserver 是一个纯浏览器内事件，浏览器只需要在监听到事件发生后，将对应的回调推入微任务队列就可以了。

  
### 结论
到这里足可看出，fetch 不是一个单纯的promise。关键在于，fetch会发起一个网络请求，当请求被响应时，怎么通知主线程来处理回调? 在 XHR 中，是将回调放入对应于网络请求的任务队列中，fetch是否也是这样呢？   
查找 WHATWG 的对应规范，其中确实提到收到响应后，会在网络请求的任务队列中推入任务:   
> Queue a task to run an operation on request’s client’s responsible event loop using the networking task source.

即将task推入对应的event loop的网络请求任务队列中。

我推测fetch的工作模式实际上是:
1. 请求被响应，在网络请求任务队列中推入一个任务。这个任务应该是执行 enqueue promise的操作(虽然规范中并没有提到)
2. event loop执行到网络请求任务队列的该任务时，把对应promise的回调推入微任务
3. event loop在执行到当前循环的微任务检查点时执行该promise的响应

即，对于fetch，其实浏览器还是沿用一样的网络请求处理逻辑，只是在响应时，推入对应任务队列的任务，执行了将promise回调推入微任务的动作。  


### 搞清楚这个问题有什么用？    
在使用 xhr 时，在其回调中利用 promise 将任务放入微任务队列中，这个微任务一定会早于其它触发的 xhr 执行；如果对 fetch 上述模型不了解，会去想是否 fetch 中新触发的 promise 会晚于其它并发收到 fetch 的响应？在对处理顺序有要求的场合，这里就会影响到是否可以在回调中使用 promise 进行异步处理。搞清楚多个 fetch 的回调仍然会走 event loop 的多个loop，就明白是否会对程序的执行流产生影响。   

<hr />

ref:   
1. [Fetch Living Standard](https://fetch.spec.whatwg.org/)   
2. [event loop in HTML](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
3. [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver)

