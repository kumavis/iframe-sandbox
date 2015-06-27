var test = require('tape')
var IframeSandbox = require('../index.js')

test('basic tests', function(t){
  t.plan(2)

  IframeSandbox({
    container: document.body,
  }, function(err, sandbox){

    sandbox.eval('window.testValue = 42', function(err, result){
      sandbox.eval('window.testValue', function(err, result){
        t.equal(result, 42)

        var ws = sandbox.createWriteStream()
        ws.write('<'+'script>window.testValue = 18</script'+'>')
        ws.end()

        sandbox.eval('window.testValue', function(err, result){
          t.equal(result, 18)
        })

      })
    })

  })

})