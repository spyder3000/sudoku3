import Square from './Square'; 
import Box from './Box'; 
import Row from './Row'; 
import Column from './Column'; 
import Diagonal from './Diagonal'; 
import Puzzle from './Puzzle'; 

const Creator = {
   createSquares: (obj) => {
      obj.squares = []; 
      for ( var qi = 0; qi < obj.SIZE; qi++ ) {
         obj.squares[qi] = []; 
      }
      for (let ii = 0; ii < obj.SIZE; ii++) {
         for (let jj = 0; jj < obj.SIZE; jj++) {
            obj.squares[ii][jj] = new Square( {row: ii, column: jj, size: obj.SIZE}); 
            obj.squares[ii][jj].solved = obj.grid[ii][jj]; 
            if (obj.squares[ii][jj].solved > 0) {
               if (obj.SIZE == 16) 	obj.squares[ii][jj].possible = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
               else  					   obj.squares[ii][jj].possible = [0,0,0,0,0,0,0,0,0]; 
            }
         }
      }
   }, 
   createBoxes: (obj) => {
      for (let i = 0; i < obj.SIZE; i++) {
          obj.boxes[i] = new Box({ size: obj.SIZE}); 
          obj.boxes[i].boxnum = i; 
      }
      for (let ii = 0; ii < obj.SIZE; ii++) {
         for (let jj = 0; jj < obj.SIZE; jj++) {
            obj.boxes[obj.squares[ii][jj].box].boxSquare.push(obj.squares[ii][jj]);   
         }
         for (let kk = 0; kk < obj.SIZE; kk++) {
            if (obj.SIZE == 9) obj.boxes[ii].valGrid[kk] = [0,1,2,3,4,5,6,7,8];       // will create 9 arrays for each box (corresponding to nums 1 thru 9) which will contain an array of all possible cells for that number  
            if (obj.SIZE == 16) obj.boxes[ii].valGrid[kk] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];       // will create 16 arrays for each box (corresponding to nums 1 thru 16) which will contain an array of all possible cells for that number  
         }
      }           
   }, 

   createRows: (obj) => {
      for (let i = 0; i < obj.SIZE; i++) {
         obj.rows[i] = new Row({ size: obj.SIZE} );  
         obj.rows[i].rownum = i; 
         for (let j = 0; j < obj.SIZE; j++) {
            obj.rows[i].rowSquare.push(obj.squares[i][j]); 
            if (obj.SIZE == 9) obj.rows[i].valGrid[j] = [0,1,2,3,4,5,6,7,8];  // will create 9 arrays for each row (corresponding to nums 1 thru 9) which will contain an array of all possible cells for that number  
            if (obj.SIZE == 16) obj.rows[i].valGrid[j] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];  // will create 16 arrays for each row (corresponding to nums 1 thru 16) which will contain an array of all possible cells for that number  
         }
      }       
   }, 

   createCols: (obj) => {
      for (let j = 0; j < obj.SIZE; j++) {
          obj.cols[j] = new Column({ size: obj.SIZE});  
          obj.cols[j].colnum = j; 
          for (let i = 0; i < obj.SIZE; i++) {
              obj.cols[j].colSquare.push(obj.squares[i][j]); 
              if (obj.SIZE == 9) obj.cols[j].valGrid[i] = [0,1,2,3,4,5,6,7,8];   // will create 9 arrays for each col (corresponding to nums 1 thru 9) which will contain an array of all possible cells for that number  
              if (obj.SIZE == 16) obj.cols[j].valGrid[i] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];  // will create 16 arrays for each row (corresponding to nums 1 thru 16) which will contain an array of all possible cells for that number  
          }
      }       
   },
   
   /* note: obj is only called for 4x4 grids */
   createDiagonals: (obj) => {
      obj.diags[0] = new Diagonal({ size: obj.SIZE}); 
      obj.diags[0].diagnum = 0; 
      obj.diags[1] = new Diagonal({ size: obj.SIZE}); 
      obj.diags[1].diagnum = 1; 
      
      for (let j = 0; j < obj.SIZE; j++) {
         for (let i = 0; i < obj.SIZE; i++) {
            if (i == j) { 
               obj.diags[0].diagSquare.push(obj.squares[i][j]); 
               obj.diags[0].valGrid[i] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
            }
            if (i + j == 15) { 
               obj.diags[1].diagSquare.push(obj.squares[i][j]); 
               obj.diags[1].valGrid[i] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
            }
         }
      }       
   }, 

   createPuzzle: (obj) => {
      obj.puzzle = new Puzzle(); 
      obj.puzzle.size = obj.SIZE; 
      obj.puzzle.boxes = obj.boxes; 
      obj.puzzle.cols = obj.cols; 
      obj.puzzle.rows = obj.rows; 
      for (let a = 0; a < obj.SIZE; a++) { 
         obj.puzzle.squares[a] = obj.squares[a]; 
      };   
      obj.puzzle.grid = obj.grid; 		// is obj needed?  is obj.grid updated throughout process to make obj valid??
      obj.puzzle.delay = obj.delay; 
      obj.puzzle.unsolved = obj.SIZE * obj.SIZE;       
   },

   sleep88: (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
   }
}

export { Creator as default }
