const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const trash = require('trash')

module.exports = {
  testMu, setupTest, cleanupTest, removeFile, addFiles, newline, modFile, rename, verify
}

function testMu(){
  // whack all references in require cache
  for (const req of Object.keys(require.cache)) {
    if(!(/node_modules/.test(req))){
      delete require.cache[req]
    }
  }
  const mu = require('../mu')
  return mu.apply(null, arguments)
}

function setupTest(){
  const cwd = process.cwd()
  const cwdTemp = path.join(cwd, 'test', 'temp')
  fs.emptyDirSync(cwdTemp)
  process.chdir(cwdTemp)
}

function cleanupTest(){
  const muOps = require('../src/modules/muOps')
  const remote = muOps.path()

  const MU = {
    local: '.mu',
    remote: 'Mu Repositories',
  }

  const remoteDir = path.parse(remote).dir

  if(remoteDir.indexOf(MU.local) === -1 && remoteDir.indexOf(MU.remote) >= 0){
    fs.emptyDirSync(remote)
    trash(remote).then(() => {
      console.info(chalk.cyan('cleaning up...'))
      console.info(chalk.yellow(remote, 'moved to trash'))
    })
  }
}

function insert(string, index, substr){
  return string.slice(0, index) + substr + string.slice(index)
}

function randomAscii(validIndices, numOfChars){
  const getValidIndex = () => validIndices[~~(validIndices.length * Math.random())]
  return String.fromCharCode.apply(undefined, Array(numOfChars).fill(0).map(getValidIndex))
}

function newline(){
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
}

function verify(fpathMap){
  Object.keys(fpathMap).forEach(f => {
    const oldData = fpathMap[f]
    const newData = fs.readFileSync(f)
    let isEq = oldData.equals(newData) ? chalk.green('Yes!') : chalk.red('No')
    console.log(`old == new (${f})`, isEq)
  })
}

function rename(fpath){
  let fp = path.parse(fpath)
  const fpNew = path.join(fp.dir, makeWord(5) + fp.ext)
  fs.renameSync(fpath, fpNew)
  console.info(chalk.white(`=\t${fpath} > ${fpNew}`))
}

function makeWord(){
  return randomAscii(range(97, 122), ~~(3+Math.random()*3))
}

function range(lo, hi){
  return Array(hi - lo).fill(0).map((_, i) => i + lo)
}

function safeInds(newLineFreq=0.1){
  const nls = Array(~~(newLineFreq * (127-32))).fill(10)
  return range(32, 127).concat(nls)
}

function allInds(){
  return range(0, 256)
}

function coinFlip(){
  return (+new Date()) % 2
}

function addRandomFile(depth=1){
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord)) + '.txt'
  const inds = coinFlip() ? allInds() : safeInds()
  let data = randomAscii(inds, ~~(Math.random() * 1000))
  fs.outputFileSync(fpath, data)
  data = fs.readFileSync(fpath)
  console.info(chalk.yellow(`+\t${fpath}`))
  return [fpath, data]
}

function modFile(fpath){
  const inds = coinFlip ? allInds() : safeInds()
  const data = randomAscii(inds,~~(Math.random() * 1000))
  fs.outputFileSync(fpath, data)
  console.info(chalk.cyan(`%\t${fpath}`))
}

function removeFile(fpath){
  fs.removeSync(fpath)
  console.info(chalk.red(`x\t${fpath}`))
}

function addFiles(num){
  let fpaths = {}
  for(let i=0; i<num; i++){
    let [fpath, data] = addRandomFile(~~(Math.random() * 5))
    fpaths[fpath] = data
  }
  return fpaths
}
