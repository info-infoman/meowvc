'use strict'

/*
 * MAIN
 */

const chalk = require('chalk')

module.exports = async function mu(args) {
  const gl = require('./src/constant')
  const loader = require('./src/utils/loader')
  const commands = loader.require('arguments')
  const muOps = require('./src/modules/muOps')
  const pointerOps = require('./src/modules/pointerOps')
  const {print, quiet} = require('./src/utils/print')

  if(args.includes('--quiet')){
    quiet()
  }

  for (let [index, param] of args.entries()) {
    const command = commands[param]
    if (typeof command === 'function') {
      await muOps.update()
      if (param === 'start') {
        return command(index, args)
      }
      if(muOps.isPath){
        await pointerOps.init()
        return command(index, args)
      }
      print(chalk.yellow(`Warning: ${process.cwd()} is not a mu repo root`))
      return gl.exit.cannotExe
    }
  }
  print(gl.help)
  return gl.exit.notFound
}
