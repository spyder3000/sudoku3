import Utils from './Utils'

class Box {  
   constructor(options) {
      console.log('Box constructor'); 
      this.numbers = 0; 
      this.SIZE = options.size; 
      this.unsolved = this.SIZE; 
      this.possible = [];             
      for (let j = 0; j < this.SIZE; j++) { 
          this.possible[j] = 1;       // init each element in possible array to 1 (avail for number);     
      }
      this.boxSquare = []; 
      this.valGrid = [];      // e.g. will be 9 arrays, 1 for each number (1 - 9) which will consist of an array of possible cells for that number 
   }

   getPairCells(typ) { 
      if (!typ) typ = 2; 
      var p0 = [];            // array of squares that have 2 (or 3 if typ = 3) possible values;  
      var val = [];           // values of 2 possibles 
      for (let r = 0; r < this.boxSquare.length; r++) { 
          if (this.boxSquare[r].solvable == typ  && this.boxSquare[r].boxReduce > typ ) {      // finds all cells w/ exactly 2 possibilities that have not already been paired via previous processing
              p0.push(r); 
          }
      }
      if (p0.length < typ) return {found: 0}; 
       
      // 2 possible match 
      for (let r = 0; r < p0.length; r++) { 
          for (let s = r + 1; s < p0.length; s++) { 
              if (Utils.compareArray(this.boxSquare[p0[r]].possible, this.boxSquare[p0[s]].possible)) {
                  for (let x = 0; x < this.SIZE; x++) { 
                      if (this.boxSquare[p0[r]].possible[x] == 1)  val.push(x + 1); 
                  }
                  return {found: 1, sq: [p0[r], p0[s]], val: val}; 
              }
          }
      }
      return {found: 0}; 
   }

   getTrioCells(typ) {     // typ will be 2 or 3 (to match for 2 possibles or 3 possibles);  e.g. for box 0, cells 1, 2 & 5 all have possible values of not more than 5, 6 & 7  
      if (!typ) typ = 3; 
      var p0 = [];            // array of squares that have 2 or 3 possible values;  
      var val = [];           // values of 3 possibles 
      for (let r = 0; r < this.boxSquare.length; r++) { 
         // finds all cells w/ exactly 2 or 3 possibilities that have not already been paired via previous processing
         if ((this.boxSquare[r].solvable == 3 || this.boxSquare[r].solvable == 2) && this.boxSquare[r].boxReduce > typ  ) {     
            p0.push(r); 
         }
      }
      if (p0.length < typ) return {found: 0}; 
      
      // match of 3 Possible values in 3 cells 
      for (let r = 0; r < p0.length -2; r++) { 
         for (let s = r + 1; s < p0.length -1; s++) { 
            for (let t = s + 1; t < p0.length; t++) { 
            var ck = Utils.unionPossibles3(this.boxSquare[p0[r]].possible, this.boxSquare[p0[s]].possible, this.boxSquare[p0[t]].possible)
            if (ck.found == 1 ) {
               for (let x = 0; x < this.SIZE; x++) { 
                  if (this.boxSquare[p0[r]].possible[x] == 1  &&  val.indexOf(x + 1) < 0)  val.push(x + 1); 
                  if (this.boxSquare[p0[s]].possible[x] == 1  &&  val.indexOf(x + 1) < 0)  val.push(x + 1); 
                  if (this.boxSquare[p0[t]].possible[x] == 1  &&  val.indexOf(x + 1) < 0)  val.push(x + 1); 
               }
               val.sort(); 
               return {found: 1, sq: [p0[r], p0[s], p0[t]], val: val}; 
            }
            }
         }
      }
      return {found: 0}; 
   }

   modVals(idx, val) { 
      for (let z = 0; z < this.SIZE; z++) {
         if (z == val - 1) this.valGrid[z]= [];   // e.g. if val = 7;  valGrid for 7 needs to be empty        		
         else {	// e.g. if val = 7 for col 1;  all other values will need to remove col 1 from array of possibles       			
            var index = this.valGrid[z].indexOf(idx);     
            if (index > -1) this.valGrid[z].splice(index, 1);  
         }        		
      }
   } 

   modValCell(idx, val) {   // e.g. (1, 5) remove value 5 from cell 1 
      var index = this.valGrid[val - 1].indexOf(idx); 			// gets valGrid index for number 5, corresponding to cell 1 
      if (index > -1) this.valGrid[val - 1].splice(index, 1);  	// removes cell 1 from array for number 5 
   }      

   /* finds 2 vals that occur in just the same 2 cells;  all other values in those cells can be removed from possibles */
   getPairVals(typ) {    // typ will be 2 or 3 (to match for 2 possibles or 3 possibles);  e.g. for row 0, the value of 6 & the value of 7 exist only in col 1 & 4   
      for (let r = 0; r < this.SIZE - 1; r++) {			// e.g. vals 1 thru 8
         for (let s = r + 1; s < this.SIZE; s++) { 		// e.g. vals 2 thru 9
            if (this.valGrid[r].length != 2) continue; 
            if (this.valGrid[s].length != 2) continue; 
            if (Utils.compareArray(this.valGrid[r], this.valGrid[s]) && (this.boxSquare[this.valGrid[r][0]].solvable > 2 || this.boxSquare[this.valGrid[r][0]].solvable > 2) ) {
               return { found: true, cell1: this.valGrid[r][0], cell2: this.valGrid[r][1], val1: r, val2: s }; 
            }
         }
      }
      return { found: false}; 
   }

