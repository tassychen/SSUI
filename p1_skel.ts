//=====================================================================
//=====================================================================
// Skeleton Code for:
// Fitts Law Data Collection User Interface (AKA SSUI Project #1) v1.0a 
// by Scott Hudson  8/2023
//
// This code provides a small "micro-toolkit" for building very simple 
// interfaces, primarily via subclasses of the provided UIClass and 
// ScreenObject base-classes.  (These should not be changed.)
//
// Also provided are various piece of class definition and other code
// which provide a "skeleton" that you can fill out to complete Project #1
// (a "Fitts Law Data Collection" UI).  Please refer to the project handout
// and the insructions given in lab for details on what your interface 
// should do when it is completed.
//
// The places in the code skeleton which you should provide include 
// (at least) all those which are marked with a comments of the form:
//    // === YOUR CODE HERE ===
//
//=====================================================================

//========================================
//========================================
// === DON't MODIFY THE FOLLOWING CODE ===
//========================================
//========================================

///=====================================================================
// Utility functions
//=====================================================================

// Function to run a type narrowing validation.  Parameters are: a value to be 
// type checked, a type guard function, and an error message string to be used 
// for the error message for an exception if the test fails.  This returns the 
// value it is passed (the first parameter).
// 
// Note that the compiler's type inference is good enough that if the given 
// function is a type guard (i.e., declared with a "parameter is type" style 
// return type declaration), then it will narrow the result of this function to 
// match the type of the type guard.
function validate(value : any, tester: (v:any) => boolean, errMsg : string) : any {
    if (!tester(value)) throw Error(errMsg);
    return value;
}

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

// Type guard function for HTMLCanvasElement
function isHTMLCanvasElement(canv : any) : canv is HTMLCanvasElement {
    // return (canv && (canv as HTMLCanvasElement).getContext !== undefined); 
    return (canv && (canv instanceof HTMLCanvasElement));
}

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

// Type guard function for CanvasRenderingContext
function isCanvasRenderingContext2D(ctx : any) : ctx is CanvasRenderingContext2D {
    // return (ctx && (ctx as CanvasRenderingContext2D).fillRect !== undefined);
    return (ctx && (ctx instanceof CanvasRenderingContext2D));
}

//=====================================================================
// Base class for managing a (very simple) UI
//=====================================================================

