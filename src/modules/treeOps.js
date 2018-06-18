/**
 *  TREE OPERATIONS
 */

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const eol = require('os').EOL

const po = require('./pointerOps')
const muOps = require('./muOps')
const rget = require('../utils/rget')
const {
  print
} = require('../utils/print')
const gl = require('../constant')

module.exports = {
  treeify,
  getHashByInode,
  setHashByInode,
  setTreeData,
  getOnFileData,
  getSavedData
}

async function _ignore() {
  const defaultPattern = '^\\.mu$|^\\.muid$' //we absolutely do not want to track the .mu repo if it's local
  if (await fs.pathExists(muOps.ignorePath)) {
    const ignorePatternList = (await fs.readFile(muOps.ignorePath, 'utf8'))
      .trim()
      .split(eol)
      .concat(defaultPattern)
    try {
      const verifiedpatterns = ignorePatternList.map(p => new RegExp(p))
      const ignorePattern = ignorePatternList.join('|')
      return new RegExp(ignorePattern)
    } catch (err) {
      print(chalk.red('Error: file _muignore has incorrect syntax.'), chalk.yellow('Each line must contain valid 1st parameter for:'), 'new RegExp')
    }
  }
  return new RegExp(defaultPattern)
}

// iterates through every file in root directory
async function treeify(forEachFile) {
  const treeRoot = process.cwd()
  const ignorePattern = await _ignore()
  const tree = gl.baseCase

  if (await fs.pathExists(treeRoot)) {
    await Promise.all((await rget(treeRoot, ignorePattern)).map(file => forEachFile(tree, file)))
  }
  return tree
}

async function getSavedData(head, version) {
  let lastSavePath
  if (head && version) {
    lastSavePath = muOps.path('history', head, version + '.json')
  } else {
    lastSavePath = muOps.path('history', po.head, 'v' + Math.max(0, po.version - 1) + '.json')
  }
  const lastSave = await fs.pathExists(lastSavePath) ? fs.readJson(lastSavePath) : Promise.resolve(gl.baseCase)
  return lastSave
}

/*
 * TREE HELPERS
 */

function getHashByInode(tree, inode) {
  return tree.ino[inode]
}

function setHashByInode(tree, inode, hash) {
  tree.ino[inode] = hash
}

function setTreeData(tree, hash, path, data) {
  tree.dat[hash] = tree.dat[hash] || [-1, -1, {}]
  tree.dat[hash][0] = data.isutf8
  tree.dat[hash][1] = data.size
  tree.dat[hash][2][path] = data.mtime
}

function getOnFileData(tree, inode, filepath) {
  const hash = tree.ino[inode]
  const data = tree.dat[hash]
  const mtime = hash && data[2] && data[2][filepath]
  return {
    get exists() {
      return !!(mtime)
    },
    get isutf8() {
      return data && data[0]
    },
    get size() {
      return data && data[1]
    },
    get mtime() {
      return mtime
    }
  }
}

