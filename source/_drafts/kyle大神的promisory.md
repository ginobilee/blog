对一个callback风格的代码做风格转变:
```javascript
function foo(x,y,cb) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		cb
	);
}

foo( 11, 31, function(err,text) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( text );
	}
} );
```


想把它改成什么样呢？最好当然是:
```javascript
const request = function(...args) {
  // return promise
  return new Promise(function(resolve, reject) {
    ajax(...args, function(err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}
const promisedFoo = function(x, y) {
  // if cb is a err first style function
  request(x, y).then(cb.bind(null, null), cb)
} 
```
但这样显然改动比较大。kyle写了一个 `Promise.wrap` 方法，将一个接收 error first 的函数，快速地改为 promise style。感觉自己是在思想上的懒惰。根本没有去想怎么最小化地改动，而是僵化地以常用的思维流去思考问题。

```javascript
/**
todo: 对一个 error first的函数做变更 */
```