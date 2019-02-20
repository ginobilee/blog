---
title: Promise
date: 2019-01-24 15:33:41
tags:
---
1. inversion of control. 不再是将自己的回调传给异步操作；而是等待异步操作的结果然后主动进行自己的回调

> Because Promises encapsulate the time-dependent state -- waiting on the fulfillment or rejection of the underlying value -- from the outside, the Promise itself is time-independent, and thus Promises can be composed (combined) in predictable ways regardless of the timing or outcome underneath.

> Moreover, once a Promise is resolved, it stays that way forever -- it becomes an immutable value at that point -- and can then be observed as many times as necessary.

Note: Because a Promise is externally immutable once resolved, it's now safe to pass that value around to any party and know that it cannot be modified accidentally or maliciously. This is especially true in relation to multiple parties observing the resolution of a Promise. It is not possible for one party to affect another party's ability to observe Promise resolution. Immutability may sound like an academic topic, but it's actually one of the most fundamental and important aspects of Promise design, and shouldn't be casually passed over.

Promises are an easily repeatable mechanism for encapsulating and composing future values.

使用promise提供对未来结果的placeholder，于是可以继续组织依赖于此未来操作的逻辑。


### how to identify a Promise?

duck typing:  "If it looks like a duck, and quacks like a duck, it must be a duck"  
the duck typing check for a thenable would roughly be:
```javascript
if (
	p !== null &&
	(
		typeof p === "object" ||
		typeof p === "function"
	) &&
	typeof p.then === "function"
) {
	// assume it's a thenable!
}
else {
	// not a thenable
}
```
 but if you happen to meet some object having 'then' function, where at the same time behaves not like Promise, it may be a disaster...

直接用 instanceof 做检测存在如下问题:
1. Mainly, you can receive a Promise value from another browser window (iframe, etc.), which would have its own Promise different from the one in the current window/frame, and that check would fail to identify the Promise instance.
2. a library or framework may choose to vend its own Promises and not use the native ES6 Promise implementation to do so. 

但对这些仍然应该视作 Promise ，所以才会有 duck typing。然而，如果有一个对象碰巧有 then 函数，却不符合 Promise 规范，那就麻烦了。


> The characteristics of Promises are intentionally designed to provide useful, repeatable answers to all these concerns.

### Promise Scheduling Quirks

```javascript
var p3 = new Promise( function(resolve,reject){
	resolve( "B" );
} );

var p1 = new Promise( function(resolve,reject){
	resolve( p3 );
} );

var p2 = new Promise( function(resolve,reject){
	resolve( "A" );
} );

p1.then( function(v){
	console.log( v );
} );

p2.then( function(v){
	console.log( v );
} );

// A B  <-- not  B A  as you might expect
```

todo: 还可以在 resolve 中传入一个 promise，看看后面怎么解释规范的规定  
todo: We'll cover later how to be notified of an error in your callback, because even those don't get swallowed.

> To avoid such nuanced nightmares, you should never rely on anything about the ordering/scheduling of callbacks across Promises. In fact, a good practice is not to code in such a way where the ordering of multiple callbacks matters at all. Avoid that if you can.


在 promise 的 then 回调中抛异常会是什么影响？

### 神奇的 Promise.resolve()
> Promise.resolve(..) will accept any thenable, and will unwrap it to its non-thenable value. But you get back from Promise.resolve(..) a real, genuine Promise in its place, one that you can trust. If what you passed in is already a genuine Promise, you just get it right back, so there's no downside at all to filtering through Promise.resolve(..) to gain trust.

> Note: Another beneficial side effect of wrapping Promise.resolve(..) around any function's return value (thenable or not) is that it's an easy way to normalize that function call into a well-behaving async task. If foo(42) returns an immediate value sometimes, or a Promise other times, Promise.resolve( foo(42) ) makes sure it's always a Promise result. And avoiding Zalgo makes for much better code.

### Chain flow
> If a proper valid function is not passed as the fulfillment handler parameter to then(..), there's also a default handler substituted:
```javascript
var p = Promise.resolve( 42 );

p.then(
	// assumed fulfillment handler, if omitted or
	// any other non-function value passed
	// function(v) {
	//     return v;
	// }
	null,
	function rejected(err){
		// never gets here
	}
);
```
这就是为什么如果在 then 中只传入一个非函数的话，会 resolve 为一个具备之前 promise 的值的 promise  
事实上，上面那段的 `then` 代码等同于 `p.catch(rejected)`。这样理解就很清晰了。

