import Utils from './Utils'
// import {getGridPuzzle, getGridSolution} from './Grids'
import Grids from './Grids';
import Possibles from './Possibles'; 
import Solver from './Solver'; 
import Delay from './Delay'; 
import Square from './Square'; 
import Creator from './Creator'; 
import Path from './Path'; 
import WorkGrid from './WorkGrid'; 
import Validator from './Validator'; 

class SudokuWin {  
    constructor(size) {
        this.debugger = []; 
        this.SIZE = 9;              // default size is 9x9
        this.options =  {  
            row: { id: '' },
            width: 600, 
            SIZE_ROWS: 9, 
            SIZE_COLUMNS: 9
            // callback: Function.from()               // Function.from() does not exist;  but a value for callback is needed here 
        }; 
        /*   Global variables section  */      
        this.ui = {};
        this.grid = null; this.grid0 = null; this.grid20 = null; this.grid40 = null; this.grid60 = null; 
        this.tmpgrid = []; 
        //    var unsolved = 81; 
        this.puzzleSolved = 0; 
        this.puzzleFail = 0; 
        this.puzzleEntry = 0;    // indicates this is a user-entered puzzle 
        this.puzzleValid = 1;    // puzzle setup is valid indicator
        this.deadend = 0;        // value of 1 indicates that the incremental solve cannot be continued

        console.log('constructor logic'); 
        this.createHtml(this.SIZE); 
        this.defineUI();  
        this.initGrid();  
        this.getGrid(0);    // default to first puzzle  	// 1000 for 4x4 default
        this.readyGrid(); 	// populates tmpgrid & sets HTML for puzzle
    } 
    createHtml(tsize) {
        // document.getElementById('sudokutbl').getElementsByTagName("tbody").remove();  
        var tjv01  = document.querySelectorAll("#sudokutbl tbody");  
        for (let tt = 0; tt < tjv01.length; tt++) tjv01[tt].remove(); 

        var tbody = document.createElement('tbody'); 
        document.querySelector("#sudokutbl").appendChild(tbody); 

        for (let v = 0; v < tsize; v++) { 
            var row = document.createElement('tr');  
            row.className = 'row row'+v.toString(); 
            tbody.appendChild(row);   
            var v_2dig = (v > 9) ? v.toString() : '0' + v.toString(); 
            for (let w = 0; w < tsize; w++) { 
                var bx = Utils.getBox(v,w,Math.sqrt(tsize)); 
                var bxnum = Utils.getBoxSqNum(v,w,Math.sqrt(tsize)); 
                // console.log('AA 100 - bx = ' + bx + '; bxnum = ' + bxnum ); 
                var w_2dig = (w > 9) ? w.toString() : '0' + w.toString(); 
                var sq = document.createElement('td'); 
                sq.setAttribute('id', 't' + v_2dig + w_2dig);  
                sq.className = 'square row'+v.toString() + ' r' + w.toString() + ' col' +w.toString() + ' c' + v.toString() + ' box' + bx.toString() + ' b' +bxnum.toString(); 
                // console.log(sq); 
                row.appendChild(sq); 
                if ( v > 0 && ((v + 1) % Math.sqrt(tsize) == 0)) sq.className += ' rowborder';  
                if ( w > 0 && ((w + 1) % Math.sqrt(tsize) == 0)) sq.className += ' colborder';  
                if (tsize == 16) { 
                    if ( w == v) {
                        sq.className += ' diag0';  
                        sq.className += ' d'+v.toString(); 
                    }
                    if ( w + v == 15) {
                        sq.className += ' diag1';  
                        sq.className += ' d'+v.toString(); 
                    }
                }
                var dv = document.createElement('div'); 
                dv.className = 'sqdisp';
                sq.appendChild(dv);  

                var sp = document.createElement('span'); 
                sp.className = 'sqnum';
                dv.appendChild(sp);  

                var ip = document.createElement('input'); 
                ip.className = 'insq';
                Object.assign(ip, {
                    type: 'text', 
                    size: '1', 
                    maxLength: '1', 
                    name: 's' + v.toString() + w.toString()
                })
                dv.appendChild(ip);  
            }
        }
    }

    defineUI() {          
        document.getElementById("btn_solve").addEventListener('click', ev => this.solveButton(ev));  
        document.getElementById("btn_auto").addEventListener('click', ev => this.autoButton(ev));   
        document.getElementById("btn_manual").addEventListener('click', ev => this.manualButton(ev));   
        document.getElementById("btn_next").addEventListener('click',  ev => this.nextButton(ev)); 
        document.getElementById("btn_pause").addEventListener('click', ev => this.pauseButton(ev)); 
        document.getElementById("btn_refresh").addEventListener('click', ev => this.refreshButton(ev)); 
        document.getElementById("btn_clear").addEventListener('click',  ev => this.clearButton(ev));      // where?
        document.getElementById("choose_puzzle").addEventListener('change', ev => this.changePuzzle(ev));  
        document.getElementById("auto_delay").addEventListener('click', ev => this.changeDelay(ev));  
        // document.getElementById("manual_delay").addEventListener('click', ev => this.changeManualDelay(ev));   // where?
        document.getElementById("confirm_step").addEventListener('click', ev => this.changeConfirm(ev));      

        var container = document.getElementById("sudokutbl"); 
        container.onkeyup = function(e) {
            var target = e.srcElement || e.target;
            var maxLength = parseInt(target.attributes["maxlength"].value);
            var myLength = target.value.length;

            /* Tab Key */
            if(e.keyCode == 9 || e.keyCode88 == 38 || e.keyCode88 == 40)  {  // 37 (left), 39 (right), 9 (tab)  
                target.focus();  
                  target.select(); 
                  return; 
            }
            /* left Arrow */
            if (e.keyCode == 37) {
                var prev = target;
                // if (prev.getParent("td.square").previousElementSibling)
                //     prev = prev.getParent("td.square").previousElementSibling.getElement('input.insq');  
                // else if (prev.getParent("tr.row").previousElementSibling) 
                //     prev = prev.getParent("tr.row").previousElementSibling.getElement('input.insq');
                if (Utils.closestParent(prev, "td.square").previousElementSibling)
                    prev = Utils.closestParent(prev, "td.square").previousElementSibling.querySelector('input.insq');  
                else if (Utils.closestParent(prev, "tr.row").previousElementSibling) 
                    prev = Utils.closestParent(prev, "tr.row").previousElementSibling.querySelector('input.insq');
                else return; 
                prev.focus();  
                prev.select(); 
            }   
            /* data entered OR Right Arrow */
            else if (myLength >= maxLength || e.keyCode == 39) {
                var next = target;              
                // if (next.getParent("td.square").nextElementSibling)
                //     next = next.getParent("td.square").nextElementSibling.getElement('input.insq');  
                // else if (next.getParent("tr.row").nextElementSibling) 
                //     next = next.getParent("tr.row").nextElementSibling.getElement('input.insq');
                if (Utils.closestParent(next, "td.square").nextElementSibling)
                    next = Utils.closestParent(next, "td.square").nextElementSibling.querySelector('input.insq');  
                else if (Utils.closestParent(next, "tr.row").nextElementSibling) 
                    next = Utils.closestParent(next, "tr.row").nextElementSibling.querySelector('input.insq');
                else return; 
                next.focus();  
                next.select(); 
            }   		
        }

        document.getElementById("proceed_section").style.display = 'none';
        document.getElementById('btn_go2').style.display = 'none';
        document.getElementById('btn_clear').style.visibility = 'visible';
    }

    initGrid(puzz) { 
        this.params = {
            twoClick_active:  0, 
            autoMode: 0, 
            confirm_needed:  0, 
            showFails: false,       // OBSOLETE
            delay:  Delay.init()
        }; 
        // this.confirm_needed = 0;
        this.unsolved = this.SIZE * this.SIZE;  // 81 
        this.initMode = 1; 
        this.started = 0; 
        // this.autoMode = 0; 
        // this.twoClick_active = 0; 
        this.grid = []; 
        this.tmpgrid = []; 
        this.tmpgrid2 = []; 
        this.keepGrid = [];     	// copy of grid prior to any changes (stored upon clicking Solve, Auto, or Manual buttons) 
        this.boxes = []; 
        this.diags = []; 
        this.squares = []; 
        this.rows = []; 
        this.cols = []; 
        for ( var i = 0; i < this.SIZE; i++ ) {
            this.squares[i] = []; 
        }
        // ui.poss = document.id('clone_tbl').getElement('table.possval1').dispose();
        this.ui.poss  = document.querySelector("#clone_tbl table.possval1");  
        this.ui.poss.remove(); 

        // ui.poss2 = document.id('clone_tbl').getElement('table.possval2').dispose();
        this.ui.poss2  = document.querySelector("#clone_tbl table.possval2");  
        // console.log(this.ui.poss2); 
        this.ui.poss2.remove(); 
        console.log(this.ui.poss2); 
    }

    initUnsolved() { 
        this.unsolved = this.SIZE * this.SIZE;  // 81  
        for (let ii = 0; ii < this.SIZE; ii++) {
            for (let jj = 0; jj < this.SIZE; jj++) {
                if (this.grid[ii][jj] > 0)  { 
                    this.rows[ii].unsolved--; 
                    this.cols[jj].unsolved--; 
                    this.boxes[this.squares[ii][jj].box].unsolved--; 
                    this.unsolved--;   						
                }                	  
            }
        }
    }

    initValGrid() { 
        for (let i = 0; i < this.SIZE; i++) { 
            for (let j = 0; j < this.SIZE; j++) { 
                if (this.grid[i][j] > 0) { 
                    this.modValGrid(i,j,this.grid[i][j]); 
                }
            }
        }
    }

    /* modify valGrid for all elements in row/col/box of specified cell */
    modValGrid(i0, j0, val0) { 
        this.rows[i0].modVals(j0, this.grid[i0][j0]);  // mod the valGrid array for all numbers for this row
        this.cols[j0].modVals(i0, this.grid[i0][j0]);  // mod the valGrid array for all numbers for this col
        this.boxes[this.squares[i0][j0].box].modVals(this.squares[i0][j0].boxsq, this.grid[i0][j0]);  // mod the valGrid array for all numbers for this box
        if (this.SIZE == 16 && this.squares[i0][j0].diag >= 0) this.diags[this.squares[i0][j0].diag].modVals(this.squares[i0][j0].row, this.grid[i0][j0]);
    }
    
    /* modify valGrid for row/col/box of just the specified cell */
    modValGridCell(i0, j0, val0) { 
        this.rows[i0].modValCell(j0, val0);  // mod the valGrid array for a specific cell in this row
        this.cols[j0].modValCell(i0, val0);  // mod the valGrid array for a specific cell in this col
        this.boxes[this.squares[i0][j0].box].modValCell(this.squares[i0][j0].boxsq, val0);  // mod the valGrid array for for a specific cell in this box 
        if (this.SIZE == 16 && this.squares[i0][j0].diag >= 0) this.diags[this.squares[i0][j0].diag].modValCell(this.squares[i0][j0].row, val0);  // mod the valGrid array for for a specific cell in this diag
    }

    // gets grid from table of grids;  Populates this.grid  
    getGrid(puzz) { 
        // document.getElementById('choose_puzzle').set('value', puzz);  
        document.getElementById('choose_puzzle').value = puzz; 

        // if (this.SIZE == 9) document.getElementById('sudokutbl').addClass('size9');			
        if (this.SIZE == 9) document.getElementById('sudokutbl').classList.add('size9');	

        this.unsolved = this.SIZE * this.SIZE;  // 81 
        var retgrid = null; 
        console.log('puzz = ' + puzz);
        // console.log(Grids);   
        retgrid = Grids.getGridPuzzle(puzz); 
        this.grid = []; 
        for (var i = 0; i < retgrid.length; i++)     // makes shallow copy of grid array 
            this.grid[i] = retgrid[i].slice();
        this.solvegridCheat = null; 
        if (this.SIZE == 16) {
            this.solvegridCheat = Grids.getGridSolution(puzz); 
        }
        // this.initPossibles();
        // Possibles.init(this);   
        this.possibles = new Possibles(this); 
        console.log(this.grid); 
    } 

    readyGrid() { 
        this.copyGridtoTemp(); 
        this.populateHTML(); 
        Utils.resetButtons(); 
        this.possibles = new Possibles(this);      
        this.started = 0; 
    }

    copyGridtoTemp() { 
        this.tmpgrid = Utils.copyGridShallow(this.grid); 
        this.tmpgrid2 = Utils.copyGridShallow(this.grid);   // tmpgrid2 will be used to check for a 2nd solution to the puzzle
    }

    /* Populates html grid w/ data from tmpgrid;  this will be the Solved Puzzle for 'Solve' mode & the Start Puzzle for Auto/Manual modes */
    populateHTML() { 
        Utils.clearMsgs(); 
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("span.sqnum").innerText = '';   
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("input.insq").value = '';  
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).classList.remove("seed");	

