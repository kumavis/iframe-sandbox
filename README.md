### Iframe Sandbox

Don't assume this is a perfect sandbox.
Infinite loops will crash the main page.

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

### methods

###### eval

Evals js in the sandbox's context.
Calls the callback with the error (as a string) or the result.

```js
sandbox.eval( jsString, function(err, result){ /* ... */ } )
```

###### createWriteStream

Creates a WriteStream that writes to the document via `document.write`.

```js
var ws = sandbox.createWriteStream()

ws.write('<pre>')
ws.write('talk like a robot')
ws.write('</pre>')
ws.write('<b>')
ws.write('string like a trie')
ws.write('</b>')
ws.end()
```