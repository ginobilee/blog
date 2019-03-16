这道题有三个关键点:
1. 意识到寻找中间点，就是将有序数组拆分为等长的两段，拆分点就是中间点。所以对于两个有序数组，寻找他们合起来的中间点就是分别将两个数组拆分成两段，左边段加起来的长度等于右边段的长度，这样能保证是中间位置；其次保证左边段的末位断点小于右边段的起始端点，则保证了数组合并的拆分点是有序数组的中间点。
2. 要将分支条件梳理清楚。如满足题意的中间点的条件实际是 `(i=0 || j=n || A[i-1]<=B[j])&&(j=0 || i=m || B[j-1]<=A[j])` // m<=n。我可以想到要保证端点值大小约束的条件，但对于边界条件如 i=0,i=m... 如何融入进去没有思考清楚。没有思考清楚的原因是也没有去真正细致地把这些条件写出来，而是一想到有这么多边界条件就嫌麻烦，想找捷径；而这里却是真正把所有问题列出来，写写画画，才能把问题看得更清楚的必须路径。即便有麻烦的边界，还是依次把其写出来，去对比思考，才更容易看清楚它的本质。
  1. 当有了上述条件，就可以找到它的反条件。把 || 和 && 想成数学上的集合的并与交，即可以推导出它的反条件: `!((i=0 || j=n || A[i-1]<=B[j])&&(j=0 || i=m || B[j-1]<=A[j])) <==> (!(i=0 || j=n || A[i-1]<=B[j]) || !(j=0 || i=m || B[j-1]<=A[j])) <==> ((!(i=0) && !(j=n) && !(A[i-1]<=B[j])) || (!(j=0) && !(i=m) && !(B[j-1]<=A[j]))) <==> ((i>0 && j<n && A[i-1]>B[j]) || (j>0 && i<m && B[j-1]>A[j]))`
  2. 注意上述推导中最后一步，取 `i=0`的非时，因为i不会小于0，所以直接为`i>0`。
  3. 至此，就可以将整个算法的分支写为: 
    1. `if(i>0 && j<n && A[i-1]>B[j])`
    2. `else if(j>0 && i<m && B[j-1]>A[j])`
    3. `else{// 找到了匹配的i,j，但i,j可能为边界值。没有关系，只要在计算中位值时注意就可以了}`
    4. 至此，算法的逻辑已经很清晰了。
3. 最后一点是，在`m<=n`的条件中，`i>0`与`j<n`是等价的。如此前述2.3.1和2.3.2中的条件都是可以简写的。具体推导就不写了。关键在于充分利用前提条件`m<=n`，而自己就忽略了这个条件。

### 代码
```
function findMedian2(nums1, nums2) {
  let shorter = nums1, longer = nums2, m = nums1.length, n = nums2.length
  if (m > n) {
    shorter = nums2
    longer = nums1
    temp = n
    n = m
    m = temp
  }
  let iMin = 0, iMax = m, halfLength = Math.floor((m + n + 1) / 2)
  while (iMin <= iMax) {
    const i = Math.floor((iMin + iMax) / 2)
    const j = halfLength - i
    if (i < iMax && longer[j - 1] > shorter[i]) {
      // i is small
      iMin = i + 1
    } else if (i > iMin && shorter[i - 1] > longer[j]) {
      // i is big
      iMax = i - 1
    } else {
      let maxLeft = 0
      if (i === 0) {
        maxLeft = longer[j - 1]
      } else if (j === 0) {
        maxLeft = shorter[i - 1]
      } else {
        maxLeft = Math.max(shorter[i - 1], longer[j - 1])
      }
      if ((m + n) % 2 === 1) return maxLeft

      let minRight = 0
      if (i === m) {
        minRight = longer[j]
      } else if (j === n) {
        minRight = shorter[i]
      } else {
        minRight = Math.min(shorter[i], longer[j])
      }
      return (maxLeft + minRight) / 2
    }
  }
  return 0
}
```

### 自己的初始思路
自己也想出了一个思路，只是代码写起来非常复杂和容易出错，且算法复杂度应该是 `O(log(m)log(n))` 的。不过自己也花了很大的心思写出来了，还是值得记录一下的。  
思路就是，在两个数组出现交叉时，寻找开始端点较大者在对方数组的插入位置: 
1. 若此位置大于所要的中间位数(它是固定的)，则中间点必在对方数组中，根据所要中位数下标即可找到
2. 若此位置等于所要的中间位数，则他就是要找的中间点，再通过比较两个数组的下一个节点大小，即可找到
3. 若此位置小于所要的中间位数，则取对方数组的(所找到的插入位置的下一个)元素为待查找元素，反过来在自己的数组中，从刚才的查找元素之后开始查找，再取比较其相对位置与中位数所需的相对位置的偏差，即进入下一个循环。

