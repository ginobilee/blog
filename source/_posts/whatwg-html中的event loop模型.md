---
title: whatwg-Html中的event loop模型
date: 2019-01-31 19:17:41
tags:
---
### 规范描述
8.1.4.2. Processing model

An event loop must continually run through the following steps for as long as it exists:
 
1. Let oldestTask be the oldest task on one of the event loop's task queues, if any, ignoring, in the case of a browsing context event loop, tasks whose associated Documents are not fully active. The user agent may pick any task queue. If there is no task to select, then jump to the microtasks step below.

  在该事件循环的任一(ua可以决定选择哪个任务队列)任务队列中查找最早的任务(忽略哪些关联Documents非活动中的任务)。如果任务队列都为空，跳转到微任务步骤。

2. Report the duration of time during which the user agent does not execute this loop by performing the following steps:

  2.1 Set event loop begin to the current high resolution time.

  2.2 If event loop end is set, then let top-level browsing contexts be the set of all top-level browsing contexts of all Document objects associated with the event loop. Report long tasks, passing in event loop end, event loop begin, and top-level browsing contexts.

  通过以下步骤提醒ua没有执行此event loop的时间(***question1***):
    2.1 将event loop的开始事件(elb)设定为当前的高分辨率事件
    2.2 如果event loop的结束时间(ele)已设置，则设置顶级浏览环境集(tlbcs)为跟当前event loop关联的所有Document对象的顶级浏览环境。然后以ele，elb，tlbcs为参数执行耗时较长任务提醒。

3. Set the event loop's currently running task to oldestTask.

	设置event loop的当前执行任务为步骤1中所选最早任务oldestTask。

4. Run oldestTask.
   
  执行该任务。

5. Set the event loop’s currently running task back to null.

	将event loop的当前执行任务仍设置为null。

6. Remove oldestTask from its task queue.
	
	将前述执行任务从其task队列中移除。

7. Microtasks: Perform a microtask checkpoint.
	
	执行微任务检查点

8. Let now be the current high resolution time. 
   
  设置now为当前的该分辨率时间。

9. Report the task's duration by performing the following steps:
    9.1 Let top-level browsing contexts be an empty set.
    9.2 For each environment settings object settings of oldestTask's script evaluation environment settings object set, append setting's top-level browsing context to top-level browsing contexts.
    9.3 Report long tasks, passing in event loop begin (repurposed as meaning the beginning of the task), now (the end time of the task), top-level browsing contexts, and oldestTask.
  
  通过执行下列步骤计算该任务的执行时长:
    9.1 声明顶级浏览环境(tlbcs)为空队列。
    9.2 遍历步骤1中任务的脚本执行环境设置对象集，将该对象的顶级浏览环境添加如9.1节中队列。
    9.3 以ele(任务起始时间)，now(任务结束时间)，tlbcs，以及步骤1中任务为参数，执行耗时较长任务提醒。

