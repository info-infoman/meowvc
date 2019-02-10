const chalk = require('chalk')

module.exports = async function mu(a,b) {
  const gl = require('./src/constant')
  const loader = require('./src/utils/loader')
  const commands = loader.require('arguments')
  const muOps = require('./src/modules/muOps')
  const pointerOps = require('./src/modules/pointerOps')
  const {print, quiet} = require('./src/utils/print')

    const command = commands[a]
    if (typeof command === 'function') {
      await muOps.update()
      if (a === 'start') {
        return command(b)
      }
      if(muOps.isPath){
        await pointerOps.init()
        return command(b)
      }
      print(chalk.yellow(`Warning: ${process.cwd()} is not a mu repo root`))
      return gl.exit.cannotExe
    }
  print(gl.help)
  return gl.exit.notFound
}