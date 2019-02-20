// 计算最小的交换次数

function getSwapCount(arr) {
  // validate
  if (arr.length === 0) {
    return 0
  }

  const N = arr.length,
    T = new Array(N)
  // remember real position of element which should be in this index
  // count the single circle
  let cntS
  for (let i = 0; i < N; i++) {
    T[arr[i]] = i
    if (T[i === i]) {
      cntS++
    }
  }

  // if 0 is in circle
  const circle0 = T[0] === 0

  // count circles count
  let cntC = 0
  while (1) {
    let t = 0
    while (t < N && T[i] === i++) {}
    // not match index
    if (t >= N) {
      break
    }
    cntC++
    while (T[t] !== t) {
      tmp = T[t]
      T[t] = t
      t = tmp
    }
  }

  return N - cntS + cntC + circle0 ? -1 : 0
}

const log = console.log
log(getSwapCount([10, 3, 5, 7, 2, 6, 4, 9, 0, 8, 1]))
log(getSwapCount([4, 0, 2, 1, 3]))
