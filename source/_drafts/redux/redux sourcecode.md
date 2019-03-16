applyMiddleware 和 compose 结合起来一起实现了 redux 的中间件结构。

redux 的中间件的签名？
(getState, dispatch) => next => action => next(action)

在每个中间件中，
```javascript
function (getState, dispatch) {
  return function (next) {
    const state = getState()
    dispatch(something...)
    return function(action) {
      if (action instanceof Function) {
        return action(dispatch)
      }
      return next(action)
    }
  }
}
```

### 那么最后一个中间件返回的函数传入的 next 为空，它是怎么处理？

不用担心，因为最后总是会把默认的 dispatch 作为最后一级中间件。如果一个 action 没有被之前的中间件熔断，那么它最终会被 store.dispatch 来处理。  
这也是会在最后传入 store.dispatch 的原因。  
所以，中间件 就是一个增强 dispatch 的机制。

### time travel 怎么实现的？
