var WritableStream = require('stream').Writable
var inherits = require('util').inherits
var iframe = require('iframe')
var Dnode = require('dnode')
var extend = require('xtend')
var meowserify = require('meowserify')
var IframeStream = require('./iframe-stream.js')

module.exports = IframeSandbox


var preambleSrc = meowserify(__dirname+'/preamble.js')
var preambleBody = '<'+'script type="text/javascript"'+'>'+preambleSrc+'<'+'/script'+'>'

function IframeSandbox(opts, cb) {
  var iframeConfig = extend(opts)
  iframeConfig.body = preambleBody
  var frame = iframe(iframeConfig)
  var iframeStream = IframeStream(frame.iframe)
  var rpc = Dnode()
  rpc.on('remote', function(iframeController) {
    prepareApiObject(iframeController, cb)
  })
  iframeStream.pipe(rpc).pipe(iframeStream)
}

function prepareApiObject(iframeController, cb) {
  var apiObject = {
    eval: iframeController.eval,
    createWriteStream: createWriteStream,
  }

  cb(null, apiObject)

  function createWriteStream() {
    return new DomWriteStream(iframeController)
  }
}

// IframeController DOM Write Stream

function DomWriteStream(iframeController){
  WritableStream.call(this)
  this.iframeController = iframeController
  this.on('finish', function(){
    iframeController.writeClose()
  })
}

inherits(DomWriteStream, WritableStream)

DomWriteStream.prototype._write = function(chunk, encoding, cb) {
  this.iframeController.write(Buffer(chunk).toString())
  cb()
}

