var DuplexStream = require('stream').Duplex
var inherits = require('util').inherits

/*

  IframeStream starts corked until it gets a message from the iframe
  ParentStream starts uncorked

*/

module.exports = function(iframe) {
  return new IframeStream(iframe)
}

function IframeStream(iframe) {
  DuplexStream.call(this)
  this.iframe = iframe
  this._setupListener()
  this._initialize()
}

inherits(IframeStream, DuplexStream)

IframeStream.prototype._initialize = function(e) {
  this.targetWindow = this.iframe.contentWindow
  this.ready = false
  this.cork()
}

IframeStream.prototype._setupListener = function(e) {
  window.addEventListener('message', this._iframeMessage.bind(this), false)
}

IframeStream.prototype._iframeMessage = function(event) {
  // only process messages from the iframe
  if (!event.source === this.targetWindow) return
  // uncork if not ready
  if (!this.ready) {
    this.ready = true
    this.uncork()
  }
  // take in data
  var buffer = new Buffer(event.data)
  this.push(buffer.toString())
}

IframeStream.prototype._write = function(chunk, encoding, cb) {
  console.log('stream write: ',Buffer(chunk).toString())
  this.targetWindow.postMessage(Buffer(chunk).toString(), '*')
  cb()
}

IframeStream.prototype._read = noop

//
// Parent Stream
//

module.exports.ParentStream = function(){
  return new ParentStream()
}

function ParentStream() {
  IframeStream.call(this, {})
}

inherits(ParentStream, IframeStream)

ParentStream.prototype._initialize = function(){
  this.targetWindow = frames.parent
  this.ready = true
}

// util

function noop(){}

