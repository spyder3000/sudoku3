import Utils from './Utils';
import Solver from './Solver'; 
import Puzzle from './Puzzle';
import Creator from './Creator'; 

class WorkGrid {  
   constructor(puzzle) {
      console.log('WorkGrid constructor'); 
		// this.copyPuzzle = puzzle; 
      this.copyPuzzle2 = this.shallowCopy(puzzle); 
		// this.work = Object.clone(puzzle); 
      // this.work = Object.assign({},copyPuzzle2); // creates a shallow copy
      this.work = this.shallowCopy(this.copyPuzzle2); 
      // this.work = {...puzzle};   // shallow copy
      // this.work = JSON.parse(JSON.stringify(puzzle));   // deep copy
		this.chain = []; 		// expected format rrcc-vv  where rr = 0-8 (row), cc = 0-8 (col), vv = 1-9 (value)
		this.deadend = 1; 
		this.abort = 0; 
		this.saveDat = {length: 99}; 
		this.logger = [];    
   }

   shallowCopy(puzz, pgrid, psize) {
      let newPuzz = new Puzzle();  
      newPuzz.SIZE = puzz.SIZE;  //psize; 
      newPuzz.grid = Utils.copyGridShallow(puzz.grid); 
      Creator.createSquares(newPuzz); 
      for (let x = 0; x < newPuzz.SIZE; x++) {
         for (let y = 0;  y < newPuzz.SIZE; y++) {
            newPuzz.squares[x][y].possible = [...puzz.squares[x][y].possible];
            newPuzz.squares[x][y].solved = puzz.squares[x][y].solved;
            newPuzz.squares[x][y].solvable = puzz.squares[x][y].solvable;
         }
      }
      Creator.createBoxes(newPuzz); 
      

      console.log('end Shallowcopy'); 
      return newPuzz; 
   }

   checkBadPath() { 
      console.log('checkBadPath'); 
      this.getStarterCells(); 
      this.solvedGrid = new Solver(this.work.grid).solvePuzzle();   
      for (let a = 0; a < this.cells2.length; a++) { 
//		for (let a = 5; a < 7; a++) { 	
         // this.work = Object.clone(this.copyPuzzle); 
         // this.work = Object.assign({},this.copyPuzzle2); // creates a shallow copy
         // this.work = {...this.copyPuzzle};   // shallow copy
         // this.work = JSON.parse(JSON.stringify(this.copyPuzzle));    // deep copy
         this.work = this.shallowCopy(this.copyPuzzle2); 
         this.chain = []; 
         this.logger = []; 
//			this.errorfound = 0; 
         this.error = {found: 0 }; 
         this.abort = 0; 
         var x = parseInt(this.cells2[a].substring(0,2));
         var y = parseInt(this.cells2[a].substring(2,4));
         this.startPath({cell: this.cells2[a], row: x, col: y, exclude: this.solvedGrid.grid[x][y]});   // exclude param is so we don't used the final answer value in checks
         console.log('check Path length = ' + this.saveDat.length); 
         if (this.saveDat.length < 6) break;    // chain is short enough to use - no need to check other chains
      }
      console.log('end checkBadPath'); 
      if (this.saveDat.length < 99) {
         this.saveDat.found = 1; 
         console.log('end checkBadPath -- return 1 '); 
         return this.saveDat; 
      }
      else {
         console.log('end checkBadPath -- return fail'); 
         return {found: 0}; 
      }
   }

   /* capture all cells that have just 2 possibilities  */  
	getStarterCells() { 
      console.log('getStarterCells'); 
		this.cells2 = [];       // e.g. ["0001", "0003", "0401", etc] for rrcc where rr = 0-8 row & cc = 0-8 col
		for (let i = 0; i < this.work.SIZE; i++) { 				// typically 9
			for (let j = 0; j < this.work.SIZE; j++) { 			// typically 9
				if (this.work.squares[i][j].solvable == 2)  {
					this.cells2.push(Utils.twoDigit(i)+Utils.twoDigit(j));   
				}
			}
		}
	} 

