// 只用一个字节来存储变量，输出 '将' 与 '帅' 的所有位置，见书 p13 。
/**
 * 因为可能的位置一共只有 9 * 6 = 54 个，所以一个字节足够了。问题是如何存放这个位置
 * 一定需要将每个棋子在棋盘上的位置表示在这个字节里。
 * 一开始的思路是 将 有9个位置，相对的 帅 每次有6个位置。如果用4个位来存 将 的位置，另外用 3 个位来存 帅 的位置。这样就需要将将的位置与4个位做一个映射，同时根据将的位置确定帅的3个位所代表的位置。这样太麻烦了。
 * 转换思路，分别用字节里的位来表示每个子的棋盘位置。将的位置可以用行和列来确定，帅也一样。而行/列都是只有3个选择，那么用2个位就足以分辨。那么我用4个位来存将的位置，2个是行，2个是列，如此将的所有位置都可以表示了，且通过位的值去反推实际行、列的标识符是很容易的。帅也一样。这样去控制循环也很方便。
 */
const num2char = {
  0: "d",
  1: "e",
  2: "f"
}
function showChessPositions() {
  let result = 0 // 实际上应该用更底层的语言写，才能控制到一个字节，比如 byte result = 0
  while ((result & 192) >> 6 < 3) {
    // 11000000b = 192, 取出最高两位，控制不超过 11
    while ((result & 48) >> 4 < 3) {
      while ((result & 12) >> 2 < 3) {
        if ((result & 12) >> 2 === (result & 192) >> 6) {
          continue
        } else {
          while ((result & 3) < 3) {
            console.log(`将: ${num2char[(result & 192) >> 6]}${8 + ((result & 48) >> 4)}, 帅: ${num2char[(result & 12) >> 2]}${1 + (result & 3)}`)
          }
        }
      }
    }
  }
}
