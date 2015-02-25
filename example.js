var IframeSandbox = require('./index.js')

sandbox = IframeSandbox()

sandbox.start(function(){

  console.log('ready')

  sandbox.setHTML('<h3>Hello World', function(err, result){
    console.log('html:',result)
  })

  sandbox.eval('1+2', function(err, result){
    console.log('eval:',result)
  })

})