10. Update the rendering: If this event loop is a browsing context event loop (as opposed to a worker event loop), then run the following substeps.
	
	更新渲染视图：如果是在浏览环境(而非worker环境)，执行下列分步骤：

	10.1 Let docs be the list of Document objects associated with the event loop in question, sorted arbitrarily except that the following conditions must be met:
	
	设置docs为当前event loop相关的所有Document对象的列表，可以为任意顺序但需满足以下要求:

		a. Any Document B that is nested through a Document A must be listed after A in the list.
		被Document A嵌套的任意Document B必须在A之后

		b. If there are two documents A and B whose browsing contexts are both nested browsing contexts and their browsing context containers are both elements in the same Document C, then the order of A and B in the list must match the relative tree order of their respective browsing context containers in C.
		如果两个Document A and B的浏览环境是同一个Document C的浏览环境下的某个节点的嵌套环境，则A and B在列表中的顺序应该与它们在C中的顺序保持一致

		In the steps below that iterate over docs, each Document must be processed in the order it is found in the list.
		在下面的步骤中，docs中的每个元素都应该以其所处位置顺序执行
	
	10.2 Rendering opportunites: If there are browsing contexts browsingContexts that do not have a rendering opportunity, then remove from docs all Document objects whose browsing context is in browsingContexts.   
  A browsing context has a rendering opportunity if the user agent is currently able to present the contents of the browsing context to the user, accounting for hardware refresh rate constraints and user agent throttling for performance reasons, but considering content presentable even if it's outside the viewport.   
  Browsing context rendering opportunities are determined based on hardware constraints such as display refresh rates and other factors such as page performance or whether the page is in the background. Rendering opportunities typically occur at regular intervals.

  渲染机会: 从docs列表中删除其浏览环境没有渲染机会的元素。   
  如果ua当前可以向用户呈现浏览环境的的内容，则可以认为该浏览环境有渲染机会。ua会根据硬件刷新频率和性能考虑去决定是否给予渲染机会。   
  通常来说，渲染机会的有无取决于硬件限制如显示刷新频率，以及其它如页面性能或页面是否在后台的因素。渲染机会通常间隔固定的周期。   

  10.3 Unnecessary rendering: If there are browsing contexts browsingContexts for which the user agent believes updating the rendering would have no visible effect and which possess no Document objects with a non-empty map of animation frame callbacks, then remove from docs all Document objects whose browsing context is in browsingContexts. Invoke the mark paint timing algorithm for each Document object removed.

  不必要渲染: 如果ua认为更新某个浏览环境不会有可视的影响，并且其(浏览环境的)Document对象的动画帧回调(requestAminationFrame)都为空，则将该浏览环境相关的Document对象从docs队列中删除。对于每个删除的Document对象，触发绘制事件标记操作。

  10.4 If there are browsing contexts browsingContexts for which the user agent believes it's preferrable to skip updating the rendering for other reasons, then remove from docs all Document objects whose browsing context is in browsingContexts.

  如果ua因为其它任何原因认为不需要渲染某个浏览环境，将与其相关的Document对象从docs中删除。
  
  [Note]:    
  The step labeled Rendering opportunities prevents the user agent from updating the rendering when it is unable to present new content to the user (there's no rendering opportunity).   
  The step labeled Unnecessary rendering prevents the user agent from updating the rendering when there's no new content to draw.   
  This step enables the user agent to prevent the steps below from running for other reasons, for example, to ensure certain tasks are executed immediately after each other, with only microtask checkpoints interleaved (and without, e.g., animation frame callbacks interleaved). Concretely, a user agent might wish to coalesce timer callbacks together, with no intermediate rendering updates.

  【注】:   
  标记渲染机会的步骤，用来阻止ua在没有能力呈现新内容的时候进行渲染。   
  不需要渲染，用来阻止ua在没有新的内容需要渲染时进行渲染。   
  而这一步，使得ua可以在其他情况下不执行后续的步骤。例如，为了使得一些任务被无间隔地连续执行，其间只有微任务检查点被执行(而不执行如动画帧回调步骤)。比如，ua可能希望将连续的定时回调连续执行完，中间不进行渲染更新。   

  10.5 For each fully active Document in docs, run the resize steps for that Document, passing in now as the timestamp. 

	遍历docs中有效的Document，执行resize操作(计算并触发resize事件，并非执行resize更新)，时间戳为now。

	10.6 For each fully active Document in docs, run the scroll steps for that Document, passing in now as the timestamp. 

	遍历docs中有效的Document，执行scroll操作(同10.5)，时间戳为now。

	10.7 For each fully active Document in docs, evaluate media queries and report changes for that Document, passing in now as the timestamp. 

	遍历docs中有效的Document，执行媒体查询并报告变化，时间戳为now。

	10.8 For each fully active Document in docs, update animations and send events for that Document, passing in now as the timestamp. 

  遍历docs中有效的Document，更新动画并发送事件，时间戳为now。

	10.9 For each fully active Document in docs, run the fullscreen rendering steps for that Document, passing in now as the timestamp.

	遍历docs中有效的Document，执行全屏事件通知步骤，时间戳为now。

	10.10 For each fully active Document in docs, run the animation frame callbacks for that Document, passing in now as the timestamp.

	遍历docs中有效的Document，执行动画帧回调(***me: requestAnimationFrame注册的回调***)，时间戳为now。

	10.11 For each fully active Document in docs, run the update intersection observations steps for that Document, passing in now as the timestamp.
	
  遍历docs中有效的Document，执行交互检测步骤，时间戳为now。
  
  10.12 Invoke the mark paint timing algorithm for each Document object in docs.

  遍历docs中元素，触发绘制时机标志算法。

  10.13 For each fully active Document in docs, update the rendering or user interface of that Document and its browsing context to reflect the current state.

	遍历docs中有效的Document，根据其当前状态，更新这个Document及其浏览环境的渲染或ui。

11. If this is a browsing context event loop (as opposed to a worker event loop), and there are no tasks in the event loop's task queues which are associated with a Document that is fully active, and the event loop's microtask queue is empty, and none of the browsing contexts have a rendering opportunity, then for each browsing context, run the steps in the start an idle period algorithm, passing the Window associated with that browsing context.
    
  如果这是浏览环境的事件循环(而非worker)，且当前任务队列为空，微任务队列也为空，浏览环境也都没有渲染机会，则执行开始空闲时间逻辑(requestIdleCallback)。

12. Report the duration of the update the rendering step by performing the following steps:   
  12.1 Let rendering end time be the current high resolution time.
  12.2 Let top-level browsing contexts be the set of all top-level browsing contexts of all fully active Documents in docs.   
  12.3 Report long tasks, passing in now (repurposed as meaning the beginning of the update the rendering step), rendering end time, and top-level browsing contexts.   
    
  根据以下步骤计算更新渲染的持续时间:   
  12.1 设置渲染结束时间(ret)为当前的高分辨率时间
  12.2 设置顶级浏览环境集(tlbcs)为当前相关的所有顶级浏览环境
  12.3 以相应参数计算耗时较长任务

13. If this is a worker event loop (i.e., one running for a WorkerGlobalScope):
  1.  If this is a supported DedicatedWorkerGlobalScope and the user agent believes that it would benefit from having its rendering updated at this time, then:
    1.  Let now be the current high resolution time. 
    2.  Run the animation frame callbacks for that DedicatedWorkerGlobalScope, passing in now as the timestamp.
    3.  Update the rendering of that dedicated worker to reflect the current state.
  2.  If there are no tasks in the event loop's task queues and the WorkerGlobalScope object's closing flag is true, then destroy the event loop, aborting these steps, resuming the run a worker steps described in the Web workers section below.

  如果是worker的event loop:   
  1.  如果是DedicatedWorkerGlobalScope，且ua相信它应该更新渲染(***todo1***)，则:
    1.  声明当前高分辨率时间now
    2.  为其执行动画帧回调，传入当前时间作为参数
    3.  更新对应的渲染
  2.  如果任务队列中没有任务，且WorkerGlobalScope对象的关闭标志为true，则销毁这个event loop，放弃这些步骤，恢复运行worker步骤。

14. Set event loop end to be the current high resolution time.

  设置event loop结束时间为当前的高分辨率时间。


### questions: 
1. `the duration of time during which the user agent does not execute this loop` 这里是计算什么？没有太懂
2. what is browsing context?
    基本上是同步于renderer process的一个抽象。规范如是阐述:   
    <blockquote>
      A browsing context is an environment in which Document objects are presented to the user.

      Note:
      A tab or window in a Web browser typically contains a browsing context, as does an iframe or frames in a frameset.

      A browsing context has a corresponding WindowProxy object.

      A browsing context has a session history, which lists the Document objects that the browsing context has presented, is presenting, or will present. At any time, one Document in each browsing context is designated the active document. A Document's browsing context is that browsing context whose session history contains the Document, if any. (A Document created using an API such as createDocument() has no browsing context.) Each Document in a browsing context is associated with a Window object.
    </blockquote>

### todos:
 - [ ]  DedicatedWorkerGlobalScope为什么可以更新渲染？




### ref: 

[HTML-whatwg-event loop](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
[HTML-whatwg-browsing-context](https://html.spec.whatwg.org/multipage/browsers.html#browsing-context)
[HTML-w3c-event loop](https://www.w3.org/TR/html52/webappapis.html#event-loops-processing-model)
[HTML-W3C-browsing-context](https://www.w3.org/TR/html52/browsers.html#browsing-context)
[Fullscreen API - whatwg](https://fullscreen.spec.whatwg.org/#run-the-fullscreen-steps)
[w3c - Web Animations](https://drafts.csswg.org/web-animations/#update-animations-and-send-events)