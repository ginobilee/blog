### 3 datasets
train set: 

validation set: 
> We use the validation set to 1) choose the learning algorithm and 2) find the best values of hyperparameters.
 
test set:    
> We use the test set to assess the model before delivering it to the client or putting it in production.

比例:   
从小数据量时 70/15/15 -> 大数据量时 95/2.5/2.5  (百分比)

### 5.4 underfitting and overfitting
> There could be several reasons for underfitting, the most important of which are:
• your model is too simple for the data (for example a linear model can often underfit); • the features you engineered are not informative enough.
> The solution to the problem of underfitting is to try a more complex model or to engineer features with higher predictive power.

Overfitting:  
> The model that overfits predicts very well the training data but poorly the data from at least one of the two holdout sets.

> Several reasons can lead to overfitting, the most important of which are:
• your model is too complex for the data (for example a very tall decision tree or a very deep or wide neural network often overfit);
• you have too many features but a small number of training examples.

> Several solutions to the problem of overfitting are possible:
1. Try a simpler model (linear instead of polynomial regression, or SVM with a linear kernel instead of RBF, a neural network with fewer layers/units).
2. Reduce the dimensionality of examples in the dataset (for example, by using one of the dimensionality reduction techniques discussed in Chapter 9).
3. Add more training data, if possible. 4. Regularize the model

> Regularization is the most widely used approach to prevent overfitting.

### 5.5 Regularization
> if your only goal is to maximize the performance of the model on the holdout data, then L2 usually gives better results.