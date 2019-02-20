---
title: position
tags: css position
---

### 如果我想实现文本块内隔行一个颜色的功能，如何实现？

### position: fixed 的元素，总是相对于视窗定位么？有没有特殊情况？

/* ------------- 问题区分割线 -------------------- */
### containing block什么用？
可以说用于定位所有元素。比如说，`float`是基于其包含块进行定位的；`position: absolute`是基于其第一个非static的父元素进行定位的，也可以把这个元素认为是其包含块。  
重要的是包含块如何确定。

### formartting context是什么？
是一组规则，还是一个实体？  
应该既是一组规则，又是一个实体。

### css formatting model
> It is important to note that the notions of a block-level box and block container box are disjointed. The first, describes how the box behaves with its parents and sibling. The second, how it interacts with its descendants. Some block-level boxes, like tables, aren't block container boxes. Reciprocally, some block container boxes, like non-replaced inline blocks and non-replaced table cells, aren't block-level boxes.
> Block-level boxes that also are block container boxes are called block boxes.

块级框和块级容器是不一样的，前者用于规范它如何与其父级元素和兄弟元素定位；后者用于规范它与子元素的关系。  
典型的块级框但不是块级容器的是 table  
典型的块级容器但不是块级框的是 (非替换行内block) 和 (非替换table cell)  

同时是块级容器的块级框被称为块盒子。

> Block containing boxes contain only inline-level boxes or only block-level boxes. But often the document contains a mix of both. In that case, anonymous block boxes are created around adjacent inline-level boxes.

### bfc
> A BFC will contain everything inside it, float and clear will only apply to items inside the same formatting context, and margins only collapse between elements in the same formatting context.

> Vertical margins between adjacent block-level boxes in a block formatting context collapse.

In addition to the root element of our document (the html element) ,a new BFC is created in the following situations:

