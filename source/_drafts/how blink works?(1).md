

### v8 的实现 https://docs.google.com/document/d/1WphFrSM18-m6b4RFaBxwLL_zNlpOdCtEbuRclQ-S_ts/edit#
Resolution / Rejection timing
When resolve or reject is called, the Promise internal state changes immediately, but the associated handlers will be executed in the next microtask execution, i.e. asynchronously. This behavior is consistent with JavaScript Promise’s behavior.


### [blink overview](https://docs.google.com/document/d/1aitSOucL0VHZa9Z2vbRJSyAIsAz24kX8LFByQ5xQnUg/edit#)

> iframes in one tab may be hosted by different renderer processes and that iframes in different tabs may be hosted by the same renderer process. There is no 1:1 mapping between renderer processes, iframes and tabs.

一般来说，每个tab/iframe都是一个renderer process在运行，但并不确定。有时候为了资源考虑，会将多个页面的多个iframe/tab放在一个renderer process中。


blink 在 chrome 中的位置？

### https://docs.google.com/document/d/1aitSOucL0VHZa9Z2vbRJSyAIsAz24kX8LFByQ5xQnUg/edit#
How many threads are created in a renderer process?

Blink has one main thread, N worker threads and a couple of internal threads.

Almost all important things happen on the main thread. All JavaScript (except workers), DOM, CSS, style and layout calculations run on the main thread. Blink is highly optimized to maximize the performance of the main thread, assuming the mostly single-threaded architecture.

We're actively decreasing # of Blink public APIs by moving web-platform code from Chromium to Blink (the project is called Onion Soup).

### life of a pixel
So the goal of rendering can be stated as: turn HTML / CSS / JavaScript into the right OpenGL calls to display the pixels.
But keep in mind a second goal as we describe the pipeline:  We also want the right intermediate data structures to update the rendering efficiently after it's produced, and answer queries about it from script or other parts of the system.

The DOM serves double duty as both the internal representation of the page, and the API exposed to script for querying or modifying the rendering.
The JavaScript engine (V8) exposes DOM web APIs as thin wrappers around the real DOM tree through a system called "bindings".


Usually, one DOM node gets one LayoutObject.  But sometimes a LayoutObject has no node, or a node has no LayoutObject.
It's even possible for a node to have more than one LayoutObject.

伪元素是没有对应的dom节点的，



It's even possible for an element to be partly in front of and partly behind another element.
That's because paint runs in multiple phases, and each paint phase does its own traversal of a subtree.




一层层的语言包装包装与语言解析

脚本语言(html/css/js) -> 宿主语言(dom?) -> 高级语言(c++?) -> 特定对象(layoutobject) -> 绘制语言(opengl?) -·-> 底层绘制语言的包装(skia?) -> 机器语言？



Change is modelled as animation frames.
Each frame is a complete rendering of the state of the content at a particular point in time.


Compositor 是不同于主线程的另一个线程。这里的主线程是blink的主线程，可以认为是 event loop，也就是前述的render thread.


负责与用户交互的还是 browser process




Layers can be large - rastering the whole layer is expensive, and unnecessary if only part of it is visible.
So the compositor thread divides the layer into tiles.
Tiles are the unit of raster work.  Tiles are rastered with a pool of dedicated raster threads.  Tiles are prioritized based on their distance from the viewport.



gpu paint结束完后以 `quac` 的形式交给 browser 进程进行屏幕绘制。
A quad is like a command to draw a tile in a particular location on the screen, taking into account all the transformations applied by the layer tree.  Each quad references the tile's rastered output in memory (remember, no pixels are on the screen yet).
The quads are wrapped up in a compositor frame object which gets submitted to the browser process.



The compositor thread has two copies of the tree, so that it can raster tiles from a new commit while drawing the previous commit.

