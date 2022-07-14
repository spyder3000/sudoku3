import Utils from './Utils'

class Row {  
   constructor(options) {
      console.log('Row constructor'); 
      this.SIZE = options.size; 
      this.unsolved = this.SIZE; 
      this.rowSquare = [];    // e.g. will be 9 squares
      this.valGrid = [];      // e.g. will be 9 arrays, 1 for each number (1 - 9) which will consist of an array of possible cells for that number 
   }

   getPairCells(typ) {    // typ will be 2 or 3 (to match for 2 possibles or 3 possibles);  e.g. for row 0, col 1 & 5 both have possible values of just 6 & 7  
      if (!typ) typ = 2; 
      var p0 = [];            // array of squares that have 2 (or 3 if typ = 3) possible values;  
      var val = [];           // values of 2 possibles 
      for (let r = 0; r < this.rowSquare.length; r++) { 
            if (this.rowSquare[r].solvable == typ  && this.rowSquare[r].rowReduce > typ  ) {     // finds all cells w/ exactly 2 possibilities that have not already been paired via previous processing
               p0.push(r); 
            }
      }
      if (p0.length < typ) return {found: 0}; 
          
      // match of both Possible values in 2 cells 
      for (let r = 0; r < p0.length; r++) { 
            for (let s = r + 1; s < p0.length; s++) { 
//                  if (this.rowSquare[p0[r]].possible == this.rowSquare[p0[s]].possible) {
               if (Utils.compareArray(this.rowSquare[p0[r]].possible, this.rowSquare[p0[s]].possible)) {
                  for (let x = 0; x < this.SIZE; x++) { 
                        if (this.rowSquare[p0[r]].possible[x] == 1)  val.push(x + 1); 
                  }
                  return {found: 1, sq: [p0[r], p0[s]], val: val}; 
               }
            }
      }
      return {found: 0}; 
   }



   getTrioCells(typ) {     // typ will be 2 or 3 (to match for 2 possibles or 3 possibles);  e.g. for row 0, col 1, 2 & 5 all have possible values of not more than 5, 6 & 7  
      if (!typ) typ = 3; 
      var p0 = [];            // array of squares that have 2 or 3 possible values;  
      var val = [];           // values of 3 possibles 
      for (let r = 0; r < this.rowSquare.length; r++) { 
         // finds all cells w/ exactly 2 or 3 possibilities that have not already been paired via previous processing
            if ((this.rowSquare[r].solvable == 3 || this.rowSquare[r].solvable == 2) && this.rowSquare[r].rowReduce > typ  ) {     
               p0.push(r); 
            }
      }
      if (p0.length < typ) return {found: 0}; 
          
      // match of 3 Possible values in 3 cells 
      for (let r = 0; r < p0.length -2; r++) { 
            for (let s = r + 1; s < p0.length -1; s++) { 
               for (let t = s + 1; t < p0.length; t++) { 
                  var ck = Utils.unionPossibles3(this.rowSquare[p0[r]].possible, this.rowSquare[p0[s]].possible, this.rowSquare[p0[t]].possible)
                  if (ck.found == 1 ) {
                     for (let x = 0; x < this.SIZE; x++) { 
                        if (this.rowSquare[p0[r]].possible[x] == 1  &&  val.indexOf(x + 1) < 0)  val.push(x + 1); 
                        if (this.rowSquare[p0[s]].possible[x] == 1  &&  val.indexOf(x + 1) < 0)  val.push(x + 1); 
                        if (this.rowSquare[p0[t]].possible[x] == 1  &&  val.indexOf(x + 1) < 0)  val.push(x + 1); 
                     }
                     val.sort(); 
                     return {found: 1, sq: [p0[r], p0[s], p0[t]], val: val}; 
                  }
               }
            }
      }
      return {found: 0}; 
   } 

   getOneValMatch(ary) {   
      var jv = []; 
      for (let e = 0; e < ary.length - 1; e++) {
         for (let f = e + 1; f < ary.length; f++) { 
            var c1 = this.rowSquare[ary[e]].getCurrPossibles(); 
            var c2 = this.rowSquare[ary[f]].getCurrPossibles();
            var m0 = Utils.oneMatch(c1,c2);   // compares 2 arrays to determine if they have exactly 1 value in common;  returns the array 1 unmatch, the array 2 unmatch, and the matched value
            ////  return { found: true, mat: a1[1], unmat1: a1[0], unmat2: a2[0] 
            if (m0.found) jv.push({row: this.rownum, col1: ary[e], col2: ary[f], mat: m0.mat, unmat1: m0.unmat1, unmat2: m0.unmat2 });   // unmat1 corresponds to the unmatched val in col1;  unmat2 to col2  
         }	
      }
      return jv; 
   }

