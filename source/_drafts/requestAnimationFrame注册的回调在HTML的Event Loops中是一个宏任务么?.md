---
title: requestAnimationFrame注册的回调在HTML的Event Loops中是一个宏任务么?
date: 2019-01-29 08:18:06
tags:
---
我们知道浏览器在页面运行时利用Event loops来协调事件、交互、脚本、渲染、网络以及其它工作。Event loops的规则是基于HTML的对应规范的。在这个规范中，一个event loop会维护着一个或多个任务队列(task queue)，以及一个微任务队列(microtask queue)，也就是常说的宏任务/微任务。规范中也指出，常见的宏任务包括: DOM操作、用户交互、网络请求和浏览器history变更。事实上，只要是一个异步的操作，浏览器都会把它放入任务队列(也可能是微任务队列)中，等待js引擎执行。比如`setTimeout`，我们指导浏览器一般都将其作为宏任务对待。`requestAnimationFrame`也是注册一个异步的回调，那么它是一个宏任务还是微任务呢？   
不妨先来看几个例子(以下运行结果都来自mac chrome 71.0.3578.98 正式版本（64 位）)。
```javascript

```

### requestAnimationFrame 回调的执行，是一次loop么？
我们从任务的视角触发，对于宏任务来说，它与loop是一对一的关系，多个宏任务的执行总是在多个loop中；而微任务与loop是多对一的关系，一次loop中可能会有多个微任务被执行。  

特点:
1. 执行时机不固定。通过它注册的回调，开发者无法准确地判断它会在什么时间点或哪一个loop中被执行。因为这是浏览器决定的，浏览器总是在执行渲染前，执行已经注册的该类回调。而在一个loop执行完后，是否会执行渲染，是由浏览器决定的(<a href='whynotrender'>浏览器为什么会不执行</a>)。



### 结论
requestAnimationFrame 注册的回调，既不是宏任务，也不是一般意义上的微任务。可以将它视为一种特定的微任务(在一次loop中执行到它时，总是将当前已注册的所有该类任务都执行完)，但它只在loop中特定的时机被执行，


是不是说这种微任务的阐述是不准确的，实际上的执行流是html的event loop来控制的，而js的执行只是event loop的一部分。对于js engine来说，很简单，只要同步的任务执行结束(ec stack为空)，就会去执行可以执行的任务；但event loop还要执行其它任务，所以它将自己的运行画成一次次的loop，在一次loop中，以固定的顺序执行js脚本、样式计算、requestAnimationFrame 回调、requestIdleCallback 回调、渲染以及其它操作(环境清理等等)。而这里即便规范在event loop的流程中专门规定了一个microtask的检查点来执行microtask，我想实际的执行可能是这样一个逻辑:
1. event loop开始执行js脚本(或者是将执行权交给js engine，或者是被js engine的执行所阻塞)，对于js engine来说，就是一个task
    1. js engine开始执行任务。这个执行过程就涉及到es规范中利用execution context stack对执行上下文的管理
    2. 当execution context stack为空时，js engine当前task的执行就结束了
2. 控制权回传给event loop。event loop执行 脚本/回调执行结束清理工作，而这里的一步就是查看 microtask queue是否为空，如果不为空，会从中取任务交给js engine执行，这里又回到了步骤1。

注意到步骤2到1形成了一个循环，只有在js engine执行完任务交还控制权给event loop时，microtask为空，才会跳出这个循环。所以微任务队列，是可能把event loop完全占死的。是否有一些限制来控制微任务的创建和执行呢？  

而js engine 执行完后，又会触发同样的清理步骤，于是再次查看 microtask queue...。但由于microtask queue只有一个，即便在后来的回调中再次注册了microtask queue的回调，也能保证它们按照入队的顺序执行。

### 递归地产生 microtask 会怎么样，浏览器会结束掉它么？
chrome 中不会。我跑了以下代码:
```javascript
var con = document.getElementById('con');
var i = 0;
con.onclick = function click1() {

  // 如果microtask 递归调用会怎么样？
  const produceResolvedPromise = () => {
    i++
    Promise.resolve()
      .then(() => {
              console.log(i)
        produceResolvedPromise()
        return true
      })
  }
  produceResolvedPromise()
}
```
在log中一直跑到了7万+，此时页面已经不能响应我的交互，而过了一会儿系统开始提示我: "您的磁盘几乎已满"，虽然我的磁盘本来也只有4~5个g了。  
所以一定要注意在微任务中的递归，它会阻塞浏览器event loop的运行，如果没有合适的递归结束条件，它可能会一直运行下去。   

### 浏览器提供给js的异步操作接口还有哪些？
setTimeout
setInterval
event handler
mutation observer
network request
requestAnimationFrame
requestIdleCallback
postmessage
Intersection Observation???  https://w3c.github.io/IntersectionObserver/#run-the-update-intersection-observations-steps 他应该也是一样的逻辑
...

还有没有像 requestAnimationFrame 这样的？ ???css 的 animation 监听事件是不是也是这样？ 
requestIdleCallback 呢？

### event loop 会控制 js engine 的执行
```javascript
    var con = document.getElementById('con');
    var i = 0;
    con.onclick = function click1() {
      while(i < 50) {
        i++
        setTimeout(function() {
          console.log(i)
          con.textContent = i
        })
      }
    }
```
上面的代码中，timeout的回调其实是一直有的，但event loop在多个task中间还是执行了渲染，足见event loop会控制js engine的执行，并不是只要有任务就会一直执行的。但如果js engine执行一个任务后，ec stack还非空，那么js engine是不会将控制权交出的(除非event loop主动限制js engine的执行，比如由于内存溢出或调用栈溢出等等)。(***???如果generator中间yield了执行呢？***)

我在microtask中递归地生成一个microtask，会是什么样？

 clean up after running a callback 与 Clean up after running script 是不一样的对吧？分别对应什么情况？

只是这样的话，那么 microtask check point flag还有什么意义呢？

generator 是否可以直接运行在浏览器中，如果generator yield了，浏览器会怎么处理？js engine会交出控制权么？

？？？比如说浏览器正在一个loop的render阶段，那么它是不会去执行已经fire的timeout的。

当js engine的ec stack为空时，就会去


### requestAnimationFrame 还是 css-animation?
前者更好。以利用left实现元素的左右移动为例，前者在维持同样移动速率的条件上，帧速率更稳定平稳，页面表现很流畅。而后者就会出现帧速率降低的情况，页面在有其它交互时，也会出现抖动情况。我像是因为后者严格保持了与浏览器刷新频率的一致。  

如果将 left 实现，改为 transform 实现呢？