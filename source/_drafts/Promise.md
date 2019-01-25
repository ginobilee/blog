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