   	/* finds first value (invalid) to try at start of chain */
	startPath(params) { 
      console.log('startPath'); 
		var p = this.work.squares[params.row][params.col].getCurrPossibles();    // getCurrPossibles returns values 0-8  (or 0-15) 
		var tryVal = p[0] + 1; 
		if (p[0] == params.exclude) tryVal = p[1] + 1; 
		var key = params.cell + '-' + Utils.twoDigit(tryVal);  //'-0' + tryVal; 
		this.chain.push(key); 
		this.logger.push({chainlink: key, actions: []}); 
		this.firstLink(key); 
      console.log('return from startPath'); 
	}

	/* Takes the 'key' field provided to update the first cell & then track until an error is found */
	firstLink(key) { 
      console.log('firstLink'); 
		let cell = Utils.convert_ccrrvv(key); 
		this.solveCell(cell.row, cell.col, cell.val);      // cell.val is actual value (1-9)
		this.wModPossible(cell.row, cell.col, cell.val); 	
		this.navigateCells();  
		console.log('reTurn from firstLink'); 		
	} 

   /* the Main Loop for a single starting point -- this traverses the grid & adds (or removes) from the chain until the best solution (or no solution) is found for the starting link */
	navigateCells() { 
      console.log('navigateCells'); 
		this.removedLink = '';   // '' indicates that the last action was not to remove a link from the chain
//		while (this.error.found == 0 && this.chain.length > 0 && this.abort == 0) {    // jv - remove this.error.found from calculations & possibly this.abort;  
		while (this.chain.length > 0) {    	
			this.checkSingles(); 
			if (this.error.found == 1) { 
				this.saveError(); 
			}
		}
		console.log('end navigate'); 
	}

	/* Deadend Found -- save info */
	saveError() { 
      console.log('saveError'); 
		// capture solution if this is a better solution than previously saved (fewer steps) 
		if (this.chain.length < this.saveDat.length) { 
			this.saveDat = { chain: this.chain.slice(), row: this.error.row, col: this.error.col, length: this.chain.length } 
		}
		this.error = {found: 0}; 
		// rollback is executed twice because we are looking for a shorter path;  rolling back once would give us at best a path of the same length once we add the next cell 
		this.rollbackMods(); 
		this.rollbackMods(); 
	} 
	
	/* Rollback most recent addition to chain */
	rollbackMods() { 
      console.log('rollbackMods'); 
		this.undoLog(this.chain.length - 1); 
		this.removedLink = this.chain.pop(); 	
		console.log('end rollbackMods - remove = '+this.removedLink); 
	}   

   /* Use Log entries to undo Solve & update Possibilities for most recent level;  then delete the top layer of Log entries */
	undoLog(lev) { 
      console.log('undoLog'); 
		for (let q = 0; q < this.logger[lev].actions.length; q++) {
			if (this.logger[lev].actions[q].type == 'solve')  this.unSolveCell(this.logger[lev].actions[q].cell); 
			if (this.logger[lev].actions[q].type == 'possible')  this.wAddPossible(this.logger[lev].actions[q].cell); 
		}
		this.logger.splice(this.logger.length - 1); 
		console.log('end undoLog');  
	}

	/*-----------------------------------------------------------------------------------------*/
	/*  SOLVE for Cell                                                                         */
	/*-----------------------------------------------------------------------------------------*/      
	solveCell(i, j, val) {
      console.log('solveCell'); 
//		let tmpval = '0' + i.toString() + '0' + j.toString() + '-0' + val.toString();  
      let tmpval = Utils.twoDigit(i) + Utils.twoDigit(j) + '-' + Utils.twoDigit(val);    
      this.logger[this.logger.length -1].actions.push({type: 'solve', cell: tmpval }); 

      this.work.squares[i][j].solveSquare(i,j, val);		// vals 1 thru 9 
   }  
         
   unSolveCell(param) { 
      console.log('unSolveCell'); 
      let x = Utils.convert_ccrrvv(param); 		// returns row, col, val;  val is actual value (1-9)
      this.work.squares[x.row][x.col].solved = 0;  		
      this.work.squares[x.row][x.col].solvable = 1;  	
      this.work.squares[x.row][x.col].possible[x.val - 1] = 1;  	
   }

