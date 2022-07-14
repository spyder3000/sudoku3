const Delay = {
   init: () => { 
      return {
         step0: 500, 
         step1: 1000, 
         step2: 2000, 
         step3: 2000, 
         step4: 2500, 
         delay0: 500, 
         delay1: 1000, 
         delay2: 2000, 
         delay3: 2000, 
         delay4: 2500, 
         poss:  1000, 
         dflt:  500, 
         mult:  1
      }
   },  


   getDelay: (step, noprogress, params) => {  //}  twoClick_active, confirm_needed, showfails, ) {
      var keepDelay = true; 
      if (noprogress && noprogress == 1) keepDelay = false; 
      
      var del = 50; 
      if (params.twoClick_active == 1) return del; 
      if (params.confirm_needed == 1 && step != 'step0' && step != 'step1' && step != 'poss') return del; 
      
      switch (step) { 
         case 'step0':
            if (params.showFails || keepDelay) 
               del = params.delay.step0 * params.delay.mult; 
            break; 
         case 'step1': 
            if (params.showFails || keepDelay) 
               del = params.delay.step1 * params.delay.mult; 
            break; 
         case 'step2': 
            if (params.showFails || keepDelay) 
               del = params.delay.step2 * params.delay.mult; 
            break; 
         case 'step3': 
            if (params.showFails || keepDelay) 
               del = params.delay.step3 * params.delay.mult; 
            break; 
         case 'step4': 
            if (params.showFails || keepDelay) 
               del = params.delay.step4 * params.delay.mult; 
            break; 
         case 'poss': 
            if (params.showFails || keepDelay) 
               del = params.delay.poss * params.delay.mult; 
            break; 
         case 'dflt': 
            if (params.showFails || keepDelay) 
               del = params.delay.dflt * params.delay.mult; 
            break;     
         default: 
            if (params.showFails || keepDelay) 
               del = params.delay.dflt * params.delay.mult; 
      }
      return del; 
   }, 
   sleep: (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
      // return new Promise((resolve, reject) => {    // myPromise is instance of Promise
      //    setTimeout(() => {
      //    }, num)
      // })
   }
}

export { Delay as default }
