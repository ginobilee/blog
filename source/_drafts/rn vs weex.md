### rn
1. how to use it ?
2. could it be hot released?
3. react-navigation 与 react-native-navigation 的差异？
  1. react-navigation
    1. > Each time you call push we add a new route to the navigation stack. When you call navigate it first tries to find an existing route with that name, and only pushes a new route if there isn't yet one on the stack.
    2. navigate() 方法会在当前 stack navigator的历史中查找有无目标页，有的话就使用该页；没有的话才创建一个新的记录。而 push() 方法总是创建一个新的记录。所以返回栈底要使用 navigate 方法。
    3. 在调用 push 方法时，当前的 screen 并没有销毁，只是不在栈顶了，所以它对应的组件不会被销毁，componentWillUnmount 也不会在其上被调用。同样，在有多个 stack navigator 时，使用 tab navigator 切换了当前可见的 stack navigator，它也不会被销毁，而且其状态会被保存。
    4. 那么如何判断当前页面是被 push 还是 back 呢？可以使用这些api: willFocus, willBlur, didFocus and didBlur
    5. 如何解决 navigator 的嵌套？每个 stack navigator 仍然返回一个 component，所以可以当作另一个 stack navigator的 screen 组件，如此实现了 navigator 的潜逃。同时，在路由变更时，不需要指定是哪个 navigator，它会从最近的 navigator 一直向最外层寻找目标页，找不到则什么都不会发生。 `React Navigation attempts to find the route on the closest navigator and then performs the action there. `。
4. ScrollView vs ListView？
    1. ListView？ 到底做了哪些优化还是不知道。它早于 FlatList 和 SectionList 。是不是也做了类似只渲染在可见区域内的组件的优化？那么当用户快速滑动页面时该怎么做呢？
    2. > Lists are like ScrollViews, but optimized to recycle elements and reduce re-renders for better performance. As a result, the APIs are a little more complicated than ScrollView. The built-in list components in React Native are still evolving, so you can expect more stability and performance from these in the future.
    3. > FlatLists are used for large quantities of scrollable content. They expose the underlying ScrollView, but add performance improvements: only rendering the content on screen (clipping offscreen content), and only updating rows that have changed. Like ScrollViews, they can scroll horizontally or vertically.



### weex
1. how to use it?
2. 工作模式
    1. weex最终是打包成一个 js bundle，然后发布就是发布此段 bundle。在运行时，实际上是由js engine将此逻辑转化为原生的应用。那么问题是: 这样的架构应该会有比较大的通信开销，毕竟用户交互的是原声应用，而执行渲染和响应处理的是js，然后js的响应结果又要通过 通信线程 通知到原生ui层。如果这样的交互很频繁，通信开销会不会成为瓶颈，以及占用很多内存？
    2. rn 也是这样的方式么？好像是分别打包成不同的平台代码，相当于发布的还是apk，然后每次发布都要进行编译，直接将js代码编译成对应的平台代码，是这样的么？

### rn vs weex
1. what is the difference?
    1. 在原生平台上的运行模式不一样？如weex中第2条所述，还要再看看
2. which is better? in which conditions?
3. 谁对 ts 的支持更好？
4. 想要实现 android 中例如不同的 intent/activity 的功能，分别如何实现？
    1. rn中通过使用 react-navigation 中的 stack/tab navigator 就可以实现。将一组 activity 包装在一个 stack navigator 中。
    2. weex ?
5. 发布流程？
6. 热更新？
7. 与原生的差距是否肉眼可见？
8. > Weex 的调试方式有多种，如果说RN的调试模式是解放了原生开发的调试，那么 Weex 的调试方式可以说是赋予了 web 模式调试原生应用的能力。
  1. ???
9. > 熟悉 React Native 的人都知道， ***React Native 的发布实际上就是发布一个 JSBundle***，Weex 也是这样，但不同的是，Weex 将工程进行分包，发布多个 JSBundle。因为 Weex 是单页独立开发的，每个页面都将通过 Weex 打包器将 vue/we 页面打包成一个单独的 JSBundle，这样的好处在于减少单个 bundle 包的大小，使其变的足够小巧轻量，提高增量更新的效率。
    1.  ???
10. 发包
  1.  > 打包后的 JSBundle 一般发布到发包服务器上，客户端从服务器更新包后即可在下次启动执行新的版本，而无需重新下载 app，因为运行依赖的 WeexSDK 已经存在于客户端了，除非新包依赖于新的 SDK，这也是热更新的基本原理。
11. 开发整个app
  1.  > 使用 Weex 开发整个 App，期间触碰到 Weex 的在此模式下诸多不足，如 StatusBar 控制、Tab 切换、开场动画自定义、3DTouch、 Widget 等等原生的特色功能没有现成的 API，需要我们自己扩展，甚至扩展不了。因此并不能完全“灭掉”原生。
  2.  相较之下，rn在这方面更好些，由 react-navigator 等等可以使用。所以 weex 的更多应用场景是 单页应用。



ref:
1. [](https://github.com/zwwill/blog/issues/3)
2. [](https://github.com/zwwill/blog/issues/9)