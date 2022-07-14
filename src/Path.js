import Utils from './Utils'

class Path {
   constructor(puzz) {
      console.log('PATH constructor'); 
		this.puzzle = puzz;
		this.currval = -1; 
   }
	
	checkBadPath() { 
		for (let n = 0; n < this.puzzle.SIZE; n++) {   	// typically 9 
			this.currval = n; 
			this.setArrays(n); 
			this.endpoints = this.getEndPoints(); 
			var result = this.buildPaths(); 	
			console.log('end'); 
			if (result.found == 1) return result; 
		}
		return result; 
	}

	setArrays(n) { 
		this.abox = []; 
		this.arow = []; 
		this.acol = []; 
		this.bigarray = []; 
		this.endpoints = []; 
		
		this.setArraysRow(n); 
		this.setArraysCol(n); 
		this.setArraysBox(n); 
		this.setBigArray(); 
	}

   // for value n, creates an array of all row squares (rrccbb) where the row consists of exactly 2 cells that have value n 
	setArraysRow(n) { 
		for (let i = 0; i < this.puzzle.SIZE; i++) { 
			if (this.puzzle.rows[i].valGrid[n].length == 2)  { 
				var j = this.puzzle.rows[i].valGrid[n][0]; 
				this.arow.push(this.twoDigit(i)+this.twoDigit(j)+this.twoDigit(this.puzzle.squares[i][j].box)); 
				j = this.puzzle.rows[i].valGrid[n][1]; 
				this.arow.push(this.twoDigit(i)+this.twoDigit(j)+this.twoDigit(this.puzzle.squares[i][j].box)); 
			}
		}		
	}
	
	// for value n, creates an array of all col squares (rrccbb) where the col consists of exactly 2 cells that have value n 
	setArraysCol(n) { 
		for (let j = 0; j < this.puzzle.SIZE; j++) { 
			if (this.puzzle.cols[j].valGrid[n].length == 2)  { 
				var i = this.puzzle.cols[j].valGrid[n][0]; 
				this.acol.push(this.twoDigit(i)+this.twoDigit(j)+this.twoDigit(this.puzzle.squares[i][j].box)); 
				i = this.puzzle.cols[j].valGrid[n][1]; 
				this.acol.push(this.twoDigit(i)+this.twoDigit(j)+this.twoDigit(this.puzzle.squares[i][j].box)); 
			}
		}		
	}

	// for value b, creates an array of all box squares (rrccbb) where the box consists of exactly 2 cells that have value n 
	setArraysBox(n) { 
		for (let b = 0; b < this.puzzle.SIZE; b++) { 
			if (this.puzzle.boxes[b].valGrid[n].length == 2)  { 
				var i = this.puzzle.boxes[b].boxSquare[this.puzzle.boxes[b].valGrid[n][0]].row; 
				var j = this.puzzle.boxes[b].boxSquare[this.puzzle.boxes[b].valGrid[n][0]].column; 
//				this.abox.push('0'+i+'0'+j+'0'+b.toString()); 
				this.abox.push(this.twoDigit(i)+this.twoDigit(j)+this.twoDigit(b)); 
				i = this.puzzle.boxes[b].boxSquare[this.puzzle.boxes[b].valGrid[n][1]].row; 
				j = this.puzzle.boxes[b].boxSquare[this.puzzle.boxes[b].valGrid[n][1]].column; 
//				this.abox.push('0'+i+'0'+j+'0'+b.toString()); 
				this.abox.push(this.twoDigit(i)+this.twoDigit(j)+this.twoDigit(b)); 
			}
		}		
	}
	
   // concatenate the arow, acol, & abox arrays into one big array for traversal 
	setBigArray() { 
		for (let a = 0; a < this.arow.length; a++) { 
			this.bigarray.push(this.arow[a]); 
		}
		for (let a = 0; a < this.acol.length; a++) { 
			this.bigarray.push(this.acol[a]); 
		}
		for (let a = 0; a < this.abox.length; a++) { 
			this.bigarray.push(this.abox[a]); 
		}		
		this.bigarray = sort_unique(this.bigarray); 
		
		function sort_unique(arr) {
			if (arr.length === 0) return arr;
			arr = arr.sort(function (a, b) { return a*1 - b*1; });
			var ret = [arr[0]];
			for (var i = 1; i < arr.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
				if (arr[i-1] !== arr[i]) {
					ret.push(arr[i]);
				}
			}
			return ret;
		}
		function sort_unique2(current) {
			var accum = []; 
			return this.reduce(function(accum, current) {
				if (accum.indexOf(current) < 0) {
					accum.push(current);
				}
				return accum;
			}, []);
		}
	} 
	