这样如果在查找时用二分查找，那么效率是 `O(log(searchlength))` 的。而进行查找的个数，因为是对方分片查找导致的，也可以认为是 `O(log(length))`。所以可以视整体复杂度为 `O(log(m)log(n))`。  
这道题自己可以把自己的思路坚持写出来，并通过测试集，击败将近 50% 的同语言算法，还是不错的。

```
var findMedianSortedArrays = function(nums1, nums2) {
  function getMedian(arr, idxOfMid) {
    const l = arr.length
    if (l % 2 === 1) {
      return arr[idxOfMid]
    } else {
      return (arr[idxOfMid] + arr[idxOfMid - 1]) / 2
    }
  }
  // if one is empty
  const arr1 = nums1,
    arr2 = nums2
  if (nums1.length === 0 || nums2.length === 0) {
    let noneEmptyArr = arr1.length === 0 ? arr2 : arr1
    const l = noneEmptyArr.length
    const idx1 = Math.floor(l / 2)
    return getMedian(noneEmptyArr, idx1)
  }
  // if one's end is little than another's start
  const l = arr1.length + arr2.length
  const arr1LittleThanArr2 = !(arr1[arr1.length - 1] > arr2[0])
  const arr2LittleThanArr1 = !(arr2[arr2.length - 1] > arr1[0])
  if (arr1LittleThanArr2 || arr2LittleThanArr1) {
    const littleOne = arr1LittleThanArr2 ? arr1 : arr2,
      biggerOne = arr1LittleThanArr2 ? arr2 : arr1
    const idx1 = Math.floor(l / 2)
    if (l % 2 === 1) {
      if (idx1 < littleOne.length) {
        return littleOne[idx1]
      } else {
        return biggerOne[idx1 - littleOne.length]
      }
    } else {
      const m1 = idx1 < littleOne.length ? littleOne[idx1] : biggerOne[idx1 - littleOne.length]
      const idx2 = idx1 - 1
      const m2 = idx2 < littleOne.length ? littleOne[idx2] : biggerOne[idx2 - littleOne.length]
      return (m1 + m2) / 2
    }
  }
  // has inter items
  // prepare for first lookup
  let target = arr1[0] < arr2[0] ? arr1 : arr2,
    another = arr1[0] < arr2[0] ? arr2 : arr1
  // idxLE: indexOfLookupElement, ssIdx: searchStartIndex, idxTBS: idxToBeSearched
  let idxLE = 0,
    e = another[idxLE],
    ssIdx = 0,
    idxTBS = Math.floor(l / 2)
  if (l % 2 === 0) {
    idxTBS -= 1
  }
  while (true) {
    // iPos: interplationPosition, the biggest position 'e' can be interplated in target
    let iPos = findLastPos(target, ssIdx, target.length - 1, e)
    // relL: relative length
    const relL = iPos - ssIdx
    if (relL > idxTBS) {
      const m1 = target[ssIdx + idxTBS]
      if (l % 2 === 1) {
        return m1
      } else {
        const m2 = target.length > ssIdx + idxTBS + 1 ? (target[ssIdx + idxTBS + 1] > e ? e : target[ssIdx + idxTBS + 1]) : e
        return (m1 + m2) / 2
      }
    } else if (relL === idxTBS) {
      if (l % 2 === 1) {
        return e
      } else {
        idx2 = another[idxLE + 1]
        const m2 = target.length > ssIdx + idxTBS ? (target[ssIdx + idxTBS] > idx2 ? idx2 : target[ssIdx + idxTBS]) : idx2
        return (e + m2) / 2
      }
    } else {
      // // 'another' has no elements need to search any more
      if (idxLE === another.length - 1) {
        const idx1 = idxTBS + ssIdx - 1
        if (l % 2 === 1) {
          return target[idx1]
        } else {
          return (target[idx1] + target[idx1 + 1]) / 2
        }
      } else if (iPos === target.length) {
        // 'target' has no more elements to search
        const idx1 = idxLE + relL
        if (l % 2 === 1) {
          return another[idx1]
        } else {
          return (another[idx1] + another[idx1 + 1]) / 2
        }
      } else {
        ssIdx = idxLE + 1
        idxTBS = idxTBS - relL - 1
        idxLE = iPos
        // switch target and another
        const temp = target
        target = another
        another = temp
        e = another[idxLE]
      }
    }
  }
  console.log("error")
  function findLastPos(arr, start, end, item) {
    const mid = Math.floor((end + start) / 2)
    if (start >= arr.length) {
      return arr.length - 1
    }
    if (start > end) {
      return start
    }
    if (arr[mid] < item) {
      start = mid + 1
      if (start >= arr.length) {
        return start
      }
      return findLastPos(arr, start, end, item)
    } else if (arr[mid] === item) {
      let cur = mid
      while (arr[++cur] === item) {}
      return cur
    } else {
      end = mid - 1
      if (end < 0) {
        return 0
      }
      return findLastPos(arr, start, end, item)
    }
  }
}
```