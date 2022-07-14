import Utils from './Utils'
import Delay from './Delay'; 

class Possibles {  
   constructor(obj) {
      console.log('Possibles constructor'); 
      this.obj = obj; 
      this.init(); 
   }

   init() { 
      var pjv01  = document.getElementById("sudokutbl").querySelectorAll("table.possval1")
      for (let pt = 0; pt < pjv01.length; pt++) pjv01[pt].remove(); 

      var pjv01  = document.getElementById("sudokutbl").querySelectorAll("table.possval2")
      for (let pt = 0; pt < pjv01.length; pt++) pjv01[pt].remove(); 

      console.log('Possibles init size = ' + this.obj.SIZE); 
      var i; var j; 
      for (i = 0; i < this.obj.SIZE; i++) {
         for (j = 0; j < this.obj.SIZE; j++) {
            if (this.obj.grid[i][j] == 0) { 
               if (this.obj.SIZE == 9) {
                  // self.ui.poss.clone().inject(document.id("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).getElement("span.sqnum"), 'after');  
                  let tmp = this.obj.ui.poss.cloneNode(true); 
                  // document.querySelector("#t" + Utils.twoDigit(i) + Utils.twoDigit(j) + " span.sqnum").appendChild(tmp);  
                  let tmp2 = document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector(" span.sqnum"); 
                  tmp2.parentNode.insertBefore(tmp, tmp2.nextSibling);  // where tmp2 is the node you want to insert after
                  // console.log("#t" + Utils.twoDigit(i) + Utils.twoDigit(j) + " span.sqnum"); 
                  // console.log(tmp); 
               }
               else {
                  // ui.poss2.clone().inject(document.id("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).getElement("span.sqnum"), 'after'); 
                  let tmp = this.obj.ui.poss2.cloneNode(true); 
                  let tmp2 = document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector(" span.sqnum"); 
                  tmp2.parentNode.insertBefore(tmp, tmp2.nextSibling);  // where tmp2 is the node you want to insert after
               }
            }
         }
      }      
      this.hidePossibles(); 
   } 

   // async modAllPossibles() { 
   modAllPossibles() {    
      console.log('modAllPossibles'); 
      for (let i = 0; i < this.obj.SIZE; i++) {
         for (let j = 0; j < this.obj.SIZE; j++) {
            if (this.obj.grid[i][j] > 0) { 
               this.modPossible(i, j, this.obj.grid[i][j]);  
            }
         }
      }           
   }

   modPossible(x, y, val) {
      console.log('modPossible called'); 
      this.modPossibleRow(x,val); 
      this.modPossibleCol(y,val);
      this.modPossibleBox(this.obj.squares[x][y].box,val);     
      if (this.obj.SIZE == 16 && this.obj.squares[x][y].diag >= 0) this.modPossibleDiag(this.obj.squares[x][y].diag,val); 
   }

   modPossibleRow(x, val, exclude) { 
      if (!exclude) exclude = [];
      // remove value from possible array for all other squares in row 
      for (let jj = 0; jj < this.obj.SIZE; jj++) {
          if (exclude.indexOf(jj) >= 0) continue; 
          if (this.obj.grid[x][jj] == 0) {
              this.removePossible(x, jj, val);  
          }
      }           
   }

   modPossibleCol(y, val, exclude) { 
      if (!exclude) exclude = []; 
      // remove value from possible array for all other squares in column
      for (let ii = 0; ii < this.obj.SIZE; ii++) {
         if (exclude.indexOf(ii)  >= 0) continue; 
         if (this.obj.grid[ii][y] == 0) {
              this.removePossible(ii, y, val);  
         }
      }               
   }

   modPossibleBox(bx, val, exclude) { 
      if (!exclude) exclude = []; 
      // remove value from possible array for all other squares in box
      for(let bb = 0; bb < this.obj.SIZE; bb++) { 
         if (exclude.indexOf(bb)  >= 0) continue; 
         var cell = this.obj.boxes[bx].boxSquare[bb]; 
          //if (cell.solved == 0) {
         if (this.obj.grid[cell.row][cell.column] == 0) {
            this.removePossible(cell.row, cell.column, val);  
         }
      }           
   }
   
   modPossibleDiag(dline, val, exclude) { 
      if (!exclude) exclude = []; 
      // remove value from possible array for all other squares in box
      for(let bb = 0; bb < this.obj.SIZE; bb++) { 
         if (exclude.indexOf(bb)  >= 0) continue; 
         var cell = this.obj.diags[dline].diagSquare[bb]; 
         //if (cell.solved == 0) {
         if (this.obj.grid[cell.row][cell.column] == 0) {
            this.removePossible(cell.row, cell.column, val);  
         }
      }           
   }
   