### Promise 构造器中的第一个参数为何命名 resolve 而不是 fullfill ?
它实际上执行的是 resolve 操作。如果在构造器中 `resolve(Promise.reject(1))` 那么这个 promise 的 state 还是 `rejected`。所以命名为 resolve 更准确。  
同时注意，reject参数就不会执行 unwrap，如果给传穿一个 promise，会直接当作 reject 的值跑出去，当前 promise 还是 rejected.  
> Warning: The previously mentioned reject(..) does not do the unwrapping that resolve(..) does. If you pass a Promise/thenable value to reject(..), that untouched value will be set as the rejection reason. A subsequent rejection handler would receive the actual Promise/thenable you passed to reject(..), not its underlying immediate value.

### error handling
> try..catch would certainly be nice to have, but it doesn't work across async operations. That is, unless there's some additional environmental support, which we'll come back to with generators in Chapter 4.

> Warning: If you use the Promise API in an invalid way and an error occurs that prevents proper Promise construction, the result will be an immediately thrown exception, not a rejected Promise. Some examples of incorrect usage that fail Promise construction: new Promise(null), Promise.all(), Promise.race(42), and so on. You can't get a rejected Promise if you don't use the Promise API validly enough to actually construct a Promise in the first place!

todo: promise.defer ???


### Promise.all
> Note: Technically, the array of values passed into Promise.all([ .. ]) can include Promises, thenables, or even immediate values. Each value in the list is essentially passed through Promise.resolve(..) to make sure it's a genuine Promise to be waited on, so an immediate value will just be normalized into a Promise for that value. If the array is empty, the main Promise is immediately fulfilled.

> Remember to always attach a rejection/error handler to every promise, even and especially the one that comes back from Promise.all([ .. ]).

> It doesn't make much practical sense to have a race with immediate values, because the first one listed will obviously win -- like a foot race where one runner starts at the finish line!

接受的数组参数中的元素，每一个是一个promise、thenable或者立即值  
数组中所有的promise都fullfill了，这个promise才会fullfill，它的value是每个promise的value数组  
有任意一个promise发生了reject，这个promise也会reject。传入的参数也是对应promise的值



## Promise API Recap
### new Promise(..) Constructor
<blockquote>
reject(..) simply rejects the promise, but resolve(..) can either fulfill the promise or reject it, depending on what it's passed. If resolve(..) is passed an immediate, non-Promise, non-thenable value, then the promise is fulfilled with that value.

But if resolve(..) is passed a genuine Promise or thenable value, that value is unwrapped recursively, and whatever its final resolution/state is will be adopted by the promise.
</blockquote>

### then(..) and catch(..)
<blockquote>
Each Promise instance (not the Promise API namespace) has then(..) and catch(..) methods, which allow registering of fulfillment and rejection handlers for the Promise. 
then(..) takes one or two parameters, the first for the fulfillment callback, and the second for the rejection callback. If either is omitted or is otherwise passed as a non-function value, a default callback is substituted respectively. The default fulfillment callback simply passes the message along, while the default rejection callback simply rethrows (propagates) the error reason it receives.
(如果在then中没有指定fullfill或reject的handler，会有一个默认的handler，它只是将值继续传递或继续抛出错误)

catch(..) takes only the rejection callback as a parameter, and automatically substitutes the default fulfillment callback, as just discussed. In other words, it's equivalent to then(null,..):
(catch相当于有一个默认fullfill处理器的then，理解这一点很重要。因为catch总会返回一个新的promise，对于实现Promise里说很重要)

</blockquote>
<hr />
### limatations of es6 Promise
> catch(..) takes only the rejection callback as a parameter, and automatically substitutes the default fulfillment callback, as just discussed. In other words, it's equivalent to then(null,..):
promise 链中间的错误如果被处理了，无法得知。

> Promises by definition only have a single fulfillment value or a single rejection reason. In simple examples, this isn't that big of a deal, but in more sophisticated scenarios, you may find this limiting.
(只能传一个值)

