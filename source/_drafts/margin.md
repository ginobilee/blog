---
title: margin
tags: css 
---
### 设置块级元素的 `box-sizing: border-box; width: 200px` ，这里的width 包含 什么，是否padding+border?
是的。此时设置的width包含了 border + padding + content width

### 对于块级元素，默认情况下，其宽度会被子元素撑宽么？如果不能，怎么才能实现呢？
`width: fix-context` 现在可以实现，有没有什么问题？

### 包含块的内容宽度是留给子元素的，子元素的 margin+padding+border+content width = container box's content width。如果将包含块设为 `box-sizing: border-box`，而其内容区宽度不变，会不会影响子元素的所能获得的宽度？或者说，子元素所能占有的宽度，是否还是包含块的内容区宽度？
应该仍然是内容区宽度。

一个块状元素，默认继承了父元素的内容区宽度作为自己的盒子模型宽度。  
如果此时其 margin/padding/border 都为0，那么这个宽度就都被 content-width 所据有。  
如果此时其 margin/padding/border 加起来的宽度小于包含块的 content-width，那么剩余的空间就被其内容所据有；如果 margin/padding/border 已经大于了包含块的 content-width，那么内容区宽度就成了0，同时其盒模型宽度变大。

### margin collapse 发生在什么场景？
包含块的margin与子元素都没有border/padding时，margin会collapse么？  
会

### width/margin/padding 取百分比时，基准是什么？
1. width
Percentages:  	refer to width of containing block  
The percentage is calculated with respect to the width of the generated box's containing block. If the containing block's width depends on this element's width, then the resulting layout is undefined in CSS 2.1.

### html 和 body 的默认高度是多少，视窗么？如果分别给定一个特定值，会是什么样？
默认是视窗的高度，修改为特定值可以生效。设置border后就可以看到。
但设置backgroud会浮动到视窗。即如果设置html高度为100px，backgroud-color为黑色，则整个视窗背景色都为黑色。
设置为百分比值也会生效，如 50% 会将其高度设为包含块内容区高度的一半。

### ref
[css box-dimensions](https://www.w3.org/TR/CSS2/box.html#box-dimensions)