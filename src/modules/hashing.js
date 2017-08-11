/*
* HASHING FUNCTIONS
*/

const path = require('path')
const crc = require('crc')
const gl = require('../constant')

module.exports = {
  hashIt,
  diskCache
}

/**
* @description hashes data w/ a cyclic redundancy check
* @param {String} data - utf string data
* @returns {String} hashsum
*/
function hashIt(buffer) {
  const h = crc.crc32(buffer).toString(16)
  if (h === '0') return '00000000'
  return h
}

/**
* @description caches lines & file to disk and returns the hashsum key for file
* @param {String} fpath - file path
* @returns {String} hashsum
*/
function diskCache(GlMem, buffer, isutf8) {
  const isUncached = hash => !(GlMem.memory.has(hash))
  const cacheIt = data => {
    GlMem.memory.add(data)
  }
  const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)

  const fileHash = hashIt(buffer)
  if(!isutf8){
    GlMem.binQueue.push([path.join(gl.binPath, insert(fileHash, 2, '/')), file])
  }else{
    const file = buffer.toString('utf8')
    if (isUncached(fileHash)) {
      cacheIt(fileHash)
      if (encoding === 'utf8') {
        const hashes = file.split(gl.eol).map(line => {
          const lineHash = hashIt(line)
          if (isUncached(lineHash)) {
            cacheIt(lineHash)
            GlMem.lineQueue.push([path.join(gl.linesPath, insert(lineHash, 2, '/')), line])
          }
          return lineHash
        })
        GlMem.fileQueue.push([path.join(gl.filesPath, insert(fileHash, 2, '/')), hashes])
      }
    }
  }
  return fileHash
}
