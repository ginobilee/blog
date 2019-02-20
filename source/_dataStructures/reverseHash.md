花了可能有两个小时做了一道恢复哈希前数据的题目。

题目是这样的: 
```
Given a hash table of size N, we can define a hash function . Suppose that the linear probing is used to solve collisions, we can easily obtain the status of the hash table with a given sequence of input numbers.

However, now you are asked to solve the reversed problem: reconstruct the input sequence from the given status of the hash table. Whenever there are multiple choices, the smallest number is always taken.

Input Specification:
Each input file contains one test case. For each test case, the first line contains a positive integer NN (≤1000), which is the size of the hash table. The next line contains NN integers, separated by a space. A negative integer represents an empty cell in the hash table. It is guaranteed that all the non-negative integers are distinct in the table.

Output Specification:
For each test case, print a line that contains the input sequence, with the numbers separated by a space. Notice that there must be no extra space at the end of each line.

Sample Input:
11
33 1 13 12 34 38 27 22 32 -1 21
Sample Output:
1 13 12 21 33 34 38 27 22 32
```

即，根据线性hash后的数据集判断初始数据集，且当有多个选择时总是选择最小的那个。

题目中默认设置hash函数就是 `hash(k) = k mod N` 了。根据线性探测，其实不难发现这是一个拓扑树的问题。

我将每个元素的当前位置与其无冲突位置相比，在此偏差内的元素都是其依赖元素。所以元素总是应该在其依赖之后。

让我花了很多时间的是 `总是选择最小的` 这个条件。我画出树之后，开始从树的末端向前放置元素。放置时，总是选择在其依赖元素之前的尽可能靠前的位置。这样的结果总是与样例的结果不符合。仔细分析后，发现从后向前排，就会遇到条件 `总是选择最小的` 模糊情况，如遇到 `38, 27` 和 `33, 34` 两组数没有依赖关系，应该将前者放在前面还是后者么？要以 `27` 放在最小作为条件成立还是 `33, 34` 放在前面作为满足条件？

再去审查题目，发现题目的意思是，从前往后判断输入数据集，如果当前位有多个选择，总是选择最小的那个。那么这样就是一个确定的描述了。这样，思路就应该是从第0位开始选择可能的值，然后总是选择没有依赖的最小元素。 

结果: 
```javascript
function backSorted(arr) {
  return arr.filter(a => a >= 0).sort((a, b) => b - a)
}
function saveDep(dep, arr, i, j) {
  if ((d = dep[arr[i]])) {
    d.push(arr[j])
  } else {
    dep[arr[i]] = [arr[j]]
  }
}
function mod(i, N) {
  if (N === 0) {
    return i
  }
  while (i >= N) {
    i -= N
  }
  while (i < 0) {
    i += N
  }
  return i
}
function reverseHash(arr) {
  const N = arr.length
  // 1. sort the nums from max to min, save into another array: sorted
  const sorted = backSorted(arr)

  // 2. calculate the dependancy of each element according to arr, save as dep[ele] = [...]
  const dep = {}
  for (let i = 0; i < N; i++) {
    if (arr[i] < 0) {
      continue
    }
    const d = mod(i - mod(arr[i], N), N)
    for (let j = d; j > 0; j--) {
      saveDep(dep, arr, i, mod(i - j, N))
    }
  }

  // 3. save visit state of each element in visited[e]
  const visited = {}

  // 4. iterate array 'sorted', put the least ele of no dependancy or all-dependancy-visited into result
  let t = 0
  const result = []
  while (sorted.length) {
    let l = sorted.length,
      c = l - 1
    // find the least of non-dependancy or all-dependancy-visited
    while (c >= 0) {
      if (!dep[sorted[c]] || dep[sorted[c]].length === 0) {
        break
      } else {
        let allDepVisited = true
        const ele = sorted[c]
        for (let k = 0; k < dep[ele].length; k++) {
          if (!visited[dep[ele][k]]) {
            allDepVisited = false
            break
          }
        }
        if (allDepVisited) {
          break
        }
      }
      c--
    }
    // c should always be little than l
    const ele = sorted[c]
    sorted.splice(c, 1)
    visited[ele] = true
    result.push(ele)
  }
  return result
}

const log = console.log
log(reverseHash([33, 1, 13, 12, 34, 38, 27, 22, 32, -1, 21]))
log(reverseHash([-1, -1, 13442, 17453, 25364, 10545, 27094, 17117, 17228, 13133]))

```

写得过程中还是遇到了一些之前没有注意到的地方，比如:
1. -5 % 3 === -2。所以不能直接以 % 作为取模操作。