// This class provides a generic base class that manages a set of objects (of type 
// ScreenObject) making up a UI.  It provides generic functions for drawing, handling 
// input, etc. with the details handled by a specialized sub-class and the objects making 
// up the interface
class UIClass {
    // A string indicating one of several global states that the UI can be in
    // The meaning of these strings is detrmined by the sub-class.
    protected _currentState : string = '';
    get currentState() {return this._currentState;}
    set currentState(v : string) {this._currentState = v;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Canvas we implement our UI in (and its drawing context)
    protected _canvas : HTMLCanvasElement;
    get canvas() {return this._canvas;}
    set canvas(v: HTMLCanvasElement) {this._canvas = v;}

    protected _context : CanvasRenderingContext2D;
    get context() {return this._context;}
    set context(v : CanvasRenderingContext2D) {this._context = v;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Has something been changed such that we need to redraw?
    protected _needsRedraw : boolean = false;
    get needsRedraw() {return this._needsRedraw;}
    set needsRedraw(v : boolean) {this._needsRedraw = v;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Set of interactive objects this UI is currently made up of
    // In this simple framework these are treated as a flat set of objects 
    // (no hierarchy) and are drawn in the order they appear in the list.
    protected childObjects : ScreenObject[] = [];

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Construct the UI to operate within the canvas HTML element with the given ID
    constructor(canvasTagID : string) {
        // find and validate the canvas element and it's drawing context
        this._canvas = validate(document.getElementById(canvasTagID), 
                        isHTMLCanvasElement, 
                        `Can't find a canvas element with id: "${canvasTagID}"`);
        this._context = validate(this.canvas.getContext("2d"), 
                            isCanvasRenderingContext2D, 
                            "Can't get main canvas drawing context");

        // create the initial set of UI objects that make up the interface
        this.buildUIObjects();
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Build all the initial objects needed by the UI.
    // This method is called from the constructor here in the base class and
    // should not be called again in sub-class constructors.
    buildUIObjects() {
        // no child objects here in the base class
        // sub-class will build it's objects here
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Start the UI running by configuring it with the state 'start', doing a 
    // redraw, and setting up event handling (currently only of clicks)
    run() {
        // configure the interface initial state and draw it
        this.configure('start');
        this.needsRedraw = true;
        this.redraw();

        // set up an event handler for the canvas to start processing events
        this.canvas.onclick = (evt: MouseEvent) => {
            this.handleClick(evt.offsetX, evt.offsetY)
        };  
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
 
    // Configure the UI to match a new global state
    configure(newState : string) {
        this.currentState = newState;
        // hopefully more configuration in subclasses...
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    
    // Redraw the interface within its host canvas if needed.  If the damage indicator 
    // needsRedraw is false, this does nothing.  needsRedraw is reset to false
    redraw() : void {
        // only redraw if something indicated we need it
        if (this.needsRedraw) {
            // clear the background, then redraw each of the child objects
            this.context.clearRect(0,0, this.canvas.width,this.canvas.height);
            for (const childObj of this.childObjects) {
                childObj.draw(this.context);
            }
        }
        // display is now up-to-date
        this.needsRedraw = false;
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Dispatch input from a click to child objects
    handleClick(x : number, y : number) : boolean {

        // try to dispatch this to each object (in reverse drawing order) 
        // until one handles it
        for (let i = this.childObjects.length-1; i >= 0; i--) {
            if (this.childObjects[i].handleClickAt(x,y)) {
                // If something indicated a change to screen contents, redraw
                if (this.needsRedraw) this.redraw();

                // indicate that we processed the event
                return true;
            }
        }
        // nobody handled it so indicate that it was not handled
        return false;
    }
}

//=====================================================================
// Base class for interactive objects that can appear in the UI
//=====================================================================

// Class for (very simple) interactive objects.  Each object has a position (x,y) 
// within the parent UI, and a size (w,h).  It also links back to the overall UI
// object that it is contained in.  Methods are provided for drawing
// the object on the screen, "picking" the object (determining if a point is 
// inside the object), and handling input (currently only clicks).  Most of the
// details of those operations will need to be provided by code in specialized
// subclasses.
class ScreenObject {
    // X,y position of the object within its parent
    protected _x : number; 
    get x() : number {return this._x; }
    set x(v : number) {this._x = v; this.declareDamaged();}
    get centerX() : number {return this.x + this.w/2;}
    set centerX(v : number) {this.x = v - this.w/2;}

    protected _y : number;
    get y() : number {return this._y;}
    set y(v : number) {this._y = v; this.declareDamaged();}
    get centerY() : number {return this.y + this.h/2;}
    set centerY(v:number) {this.y = v - this.h/2;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Size of the object (width and height of its bounding box)
    protected _w : number; 
    get w() : number {return this._w;}
    set w(v : number) {this._w = v; this.declareDamaged();}

    protected _h : number; 
    get h() : number {return this._h;}
    set h(v : number) {this._h = v;this.declareDamaged();}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Is the object visible?  If not the object should not draw itself or 
    // respond to input. 
    protected _visible : boolean;
    get visible() : boolean  {return this._visible;}
    set visible(v : boolean) {this._visible = v; this.declareDamaged();};

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Link back to the parent UI this object belongs to
    protected _parentUI : UIClass;
    get parentUI() : UIClass {return this._parentUI;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Declare that this object has been changed in a way that may require 
    // its screen appearance to change (so requires a redraw of the interface)
    declareDamaged() {
        this.parentUI.needsRedraw = true;
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Construct based on size and position.  All objects are initially visible.
    constructor (x : number, y : number, w : number, h : number, parent : UIClass ) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._parentUI = parent;
        this._visible = true;
    }
    
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    draw(ctx : CanvasRenderingContext2D) : void {
        // nothing to do here in the base class
    }
   
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Indicates if the given point (x,y screen location) "picks" the object 
    // (is over the top of it's active contents).  Here in the base class we
    // pick the object if the point is inside the bounding box of the object.
    // Currently non-visible objects are not picked.
    pickedBy(ptX : number, ptY : number) : boolean {
        if (!this.visible) return false;

        return ptX >= 0 && ptY >= 0 && ptX < this.w && ptY < this.h;
    }
      
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    
    // Respond to (very simple) input (just clicks at a position) potentially 
    // directed to this object.  True is returned if the object has processed
    // the input -- indicating that other objects should not process the input.
    handleClickAt(ptX : number, ptY : number) : boolean { 
        // only process inputs if we are visible and picked at that position
        if (!this.visible || !this.pickedBy(ptX, ptY)) return false;

        // in subclasses we would do something to process the input here
        // here in the base class we never process it
        return false;
    }
}

//=====================================================================
// Helper functions for picking random target locations
//=====================================================================

// Pick a random number within a range
function randomInRange(min : number, max : number) : number {
    return Math.random()*(max-min) + min;
}

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

// Pick a position of a target of the given diameter that fits entirely 
// in a rectangle of the given size
function pickPositionInBox(boundW: number, boundH : number, diam : number) 
: [number, number] {
  return [Math.round(randomInRange(diam, boundW-diam)), 
          Math.round(randomInRange(diam, boundH-diam))];
}

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

// The minimum distance that we allow between the (edges of) the reticle and the target
const MIN_DIST_APART : number = 30;

// Pick a center location for a start reticle and a target along with a diameter 
// for the target such that both fit within a rectangle of the given size and 
// are at least a minimum distance apart (as defined by MIN_DIST_APART).
// We return this as an object that can be used in a destructuring assignment.
function pickLocationsAndSize(boundW: number, boundH : number) 
  : {retX:number, retY: number, targX: number, targY: number, targD: number} {

    // pick a position for the reticle that fits in the bounding box
    const [rx, ry] = pickPositionInBox(boundW, boundH, Reticle.RETICLE_DIAM);

    // try positions for a randomly sized target 
    // looking for one that fits in the box and isn't too close to the reticle
    let tx : number = 0;
    let ty : number = 0;
    let tsz : number = 0;

    // we keep trying until we find one 
    for (;;) {
        // pick a random diameter and position for the target
        tsz = randomInRange(50, 200);
        [tx,ty] = pickPositionInBox(boundW, boundH, tsz);

        // how far apart is that?
        const dx = Math.abs(rx-tx);
        const dy = Math.abs(ry-ty);
        const dist = Math.hypot(dx,dy);

        // if it's not too close we are done
        if (dist > (tsz/2 + Reticle.RETICLE_DIAM/2) + MIN_DIST_APART) break;
    }

    // return the selected positions and size 
    return {retX:rx, retY:ry, targX:tx, targY:ty, targD:tsz};
}

//=====================================================================
// Trial Data Related
//=====================================================================

class FittsTrialRecord {
    startTime : DOMHighResTimeStamp = 0;
    endTime : DOMHighResTimeStamp = 0;
    dist : number = 0;
    targetDiam : number = 0;

    // the duration of the movement
    get duration() : DOMHighResTimeStamp {return this.endTime - this.startTime;}

    // the index of difficulty 
    // (using the "Shannon Formulation" of Fitts' law ID = log2(D/W+1))
    get indexOfDiff() : number {
        return Math.log2(this.dist/this.targetDiam + 1);
    }

    constructor(startT : DOMHighResTimeStamp, 
                endT : DOMHighResTimeStamp, 
                dist : number, sz : number) {
        this.startTime = startT;
        this.endTime = endT;
        this.dist = dist;
        this.targetDiam = sz;
    }

    toString() : string {
        // Excel friendly (CSV) format...
        return `${twoPlaces(this.startTime)}, ${twoPlaces(this.endTime)}, ` +
            `${twoPlaces(this.dist)}, ${twoPlaces(this.targetDiam)}`;

        // more human readable format...
        // return `[start:${twoPlaces(this.startTime)}, end:${twoPlaces(this.endTime)}, ` +
        //         `dist:${twoPlaces(this.dist)}, w:${twoPlaces(this.targetDiam)}] ` + 
        //         `dur=${twoPlaces(this.duration)}msec ID=${twoPlaces(this.indexOfDiff)}`;
    }
}

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

// Convenience function to return a number that has been rounded to two 
// places after the decimal point.
function twoPlaces(n : number) {return Math.round(n*100)/100;}

//=====================================================================
// Code for running the UI from the HTML page
//=====================================================================

// Single object for our UI implementation
let UI : FittsTestUI;

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

// External interface to be called from page script to start the interface 
function runFittsDataCollector() {
    UI = new FittsTestUI("p1-main-canvas");
    UI.run();
}

//==================================================
//==================================================
// === SKELETON CODE TO BE MODIFIED STARTS BELOW ===
//==================================================
//==================================================

//=====================================================================
// Sub-class implementing our actual interface
//=====================================================================

// Class implementing our Fitts law data collector interface
class FittsTestUI extends UIClass {

    constructor(canvasTagID : string) {
        super(canvasTagID);  // note: this will call this.buildUIObjects()
    }
     
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
 
    // Objects which are the reticle (showing the user the starting position of the trial)
    // and the target.  These will be move and/or sized randomly for each trial.
    protected _theReticle! : Reticle;  
    get theReticle() : Reticle {return this._theReticle;}

    protected _theTarget!  : Target;   
    get theTarget() : Target {return this._theTarget;}

    // Background object that we use for prompting and catching clicks to start the trials
    protected _theBackground! : BackgroundDisplay;
    get theBackground() : BackgroundDisplay {return this._theBackground;}

    // Note: the previous 3 instance variables  are initialized in 
    //   buildUIObjects() which is called from the super-class constructor.  
    //   The "!" here tells the compiler that these values will not stay 
    //   undefined even though it can't tell that on it's own, and so shuts 
    //   down an error that it would otherwise be erroneously report.  However, 
    //   this is turning off some static checking, so you should be careful that 
    //   this initialization is actually happening.
         
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Build the objects for this UI.
    // Here we create three static objects that we modify as the interaction 
    // progresses:
    //  theBackground -- a background area where we display messages
    //  theReticle    -- an object that we click to start a trial 
    //  theTarget     -- an object that the user is supposed to click on for 
    //                   the trial
    // The background object is always visible, but we change the messages it 
    // shows based on the UI state.  The Reticle is only visible at start of a trial 
    // and disappears when clicked near its center. The Target is only visible once the 
    // reticle has been clicked on, and goes invisible once it is clicked on (and hence
    // the trial ends).
    override buildUIObjects() {
        // create the background object (sized to match the whole canvas) the 
        // proper with initial prompt
        this.childObjects.push(this._theBackground = 
            new BackgroundDisplay(this.canvas.width, this.canvas.height, this));
   
        // create the reticle and target at new random locations
        const {retX:retX, retY:retY, targX:targX,targY:targY, targD:targDiam} = 
            pickLocationsAndSize(this.canvas.width,this.canvas.height,);
        this.childObjects.push(this._theReticle  = new Reticle(retX, retY,this));
        this.childObjects.push(this._theTarget  = new Target(targX, targY, targDiam,this));

        // NOTE: if this method is changed or overriden,  recheck the assertion 
        //   that theReticle, theTarget, and theBackground are actually 
        //   initialized since we have disabled compiler checking of that 
        //   (with postfix ! in the declaration.
   }
     
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
 
    // Configure the UI to match the current state.  This moves the interface to it's new 
    // state by changing our (static) UI objects as needed, and settng the 
    // visibilty of objects.  This interface understands the following global states:
    //   'start'         -- we have not started the first trial
    //   'begin_trial'   -- a trial has begun (reticle should up awaiting click)
    //   'in_trial'      -- trial has started (target should be up awaitig click)
    //   'ended'         -- all trials are done
    //
    override configure(newState : string) {
        // Be a bit tolerant of variant forms...
        newState = newState.toLowerCase();
        newState = newState.replace('-','_');

        this.currentState = newState;
        switch (this.currentState) {
            case 'start':
                this.theBackground.msg1 = "Press anywhere to begin";
                this.theBackground.msg2 = 
                    "  For each trial click the center of the blue target to begin";
                this.theBackground.msg3 = 
                    "  Then click inside the green circle that appears";
                this.theReticle.visible = false;

                // a bit more left to do...
                // === YOUR CODE HERE ===
                /* no green circle yet */
                this.theTarget.visible = false;

            break;
            case 'begin_trial':
                // === YOUR CODE HERE ===
                /* title of each trial, green circle on and blue circle off*/
                this.theBackground.msg1 = 
                `  Trial #${this.trialCount} of 10`;
                this.theBackground.msg2 = "";
                this.theBackground.msg3 = "";
                this.theReticle.visible = true;
                this.theTarget.visible = false;
        
            break;
            case 'in_trial':
                
                // === YOUR CODE HERE ===
                //no text
                this.theBackground.msg1 = "";
                this.theReticle.visible = false;
                this.theTarget.visible = true;

        
            break;
            case 'ended':
                
                // === YOUR CODE HERE ===
                /*only message being present on the final stage */
                this.theBackground.msg1 = 
                "  Done! Refresh the page to start again";
                this.theReticle.visible = false;
                this.theTarget.visible = false;
        
                // produce a dump of our data records on the console
                //test
                // console.log('get to the presentdata at end state!')
                //test ends

                this.presentData();
            break;
            default: 
                throw Error(`Unknown UI state ${newState} passed to FittsTestUI.configure()`);
        }
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Tracking for how many trials we've done, so we know when to quit
    readonly MAX_TRIALS : number = 10;
    trialCount : number = 0;

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Start the display of a new trial in the interface by setting new positions for our 
    // reticle and target and changing the global state to 'begin_trial' (or 'ended' if 
    // we have already done all our trials).
    newTrial() {
        // count the trial and go to the end state if we've done them all
        this.trialCount++;

        //test
        // console.log(this.trialCount);
        //test ends

        if (this.trialCount > this.MAX_TRIALS) {
            //TEST
            // console.log("Entering ended state")
            //TEST
            this.configure('ended');
            
        } else { // otherwise we have a normal trial...
            // make new random locations for reticle and target 
            const {retX:retX, retY:retY, targX:targX, targY:targY, targD:targDiam} = 
                pickLocationsAndSize(this.canvas.width,this.canvas.height);

            // === YOUR CODE HERE ===
            // at the beginning of each trial, update location for reticle and target
            this.theReticle.newGeom(retX, retY);
            this.theTarget.newGeom(targX,targY,targDiam);
            
            this.configure('begin_trial');
            

        }
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // When did we start the current/last trial
    protected lastStartTime : DOMHighResTimeStamp = 0;

    // Where did we start the current/last trial from
    protected lastTrialLocation : [number, number] = [0,0];

    // List of records, one for each recorded trial.  These are pushed by recordTrailEnd()
    protected _trialData : FittsTrialRecord[] = [];
    get trialData() : FittsTrialRecord[] {return this._trialData;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Do bookkeeping for start of the current trial 
    startTrial(startLocX : number, startLocY : number) {
        // Remember where we started the movement from and the current time so we
        // can record those at the end of the trial
        this.lastTrialLocation = [startLocX, startLocY];
        this.lastStartTime = performance.now();  // get msec past the epoc
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Stop the trial timer and make a record of the trial
    recordTrialEnd(endLocX : number, endLocY : number, endSz : number) {
        // record the current time in msec since the epoc
        const endT : DOMHighResTimeStamp = performance.now();
        
        // work out the distance from the start location to our end point
        const dist = Math.hypot(
            this.lastTrialLocation[0] - endLocX,this.lastTrialLocation[1] - endLocY);

        // create a record for the trial and append to the data
        const rec : FittsTrialRecord = 
            new FittsTrialRecord(this.lastStartTime, endT, dist, endSz);
        this.trialData.push(rec);
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Present the data we have collected after a set of trials completes.
    // This currently just prints the data to the console in a CSV format.
    presentData() {
        // console.log("Data dump...");
        for (let i = 0; i < this.trialData.length; i++) {
            // console.log("" + i + ":" + this.trialData[i].toString());

            //test
            // console.log('data length is ' + i);
            // console.log('gets to presentdata helper func');
            //test ends

            console.log(this.trialData[i].toString());
        }
    }
}

//=====================================================================
// Sub-classes implementing the types of interactive objects we use
//=====================================================================

// Class implementing a round clickable target.  This is specified in terms
// of a center position and diameter, which is translated into a square bounding box
// for the super-class.  The object is displayed as a filled circle with an outline.
// Input is only accpet within the circle (not the entire bounding box).
// This object is used when the interface is in the 'in_trial' state and clicking
// on it ends the trial.
class Target extends ScreenObject{
    // Override the link back to the parent UI with a more specific type
    protected override _parentUI : FittsTestUI;
    override get parentUI() : FittsTestUI {return this._parentUI;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Accessors for diameter and radius of our circle 
    // (reconstructed from our width)
    get diam() : number {return this._w;}
    set diam(v : number) {this.w = this.h = v;}
    get radius() : number {return this.diam/2;}
    set radius(v : number) {this.w = this.h = v*2}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // set a new bounding box for the object based on a center location and an 
    // optional diameter.  If diameter is not include the size is left unchanged.
    // If the diameter is supplied, both the width and height are set to that value.
    newGeom(newCentX : number, newCentY : number, newDiam? : number) {
        
        // === YOUR CODE HERE === 
        if(newDiam !== null && newDiam !== undefined){
            this.diam = newDiam
        }
        /*bounding box is defined by its left top corner, and circle is defined by the 
        center point
        need to assign the top left corner using radius and center point of the circle*/
        this.x = newCentX - this.radius;
        this.y = newCentY - this.radius;
        
        this.declareDamaged();
    }
    
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Color we are drawn with
    readonly TARGET_COLOR : string = 'palegreen';
    get color() : string {return this.TARGET_COLOR;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Construtor based on center and diameter
    constructor(centX : number, centY : number, diam : number, parent : FittsTestUI) {
        super(centX - diam/2, centY - diam/2, diam, diam, parent);
        this._parentUI = parent;
    }
    
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    
    // Draw the object as a filled and outlined circle
    override draw(ctx : CanvasRenderingContext2D) : void {
        
        // === YOUR CODE HERE ===
        //need retX
        if(this.visible){
            ctx.beginPath();
            const cenX = this.x + this.radius;
            const cenY = this.y + this.radius;
            ctx.arc(cenX, cenY, this.radius, 0, 2* Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.stroke();
        }
        return;
    
          
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Pick function.  We only pick within our circle, not the entire bounding box
    override pickedBy(ptX : number, ptY : number) : boolean {
        
        // === YOUR CODE HERE ===
        /*use Circle Equation Approach to check if the point falls inside of the circle*/
        const distanceSquare = (ptX - this.centerX) **2 +(ptY - this.centerY)**2;
        if(distanceSquare <= this.radius **2){
            return true;
        }
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Handle click input.  The interface should be in the 'in_trial' state,
    // in which case we respond to this input by ending the current trial
    // and starting a new one.
    override handleClickAt(ptX : number, ptY : number) : boolean {
        
        // === YOUR CODE HERE ===
        // from stage in_trial to begin_trial
        // be triggered by the state in_trial and clicking inside of target 
        
        if(this.parentUI.currentState === 'in_trial' && this.pickedBy(ptX,ptY)){
            
            //record the clicking before initiate the next trial
            this.parentUI.recordTrialEnd(ptX, ptY, this.diam);

            this.parentUI.newTrial();
            // this.parentUI.configure('begin_trial');
            return true;

        }
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===

    }
}

//---------------------------------------------------------------------

// This class implements the specialized target that is clicked
// on to start a trial.  This target has a fixed size and draws a 
// reticle (AKA "gun sight" or "cross hair") type pattern which includes
// a small inner cicle.  It only responds to inputs (clicks) within that 
// small circle.  This forces the user to click near the center of the 
// target.
class Reticle extends Target {

    // Fixed diameter for all Reticle objects
    static readonly RETICLE_DIAM : number = 100;

    // Diameter of inner "aiming" cicle that defines clickable region
    static readonly RETICLE_INNER_DIAM : number = 20;

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Color we are drawn with
    static readonly RETICLE_COLOR : string = 'lightsteelblue';
    override get color() : string {return Reticle.RETICLE_COLOR;}

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    
    // Constructor based on center and diameter
    constructor(centerX : number, centerY : number, parent : FittsTestUI) {
        // let the super-class create and initialize it's part
        super(centerX,centerY,42/*placeholder value*/, parent);
        
        // use a fixed diameter and different color
        this._w = this._h = Reticle.RETICLE_DIAM;
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Draw the reticle.  This includes cross hair lines and an inner "aiming"
    // circle that indicates the active clickable region of the object.
    override draw(ctx : CanvasRenderingContext2D) : void {
        
        // === YOUR CODE HERE ===
        if(this.visible){

        
        ctx.beginPath();
        //get the coordinate of the circle
        const cenX = this.x + this.radius;
        const cenY = this.y + this.radius;
        // outer cirlce
        ctx.arc(cenX, cenY, this.radius, 0, 2* Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();

        //reticle with radius RETICLE_INNER_DIAM/2
        const reticle_rad = Reticle.RETICLE_INNER_DIAM/2
        ctx.arc(cenX, cenY, reticle_rad, 0, 2* Math.PI);
        ctx.stroke();

        //corsshairs

        //horizontal line
        ctx.moveTo(cenX - this.radius, cenY);
        ctx.lineTo(cenX + this.radius, cenY);
        //vertical line
        ctx.moveTo(cenX, cenY - this.radius);
        ctx.lineTo(cenX, cenY + this.radius);
        ctx.stroke();
        }
        return;
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Picking function. We are only picked within our small center region.
    override pickedBy(ptX : number, ptY : number) : boolean {
        
        // === YOUR CODE HERE ===
        // console.log('x coordinate for center is '+ this.centerX + ' and y coordinate for center is '+ this.centerY);

        const distanceSquare = (ptX - this.centerX) **2 +(ptY - this.centerY)**2;
        if(distanceSquare <= (Reticle.RETICLE_INNER_DIAM/2) **2){
            return true;
        }
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }

    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Handle a potential click input.  When responding to this input we 
    // expect to be in the 'begin_trial' interface state and will respond 
    // by starting the trial timer and moving to the 'in_trial' state.
    override handleClickAt(ptX : number, ptY : number) : boolean {
        
        // === YOUR CODE HERE ===
        if(this.parentUI.currentState === 'begin_trial' && this.pickedBy(ptX,ptY)){

            // start recording the trial
            // coordinate is the clicking point
           
            this.parentUI.startTrial(ptX, ptY);
            this.parentUI.configure('in_trial');
          
            return true;

        }
        
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }
}

//---------------------------------------------------------------------

// Class implementing a background text prompting display which covers the 
// whole canvas. This object presents up to three lines of text messages near its 
// top left.  When the interface is in the 'start' state it responds to a click anywhere
// within its bounds, and responds to this by starting the first trial.  At other times
// clicks are ignored and not processed.
class BackgroundDisplay extends ScreenObject{
    
    // Override the link back to the parent UI with a more specific type
    protected override _parentUI : FittsTestUI;
    override get parentUI() : FittsTestUI {return this._parentUI;}
    
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Message strings. Empty strings cause the messages below to move up.
    protected _msg1 : string;
    get msg1() : string {return this._msg1;}
    set msg1(v : string) {this._msg1 = v; this.declareDamaged();}

    protected _msg2 : string;
    get msg2() : string {return this._msg2;}
    set msg2(v : string) {this._msg2 = v; this.declareDamaged();}

    protected _msg3 : string;
    get msg3() : string {return this._msg3;}
    set msg3(v : string) {this._msg3 = v; this.declareDamaged();}
        
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    constructor(w : number, h : number, parent : FittsTestUI) {
        super(0,0,w,h,parent);
        this._visible = true;
        this._msg1 = "";
        this._msg2 = "";
        this._msg3 = "";
        this._parentUI = parent;
    }
 
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Draw the object -- up to three lines of text in a large font near the top left
    // of our bounds (which should be covering the overall canvas).
    override draw(ctx : CanvasRenderingContext2D) : void {
        if (!this.visible) return;

        // Establish font and get measurements
        ctx.font = "24pt Arial";
        ctx.fillStyle = 'black';
        const metrics : TextMetrics = ctx.measureText("Texty");
        const fontHeight : number = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const leading = 10;

        // Track line positions
        let ypos : number = 20 + fontHeight;
        let xpos : number = 10;

        // === YOUR CODE HERE ===
        if(this.msg1){
            ctx.fillText(this.msg1, xpos, ypos);
            // make sure leading between lines of text
            ypos += fontHeight + leading;
        if(this.msg2){
            ctx.fillText(this.msg2, xpos, ypos);
            ypos += fontHeight + leading;
        }
        if(this.msg3){
            ctx.fillText(this.msg3, xpos, ypos);
        }


    }
}
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

    // Handle click input.  The interface should be in the 'start' state,
    // in which case we respond to this input by starting a new trial
    override handleClickAt(ptX : number, ptY : number) : boolean {
        
        // === YOUR CODE HERE ===
        if(this.parentUI.currentState === 'start'){
            this.parentUI.newTrial();
            return true;
        }
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }
}

// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 