	getEndPoints() {
		var ep = []; 
		
		for (let q = 0; q < this.arow.length; q++) {
			if (this.acol.indexOf(this.arow[q]) == -1 &&  this.abox.indexOf(this.arow[q]) == -1) ep.push(this.arow[q]);  
		}
		for (let q = 0; q < this.acol.length; q++) {
			if (this.arow.indexOf(this.acol[q]) == -1 &&  this.abox.indexOf(this.acol[q]) == -1) ep.push(this.acol[q]);  
		}
		for (let q = 0; q < this.abox.length; q++) {
			if (this.arow.indexOf(this.abox[q]) == -1 &&  this.acol.indexOf(this.abox[q]) == -1) ep.push(this.abox[q]);  
		}		
		return ep;  
	}
	
	buildPaths() { 
		for (let i = 0; i < this.endpoints.length; i++) {
			var prevNum = -1; 		// value used when a # is removed from chain, so we can select a higher number for adding to the chain in that same spot
			var chain = []; 
			chain.push(this.endpoints[i]); 
			var found = 0; 
			// get first match
			var nxt = this.getNext(chain[chain.length - 1], chain, prevNum);  
			chain.push(nxt); 
			while (found == 0 && chain.length >= 1) {
				var nxt = this.getNext(chain[chain.length - 1], chain, prevNum);  
				if (nxt == -1) {
					var st = this.checkError(chain);
					if (st.error == 1) { 
//j						window.alert('SUCCESS -- Bad Chain found'); 
						found = 1; 
						return {found: 1, chain: st.chain, val: this.currval, del: st.del, keep: st.keep, type: st.type };  
//						break; 
					}
					prevNum = chain.pop();  
				}
				else {
					chain.push(nxt); 
					prevNum = -1; 
					if (chain.length < 4) continue; 
					var st = this.intersectError(chain); 
					if (st.error == 1) { 
//j						window.alert('SUCCESS -- Intersect error found'); 
						found = 1; 
						return { found: 1, chain: st.chain, val: this.currval, /*del: st.del, keep: st.keep,*/ poss: st.poss, type: st.type } 
					}
				}
			}	
		}	
		return {found: 0}; 
	}

	getNext(currVal, chain, lastNum) { 
		for (let w = 0; w < this.bigarray.length; w++) { 
			var x = this.bigarray[w]; 
			//if (x != currVal 
			if (chain.indexOf(x) > -1)  continue; 
			if (x <= lastNum) continue; 
			if ( 	(x.substring(0,2) == currVal.substring(0,2) && this.arow.indexOf(x) > -1)	// curr value & next value match to first 2 chars (row) & curr value exists in rows array
					 || (x.substring(2,4) == currVal.substring(2,4) && this.acol.indexOf(x) > -1)	// curr value & next value match to chars 3 & 4 (col) & curr value exists in cols array
					 || (x.substring(4,6) == currVal.substring(4,6) && this.abox.indexOf(x) > -1))  {	// curr value & next value match to chars 5 & 6 (box) & curr value exists in boxes array
				return x;
			}
		}
		return -1; 
	}
	
