1. Promise.resolve
  1. 就是相当于在
2. error handling: 
  1. why is async better than promise?
3. 规范25.6.3.1 节中 PromiseIsHandled 的作用是什么，跟 PromiseState 什么关系？


我自己如何写一个 Promise ？
1. 接口
  1. 构造器。接受一个 executor，他有两个参数，分别是 resolve，和reject。
    1. resolve: 被调用时，将该 promise 状态置为 resolved: 
      1. 如果传入的值是立即值，将该 promise 的状态置为 fullfilled，值为 传入值；
      2. 如果传入的值是thenable，？？？
        1. 在该 thenable 上注册一个handler，里面 resolve 这个 promise？
    2. reject: 被调用时，将该 promise 状态置为 rejected:
      1. 不管传入是什么，都将其作为当前 promise 的值存储，且不可改变
  2. 实例的 then 方法: 
    1. 被调用时，如果 promise 的状态是 fullfilled，注册一个 job；否则将 回调放入自己的 fullfilledReactions / rejectedReactions 中
    2. 要注意的是，都要将传入的 handler 包装为返回一个 promise
    3. 如果注册 then 方法的 promise 是pending，那么会将该 then 方法作为 reaction 存起来。当 promise fullfill 的时候，将这些 reaction 作为 job 放入任务队列
    4. 如果 promise resolve 了一个 promise, 那么会执行 `Perform EnqueueJob("PromiseJobs", PromiseResolveThenableJob, « promise, resolution, thenAction »)`.
      1. > 25.6.2.2 PromiseResolveThenableJob ( promiseToResolve, thenable, then )
          The job PromiseResolveThenableJob with parameters promiseToResolve, thenable, and then performs the following steps:

          Let resolvingFunctions be CreateResolvingFunctions(promiseToResolve).
          Let thenCallResult be Call(then, thenable, « resolvingFunctions.[[Resolve]], resolvingFunctions.[[Reject]] »).
          If thenCallResult is an abrupt completion, then
          Let status be Call(resolvingFunctions.[[Reject]], undefined, « thenCallResult.[[Value]] »).
          Return Completion(status).
          Return Completion(thenCallResult).

          This Job uses the supplied thenable and its then method to resolve the given promise. This process must take place as a Job to ensure that the evaluation of the then method occurs after evaluation of any surrounding code has completed.




### promiseA 的 constructor 内部 resolve(promiseB)
1. `25.6.3.1 Promise ( executor )`
  1. `Let completion be Call(executor, undefined, « resolvingFunctions.[[Resolve]], resolvingFunctions.[[Reject]] »)`.
  2. 其中 `resolvingFunctions.[[Resolve]]` 就是通用的 resolve 算法。
2. 当 resolve 被调用时，执行 `25.6.1.3.2 Promise Resolve Functions`
  1. 如果传入的是一个立即值，会执行第7步，`Return FulfillPromise(promise, resolution).`
  2. 如果传入值是 promiseB，会执行第12步，`Perform EnqueueJob("PromiseJobs", PromiseResolveThenableJob, « promise, resolution, thenAction »).`
    1. 它的算法在 `25.6.2.2 PromiseResolveThenableJob ( promiseToResolve, thenable, then )` 中。
      1. 它就是利用 promiseB 的 then 方法，注册一个 resolve promiseA 的回调。
      2. 但是 promiseA 此时已经是 resolved 状态了，再 resolve 一个简单值会正常fullfill 么？
