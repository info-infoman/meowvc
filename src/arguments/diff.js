const fs = require('fs-extra')
const chalk = require('chalk')

const fileOps = require('../modules/fileOps')
const isUtf8 = require('is-utf8')
const core = require('../core')()

/*********
*  DIFF  *
*********/

module.exports = function diff(i, args) {
  const file = regex = args[i + 1]

  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const f1 = fs.readFileSync(file)
    if(isUtf8(f1)){
      const f2 = fileOps.getFileMostRecentSave(file) || ''
      const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
      console.info(diffString)
    }else{
      console.warn(chalk.yellow('Halting: It\'s a bad idea to diff binary files'))
    }
  }else if (regex) {
    const pattern = new RegExp(regex.trim())

    const handle = diff => {


      const diffIt = dat => {
        console.info(`file ${dat.fp}`)
        const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
      }

      const newline = () => {
        console.log(chalk.yellow('~'.repeat(30)))
      }

      let data, diffString
      while(data = diff.modified.pop()) {
        console.info(chalk.cyan(chalk.inverse(data.fp, '▶ ')))
        const f1 = fs.readFileSync(data.fp)
        const f2 = fileOps.retrieveData(data)
        const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
        console.info(diffString)
        newline()
      }
      while(data = diff.added.pop()) {
        console.info(chalk.yellow(chalk.inverse(data.fp, '▶ ')))
        const f1 = fs.readFileSync(data.fp)
        const f2 = ''
        const diffString = fileOps.fdiff(f1.toString('utf8'), f2)
        console.info(diffString)
        newline()
      }
      while(data = diff.deleted.pop()) {
        console.info(chalk.red(chalk.inverse(data.fp, '▶ ')))
        const f1 = '', f2 = fileOps.retrieveData(data)
        const diffString = fileOps.fdiff(f1, f2.toString('utf8'))
        console.info(diffString)
        newline()
      }
    }

    core.difference(null, null, handle, pattern)
  } else {
    console.warn(chalk.red('diff expects a filename or pattern, e.g.') + chalk.inverse('$ mu diff path/to/file.txt'))
  }
}
