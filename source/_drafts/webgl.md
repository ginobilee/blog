> WebGL is a JavaScript API that allows us to implement interactive 3D graphics, straight in the browser. 

 it’s designed to work directly with your graphics card. 

### canvas 与 WebGL 的关系？
canvas 可以绘制 2d 或者 3d，绘制3d 是使用 webgl?

### canvas 可以定点更新么？
应该是利用 context.putImageData() 来实现更新

### canvas从  img / vedio 中获取image 再渲染后就会被tainted
> As soon as you draw into a canvas any data that was loaded from another origin without CORS approval, the canvas becomes tainted. A tainted canvas is one which is no longer considered secure, and any attempts to retrieve image data back from the canvas will cause an exception to be thrown.