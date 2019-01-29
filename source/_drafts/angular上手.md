
为什么说angular是一个框架？

路由有没有更好的解决方案？

要去比较 umi

projects中，demo内部的测试，与demo-e2e测试有什么区别？  
什么是e2e测试？

核心注解: @Component/@NgModule

### 注解里的import/export与es的export有什么区别？
注解里的是angular的模块系统的输入输出。angular自己的`ngModule`自成一套模块体系。

### 一个组件中使用双向绑定的指令，要在app级的module里来使能，这样合理么？
如果不使能就不会将这部分框架代码引入打包文件，也是合理的，可以减小输出文件提及。

### 如何把prettier引入工作流？

### 放在class中的域与放在constructor里的有什么区别？
后者是TypeScript parameter property 

### 父子组件的层级结构   
angular的设计思想，是在view层上嵌套和混合，形成树结构；而在component层上保持组件的独立，通过service来串联组件，同时保持组件间、组件与service间的解耦。   
react和vue中这种思想就要淡一些。主要是没有angular中这种component与view的独立的设计。可以认为在react和vue中，component(react or vue) = component(angular) + view(angular) + service(angular)  

### 子组件如何调用父组件的回调？
`<app-hero-detail (deleteRequest)="deleteHero()"></app-hero-detail>`   
从上面的用例来看也是可以将父component的回调传给子组件的。  
但是angular的设计思路应该是在这种场景下，使用service来封装要执行的操作，从而将此操作从组件的嵌套关系中解脱出来。

### angular中的双向绑定是如何实现？
> angular processes all data bindings once for each JavaScript event cycle, from the root of the application component tree through all child components.
以绑定`<childcomponent [head]="head"></childcomponent>`为例，angular中采用对表达式左边进行判断来读取值或字符串，右边始终是""。   
而react中`<childcomponent head={head}></childcomponent>`采用右侧判断，如果是变量则用花括号包裹。这种语法更简洁高效，易于理解。   
当然，如果绑定的值是一个字符串，在angular中也可以使用`property="{{value}}"`的形式来绑定。但若不是字符串，则必须使用绑定语法。   

### 更新机制
> Angular executes template expressions after every change detection cycle. Change detection cycles are triggered by many asynchronous activities such as promise resolutions, HTTP results, timer events, key presses and mouse moves.

### 依赖注入(服务注入)的级别 √
通过设置服务的提供商(provider)来控制服务的级别。如果直接将service的provider设置为root，那么在整个app内会使用一个service的单例来提供该服务。如果在某个ngModule提供服务，那么在该module内使用同一个服务实例。如果在组件级别上提供服务，那么会为该组件的每一个实例提供一个单独的service。
```typescript
/**
When you provide the service at the root level, Angular creates a single, shared instance of HeroService and injects it into any class that asks for it. R
*/
@Injectable({
 providedIn: 'root',
})

/**
When you register a provider with a specific NgModule, the same instance of a service is available to all components in that NgModule.
*/
@NgModule({
  providers: [
  BackendService,
  Logger
 ],
 ...
})

/*
When you register a provider at the component level, you get a new instance of the service with each new instance of that component.
*/
@Component({
  selector:    'app-hero-list',
  templateUrl: './hero-list.component.html',
  providers:  [ HeroService ]
})
```


angular的一个module其实是一个独立的功能实体。是为了从应用的视角出发形成其模块化。

angular这种di注入服务的方式，与import然后使用服务的方式有什么区别？

我想关注的是angular的思想而非语法

ref:   
https://angular.io/guide/displaying-data    
读到了 Event binding ( (event) ) 节