floated elements
absolutely positioned elements (including position: fixed and position: sticky
elements with display: inline-block
table cells or elements with display: table-cell, including anonymous table cells created when using the display: table-* properties
table captions or elements with display: table-caption
block elements where overflow has a value other than visible
display: flow-root
elements with contain: layout, content, or strict
flex items
grid items
multicol containers
elements with column-span: all

> overflow: clip. This will act like overflow: hidden however it does not allow for programmatic scrolling, the box becomes non-scrollable. In addition it ***does not create a Block Formatting Context*** .

### and clear only clears past floats in the same block formatting context. 
所以如果为一个后面的元素创建 bfc，则它的 清除 会失效，从而导致前面的 float 元素对它生效？nono，如果处于不同的 bfc了，那么前面一个 bfc的 float 肯定不会影响到后面的元素的，因为它会处于其自身的 bfc内。

### 可以利用 float 来让元素垂直居中么？
不可以，float只能左右浮动，此时设置 top/bottom 无效，因此无法像定位那样利用 top/bottom 使其居中

float 的本质是不是相当于该元素的块级框从文档流中删除，而行框仍然存在？

### line-height 可以取哪些值，取百分比的时候基准是什么？
> The line-height CSS property sets the amount of space used for lines, such as in text. On block-level elements, it specifies the minimum height of line boxes within the element. On non-replaced inline elements, it specifies the height that is used to calculate line box height.

接受的值类型: 
1. <number> (unitless)
The used value is this unitless <number> multiplied by the element's own font size. The computed value is the same as the specified <number>. In most cases, this is the preferred way to set line-height and avoid unexpected results due to inheritance.
2. <percentage>
Relative to the font size of the element itself. The computed value is this <percentage> multiplied by the element's computed font size. 

### vertical-align 应该设置在谁身上，父元素还是当前元素，块级元素还是行内元素？
> Note that vertical-align only applies to inline and table-cell elements
> <percentage>
Aligns the baseline of the element to the given percentage above the baseline of its parent, with the value being a percentage of the line-height property. A negative value is allowed.

只能设给行内元素，使其相对于父级元素在垂直方向上定位。  
当设置百分比值时，基准是其 line-height 值，从其 baseline 向上定位。可以接受负值。

### position 有哪些常用值？
static / relative / absolute / fixed

### 不同值有什么不同的展示形式？
1. static: 放置于文档流中的默认位置
2. relative: 相对于该元素在文档流中的默认位置定位，元素还占据其默认位置对应的空间
3. absolute: 相对于包含块进行定位，元素脱离其在文档流中的默认位置，就像该元素不存在于文档流的该位置一样。包含块如何确定？
    1. 对于块状元素，是 (父元素中position属性不是static的块状元素) 或者 初始块(即视窗)
    2. 对于行内块元素，是什么？
4. fixed: 相对于视窗定位，脱离原来的文档流位置

### position: relative 的元素，偏移后的位置会与其它元素覆盖么？
会。因为 `position: relative` 的元素在文档流中还是占据原来的位置，后面的元素也是将其当作还在默认位置。

### position: absolut; top: 0; bottom: 0; margin: auto 0; 是不是可以垂直居中？
如果给元素设置一个固定高度，是可以的。  
position: absolut; top: 0; bottom: 0; left: 0; right: 0; margin: auto; 可以水平垂直居中？  
设置宽高就可以。

### position: auto 的效果？
> For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well. See the sections on the width and height of absolutely positioned, non-replaced elements for details. For replaced elements, the effect of this value depends only on the intrinsic dimensions of the replaced content. See the sections on the width and height of absolutely positioned, replaced elements for details.

### margin/padding 取百分数时基准是什么？
根据包含块元素的 width 。即便对于margin-top也是如此。这点 margin/padding 一致。
percentage: 
The percentage is calculated with respect to the width of the generated box's containing block. Note that this is true for 'margin-top' and 'margin-bottom' as well. If the containing block's width depends on this element, then the resulting layout is undefined in CSS 2.1.

对于定位元素，margin为百分比时有什么不同？？？

### top/bottom/left/right 取百分数时基准是什么？
1. top & bottom: 
  1. Percentages:  	refer to height of containing block
2. left & right:
  1. Percentages:  	refer to width of containing block

### width/height 取百分比值时以什么为基准？
width: 包含块的width  

height: 包含块的height
<percentage>
Defines the height as a percentage of containing block's height.

### 这些属性取 em 时，是以什么作为基准？
相对长度单位，这个单位表示元素的font-size的计算值。如果用在font-size 属性本身，它会继承父元素的font-size。


### 将block元素的position改为absolute会改变其宽度模型么？
会不会从继承父亲宽度变为适应内容宽度？  会，如同float一样，都会将元素的盒模型更改为适应内容宽度，除非显式地指定。    
如果对块级元素设置 position: relative 不会更改其默认行为。但更改为 position: absolute 就会更改。  
对于行内非替换元素，设置 position: absolute 则会直接将元素更改为块级展示元素。   

position: absolute 的元素，如果完整定义了 top/right/bottom/left，那么其宽度和高度将自动确定，除非再给其指定特定值。



### 层叠上下文
<blockquote>
文档中的层叠上下文由满足以下任意一个条件的元素形成：

根元素 (HTML),
z-index 值不为 "auto"的 绝对/相对定位，
一个 z-index 值不为 "auto"的 flex 项目 (flex item)，即：父元素 display: flex|inline-flex，
opacity 属性值小于 1 的元素（参考 the specification for opacity），
transform 属性值不为 "none"的元素，
mix-blend-mode 属性值不为 "normal"的元素，
filter值不为“none”的元素，
perspective值不为“none”的元素，
isolation 属性被设置为 "isolate"的元素，
position: fixed
在 will-change 中指定了任意 CSS 属性，即便你没有直接指定这些属性的值（参考 这篇文章）
-webkit-overflow-scrolling 属性被设置 "touch"的元素
在层叠上下文中，其子元素同样也按照上面解释的规则进行层叠。 特别值得一提的是，其子元素的 z-index 值只在父级层叠上下文中有意义。子级层叠上下文被自动视为父级层叠上下文的一个独立单元。

总结:

给一个 HTML 元素定位和 z-index 赋值创建一个层叠上下文，（opacity 值不为 1 的也是相同）。
层叠上下文可以包含在其他层叠上下文中，并且一起创建一个有层级的层叠上下文。
每个层叠上下文完全独立于它的兄弟元素：当处理层叠时只考虑子元素。
每个层叠上下文是自包含的：当元素的内容发生层叠后，整个该元素将会 在父层叠上下文中 按顺序进行层叠。
</blockquote>

### z-index
auto
The box does not establish a new local stacking context. The stack level of the generated box in the current stacking context is the same as its parent's box.
<integer>
This <integer> is the stack level of the generated box in the current stacking context. The box also establishes a local stacking context in which its stack level is 0. This means that the z-indexes of descendants are not compared to the z-indexes of elements outside this element.

### 只有 position 不为static的元素才会使得z-index发挥作用？
是的。实际上，对于没有定位的元素，设置 z-index 没有太大意义，因为文档流不会允许两个元素重叠。  
而对于 margin 为负从而从其它元素重叠的场景，应该是没有办法改变默认的遮盖顺序的把？  
似乎是的。但一个元素过长或margin为负后，总是遮盖在它前面或后面的元素，为何？为何不是后来的元素遮盖前者？   
因为我给它了一个 opacity: 0.9 ，这会让它创建一个层叠上下文，从而显示在所有与初始化层叠上下文同层的元素上。(为有opacity的元素设置层叠上下文也是可以理解的，因为它可能会需要处理不同元素的透视)  
当处于同一层叠上下文的元素显示时，后面的元素总是覆盖前面元素的背景，但前面元素的内容会覆盖后面元素的背景。

### css的布局原理

css采用流式布局，根据设定的方向(默认为 writing-mode: horizontal-tb)，一个接一个地放置元素。  
为了确定一个元素的边界，css用盒模型来描述每个元素的视觉表现。box可以认为是css描述元素的视觉表现的一个抽象类，它使用 margin/padding/border/width/height... 等等属性来描述元素的表现。根据这个模型，每个元素的视觉表现都被视为一个矩形框。  
除了确定一个box的边界、宽度等等，还需要确定一个盒子应该在流中如何放置、以及如何处理其子元素，为此css建立了 block box、inline-level box、inline box等box实例。一个元素在视觉上总是一个前述的box实例。  
从元素的语义出发，css为一些html元素规定了其默认的box实例类型，如 `p`、`div` 是 `block box`，`span`是 `inline box`，`img` 是 `inline-level box`。开发者也可以利用其它属性来更改其默认盒模型，如 `display`。值得注意的是，一些属性如 `float`、`position` 也会影响元素的盒模型类型，如对一个 `span` 设定 `float: left` 或 `position: absolute` 都会使其变为 `block box`。  
当一个元素的盒模型确定后，css开始将其放入布局中。一般来说，一个元素总是位于其父元素的盒模型中，并依照前述流式布局来进行定位。  

但css也提供了一些属性来更改这种默认的定位: `float`、`position`。    
为元素设置这两个属性之前，它处于一个正常的流中，有一个静态位置。设置了这两个属性后，该元素在流中的位置就会发生变化，甚至脱离该流。  
`float`就会使一个元素脱离该流。脱离后，它的定位还是会***基于其原本的静态位置***，然后发生偏移。但 `float` 元素虽然脱离了原来的文档流，但仍然会对原来流中的行内元素产生影响，行内元素会以该 `float`元素仍然存在于文档流中的形式进行布局，也就是避开该 `float` 元素。  
`position`元素则可以使一个元素脱离静态定位，而使用相对或绝对定位。绝对定位的元素(`position: absolute`)会以其祖先元素中最近的非静态定位元素为基准定位，同时该绝对定位元素也从其原本的文档流中完全消失了；相对定位的元素(`position: relative`)则仍然不会从其文档流消失，只是可以相对其静态位置发生偏移，而在文档流中占据的位置不变，于是其兄弟元素仍然把它当作还在其静态位置进行布局。  

`float` 元素脱离原本的文档流后，它占据的空间就可能超过其父元素而影响到其它元素。而如果想让`float`元素仍然处于父元素的盒模型内，就需要为父元素创建一个 块级格式化上下文(bfc) 来包裹之。所谓格式化上下文，其实就是css对某个元素进行布局的背景环境以及布局规则。不同的格式化上下文之间，可以认为是独立的；或者说，每一个 bfc，都创建了自己的一个文档流(是否可以这样理解？存疑)。而`float`的影响范围，不会超出其 bfc。  
bfc 的作用，还体现在外边距合并上。当上下相邻的 `block box`都有上/下外边距时，该外边距会合并；内外嵌套的 `block box`在上下边距紧邻时(没有padding、border阻隔)也会发生合并。但这里合并的边界是它们属于同一个 bfc。如果不属于同一个 bfc，则外边距就不会合并了。  

除了 bfc，还有其它不同类型的格式化上下文，如 `Flex Formatting Context`。

### ref
[How to Read W3C Specs](https://alistapart.com/article/readspec)
[The stacking context](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context)
[Visual formatting model](https://developer.mozilla.org/en-US/docs/Web/CSS/Visual_formatting_model)
[Formatting Contexts Explained](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flow_Layout/Formatting_Contexts_Explained)
[In Flow and Out of Flow](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flow_Layout/In_Flow_and_Out_of_Flow)
[Block and Inline Layout in Normal Flow](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flow_Layout/Block_and_Inline_Layout_in_Normal_Flow)
[Block formatting context](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context)