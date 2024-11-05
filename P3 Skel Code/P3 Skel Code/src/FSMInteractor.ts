//===================================================================
// Finite State Machine driven interactor v1.0a 10/2023
// by Scott Hudson, CMU HCII 
//
// This and accompanying files provides classes and types which implement a generic
// interactor whose appearance and behavior is controlled by a Finite State Machine (FSM), 
// along with a set of "regions" which determine its appearance, as well as how 
// high-level input events for it are synthized and dispatched. See the comments
// in various classes for details.
//
// Revision history
// v1.0a  Initial version                 Scott Hudson  10/23
//
//===================================================================

import { Root } from "./Root.js";
import { FSM, FSM_json } from "./FSM.js";
import { Region } from "./Region.js";
import { Err } from "./Err.js";
import { visitLexicalEnvironment } from "../../../../../../../../node_modules/typescript/lib/typescript.js";

//===================================================================
// Class for an interactive object controlled by a finite state machine (FSM).
// Objects of this class have a position on the screen (the location of their top-left
// corner within the HTML canvas object associated with thier parent (Root) object), 
// Along with an FSM object which specifies, and partially imlements, their behavior.
// This class is repsonsible for using the FSM object to draw all the current region 
// images within the FSM, and for dispatching events to the FSM to drive its behavior.
// Note that this object has a position, but not an explicit size, and that no clipping
// of its output is being done.  Regions within the FSM are positioned in the coordinate
// system of this object (i.e., WRT its top-left corner), and have a size that 
// establishes a bouding box for input purposes (i.e., indicateing which event positions 
// are considered "inside" or "over" the region for input purposes).  However, region 
// image displays are not not limited to that bounding box and are not clipped (except 
// by the containing HTML canvas object).  See the FSM and Root classes for more details.
//=================================================================== 

export class FSMInteractor {
    
    constructor(
            fsm     : FSM | undefined = undefined,
            x       : number = 0,
            y       : number = 0,
            parent? : Root)
    {
        this._fsm = fsm;
        this._x = x; this._y = y;
        this._parent = parent;
        if (fsm) fsm.parent = this;
        this.lastPickedRegions = [];
    }

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------
  
    // X position (left) of this object within the parent Root object (and containing 
    // HTML canvas)
    protected _x : number;
    public get x() {return this._x;}
    public set x(v : number) {
          
        // **** YOUR CODE HERE ****
        //check if the postion x of the object changed, if so, redraw
        if(!(this._x===v)){
            this._x = v;
            this.damage();
        }

    
    }

    // Y position (top) of this object within the parent Root object (and containing 
    // HTML canvas)
    protected _y : number;
    public get y() {return this._y;}
    public set y(v : number) {
            
        // **** YOUR CODE HERE ****
        //check if the postion y of the object changed, if so, redraw

        if(!(this._y === v)){
            this._y = v;
            this.damage();
        }
    }

    // Position treated as a single value
    public get position() : {x: number, y: number} {
        return {x: this.x, y: this.y};
    }

