var ParentStream = require('./iframe-stream.js').ParentStream
var Dnode = require('dnode')

module.exports = IframePreamble


function IframePreamble(){

  var parentStream = ParentStream()
  var rpc = Dnode({
    eval: evalGlobal,
    write: write,
    writeClose: writeClose,
  })
  parentStream.pipe(rpc).pipe(parentStream)

  var docIsOpen = false

  function write(src, cb) {
    if (!docIsOpen) {
      document.open()
      docIsOpen = true
      // reset the listener after opening the dom
      parentStream._setupListener()
    }
    document.write(src)
var head = document.head
var script = document.createElement("script")
script.src = 'poop.js'
head.appendChild(script)
    if (cb) cb()
  }

  function writeClose(src, cb) {
    docIsOpen = false
    document.close()
var head = document.head
var script = document.createElement("script")
script.src = 'skat.js'
head.appendChild(script)
    if (cb) cb()
  }

}

function evalGlobal(src, cb) {
  try {
    // eval with global context
    var result = (0,eval)(src)
    cb(null, result)
  } catch (err) {
    cb(err)
  }
}

function noop(){}