                if (this.tmpgrid[i][j] != 0) {
                    document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("span.sqnum").innerText  = this.tmpgrid[i][j];   
                    if (this.grid[i][j] > 0) {                                                   // different formatting for numbers originally on the grid 
                        document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).classList.add('seed'); 
                    }
                }
            }
        }
    }

    /* Populates this.grid w/ user-entered data */
    getUserData() {  
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {        
                let dat = document.getElementById('t'+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('input.insq').value; 
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('span.sqnum').innerText = dat; 
                
                if (document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('span.sqnum').innerText == '0') 
                    document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('span.sqnum').innerText = ''; 
                if (!parseInt(document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('span.sqnum').innerText)) this.grid[i][j] = 0; 
                else this.grid[i][j] = parseInt(document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('span.sqnum').innerText);  
                if (this.grid[i][j] < 1 || this.grid[i][j] > this.SIZE) this.grid[i][j] = 0;  
                if (this.grid[i][j] > 0) {                                                   // different formatting for numbers originally on the grid 
                    document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).classList.add("seed");  
                }
            }
        }
        this.possibles = new Possibles(this); 
    } 

    /* Repopulates the user-entered data to allow for additional updates */
    resetUserData() { 
        console.log('resetData'); 
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {     
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("span.sqnum").innerText = '';   
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("input.insq").value = '';   
                document.getElementById("t" + Utils.twoDigit(i) + Utils.twoDigit(j)).classList.remove("seed");
                if (this.keepGrid[i][j] > 0) { 
                    document.getElementById('t'+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector('input.insq').value = this.keepGrid[i][j]; 
                }                    
            }
        }
        Utils.hideIdClass('sudokutbl', "span.sqnum"); 
        Utils.showIdClass('sudokutbl', "input.insq"); 
    }

    solveButton(typ) {
        console.log('solveButton'); 
        this.puzzleSolved = 0; 
        this.puzzleFail = 0; 
        this.puzzleValid = 1; 
        Utils.clearMsgs(); 
        Utils.hidePossibles(); 
 
        if (this.puzzleEntry == 1) {
            this.getUserData();
            this.copyGridtoTemp(); 
            this.puzzleValid = Validator.checkValid(this.grid);  
            if (!this.puzzleValid) { 
                document.getElementById("progress_msg").innerText = 'Invalid Puzzle Entered';
                Utils.afterSolveResetButtons(false); 
                return {valid: false }; 
            }
        }

        this.keepGrid = []; 
        this.keepGrid = Utils.copyGridShallow(this.grid); 
        
        var result = null; 
        if (this.solvegridCheat) { 
            result = { grid: this.solvegridCheat} ; 
            this.tmpgrid = this.solvegridCheat; 
        }
        else  result = new Solver(this.tmpgrid).solvePuzzle();       
        
        if (!result)  { 
            document.getElementById("progress_msg").innerText = 'Puzzle Cannot be Solved';
            Utils.afterSolveResetButtons(false); 
            return {valid: false }; 
        }
        else  this.solvedGrid = result.grid;             	
        
        var mult = 0; 
        if (this.puzzleEntry == 1) { 
            // checks for a 2nd solution to the puzzle (by starting at the last cell instead of the first)
            var tmsg = '';  
            if (Utils.totNums(this.grid, this.SIZE) < 17) mult = 1; 
            if (mult == 0) { 
                var result2 = new Solver(this.tmpgrid2).solvePuzzleBwd();             
                if (!Utils.compareArrays(this.tmpgrid, this.tmpgrid2, this.SIZE)) { 
                    mult = 1; 
                } 
            }
            if (mult == 1) {
                tmsg = 'Multiple Solutions'; 
                if (typ == 'chkonly')  this.copyGridtoTemp(); 		// clear out tmpgrid if not Solving;  logic below will provide first solution for 'Solve' button 
            }
            document.getElementById("mult_solutions_msg").innerText = tmsg;
        }
        if (typ != 'chkonly') { 
            // document.id('sudokutbl').getElements("span.sqnum").show(); 
            // document.id('sudokutbl').getElements("input.insq").hide(); 
            Utils.showIdClass('sudokutbl', 'span.sqnum'); 
            Utils.hideIdClass('sudokutbl', 'input.insq'); 

            this.puzzleEntry = 0; 				
            this.populateHTML();  
            Utils.afterSolveResetButtons(true); 
        }   		
        return { valid: true, mult: mult }; 
    }

    autoButton() {
        console.log('autoButton'); 
        if (this.puzzleEntry == 1 && this.started == 0) { 
            var solvstat = this.solveButton('chkonly');
            if (!solvstat.valid) return; 
            if (solvstat.mult) {
                document.getElementById('btn_auto').disabled = true; 
                document.getElementById('btn_manual').disabled = true; 
                document.getElementById('btn_solve').disabled = false;  
                return; 
            }				
            Utils.showIdClass('sudokutbl', 'span.sqnum'); 
            Utils.hideIdClass('sudokutbl', 'input.insq'); 
            this.getUserData();
        }
        this.params.autoMode = 1; 
        this.unsetTwoClick(); 
        
        document.getElementById('btn_auto').disabled = true; 
        document.getElementById("btn_solve").disabled = true; 
        document.getElementById('btn_manual').disabled = true; 
        document.getElementById('btn_refresh').style.visibility = 'hidden';
        if (this.started == 0) {
            this.keepGrid = []; 
            this.keepGrid = Utils.copyGridShallow(this.grid); 
            this.setupOOP(); 
            this.changeDelay(); 
            this.startButton(); 
        }
        else { 
            document.getElementById('btn_next').style.visibility = 'hidden';
            document.getElementById('btn_pause').style.visibility = 'visible';
            this.nextStep('0');  
        }
    }
    manualButton() {
        console.log('manualButton'); 
        
        if (this.puzzleEntry == 1) { 
            var solvstat = this.solveButton('chkonly');
            if (!solvstat.valid) return; 
            if (solvstat.mult) {
                document.getElementById('btn_auto').disabled = true; 
                document.getElementById('btn_manual').disabled = true; 
                document.getElementById('btn_solve').disabled = false; 
                return; 
            }
            Utils.showIdClass('sudokutbl', 'span.sqnum'); 
            Utils.hideIdClass('sudokutbl', 'input.insq'); 
            this.getUserData();
        }	
        document.getElementById('btn_refresh').style.visibility = 'visible';
        this.keepGrid = []; 
        this.keepGrid = Utils.copyGridShallow(this.grid);  
        this.params.autoMode = 0; 
        this.setTwoClick(); 
        this.setupOOP(); 
        this.startButton();
    }

    pauseButton() {
        console.log('pauseButton'); 
        if (this.params.autoMode == 1) { 
            this.params.autoMode = 0; 
            this.setTwoClick(); 
            document.getElementById('btn_next').style.visibility = 'visible';
            document.getElementById("btn_solve").disabled = false; 
            document.getElementById('btn_refresh').style.visibility ='visible';
            document.getElementById('btn_pause').innerHTML = 'UnPause'; 
        }
        else { 
            this.params.autoMode = 1; 
            this.unsetTwoClick(); 
            document.getElementById('btn_next').style.visibility = 'hidden';
            document.getElementById("btn_solve").disabled = true; 
            document.getElementById('btn_refresh').style.visibility = 'hidden';
            document.getElementById('btn_pause').innerHTML = 'Pause'; 
            this.nextStep('0');  
        }
    }
    refreshButton() {
        console.log('refreshButton'); 
        Utils.resetButtons();  
        this.grid = []; 
        this.grid = Utils.copyGridShallow(this.keepGrid); 
        this.readyGrid(); 
        if (parseInt(document.getElementById('choose_puzzle').value) == 99)  {
            this.puzzleEntry = 1; 
            document.getElementById('btn_clear').style.visibility = 'hidden';
        }
        if (this.puzzleEntry == 1) this.resetUserData();
    }
    clearButton() {
        console.log('clearButton'); 
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {        
                document.getElementById('t'+i.toString()+j.toString()).getElementsByClassName('input.insq')[0].value = '';      
            }
        }
    }

    async startButton() { 
        self = this; 
        this.started = 1; 
        document.getElementById("progress_msg2").innerText = 'Updating Possibilities for Unfilled Squares';   
        document.getElementById('btn_manual').disabled = true; 
        // await test(); 
        // await Promises, which are returned from async functions, not the async function itself
        await (async function() {
            Utils.showPossibles();   
            if (self.params.autoMode == 0) document.getElementById('btn_next').style.visibility = 'visible';   
            else document.getElementById('btn_pause').style.visibility = 'visible';
            self.initMode = 0; 
            self.possibles.modAllPossibles();
            let delayVal = Delay.getDelay('dflt', null, self.params); 
            console.log('delay = ' + delayVal); 
            await Delay.sleep(delayVal); 
            console.log('return delay')
            // self.nextStep(0, "end"); 
        })(); 
        console.log('resume'); 
        this.nextStep('0', "end");      

        const test = async () => {
            return 12;  
        }
    }

    changePuzzle() {
        self = this; 
        console.log('changePuzzle'); 
        document.getElementById('btn_solve').disabled = false; 
        this.puzzleEntry = 0; 
        this.started = 0; 
        var puzznum = parseInt(document.getElementById('choose_puzzle').value);
        if (puzznum >= 1000) {
            this.SIZE = 16; 
            document.getElementById('sudokutbl').classList.remove('size9'); 
        }
        else {
            this.SIZE = 9; 
            document.getElementById('sudokutbl').classList.add('size9');
        }
        self.createHtml(this.SIZE); 
        this.getGrid(puzznum);  

        if (puzznum == 99) {
            this.puzzleEntry = 1; 
            Utils.hideIdClass('sudokutbl', 'span.sqnum'); 
            // document.getElementById('sudokutbl').querySelectorAll("span.sqnum").forEach(function(el) {
            //     el.style.display = 'none'; 
            // }); 
            Utils.showIdClass('sudokutbl', 'input.insq'); 
            // document.getElementById('sudokutbl').querySelectorAll("input.insq").show(); 
            document.getElementById('btn_clear').style.visibility = "visible" ;
        }
        else { 
            // document.getElementById('sudokutbl').querySelectorAll("span.sqnum").show(); 
            Utils.showIdClass('sudokutbl', 'span.sqnum'); 
            // document.getElementById('sudokutbl').querySelectorAll("input.insq").hide(); 
            Utils.hideIdClass('sudokutbl', 'input.insq'); 
            document.getElementById('btn_clear').style.visibility = "hidden" ;
        } 
        this.readyGrid();
    }

    changeDelay() {
        console.log('changeDelay'); 
        var d = document.querySelector('input[name="adelay"]:checked').value; 
        if (d == 'delay0')  this.params.delay.mult = 0; 
        if (d == 'delay1')  this.params.delay.mult = 1; 
        if (d == 'delay2')  this.params.delay.mult = 2; 
    }
    changeManualDelay() {
        console.log('changeManualDelay'); 
        // var d = document.querySelector('input[name="mdelay"]:checked').value; 
        if (this.params.autoMode == 0)  this.params.twoClick_active = 1; 
    }

    changeConfirm() {
        console.log('changeConfirm'); 
        var d = document.querySelector('input[name="aconfirm"]:checked').value; 
        if (d == 'confirm0')  this.params.confirm_needed = 0; 
        if (d == 'confirm1')  this.params.confirm_needed = 1; 
    }

    nextButton() { 
        this.deadend = 1; 
        if (this.params.autoMode == 0) {
            document.getElementById('btn_next').style.visibility = 'hidden';  // .hide(); 
            document.getElementById('choose_puzzle').disabled = true; 
        }
        this.nextStep('0');  
    }

    nextStep(step, status) {  // status can be 'mod', '', 'end'  
        console.log('BEGIN nextStep'); 
        if (this.unsolved == 0) { 
            document.getElementById("progress_msg").innerText = 'Puzzle Solved !!!';  
            Utils.afterSolveResetButtons(true); 
            return;        		
        }
        if (!status) status = ''; 
        if (status == 'end') { 
            Utils.clearMsgs(); 
            if (this.params.autoMode == 0) document.getElementById('btn_next').style.visibility = 'visible';
            this.deadend = 1;     // for auto mode, reset deadend back to 1;              
            if (this.params.autoMode == 0)  return;
        }

        Utils.clearMsgs(); 
        console.log('NEXT Step = ' + step); 
        this.debugger.push('NEXT Step = ' + step); 
        switch (step) { 
            case '0':
                this.checkSingles(); 
                break; 
            case '10': 
                this.checkOnlySpot();  
                break; 
            case '20': 
                this.matchingPairs(); 
                break; 
            case '25': 
                this.matchValPairs(); 
                break; 
            case '30': 
                this.specificBox(); 
                break; 
            case '35': 
                this.specificRowCol(); 
                break; 
            case '40': 
                this.fourCorners(); 
                break; 
            case '50': 
                this.yWing(); 
                break;   
            case '60': 
                this.xyzWing(); 
                break;           
            case '70': 
                this.numberChain(); 
                break; 
            case '80': 
                this.lastResort(); 
                break;                   
            case '90': 
                document.getElementById("progress_msg").innerText = 'No Solution Exists';  
                if (this.params.autoMode == 0) document.getElementById('btn_next').style.visibility = 'hidden';
                else document.getElementById('btn_pause').style.visibility = 'hidden';
                document.getElementById('btn_refresh').style.visibility = 'visible';
                break;                  
            default: 
            console.log('NextStep -- step Default'); 
                this.checkSingles(); 
        }
    }

    setupOOP() { 
        Creator.createSquares(this);
        console.log(this.squares[3][0]); 
        Creator.createBoxes(this); 
        console.log(this.boxes[0]); 
        Creator.createRows(this);
        console.log(this.rows[0]); 
        Creator.createCols(this);
        console.log(this.cols[0]);   
        if (this.SIZE == 16) { 
            Creator.createDiagonals(this);
            console.log(this.diags[0]); 
        } 
        Creator.createPuzzle(this); 
        this.initUnsolved(); 
        this.initValGrid();  
    }   

    setTwoClick() { 
        var d = document.querySelector('input[name="mdelay"]:checked').value; 
        if (d == 'click2') this.params.twoClick_active = 1; 
    }

    unsetTwoClick() { 
        this.params.twoClick_active = 0; 
    } 

    /*-----------------------------------------------------------------------------------------*/
    /*  SOLVE for Cell                                                                         */
    /*-----------------------------------------------------------------------------------------*/      
    solveCell(i, j, val) { 
        if (!val) this.squares[i][j].solveSquare(i,j); 
        else this.squares[i][j].solveSquare(i,j, val); 
            
        this.grid[i][j] = this.squares[i][j].solved; 
        this.rows[i].unsolved--; 
        this.cols[j].unsolved--; 
        this.boxes[this.squares[i][j].box].unsolved--; 
        this.unsolved--; 
        this.modValGrid(i,j,val); 
    }

    /*-----------------------------------------------------------------------------------------*/
    /*  Step 0 -- Check For Cells with just one Possible Value                                 */
    /*-----------------------------------------------------------------------------------------*/      
    async checkSingles() { 
        console.log('check singles'); 
        this.deadend = 1; 
        let found = {}; 
        outer_loop: 
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                if (this.squares[i][j].solved == 0 && this.squares[i][j].solvable == 1)  {  
                    console.log('Single Cell found'); 
                    this.deadend = 0; 
                    document.getElementById("progress_msg").innerText = 'Check for Single Values';   
                    this.solveCell(i,j); 
                    document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).classList.add('featureCell');  
                    found.i = i; found.j = j; 
                    break outer_loop; 
                }
            }
        }

        let delayVal = Delay.getDelay('step0', this.deadend, this.params); 
        console.log('delay2 = ' + delayVal); 
        await Delay.sleep(delayVal); 
        console.log('return delay2')

        self = this; 
        if (this.deadend == 1) {
            console.log('Step 00 -- not found'); 
            self.nextStep('10'); 
        } else {
            console.log('Step 00 -- found'); 
            this.debugger.push('Step 00 found -- ' + found.i + '; ' + found.j); 
            if (self.params.autoMode == 1 || self.params.twoClick_active == 0)  this.finishStep0(found); 
            else { 
                // only execute finishStep0 when user clicks "Next" button
                var cback = function(e) { 
                    var self2 = self;    // loses context otherwise;  
                    self.finishStep0(found); 
                    Utils.removeListeners(cback); 
                    Utils.unfreezePage(self2.params);
                }
                let i = found.i;  
                let j = found.j; 
                var v = self.grid[i][j]; 
                self.rows[i].featureRemoves([v], [j]);
                self.cols[j].featureRemoves([v], [i]);
                self.boxes[self.squares[i][j].box].featureRemoves([v], [self.squares[i][j].sqnum]);
                Utils.freezePage(self.params.twoClick_active);
                // document.getElementById("btn_go2").addEventListener("click", cback); 
                Utils.addListeners(cback); 
            }       
        }
    }
    
    async finishStep0(dat) { 
        let self = this;   // loses context after await call to modPossibleFeature;  
        let i = dat.i; 
        let j = dat.j; 
        document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("span.sqnum").innerText = self.grid[i][j];
        document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("table.possval").style.display = 'none';
        document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).classList.remove('featureCell');
        let delayVal = Delay.getDelay('step0', this.deadend, this.params); 
        await Delay.sleep(delayVal); 
        await this.possibles.modPossibleFeature(i,j,this.grid[i][j]); 
        self.nextStep('0', 'end');
    }  

    /*-----------------------------------------------------------------------------------------*/
    /*  Step 1 -- Check For Only One Spot for a Value in Row/Col/Box                           */
    /*-----------------------------------------------------------------------------------------*/      
    async checkOnlySpot() { 
        console.log('checkOnlySpot'); 
        self = this; 
        let delayVal = Delay.getDelay('step1', this.deadend, this.params); 
        await this.checkOnlyRow();    // looks for #s that can only be in one cell in a given row 

        console.log('Step 10 checkOnlyRow return ' + this.deadend + '; ' + this.isManual()); 
        if (this.deadend == 0) {
            // if (!this.isManual())  this.nextStep('0', 'end'); 
            if (this.params.autoMode == 1 || this.params.twoClick_active == 0)   this.nextStep('0', 'end');
            return;
        }

        await Delay.sleep(delayVal); 
        await this.checkOnlyCol();  
        console.log('Step 10 checkOnlyCol return ' + this.deadend + '; ' + this.isManual() + '; ' + this.params.autoMode + '; ' + this.params.twoClick_active );
        if (this.deadend == 0) {
            // if (!this.isManual())  this.nextStep('0', 'end'); 
            if (this.params.autoMode == 1 || this.params.twoClick_active == 0)   this.nextStep('0', 'end');
            return;
        }

        await Delay.sleep(delayVal); 
        await this.checkOnlyBox();  
        if (this.deadend == 0) {
            // if (!this.isManual())  this.nextStep('0', 'end'); 
            if (this.params.autoMode == 1 || this.params.twoClick_active == 0)   this.nextStep('0', 'end');
            return;
        }

        if (self.SIZE == 16) { 
            await Delay.sleep(delayVal); 
            await this.checkOnlyDiag();  
            if (this.deadend == 0) {
                // if (!this.isManual())  this.nextStep('0', 'end'); 
                if (this.params.autoMode == 1 || this.params.twoClick_active == 0)   this.nextStep('0', 'end');
                return;
            }    
        }
        await Delay.sleep(delayVal); 
        this.nextStep("20");    // nothing found -- proceed to next step
    }

    async checkOnlyRow() { 
        console.log('checkOnlyRow'); 
        let found = {}; 
        outerloop2: 
        for (let i = 0; i < this.SIZE; i++)  { 		// rows
            for (let k = 0; k < this.SIZE; k++)  {		// values
                if (this.rows[i].valGrid[k].length == 1 && this.squares[i][this.rows[i].valGrid[k][0]].solved == 0) {	// found a value that can occur in just 1 cell in row
                    let j = this.rows[i].valGrid[k][0]; 	// set column value
                    this.deadend = 0; 
                    found.i = i; found.j = j; found.k = k; 
                    break outerloop2;
                }
            }
        }
        if (this.deadend == 1) return;  // no match found' 

        let i = found.i; let j = found.j;  let k = found.k; 
        this.debugger.push('Step 10 checkOnlyRow found' + i.toString() +'; ' + j.toString() + '; ' + (k+1).toString());   
        document.getElementById("progress_msg").innerText = 'Values with just ONE possible cell - Row';
        this.solveCell(i,j,k+1);   // solve square by setting its value to k + 1 (due to 0-array) 
        Utils.featureNum(i,j,k+1); 
        document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).classList.add('featureCell'); 
        this.rows[i].featureRow(); 

        let delayVal = Delay.getDelay('step1', this.deadend, this.params); 
        await Delay.sleep(delayVal); 
        await this.finishStep1('row',i,j);   
    }

    async checkOnlyCol() { 
        console.log('checkOnlyCol'); 
        let found = {}; 
        outerloop2b: 
        for (let j = 0; j < this.SIZE; j++)  { 		// cols
            for (let k = 0; k < this.SIZE; k++)  {		// values
                if (this.cols[j].valGrid[k].length == 1 && this.squares[this.cols[j].valGrid[k][0]][j].solved == 0) {	// found a value that can occur in just 1 cell in column
                    let i = this.cols[j].valGrid[k][0]; 	// set row value
                    this.deadend = 0; 
                    found.i = i; found.j = j; found.k = k; 
                    break outerloop2b;
                }
            }
        }
        if (this.deadend == 1) return; 

        let i = found.i; let j = found.j;  let k = found.k; 
        this.debugger.push('Step 10 checkOnlyCol found' + i.toString() +'; ' + j.toString() + '; ' + (k+1).toString());   
        document.getElementById("progress_msg").innerText = 'Values with just ONE possible cell - Column';
        this.solveCell(i,j,k+1);   // solve square by setting its value to k + 1 (due to 0-array) 
        Utils.featureNum(i,j,k+1); 
        document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).classList.add('featureCell'); 
        this.cols[j].featureCol(); 

        let delayVal = Delay.getDelay('step1', this.deadend, this.params); 
        await Delay.sleep(delayVal); 
        await this.finishStep1('col',i,j);   		
    }

    async checkOnlyBox() { 
        console.log('checkOnlyBox'); 
        let found = {}; 
        outerloop2c: 
        for (let b = 0; b < this.SIZE; b++)  { 			// boxes
            for (let k = 0; k < this.SIZE; k++)  {		// values
                if (this.boxes[b].valGrid[k].length != 1) continue; 
                var v = this.boxes[b].valGrid[k][0]; 
                var sq = this.boxes[b].boxSquare[v]; // get square value
                if (this.squares[sq.row][sq.column].solved == 0) {	// found a value that can occur in just 1 cell in box
                    let i = sq.row; 
                    let j = sq.column;             			
                    this.deadend = 0; 
                    found.i = i; found.j = j; found.k = k; found.b = b; 
                    break outerloop2c;
                }
            }
        }
        if (this.deadend == 1) return; 

        let i = found.i; let j = found.j;  let k = found.k;  let b = found.b; 
        this.debugger.push('Step 10 checkOnlyBox found' + i.toString() +'; ' + j.toString() + '; ' + (k+1).toString());   
        document.getElementById("progress_msg").innerText = 'Values with just ONE possible cell - Box';
        this.solveCell(i,j,k+1);   // solve square by setting its value to k + 1 (due to 0-array) 
        Utils.featureNum(i,j,k+1); 
        this.boxes[b].featureBox(); 
                         
        let delayVal = Delay.getDelay('step1', this.deadend, this.params); 
        await Delay.sleep(delayVal); 
        await this.finishStep1('box',i,j);   		
    }

    async checkOnlyDiag() { 
        console.log('checkOnlyDiag'); 
        let found = {}; 
        outerloop2d: 
        for (let b = 0; b < 2; b++)  { 					// check for both diagonals
            for (let k = 0; k < this.SIZE; k++)  {		// values
                if (this.diags[b].valGrid[k].length != 1) continue; 
                var v = this.diags[b].valGrid[k][0]; 
                var sq = this.diags[b].diagSquare[v]; // get square value
                if (this.squares[sq.row][sq.column].solved == 0) {	// found a value that can occur in just 1 cell in box
                    let i = sq.row; 
                    let j = sq.column;             			
                    this.deadend = 0; 
                    found.i = i; found.j = j; found.k = k; found.b = b; 
                    break outerloop2d;
                }
            }
        }
        if (this.deadend == 1) return; 

        let i = found.i; let j = found.j;  let k = found.k;  let b = found.b; 
        document.getElementById("progress_msg").innerText = 'Values with just ONE possible cell - Diagonal';
        this.solveCell(i,j,k+1);   // solve square by setting its value to k + 1 (due to 0-array) 
        Utils.featureNum(i,j,k+1); 
        document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).classList.add('featureCell'); 
        this.diags[b].featureDiag(); 
                
        let delayVal = Delay.getDelay('step1', this.deadend, this.params); 
        await Delay.sleep(delayVal); 
        await this.finishStep1('diag',i,j);   

    }

    async finishStep1(typ, i, j) { 
        self = this; 
        this.skipDelay = 0; 
        var v = this.grid[i][j]; 
        if (this.params.autoMode == 1 || this.params.twoClick_active == 0)  await finishStep1b(); 
        else { 
            this.skipDelay = 1; 
            var cback = function(e) { 
                finishStep1b(); 
                Utils.removeListeners(cback);
                Utils.unfreezePage(self.params);
                self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click
            }
            self.rows[i].featureRemoves([v], [j]);
            self.cols[j].featureRemoves([v], [i]);
            self.boxes[self.squares[i][j].box].featureRemoves([v], [self.squares[i][j].sqnum]);
            Utils.freezePage(self.params.twoClick_active);
            Utils.addListeners(cback);
            
        }    
        async function finishStep1b() { 
            Utils.featureNum(i,j,v); 
            if (typ == 'col') self.cols[j].unfeatureCol(); 
            else if (typ == 'row') self.rows[i].unfeatureRow(); 
            else if (typ == 'box') self.boxes[self.squares[i][j].box].unfeatureBox(); 
            else self.diags[self.squares[i][j].diag].unfeatureDiag(); 
            document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("span.sqnum").innerText = self.grid[i][j];
            document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).querySelector("table.possval").style.display = 'none'; 
            document.getElementById("t"+ Utils.twoDigit(i) + Utils.twoDigit(j)).classList.remove('featureCell');
            if (self.skipDelay == 0) {
                let delayVal = Delay.getDelay('step1', self.deadend, self.params); 
                await Delay.sleep(delayVal); 
                await self.possibles.modPossibleFeature(i,j,self.grid[i][j]); 
            }
            else {
                self.possibles.modPossible(i,j,self.grid[i][j]); 
                self.rows[i].unfeatureRemoves([v], [j]);
                self.cols[j].unfeatureRemoves([v], [i]);
                document.getElementById('btn_next').style.visibility = 'visible'; 
                self.boxes[self.squares[i][j].box].unfeatureRemoves([v], [self.squares[i][j].sqnum]);
            }
            console.log('end Step 1b'); 
        }
    }

    /*-----------------------------------------------------------------------------------------*/
    /*  Step 2 -- Matching Pairs (exact same 2 vals for 2 cells in same Row/Col/Box            */
    /*-----------------------------------------------------------------------------------------*/              
    async matchingPairs () { 
        self = this; 
        let delayVal = Delay.getDelay('delay2', this.deadend, this.params); 
        await this.matchPairsRow();   // looks for 2 cells in the same row that have the exact same 2 possibilities   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1'); // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.matchPairsCol();   // looks for 2 cells in the same column that have the exact same 2 possibilities   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1'); // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.matchPairsBox(); 
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1'); // this.nextStep('0', 'end');  
            return;
        }

        if (self.SIZE == 16) {
            await Delay.sleep(delayVal);
            await self.matchPairsDiag(); 
            if (this.deadend == 0) {
                if (!this.isManual())  await this.endStep('delay1'); // this.nextStep('0', 'end'); 
                return;
            }
        } 

        await Delay.sleep(delayVal);
        this.nextStep("25");    // nothing found -- proceed to next step
    } 

    async matchPairsRow() { 
        console.log('matchPairsRow'); 
        var sqRemove = [];   
        for (let i = 0; i < this.SIZE; i++) {            // rows 
            if (this.rows[i].unsolved <= 2) continue; 	// skip check for any row that has 2 or fewer unsolved cells
            let m = this.rows[i].getPairCells();        
            if (m.found == 1) {
                if (!this.rows[i].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.rows[i].rowSquare[m.sq[0]].rowReduce = 2;	// so we don't reselect these on subsequent searches
                    this.rows[i].rowSquare[m.sq[1]].rowReduce = 2;
                    continue; 
                }
                
                this.rows[i].featureRow(); 
                Utils.featureNums(i, m.sq[0], m.val); 
                Utils.featureNums(i, m.sq[1], m.val); 
                this.rows[i].featureRemoves(m.val, m.sq); 	// params are value to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs - Row';
                self = this; 
                self.rows[i].rowSquare[m.sq[0]].rowReduce = 2;
                self.rows[i].rowSquare[m.sq[1]].rowReduce = 2;
                
                sqRemove.push({
                    sq: m.sq, 		// array of 3 squares
                    val: m.val		// array of 3 values
                });  
                          
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2a(sqRemove, 2, i); 
                else {
                    var cback = function(e) { 
                        self.finishStep2a(sqRemove, 2, i); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click                   
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);
                }
                break; 
            }
        }
        if (this.deadend == 1) await this.matchThreesRow(); 
    }

    async matchThreesRow() { 
        console.log('matchTreesRow'); 
        var sqRemove = [];   
        self = this; 
        for (let i = 0; i < this.SIZE; i++) {            // rows 
            if (this.rows[i].unsolved <= 3) continue; 	// skip check for any row that has 3 or fewer unsolved cells
            var m = this.rows[i].getTrioCells();        
            if (m.found == 1) {
                if (!this.rows[i].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.rows[i].rowSquare[m.sq[0]].rowReduce = 2;	// so we don't reselect these on subsequent searches
                    this.rows[i].rowSquare[m.sq[1]].rowReduce = 2;
                    continue; 
                }
                
                self.rows[i].featureRow(); 
                Utils.featureNums(i, m.sq[0], m.val); 
                Utils.featureNums(i, m.sq[1], m.val); 
                Utils.featureNums(i, m.sq[2], m.val); 
                this.rows[i].featureRemoves(m.val, m.sq); 	// params are values to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Triples - Row';
                self = this; 
                this.rows[i].rowSquare[m.sq[0]].rowReduce = 3;
                this.rows[i].rowSquare[m.sq[1]].rowReduce = 3;
                this.rows[i].rowSquare[m.sq[2]].rowReduce = 3;
                
                sqRemove.push({
                        sq: m.sq, 		// array of 3 squares
                        val: m.val		// array of 3 values
                });  
                
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (self.params.confirm_needed == 0 && self.params.twoClick_active == 0)  await this.finishStep2a(sqRemove, 3, i); 
                else {
                    var cback = function(e) { 
                        self.finishStep2a(sqRemove, 3, i); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);
                }                      
                break; 
            }
        }
    }

    async finishStep2a(sqRemove, cnt, i) {   // 2nd param is # of values (2 for pairs, 3 for threes)                     		
        self.possibles.modPossibleRow(i,sqRemove[0].val[0], sqRemove[0].sq);   // 3rd param is exclude col;  
        self.possibles.modPossibleRow(i,sqRemove[0].val[1], sqRemove[0].sq);
        if (cnt == 3)  self.possibles.modPossibleRow(i,sqRemove[0].val[2], sqRemove[0].sq);

        self.rows[i].unfeatureRow(); 
        Utils.unfeatureNums(i, sqRemove[0].sq[0], sqRemove[0].val); 
        Utils.unfeatureNums(i, sqRemove[0].sq[1], sqRemove[0].val); 
        if (cnt == 3)  Utils.unfeatureNums(i, sqRemove[0].sq[2], sqRemove[0].val); 

        self.rows[i].unfeatureRemoves(sqRemove[0].val, sqRemove[0].sq); 
        Utils.clearMsgs(); 
    }

    async matchPairsCol() { 
        console.log('matchPairsCol'); 
        var sqRemove = [];   
        for (let j = 0; j < this.SIZE; j++) {            // rows 
            if (this.cols[j].unsolved <= 2) continue; 	// skip check for any row that has 2 or fewer unsolved cells
            let m = this.cols[j].getPairCells();        
            if (m.found == 1) {
                if (!this.cols[j].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.cols[j].colSquare[m.sq[0]].colReduce = 2;	// so we don't reselect these on subsequent searches
                    this.cols[j].colSquare[m.sq[1]].colReduce = 2;
                    continue; 
                }
                
                this.cols[j].featureCol(); 
                Utils.featureNums(m.sq[0], j, m.val); 
                Utils.featureNums(m.sq[1], j, m.val); 
                this.cols[j].featureRemoves(m.val, m.sq); 	// params are value to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs or Matching Triples';
                self = this; 
                self.cols[j].colSquare[m.sq[0]].colReduce = 2;
                self.cols[j].colSquare[m.sq[1]].colReduce = 2;
                
                sqRemove.push({
                    sq: m.sq, 		// array of 3 squares
                    val: m.val		// array of 3 values
                });  
                          
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2c(sqRemove, 2, j); 
                else {
                    var cback = function(e) { 
                        self.finishStep2c(sqRemove, 2, j); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click               
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);
                }

                break; 
            }
        }
        if (this.deadend == 1) await this.matchThreesCol(); 
    }

    async matchThreesCol() { 
        console.log('matchThreesCol'); 
        // window.alert('matchTreesCol'); 
        var sqRemove = [];   
        self = this; 
        for (let j = 0; j < this.SIZE; j++) {            // rows 
            if (this.cols[j].unsolved <= 3) continue; 	// skip check for any row that has 3 or fewer unsolved cells
            var m = this.cols[j].getTrioCells();        
            if (m.found == 1) {
                if (!this.cols[j].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.cols[j].colSquare[m.sq[0]].colReduce = 2;	// so we don't reselect these on subsequent searches
                    this.cols[j].colSquare[m.sq[1]].colReduce = 2;
                    continue; 
                }
                
                self.cols[j].featureCol(); 
                Utils.featureNums(m.sq[0], j, m.val); 
                Utils.featureNums(m.sq[1], j, m.val); 
                Utils.featureNums(m.sq[2], j, m.val); 
                this.cols[j].featureRemoves(m.val, m.sq); 	// params are values to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs or Matching Triples';
                self = this; 
                this.cols[j].colSquare[m.sq[0]].colReduce = 3;
                this.cols[j].colSquare[m.sq[1]].colReduce = 3;
                this.cols[j].colSquare[m.sq[2]].colReduce = 3;
                
                sqRemove.push({
                        sq: m.sq, 		// array of 3 squares
                        val: m.val		// array of 3 values
                });  
                
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (self.params.confirm_needed == 0 && self.params.twoClick_active == 0)  await this.finishStep2c(sqRemove, 3, j); 
                else {
                    var cback = function(e) { 
                        self.finishStep2c(sqRemove, 3, j); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback); 
                }                      
                break; 
            }
        }
    }

    async finishStep2c(sqRemove, cnt, j) {   // 2nd param is # of values (2 for pairs, 3 for threes)       
        console.log('finishStep2c');               		
        self.possibles.modPossibleCol(j,sqRemove[0].val[0], sqRemove[0].sq);   // 3rd param is exclude col;  
        self.possibles.modPossibleCol(j,sqRemove[0].val[1], sqRemove[0].sq);
        if (cnt == 3)  self.possibles.modPossibleCol(j,sqRemove[0].val[2], sqRemove[0].sq);

        self.cols[j].unfeatureCol(); 
        Utils.unfeatureNums(sqRemove[0].sq[0], j, sqRemove[0].val); 
        Utils.unfeatureNums(sqRemove[0].sq[1], j, sqRemove[0].val); 
        if (cnt == 3)  Utils.unfeatureNums(sqRemove[0].sq[2], j, sqRemove[0].val); 

        self.cols[j].unfeatureRemoves(sqRemove[0].val, sqRemove[0].sq); 
        Utils.clearMsgs(); 
    }

    async matchPairsBox() { 
        console.log('matchPairsBox'); 
        var sqRemove = [];   
        for (let b = 0; b < this.SIZE; b++) {            // boxes 
            if (this.boxes[b].unsolved <= 2) continue; 	// skip check for any box that has 2 or fewer unsolved cells
            let m = this.boxes[b].getPairCells();        
            if (m.found == 1) {
                if (!this.boxes[b].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.boxes[b].boxSquare[m.sq[0]].boxReduce = 2;	// so we don't reselect these on subsequent searches
                    this.boxes[b].boxSquare[m.sq[1]].boxReduce = 2;
                    continue; 
                }
                
                this.boxes[b].featureBox(); 
                Utils.featureNums(this.boxes[b].boxSquare[m.sq[0]].row, this.boxes[b].boxSquare[m.sq[0]].column, m.val);
                Utils.featureNums(this.boxes[b].boxSquare[m.sq[1]].row, this.boxes[b].boxSquare[m.sq[1]].column, m.val); 
                this.boxes[b].featureRemoves(m.val, m.sq); 	// params are value to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs or Matching Triples';
                self = this; 
                self.boxes[b].boxSquare[m.sq[0]].boxReduce = 2;
                self.boxes[b].boxSquare[m.sq[1]].boxReduce = 2;
                
                sqRemove.push({
                    sq: m.sq, 		// array of 3 squares
                    val: m.val		// array of 3 values
                });  
                          
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2e(sqRemove, 2, b); 
                else {
                    var cback = function(e) { 
                        self.finishStep2e(sqRemove, 2, b); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click     
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);
                }

                break; 
            }
        }
        if (this.deadend == 1) await this.matchThreesBox(); 
    }

    async matchThreesBox() { 
        console.log('matchTreesBox'); 
        var sqRemove = [];   
        self = this; 
        for (let b = 0; b < this.SIZE; b++) {            // rows 
            if (this.boxes[b].unsolved <= 3) continue; 	// skip check for any box that has 3 or fewer unsolved cells
            var m = this.boxes[b].getTrioCells();        
            if (m.found == 1) {
                if (!this.boxes[b].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.boxes[b].boxSquare[m.sq[0]].boxReduce = 2;	// so we don't reselect these on subsequent searches
                    this.boxes[b].boxSquare[m.sq[1]].boxReduce = 2;
                    continue; 
                }
                
                self.boxes[b].featureBox(); 
                Utils.featureNums(this.boxes[b].boxSquare[m.sq[0]].row, this.boxes[b].boxSquare[m.sq[0]].column, m.val); 
                Utils.featureNums(this.boxes[b].boxSquare[m.sq[1]].row, this.boxes[b].boxSquare[m.sq[1]].column, m.val); 
                Utils.featureNums(this.boxes[b].boxSquare[m.sq[2]].row, this.boxes[b].boxSquare[m.sq[2]].column, m.val); 
                this.boxes[b].featureRemoves(m.val, m.sq); 	// params are values to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs or Matching Triples';
                self = this; 
                self.boxes[b].boxSquare[m.sq[0]].boxReduce = 3;
                self.boxes[b].boxSquare[m.sq[1]].boxReduce = 3;
                self.boxes[b].boxSquare[m.sq[2]].boxReduce = 3;
                
                sqRemove.push({
                        sq: m.sq, 		// array of 3 squares
                        val: m.val		// array of 3 values
                });  
                
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (self.params.confirm_needed == 0 && self.params.twoClick_active == 0)  await this.finishStep2e(sqRemove, 3, b); 
                else {
                    var cback = function(e) { 
                        self.finishStep2e(sqRemove, 3, b); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);
                }                      
                break; 
            }
        }
    }

    async finishStep2e(sqRemove, cnt, b) {   // 2nd param is # of values (2 for pairs, 3 for threes)                     		
        self.possibles.modPossibleBox(b,sqRemove[0].val[0], sqRemove[0].sq);   // 3rd param is exclude cells;  
        self.possibles.modPossibleBox(b,sqRemove[0].val[1], sqRemove[0].sq);
        if (cnt == 3)  self.possibles.modPossibleBox(b,sqRemove[0].val[2], sqRemove[0].sq);

        self.boxes[b].unfeatureBox(); 
        Utils.unfeatureNums(self.boxes[b].boxSquare[sqRemove[0].sq[0]].row, self.boxes[b].boxSquare[sqRemove[0].sq[0]].column, sqRemove[0].val); 
        Utils.unfeatureNums(self.boxes[b].boxSquare[sqRemove[0].sq[1]].row, self.boxes[b].boxSquare[sqRemove[0].sq[1]].column, sqRemove[0].val); 
        if (cnt == 3)  Utils.unfeatureNums(self.boxes[b].boxSquare[sqRemove[0].sq[2]].row, self.boxes[b].boxSquare[sqRemove[0].sq[2]].column, sqRemove[0].val); 

        self.boxes[b].unfeatureRemoves(sqRemove[0].val, sqRemove[0].sq); 
        Utils.clearMsgs(); 
    }

    async matchPairsDiag() { 
        var sqRemove = [];   
        for (let b = 0; b < 2; b++) {            // check both diags 
            if (this.diags[b].unsolved <= 2) continue; 	// skip check for any diag that has 2 or fewer unsolved cells
            let m = this.diags[b].getPairCells();        
            if (m.found == 1) {
                if (!this.diags[b].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.diags[b].diagSquare[m.sq[0]].diagReduce = 2;	// so we don't reselect these on subsequent searches
                    this.diags[b].diagSquare[m.sq[1]].diagReduce = 2;
                    continue; 
                }
                
                this.diags[b].featureDiag(); 
                Utils.featureNums(this.diags[b].diagSquare[m.sq[0]].row, this.diags[b].diagSquare[m.sq[0]].column, m.val);
                Utils.featureNums(this.diags[b].diagSquare[m.sq[1]].row, this.diags[b].diagSquare[m.sq[1]].column, m.val); 
                this.diags[b].featureRemoves(m.val, m.sq); 	// params are value to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs or Matching Triples';
                self = this; 
                self.diags[b].diagSquare[m.sq[0]].diagReduce = 2;
                self.diags[b].diagSquare[m.sq[1]].diagReduce = 2;
                
                sqRemove.push({
                    sq: m.sq, 		// array of 3 squares
                    val: m.val		// array of 3 values
                });  
                          
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2j(sqRemove, 2, b); 
                else {
                    var cback = function(e) { 
                        self.finishStep2j(sqRemove, 2, b); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click           
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);    
                }

                break; 
            }
        }
        if (this.deadend == 1) await this.matchThreesDiag(); 
    }

    async matchThreesDiag() { 
        console.log('matchTreesDiag'); 
        var sqRemove = [];   
        self = this; 
        for (let b = 0; b < 2; b++) {            // check both diags 
            if (this.diags[b].unsolved <= 3) continue; 	// skip check for any box that has 3 or fewer unsolved cells
            var m = this.diags[b].getTrioCells();        
            if (m.found == 1) {
                if (!this.diags[b].findOnePoss(m.val, m.sq)) {   	// skip if we can't find at least one possible to remove;  params are array of values, cells to ignore
                    this.diags[b].diagSquare[m.sq[0]].diagReduce = 2;	// so we don't reselect these on subsequent searches
                    this.diags[b].diagSquare[m.sq[1]].diagReduce = 2;
                    continue; 
                }
                
                self.diags[b].featureDiag(); 
                Utils.featureNums(this.diags[b].diagSquare[m.sq[0]].row, this.diags[b].diagSquare[m.sq[0]].column, m.val); 
                Utils.featureNums(this.diags[b].diagSquare[m.sq[1]].row, this.diags[b].diagSquare[m.sq[1]].column, m.val); 
                Utils.featureNums(this.diags[b].diagSquare[m.sq[2]].row, this.diags[b].diagSquare[m.sq[2]].column, m.val); 
                this.diags[b].featureRemoves(m.val, m.sq); 	// params are values to remove & cell to ignore
                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
                document.getElementById("progress_msg").innerText = 'Check for Matching Pairs or Matching Triples';
                self = this; 
                self.diags[b].diagSquare[m.sq[0]].diagReduce = 3;
                self.diags[b].diagSquare[m.sq[1]].diagReduce = 3;
                self.diags[b].diagSquare[m.sq[2]].diagReduce = 3;
                
                sqRemove.push({
                        sq: m.sq, 		// array of 3 squares
                        val: m.val		// array of 3 values
                });  
                
                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (self.params.confirm_needed == 0 && self.params.twoClick_active == 0)  await this.finishStep2j(sqRemove, 3, b); 
                else {
                    var cback = function(e) { 
                        self.finishStep2j(sqRemove, 3, b); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');      // manual mode;  End step -- wait for user click           
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);
                }                      
                break; 
            }
        }
    }

    async finishStep2j(sqRemove, cnt, b) {   // 2nd param is # of values (2 for pairs, 3 for threes)                     		
        self.possibles.modPossibleDiag(b,sqRemove[0].val[0], sqRemove[0].sq);   // 3rd param is exclude cells;  
        self.possibles.modPossibleDiag(b,sqRemove[0].val[1], sqRemove[0].sq);
        if (cnt == 3)  self.possibles.modPossibleDiag(b,sqRemove[0].val[2], sqRemove[0].sq);

        self.diags[b].unfeatureDiag(); 
        Utils.unfeatureNums(self.diags[b].diagSquare[sqRemove[0].sq[0]].row, self.diags[b].diagSquare[sqRemove[0].sq[0]].column, sqRemove[0].val); 
        Utils.unfeatureNums(self.diags[b].diagSquare[sqRemove[0].sq[1]].row, self.diags[b].diagSquare[sqRemove[0].sq[1]].column, sqRemove[0].val); 
        if (cnt == 3)  Utils.unfeatureNums(self.diags[b].diagSquare[sqRemove[0].sq[2]].row, self.diags[b].diagSquare[sqRemove[0].sq[2]].column, sqRemove[0].val); 

        self.diags[b].unfeatureRemoves(sqRemove[0].val, sqRemove[0].sq); 
        Utils.clearMsgs(); 
    }

    /*-----------------------------------------------------------------------------------------*/
    /*  Step 2.5 -- Matching Pairs of Vals (exact same 2 vals can exist only in same 2 cells   */
    /*-----------------------------------------------------------------------------------------*/              
    async matchValPairs() { 
        self = this; 
        let delayVal = Delay.getDelay('step2', this.deadend, this.params); 

        await this.matchValPairsRow();   // looks for 2 cells in the same row that have the exact same 2 possibilities   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.matchValPairsCol();   // looks for 2 cells in the same column that have the exact same 2 possibilities   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }        
        
        await Delay.sleep(delayVal); 
        await this.matchValPairsBox(); 
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }     

        if (self.SIZE == 16) {
            await Delay.sleep(delayVal);
            await self.matchValPairsDiag(); 
            if (this.deadend == 0) {
                if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
                return;
            }
        } 

        await Delay.sleep(delayVal);
        this.nextStep("30");    // nothing found -- proceed to next step

    } 

    async matchValPairsRow() { 
        console.log('matchValPairsRow'); 
        var sqRemove = [];   
        for (let i = 0; i < this.SIZE; i++) {            // rows 
            if (this.rows[i].unsolved <= 2) continue; 	// skip check for any row that has 2 or fewer unsolved cells
            let m = this.rows[i].getPairVals();        
            if (m.found == 1) {
                this.rows[i].featureRow();                     
                Utils.featureNums(i, m.cell1, [m.val1 + 1, m.val2 + 1]); 
                Utils.featureNums(i, m.cell2, [m.val1 + 1, m.val2 + 1]); 
                this.squares[i][m.cell1].featureRemovesExcept([m.val1 + 1, m.val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
                this.squares[i][m.cell2].featureRemovesExcept([m.val1 + 1, m.val2 + 1]); 

                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
               
                sqRemove.push({
                    row: i, 
                    sq1: m.cell1, 
                    sq2: m.cell2, 								
                    val1: m.val1, 
                    val2: m.val2		
                }); 
                document.getElementById("progress_msg").innerText = 'Check for Paired Values - Row';
                self = this; 
                self.rows[i].rowSquare[sqRemove[0].sq1].rowReduce = 2;
                self.rows[i].rowSquare[sqRemove[0].sq2].rowReduce = 2;

                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2x(sqRemove, i); 
                else {
                    var cback = function(e) { 
                        self.finishStep2x(sqRemove, i); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');  
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);            
                }
                break; 
            }
        }
    }
    
    async finishStep2x(sqRemove, i) {                 		
        self.possibles.removePossibleExcept(i,sqRemove[0].sq1,[sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);   // 3rd param is exclude array of vals;  
        self.possibles.removePossibleExcept(i,sqRemove[0].sq2,[sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);

        self.rows[i].unfeatureRow(); 
        Utils.unfeatureNums(i, sqRemove[0].sq1, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 
        Utils.unfeatureNums(i, sqRemove[0].sq2, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

        self.squares[i][sqRemove[0].sq1].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
        self.squares[i][sqRemove[0].sq2].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

        Utils.clearMsgs(); 
    }

    async matchValPairsCol() { 
        console.log('matchValPairsCol'); 
        var sqRemove = [];   
        for (let j = 0; j < this.SIZE; j++) {            // rows 
            if (this.cols[j].unsolved <= 2) continue; 	// skip check for any col that has 2 or fewer unsolved cells
            let m = this.cols[j].getPairVals();        
            if (m.found == 1) {
                this.cols[j].featureCol();                     
                Utils.featureNums(m.cell1, j, [m.val1 + 1, m.val2 + 1]); 
                Utils.featureNums(m.cell2, j, [m.val1 + 1, m.val2 + 1]); 
                this.squares[m.cell1][j].featureRemovesExcept([m.val1 + 1, m.val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
                this.squares[m.cell2][j].featureRemovesExcept([m.val1 + 1, m.val2 + 1]); 

                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
               
                sqRemove.push({
                    col: j, 
                    sq1: m.cell1, 
                    sq2: m.cell2, 								
                    val1: m.val1, 
                    val2: m.val2		
                }); 
                document.getElementById("progress_msg").innerText = 'Check for Paired Values - Col';
                self = this; 
                self.cols[j].colSquare[sqRemove[0].sq1].colReduce = 2;
                self.cols[j].colSquare[sqRemove[0].sq2].colReduce = 2;

                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2y(sqRemove, j); 
                else {
                    var cback = function(e) { 
                        self.finishStep2y(sqRemove, j); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');  
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);                
                }
                break; 
            }
        }
    }

    async finishStep2y(sqRemove, j) {                      		
        self.possibles.removePossibleExcept(sqRemove[0].sq1, j, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);   // 3rd param is exclude array of vals;  
        self.possibles.removePossibleExcept(sqRemove[0].sq2, j, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);

        self.cols[j].unfeatureCol(); 
        Utils.unfeatureNums(sqRemove[0].sq1, j, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 
        Utils.unfeatureNums(sqRemove[0].sq2, j, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

        self.squares[sqRemove[0].sq1][j].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
		self.squares[sqRemove[0].sq2][j].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

        Utils.clearMsgs(); 
    }

    async matchValPairsBox() { 
        console.log('matchValPairsBox'); 
        var sqRemove = [];   
        for (let b = 0; b < this.SIZE; b++) {            // boxes
            if (this.boxes[b].unsolved <= 2) continue; 	// skip check for any box that has 2 or fewer unsolved cells
            let m = this.boxes[b].getPairVals();         // returns array w/ cell1, cell2 (cell #s of Pair) & val1, val2
            if (m.found == 1) {
                this.boxes[b].featureBox();               
                let tmp = this.boxes[b].boxSquare[m.cell1]; 
                let tmp2 = this.boxes[b].boxSquare[m.cell2];      

                sqRemove.push({
                    row1: tmp.row, 
                    col1: tmp.column, 
                    row2: tmp2.row, 
                    col2: tmp2.column, 									
                    val1: m.val1, 
                    val2: m.val2		
                }); 

                Utils.featureNums(sqRemove[0].row1, sqRemove[0].col1, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 
                Utils.featureNums(sqRemove[0].row2, sqRemove[0].col2, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

                this.squares[sqRemove[0].row1][sqRemove[0].col1].featureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
                this.squares[sqRemove[0].row2][sqRemove[0].col2].featureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
               
                document.getElementById("progress_msg").innerText = 'Check for Paired Values - Box';
                self = this; 
                self.boxes[b].boxSquare[m.cell1].boxReduce = 2;
                self.boxes[b].boxSquare[m.cell2].boxReduce = 2;

                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2z(sqRemove, b); 
                else {
                    var cback = function(e) { 
                        self.finishStep2z(sqRemove, b); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');  
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);                    
                }
                break; 
            }
        }
    }

    async finishStep2z(sqRemove, b) {           		
        self.possibles.removePossibleExcept(sqRemove[0].row1,sqRemove[0].col1,[sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);   // 3rd param is exclude array of vals;  
        self.possibles.removePossibleExcept(sqRemove[0].row2,sqRemove[0].col2,[sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);

        self.boxes[b].unfeatureBox(); 
        Utils.unfeatureNums(sqRemove[0].row1, sqRemove[0].col1, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 
		Utils.unfeatureNums(sqRemove[0].row2, sqRemove[0].col2, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);

        self.squares[sqRemove[0].row1][sqRemove[0].col1].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
		self.squares[sqRemove[0].row2][sqRemove[0].col2].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

        Utils.clearMsgs(); 
    }

    async matchValPairsDiag() { 
        console.log('matchValPairsDiag'); 
        var sqRemove = [];   
        for (let b = 0; b < 2; b++) {            // both diags
            if (this.diags[b].unsolved <= 2) continue; 	// skip check for any box that has 2 or fewer unsolved cells
            let m = this.diags[b].getPairVals();         // returns array w/ cell1, cell2 (cell #s of Pair) & val1, val2
            if (m.found == 1) {
                this.diags[b].featureDiag();               
                let tmp = this.diags[b].diagSquare[m.cell1]; 
                let tmp2 = this.diags[b].diagSquare[m.cell2];      
                
                sqRemove.push({
                    row1: tmp.row, 
                    col1: tmp.column, 
                    row2: tmp2.row, 
                    col2: tmp2.column, 									
                    val1: m.val1, 
                    val2: m.val2		
                }); 

                Utils.featureNums(sqRemove[0].row1, sqRemove[0].col1, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 
                Utils.featureNums(sqRemove[0].row2, sqRemove[0].col2, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

                this.squares[sqRemove[0].row1][sqRemove[0].col1].featureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
                this.squares[sqRemove[0].row2][sqRemove[0].col2].featureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

                document.getElementById("progress_msg2").innerText = 'Update Possible values';  
                this.deadend = 0; 
               
                document.getElementById("progress_msg").innerText = 'Check for Paired Values - Diag';
                self = this; 
                self.diags[b].diagSquare[m.cell1].diagReduce = 2;
                self.diags[b].diagSquare[m.cell2].diagReduce = 2;

                let delayVal = Delay.getDelay('step2', this.deadend, this.params); 
                await Delay.sleep(delayVal); 

                if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep2z0(sqRemove, b); 
                else {
                    var cback = function(e) { 
                        self.finishStep2z0(sqRemove, b); 
                        Utils.removeListeners(cback);
                        Utils.unfreezePage(self.params);
                        self.nextStep('0', 'end');  
                    }
                    Utils.freezePage(self.params.twoClick_active);
                    Utils.addListeners(cback);                   
                }
                break; 
            }
        }
    }

    async finishStep2z0(sqRemove, b) {           		
        self.possibles.removePossibleExcept(sqRemove[0].row1,sqRemove[0].col1,[sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);   // 3rd param is exclude array of vals;  
        self.possibles.removePossibleExcept(sqRemove[0].row2,sqRemove[0].col2,[sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);

        self.diags[b].unfeatureDiag(); 
        Utils.unfeatureNums(sqRemove[0].row1, sqRemove[0].col1, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 
		Utils.unfeatureNums(sqRemove[0].row2, sqRemove[0].col2, [sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);

        self.squares[sqRemove[0].row1][sqRemove[0].col1].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]);    // highlight the possible #s that will be removed (all #s except for m.val1 & m.val2)
		self.squares[sqRemove[0].row2][sqRemove[0].col2].unfeatureRemovesExcept([sqRemove[0].val1 + 1, sqRemove[0].val2 + 1]); 

        Utils.clearMsgs(); 
    }

    /*-------------------------------------------------------------------------------------------------------*/
    /*  Step 3 -- Row or Col Values that have to be in a Specific Box (e.g. Number 2 for Col 6 has to be     */
    /*				in Box 8);  Other occurrences of this value in the Box can be removed                    */
    /*-------------------------------------------------------------------------------------------------------*/             
    async specificBox() { 
        self = this; 
        let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
        await this.rowValsSpecificBox();   // looks for 2 cells in the same row that have the exact same 2 possibilities  
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.colValsSpecificBox();   // looks for 2 cells in the same column that have the exact same 2 possibilities   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }
        
        await Delay.sleep(delayVal);
        this.nextStep("35");    // nothing found -- proceed to next step
    } 

    async rowValsSpecificBox() { 
        console.log('rowValsSpecificBox'); 
        var sqRemove = [];   
        outloop5a: 
        for (let i = 0; i < this.SIZE; i++) {		// rows
            for (let n = 0; n < this.SIZE; n++) { 	// values 0 thru 8 (corresponding to vals 1 thru this.SIZE) 
                if ((this.rows[i].valGrid[n].length == 2 && this.rows[i].rowSquare[this.rows[i].valGrid[n][0]].box == this.rows[i].rowSquare[this.rows[i].valGrid[n][1]].box)
                        || (this.rows[i].valGrid[n].length == 3 && this.rows[i].rowSquare[this.rows[i].valGrid[n][0]].box == this.rows[i].rowSquare[this.rows[i].valGrid[n][1]].box
                            && this.rows[i].rowSquare[this.rows[i].valGrid[n][0]].box == this.rows[i].rowSquare[this.rows[i].valGrid[n][2]].box)) {      			
                    var bx = this.rows[i].rowSquare[this.rows[i].valGrid[n][0]].box; 
                    // Check the other squares of the box to determine if the number is found anywhere outside of the selected column  
                    for (let s = 0; s < this.SIZE; s++) {			// squares w/in box 
                        if (this.boxes[bx].boxSquare[s].row != i &&  this.boxes[bx].boxSquare[s].possible[n] == 1) {
                            if (this.squares[this.boxes[bx].boxSquare[s].row][this.boxes[bx].boxSquare[s].column].solved == 0) {
                                sqRemove.push({
                                    val: n, 
                                    box: bx,     												
                                    rowKeep: i, 
    								colKeep: this.rows[i].valGrid[n],
                                    sqKeep: []			
                                }); 
                                for (let z = 0; z < this.rows[i].valGrid[n].length; z++) { 
                                    sqRemove[0].sqKeep.push(this.squares[i][this.rows[i].valGrid[n][z]].boxsq); 
                                }   								
                                break outloop5a;
                            }
                        }
                    }
                }
            }
        }

        if (sqRemove.length > 0) { 
            self.boxes[sqRemove[0].box].featureBox(); 
            /* highlight the value in the 2 cells that we're keeping */
            for (let c = 0; c < sqRemove[0].colKeep.length; c++) {		
                Utils.featureNum(sqRemove[0].rowKeep,sqRemove[0].colKeep[c], sqRemove[0].val + 1); 
            }
            /* highlight the same value in the other cells that we're removing */
            this.boxes[sqRemove[0].box].featureRemoves([sqRemove[0].val + 1], sqRemove[0].sqKeep);   // params are value to remove & cell to ignore
            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = 'Check for Box Values that must be in a specific Row';
            document.getElementById("progress_msg2").innerText = 'Box Vals in Specific Row - Remove other Possible values';  
            self = this; 

            let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep3a(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep3a(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                
            }
        }
    }

    async finishStep3a(sqRemove) {           		
        self.possibles.modPossibleBox(sqRemove[0].box,sqRemove[0].val + 1, sqRemove[0].sqKeep);   // 3rd param is exclude col; 
        self.boxes[sqRemove[0].box].unfeatureBox();

        for (let c = 0; c < sqRemove[0].colKeep.length; c++) {		
            Utils.unfeatureNum(sqRemove[0].rowKeep,sqRemove[0].colKeep[c], sqRemove[0].val + 1); 
        }

        self.boxes[sqRemove[0].box].unfeatureRemoves([sqRemove[0].val + 1], sqRemove[0].sqKeep);   // params are value to remove & cell to ignore
        Utils.clearMsgs(); 
    }

    async colValsSpecificBox() { 
        console.log('colValsSpecificBox'); 
        var sqRemove = [];   
        outloop5c: 
        for (let j = 0; j < this.SIZE; j++) {		// cols
            for (let n = 0; n < this.SIZE; n++) { 	// values 0 thru 8 (corresponding to vals 1 thru this.SIZE) 
                if ((this.cols[j].valGrid[n].length == 2 && this.cols[j].colSquare[this.cols[j].valGrid[n][0]].box == this.cols[j].colSquare[this.cols[j].valGrid[n][1]].box)
                        || (this.cols[j].valGrid[n].length == 3 && this.cols[j].colSquare[this.cols[j].valGrid[n][0]].box == this.cols[j].colSquare[this.cols[j].valGrid[n][1]].box
                            && this.cols[j].colSquare[this.cols[j].valGrid[n][0]].box == this.cols[j].colSquare[this.cols[j].valGrid[n][2]].box)) {      			
                    var bx = this.cols[j].colSquare[this.cols[j].valGrid[n][0]].box; 
                    // Check the other squares of the box to determine if the number is found anywhere outside of the selected column  
                    for (let s = 0; s < this.SIZE; s++) {			// squares w/in box 
                        if (this.boxes[bx].boxSquare[s].column != j &&  this.boxes[bx].boxSquare[s].possible[n] == 1) {
                            if (this.squares[this.boxes[bx].boxSquare[s].row][this.boxes[bx].boxSquare[s].column].solved == 0) {
                                sqRemove.push({
                                    val: n, 
                                    box: bx,     												
                                    rowKeep: this.cols[j].valGrid[n],
                                    colKeep: j,   
                                    sqKeep: []			
                                }); 
                                for (let z = 0; z < this.cols[j].valGrid[n].length; z++) { 
                                    sqRemove[0].sqKeep.push(this.squares[this.cols[j].valGrid[n][z]][j].boxsq); 
                                }    								
                                break outloop5c;
                            }
                        }
                    }
                }
            }
        }

        if (sqRemove.length > 0) { 
            self.boxes[sqRemove[0].box].featureBox(); 
            /* highlight the value in the 2 cells that we're keeping */
            for (let c = 0; c < sqRemove[0].rowKeep.length; c++) {		
                Utils.featureNum(sqRemove[0].rowKeep[c],sqRemove[0].colKeep, sqRemove[0].val + 1); 
            }
            /* highlight the same value in the other cells that we're removing */
            this.boxes[sqRemove[0].box].featureRemoves([sqRemove[0].val + 1], sqRemove[0].sqKeep);   // params are value to remove & cell to ignore
            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = 'Check for Box Values that must be in a specific Column';
            document.getElementById("progress_msg2").innerText = 'Box Vals in Specific Column - Remove other Possible values';  
            self = this; 

            let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep3b(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep3b(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                     
            }
        }
    }

    async finishStep3b(sqRemove) {           		
        self.possibles.modPossibleBox(sqRemove[0].box,sqRemove[0].val + 1, sqRemove[0].sqKeep);   // 3rd param is exclude col; 
        self.boxes[sqRemove[0].box].unfeatureBox();

        for (let c = 0; c < sqRemove[0].rowKeep.length; c++) {		
            Utils.unfeatureNum(sqRemove[0].rowKeep[c],sqRemove[0].colKeep, sqRemove[0].val + 1); 
        }

        self.boxes[sqRemove[0].box].unfeatureRemoves([sqRemove[0].val + 1], sqRemove[0].sqKeep);   // params are value to remove & cell to ignore
        Utils.clearMsgs(); 
    }


    /*-------------------------------------------------------------------------------------------------------*/
    /*  Step 3.5 -- Box Values that have to be in a Specific Row (or Column);  e.g. Number 2 for Square 5     */ 
    /*              has to be in col 7.  Other occurrences of this value in the Col can be removed           */
    /*-------------------------------------------------------------------------------------------------------*/              
    async specificRowCol() { 
        console.log('boxValsSpecificRowCol'); 
        self = this; 
        let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
        await this.boxValsSpecificRow();   // looks for boxes where a value w/ 2 possible cells must be in a specific Row   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }        
        
        await Delay.sleep(delayVal); 
        await this.boxValsSpecificCol();   // looks for boxes where a value w/ 2 possible cells must be in a specific Col       
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        this.nextStep("40");   // nothing found - proceed to next step

    } 

    async boxValsSpecificRow() { 
        console.log('boxValsSpecificRow'); 
        var sqRemove = [];   
        outloop7: 
        for (let b = 0; b < this.SIZE; b++) {		// rows
            for (let n = 0; n < this.SIZE; n++) { 	// values 0 thru 8 (corresponding to vals 1 thru this.SIZE) 
                if ((this.boxes[b].valGrid[n].length == 2 && this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].row == this.boxes[b].boxSquare[this.boxes[b].valGrid[n][1]].row) 
                || (this.boxes[b].valGrid[n].length == 3 && this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].row == this.boxes[b].boxSquare[this.boxes[b].valGrid[n][1]].row
                    && this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].row == this.boxes[b].boxSquare[this.boxes[b].valGrid[n][2]].row)) {
            
                    var rw = this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].row; 
                    // Check the other squares of the row to determine if the number is found anywhere outside of the selected box
                    for (let s = 0; s < this.SIZE; s++) {			// squares w/in row 
                        if (this.rows[rw].rowSquare[s].box != b &&  this.rows[rw].rowSquare[s].possible[n] == 1) {
                            if (this.squares[rw][this.rows[rw].rowSquare[s].column].solved == 0) {
                                sqRemove.push({
                                    val: n, 
                                    row: rw, 
                                    boxKeep: b, 
                                    colKeep: [] //[this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].column, this.boxes[b].boxSquare[this.boxes[b].valGrid[n][1]].column]		
                                }); 
                                for (let z = 0; z < this.boxes[b].valGrid[n].length; z++) { 
                                    sqRemove[0].colKeep.push(this.boxes[b].boxSquare[this.boxes[b].valGrid[n][z]].column); 
                                }    								
                                break outloop7;
                            }
                        }
                    }
                }
            }
        }

        if (sqRemove.length > 0) { 
            this.rows[sqRemove[0].row].featureRow(); 
            /* highlight the value in the 2 cells that we're keeping */
            for (let c = 0; c < sqRemove[0].colKeep.length; c++) {		
                Utils.featureNum(sqRemove[0].row,sqRemove[0].colKeep[c], sqRemove[0].val + 1); 
            }
            /* highlight the same value in the other cells that we're removing */
            this.rows[sqRemove[0].row].featureRemoves([sqRemove[0].val + 1], sqRemove[0].colKeep);   // params are value to remove & cell to ignore
            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = 'Check for Row Values that must be in a specific Box';
            document.getElementById("progress_msg2").innerText = 'Row Vals in Specific Box - Remove other Possible values';  
            self = this; 

            let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep3c(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep3c(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);            
            }
        }
    }

    async finishStep3c(sqRemove) {           		
        self.possibles.modPossibleRow(sqRemove[0].row,sqRemove[0].val + 1, sqRemove[0].colKeep);   // 3rd param is exclude col;  
        self.rows[sqRemove[0].row].unfeatureRow(); 

        for (let c = 0; c < sqRemove[0].colKeep.length; c++) {		
            Utils.unfeatureNum(sqRemove[0].row,sqRemove[0].colKeep[c], sqRemove[0].val + 1); 
        }

        self.rows[sqRemove[0].row].unfeatureRemoves([sqRemove[0].val + 1], sqRemove[0].colKeep);   // params are value to remove & cell to ignore
        Utils.clearMsgs(); 
    }

    async boxValsSpecificCol() { 
        console.log('boxValsSpecificCol'); 
        var sqRemove = [];   
        outloop7c: 
        for (let b = 0; b < this.SIZE; b++) {		// boxes
            for (let n = 0; n < this.SIZE; n++) { 	// values 0 thru 8 (corresponding to vals 1 thru this.SIZE) 
                if ((this.boxes[b].valGrid[n].length == 2 && this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].column == this.boxes[b].boxSquare[this.boxes[b].valGrid[n][1]].column)
                || (this.boxes[b].valGrid[n].length == 3 && this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].column == this.boxes[b].boxSquare[this.boxes[b].valGrid[n][1]].column
                    && this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].column == this.boxes[b].boxSquare[this.boxes[b].valGrid[n][2]].column)) {

                    var cl = this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].column; 
    					// Check the other squares of the column to determine if the number is found anywhere outside of the selected box  
                    for (let s = 0; s < this.SIZE; s++) {			// squares w/in col 
                        if (this.cols[cl].colSquare[s].box != b &&  this.cols[cl].colSquare[s].possible[n] == 1) {
                            if (this.squares[this.cols[cl].colSquare[s].row][cl].solved == 0) {
                                sqRemove.push({
                                    val: n, 
                                    col: cl, 
                                    boxKeep: b, 
                                    rowKeep: []  //[this.boxes[b].boxSquare[this.boxes[b].valGrid[n][0]].column, this.boxes[b].boxSquare[this.boxes[b].valGrid[n][1]].column]		
                                }); 
                                for (let z = 0; z < this.boxes[b].valGrid[n].length; z++) { 
                                    sqRemove[0].rowKeep.push(this.boxes[b].boxSquare[this.boxes[b].valGrid[n][z]].row); 
                                }    								
                                break outloop7c;
                            }
                        }
                    }
                }
            }
        }

        if (sqRemove.length > 0) { 
            self.cols[sqRemove[0].col].featureCol(); 
            /* highlight the value in the 2 cells that we're keeping */
            for (let c = 0; c < sqRemove[0].rowKeep.length; c++) {				
                Utils.featureNum(sqRemove[0].rowKeep[c],sqRemove[0].col, sqRemove[0].val + 1); 
            }
            /* highlight the same value in the other cells that we're removing */
            this.cols[sqRemove[0].col].featureRemoves([sqRemove[0].val + 1], sqRemove[0].rowKeep);   // params are value to remove & cell to ignore
            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = 'Check for Column Values that must be in a specific Box';
            document.getElementById("progress_msg2").innerText = 'Column Vals in Specific Box - Remove other Possible values';  
            self = this; 

            let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep3d(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep3d(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                  
            }
        }
    }

    async finishStep3d(sqRemove) {           		
        self.possibles.modPossibleCol(sqRemove[0].col,sqRemove[0].val + 1, sqRemove[0].rowKeep);   // 3rd param is exclude col;  
        self.cols[sqRemove[0].col].unfeatureCol(); 

        for (let c = 0; c < sqRemove[0].rowKeep.length; c++) {		
            Utils.unfeatureNum(sqRemove[0].rowKeep[c],sqRemove[0].col, sqRemove[0].val + 1); 
        }

        self.cols[sqRemove[0].col].unfeatureRemoves([sqRemove[0].val + 1], sqRemove[0].rowKeep);   // params are value to remove & cell to ignore
        Utils.clearMsgs(); 
    }

    /*-------------------------------------------------------------------------------------------------------*/
    /*  Step 4 -- Four Corners - Find a Row with a value that can occur in exactly 2 columns.  If there is 
                    a second row that has this same value in the exact same 2 columns, then this value can 
                    be removed as a Possible for any other row in the 2 cols.  
                    This can be done for Columns w/ a value that can occur in exactly 2 rows.                */
    /*-------------------------------------------------------------------------------------------------------*/              
    async fourCorners() { 
        self = this; 
        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await this.fourCornersRow();   // looks for rows where exactly 2 values can occur in 2 cols      
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.fourCornersCol();   // looks for cols where exactly 2 values can occur in 2 rows   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        this.nextStep("50");   // nothing found - proceed to next step

    } 

    async fourCornersRow() { 
        console.log('fourCornersRow'); 
        var temp4 = []; 
        var sqRemove = [];   
        /* Capture all rows with possible values that occur exactly twice */
        for (let i = 0; i < this.SIZE; i++) {		// rows
            for (let n = 0; n < this.SIZE; n++) { 	// values 0 thru 8 (corresponding to vals 1 thru this.SIZE) 
                if (this.rows[i].valGrid[n].length == 2)  { 
                    temp4.push({row: i, col1: this.rows[i].rowSquare[this.rows[i].valGrid[n][0]].column, 
                                col2: this.rows[i].rowSquare[this.rows[i].valGrid[n][1]].column, val: n}); 
                }
            }
        }

        /* Compare captured rows to determine if any have the exact same columns & values;  if so, these are a candidate for 4 corners (will need to check for remove possibles)  */
        outloop6: 
        for (let x = 0; x < temp4.length; x++) { 
            for (let y = x + 1; y < temp4.length; y++) { 
                /* 2 rows with exact same 2 columns */
        		if (temp4[x].col1 == temp4[y].col1 && temp4[x].col2 == temp4[y].col2 && temp4[x].val == temp4[y].val) {
                    for (let c = 0; c < this.SIZE; c++) {
                        /* Check that at least one possible in the 2 columns can be removed (ignoring the 2 rows that are part of the 4 corners);  also exclude cells that are already solved */
                        if (c != temp4[x].row && c != temp4[y].row 
                                && ((this.cols[temp4[y].col1].colSquare[c].solved <= 0 && this.cols[temp4[y].col1].colSquare[c].possible[temp4[y].val] == 1  )
                                    ||  ( this.cols[temp4[y].col2].colSquare[c].solved <= 0 &&  this.cols[temp4[y].col2].colSquare[c].possible[temp4[y].val] == 1)) ) { 
                            sqRemove.push({ 
                                row1: temp4[x].row, 
                                row2: temp4[y].row, 
                                col1: temp4[x].col1, 
                                col2: temp4[x].col2, 
                                val: temp4[y].val 
                            }); 
                            break outloop6;
                        }
                    }
                }
            }
        }

        if (sqRemove.length > 0) { 
            this.cols[sqRemove[0].col1].featureCol();
            this.cols[sqRemove[0].col2].featureCol();
            
            /* highlight the value in the 4 cells that we're keeping */
            Utils.featureNum(sqRemove[0].row1, sqRemove[0].col1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row1, sqRemove[0].col2, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row2, sqRemove[0].col1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row2, sqRemove[0].col2, sqRemove[0].val + 1); 

            /* highlight the same value in the other cells that we're removing */
            this.cols[sqRemove[0].col1].featureRemoves([sqRemove[0].val + 1], [sqRemove[0].row1, sqRemove[0].row2]);   // params are value to remove & array of cells to ignore
            this.cols[sqRemove[0].col2].featureRemoves([sqRemove[0].val + 1], [sqRemove[0].row1, sqRemove[0].row2]);

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For Four Corners ';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Cols';  
            self = this; 

            let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep4a(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep4a(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end'); 
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                    
            }
        }
    }

    async finishStep4a(sqRemove) {           
        self.possibles.modPossibleCol(sqRemove[0].col1, sqRemove[0].val + 1, [sqRemove[0].row1, sqRemove[0].row2]);   // 3rd param is excludes array;  
        self.possibles.modPossibleCol(sqRemove[0].col2, sqRemove[0].val + 1, [sqRemove[0].row1, sqRemove[0].row2]);   // 3rd param is excludes array;  
        
        self.cols[sqRemove[0].col1].unfeatureCol();
        self.cols[sqRemove[0].col2].unfeatureCol();
        
        Utils.unfeatureNum(sqRemove[0].row1, sqRemove[0].col1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row1, sqRemove[0].col2, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row2, sqRemove[0].col1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row2, sqRemove[0].col2, sqRemove[0].val + 1); 
        
        self.cols[sqRemove[0].col1].unfeatureRemoves([sqRemove[0].val + 1], [sqRemove[0].row1, sqRemove[0].row2]);   // params are value to remove & array of cells to ignore
        self.cols[sqRemove[0].col2].unfeatureRemoves([sqRemove[0].val + 1], [sqRemove[0].row1, sqRemove[0].row2]);
        
        Utils.clearMsgs(); 
    }

    async fourCornersCol() { 
        console.log('fourCornersCol'); 
        var temp4 = []; 
        var sqRemove = [];   
        /* Capture all cols with possible values that occur exactly twice */
        for (let j = 0; j < this.SIZE; j++) {		// cols
            for (let n = 0; n < this.SIZE; n++) { 	// values 0 thru 8 (corresponding to vals 1 thru this.SIZE) 
                if (this.cols[j].valGrid[n].length == 2)  { 
                    temp4.push({col: j, row1: this.cols[j].colSquare[this.cols[j].valGrid[n][0]].row, row2: this.cols[j].colSquare[this.cols[j].valGrid[n][1]].row, val: n}); 
                }
            }
        }

        /* Compare captured cols to determine if any have the exact same rows & values;  if so, these are a candidate for 4 corners (will need to check for remove possibles)  */
        outloop6b: 
        for (let x = 0; x < temp4.length; x++) { 
            for (let y = x + 1; y < temp4.length; y++) { 
        		/* 2 cols with exact same 2 rows */
        		if (temp4[x].row1 == temp4[y].row1 && temp4[x].row2 == temp4[y].row2 && temp4[x].val == temp4[y].val) {
        			for (let c = 0; c < this.SIZE; c++) {
        				/* Check that at least one possible in the 2 rows can be removed (ignoring the 2 columns that are part of the 4 corners);  also exclude cells that are already solved */
        				if (c != temp4[x].col && c != temp4[y].col 
                               && ((this.rows[temp4[y].row1].rowSquare[c].solved <= 0 && this.rows[temp4[y].row1].rowSquare[c].possible[temp4[y].val] == 1  )
                                  ||  ( this.rows[temp4[y].row2].rowSquare[c].solved <= 0 &&  this.rows[temp4[y].row2].rowSquare[c].possible[temp4[y].val] == 1)) ) { 
                            sqRemove.push({ 
                                row1: temp4[x].row1, 
                                row2: temp4[x].row2, 
                                col1: temp4[x].col, 
                                col2: temp4[y].col, 
                                val: temp4[y].val 
                            }); 
                            break outloop6b;
                        }
                    }
                }
            }
        }

        if (sqRemove.length > 0) { 
            this.rows[sqRemove[0].row1].featureRow();
            this.rows[sqRemove[0].row2].featureRow();
            
            /* highlight the value in the 4 cells that we're keeping */
            Utils.featureNum(sqRemove[0].row1, sqRemove[0].col1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row1, sqRemove[0].col2, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row2, sqRemove[0].col1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row2, sqRemove[0].col2, sqRemove[0].val + 1); 

            /* highlight the same value in the other cells that we're removing */
            this.rows[sqRemove[0].row1].featureRemoves([sqRemove[0].val + 1], [sqRemove[0].col1, sqRemove[0].col2]);   // params are value to remove & array of cells to ignore
            this.rows[sqRemove[0].row2].featureRemoves([sqRemove[0].val + 1], [sqRemove[0].col1, sqRemove[0].col2]);

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For Four Corners ';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Rows';  
            self = this; 

            let delayVal = Delay.getDelay('step3', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep4b(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep4b(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                   
            }
        }
    }

    async finishStep4b(sqRemove) {           
        self.possibles.modPossibleRow(sqRemove[0].row1, sqRemove[0].val + 1, [sqRemove[0].col1, sqRemove[0].col2]);   // 3rd param is excludes array;  
		self.possibles.modPossibleRow(sqRemove[0].row2, sqRemove[0].val + 1, [sqRemove[0].col1, sqRemove[0].col2]);   // 3rd param is excludes array; 
        
        self.rows[sqRemove[0].row1].unfeatureRow();
        self.rows[sqRemove[0].row2].unfeatureRow();
        
        Utils.unfeatureNum(sqRemove[0].row1, sqRemove[0].col1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row1, sqRemove[0].col2, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row2, sqRemove[0].col1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row2, sqRemove[0].col2, sqRemove[0].val + 1); 
        
        self.rows[sqRemove[0].row1].unfeatureRemoves([sqRemove[0].val + 1], [sqRemove[0].col1, sqRemove[0].col2]);   // params are value to remove & array of cells to ignore
        self.rows[sqRemove[0].row2].unfeatureRemoves([sqRemove[0].val + 1], [sqRemove[0].col1, sqRemove[0].col2]);
        
        Utils.clearMsgs(); 
    }

    /*-----------------------------------------------------------------------------------------------------------------------*/
    /*  Step 5 -- Y Wing (Three Corners of 2 Possibles) - find 3 cells w/ 2 possibles each that represent a total of 3 
                    values (e.g. 4,5,6).  The 3 cells should form a pivot, meaning that cell1 shares a row/col/box with 
                    cell2 and also shares a row/col/box with cell3.  Based on this, we can eliminate possibles for other 
                    nearby cells.                                                                                            */
    /*-----------------------------------------------------------------------------------------------------------------------*/               
    async yWing() { 
        self = this; 
        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await this.yWingRowCol();   // looks for Y-Wing where 2 cells are in the same row, and a 3rd is in the column of the 1st cell;  all w/ 2 of 3 shared values      
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.yWingBoxRow();   // looks for Y-Wing where 2 cells are in the same row, and a 3rd is in the box of the 1st cell;  all w/ 2 of 3 shared values   
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.yWingBoxCol();   // looks for Y-Wing where 2 cells are in the same row, and a 3rd is in the box of the 1st cell;  all w/ 2 of 3 shared values         
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        this.nextStep("60");   // nothing found - proceed to next step
    } 

    async yWingRowCol() { 
        console.log('yWingRowCol'); 
        var temp4 = []; 
        var sqRemove = [];   
        outloop8a: 
        for (let i = 0; i < this.SIZE; i++) {		// rows
            temp4 = []; 
            /* Capture all cells that have just two possible values */   
            for (let j = 0; j < this.SIZE; j++) { 
                if (this.squares[i][j].solvable == 2) { 
                    temp4.push(j); 
                }
            }
            var trow = {}; 
            if (temp4.length > 1) trow = this.rows[i].getOneValMatch(temp4);   // uses array of 2-possible columns to check if any 2 in this row have exactly 1 possible in common
            for (let k = 0; k < trow.length; k++) {
                var matchrow = this.cols[trow[k].col1].getTwoValsMatch({val1: trow[k].unmat1, val2: trow[k].unmat2, exclude: [trow[k].row]});   // 3rd param is excludes array, so we don't select one of the pivots
                // Checks if a cell is found in the first column with 2 possible values (1 that matches a value cell 1, and one that matches a value in cell 2 -- this will complete the corner )
                if (matchrow > -1) {
                    // Checks if there is a possible value to remove in cell 4 (diagonally across from cell 1);  if so we can exit the loop and proceed with processing  
                    if (this.squares[matchrow][trow[k].col2].possible[trow[k].unmat2] == 1)  {
                        // Store this data in an object & Exit this logic 
                        sqRemove.push({ row1: trow[k].row, row2: matchrow, col1: trow[k].col1, col2: trow[k].col2, val: trow[k].unmat2 });  // row1,col1 is pivot cell;  row2,col2 is the remove cell
                        break outloop8a; 
                    }
                }
				// same logic to find a match for the cell in the 2nd column 
                var matchrow = this.cols[trow[k].col2].getTwoValsMatch({val1: trow[k].unmat1, val2: trow[k].unmat2, exclude: [trow[k].row]});   // 3rd param is excludes array, so we don't select one of the pivots
                // Checks if a cell is found in the second column with 2 possible values (1 that matches a value in cell 1, and one that matches a value in cell 2 -- this will complete the corner) 
                if (matchrow > -1) {
                    // Checks if there is a possible value to remove in cell 4 (diagonally across from cell 2);  if so we can exit the loop and proceed with processing  
                    if (this.squares[matchrow][trow[k].col1].possible[trow[k].unmat1] == 1)  {
                        // Store this data in an object & Exit this logic 
                        sqRemove.push({ row1: trow[k].row, row2: matchrow, col1: trow[k].col2, col2: trow[k].col1, val: trow[k].unmat1 });  // row1,col1 is pivot cell;  row2,col2 is the remove cell
                        break outloop8a; 
                    }
                }
            }
        }

        /* jv -- Highlight the 3 Corner cells & highlight the remove possibles or the 4th cell;  highlight the row/col of the 4th cell  */ 

        if (sqRemove.length > 0) { 
            this.rows[sqRemove[0].row2].featureRow();
            this.cols[sqRemove[0].col2].featureCol();

       		/* highlight the value in the 3 cells that we're keeping */
            Utils.featureNum(sqRemove[0].row1, sqRemove[0].col1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row1, sqRemove[0].col2, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].row2, sqRemove[0].col1, sqRemove[0].val + 1); 
            this.squares[sqRemove[0].row1][sqRemove[0].col1].featureCell();  
            this.squares[sqRemove[0].row1][sqRemove[0].col2].featureCell(); 
            this.squares[sqRemove[0].row2][sqRemove[0].col1].featureCell(); 
            
            /* highlight the same value in the other cells that we're removing */
            this.squares[sqRemove[0].row2][sqRemove[0].col2].featureRemoves(sqRemove[0].val + 1);  

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For Three Intersecting Cells (Y Wing - RowCol)';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Intersecting Cell';  
            self = this; 

            let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep5a(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep5a(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                    
            }
        }
    }

    async finishStep5a(sqRemove) {           		
        self.possibles.removePossible(sqRemove[0].row2, sqRemove[0].col2, sqRemove[0].val + 1);  
						
        self.rows[sqRemove[0].row2].unfeatureRow();
        self.cols[sqRemove[0].col2].unfeatureCol();

        Utils.unfeatureNum(sqRemove[0].row1, sqRemove[0].col1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row1, sqRemove[0].col2, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].row2, sqRemove[0].col1, sqRemove[0].val + 1); 
        self.squares[sqRemove[0].row1][sqRemove[0].col1].unfeatureCell();  
        self.squares[sqRemove[0].row1][sqRemove[0].col2].unfeatureCell(); 
        self.squares[sqRemove[0].row2][sqRemove[0].col1].unfeatureCell(); 					
        
        self.squares[sqRemove[0].row2][sqRemove[0].col2].unfeatureRemoves(sqRemove[0].val + 1);  
        
        Utils.clearMsgs(); 
    }

    async yWingBoxRow() { 
        console.log('yWingBoxRow'); 
        var temp4 = []; 
        var sqRemove = [];  

        outloop8b: 
        for (let i = 0; i < this.SIZE; i++) {		// rows
            temp4 = []; 
            /* Capture all cells that have just two possible values */   
            for (let j = 0; j < this.SIZE; j++) { 
                if (this.squares[i][j].solvable == 2) { 
                    //temp4.push({row: i, col: j, val1: this.squares[i][j].possible[0], val2: this.squares[i][j].possible[1] });  
                    temp4.push(j); 
                }
            }
            var trow = {}; 
            if (temp4.length > 1) trow = this.rows[i].getOneValMatch(temp4);   // uses array of 2-possible columns to check if any 2 in this row have exactly 1 possible in common
            // e.g. trow = {row: this.rownum, col1: ary[e], col2: ary[f], mat: m0.mat, unmat1: m0.unmat1, unmat2: m0.unmat2}
            for (let k = 0; k < trow.length; k++) {
                var bx = this.squares[i][trow[k].col1].box; 
                var b2 = this.squares[trow[k].row][trow[k].col2].box; 
                if (bx == b2) continue;   								// do not select cells that are in the same row & same box
                var sq = this.squares[i][trow[k].col1].sqnum; 
                var sq_exclude = Utils.getSquaresForRow(i); 
                
                // Checks if a cell is found in the cell 1 box with 2 possible values (w/ 1 that matches a value in cell 1, and one that matches a value in cell 2 -- this will complete the Y Wing )
                var matchdat = this.boxes[bx].getTwoValsMatch({val1: trow[k].unmat1, val2: trow[k].unmat2, exclude: sq_exclude});    // 3rd param is excludes array, so we don't select one of the pivots
                if (matchdat > -1) {
                    // Checks if there is a possible value to remove in Cell1 box / Cell2 row OR a possible to remove in Cell2 box / Cell1 row);  if so we can exit the loop and proceed with processing 
                    //   params are (1) row to check w/in box, (2) value, (3) cols to exclude in check
                    var fndp = this.boxes[bx].rowPossibles(trow[k].row, trow[k].unmat2, [trow[k].col1]);   // unmat2 is the # in cell2 that does not match the Pivot (also the shared value between cell2 & 3)
                    //var b2 = this.squares[trow[k].row][trow[k].col2].box; 
                    // this.boxes[bx].boxSquare[matchdat].row is the row of cell3
                    var fndq = this.boxes[b2].rowPossibles(this.boxes[bx].boxSquare[matchdat].row, trow[k].unmat2, [trow[k].col2]);   // unmat2 is the # in cell2 that does not match the Pivot (also the shared value between cell2 & 3)

                    if (fndp.length > 0 || fndq.length > 0) {
                        sqRemove.push({ 
                            pivot_row: trow[k].row, pivot_col: trow[k].col1, 
                            cell2_row: trow[k].row, cell2_col: trow[k].col2, 
                            cell3_row: this.boxes[bx].boxSquare[matchdat].row, cell3_col: this.boxes[bx].boxSquare[matchdat].column,  
                            box1_poss: fndp,
                            box2_poss: fndq, 
                            val: trow[k].unmat2, 
                            box1: bx, 
                            box2: b2
                        }); 
                        break outloop8b; 
                    }				
                }
 
                // same logic to find a match using cell 2 as the Pivot 
                // Checks if a cell is found in the cell 2 box with 2 possible values (1 value match to cell 1, and 1 value match to cell 2 -- this will complete the Y Wing )
                var b2 = this.squares[trow[k].row][trow[k].col2].box; 
                
                var matchdat = this.boxes[b2].getTwoValsMatch({val1: trow[k].unmat1, val2: trow[k].unmat2, exclude: sq_exclude});   // 3rd param is excludes array, so we don't select one of the pivots
                if (matchdat > -1) {
                    // Checks if there is a possible value to remove in Cell1 box / Cell2 row OR a possible to remove in Cell2 box / Cell1 row);  if so we can exit the loop and proceed with processing  
                    //   params are (1) row to check w/in box, (2) value, (3) cols to exclude in check  
                    var fndp = this.boxes[b2].rowPossibles(trow[k].row, trow[k].unmat1, [trow[k].col2]);   // unmat1 is the # in cell1 that does not match the Pivot (also the shared value between cell1 & 3)
                    var fndq = this.boxes[bx].rowPossibles(this.boxes[b2].boxSquare[matchdat].row, trow[k].unmat1, [trow[k].col1]);   // unmat1 is the # in cell1 that does not match the Pivot (also the shared value between cell1 & 3)
                    if (fndp.length > 0 || fndq.length > 0) {
                        sqRemove.push({ 
                            pivot_row: trow[k].row, pivot_col: trow[k].col2, 
                            cell2_row: trow[k].row, cell2_col: trow[k].col1, 
                            cell3_row: this.boxes[b2].boxSquare[matchdat].row, cell3_col: this.boxes[b2].boxSquare[matchdat].column,  
                            box1_poss: fndp,
                            box2_poss: fndq, 
                            val: trow[k].unmat1, 
                            box1: bx, 
                            box2: b2
                        }); 
                        break outloop8b; 
                    }				
                }
            }
        }


        /* jv -- Highlight the 3 Corner cells & highlight the remove possibles in the 2 boxes;  highlight the 2 boxes  */ 
        
        if (sqRemove.length > 0) { 
            this.boxes[sqRemove[0].box1].featureBox();
            this.boxes[sqRemove[0].box2].featureBox();
            
            /* highlight the value in the 3 cells that we're keeping */
            Utils.featureNum(sqRemove[0].pivot_row, sqRemove[0].pivot_col, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].cell2_row, sqRemove[0].cell2_col, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].cell3_row, sqRemove[0].cell3_col, sqRemove[0].val + 1); 
            this.squares[sqRemove[0].pivot_row][sqRemove[0].pivot_col].featureCell();  
            this.squares[sqRemove[0].cell2_row][sqRemove[0].cell2_col].featureCell(); 
            this.squares[sqRemove[0].cell3_row][sqRemove[0].cell3_col].featureCell(); 
            
            /* highlight the same value in the Box 1 cells that we're removing */
            for (let a = 0; a < sqRemove[0].box1_poss.length; a++) {
                this.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].featureRemoves(sqRemove[0].val + 1);   
            }
            /* highlight the same value in the Box 2 cells that we're removing */
            for (let a = 0; a < sqRemove[0].box2_poss.length; a++) {
                this.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].featureRemoves(sqRemove[0].val + 1);   
            }

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For Three Intersecting Cells (Y Wing - BoxRow)';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Intersecting Cell';  
            self = this; 

            let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep5b(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep5b(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                    
            }
        }
    }

    async finishStep5b(sqRemove) {      
        for (let a = 0; a < sqRemove[0].box1_poss.length; a++) {
            let ir = self.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].row; 
            let ic = self.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].column; 
            self.possibles.removePossible(ir, ic, sqRemove[0].val + 1);    
        }	
        for (let a = 0; a < sqRemove[0].box2_poss.length; a++) {
            let ir = self.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].row; 
            let ic = self.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].column; 
            self.possibles.removePossible(ir, ic, sqRemove[0].val + 1);    
        }			

        self.boxes[sqRemove[0].box1].unfeatureBox();
        self.boxes[sqRemove[0].box2].unfeatureBox();
						
        Utils.unfeatureNum(sqRemove[0].pivot_row, sqRemove[0].pivot_col, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].cell2_row, sqRemove[0].cell2_col, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].cell3_row, sqRemove[0].cell3_col, sqRemove[0].val + 1); 
        self.squares[sqRemove[0].pivot_row][sqRemove[0].pivot_col].unfeatureCell();  
        self.squares[sqRemove[0].cell2_row][sqRemove[0].cell2_col].unfeatureCell(); 
        self.squares[sqRemove[0].cell3_row][sqRemove[0].cell3_col].unfeatureCell(); 			
        
        /* highlight the same value in the Box 1 cells that we're removing */
        for (let a = 0; a < sqRemove[0].box1_poss.length; a++) {
            self.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].unfeatureRemoves(sqRemove[0].val + 1);   
        }
        /* highlight the same value in the Box 2 cells that we're removing */
        for (let a = 0; a < sqRemove[0].box2_poss.length; a++) {
            self.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].unfeatureRemoves(sqRemove[0].val + 1);   
        } 
        
        Utils.clearMsgs(); 
    }

    async yWingBoxCol() { 
        console.log('yWingBoxCol'); 
        var temp4 = []; 
        var sqRemove = [];  

        outloop8c: 
        for (let j = 0; j < this.SIZE; j++) {		// rows
            temp4 = []; 
            /* Capture all cells that have just two possible values */   
            for (let i = 0; i < this.SIZE; i++) { 
                if (this.squares[i][j].solvable == 2) { 
                    temp4.push(i); 
                }
            }
            var trow = {}; 
            if (temp4.length > 1) trow = this.cols[j].getOneValMatch(temp4);   // uses array of 2-possibles (temp4) to check if any 2 of these have exactly 1 possible in common
            // e.g. trow = {col: this.colnum, row1: ary[e], row2: ary[f], mat: m0.mat, unmat1: m0.unmat1, unmat2: m0.unmat2}
            for (let k = 0; k < trow.length; k++) {
                var bx = this.squares[trow[k].row1][j].box; 
                var b2 = this.squares[trow[k].row2][trow[k].col].box; 
                if (bx == b2) continue;   								// do not select cells that are in the same col & same box					
                var sq = this.squares[trow[k].row1][j].sqnum; 
                var sq_exclude = Utils.getSquaresForCol(j); 
                
                // Checks if a cell is found in the cell 1 box with 2 possible values (w/ 1 that matches a value in cell 1, and one that matches a value in cell 2 -- this will complete the Y Wing )
                var matchdat = this.boxes[bx].getTwoValsMatch({val1: trow[k].unmat1, val2: trow[k].unmat2, exclude: sq_exclude});   // 3rd param is excludes array, so we don't select one of the pivots
                if (matchdat > -1) {
                    // Checks if there is a possible value to remove in Cell1 box / Cell2 col OR a possible to remove in Cell2 box / Cell3 col);  if so we can exit the loop and proceed with processing  
                    //   params are (1) column to check w/in box, (2) value, (3) rows to exclude in check  
                    var fndp = this.boxes[bx].colPossibles(trow[k].col, trow[k].unmat2, [trow[k].row1]);   // unmat2 is the # in cell2 that does not match the Pivot (also the shared value between cell2 & 3);  3rd param is excludes
                    // this.boxes[bx].boxSquare[matchdat].column is the column of cell3
                    var fndq = this.boxes[b2].colPossibles(this.boxes[bx].boxSquare[matchdat].column, trow[k].unmat2, [trow[k].row2]);   // unmat2 is the # in cell2 that does not match the Pivot (also the shared value between cell2 & 3)

                    if (fndp.length > 0 || fndq.length > 0) {
                        sqRemove.push({ 
                            pivot_row: trow[k].row1, pivot_col: trow[k].col, 
                            cell2_row: trow[k].row2, cell2_col: trow[k].col, 
                            cell3_row: this.boxes[bx].boxSquare[matchdat].row, cell3_col: this.boxes[bx].boxSquare[matchdat].column,  
                            box1_poss: fndp,
                            box2_poss: fndq, 
                            val: trow[k].unmat2, 
                            box1: bx, 
                            box2: b2
                        }); 
                        break outloop8c; 
                    }				
                }
 
                // ****  cell 2 as the Pivot  ****   , same logic to find a match using cell 2 as the Pivot 
                // Checks if a cell is found in the cell 2 box with 2 possible values (1 value match to cell 1, and 1 value match to cell 2 -- this will complete the Y Wing )
                //var b2 = this.squares[trow[k].row2][trow[k].col].box; 
                
                var matchdat = this.boxes[b2].getTwoValsMatch({val1: trow[k].unmat1, val2: trow[k].unmat2, exclude: sq_exclude});   // 3rd param is excludes array, so we don't select one of the pivots
                if (matchdat > -1) {
                    // Checks if there is a possible value to remove in Cell2 box / Cell1 col OR a possible to remove in Cell1 box / Cell2 col);  if so we can exit the loop and proceed with processing  
                    var fndp = this.boxes[b2].colPossibles(trow[k].col, trow[k].unmat1, [trow[k].row2]);   // unmat1 is the # in cell1 that does not match the Pivot (also the shared value between cell1 & 3);  3rd param is excludes
                    var fndq = this.boxes[bx].colPossibles(this.boxes[b2].boxSquare[matchdat].column, trow[k].unmat1, [trow[k].row1]);   // unmat1 is the # in cell1 that does not match the Pivot (also the shared value between cell1 & 3)

                    if (fndp.length > 0 || fndq.length > 0) {
                        sqRemove.push({ 
                            pivot_row: trow[k].row2, pivot_col: trow[k].col, 
                            cell2_row: trow[k].row1, cell2_col: trow[k].col, 
                            cell3_row: this.boxes[b2].boxSquare[matchdat].row, cell3_col: this.boxes[b2].boxSquare[matchdat].column,  
                            box1_poss: fndp,
                            box2_poss: fndq, 
                            val: trow[k].unmat1, 
                            box1: b2, 
                            box2: bx
                        }); 
                        break outloop8c; 
                    }				
                }
            }
        }


        /* jv -- Highlight the 3 Corner cells & highlight the remove possibles in the 2 boxes;  highlight the 2 boxes  */ 
        
        if (sqRemove.length > 0) { 
            this.boxes[sqRemove[0].box1].featureBox();
            this.boxes[sqRemove[0].box2].featureBox();
            
            /* highlight the value in the 3 cells that we're keeping */
            Utils.featureNum(sqRemove[0].pivot_row, sqRemove[0].pivot_col, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].cell2_row, sqRemove[0].cell2_col, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].cell3_row, sqRemove[0].cell3_col, sqRemove[0].val + 1); 
            this.squares[sqRemove[0].pivot_row][sqRemove[0].pivot_col].featureCell();  
            this.squares[sqRemove[0].cell2_row][sqRemove[0].cell2_col].featureCell(); 
            this.squares[sqRemove[0].cell3_row][sqRemove[0].cell3_col].featureCell(); 
            
            /* highlight the same value in the Box 1 cells that we're removing */
            for (let a = 0; a < sqRemove[0].box1_poss.length; a++) {
                this.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].featureRemoves(sqRemove[0].val + 1);   
            }
            /* highlight the same value in the Box 2 cells that we're removing */
            for (let a = 0; a < sqRemove[0].box2_poss.length; a++) {
                this.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].featureRemoves(sqRemove[0].val + 1);   
            }

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For Three Intersecting Cells (Y Wing - BoxCol)';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Intersecting Cell';  
            self = this; 

            let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep5c(sqRemove); 
            else {
                var cback = function(e) { 
                    self.finishStep5c(sqRemove); 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');  
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                  
            }
        }
    }

    async finishStep5c(sqRemove) {      
        for (let a = 0; a < sqRemove[0].box1_poss.length; a++) {
            let ir = self.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].row; 
            let ic = self.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].column; 
            self.possibles.removePossible(ir, ic, sqRemove[0].val + 1);    
        }	
        for (let a = 0; a < sqRemove[0].box2_poss.length; a++) {
            let ir = self.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].row; 
            let ic = self.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].column; 
            self.possibles.removePossible(ir, ic, sqRemove[0].val + 1);    
        }			

        self.boxes[sqRemove[0].box1].unfeatureBox();
        self.boxes[sqRemove[0].box2].unfeatureBox();
						
        Utils.unfeatureNum(sqRemove[0].pivot_row, sqRemove[0].pivot_col, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].cell2_row, sqRemove[0].cell2_col, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].cell3_row, sqRemove[0].cell3_col, sqRemove[0].val + 1); 
        self.squares[sqRemove[0].pivot_row][sqRemove[0].pivot_col].unfeatureCell();  
        self.squares[sqRemove[0].cell2_row][sqRemove[0].cell2_col].unfeatureCell(); 
        self.squares[sqRemove[0].cell3_row][sqRemove[0].cell3_col].unfeatureCell(); 			
        
        /* unhighlight the same value in the Box 1 cells that we're removing */
        for (let a = 0; a < sqRemove[0].box1_poss.length; a++) {
            self.boxes[sqRemove[0].box1].boxSquare[sqRemove[0].box1_poss[a]].unfeatureRemoves(sqRemove[0].val + 1);   
        }
        /* unhighlight the same value in the Box 2 cells that we're removing */
        for (let a = 0; a < sqRemove[0].box2_poss.length; a++) {
            self.boxes[sqRemove[0].box2].boxSquare[sqRemove[0].box2_poss[a]].unfeatureRemoves(sqRemove[0].val + 1);   
        }
        
        Utils.clearMsgs(); 
    }

    /*-----------------------------------------------------------------------------------------------------------------------*/
    /*  Step 6 -- XYZ Wing - find 2 cells in a box (one w/ 3 nums (the pivot) & one w/ 2 of those 3 nums (cell2)).  
                    Then find a square in the same row or col as the pivot that has 2 of those 3 nums (but diff than those 
                    of cell2).  If there is an intersecting cell w/in the box w/ a possible value that occurs in 
                    all 3 of the other cells, this can be removed as impossible.                                             */
    /*-----------------------------------------------------------------------------------------------------------------------*/                
    async xyzWing() { 
        self = this; 
        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await this.xyzWingRow();   // looks for XYZ-Wing where 3rd cell is in the same row w/ the 3-value pivot cell (& contains 2 of the 3 values)     
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        await this.xyzWingCol();   // looks for XYZ-Wing where 3rd cell is in the same col w/ the 3-value pivot cell (& contains 2 of the 3 values)   
        console.log('RETURN xyzWingCol == deadend = ' + this.deadend); 
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        this.nextStep("70");   // nothing found - proceed to next step
    } 

    async xyzWingRow() { 
        console.log('xyzWingRow'); 
        var temp3 = []; 
        var temp2 = []; 
        var sqRemove = [];   
        
        outloop9: 
        for (let b = 0; b < this.SIZE; b++) {		// boxes
            temp3 = []; temp2 = [];  
            // Capture all cells that have just 3 possible values, and all that have just 2 possible values   
             for (let c = 0; c < this.SIZE; c++) { 
                if (this.boxes[b].boxSquare[c].solvable == 3) temp3.push(c); 
                else if (this.boxes[b].boxSquare[c].solvable == 2) temp2.push(c);
            }
            var tbox = {}; 
            if (temp3.length < 1 || temp2.length < 1) continue; 
            tbox = this.boxes[b].xyzMatchTwoVals(temp3,temp2);    // compare squares w/ 3 vals to those w/ 2 vals to see if the 2 vals are a subset of the 3;  returns an array;   

            // tbox = array of ({ found: true, pivot: this.boxSquare[array3[i3]], cell2: this.boxSquare[array2[i2]], matvals: pvals });           
            for (let k = 0; k < tbox.length; k++) {
                var match3rd = this.rows[tbox[k].pivot.row].getXyzPivotMatchRow({pvt: tbox[k].pivot, matched2: tbox[k].matvals, excludebox: b});  // 3rd param is excludes box - do not match any cells in this box
                if (match3rd.length > 0) { 
                    var excludes = []; 
                    excludes.push(tbox[k].pivot.boxsq); 
                    excludes.push(tbox[k].cell2.boxsq); 
                    for (let m = 0; m < this.SIZE; m++) {
                        if (excludes.indexOf(m) > -1) continue; 
                        if (this.boxes[b].boxSquare[m].solved > 0) continue; 
                        //if (this.boxes[b].boxSquare[m].possible[match3rd[0].mat] == 1)  {
                        if (this.boxes[b].boxSquare[m].possible[match3rd[0].mat] == 1  &&  this.boxes[b].boxSquare[m].row == tbox[k].pivot.row)  {
                            sqRemove.push({
                                box: b, val: match3rd[0].mat, 
                                delrow: this.boxes[b].boxSquare[m].row, delcol: this.boxes[b].boxSquare[m].column, 
                                keeprow1: tbox[k].pivot.row, keepcol1: tbox[k].pivot.column, 
                                keeprow2: tbox[k].cell2.row, keepcol2: tbox[k].cell2.column, 
                                keeprow3: match3rd[0].cell3.row, keepcol3: match3rd[0].cell3.column 
                            }); 
                            break outloop9; 
                        }
                    }
                }
            }
        }

        /* jv -- Highlight the 3 Corner cells & highlight the remove possibles or the 4th cell;  highlight the row/col of the 4th cell  */ 

        if (sqRemove.length > 0) { 
            // highlight the value in the 3 cells that we're keeping 
            Utils.featureNum(sqRemove[0].keeprow1, sqRemove[0].keepcol1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].keeprow2, sqRemove[0].keepcol2, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].keeprow3, sqRemove[0].keepcol3, sqRemove[0].val + 1); 
            this.squares[sqRemove[0].keeprow1][sqRemove[0].keepcol1].featureCell();  
            this.squares[sqRemove[0].keeprow2][sqRemove[0].keepcol2].featureCell(); 
            this.squares[sqRemove[0].keeprow3][sqRemove[0].keepcol3].featureCell(); 
            
            // highlight the same value in the other cells that we're removing 
            this.squares[sqRemove[0].delrow][sqRemove[0].delcol].featureRemoves(sqRemove[0].val + 1);    

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For XYZ Wing - row';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Intersecting Cell';  
            self = this; 

            let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep6a(sqRemove, 0); // 0 means Not Manual (Auto) mode 
            else {
                var cback = function(e) { 
                    self.finishStep6a(sqRemove, 1);     // 1 means Manual mode 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                  
            }
        }
    }

    async finishStep6a(sqRemove) {           		
        self.possibles.removePossible(sqRemove[0].delrow, sqRemove[0].delcol, sqRemove[0].val + 1);   
						
        Utils.unfeatureNum(sqRemove[0].keeprow1, sqRemove[0].keepcol1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].keeprow2, sqRemove[0].keepcol2, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].keeprow3, sqRemove[0].keepcol3, sqRemove[0].val + 1); 
        self.squares[sqRemove[0].keeprow1][sqRemove[0].keepcol1].unfeatureCell();  
        self.squares[sqRemove[0].keeprow2][sqRemove[0].keepcol2].unfeatureCell(); 
        self.squares[sqRemove[0].keeprow3][sqRemove[0].keepcol3].unfeatureCell(); 				
        
        self.squares[sqRemove[0].delrow][sqRemove[0].delcol].unfeatureRemoves(sqRemove[0].val + 1); 
        
        Utils.clearMsgs(); 
    }

    async xyzWingCol() { 
        console.log('xyzWingCol'); 
        var temp3 = []; 
        var temp2 = []; 
        var sqRemove = [];   
        
        outloop9b: 
        for (let b = 0; b < this.SIZE; b++) {		// boxes
            temp3 = []; temp2 = [];  
            // Capture all cells that have just 3 possible values, and all that have just 2 possible values   
             for (let c = 0; c < this.SIZE; c++) { 
                if (this.boxes[b].boxSquare[c].solvable == 3) temp3.push(c); 
                else if (this.boxes[b].boxSquare[c].solvable == 2) temp2.push(c);
            }
            var tbox = {}; 
            if (temp3.length < 1 || temp2.length < 1) continue; 
            tbox = this.boxes[b].xyzMatchTwoVals(temp3,temp2);    // compare squares w/ 3 vals to those w/ 2 vals to see if the 2 vals are a subset of the 3;  returns an array;   

            // tbox = array of ({ found: true, pivot: this.boxSquare[array3[i3]], cell2: this.boxSquare[array2[i2]], matvals: pvals });           
            for (let k = 0; k < tbox.length; k++) {
                var match3rd = this.cols[tbox[k].pivot.column].getXyzPivotMatchCol({pvt: tbox[k].pivot, matched2: tbox[k].matvals, excludebox: b});  // 3rd param is excludes box - do not match any cells in this box
                if (match3rd.length > 0) { 
                    var excludes = []; 
                    excludes.push(tbox[k].pivot.boxsq); 
                    excludes.push(tbox[k].cell2.boxsq); 
                    for (let m = 0; m < this.SIZE; m++) {
                        if (excludes.indexOf(m) > -1) continue; 
                        if (this.boxes[b].boxSquare[m].solved > 0) continue; 
                        if (this.boxes[b].boxSquare[m].possible[match3rd[0].mat] == 1  &&  this.boxes[b].boxSquare[m].column == tbox[k].pivot.column)  {
                            sqRemove.push({
                                box: b, val: match3rd[0].mat, 
                                delrow: this.boxes[b].boxSquare[m].row, delcol: this.boxes[b].boxSquare[m].column, 
                                keeprow1: tbox[k].pivot.row, keepcol1: tbox[k].pivot.column, 
                                keeprow2: tbox[k].cell2.row, keepcol2: tbox[k].cell2.column, 
                                keeprow3: match3rd[0].cell3.row, keepcol3: match3rd[0].cell3.column 
                            }); 
                            break outloop9b; 
                        }
                    }
                }
            }
        }

        /* jv -- Highlight the 3 Corner cells & highlight the remove possibles or the 4th cell;  highlight the row/col of the 4th cell  */ 

        if (sqRemove.length > 0) { 
            // highlight the value in the 3 cells that we're keeping 
            Utils.featureNum(sqRemove[0].keeprow1, sqRemove[0].keepcol1, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].keeprow2, sqRemove[0].keepcol2, sqRemove[0].val + 1); 
            Utils.featureNum(sqRemove[0].keeprow3, sqRemove[0].keepcol3, sqRemove[0].val + 1); 
            this.squares[sqRemove[0].keeprow1][sqRemove[0].keepcol1].featureCell();  
            this.squares[sqRemove[0].keeprow2][sqRemove[0].keepcol2].featureCell(); 
            this.squares[sqRemove[0].keeprow3][sqRemove[0].keepcol3].featureCell(); 
            
            // highlight the same value in the other cells that we're removing 
            this.squares[sqRemove[0].delrow][sqRemove[0].delcol].featureRemoves(sqRemove[0].val + 1);    

            this.deadend = 0; 
            document.getElementById("progress_msg").innerText = '*** Check For XYZ Wing - column';
            document.getElementById("progress_msg2").innerText = 'Update Possible values in Intersecting Cell';  
            self = this; 

            let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
            await Delay.sleep(delayVal); 

            if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  {
                await this.finishStep6b(sqRemove, 0);        // 0 means Not Manual (Auto) mode 
                // self.nextStep('0', 'end'); 
            }
            else {
                var cback = function(e) { 
                    self.finishStep6b(sqRemove, 1);     // 1 means Manual mode 
                    Utils.removeListeners(cback);
                    Utils.unfreezePage(self.params);
                    self.nextStep('0', 'end');
                }
                Utils.freezePage(self.params.twoClick_active);
                Utils.addListeners(cback);                  
            }
        }
    }

    async finishStep6b(sqRemove, manual) {         
        console.log('finishStep6b -- manual = ' + manual);   		
        self.possibles.removePossible(sqRemove[0].delrow, sqRemove[0].delcol, sqRemove[0].val + 1);   
						
        Utils.unfeatureNum(sqRemove[0].keeprow1, sqRemove[0].keepcol1, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].keeprow2, sqRemove[0].keepcol2, sqRemove[0].val + 1); 
        Utils.unfeatureNum(sqRemove[0].keeprow3, sqRemove[0].keepcol3, sqRemove[0].val + 1); 
        self.squares[sqRemove[0].keeprow1][sqRemove[0].keepcol1].unfeatureCell();  
        self.squares[sqRemove[0].keeprow2][sqRemove[0].keepcol2].unfeatureCell(); 
        self.squares[sqRemove[0].keeprow3][sqRemove[0].keepcol3].unfeatureCell(); 				
        
        self.squares[sqRemove[0].delrow][sqRemove[0].delcol].unfeatureRemoves(sqRemove[0].val + 1); 
        
        Utils.clearMsgs(); 
        console.log('finishStep6b -- call nextStep 0');  
        self.deadend = 0; 
    }

    /*-----------------------------------------------------------------------------------------------------------------------*/
    /*  Step 7 -- Number Chain - find all rows/cols/boxes with 2 possiblities for values;  Chain those in alternating 
                    cells for values (e.g. cell1 can be a '5', so cell2 cannot be a '5', so cell3 would be a '5'
                    and so on.  If the path at any point results in 2 cells with a '5' in the same row/col/box, both 
                    cells can have the '5' removed as a possible.  
                    Also, if there is an intersecting cell to chain elements can-be 5 and a cannot-be 5, then this 
                    intersecting cell can be removed as a possible also.  
    /*-----------------------------------------------------------------------------------------------------------------------*/             
    async numberChain() { 
        self = this; 
        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await this.checkChain();   // looks for XYZ-Wing where 3rd cell is in the same row w/ the 3-value pivot cell (& contains 2 of the 3 values)     
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }

        await Delay.sleep(delayVal); 
        this.nextStep("80");   // nothing found - proceed to next step
    } 

    async checkChain() { 
        console.log('checkChain'); 
        var result2 = new Path(this).checkBadPath();     
        if (result2.found == 0) {
            return;
        }
        this.deadend = 0;
        
        if (result2.type == 'intersect') { 
            this.highlightChain2(result2); 
            return; 
            window.alert('return fails'); 
        }

        //    found: 1, chain: st.chain, val: this.currval, del: st.del, keep: st.keep
        var ch = Utils.convert_ccrrbb(result2.chain); 	// converts array of ccrrbb values into array w/ col, row, & box
        var del = Utils.convert_ccrrbb(result2.del); 
        var kp = Utils.convert_ccrrbb(result2.keep); 
        
        // highlight each cell in the chain 
        for (let x = 0; x < ch.length; x++) { 
            this.squares[ch[x].row][ch[x].col].featureCell(); 
        }
        // highlight the value in the cells that we're keeping 
        for (let x = 0; x < kp.length; x++) { 
            Utils.featureNum(kp[x].row, kp[x].col, result2.val + 1);   
        }
        
        // highlight the same value in the other cells that we're removing 
        for (let x = 0; x < del.length; x++) { 
            this.squares[del[x].row][del[x].col].featureRemoves(result2.val + 1);
        }          
        document.getElementById("progress_msg").innerText = '*** Check For Number Chain Invalid';
        document.getElementById("progress_msg2").innerText = 'Update Possible values';  

        self = this; 

        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await Delay.sleep(delayVal); 

        if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep7a(del,ch,kp,result2);   
        else {
            var cback = function(e) { 
                self.finishStep7a(del,ch,kp,result2);    
                Utils.removeListeners(cback);
                Utils.unfreezePage(self.params);
                self.nextStep('0', 'end'); 
            }
            Utils.freezePage(self.params.twoClick_active);
            Utils.addListeners(cback);                   
        }
    }

    async finishStep7a(del,ch,kp,result2) {           		
        for (let x = 0; x < del.length; x++) { 
            self.possibles.removePossible(del[x].row, del[x].col, result2.val + 1);  
        }
        
        // unhighlight each cell in the chain 
        for (let x = 0; x < ch.length; x++) { 
            self.squares[ch[x].row][ch[x].col].unfeatureCell(); 
        }
        // unhighlight the value in the cells that we're keeping 
        for (let x = 0; x < kp.length; x++) { 
            Utils.unfeatureNum(kp[x].row, kp[x].col, result2.val + 1);   
        }
        
        for (let x = 0; x < del.length; x++) { 
            self.squares[del[x].row][del[x].col].unfeatureRemoves(result2.val + 1);
        }   
        
        Utils.clearMsgs(); 
    }

    async highlightChain2(dat) {           		
        console.log('highlightChain2');  
        var ch = Utils.convert_ccrrbb(dat.chain); 	// converts array of ccrrbb values into array w/ col, row, & box
            
        // highlight intersection of cell to be removed 
        this.rows[dat.poss.row].featureRow();
        this.cols[dat.poss.col].featureCol();
            
        // highlight each cell in the chain & the value 
        for (let x = 0; x < ch.length; x++) { 
            this.squares[ch[x].row][ch[x].col].featureCell(); 
            Utils.featureNum(ch[x].row, ch[x].col, dat.val + 1);
            if (x % 2 == 0) this.squares[ch[x].row][ch[x].col].featureRemoves(dat.val + 1, 'Blue');
            else this.squares[ch[x].row][ch[x].col].featureRemoves(dat.val + 1, 'Green');
        }
        
        // highlight the same value in the other cells that we're removing 
        this.squares[dat.poss.row][dat.poss.col].featureRemoves(dat.val + 1);   
            
        document.getElementById("progress_msg").innerText = '*** Check For Number Chain Invalid';
        document.getElementById("progress_msg2").innerText = 'Update Possible values'; 
        self = this; 

        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await Delay.sleep(delayVal); 

        if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep7b(dat,ch);   
        else {
            var cback = function(e) { 
                self.finishStep7b(dat,ch);    
                Utils.removeListeners(cback);
                Utils.unfreezePage(self.params);
                self.nextStep('0', 'end');   
            }
            Utils.freezePage(self.params.twoClick_active);
            Utils.addListeners(cback);                    
        }
    }

    async finishStep7b(dat,ch) {           		
        self.possibles.removePossible(dat.poss.row, dat.poss.col, dat.val + 1);  				
        self.rows[dat.poss.row].unfeatureRow();
        self.cols[dat.poss.col].unfeatureCol();
        
        // unhighlight each cell in the chain & the value 
        for (let x = 0; x < ch.length; x++) { 
            self.squares[ch[x].row][ch[x].col].unfeatureCell(); 
            Utils.unfeatureNum(ch[x].row, ch[x].col, dat.val + 1);
            if (x % 2 == 0) self.squares[ch[x].row][ch[x].col].unfeatureRemoves(dat.val + 1, 'Blue');
            else self.squares[ch[x].row][ch[x].col].unfeatureRemoves(dat.val + 1, 'Green');						
        }
        
        self.squares[dat.poss.row][dat.poss.col].unfeatureRemoves(dat.val + 1);  
        
        Utils.clearMsgs(); 
    }

    /*-----------------------------------------------------------------------------------------------------------------------*/
    /*  Step 8 -- Work Grid -- to try various paths to find a failure that can be used to eliminate invalid possibles        */
    /*-----------------------------------------------------------------------------------------------------------------------*/             
    async lastResort() { 
        self = this; 
        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await this.stepByStep();   // looks for XYZ-Wing where 3rd cell is in the same row w/ the 3-value pivot cell (& contains 2 of the 3 values)
        console.log('RETURN lastResort');      
        if (this.deadend == 0) {
            if (!this.isManual())  await this.endStep('delay1');  // this.nextStep('0', 'end'); 
            return;
        }
        console.log('LastResort -- Call Step 90'); 
        await Delay.sleep(delayVal); 
        this.nextStep("90");   // nothing found - proceed to next step
    }

    async stepByStep() { 
        console.log('stepByStep'); 
        // var result2 = new WorkGrid(this).checkBadPath();  
        let tempWork = new WorkGrid(this); 
        var result2 = tempWork.checkBadPath();   
        console.log('return from WorkGrid');      
        if (result2.found == 0) {
            return;
        }
        this.deadend = 0;
        
        // highlight each cell in the chain & the value 
        for (let x = 0; x < result2.chain.length; x++) { 
            let tmp = Utils.convert_ccrrvv(result2.chain[x]);	/* columnrow-value e.g. 0101-09 */            	
            this.squares[tmp.row][tmp.col].featureCell(); 
            if (x == 0) this.squares[tmp.row][tmp.col].featureRemoves(tmp.val);     // e.g. tmp.val is 1-9
            else this.squares[tmp.row][tmp.col].featureRemoves(tmp.val, 'Blue');
        }
        
        // highlight the values in the deadend cell
        let tvals = this.squares[result2.row][result2.col].getCurrPossibles();   // tvals[] is array of vals 0-8
        for (let y = 0; y < tvals.length; y++) { 
            this.squares[result2.row][result2.col].featureRemoves(tvals[y] + 1, 'Red');  	// not actually removed;  highlighting the deadend cell values          
        }

        document.getElementById("progress_msg").innerText = '*** Last Resort - choose a Cell Value and find a Deadend';
        document.getElementById("progress_msg2").innerText = 'Remove yellow-highlighted starting point - leads to deadend';  

        self = this; 

        let delayVal = Delay.getDelay('step4', this.deadend, this.params); 
        await Delay.sleep(delayVal); 

        console.log('last Resort -- begin part 2'); 
        if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0)  await this.finishStep8(result2);   
        else {
            var cback = function(e) { 
                self.finishStep8(result2);    
                Utils.removeListeners(cback);
                Utils.unfreezePage(self.params);
                self.nextStep('0', 'end');
            }
            Utils.freezePage(self.params.twoClick_active);
            Utils.addListeners(cback);                   
        }
    }

    async finishStep8(result2) {           
        console.log('finishStep8 begin'); 		
        // remove the invalid value in the first chain link 
        let tmp = Utils.convert_ccrrvv(result2.chain[0]);		// first entry in chain contains the invalid first value	
        this.possibles.removePossible(tmp.row, tmp.col, tmp.val); 		// e.g. tmp.val is 1-9
        
        console.log('finishStep8 - unhighlight');
        // unhighlight each cell in the chain & the value 
        for (let x = 0; x < result2.chain.length; x++) { 
            let tmp = Utils.convert_ccrrvv(result2.chain[x]);	/* columnrow-value e.g. 0101-09 */            	
            this.squares[tmp.row][tmp.col].unfeatureCell(); 
    //					Utils.unfeatureNum(tmp.row, tmp.col, tmp.val); 		// e.g. tmp.val is 1-9
            if (x == 0) this.squares[tmp.row][tmp.col].unfeatureRemoves(tmp.val);
            else this.squares[tmp.row][tmp.col].unfeatureRemoves(tmp.val, 'Blue');
        }
        
        // unhighlight the values in the deadend cell
        let tvals = this.squares[result2.row][result2.col].getCurrPossibles();   // tvals[] is array of vals 0-8
        for (let y = 0; y < tvals.length; y++) { 
            this.squares[result2.row][result2.col].unfeatureRemoves(tvals[y] + 1, 'Red');       
        }
        
        Utils.clearMsgs(); 
        console.log('end finishStep8')
        // if (this.isManual()) this.nextStep('0', 'end');   
    }


    isManual() {
        if (this.params.confirm_needed == 0 && this.params.twoClick_active == 0) return 0;  // automatic (not manual)
        else return 1; 
    }

    async endStep(step) {
        let delayVal = Delay.getDelay(step, this.deadend, this.params); 
        await Delay.sleep(delayVal); 
        this.nextStep('0', 'end'); 
    }

}
export { SudokuWin as default }