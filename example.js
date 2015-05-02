var IframeSandbox = require('./index.js')

IframeSandbox({
  container: document.body,
  // optionally use bootstrapped iframe
  //src: 'http://frame.vapor.to/',
}, function(err, sandbox){

  console.log('ready')

  sandbox.eval('window.rofl = 64', function(err, result){
    sandbox.eval('window.rofl', function(err, result){
      console.log('eval:',result)

      var ws = sandbox.createWriteStream()

      // scripts
      ws.write('<'+'script>console.log("iframe.log:",window.rofl)</script'+'>')

      // styles
      ws.write('<'+'style >pre { color: blue }</style>')
      ws.write('<'+'style >b { color: red }</style>')

      // standard dom
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