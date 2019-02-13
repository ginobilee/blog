---
title: 面试之js、css的放置位置
tags: interview html performance 阿里云
---
这些问题自己之前也思考过，也在通过阅读规范、chrome文档以及浏览器测试总结。刚好面试中问到了，就此总结一下。

### doctype 声明有什么作用，如果不写会怎么样？如果把一个html5 的文档当作其它文档类型解析了会怎么样？
html5已经不是SGML语言的子集，因此不再需要文档类型定义。实际上，浏览器现在只是通过DOCTYPE 声明来决定使用何种模式(standard mode/quirk mode)来进行文档解析和渲染。

> DOCTYPEs are required for legacy reasons. ***When omitted, browsers tend to use a different rendering mode that is incompatible with some specifications. Including the DOCTYPE in a document ensures that the browser makes a best-effort attempt at following the relevant specifications.***

> In HTML5, the only purpose of the DOCTYPE is to activate full standards mode. Older versions of the HTML standard gave additional meaning to the DOCTYPE, but no browser has ever used the DOCTYPE for anything other than switching between quirks mode and standards mode.

### js和css的放置位置
#### 为什么要把 css 放在 head里，而js 放在 body 后？js应该放在 </body> 后还是前？
1. 非异步形式的 script，其 ***加载和执行*** 都会阻塞 dom解析。即 dom解析会停在 脚本加载处，直到其被加载和执行，才会继续。但是要注意，***阻塞 dom 解析，并不是阻塞渲染。浏览器还是会对已经解析的dom进行 样式计算/渲染等操作***
2. 放在 </body> 前或者后，实质上是阻止了 body 元素的解析完成。在其前放置，则 body 节点尚未关闭；放在其后，则前面 html 的解析已经知道body已完成。
3. 浏览器不是等待所有文档解析完成才展示，而是当一部分文档达到了展示的条件，就将其展示。因此从尽快展示部分文档的角度出发(非可交互，而是度过白屏)，应该让js放在</body>标签之后。
4. defer:
  1. 执行顺序与引用顺序一致
  2. ***加载和执行*** 都不会阻塞 dom解析
  3. 因此会等到 dom解析完再执行
  4. 会在执行完这类脚本后才触发 Domcontentloaded，因此相当于阻塞该事件。当然也阻塞 load 事件。
  5. 对 module scripts 类型的脚本无效。该类脚本默认具有 defer 的效果。
  6. defer: indicate to a browser that the script is meant ***to be executed after the document has been parsed, but before firing DOMContentLoaded***.
5. async:
  1. ***加载*** 时不阻塞 dom的解析，但是加载到了后就会进行执行。因此 ***执行*** 可能打断 dom解析(进而延迟Domcontentloaded事件)。但如果脚本加载很慢，使用async 则不会阻塞 Domcontentloaded 事件的触发。但仍然会阻塞 load 事件的触发。
  2. 执行顺序不能保证与引用顺序一致
6. 外部css 文件的加载会阻塞 dom解析 么？会阻塞渲染么？
    1. 既不会阻塞解析，也不会阻塞渲染(chrome观察得出)
    2. 但延迟加载的css会导致样式重新计算，从而导致 无样式闪烁 问题

> The async and defer attributes are boolean attributes that indicate how the script should be evaluated. Classic scripts may specify defer or async, but must not specify either unless the src attribute is present. Module scripts may specify the async attribute, but must not specify the defer attribute.

> For classic scripts, if the async attribute is present, then the classic script will be fetched in parallel to parsing and evaluated as soon as it is available (potentially before parsing completes). If the async attribute is not present but the defer attribute is present, then the classic script will be fetched in parallel and evaluated when the page has finished parsing. If neither attribute is present, then the script is fetched and evaluated immediately, blocking parsing until these are both complete.

<blockquote>
The following sample shows how a script element can be used to include an external module script.  
<script type="module" src="app.mjs"></script>   
This module, and all its dependencies (expressed through JavaScript import statements in the source file), will be fetched. Once the entire resulting module graph has been imported, and the document has finished parsing, the contents of app.mjs will be evaluated.  
Additionally, if code from another script element in the same Window imports the module from app.mjs (e.g. via import "./app.mjs";), then the same module script created by the former script element will be imported.  
</blockquote>

从规范对于module类脚本的阐述来看，其默认带有了classic脚本的defer效果。结合前面的分析，defer也是更合理的异步脚本加载方式。跟放在</body>之后相比，defer完全不阻塞dom的解析；跟async相比，它会延迟执行直到dom解析完，并在Domcontentloaded事件前触发。

#### 在浏览器中实验的小技巧
这类问题，要在浏览器中可视化地看到差异和效果，不太好控制。如果不想采用自己控制server端响应的方法，可以采用 chrome 中对于 cpu throttle 和 Network throttle 来模拟各种情况，可以方便快捷地达到各种测验场景。

### todo
- [x] 如果将 defer 的script 放在头部，是否会先于文档中的 img 下载，进而在此类文档很多时影响 img 的下载？  
  
实验后发现，defer 的脚本与文档中的 img 引用的图片，优先级都是 low。但因为两者的域名不同，并没有受到下载线程并发个数的影响，图片的下载没有被脚本下载所阻塞。


### ref
1. [mdn Quirks_Mode_and_Standards_Mode](https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode)
2. [html spec the-doctype](https://html.spec.whatwg.org/multipage/syntax.html#the-doctype)