---
title: How chrome works?(part1)
date: 2019-01-29 22:41:38
tags: chrome
---

### 功能结构(进程/线程视角)
chrome采用多进程结构:
1. 主进程(也称为browse进程或browser)，它主要执行:
    1. 运行 UI
    2. 管理 tab(renderer) 和 插件进程
    3. 部分与操作系统的交互，如I/O
2. renderer进程(后面也称为renderer)，即渲染进程，可以认为对应于每个tab有一个renderer进程。renderer进程使用Blink布局引擎来对 HTML/CSS/脚本 进行解析和布局，chrome会为每个renderer进程实例化一个Blink引擎实例。

>  (Blink) The web engine responsible for turning HTML, CSS and scripts into paint commands and other state changes. 

架构图1(来自谷歌):
<img src='https://raw.githubusercontent.com/ginobilee/blog/master/source/images/chrome-structure-1.png' />
图中以(process boundary)为边界分为上下三层，上三层属于browser进程；下三层是renderer进程。

#### browser进程
browser进程管理各个renderer进程，renderer进程之间是相互隔离的，每个render进程对于系统的访问也受browser限制，这是为了安全和性能的考虑。  

browser进程内主要维护两个线程(不止): 主线程(main thread)和I/O线程。  

I/O线程主要负责: 
1. 与系统I/O交互，如网络请求
2. 与renderer通信。I/O线程会为每一个renderer维护一个IPC::Channel，它来负责renderer与browser之间的通信。  

main thread是执行绘制的主体，图1中上三层，主要就是它的工作。可以看到从上到下分为三层:
1. Browser: Represents the browser window, it contains multiple WebContentses.(代表浏览器窗口，包含多个 WebContentses 
2. WebContents: A reusable component that is the main class of the Content module. It's easily embeddable to allow multiprocess rendering of HTML into a view.
> WebContents represents the contents of a webpage. It is the top-level object in the content module, and has the responsibility of displaying a web page in a rectangular view.
3. Renderer / Render host: This is Chromium's "multi-process embedding layer." It proxies notifications and commands across the process boundary.(相当于多个renderer进程在browser中的代理)

browser进程示意(来自谷歌):
<img src='https://raw.githubusercontent.com/ginobilee/blog/master/source/images/chrome-renderer-process.png' />


#### renderer进程
每个renderer进程维护两个线程: main thread和render thread(当提到renderer时总是指进程，线程用render thread区分)。

main thread 主要负责对browser通信

render thread 执行渲染(并非在屏幕上绘制，那是browser进程的工作。这里指 render tree的管理。)的工作，这个线程的实体应该就是前述Blink的实例。它应该是常说的event loop的运行实体，包含两个重要的部分: 渲染引擎与js引擎。

renderer的main thread的作用之一是在render thread与browser进行同步交互时对于其它消息的保存。例如脚本中通过`document.cookie`获取cookie，请求通过main thread发送给browser(browser进程的CookieMonster对象管理着cookie)，同时该render thread的操作会暂停(同步请求，相当于event loop停住了)；等到browser将结果传回来，render再恢复运行。在render线程阻塞的过程中renderer收到的消息，都被main thread所缓存，在render线程收到cookie请求后再依次传给render thread。  

renderer进程示意(来自谷歌):
<img src='https://raw.githubusercontent.com/ginobilee/blog/master/source/images/chrome-renderer-process.png' />


#### renderer与browser的交互
每个renderer中会维护一个全局的(对该进程而言) RenderProcess 对象，它与 browser 进程进行通信，并维护全局状态。针对每个renderer，browser维护一个对应的 RenderProcessHost ，它来维护browser的相关状态，并与renderer通信。  
RenderViewHost 和 RenderWidgetHost (browser进程) 可以认为是 RenderView 和 RenderWidget （renderer进程的render线程内)的代理。   
交互主要对接在图1中的中间两层。  


### 示例
以点击事件为例。如果我们在鼠标点击事件上上绑定了回调，回调中发起了一个网络请求，那么处理的流程应该就是:
1. browser管理的ui线程收到click事件，将其发给renderer
2. renderer收到事件后，会将对应的回调推入对应的任务队列；当event loop有空时，开始调用js engine执行此任务(这里还可以更详细，event loop与js engine的运行逻辑)；js engine执行，发出网络请求；renderer将此请求发给browser的I/O线程
3. browser通过I/O线程调用系统I/O发起请求
4. browser收到响应后，将response回传renderer。于是renderer像处理click事件一样，将其推入对应的任务队列，等待event loop调起js engine执行。

> Each request(已经到了browser管理中) is then converted into a URLRequest object, which in turn forwards it to its internal URLRequestJob that implements the specific protocol desired. When the URLRequest generates notifications, its ResourceDispatcherHost::Receiver and request ID are used to send the notification to the correct RenderProcessHost for sending back to the renderer. 

### todo
- [ ] Blink 与 Webkit 的角色一样么？区别是什么？
   角色一样。区别？
- [ ] WebContents 层的引擎是什么，是不是重绘总是发生在 renderer 进程中，所以会影响性能；而css的transform的改变发生在browser的WebContents层，所以不会影响性能？
- [ ] event loop的一个loop可以认为是render thread内的一次循环标志了一个loop。一个渲染帧呢？比如会触发 requestAnimationFrame 回调 的一个帧，对于chrome来说以什么标志一个帧，或者说是帧之间的边界？
- [ ] 总结完后再去看[Threading and Tasks in Chrome](https://chromium.googlesource.com/chromium/src/+/master/docs/threading_and_tasks.md)，感觉这里参考的三篇文档只是一个抽象的描述，具体实现要复杂的多。加油  
- [ ] 在chrome dev tool中，一个loop中进行的 Recalculate Style/Update Style/Paint/Composite ，以及raster(栅格化)和gpu分别对应这里哪一块?  



### ref
[Multi-process Resource Loading](https://www.chromium.org/developers/design-documents/multi-process-resource-loading)
[How Chromium Displays Web Pages](https://www.chromium.org/developers/design-documents/displaying-a-web-page-in-chrome)
[Getting Around the Chromium Source Code Directory Structure](https://www.chromium.org/developers/how-tos/getting-around-the-chrome-source-code)
[Threading and Tasks in Chrome
](https://chromium.googlesource.com/chromium/src/+/master/docs/threading_and_tasks.md)