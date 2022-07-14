import Validator from './Validator'

class Solver {  
   constructor(tgrid) {
      console.log('Solver constructor'); 
		this.puzzleSolved = 0; 
		this.puzzleFail = 0;  
		this.puzzleValid = 1; 
		this.workGrid = tgrid;
		this.keepGrid = [];
		this.copyGridtoTemp(); 
		this.SIZE = tgrid.length; 
   }

   copyGridtoTemp() { 
		for (var q = 0; q < this.workGrid.length; q++)       // makes shallow copy of grid array 
			this.keepGrid[q] = this.workGrid[q].slice();     
	}

   /* starting at beginning, modify grid cell by cell until a solution is found or cell possibilities are exhausted */
	solvePuzzle() { 
		this.puzzleSolved = 0; 
		this.puzzleFail = 0;  
		this.puzzleValid = 1; 		
		var i = 0;  var j = 0;  var dat = {}; 
		var startIdx = this.getFirstEmpty();            // get starting i & j value (first cell that does not yet have a number 
		if (startIdx.error) {
			window.alert('Unexpected Error - solvePuzzle'); 
			return false; 
		}
		i = startIdx.x;  
		j = startIdx.y; 
		var jv = 0; 
		while (!this.puzzleSolved && !this.puzzleFail) {
			jv++; 
			if (jv > 1000000) { 
				jv = 0; 
			}
			if (this.getValue(i,j) != 0) {              // checks that there is a valid next number for this cell;  
				dat = this.incrementCtr(i,j);           // mods index (i,j) to next valid non-perm number
				i = dat.i;  j = dat.j; 
			}
			else {
				this.workGrid[i][j] = 0;             // sets current square back to 0 (undefined) 
				dat = this.decrementCtr(i,j);       // mods index (i,j) to prev non-perm number 
				i = dat.i;  j = dat.j; 
			}
		}
		if (this.puzzleSolved) return {solved: 1, grid: this.workGrid};
		else return {solved: 0} ; 
	}

   /* starting at end, modify grid cell by cell (going backwards) until a solution is found or cell possibilities are exhausted */	
	solvePuzzleBwd() { 
		this.puzzleSolved = 0; 
		this.puzzleFail = 0;  
		this.puzzleValid = 1; 
		//var i = 8;  var j = 8;  var dat = {}; 
		var i = this.SIZE - 1;  var j = this.SIZE -1;  var dat = {}; 
		var startIdx = this.getLastEmpty();            // get starting i & j value (last cell that does not yet have a number) 
		if (startIdx.error) {
			window.alert('Unexpected Error - solvePuzzleBwd'); 
			return false; 
		}
		i = startIdx.x;  
		j = startIdx.y; 
		while (!this.puzzleSolved && !this.puzzleFail) {
			if (this.getValue(i,j) != 0) {              	// checks that there is a valid next number for this cell;  
				dat = this.decrementCtr(i,j, 'bwd');      	// mods index (i,j) to next valid non-perm number
				i = dat.i;  j = dat.j; 
			}
			else {
				this.workGrid[i][j] = 0;             	// sets current square back to 0 (undefined) 
				dat = this.incrementCtr(i,j, 'bwd');    // mods index (i,j) to prev non-perm number 
				i = dat.i;  j = dat.j; 
			}
		}
		if (this.puzzleSolved) return true;
		else return false; 
	} 	

   /* finds first cell that does not have a permanent value assigned */
	getFirstEmpty() {    
		for (let x = 0; x < this.SIZE; x++) {		// typically, 0 thru 8 
			for (let y = 0; y < this.SIZE; y++) {	// typically, 0 thru 8 
				if (this.keepGrid[x][y] == 0) {
					return {x: x, y: y}; 
					break;
				}
			}
		}
		return {error: 1}; 
	}  // .protect()

	/* finds last cell that does not have a permanent value assigned */
	getLastEmpty() {    
		for (let x = this.SIZE - 1 ; x > -1; x--) {  	// typically, 8 thru 0 
			for (let y = this.SIZE - 1; y > -1; y--) {		// typically, 8 thru 0
				if (this.keepGrid[x][y] == 0) {
					return {x: x, y: y}; 
					break;
				}
			}
		}
		return {error: 1}; 
	}  // .protect(), 
	
   getValue(x, y) {  
		for (let k = this.workGrid[x][y] + 1; k < this.SIZE + 1; k++) {	// typically, values 1 thru 9 
			if (!Validator.sameSquare(x, y, k, this.workGrid) && !Validator.sameRow(x, y, k, this.workGrid) && !Validator.sameColumn(x, y, k, this.workGrid)) {
				this.workGrid[x][y] = k; 
				return k; 
				break; 
			}
		}
		return 0; 
	} 

	/* does not check for values;  this simply finds the next cell in the grid that does not have a permanent value assigned */
	incrementCtr(x, y, zdir) { 
		if (!zdir) zdir = 'fwd'; 
		var found = 0; 
		var ret = {}; 
		while (!found) {
			if (y < this.SIZE - 1) {	// typically, checks for < 8 
				y+=1;       // increment column of grid             
			}
			else {
				y = 0; 
				x += 1;             // increment row of grid;  set col to col 0 
			}
			if (x > this.SIZE - 1) {         // increment past the last row & col, so puzzle is solved
				found = 1; 
				if (zdir == 'fwd') this.puzzleSolved = 1; 
				else  this.puzzleFail = 1; 
				ret.i = x; 
				ret.j = y; 
			}
			else if (this.keepGrid[x][y] == 0) {        // found the next available cell;  return found  
				found = 1; 
				ret.i = x; 
				ret.j = y; 
			}
		}
		return ret; 
	} 
 
	/* does not check for values;  this simply finds the prev cell in the grid that does not have a permanent value assigned */
	decrementCtr(x, y, zdir) { 
		if (!zdir) zdir = 'fwd'; 
		var found = 0; 
		var ret = {}; 
		while (!found) {
			if (y > 0) {
				y-=1;       // decrement column of grid
			}
			else {
				y = this.SIZE - 1;		// typically set to 8 
				x -= 1;             // decrement row of grid;  set col to col 0 
			}
			if (x < 0) {         // decrement past the first row & col, so puzzle is unsolvable
				found = 1; 
				if (zdir == 'fwd') this.puzzleFail = 1; 
				else this.puzzleSolved = 1; 
				ret.i = x; 
				ret.j = y; 
			}
			else if (this.keepGrid[x][y] == 0) {        // found the prev available cell;  return found  
				found = 1; 
				ret.i = x; 
				ret.j = y; 
			}
		}
		return ret; 
	}

}

export { Solver as default }

