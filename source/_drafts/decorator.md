### 总结
```javascript
function decoratorFn(target, key, descriptor) {
  /*
  当作用于class的属性，target是class构造函数的prototype，key是对应的键名?，descriptor是该属性的描述符号

  当作用于class，它接收的是class的constructor
  */
}
```
因为decorator是一个表达式，它也可以接受参数，然后返回一个属性控制函数:
```javascript
class C {
  @enumerable(false)
  method() { }
}

function enumerable(value) {
  return function (target, key, descriptor) {
     descriptor.enumerable = value;
     return descriptor;
  }
}
```
> For the same reason, descriptor decorators work on object literals, and pass the object being created to the decorator.

即它也可以装饰一个对象字面量，这时它接受的是该对象本身。

当有多个decorator时，会先执行后声明的。如:
```javascript
@F("color")
@G
class Foo {
}

// desugaring as:
var Foo = (function () {
  class Foo {
  }

  Foo = F("color")(Foo = G(Foo) || Foo) || Foo;
  return Foo;
})();
```

### ref2的文章写得很棒，只要看后面的语法糖解构，立马就明白了decorator做了什么


### ref1中decorator
tc39的 decorator proposal
> A decorator function is a function that takes and returns either a element descriptor or a class descriptor. The body of a decorator function modifies and returns the descriptor it receives to change the semantics of the decorated entity. Descriptor types can be differentiated by their kind property, which is either "method", "accessor", "field", or "class". Descriptors also have a @@toStringTag property which has the value "Descriptor"; this property helps differentiate them from other objects.

ref:
[tc39 decorator proposal](https://tc39.github.io/proposal-decorators/#decorator-semantics)
[decorator summary](https://github.com/wycats/javascript-decorators)