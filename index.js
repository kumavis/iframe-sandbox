var WritableStream = require('stream').Writable
var inherits = require('util').inherits
var iframe = require('iframe')
var Dnode = require('dnode')
var preamble = require('./preamble.js')
var stringify = require('./module-stringify.js')
var IframeStream = require('./iframe-stream.js')

module.exports = IframeSandbox


function IframeSandbox(opts, cb) {
  var preambleSrc = stringify(preamble)
  var preambleBody = '<'+'script type="text/javascript"'+'>'+preambleSrc+'<'+'/script'+'>'
  var frame = iframe({ body: preambleBody, container: opts.container })
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

