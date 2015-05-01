var ParentStream = require('./iframe-stream.js').ParentStream
var Dnode = require('dnode')
var fifoTransform = require('fifo-transform')

var parentStream = ParentStream()
var rpc = Dnode({
  eval: evalGlobal,
  write: write,
  writeClose: writeClose,
})

parentStream
  .pipe(new fifoTransform.wrap())
  .pipe(rpc)
  .pipe(new fifoTransform.unwrap())
  .pipe(parentStream)

rpc.on('remote', function(parentController){
  global.sandboxMessage = parentController.sendMessage.bind(parentController)
})

var docIsOpen = false

function write(src, cb) {
  if (!docIsOpen) {
    document.open()
    docIsOpen = true
    // reset the listener after opening the dom
    parentStream._setupListener()
  }
  document.write(src)
  if (cb) cb()
}

function writeClose(src, cb) {
  docIsOpen = false
  document.close()
  if (cb) cb()
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