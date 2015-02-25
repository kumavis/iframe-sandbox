### Iframe Sandbox

Don't assume this is a perfect sandbox.
Infinite loops will crash the main page.

### usage

```js
sandbox = IframeSandbox(opts)
sandbox.start(function(){
  console.log('ready')
  sandbox.setHTML('<h3>Hello World</h3>', optionalCallback)
  sandbox.eval('1+2', optionalCallback)
})
```

### methods

###### start

Starts the sandbox.
Calls the callback when initialized.

```js
sandbox.start( function(err){ /* ... */ } )
```

###### eval

Evals js in the sandbox's context.
Calls the callback with the error (as a string) or the result.

```js
sandbox.eval( jsString, function(err, result){ /* ... */ } )
```

###### setHTML

Sets the innerHTML of the document body.
Calls the callback when complete with the error or the resulting `document.body.innerHTML`.

```js
sandbox.setHTML( htmlString, function(err, result){ /* ... */ } )
```