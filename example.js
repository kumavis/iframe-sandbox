var IframeSandbox = require('./index.js')

IframeSandbox({container: document.body}, function(err, sandbox){

  console.log('ready')

  sandbox.eval('window.rofl = 64', function(err, result){
    sandbox.eval('window.rofl', function(err, result){
      console.log('eval:',result)

      var ws = sandbox.createWriteStream()

      // internal and external scripts
      ws.write('<'+'script>console.log("iframe.log:",window.rofl)</script'+'>')
      ws.write('<'+'script src="example2.js"></script'+'>')

      // internal and external styles
      ws.write('<'+'style >pre { color: blue }</style>')
      ws.write('<'+'link href="example3.css">')

      ws.write('<pre>')
      ws.write('talk like a robot')
      ws.write('</pre>')
      ws.write('<b>')
      ws.write('string like a trie')
      ws.write('</b>')
      ws.end()

      sandbox.eval('1+2', function(err, result){
        console.log('eval:',result)
      })

    })
  })

})