   async modPossibleFeature(x, y, val) { 
      self = this; 
      document.getElementById("t"+ Utils.twoDigit(x) + Utils.twoDigit(y)).classList.add('featureCell2');  
      this.obj.rows[x].featureRow(); 
      document.getElementById("progress_msg2").innerText = 'Update Possible values';  
      this.obj.rows[x].featureRemoves([val], [y]);   // params are value to remove & col to ignore

      // Delay 1 -- rows
      let delayVal = Delay.getDelay('poss', null, this.obj.params); 
      console.log('delay2 = ' + delayVal); 
      await Delay.sleep(delayVal); 
      this.modPossibleRow(x,val);
      this.obj.rows[x].unfeatureRow(); 
      this.obj.rows[x].unfeatureRemoves([val], [y]);   // params are value to remove & col to ignore
      this.obj.cols[y].featureCol(); 
      this.obj.cols[y].featureRemoves([val], [x]);   // params are value to remove & row to ignore

      // Delay 2 -- cols
      await Delay.sleep(delayVal); 
      this.modPossibleCol(y,val);
      this.obj.cols[y].unfeatureCol(); 
      this.obj.cols[y].unfeatureRemoves([val], [x]);   // params are value to remove & row to ignore
      this.obj.boxes[this.obj.squares[x][y].box].featureBox(); 
      this.obj.boxes[this.obj.squares[x][y].box].featureRemoves([val], [this.obj.squares[x][y].boxsq]);   // params are value to remove & cell to ignore

      // Delay 3 -- boxes 
      await Delay.sleep(delayVal); 
      this.modPossibleBox(this.obj.squares[x][y].box,val);
      this.obj.boxes[this.obj.squares[x][y].box].unfeatureBox(); 
      this.obj.boxes[this.obj.squares[x][y].box].unfeatureRemoves([val], [this.obj.squares[x][y].boxsq]);   // params are value to remove & cell to ignore
      
      // Delay 4 -- diagonals (optional) 
      
      if (this.obj.SIZE == 16 && (this.obj.squares[x][y].diag >= 0)) {
         var tmpDiag = this.obj.squares[x][y].diag; 
         this.obj.diags[tmpDiag].featureDiag(); 
//w                    document.id("progress_msg").set('text', 'Update Possible values in Box');  
         this.obj.diags[tmpDiag].featureRemoves([val], [x]);   // params are value to remove & cell to ignore
         await Delay.sleep(delayVal); 
         this.modPossibleDiag(tmpDiag,val);
         this.obj.diags[tmpDiag].unfeatureDiag(); 
         this.obj.diags[tmpDiag].unfeatureRemoves([val], [x]);   // params are value to remove & cell to ignore
         document.getElementById("t"+Utils.twoDigit(x) + Utils.twoDigit(y)).classList.remove('featureCell2'); 
         Utils.clearMsgs(); 
         if (this.obj.params.autoMode == 0)  document.getElementById('btn_next').style.visibility = 'visible';   
         // this.obj.nextStep('0', 'end');
      }
      else {
         document.getElementById("t"+Utils.twoDigit(x) + Utils.twoDigit(y)).classList.remove('featureCell2'); 
         Utils.clearMsgs(); 
         if (this.obj.params.autoMode == 0)  document.getElementById('btn_next').style.visibility = 'visible';   
         // this.obj.nextStep('0', 'end'); 
      } 
   }

   removePossible(x, y, val) { 
      if (this.obj.squares[x][y].possible[val - 1] == 1) {        // val - 1 due to 0-based array 
         this.obj.squares[x][y].possible[val - 1] = 0;
         this.obj.squares[x][y].solvable--;
         //jv -- add logic to modify valGrid arrays;  
         document.getElementById("t"+Utils.twoDigit(x) + Utils.twoDigit(y)).querySelector("td.p_"+val.toString()).innerText = '';  
         if (this.obj.initMode == 0) this.obj.modValGridCell(x,y,val);   // skip this if in Init mode;  valGrid setup is handled via initValGrid function 
      }
   } 

   removePossibleExcept(x, y, vals) { 
      for (let w = 1; w < this.obj.SIZE + 1; w++) {	// typically < 10 
         if (vals.indexOf(w) == -1) this.removePossible(x,y,w); 
      }
   }

   hidePossibles() { 
      // document.id('sudokutbl').getElements('table.possval').hide();
      Utils.hideIdClass('sudokutbl', 'table.possval'); 
   }
   showPossibles() { 
      // document.id('sudokutbl').getElements('table.possval').show();
      Utils.showIdClass('sudokutbl', 'table.possval'); 
   }

}

export { Possibles as default }

