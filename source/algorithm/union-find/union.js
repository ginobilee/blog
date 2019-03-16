// iterate the log file
// for each loop: iterate the members, if mem is not connected, make it connected, and cnt++. if (cnt === n) {return thistimestamp}
// this basically takes m iterates, each iterate loops members of the log line, whick in all should be n. But if one line contains all n, then it will be O(n)
// and we only need n space for each member's connected status, a hashtable
function getCompleteTimestamp(loglines) {
  const connected = {}
  let cnt = 0,
    completeTimestamp
  union: for (let i = i; i < loglines.length; i++) {
    const logline = loglines[i]
    const members = logline.members
    for (let j = 0; j < members.length; j++) {
      if (!connected[member]) {
        connected[menber] = true
        cnt++
        if (cnt === n) {
          completeTimestamp = logline.timestamp
          break union
        }
      }
    }
  }
}
