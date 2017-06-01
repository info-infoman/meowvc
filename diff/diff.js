/*
 * @acknowledgement
 * Adapted from https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
 */

module.exports = function diff(a, b, subCost = 1, insertCost = 1, delCost = 1) {
	const alength = a.length,
		blength = b.length

	// trivial case
	if (alength === 0) return blength
	if (blength === 0) return alength

	const min = Math.min, max = Math.max
	const matrix = []
	const backtrace = []

	// init first column of each row & backtrace matrix
	let i = blength + 1
	while (i--) {
		matrix[i] = [i]
		backtrace[i] = []
	}

	// init each column in the first row
	let j = alength + 1
	while (j--) {
		matrix[0][j] = [j]
	}

	// Fill in the rest of the matrix
	for (let i = 1; i <= blength; i++) {
		for (let j = 1; j <= alength; j++) {
			let pointer = 0
			if (b[i - 1] === a[j - 1]) {
				matrix[i][j] = matrix[i - 1][j - 1]
				backtrace[i][j] = pointer
			} else {
				const substDist = parseInt(matrix[i - 1][j - 1]) + subCost
				const insertDist = parseInt(matrix[i][j - 1]) + insertCost
				const deleteDist = parseInt(matrix[i - 1][j]) + delCost
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

  //perform backtrace
	let di = blength,
		dj = alength,
    incrementer = 0
	const trace = []
	while (dj - 1 && dj - 1) {
		let bt = backtrace[di][dj]
		trace[incrementer++] = bt

		if (bt <= 1) {
			dj = max(1, dj - 1)
			di = max(1, di - 1)
		} else if (bt === 2) {
			di = max(1, di - 1)
		} else {
			dj = max(1, dj - 1)
		}
	}

  const decode = {
    0: '_',
		1: 'sub',
		2: 'del',
		3: 'ins'
  }

	return {
		'distance': parseInt(matrix[blength][alength]),
		'backtrace': trace,
    decode
	}
}