   featureBox(idx) { 
      // document.id("sudokutbl").getElements('td.box'+this.boxnum.toString()).addClass('featureBox');
      Utils.addClassElements('sudokutbl', 'td.box'+this.boxnum.toString(), 'featureBox'); 
   } 
   unfeatureBox(idx) { 
      // document.id("sudokutbl").getElements('td.box'+this.boxnum.toString()).removeClass('featureBox');
      Utils.removeClassElements('sudokutbl', 'td.box'+this.boxnum.toString(), 'featureBox'); 
   } 

   /* finds at least one possible value in the box that can be updated */
   findOnePoss(val, excludes) { 
      if (!excludes) excludes = []; 
      for (let w = 0; w < this.SIZE; w++) {			// w is squares
         if (excludes.indexOf(w) < 0) {				// skips squares in excludes array
            for (let v = 0; v < val.length; v++) {		// e.g. val is 1-9
               if (this.boxSquare[w].solved > 0) continue; 
               if (this.boxSquare[w].possible[val[v] - 1] == 1) return true; 
            }
         }
      }     
      return false; 
   }

   // could combine w/ unfeatureRemoves into 1 function, but it reads better as 2  
   featureRemoves(val, excludes) {
      if (!excludes) excludes = []; 
      for (let w = 0; w < this.SIZE; w++) {		// w is squares
         if (excludes.indexOf(w) < 0) {		// skips squares in excludes array
            for (let v = 0; v < val.length; v++) {
               if (this.boxSquare[w].solved > 0) continue; 
               var fld = document.getElementById("t"+ Utils.twoDigit(this.boxSquare[w].row) + Utils.twoDigit(this.boxSquare[w].column)).querySelector('.p_'+val[v].toString()); 
               if (fld.innerText > '')  fld.classList.add('featureVal');  
            }
         }
      }
   }

   unfeatureRemoves(val, excludes) {
      if (!excludes) excludes = []; 
      for (let w = 0; w < this.SIZE; w++) {		// w is squares
         if (excludes.indexOf(w) < 0) {		// skips squares in excludes array
            for (let v = 0; v < val.length; v++) {
               if (this.boxSquare[w].solved > 0) continue; 
               var fld = document.getElementById("t"+ Utils.twoDigit(this.boxSquare[w].row) + Utils.twoDigit(this.boxSquare[w].column)).querySelector('.p_'+val[v].toString()); 
               fld.classList.remove('featureVal');
            }
         }
      }
   }

   /* Compares squares w/ 3 possible values to squares w/ 2 possible values;  validates if there is a match of the 2 values;  params are arrays of square #s */
   xyzMatchTwoVals(array3, array2) { 
      var mat = []; 
      for (let i3 = 0; i3 < array3.length; i3++) { 
         for (let i2 = 0; i2 < array2.length; i2++) {
            var pvals = this.boxSquare[array2[i2]].getCurrPossibles();   // get possible values for 2-value square 
            if (this.boxSquare[array3[i3]].possible[pvals[0]] == 1  
                  && this.boxSquare[array3[i3]].possible[pvals[1]] == 1 )   {
               mat.push({ found: true, pivot: this.boxSquare[array3[i3]], cell2: this.boxSquare[array2[i2]], matvals: pvals }); 
            }
         }
      }
      return mat; 
   }

   /* finds a cell within a box that has exactly 2 possible values which match to the 2 parameters */
   getTwoValsMatch(params) { 
      for (let v = 0; v < this.SIZE; v++) {
         if (params.exclude.indexOf(v) > -1) continue; 
         if (this.boxSquare[v].solved > 0) continue; 
         if (this.boxSquare[v].getCurrPossibles().length != 2) continue; 
         if (this.boxSquare[v].possible[params.val1] == 1 && this.boxSquare[v].possible[params.val2] == 1) return v; 
      }
      return -1;  
   }

   //  Finds match to possible value for rows w/in a box (e.g. row 0 of box 2);  params are [1] row to check w/in box, [2] value, [3] cols to exclude in check  
   rowPossibles(rw, val, exclude) { 
      var sqrs = []; 
      for(let q = 0; q < this.SIZE; q++) { 
         if (this.boxSquare[q].row != rw) continue; 
         if (exclude.indexOf(this.boxSquare[q].row) > -1 ) continue; 
         if (this.boxSquare[q].possible[val] == 1) sqrs.push(q);  
      }
      return sqrs; 
   }

   //  Finds match to possible value for cols w/in a box (e.g. col 1 of box 6);  params are [1] col to check w/in box, [2] value, [3] rows to exclude in check  
   colPossibles(cl, val, exclude) { 
      var sqrs = []; 
      for(let q = 0; q < this.SIZE; q++) { 
         if (this.boxSquare[q].column != cl) continue; 
         if (exclude.indexOf(this.boxSquare[q].column) > -1 ) continue; 
         if (this.boxSquare[q].possible[val] == 1) sqrs.push(q);  
      }
      return sqrs; 
   }
}

export { Box as default }

