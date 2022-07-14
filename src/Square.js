import Utils from './Utils'

class Square {  
   constructor(options) {
      console.log('Square constructor'); 
      this.SIZE = options.size; 
      this.solved = 0;                // if > 0, this is final value of square
      this.solvable = this.SIZE;              // # of possible values for square 
      this.possible = [];     
      this.colReduce = this.SIZE;         // if paired with another cell in the column that has the same 2 values, this will be modified to 2 (so we don't do the same pairing over and over) 
      this.rowReduce = this.SIZE; 
      this.boxReduce = this.SIZE;  
      this.diagReduce = this.SIZE; 
      this.row = options.row; 
      this.column = options.column; 
      this.box = this.getBox(this.row, this.column, Math.sqrt(this.SIZE)); 
      this.boxsq = this.getBoxSqNum(this.row, this.column, Math.sqrt(this.SIZE));       
      this.diag = -1; 
      
      if (this.column == this.row) this.diag = 0; 		// indicates square is found on diag 0
      if (this.column + this.row == 15) this.diag = 1; 	// indicates square is found on diag 1
      
      for (let j = 0; j < this.SIZE; j++) { 
          this.possible[j] = 1;       // init each element in possible array to 1 (avail for number);     
      }
   }
   solveSquare(x, y, val) { 
      self = this; 
      if (!val) this.solved = getPossible(x,y);   //  no 'val' parameter means that there is only one possible value for this cell, find this via the 'possible' array
      else this.solved = val;                     //  value of cell is passed in  
  
      this.solvable = 0; 
      this.possible = [0,0,0,0,0,0,0,0,0]; 
      
      function getPossible (x, y) { 
          for (let w = 0; w < self.SIZE; w++) { 
              if (self.possible[w] == 1) return w + 1; 
          }
      }
   }
   getBox(x, y, sz) {
      if (x < sz)  return Math.floor(y / sz); 
      else if (x < sz * 2) return Math.floor(sz + (y / sz)); 
      else if (x < sz * 3) return Math.floor((2 * sz) + (y / sz)); 
      else return Math.floor((3 * sz) + (y / sz));  
   }

   getBoxSqNum(x, y, sz) {
      return (sz * (x % sz)) + (y % sz);  
   } 

   getCurrPossibles() { 
      var cp = []; 
      if (this.solved > 0) return cp; 
      for (let x = 0; x < this.SIZE; x++) { 
         if (this.possible[x] == 1) cp.push(x); 
      }
      return cp; 
   }

   featureRemovesExcept(vals) {
      for (let w = 1; w < 10; w++) {
         if (vals.indexOf(w) == -1) this.featureRemoves(w); 
      }
   }
   
   unfeatureRemovesExcept(vals) {
      for (let w = 1; w < 10; w++) {
         if (vals.indexOf(w) == -1) this.unfeatureRemoves(w); 
      }
   }

   featureRemoves(val, color) {
      if (!color) color = ''; 
      if (this.solved > 0) return; 
      var fld = document.getElementById("t"+ Utils.twoDigit(this.row) + Utils.twoDigit(this.column)).querySelector('.p_'+val.toString()); 
      if (fld.innerText > '')  fld.classList.add('featureVal'+color); 
   }

   unfeatureRemoves(val, color) {
      if (!color) color = ''; 
      if (this.solved > 0) return; 
      var fld = document.getElementById("t"+ Utils.twoDigit(this.row) + Utils.twoDigit(this.column)).querySelector('.p_'+val.toString()); 
      fld.classList.remove('featureVal'+color); 
   }

   featureCell() { 
      document.getElementById("t"+ Utils.twoDigit(this.row) + Utils.twoDigit(this.column)).classList.add('featureCell');  
   }
   
   unfeatureCell() { 
      document.getElementById("t"+ Utils.twoDigit(this.row) + Utils.twoDigit(this.column)).classList.remove('featureCell');  
   }         
}

export { Square as default }

