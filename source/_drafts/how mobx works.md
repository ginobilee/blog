### reactions
1. observer
2. reaction
3. autorun
4. when
5. 
> observer turns React (function) components into derivations of the data they render. 
> MobX reacts to any existing observable property that is read during the execution of a tracked function.



如果只有一个store，多个层级引用store里不同的变量如何实现，要层层嵌套么？还是直接将store.xx.yy 写给组件？


### mobx vs redux
两者关注的都是数据管理。react本身致力于解决view层问题，其数据管理(应该说框架本身只提供了context和setstate)并不能开发者满意。所以它们都想解决 ***从数据变更到组件变更，从事件到数据自动更新*** 这个问题。  
我想两者的不同之处在于，redux更关注的是 ***从事件到数据更新***，它的 `action->reducer->store` 模型想解决的也是 ***从不同事件更新数据*** 的问题。如果数据都是在组件内，当然没有什么好说的，但当数据从组件剥离，放在全局的位置时，不同事件、不同组件更新数据的过程如何规范？这是redux的关注点。  
而mobx的关注点更偏向 ***从数据变更到组件更新***，而mobx想解决这个问题的思路是让组件智能感应数据的更新。使用mobx，应该避免的是在组件内传递observable，而应该从store里来建立依赖？那么它是怎么让组件更新的，不使用setState么？  

### react的context又是怎么做的，比如我更改了context的一个变量，依赖它的组件如何自动更新？
mobx 只要对于 model 声明了 observable；然后在消费它的组件上用 @observer 注解，就能够自动将数据的更新传递到组件，how?
    就算是在监控到变化后，是不是用的 setstate?

1. mobx 中是怎么收集 observable 的依赖者的？
    1. 还是利用 属性监听，与 vue 类似
2. 某个 observable 变更之后，它更新其 依赖者 的方式是不是跟react fiber更新的思路一样，去遍历更新？因为说的是同步执行
    1. 确实类似，只是它用数组保存。像是 react 之前的 stack reconciler
3. 对于react 组件，更新是采用 setstate 么？如果多个有嵌套关系的组件依赖了同一个 observable，会同时调用 setstate 么？
    1. 这里是封装在 mobx-react -> observer 中的。


mobx 的直观感受是对react 的侵入性比较强。不像 redux 这样的库，基本都是在做 react 没有的事情。mobx 侵入了react 自身的响应系统

> only those formulas that are currently visible or that are used indirectly by a visible formula, need to re-compute when one of the observed data cells change.

> When a recomputation is triggered the function is pushed onto the derivation stack; a function stack of currently running derivations. 

> Frameworks like Meteor, Knockout, Angular, Ember and Vue all expose reactive behavior similar to MobX. 

> I believe unpredictability to be, rightfully, one of the most important reasons for the popularity of Flux patterns and especially Redux: it addresses exactly this issue of predictability when scaling up. There is no magic scheduler at work.

> So far UI libraries have always taken the easy way out when it comes to scheduling derivations: Mark derivations as dirty, and re-run them on the next tick after all the state has been updated.

