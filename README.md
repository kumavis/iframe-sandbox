### Iframe Sandbox

Don't assume this is a perfect sandbox.
Infinite loops will crash the main page.
See [this thread](http://stackoverflow.com/questions/11510483/will-a-browser-give-an-iframe-a-separate-thread-for-javascript).

### usage

```js
var IframeSandbox = require('iframe-sandbox')

IframeSandbox({ container: document.body }, function(err, sandbox){

  console.log('ready')

  sandbox.eval('1+2', function(err, result){
    console.log('eval:',result)
  })

})
```

### config

All config options are passed to [`iframe`](https://github.com/npm-dom/iframe).
See here for [`iframe` config options](https://github.com/npm-dom/iframe#options).

```js
var opts = {
  container: document.body,  
  src: urlOfBootstrappedIframe,  
}

IframeSandbox(opts, cb)
```

###### Bootstrapped iframe

To use a hosted, bootstrapped iframe, specify the url as the `src` config option.
See [here](https://github.com/kumavis/iframe-sandbox-bootstrap) for more about using a bootstrapped iframe.


### methods

###### eval

Evals js in the sandbox's context.
Calls the callback with the error (as a string) or the result.

```js
sandbox.eval( jsString, function(err, result){ /* ... */ } )
```

###### createWriteStream

Creates a WriteStream that writes to the document via `document.write`.
Note: scripts written to the DOM wont be run until 'document.close()' is called,
triggered by the end of the stream.

```js
var ws = sandbox.createWriteStream()
somewhereAwesome.pipe(ws)
```

###### 'message' event

Inside the sandbox context there is an extra exposed global `sandboxMessage` that will re-materialize objects in the main context and handle cross-context callbacks via [dnode](https://github.com/substack/dnode).
Listen to the 'message' event in the main context to receive the messages

```js
sandbox.on('message', function(arg1, arg2, ...){
  console.log(arguments)
})

sandbox.eval('sandboxMessage("hello", "world")')
```

### notes

Writing external script tags to the document does not seem to work.
The following will not load `bundle.js`.
```js
var ws = sandbox.createWriteStream()
ws.write('<script src="bundle.js"></script>')
ws.end()
```
