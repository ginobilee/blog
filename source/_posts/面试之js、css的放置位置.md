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
2. 从规范角度出发，</body>标签之后不应该再有任何内容，因此放在</body>之后通不过html规范的验证；但实际上浏览器都会兼容这种处理，将script同样当作在</body>内来处理。他们对于性能也没有可以观察到的影响。如果说是不是因为一些遗留原因放在之后更好，这个就不是很清楚了，不过感觉意义不大。
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

从规范对于module类脚本的阐述来看，其默认带有了classic脚本的defer效果。结合前面的分析，defer也是更合理的异步脚本加载方式。跟放在</body>之前相比，defer完全不阻塞dom的解析；跟async相比，它会延迟执行直到dom解析完，并在Domcontentloaded事件前触发。

#### css 如果直接写在html里，它的解析执行会影响dom的解析么？如果两步是分别进行的
写在 html 里的css，对于dom 来说就是一个 script 节点。它的内容应该是由css 解析器单独解析的，因为其规则与 html 解析规则不一样。那么两者分别解析时，什么时候将两者解析的结果合并处理？是不是 dom 上一个节点处理完了，流式地准备将其进行 render 处理，然后就去查看样式规则(css会最终解析成一条条的规则，还是一棵样式树？cssom 是树结构么？如果是树，那么多个没有关联的样式规则如何整理在一棵树上？应该是一棵树，就算开发者没有写根元素的样式，浏览器会给其添加默认样式，也是以样式表的形式提供的。如此就有了根节点，然后就可以将所有规则构建成一棵树)，然后将节点渲染到页面上。所以，当执行render时，如果样式表为空，那么就会将默认样式渲染在页面上。然后等开发者定义的样式表解析完，再将特定样式附加在对应节点上，然后浏览器重新在页面上重新绘制该元素。  
以这样的方式来讨论的话，css不会影响或阻塞 首评出现内容的时间，但会影响首屏出现内容的样式。如果css解析地慢，那么首屏出现的内容会发生样式闪烁。所以将css以外链的形式放在head里，也不会影响dom的解析，但会影响首屏内容的渲染结果。再结合浏览器中观察的结果，似乎是先解析dom，然后在样式获取到后进行重新绘制，如果样式获取地早，赶上了第一波绘制前，那么就不会出现样式闪烁？

看来我的以上认识不正确: 
> 默认情况下，CSS 被视为阻塞渲染的资源，这意味着浏览器将不会渲染任何已处理的内容，直至 CSSOM 构建完毕。
应该是: css不阻塞 dom 解析，但是阻塞渲染。按照 google 的文档阐述是这样的，在 domcontentloaded 之前不会执行渲染，因为这个事件标志着 dom 和 cssom 的完成，然后才会开始构建 render tree。  

但实际上好像不是这个样子，在 dcl 之前就已经有内容展示在网页中了。  
很明显的例子是，我在 head 里加载了一个外链css，通过将网速改为慢速，加载此文件需要 5s+，但在加载到它之前网页上就已经有了文档内容。而从 window.performance.timing.domInteractive 获知，这个时间都是与 window.performance.timing.domContentLoaded... 一致的，都在css文件下载之后才触发。所以浏览器并不是css外部链接并不会阻塞浏览器的渲染，但是会阻塞文档的 loaded，以及出现样式闪烁。  

ref:
[评估关键渲染路径](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/measure-crp)


> CSSOM 为何具有树结构？为页面上的任何对象计算最后一组样式时，浏览器都会先从适用于该节点的最通用规则开始（例如，如果该节点是 body 元素的子项，则应用所有 body 样式），然后通过应用更具体的规则（即规则“向下级联”）以递归方式优化计算的样式。


关于渲染树(render tree):
<blockquote>
1. DOM 树与 CSSOM 树合并后形成渲染树。
2. 渲染树只包含渲染网页所需的节点。
3. 布局计算每个对象的精确位置和大小。
4. 最后一步是绘制，使用最终渲染树将像素渲染到屏幕上。
</blockquote>

ref:
[First Contentful Paint](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint)

#### 在浏览器中实验的小技巧
这类问题，要在浏览器中可视化地看到差异和效果，不太好控制。如果不想采用自己控制server端响应的方法，可以采用 chrome 中对于 cpu throttle 和 Network throttle 来模拟各种情况，可以方便快捷地达到各种测验场景。

### todo
- [x] 如果将 defer 的script 放在头部，是否会先于文档中的 img 下载，进而在此类文档很多时影响 img 的下载？  
  
实验后发现，defer 的脚本与文档中的 img 引用的图片，优先级都是 low。但因为两者的域名不同，并没有受到下载线程并发个数的影响，图片的下载没有被脚本下载所阻塞。


### ref
1. [mdn Quirks_Mode_and_Standards_Mode](https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode)
2. [html spec the-doctype](https://html.spec.whatwg.org/multipage/syntax.html#the-doctype)