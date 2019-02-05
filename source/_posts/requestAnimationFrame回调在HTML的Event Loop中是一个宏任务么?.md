---
title: requestAnimationFrame回调在HTML的Event Loop中是一个宏任务么?
date: 2019-02-01 08:18:06
tags:
---

我们知道浏览器在页面运行时利用Event loop来协调事件、交互、脚本、渲染、网络以及其它工作。Event loop的规则基于HTML的对应规范(引用1，后面提到的规范都是指它)。规范指出，一个event loop应该维护一个或多个任务队列(task queue)，以及一个微任务队列(microtask queue)。社区里一般将前者称为宏任务。    

规范中提到了几种常见的任务: DOM操作、用户交互、网络请求和浏览器history变更。它们都是我们常说的宏任务之属。而微任务就包括Promise、MutationObserver等等。一般的，只要一个api是异步操作，它必定是通过任务的机制运行的。那么对于 `requestAnimationFrame`(简称raf)，它是一个宏任务还是微任务呢？ 

因为这篇文章严重依赖于前述规范，特意将对应章节进行了[简单翻译]()。

### 概念
在讨论之前，我想先界定一下文章里要讨论到的几个概念:
 - event loop: 这里专指html规范中的事件循环处理模型，为大多数现代浏览器所遵循。其对应的实体应该是浏览器中的渲染器，例如chrome中renderer进程的render线程
 - 任务: 由event loop交给js引擎执行的一段代码
 - 宏任务: 在event loop开始一次循环时会去检查任务队列，所有在这里去检查的任务队列，其任务为宏任务。
 - 微任务: 每个event loop会维护一个 microtask queue，其中的任务称为微任务。

为什么宏任务要如此界定呢？因为它其实标志了一个loop的开始。按照这里的概念，一个loop中，只会有一个宏任务被执行，多个宏任务一定是在多个loop中执行。当然，也可能因为任务队列都为空，一个loop中并没有宏任务执行。  

### event loop 与 js引擎
需要说明，这里讨论的任务，是指event loop交给js引擎执行的任务。计算样式也可以当作一个任务(在chrome dev tool里可以清晰地看到占用了event loop)，但不在此处讨论之列。

而这些任务对于js引擎来说，其实是没有差别的。是什么样的任务，来自于哪个任务队列，对于js引擎其实并没有差别，对其来说都是通过execution context规范化的一个执行任务。而任务的管理以及何时执行，是由event loop维护的。所以html规范中也提到，浏览器可以给予一些任务(例如ui交互)更高的优先级。

关于任务的队列应该由谁来管理，在es6之前其实是不存在分歧的，因为彼时es规范中并没有任何关于队列的设计(没有异步的概念，之前的异步都是实现提供的)。但是从es6开始，es为了Promise引入了Job以及JobQueue。但是显然html并没有依照es的规范去实现，文档中也提到了:
> However, as of the time of this writing the definition of EnqueueJob in that specification(es规范) is not sufficiently flexible to integrate with HTML as a host environment.
> The RunJobs abstract operation from the JavaScript specification must not be used by user agents.

为何这样说呢？我是这样理解的: 现在的任务队列都是由event loop管理的，js引擎只是执行被交给的任务；如果按照es规范的理解，js引擎就需要自己维护任务任务，以及管理任务执行的顺序。这对于现在html的实现者们来说改动很大；而根据html给出的规范去实现，只要增加或重新管理任务队列就可以了，是兼容性最好的方案。

### 微任务的执行时机

微任务的执行时机有二，一个在event loop模型中显式地提到了，即循环的第6步(Microtasks: Perform a microtask checkpoint)；另一个在阐述 'perform a microtask checkpoint' 逻辑时有提及:

> This(Run oldestMicrotask) might involve invoking scripted callbacks, which eventually calls the clean up after running script steps, which call this perform a microtask checkpoint algorithm again, which is why we use the performing a microtask checkpoint flag to avoid reentrancy.

可见在执行完脚本回调后，还是会去执行微任务。既然如此，为什么还要在前述模型中加上专门的一步去执行微任务检查点呢，前面的宏任务执行完后本来也会去检查呐？

因为会有宏任务为空而微任务不为空的场景，这时就需要在处理过程中保证该微任务被会执行到。

总之，微任务会在以下时机执行:
1. event loop中执行微任务检查点时
2. 任何脚本任务结束的时候

### requestAnimationFrame 的特性和执行时机
特性:
1. 当开始执行它的回调时，在此刻之前注册的所有该类回调，会一次性执行完(一个loop内，这点很关键)
2. 每个该类任务执行完，也会执行微任务(其实不能称为特性，毕竟所有脚本任务都是这样)
3. 如果以自身递归调用的方式(raf回调内递归调用raf，使用该api的正确姿势)，它的触发时机总是与浏览器的渲染频率保持一致。

执行时机:
 - 对照规范的步骤，在第10.10步。特别指出，在一个loop中，可能并不会执行这一步，只要浏览器任务不需要执行渲染，就会跳过。

关于已注册的raf回调会在一个loop内执行完，规范是怎么说的:
<blockquote>
To run the animation frame callbacks for a target object target with a timestamp now:
1. Let callbacks be a clone of target's map of animation frame callbacks.
2. Set target's map of animation frame callbacks to a new empty ordered map.
3. For each handle → callback of callbacks, invoke callback, passing now as the only argument, and if an exception is thrown, report the exception.
</blockquote>
之后又专门提到了，如果有多个回调执行，即便它们真正执行的时刻有差异，但它们取到的当前时间是同一个值。所以此处用意很明显，就是为了将多个回调设计成同步执行的效果。

### 结论
我们看到宏任务与raf任务有明显的差异:
1. 执行时机不同
2. raf任务队列被执行时，会将其此刻队列中所有任务都执行完

所以raf任务不属于宏任务。而由于微任务的特殊性(单独的任务队列)，它显然更不是微任务。

所以它既不是宏任务，又不是微任务。那么它是什么？

任务。

其实，html规范中，至始至终找不到宏任务的描述。宏任务的概念，应该是社区为了区别微任务，而创造出来的。那么它是否还有意义呢？

我认为还是有意义的。它的意义在于前述的执行时机: 一个loop的起始阶段，且一个宏任务标志了一个loop。所以我们提宏任务时，就是指那些在loop开始时会去检查的任务，如此这个名称是有其独特意义的。

而更重要的是，宏任务的这个特性，对于流程控制是非常重要的。正因为它有标志一个loop开始的能力，所以它是适合作为流程控制来使用的。而非宏任务的任务就不适合。

所以 `setTimeout` 一定会被设计成宏任务，这可以保证它在任何地方调用，表现始终是一致的；也不会阻塞event loop。相反微任务只适合在一个任务结束后作为附加的流程控制，如果在微任务中反复触发其它微任务，就会阻塞掉event loop。下面的例子中，不论如何发起timer任务，它都不会彻底阻塞event loop；而微任务的递归调用则会彻底阻塞。

ps，篇尾引用3是一篇关于事件循环的很好的讨论，本文的缘起也正是在其中论到 requestAnimationFrame。

todo: 
 - [ ] chrome在一个loop的开始时检查哪些任务？它们是所谓的宏任务。



ref:
1. [HTML - Web application APIs](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
2. [ECMAScript - Jobs and Job Queues](https://tc39.github.io/ecma262/#sec-jobs-and-job-queues)
3. [从event loop规范探究javaScript异步及浏览器更新渲染时机 - 杨敬卓](https://github.com/aooy/blog/issues/5)