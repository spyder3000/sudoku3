const Validator = {
   checkValid: (tgrid) => {
      for (let x = 0; x < tgrid.length; x++) {	// typically 0 thru 8
         for (let y = 0; y < tgrid.length; y++) {    		// typically 0 thru 8
            if (tgrid[x][y] > 0 && (Validator.sameSquare(x, y, tgrid[x][y], tgrid) || Validator.sameRow(x, y, tgrid[x][y], tgrid) || Validator.sameColumn(x, y, tgrid[x][y], tgrid)) ) {
               return 0;   // invalid
               break; 
            }
         }
      }
      return 1;       
   },

   sameRow: (x, y, num, tgrid) => {
      for (let i = 0; i < tgrid.length; i++) {			// typically 0 thru 8
         if (tgrid[x][i] == num && i != y) { 
            return 1; 
         }
      }
      return 0; 
   },

   sameColumn: (x, y, num, tgrid) => { 
      for (let i = 0; i < tgrid.length; i++) {			// typically 0 thru 8
         if (tgrid[i][y] == num && i != x) { 
            return 1; 
         }
      }
      return 0; 
   },

   sameSquare: (x, y, num, tgrid) => { 
      var savx = x; 
      var savy = y; 
      var sqLimit = Math.sqrt(tgrid.length);   // typically 3
      if (x < sqLimit) { 
         x = 0; 
      }
      else if (x < (sqLimit * 2)) { 		// typically < 6
         x = sqLimit; 					// typically 3 
      }
      else if (x < (sqLimit * 3)) { 		// typically < 9
         x = sqLimit * 2; 					// typically 6 
      }		
      else { x = sqLimit * 3; }			// only executed for 4x4;  will = 12
   
      if (y < sqLimit) { 
         y = 0; 
      }
      else if (y < (sqLimit * 2)) { 		// typically < 6
         y = sqLimit; 					// typically 3
      }
      else if (y < (sqLimit * 3)) { 		// typically < 9
         y = sqLimit * 2; 					// typically 6 
      }		
      else { y = sqLimit * 3; }			// only executed for 4x4;  will = 12
   
      var i; var j; 
      // checks the (typically 3 x 3) box if this number occurs already 
      for (i = x; i < x +sqLimit; i++) {
         for (j = y; j < y+sqLimit; j++) {
            if (tgrid[i][j] == num && i !=savx  && j != savy) { 
               return 1; 
            }
         }
      }
      return 0; 
   }

}
export { Validator as default }

// export { checkValid, sameColumn, sameRow, sameSquare }