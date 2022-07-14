class Misc {  
   constructor() { } 
   getBox(tsize) {
      // var bx = Misc.getBox(v,w,Math.sqrt(tsize)); 
      // var bxnum = Misc.getBoxSqNum(v,w,Math.sqrt(tsize)); 
      return 41; 
   }
   getBoxSqNum(tsize) {
      return 99; 
   }
   twoDigit(num) { 
      var x_2dig =  (num > 9) ? num.toString() : '0' + num.toString(); 
      return x_2dig; 
   }
}

export { Misc as default }