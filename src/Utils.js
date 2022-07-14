const Utils = {
   copyGridShallow: (orig) => {
      let cpy = []; 
		for (var u = 0; u < orig.length; u++)       // makes shallow copy of grid array 
			cpy[u] = orig[u].slice();  
      return cpy; 
   },
 
   closestParent: (el, selector, stopSelector) => {
      var retval = null;
      while (el) {
        if (el.matches(selector)) {
          retval = el;
          break
        } else if (stopSelector && el.matches(stopSelector)) {
          break
        }
        el = el.parentElement;
      }
      return retval;
   }, 

   clearMsgs: () => {
      document.getElementById("progress_msg").innerText = '';    
      document.getElementById("progress_msg2").innerText = '';
      document.getElementById("mult_solutions_msg").innerText = '';
   },

   resetButtons: () => {
      document.getElementById('btn_solve').disabled = false; 
      document.getElementById('btn_manual').disabled = false; 
      document.getElementById('btn_auto').disabled = false; 
      document.getElementById('btn_next').style.visibility = 'hidden';
      document.getElementById('btn_pause').style.visibility = 'hidden';
      document.getElementById('btn_refresh').style.visibility = 'hidden';
      document.getElementById("mult_solutions_msg").innerText = ''; 
      document.getElementById('btn_pause').innerText = 'Pause';  
   },

   afterSolveResetButtons: (solved) => {
      if (solved) {
         document.getElementById("btn_solve").disabled = true; 
         document.getElementById('btn_refresh').style.visibility = 'visible';
         document.getElementById('btn_manual').disabled = true; 
         document.getElementById('btn_auto').disabled = true;    
         document.getElementById('btn_next').style.visibility = 'hidden';
         document.getElementById('btn_pause').style.visibility = 'hidden';
         document.getElementById('btn_pause').innerText = 'Pause';
      }
      else { 
         document.getElementById("btn_solve").disabled = false; 
         document.getElementById('btn_refresh').style.visibility = 'hidden';
         document.getElementById('btn_manual').disabled = false; 
         document.getElementById('btn_auto').disabled = false;  
      }
   }, 

   hideIdClass: (zid, zclass) => {
      document.getElementById(zid).querySelectorAll(zclass).forEach(function(el) {
         el.style.display = 'none'; 
      });
   },

   showIdClass: (zid, zclass) => {
      document.getElementById(zid).querySelectorAll(zclass).forEach(function(el) {
         el.style.display = 'block'; 
      });
   },

   removeClassElements: (zid, zclass, modclass) => {
      document.getElementById(zid).querySelectorAll(zclass).forEach(function(el) {
         el.classList.remove(modclass);
      });
   }, 

   addClassElements: (zid, zclass, modclass) => {
      document.getElementById(zid).querySelectorAll(zclass).forEach(function(el) {
         el.classList.add(modclass);
      });
   }, 

   //mod  use hidePossibles & showPossibles in Possibles.js instead??
   hidePossibles: () => { 
      document.getElementById('sudokutbl').querySelectorAll('table.possval').forEach(function(el) {
         el.style.display = 'none'; 
      });
   },

   showPossibles: () => { 
      document.getElementById('sudokutbl').querySelectorAll('table.possval').forEach(function(el) {
         el.style.display = 'block'; 
      });
   },
 
   hide: (el) => {
      document.getElementById(el).style.display = 'none'; 
   },
   show: (el, inlineInd) => {
      document.getElementById(el).style.display = (inlineInd) ? 'inline-block' : 'block'; 
   },

   featureNums: (i,j,ary) => { 
      for (let a = 0; a < ary.length; a++) {
         Utils.featureNum(i,j,ary[a]);  
      }
   },         

   featureNum: (i,j,num) => { 
      document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('.p_'+num.toString()).classList.add('featureNum'); 
   }, 

   unfeatureNums: (i,j,ary) => { 
      for (let a = 0; a < ary.length; a++) {
         Utils.unfeatureNum(i,j,ary[a]);  
      }
   },          
   
   unfeatureNum: (i,j,num) => { 
      document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('.p_'+num.toString()).classList.remove('featureNum'); 
   }, 


   /* click2 indicates if this was called while this.twoClick_active == 1 (indicates 2-click mode) */
   freezePage: (click2) => { 
      if (click2 == 1) { 
         Utils.show("btn_go2", "inline"); 
         Utils.hide("btn_next"); 
         document.getElementById("md1").disabled=true;
      }
      else { 
         Utils.show("proceed_section"); 
      }
      document.getElementById("btn_solve").disabled = true; 
      document.getElementById('btn_refresh').disabled = true; 
      document.getElementById('btn_manual').disabled = true; 
      document.getElementById('btn_auto').disabled = true;  
      document.getElementById('btn_next').disabled = true;  
      document.getElementById('btn_pause').disabled = true;  
   }, 

   unfreezePage: (obj) => { 
      console.log('unFreezePage'); 
      var click2 = obj.twoClick_active; 
      if (click2 == 1) { 
         Utils.hide("btn_go2"); 
         Utils.show("btn_next", "inline"); 
         document.getElementById("md1").disabled = false; 				
      }
      else { 
         Utils.hide("proceed_section"); 
      }			
      document.getElementById("btn_solve").disabled = false; 
      document.getElementById('btn_refresh').disabled = false; 
      if (obj.autoMode != 1) document.getElementById('btn_auto').disabled = false;  
      document.getElementById('btn_next').disabled = false;  
      document.getElementById('btn_pause').disabled = false; 
      document.getElementById('choose_puzzle').disabled = false; 
   }, 

   removeListeners: (cback) => {
      document.getElementById("btn_go").removeEventListener("click", cback); 
      document.getElementById("btn_go2").removeEventListener("click", cback); 
   },

   addListeners: (cback) => {
      document.getElementById("btn_go").addEventListener("click", cback); 
      document.getElementById("btn_go2").addEventListener("click", cback); 
   },

   twoDigit: (num) =>  {
      var x_2dig =  (num > 9) ? num.toString() : '0' + num.toString(); 
      return x_2dig; 
   },

   totNums: (ary, sz) => {
      var cnt = 0; 
      for (let r = 0; r < sz; r++) {
         for (let c = 0; c < sz; c++) {
            if (ary[r][c] > 0) cnt++; 
         }
      }
      return cnt; 
   },

   // compares 2 arrays (w/ exactly 2 elements) to determine if they have exactly 1 value in common;  the matched value,  the array 1 unmatch, & the array 2 unmatch  
   oneMatch: (a1, a2) => {
      let mat = {found: false}; 
      if (a1[0] == a2[0] && a1[1] == a2[1])  return mat;  
      if (a1[0] == a2[0]) return { found: true, mat: a1[0], unmat1: a1[1], unmat2: a2[1] };  
         if (a1[0] == a2[1]) return { found: true, mat: a1[0], unmat1: a1[1], unmat2: a2[0] };  
         if (a1[1] == a2[0]) return { found: true, mat: a1[1], unmat1: a1[0], unmat2: a2[1] };  
      if (a1[1] == a2[1]) return { found: true, mat: a1[1], unmat1: a1[0], unmat2: a2[0] };  
      return mat; 
   }, 

   getSquaresForRow: (x) => { 
      if (x % 3 == 0) return [0,1,2]; 
      if (x % 3 == 1) return [3,4,5]; 
      return [6,7,8]; 
   }, 

   getSquaresForCol: (x) => { 
      if (x % 3 == 0) return [0,3,6]; 
      if (x % 3 == 1) return [1,4,7]; 
      return [2,5,8]; 
   }, 

   convert_ccrrbb: (ary) => { 
      var ret = [];
      for (let i = 0; i < ary.length; i++) { 
         ret.push({ row: parseInt(ary[i].substring(0,2)), col: parseInt(ary[i].substring(2,4)), box: parseInt(ary[i].substring(4,6)) }); 
      }
      return ret; 
   }, 

   /* fld is in format rowcol-value e.g. 0101-09   (e.g. 0-8 for row & col; 1-9 for value */
   convert_ccrrvv: (fld) => { 
      return { row: parseInt(fld.substring(0,2)), col: parseInt(fld.substring(2,4)), val: parseInt(fld.substring(5,7)) }; 
   }, 

   compareArrays: (array1, array2, sz)  => { 
      var allsame = 1; 
      for (let aa = 0; aa < sz;  aa++) {
         if (!Utils.compareArray(array1[aa], array2[aa]))  {
            return false; 
            break; 
         }
      }
      return true; 
   },

   /* compares if 2 1-dimensional arrays are identical */
   compareArray: (array1, array2) => {
        var is_same = (array1.length == array2.length) && array1.every(function(element, index) {
            return element === array2[index]; 
        });
        return is_same; 
   }, 

   // compares possible arrays from 3 cells and determines if these have a combined 3 values
   unionPossibles3: (a1, a2, a3) => { 
      // var t = Array.clone(a1); 
      var t = a1.map((x) => x);     // shallow copy of array
      for (let u = 0; u < t.length; u++) {
            t[u] = Math.max(t[u], a2[u], a3[u]);  
      }
      var fnd = []; 
      for (let u = 0; u < t.length; u++) {
         if (t[u] == 1)  fnd.push(u);
      }
      if (fnd.length == 3)  return { found: 1, vals: fnd }; 
      else return { found: 0}; 
   },

   getBox: (x, y, sz) => {
      if (x < sz)  return Math.floor(y / sz); 
      else if (x < sz * 2) return Math.floor(sz + (y / sz)); 
      else if (x < sz * 3) return Math.floor((2 * sz) + (y / sz)); 
      else return Math.floor((3 * sz) + (y / sz));  
   },

   getBoxSqNum: (x, y, sz) => {
      return (sz * (x % sz)) + (y % sz);  
   } 
}

/*export { copyGridShallow, clearMsgs, resetButtons, afterSolveResetButtons, hideIdClass, showIdClass, hidePossibles, showPossibles, 
            twoDigit, totNums, compareArrays, compareArray, getBox, getBoxSqNum, unionPossibles3 }  */
export { Utils as default }
