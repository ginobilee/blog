异步操作被阻塞如 `setTimeout` 没有按照timeout的时间执行，是任务进入了队列没有机会执行，还是没有机会进入任务队列？

> No other Job may be initiated until the currently running Job completes. However, the currently running Job or external events **may cause the enqueuing of additional PendingJobs** that may be initiated sometime after completion of the currently running Job.

规范中关于`Job`的上述阐述，说明当前的执行上下文中，是可以将异步任务***推入任务队列***的。而不是等到js engine有空时再推入。  
关于`Promise(Job)`的执行，肯定是先推入任务队列，而不是等到触发时再推入的。

对于网络请求呢？比如xhr或fetch?