    public set position( v: {x: number, y: number}) {
        if ((v.x !== this._x) || (v.y !== this._y)) {
            this._x = v.x;
            this._y = v.y;
            this.parent?.damage();
        }
    }
    //here add another property to keep track of the lastPickedRegions for dispatchrawevent()
    private lastPickedRegions : Region[];
    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // The parent Root object that hosts this object (and serves as a link to the 
    // underlying HTML canvas) 
    //here to manage the relationship between the interactor and root
    protected _parent : Root | undefined;
    public get parent() {return this._parent;}
    public set parent(v : Root | undefined) {
        //root is a graphical container
        //when parent is undefined, only means the object cannot be displayed/mannupulated
        //by the inputs on the html
            
        // **** YOUR CODE HERE ****
        //update the internal reference of parent
        if(!(this._parent === v)){
            //remove the child from old parent
            //if new parent is different from the existing one
            if(this._parent){
                this._parent?.removeChild(this);
                //redraw
                this.damage();
            }
            this._parent = v;
            //add this object to the updated(new) parent
            if(this._parent){
                this._parent?.addChild(this);
                //redraw
                this.damage();
            }
            
            
        }
        
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // The finite state machine that controls the behavior of this object
    protected _fsm : FSM | undefined;
    public get fsm() {return this._fsm;}

    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------

    // Declare that something managed by this object (most typically a region image, 
    // position, or size within the underlying FSM) has changed in a way that may 
    // make the current display incorrect and in need of update.  This is normally called 
    // from the controlling FSM, in response to damage declarations from its  "child" 
    // regions, etc.  This method passes the damage notification to its hosting Root
    // object which coordinates eventual redraw by calling this object's draw() method.
    public damage() {
           
        // **** YOUR CODE HERE ****
        // call damage() in root class
        if(this.parent){
            this.parent.damage();
        }


    }
    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Draw the display for this object using the given drawing context object.  If the
    // showDegugging parameter is passed as true, additional drawing for debugging 
    // purposes (e.g., a black frame showing the bounding box of every region) is 
    // requsted.  See Region.draw() for more details.
    public draw(ctx : CanvasRenderingContext2D, showDebugging : boolean = false) {
        // bail out if we don't have an FSM to work from
        if (!this.fsm) return;

        // **** YOUR CODE HERE ****

        //looping through all the regions and call to redraw each region
        for(const reg of this.fsm.regions){
            //save canvas
            ctx.save();
            //regional translation
            ctx.translate(reg.x, reg.y);
            //set the debugging mode on
            showDebugging = true;
            reg.draw(ctx,showDebugging);
            //change canvas back to origonal state
            ctx.restore();
        }
    }   

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Perform a "pick" operation, to determine the list of regions in our controlling
    // FSM which the given point is to be considered "inside" of or "over" (i.e., that
    // the given point is within the bounding box of).  The position passed here must 
    // be in the local coordinate system of this object (i.e., the position 0,0 would 
    // be at the top-left of this object).  Note that the "pick list" returned here
    // is ordered in reverse regions drawing order (regions drawn later, appear
    // earlier in the list) so that the region drawn on top of other objects appear
    // before them in the list.
    public pick(localX : number, localY : number) : Region[] {
        let pickList :Region[] = [];

        // if we have no FSM, there is nothing to pick
        if (!this._fsm) return pickList;
           
        // **** YOUR CODE HERE ****
        

        //loop through regions
        for(const reg of this._fsm.regions){
            //check if point in regions
            if(localX >= reg.x && localX<= reg.x + reg.w){
                if(localY >= reg.y && localY <= reg.y + reg.h){
                    //add the region with point in it to the picklist
                    pickList.push(reg);
                }
            }
        }
        //reverse the list
        pickList = pickList.reverse();

        return pickList;
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        
        // **** YOUR CODE HERE ****   
        // You will need some persistent bookkeeping for dispatchRawEvent()

    // Dispatch the given "raw" event by translating it into a series of higher-level
    // events which are formulated in terms of the regions of our FSM.  "Raw" events 
    // are based on simple actions with the input device(s) -- currently just press and
    // release of the first/primary locator button, and locator moves.  "Raw" events are 
    // represented by one of those three event types along with a position (in the local
    // coordinates of this object).  
    //
    // The following higher-level events are generated as translations of a "raw" event:
    // exit <region>, enter <region>, press <region>, move_inside <region>, 
    // release <region>, and release_none.  Multiple of these high level events can be 
    // generated from one "raw" event.  For example, an underlying move event can 
    // generate exit, enter, and move_inside events for multiple regions.  The order
    // of event delivery is to first deliver all exit events, then all enter events, etc.
    // in the order listed above.  Within each event type, events associated with the 
    // last drawn region should be dispatched first (i.e., events are delivered in 
    // reverse region drawing order). Note that all generated higher-level events
    // are dispatched to the FSM (via its actOnEvent() method).
    public dispatchRawEvent(what : 'press' | 'move' | 'release', 
                            localX : number, localY : number) 
    {
        // if we have no FSM, there is nothing to dispatch to
        if (this.fsm === undefined) return;

        // **** YOUR CODE HERE ****
        //use pick to see what regions are affected by the event
        const currentlist = this.pick(localX, localY);
        //need to keep track on the last picked regions
        const prevlist = this.lastPickedRegions;

        // keep track of exit and enter
        // to dispatch the enter event, the region should not be in the prev entetred region list
        // while being in the current region list
        // to dispatch the exit event, the region should  be in the prev entetred region list
        // while not being in the current region list 
        const enter_region = currentlist.filter(r => !prevlist.includes(r));
        const exit_region = prevlist.filter(r=> !currentlist.includes(r));
        // for enter regions, the region should not be in the existed 
        //handle exit before enter and move_inside

        //dispatch exit events in exit regions
        exit_region.forEach(region => this.fsm?.actOnEvent("exit", region));
        //dispatch enter events in enter regions
        enter_region.forEach(region => this.fsm?.actOnEvent("enter", region));
        //move_inside event dispatch for all the currentlist
        currentlist.forEach(reg =>{
            switch(what){
                case "move":
                    this.fsm?.actOnEvent("move_inside", reg);
                    break;
                case "press":
                    this.fsm?.actOnEvent("press", reg);
                    break;
                case "release":
                    this.fsm?.actOnEvent("release", reg);
                    break;
                    
            }
        })
        // special checking for release none: when there is no region
        if (what ==="release" && currentlist.length === 0){
            this.fsm.actOnEvent("release_none");
        }
        //clear the prevlist, set prevlist to the old currentlist

        this.lastPickedRegions = currentlist;

    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Method to begin an asychnous load of a FSM_json object from a remotely loaded 
    // .json file.  This object is then transformed into an FSM object to control
    // this object.  This method starts the loading process and sets up follow-on 
    // (asynchonous) actions, but then immediately returns.  In the asynchronous follow-on
    // actios, if the loading fails, Err.emit() is called with an appropriate message, 
    // and this._fsm is set to undefined.  When/if loading completes, the data is 
    // unpacked into an FSM_json object which is in turn used by FSM.fromJson() to create 
    // an FSM object installed as our fsm property.  Finally we declare damage to our 
    // parent object to arrange for redraw with the newly installed FSM.
    public async startLoadFromJson(jsonLoc : string) {
        // try to load the json text from the given location
        const response = await fetch(jsonLoc);

        if (!response.ok) {
            Err.emit(`Load of FSM from "${jsonLoc}" failed`)
            this._fsm = undefined;
            return;
        }

        //  parse the json into an (alledged) FSM_json object
        const data : FSM_json = await response.json();

        // validate and build an actual FSM object out of that
        this._fsm = FSM.fromJson(data, this);

         // we just changed everything, so declare damage
         this.damage();
    }   
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
} // end class FSMInteractor 

//===================================================================
