/*
 * @acknowledgement
 * Adapted from https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
 */
module.exports = {
	diff,
	reconstruct
}

function diff(oldstr, newstr, subCost = 1, insertCost = 1, delCost = 1) {
	const oldLength = oldstr.length,
		newLength = newstr.length

	// trivial cases
	if (oldLength === 0){
		return {
			"distance" : newLength,
			"backtrace" : []
		}
	}

	if (newLength === 0){
		return {
			"distance" : oldLength,
			"backtrace" : []
		}
	}

	const min = Math.min, max = Math.max
	const matrix = []
	const backtrace = []

	// init first column of each row & backtrace matrix
	let i = newLength + 1
	while (i--) {
		matrix[i] = [i]
		backtrace[i] = [2]
	}

	// init each column in the first row
	let j = oldLength + 1
	while (j--) {
		matrix[0][j] = j
		backtrace[0][j] = 3
	}
	backtrace[0][0] = 5

	// Fill in the rest of the matrix
	for (let i = 1; i <= newLength; i++) {
		for (let j = 1; j <= oldLength; j++) {
			let pointer = 0
			if (newstr[i - 1] === oldstr[j - 1]) {
				matrix[i][j] = matrix[i - 1][j - 1]
				backtrace[i][j] = pointer
			} else {
				const substDist = matrix[i - 1][j - 1] + subCost
				const insertDist = matrix[i][j - 1] + insertCost
				const deleteDist = matrix[i - 1][j] + delCost
				let minDist
				if (substDist <= insertDist && substDist <= deleteDist) {
					minDist = substDist
					pointer = 1
				} else if (deleteDist <= insertDist) {
					minDist = deleteDist
					pointer = 2
				} else {
					minDist = insertDist
					pointer = 3
				}
				matrix[i][j] = minDist
				backtrace[i][j] = pointer
			}
		}
	}

	const decode = {
    0: '_',
		1: 'sub',
		2: 'del',
		3: 'ins'
  }

  //perform backtrace
	let di = newLength,
		dj = oldLength,
    incrementer = 0,
		index = oldstr.length - 1
	const trace = []
	while (di || dj) {
		let bt = backtrace[di][dj]
		const aChar = () => oldstr[index--] || "error. index: " + oldstr.length
		if (bt <= 1) {
			dj = max(0, dj - 1)
			di = max(0, di - 1)
			if(bt){ //i.e. is bt === 1
				trace[incrementer++] = 's' + aChar()
			}else{
				trace[incrementer++] = '1_'
				index--
			}
		} else if (bt === 2) {
			di = max(0, di - 1)
			trace[incrementer++] = 'd'
		} else if(bt === 3) {
			dj = max(0, dj - 1)
			trace[incrementer++] = 'i' + aChar()
		}
		// console.log(incrementer)
	}

	return {
		'distance': matrix[newLength][oldLength],
		'backtrace': trace
	}
}

function reconstruct(old, trace){
	let c = '', pointer = old.length
	for(let i=0, n=trace.length; i < n; i++){
		const op = trace[i], skipBlock = parseInt(op)
		if(op[1] === '_'){
			c = old.slice(pointer - skipBlock, pointer) + c
			pointer -= skipBlock
		}else if(op[0] === 's'){
			c = op[1] + c
			pointer--
		}else if(op[0] === 'i'){
			c = op[1] + c
		}else{
			pointer--
		}
	}
	return c
}