	/*-----------------------------------------------------------------------------------------*/
	/*  Step 0 -- Check For Cells with just one Possible Value                                 */
	/*-----------------------------------------------------------------------------------------*/      
	checkSingles() { 
      console.log('checkSingles'); 
		var deadend = 1; 
		this.abort = 0; 
		
		if (this.chain.length + 1 >= this.saveDat.length || this.chain.length + 1 > 8)  {
			this.rollbackMods();
			return; 
		}
		
		// to prevent re-selecting the chain link we just removed, start the for loop at 1 cell after the link removed 
		let param = {row: 0, col: 0}; 
		if (this.removedLink != '')  {
			param = Utils.convert_ccrrvv(this.removedLink); 
			if (param.col == this.work.SIZE - 1) { param.col = 0; param.row++; } 	// typically == 8
			else param.col++; 
		} 
		
		outer_loop: 
		for (let i = param.row; i < this.work.SIZE; i++) {	// typically 9 
			for (let j = 0; j < this.work.SIZE; j++) {		// typically 9
				// found the next solvable square;  add to chain & modify possibles 
				if (i == param.row && j < param.col) continue; 							// exclude if this is prior in the grid to the cell we've just removed
				if (this.work.squares[i][j].solved == 0 && this.work.squares[i][j].solvable == 1)  {  
					deadend = 0;  
					let tval = this.work.squares[i][j].getCurrPossibles();   // returns array w/ 1 item value 0-8
					tval[0] = tval[0] + 1;  
					
					this.logger.push({chainlink: Utils.twoDigit(i) + Utils.twoDigit(j) + '-' + Utils.twoDigit(tval), actions: []}); 
					this.chain.push(Utils.twoDigit(i) + Utils.twoDigit(j) + '-' + Utils.twoDigit(tval)); 
					
					this.removedLink = ''; 
					
					this.solveCell(i,j,tval[0]); 		
					this.wModPossible(i,j,tval[0]); 					 
					break outer_loop; 
				} 
			}
		}       
		// next solvable square not found;  undo last addition to chain & proceed  
		if (deadend == 1) {
			this.rollbackMods(); 
			console.log('undo step'); 
		}
		// checks that all cells are valid based on last addition;  if not, we found a deadend & will return the error
		else {
			this.validateCells(); 		// will populate this.error field if invalid is found 
		}
	} 

	/* checks that no cells have Zero Possibilities */
	validateCells() { 
      console.log('validateCells'); 
		for (let a = 0; a < this.work.SIZE; a++) { 		// typically 9
			for (let b = 0; b < this.work.SIZE; b++) { 
				if (this.work.squares[a][b].solved > 0) continue; 
				if (this.work.squares[a][b].getCurrPossibles().length == 0)  {
					this.error = {found: 1, row: a, col: b}; 
					return; 
				}
			}
		}
	} 
	
	wModPossible(x, y, val) { 
      console.log('wModPossible'); 
		this.wModPossibleRow(x,val); 
		this.wModPossibleCol(y,val);
		this.wModPossibleBox(this.work.squares[x][y].box,val);     
		if (this.work.SIZE == 16) { 
			if (this.work.squares[x][y].diag >= 0) 
				this.wModPossibleDiag(this.work.squares[x][y].diag,val); 
		}
	} 

	wModPossibleRow(x, val, exclude) { 		// val is 1-9 for values;  exclude is array of 0-8 (for excluded cols) 
      console.log('wModPossibleRow'); 
		if (!exclude) exclude = [];
		// remove value from possible array for all other squares in row 
		for (let jj = 0; jj < this.work.SIZE; jj++) {			// typically 9 
			if (exclude.indexOf(jj) >= 0) continue; 
			if (this.work.squares[x][jj].solved == 0) {
				this.wRemovePossible(x, jj, val);  
			}
		}           
	}
	wModPossibleCol(y, val, exclude) { 		// val is 1-9 for values;  exclude is array of 0-8 (for excluded cols)
      console.log('wModPossibleCol'); 
		if (!exclude) exclude = []; 
		// remove value from possible array for all other squares in column
		for (let ii = 0; ii < this.work.SIZE; ii++) {			// typically 9
			if (exclude.indexOf(ii)  >= 0) continue; 
			if (this.work.squares[ii][y].solved == 0) {
				this.wRemovePossible(ii, y, val);  
			}
		}               
	}   
	wModPossibleBox(bx, val, exclude) { 		// val is 1-9 for values;  exclude is array of 0-8 (for excluded cols)
      console.log('wModPossibleBox'); 
		if (!exclude) exclude = []; 
		// remove value from possible array for all other squares in box
		for(let bb = 0; bb < this.work.SIZE; bb++) { 					// typically 9 
			if (exclude.indexOf(bb)  >= 0) continue; 
			var cell = this.work.boxes[bx].boxSquare[bb]; 
			//if (cell.solved == 0) {
			if (this.work.squares[cell.row][cell.column].solved == 0) {
				this.wRemovePossible(cell.row, cell.column, val);  
			}
		}           
	}

