### 归并排序
采用分治的思想，将目标数据集分成多个小的数据集，然后将排序后的小数据集合并为一个大的数据集。  

递归实现:
```javascript
function merge_sort(arr) {
  const tarr = new Array(arr.length)
  msort(arr, tarr, 0, arr.length - 1)
}

function msort(arr, tarr, l, rEnd) {
  if (l < rEnd) {
    const m = Math.floor((rEnd - l) / 2)
    msort(arr, tarr, l, m)
    msort(arr, tarr, m+1, rEnd)

    merge(arr, tarr, l, m+1, rEnd)
  }
}

function merge(arr, tarr, l, r, rEnd) {
    let t = l, lEnd = r-1
    while(l<=lEnd && r<=rEnd) {
      if (arr[r] < arr[l]) {
        tarr[t++] = arr[r++]
      } else {
        tarr[t++] = arr[l++]
      }
    }
    while(l<=lEnd) {
      tarr[t++] = arr[l++]
    }
    while(r<=rEnd) {
      tarr[t++] = arr[r++]
    }
}
```

非递归实现: 
```javascript
function merge_sort(arr) {
  const length = arr.length
  const tarr = new Array(length)
  let k = 2
  while(k<length) {
    mergeProxy(arr, tarr, k)
  }
  for (let k=2;k<=Math.ceil(length/2);k*=2) { // k is the merge size
    
  }
}
function mergeProxy(arr, tarr, k) {
  for(let s=0;s <= arr.length-k;s+=k) {
    const end = s + k - 1, r = s + k/2
    merge(arr, tarr, s, r, end)
  }
  if (s+k/2 < arr.length) {
    merge(arr, tarr, s, s+k/2, arr.length)
  } else {
    while(s < arr.length) {
      tarr[s++] = arr[s++]
    }
  }
}

function merge(arr, tarr, l, r, rEnd) {
    let t = l, lEnd = r-1
    while(l<=lEnd && r<=rEnd) {
      if (arr[r] < arr[l]) {
        tarr[t++] = arr[r++]
      } else {
        tarr[t++] = arr[l++]
      }
    }
    while(l<=lEnd) {
      tarr[t++] = arr[l++]
    }
    while(r<=rEnd) {
      tarr[t++] = arr[r++]
    }
}
```

优点:
1. 最好和最坏的时间复杂度都是 O(nlogn)
2. 稳定

缺点:
1. 需要额外的O(n)空间
2. 需要在目标数据集和临时数据集之间来回复制数据

因此常用于外排序(本地空间不足)，而不会用于内排序


### 快排
结合课程来看，之前写的快排确实是错误的。  
快排的关键在于，不去频繁地更改 pivot 的位置，只在待排的子集内发生大小错位时才去交换相应的元素。在待排区交换结束后再去交换pivot到想去的位置。如此可以用最少的交换次数，达到尽量地减少逆序对。  

```javascript
function quick_sort(arr) {
  qsort(arr, 0, arr.length-1)
}
function qsort(arr, l, r) {
  const pivot = median(arr, l, r)
  let i = l, j = r - 1
  while(i<j) {
    while (arr[++i] < pivot) {
    }
    while(arr[--j] > pivot) {
    }
    if (i<j) {
      swap(arr, i j)
    }
  }
  swap(arr, i, pivot)

  qsort(arr, l, i - 1)
  qsort(arr, i+1, r)
}
```

为什么快排不能用非递归来实现呢？  
因为将递归拆成循环，一定是将 大数据集 -> 小数据集 (递归) 的方式转为 小数据集 -> 大数据集 (非递归)。而快排的这个思路，用小数据集其实是没有意义的。  

### 表排序
思路：
不移动元素本身，而是移动元素的指针。(指针如何移动，难道不是只能记录？)  
是否把元素的指针按照其元素的要求顺序拍成一个有序组，然后将原始数据按照指针顺序将其重新规划。  


### 物理排序
即在表排序结束后，将元素挪动到对应的位置。  
此时已经知道每个元素要挪动到的位置，因为一个有限的位置序列总是由多个独立的环构成的，所以可以分别为每个环进行物理交换。这样的好处是在环内只需要一个临时的元素空间。  
而什么时候一个换就结束了呢？我们在挪动一个元素，或者将元素挪到temp中的时候，更改表中的值为下标，当环进行到判断当前 `table[i] == i` 时，也就说明环完成了交换。  

### question
1. 为什么 简单选择排序 是不稳定的？
    1. https://blog.csdn.net/houyanjun/article/details/2446074
2. 为什么 快排 的最差时间复杂度是  O(N的平方) ? 
    1. 是的。如果每次选择后，分开的子集只是原来的集合-1，那么就会是 n的平方。
3. 快排的空间复杂度 O(logN) 其实是由于其递归的本质导致的。所以此处的常数可能是一个大常数。