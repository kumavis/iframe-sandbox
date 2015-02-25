var Iframe = require('iframe')
var Uuid = require('hat')

module.exports = IframeSandbox


const __sandbox_init__ = '__initialize__'

function IframeSandbox(opts) {
  if (!(this instanceof IframeSandbox)) return new IframeSandbox(opts)
  this._initialize(opts)
}

proto = IframeSandbox.prototype

proto._initialize = function(opts){
  opts = opts || {}
  this.container = opts.container || document.body
  this.origin = opts.origin || location.origin
  this.payload = new String()
    + '<script type="text/javascript" src="data:text/javascript;charset=UTF-8,'
    + encodeURIComponent('setTimeout(function(){\n;' + this._generateInitiationSource() + '\n;}, 0)')
    + '"></script>'
  this.iframe = null
  this._listeners = {}
  window.addEventListener('message', this._listenForResponse.bind(this), false)
}

proto.start = function(callback){
  callback = callback || noop
  this.iframe = Iframe({ container: this.container, body: this.payload })
  this.iframeElement = this.iframe.iframe
  this._listeners[__sandbox_init__] = function() {
    callback(null)
  }
}

proto.eval = function(code, callback){
  callback = callback || noop
  this.sendMessage({ type: 'eval', data: code }, callback)
}

proto.sendMessage = function(message, callback){
  var uuid = message.uuid = message.uuid || Uuid()
  this._listeners[uuid] = callback
  this.iframeElement.contentWindow.postMessage(message, '*')
}

proto.setHTML = function(htmlString, callback){
  callback = callback || noop
  var code = 'document.body.innerHTML = decodeURIComponent("'+encodeURIComponent(htmlString)+'"); document.body.innerHTML'
  this.eval(code, callback)
}

proto._listenForResponse = function(event){
  var message = event.data
  var uuid = message && message.uuid
  if (!uuid) return
  var handler = this._listeners[uuid]
  if (!handler) return
  handler.apply(null, message.data)
  delete this._listeners[uuid]
}

proto._generateInitiationSource = function(){
  var parentOrigin = this.origin
  return [
    ';(function init(window, frames, console){',
    '  window.addEventListener("message", respondToMessage, false);',
    '  function respondToMessage(event) {',
    '    var original = event.data',
    '    // abort if other origin',
    '    if (event.origin !== "'+parentOrigin+'") {',
    '      console.log("Incomming message rejected by sandbox");',
    '      return;',
    '    }',
    '    // eval message',
    '    try {',
    '      var result = globalEval(original.data);',
    '      reply(original, [null, result]);',
    '    } catch (error) {',
    '      reply(original,[error.toString()]);',
    '    }',
    '  }',
    '  function reply(original, data) {',
    '    var message = {uuid: original.uuid, data: data};',
    '    // send message back',
    '    frames.parent.postMessage(message, "'+parentOrigin+'");',
    '  }',
    '  function globalEval(code) {',
    '    // eval with global context',
    '    return (0,eval)(code);',
    '  }',
    '  reply({uuid: "'+__sandbox_init__+'"})',
    '})(window, frames, console);',
  ].join('\n')
}

//
// util
//

function noop() { }
