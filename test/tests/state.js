const test = require('ava')

const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'state'
const flags = []
helper.verboseLogging(false)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.print(chalk.inverse('MU STATE'))
  let stateObj = await tester.mu(['state'])
  let state = helper.parseStateObject(stateObj)

  let added = state.added.sort()
  t.deepEqual(added, ['_muignore'])

  let modified = state.modified
  let deleted = state.deleted
  t.deepEqual(modified, [])
  t.deepEqual(deleted, [])

  await tester.muSave()

  helper.newline()
  helper.print(chalk.inverse('ADD FILES'))
  const save1 = await helper.addFiles(4)
  const files1 = Object.keys(save1).sort()

  const removeThese = files1.slice(0,2).sort() // first 2
  const modifyThese = files1.slice(2).sort() // last 2
  const renameThese = modifyThese.slice()

  helper.print(chalk.inverse('MU STATE'))
  stateObj = await tester.mu(['state'])
  state = helper.parseStateObject(stateObj)

  added = state.added.sort()
  t.deepEqual(added, files1)

  modified = state.modified
  deleted = state.deleted
  t.deepEqual(modified, [])
  t.deepEqual(deleted, [])

  helper.print(chalk.inverse('MU SAVE'))
  await tester.muSave()

  helper.newline()

  helper.print(chalk.inverse('DEL 2 FILES'))
  await helper.removeFiles(removeThese)

  helper.print(chalk.inverse('MU STATE'))
  stateObj = await tester.mu(['state'])
  state = helper.parseStateObject(stateObj)

  deleted = state.deleted.sort()
  t.deepEqual(deleted, removeThese)

  added = state.added
  modified = state.modified
  t.deepEqual(added, [])
  t.deepEqual(modified, [])

  helper.print(chalk.inverse('MU SAVE'))
  await tester.muSave()

  helper.newline()

  helper.print(chalk.inverse('MOD 2 FILES'))
  await helper.modFiles(modifyThese)

  helper.print(chalk.inverse('MU STATE'))
  stateObj = await tester.mu(['state'])
  state = helper.parseStateObject(stateObj)

  modified = state.modified.sort()
  t.deepEqual(modified, modifyThese)

  added = state.added
  deleted = state.added
  t.deepEqual(added, [])
  t.deepEqual(deleted, [])

  helper.print(chalk.inverse('MU SAVE'))
  await tester.muSave()

  helper.newline()

  helper.print(chalk.inverse('RENAME 2 FILES'))
  const files2 = (await helper.renameFiles(renameThese)).sort()

  helper.print(chalk.inverse('MU STATE'))
  stateObj = await tester.mu(['state'])
  state = helper.parseStateObject(stateObj)

  deleted = state.deleted.sort()
  t.deepEqual(deleted, renameThese)

  added = state.added.sort()
  t.deepEqual(added, files2)

  modified = state.modified
  t.deepEqual(modified, [])

  helper.print(chalk.inverse('MU SAVE'))
  await tester.muSave()

  helper.print(chalk.inverse('MU HISTORY'))
  let history = await tester.mu(['history'])
  t.is(history.length, 1 + 4)

  helper.print(chalk.inverse('MU HISTORY 2'))
  history = await tester.mu(['history','2'])
  t.is(history.length, 2)

  await tester.cleanupTest(flags, name)
})