	wModPossibleDiag(bx, val, exclude) { 		// val is 1-16 for values;  exclude is array of 0-15 (for excluded cols)
      console.log('wModPossibleDiag'); 
		if (!exclude) exclude = []; 
		// remove value from possible array for all other squares in box
		for(let dd = 0; dd < this.work.SIZE; dd++) { 					// typically 9 
			if (exclude.indexOf(dd)  >= 0) continue; 
			var cell = this.work.diags[bx].diagSquare[dd]; 
			//if (cell.solved == 0) {
			if (this.work.squares[cell.row][cell.column].solved == 0) {
				this.wRemovePossible(cell.row, cell.column, val);  
			}
		}           
	}

	wRemovePossible(x, y, val) { 	// val is actual value (1-9)
      console.log('wRemovePossible'); 
		var valadj = val -1;   				// val - 1 due to 0-based array for possibles
		if (this.work.squares[x][y].possible[valadj] == 1) {       
			let tmpval = Utils.twoDigit(x) + Utils.twoDigit(y) + '-' + Utils.twoDigit(val); 
			this.logger[this.logger.length -1].actions.push({type: 'possible', cell: tmpval }); 
			this.work.squares[x][y].possible[valadj] = 0;
			this.work.squares[x][y].solvable--;
			
			/* jv -- add this back (& reversal steps) if we include logic to check for lone values in a row/col/box  */
			//modify valGrid arrays; 
			//this.modValGridCell(x,y,val);   
		}
	}

	/* Restore data from prior to removePossible execution for this cell/value */
	wAddPossible(param) { 	
      console.log('wAddPossible'); 
		let x = Utils.convert_ccrrvv(param); 		// returns row, col, val;  val is actual value (1-9)
		var valadj = x.val -1;   				// val - 1 due to 0-based array for possibles
		if (this.work.squares[x.row][x.col].possible[valadj] == 0) {       
			this.work.squares[x.row][x.col].possible[valadj] = 1;
			this.work.squares[x.row][x.col].solvable++;
			
			/* jv -- add this back (& reversal steps) if we include logic to check for lone values in a row/col/box  */
			//modify valGrid arrays;  
			//this.modValGridCell(x,y,val);   
		}
	}

	// /* modify valGrid for all elements in row/col/box of specified cell;  val0 is actual value (1-9) or (1-16)*/
	// modValGrid(i0, j0, val0) { 
	// 	this.work.rows[i0].modVals(j0, val0);  // mod the valGrid array for all numbers for this row
	// 	this.work.cols[j0].modVals(i0, val0);  // mod the valGrid array for all numbers for this col
	// 	this.work.boxes[this.work.squares[i0][j0].box].modVals(this.work.squares[i0][j0].boxsq, val0);  // mod the valGrid array for all numbers for this box
	// }
	
	// /* modify valGrid for row/col/box of just the specified cell; val0 is actual value (1-9) or (1-16) */
	// modValGridCell(i0, j0, val0) { 
	// 	this.work.rows[i0].modValCell(j0, val0);  // mod the valGrid array for a specific cell in this row
	// 	this.work.cols[j0].modValCell(i0, val0);  // mod the valGrid array for a specific cell in this col
	// 	this.work.boxes[this.work.squares[i0][j0].box].modValCell(this.work.squares[i0][j0].boxsq, val0);  // mod the valGrid array for for a specific cell in this box       	
	// }

}

export { WorkGrid as default }

