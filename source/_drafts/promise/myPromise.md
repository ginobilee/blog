---
title: myPromise
date: 2019-01-24 22:18:06
tags:
---

看了规范中阐述 `Promise` 时所用的数据结构和算法，才觉得自己的实现真是low爆了...

比如，为了在一个 `pending` 的promise (promiseA)的then方法中注册回调，同时返回一个新的Promise，我构造了一个 `FuturePromise` 结构。它的属性包括传入的 `onFullfill` 和 `onReject` ，以及一个 `cbs` 数组来存放它的回调。然后将这个 `FuturePromise` 对象push入 promiseA 的 `cbs` 数组中。  
因为是返回了一个新的数据结构，所以也需要为这个类添加 `then` 方法。  
反观规范中的实现，用 `PromiseCapability Record` 来作为 `Promise` 的容器，每次调用 `Promise` 构造器时，生成一个`PromiseCapability Record`，其中一个属性是返回的`promise`。