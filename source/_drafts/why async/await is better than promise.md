
### what's async/await

promise + generator

async/await 其实是把 yield + next() 的机制给封装了起来。

> calling an async function like main() automatically returns a promise that's resolved whenever the function finishes completely.

> yield * yields iteration control, not generator control; when you invoke the *foo() generator, you're now yield-delegating to its iterator. But you can actually yield-delegate to any iterable; yield *[1,2,3] would consume the default iterator for the [1,2,3] array value.

```javascript
function *foo() {
	console.log( "inside `*foo()`:", yield "B" );
	console.log( "inside `*foo()`:", yield "C" );
	return "D";
}

function *bar() {
	console.log( "inside `*bar()`:", yield "A" );
	// `yield`-delegation!
	console.log( "inside `*bar()`:", yield *foo() );
	console.log( "inside `*bar()`:", yield "E" );
	return "F";
}

var it = bar();
console.log( "outside:", it.next().value ); // outside: a

console.log( "outside:", it.next( 1 ).value ); // inside *bar(): 1 // outside: b

console.log( "outside:", it.next( 2 ).value ); // inside *foo(): 2 // outside: c

console.log( "outside:", it.next( 3 ).value ); // inside *foo(): 3 // inside *bar(): d // outside: e

console.log( "outside:", it.next( 4 ).value ); // inside *bar(): 4 // outside: f
```

### how generator works?
what's generator?
executing it will generate an iterator.

如果说generator是以iterator的形式实现了协程，那么就是合理的。因为iterator本身，其实是可以迭代多次执行的。所以每个 `generator().next()`，实际上相当于调用了一个新的函数，形成了一个新的 `execution context`，所以也就可以实现 `暂停` 的效果。

能写出 `generator` 的一个polyfill就说明对了。

> The generator's iterator also has a Symbol.iterator function on it, which basically does a return this, just like the something iterable we defined earlier. In other words, a generator's iterator is also an iterable!

> The yield-pause nature of generators means that not only do we get synchronous-looking return values from async function calls, but we can also synchronously catch errors from those async function calls!

generator 的异步操作，可以通过调用迭代器的throw操作， 将错误抛给 generator，从而实现对异步错误的读取与控制；但是 promise 也可以通过catch来捕获呐？

> The natural way to get the most out of Promises and generators is to yield a Promise, and wire that Promise to control the generator's iterator.

async/await is `a utility that is specifically designed to run Promise-yielding generators in the manner we've illustrated.`

#### iterator的返回是一个对象，value是一个键，另一个是表示状态的，叫什么来着？
`done`

> In general, you're going to have one more next(..) call than you have yield statements

??? 如果把 `generator` 构造器的行参，用第一个 `next()` 传进去，是不是更合适？毕竟那个时候传入才是有意义的。

```javascript
// generator handler
function step(gen) {
  var ite = gen()

  return gen()
}
```

### iterator
> An iterator is a well-defined interface for stepping through a series of values from a producer.

> Symbol.iterator is one of ES6's predefined special Symbol values (see the ES6 & Beyond title of this book series).


> The for..of loop automatically calls next() for each iteration -- it doesn't pass any values in to the next() -- and it will automatically terminate on receiving a done:true. It's quite handy for looping over a set of data.
### why better?


preemptive cooperative 
是不是多线程(或者任务控制)的实现方式，竞争式 与 合作式？