   /* Params are col and value;  Need to update valGrid array for other numbers so that this cell is no longer included */
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
      var index = this.valGrid[val - 1].indexOf(idx); 			// gets valGrid index for number 5, corresponding to cell 1 (col 2)
      if (index > -1) this.valGrid[val - 1].splice(index, 1);  	// removes cell 1 from array for number 5 
   }      

   /* finds 2 vals that occur in just the same 2 cells;  all other values in those cells can be removed from possibles */
   getPairVals(typ) {    // typ will be 2 or 3 (to match for 2 possibles or 3 possibles);  e.g. for row 0, the value of 6 & the value of 7 exist only in col 1 & 4   
      for (let r = 0; r < this.SIZE - 1; r++) {			// e.g. vals 1 thru 8
         for (let s = r + 1; s < this.SIZE; s++) { 		// e.g. vals 2 thru 9
            if (this.valGrid[r].length != 2) continue; 
            if (this.valGrid[s].length != 2) continue; 
            if (Utils.compareArray(this.valGrid[r], this.valGrid[s]) && (this.rowSquare[this.valGrid[r][0]].solvable > 2 || this.rowSquare[this.valGrid[r][0]].solvable > 2) ) {
               return { found: true, cell1: this.valGrid[r][0], cell2: this.valGrid[r][1], val1: r, val2: s }; 
            }
         }
      }
      return { found: false}; 
   }

   // params are pvt (pivot square), matched2 (array of 2 vals matched), & excludebox (box to exclude from this check)
   getXyzPivotMatchRow(params)  {  // 3rd param is excludes box - do not match any cells in this box
      for (let r = 0; r < this.SIZE; r++) { 
         if (this.rowSquare[r].box == params.excludebox) continue; 
         if (this.rowSquare[r].solvable != 2) continue; 
         var p = params.pvt.getCurrPossibles(); 
         var n = this.rowSquare[r].getCurrPossibles(); 
         if (p.indexOf(n[0]) > -1 && p.indexOf(n[1]) > -1) { 
            var num = -1; 
            if (params.matched2.indexOf(n[0]) > -1) num = n[0]; 
            else if (params.matched2.indexOf(n[1]) > -1) num = n[1]; 
            return [{cell3: this.rowSquare[r], mat: num }]; 
         }
      }
      return []; 
   }

   featureRow(idx) { 
      // document.id("sudokutbl").getElement('tr.row'+this.rownum.toString()).addClass('featureRow'); 
      Utils.addClassElements('sudokutbl', 'tr.row'+this.rownum.toString(), 'featureRow'); 
   } 
   unfeatureRow(idx) { 
      // document.id("sudokutbl").getElement('tr.row'+this.rownum.toString()).removeClass('featureRow'); 
      Utils.removeClassElements('sudokutbl', 'tr.row'+this.rownum.toString(), 'featureRow'); 
   } 

   /* finds at least one possible value in the box that can be updated */
   findOnePoss(val, excludes) { 
      if (!excludes) excludes = []; 
      for (let w = 0; w < this.SIZE; w++) {			// w is squares
         if (excludes.indexOf(w) < 0) {				// skips squares in excludes array
            for (let v = 0; v < val.length; v++) {		// e.g. val is 1-9
               if (this.rowSquare[w].solved > 0) continue; 
               if (this.rowSquare[w].possible[val[v] - 1] == 1) return true; 
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
               if (this.rowSquare[w].solved > 0) continue; 
               var fld = document.getElementById("t"+ Utils.twoDigit(this.rownum) + Utils.twoDigit(w)).querySelector('.p_'+val[v].toString()); 
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
               if (this.rowSquare[w].solved > 0) continue; 
               var fld = document.getElementById("t"+ Utils.twoDigit(this.rownum) + Utils.twoDigit(w)).querySelector('.p_'+val[v].toString()); 
               fld.classList.remove('featureVal');
            }
         }
      }
   }

   /* finds a cell within a row that has exactly 2 possible values which match to the 2 parameters */
   getTwoValsMatch(params) { 
      for (let v = 0; v < this.SIZE; v++) {
         if (params.exclude.indexOf(v) > -1) continue; 
         if (this.rowSquare[v].solved > 0) continue; 
         if (this.rowSquare[v].getCurrPossibles().length != 2) continue; 
         if (this.rowSquare[v].possible[params.val1] == 1 && this.rowSquare[v].possible[params.val2] == 1) return v; 
      }
      return -1;  
   }

}

export { Row as default }

