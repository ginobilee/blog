### 3.1 线性

### how to choose some learning algorithm
1. One practical justification of the choice of the linear form for the model is that it’s simple. 
2. linear models rarely overfit


Overfitting is the property of a model such that the model predicts very well labels of the examples used during training but frequently makes errors when applied to examples that weren’t seen by the learning algorithm during training.

### 3.2 逻辑回归

标准对数函数: standard logistic function (also known as the sigmoid function)

看起来感觉是最大似然估计，将每个估计正确的表达式连乘起来，预测的目地就是为了能够达到其最大值。

### 3.3 决策树
这节没看懂。大概是讲 决策树 问题是什么问题，以及通用的解法。

决策树与classification 有什么区别？

### 3.4 svm
kernel trick:  
把平面上非线性的划分线转化为高维空间上的线性划分  

### 3.5 knn
> Once a new, previously unseen example x comes in, the kNN algorithm finds k training examples closest to x and returns the majority label, in case of classification, or the average label, in case of regression.