### Promise Uncancelable
> Note: Many Promise abstraction libraries provide facilities to cancel Promises, but this is a terrible idea! Many developers wish Promises had natively been designed with external cancelation capability, but the problem is that it would let one consumer/observer of a Promise affect some other consumer's ability to observe that same Promise. This violates the future-value's trustability (external immutability), but moreover is the embodiment of the "action at a distance" anti-pattern (http://en.wikipedia.org/wiki/Action_at_a_distance_%28computer_programming%29). Regardless of how useful it seems, it will actually lead you straight back into the same nightmares as callbacks.

<hr />

### Promise 的构造器参数 resolve 中可以接受一个 promise (Promise.resolve同样)
es规范中:
<blockquote>
A promise is said to be settled if it is not pending, i.e. if it is either fulfilled or rejected.

A promise is resolved if it is settled or if it has been “locked in” to match the state of another promise. Attempting to resolve or reject a resolved promise has no effect. A promise is unresolved if it is not resolved. An unresolved promise is always in the pending state. A resolved promise may be pending, fulfilled or rejected.
</blockquote> 

> The resolve function that is passed to an executor function accepts a single argument. The executor code may eventually call the resolve function to indicate that it wishes to resolve the associated Promise object. The argument passed to the resolve function represents the eventual value of the deferred action and can be either the actual fulfillment value or another Promise object which will provide the value if it is fulfilled.

看到这里的 resolved/settled/locked in 确实没有看明白。在 'You-Dont-Know-JS' 里看到可以resolve一个promise，才算明白了规范中所说的一个 resolved 的 `promise`，也可能是 pending，但却不会被再次resolve。

ref:
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch3.md




在es的规范中，对于promise这样的job，有写到当一个promise被resolve的时候，将其回调enqueue job。可以理解当其resolve在js中执行时是同步的，但是大部分时候，resolve是在implementation中被触发的。比如setTimeout, fire之后再去resolve这个promise，那么从settimeout触发到resolve到enqueue job是一个什么顺序呢？   
es规范 25.6.1.3.2Promise Resolve Functions 的第12步， perform enqueueJob(...)   
是不是可以这样理解，setTimeout调用了宿主的接口，传给宿主对应的回调。而timeout是当前宿主的eventloop的task queue之一；当timeout fire的时候，宿主将这个回调放入对应的task queue中；js engine在自己的event loop运行到获取task queue时(实际上，这个操作应该是受宿主控制的；es规范中没有对执行task queue中job的顺序进行规定，而将之留给了实现。所以这里是宿主在设定这些task queue的执行规则。es规范中做了规定的只是: 1. 当一个job开始被js engine执行，它总是执行到结束，即 run to completion；2. 只有在 execution context stack 为空时才会从task queue中取job执行。所以这里的"js engine在自己的event loop运行到获取task queue时"对于js engine来说只要ec stack为空就可以了)，宿主会控制哪个task queue中的job送给js engine去执行。  
而在浏览器中，实际上是将promise放在一个叫micro task queue的task queue中，当js engine的ec stack为空时，浏览器总是优先将micro task中的job送给它执行；只有当micro task queue空了，浏览器才会去取其它的 task queue 中的job来给js engine去执行。   
回到上面在 setTimeout 中去 resolve promise 的问题。timeout是一个属于时间的 task queue中的，只有当这个 timeout 的job被执行了，才会执行到 resolve promise，然后将这个 promise 的回调 enqueue 到 micro task queue 中。所以，虽然可以将一个 setTimeout 改造成 promise，但如果这个 timeout 的回调始终没有被js engine执行(js engine 阻塞)，那么这个promise 是不会 resolve 的。   
如果fetch的实现就像github的polyfill一样，使用 xhr，在其回调中 resolve 这个promise，那么多个 fetch一定是会间隔执行的，即在fetch的回调中resolve的promise会早于下一个fetch的回调执行。   
(我在一个promise 的回调中 resolve另外一个promise，另一个promise一定会在当前promise的回调执行完后立即执行；所以我可以利用这种办法去模拟fetch，证明fetch不是一个简单的promise。)    
我需要再去看的，是html里是如何规定fetch的执行的，跟xhr有什么不一样？这才能根本解决原生 fetch 的困惑。   


搞清楚这个问题有什么用？   
如果在fetch的回调重要进行长时间的处理(数据集很大)，我们可能会想将这些操作以异步形式进行处理，比如promise；但如果同时发出了多个fetch，在其中一个的回调执行时，另外一个可能也响应了。那么我在回调中再触发promise来处理数据的时候，会不会后面响应的fetch的回调(因为也是promise)插入到当前回调中新触发的promise前面？搞清楚上面的问题，就知道是不会的。当一个fetch收到响应，进入回调执行过程，一定是对应的网络请求task已经执行，从而触发了对应的promise，开始进入这个网络请求task的微任务执行流程；在这中间新触发的promise都会排在微任务中；而另外一个fetch的响应，即使这时收到了，也在等待js engine执行完微任务后获取宏任务才可能被执行，从而出发其对应的微任务，所以，两个fetch的回调一定会以宏任务进行界限，在其回调中触发的微任务会连贯地执行完。




### html规范中对于promise的enqueue job的逻辑规定
??? script execution context是什么，与 JavaScript execution context stack 的区别？   
就是后者，只是为了将当前的执行环境传给新创建的 PendingJob   

??? 在 html 的 Queue a microtask,中，7.5步直接就将job 执行了？   

在 xhr 的规范中，也没有提到关于回调处理的 task queue 的东西。 。  



> An ongoing fetch can be terminated with flag aborted, which is unset unless otherwise specified.

所以fetch 是可以 取消的么？

### https://developers.google.com/web/fundamentals/primers/promises
里面利用promise实现页面顺序加载的demo写得很棒，值得学习