   /* determines if the calculated chain contains an Error that we can use to remove possibles */
	checkError(chain) {
		if (chain.length < 4) return { error: false }; 
		var t1 = [];  var t2 = []; 
		var cnt = 1; 
		for (let a = 0; a < chain.length; a++) { 
			if (a % 2 == 0) t1.push(chain[a]); 
			else t2.push(chain[a]); 
		}
		for (let i = 0; i < t1.length - 1; i++) {
			for (let j = i + 1; j < t1.length; j++) { 
				if (t1[i].substring(0,2) == t1[j].substring(0,2) 
				|| 	t1[i].substring(2,4) == t1[j].substring(2,4)
				||	t1[i].substring(4,6) == t1[j].substring(4,6))  {
//j					window.alert('invalid pair');
					var delarray = []; 	    
					var keeparray = []; 
					for (let m = i; m <= j; m++)  delarray.push(t1[m]); 
					var start = chain.indexOf(t1[i]); 
					var end = chain.indexOf(t1[j]); 
					var cnt = 1; 
					for (let m = start + 1; m < end; m++) { 
						if (t2.indexOf(chain[m]) > -1) {
							keeparray.push(chain[m]); 
						}
					}
					return {error: true, chain: chain, del: delarray, keep: keeparray, type: 'deadend' }; 
				}
			}
		}
		/** INCOMPLETE -- fix this so it matches preceding section **/
/*		for (let i = 0; i < t2.length - 1; i++) {
			for (let j = i + 1; j < t2.length; j++) { 
				if (t2[i].substring(0,2) == t2[j].substring(0,2) 
				|| 	t2[i].substring(2,4) == t2[j].substring(2,4)
				||	t2[i].substring(4,6) == t2[j].substring(4,6))  {
//j					window.alert('invalid pair -- 2'); 
					return {error: true, del1: t1[i], del2: t1[j] }; 
				}
			}
		}	*/
		return { error: false }; 
	}

	/* determines if the calculated chain contains 2 cells (have-value, not-value) with an intersection of a possible; 
		  e.g. cell(2,8) has value of 9, cell(5,2) not value of 9,  intersecting cell of (2,2) or cell (5,8) w/ possible of 9 can be removed */
	intersectError(chain) {
		if (chain.length < 4) return { error: false }; 
		for (let a = 0; a < chain.length - 3; a++) { 
			for (let b = a+3; b < chain.length; b = b + 2) { 
				console.log('for val = ' + this.currval + '; idx = ' + a + ',' + b); 
				var r1 = parseInt(chain[a].substring(0,2)); 
				var c1 = parseInt(chain[a].substring(2,4)); 
				var r2 = parseInt(chain[b].substring(0,2)); 
				var c2 = parseInt(chain[b].substring(2,4)); 		
				if (r1 == r2 || c1 == c2) continue; 
				if (this.puzzle.squares[r1][c2].possible[this.currval] == 1) {
					var bx = this.puzzle.squares[r1][c2].box; 
//					var tmp = '0'+r1.toString()+'0'+c2.toString()+'0' +bx.toString(); 
					var tmp = this.twoDigit(r1)+this.twoDigit(c2)+this.twoDigit(bx); 
					// do not select cells that are already in the chain 
					if (chain.indexOf(tmp) < 0) return {error: true, chain: chain, poss: {row: r1, col: c2}, type: 'intersect'}; 
				}
				if (this.puzzle.squares[r2][c1].possible[this.currval] == 1) {
					var bx = this.puzzle.squares[r2][c1].box; 
//					var tmp = '0'+r2.toString()+'0'+c1.toString()+'0' +bx.toString(); 
					var tmp = this.twoDigit(r2)+this.twoDigit(c1)+this.twoDigit(bx); 
					// do not select cells that are already in the chain 
					if (chain.indexOf(tmp) < 0) return {error: true, chain: chain, poss: {row: r2, col: c1}, type: 'intersect'}; 
				}				
			}
		}

		return { error: false }; 
	}

	twoDigit(num) { 
		var x_2dig =  (num > 9) ? num.toString() : '0' + num.toString(); 
		return x_2dig; 
	}
	
/*			
010  010  010
062  716  100
100  344  062
182  444  182
344  375  344
375  475  444
444  182  375
475  788  475
806
868

// Start at End point (a row, col, or box entry that does not have a match outside of its array -- e.g. 716 only matches to col array, 788 only to col array, and 806 & 868 in row array, ) 
716, 010, 062, 182, 100 [end, so remove last]   ;  slice from array after saving value, try next value higher
716, 010, 062, 182, 788 [end w/ match rows - remove 716 & 788] 
716, 010, 100, 182, 788 [end w/ match rows - remove 716 & 788];  not executed due to prev removal find

010, 062, 182, 100  [end, so remove last]
010, 062, 182, 788, 716 [x - not in row array] 
010, 062, 182, 788, 868 [x - not in box array]

010  
062  
100  
182    
344    
375  
444  
475  
716
788  
806
868
*/


}

export { Path as default }

