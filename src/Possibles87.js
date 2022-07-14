import Utils from './Utils'

const Possibles = {
   init: (obj) => {
      console.log('Possibles init'); 
      // document.id('sudokutbl').getElements("table.possval1").dispose();  
      // var pjv01  = document.querySelectorAll("#sudokutbl table.possval1");  
      var pjv01  = document.getElementById("sudokutbl").querySelectorAll("table.possval1")
      for (let pt = 0; pt < pjv01.length; pt++) pjv01[pt].remove(); 

      // document.id('sudokutbl').getElements("table.possval2").dispose();  
      // var pjv01  = document.querySelectorAll("#sudokutbl table.possval2");  
      var pjv01  = document.getElementById("sudokutbl").querySelectorAll("table.possval2")
      for (let pt = 0; pt < pjv01.length; pt++) pjv01[pt].remove(); 

      console.log('Possibles constructor size = ' + obj.SIZE); 
      var i; var j; 
      for (i = 0; i < obj.SIZE; i++) {
         for (j = 0; j < obj.SIZE; j++) {
            if (obj.grid[i][j] == 0) { 
               if (obj.SIZE == 9) {
                  // obj.ui.poss.clone().inject(document.id("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).getElement("span.sqnum"), 'after');  
                  let tmp = obj.ui.poss.cloneNode(true); 
                  let tmp2 = document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector(" span.sqnum"); 
                  tmp2.parentNode.insertBefore(tmp, tmp2.nextSibling);  // where tmp2 is the node you want to insert after
               }
               // else ui.poss2.clone().inject(document.id("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).getElement("span.sqnum"), 'after'); 
            }
         }
      }
      // Utils.hidePossibles(); 
   },  
   // async modAllPossibles() { 
   modAllPossibles: (obj) => {    
      console.log('modAllPossibles'); 
      // obj = this; 
      for (let i = 0; i < obj.SIZE; i++) {
         for (let j = 0; j < obj.SIZE; j++) {
            if (obj.grid[i][j] > 0) { 
               Possibles.modPossible(i, j, obj.grid[i][j], obj);  
            }
         }
      }       
      //  (function() { 
      //     obj.nextStep(0, "end");  
      //  }).delay(obj.getDelay('dflt'));        
   }, 

   modPossible: (x, y, val, obj) => {
      console.log('modPossible called'); 
      Possibles.modPossibleRow(x,val); 
      Possibles.modPossibleCol(y,val);
      Possibles.modPossibleBox(obj.squares[x][y].box,val);     
      if (obj.SIZE == 16 && obj.squares[x][y].diag >= 0) Possibles.modPossibleDiag(obj.squares[x][y].diag,val); 
   }, 

   modPossibleRow: function(x, val, exclude) { 
      if (!exclude) exclude = [];
      // remove value from possible array for all other squares in row 
      for (jj = 0; jj < this.SIZE; jj++) {
          if (exclude.indexOf(jj) >= 0) continue; 
          if (this.grid[x][jj] == 0) {
              this.removePossible(x, jj, val);  
          }
      }           
   },

   hidePossibles: () => { 
      // document.id('sudokutbl').getElements('table.possval').hide();
      Utils.hideIdClass('sudokutbl', 'table.possval'); 
   }, 
   showPossibles: () => { 
      // document.id('sudokutbl').getElements('table.possval').show();
      Utils.showIdClass('sudokutbl', 'table.possval'); 
   }
}

export { Possibles as default }

