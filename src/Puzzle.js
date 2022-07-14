import Utils from './Utils'

class Puzzle {  
   constructor(options) {
      console.log('Puzzle constructor'); 
      this.unsolved = 81; 	// will be overwritten elsewhere as needed
      this.rows = []; 
      this.cols = []; 
      this.boxes = []; 
      this.squares = []; 
      this.grid = []; 
   }
}

export { Puzzle as default }

