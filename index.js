var WritableStream = require('stream').Writable
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var extend = require('xtend')
var iframe = require('iframe')
var Dnode = require('dnode')
var meowserify = require('meowserify')
var IframeStream = require('./iframe-stream.js')
var fifoTransform = require('fifo-transform')

module.exports = IframeSandbox


var preambleSrc = meowserify(__dirname+'/preamble.js')
var preambleBody = '<'+'script type="text/javascript"'+'>'+preambleSrc+'<'+'/script'+'>'

function IframeSandbox(opts, cb) {
  var iframeConfig = extend(opts)
  iframeConfig.body = preambleBody
  var frame = iframe(iframeConfig)
  var iframeStream = IframeStream(frame.iframe)
  var rpc = Dnode({
    sendMessage: sendMessage,
  })
  var remoteApiObjects = []
  rpc.on('remote', function(iframeController) {
    var apiObject = prepareRemoteApiObject(iframeController, cb)
    remoteApiObjects.push(apiObject)
  })
  
  iframeStream
    .pipe(new fifoTransform.unwrap())
    .pipe(rpc)
    .pipe(new fifoTransform.wrap())
    .pipe(iframeStream)

  return rpc

  // emit message on apiObject
  // there shouldn't actually be more than one
  function sendMessage() {
    var args = Array.prototype.slice.call(arguments)
    args.unshift('message')
    remoteApiObjects.forEach(function(apiObject){
      apiObject.emit.apply(apiObject, args)
    })
  }
}

function prepareRemoteApiObject(iframeController, cb) {
  var apiObject = new RemoteApiObject(iframeController)
  cb(null, apiObject)
  return apiObject
}

// IframeController API Wrapper

inherits(RemoteApiObject, EventEmitter)

function RemoteApiObject(iframeController) {

  this.createWriteStream = createWriteStream
  this.eval = iframeController.eval

  function createWriteStream() {
    return new DomWriteStream(iframeController)
  }

}

// IframeController DOM Write Stream

inherits(DomWriteStream, WritableStream)

function DomWriteStream(iframeController){
  WritableStream.call(this)
  this.iframeController = iframeController
  this.on('finish', function(){
    iframeController.writeClose()
  })
}

DomWriteStream.prototype._write = function(chunk, encoding, cb) {
  this.iframeController.write(Buffer(chunk).toString())
  cb()
}

