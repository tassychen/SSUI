import { Err } from "./Err.js";
import { Check } from "./Check.js";
import { Region } from "./Region.js";
import { isEqualsGreaterThanToken } from "../../../../../../../../node_modules/typescript/lib/typescript.js";

//===================================================================
// A class for objects with specify an event to match on an FSM transition.
// These objects have two parts: an event type, and a region name (which is in most
// cases bound to a particular Region object internally).  The region name indicates
// the region that this event is associated with: basically normally where the 
// primary locator was pointing when the event occured.  Region names can be given as
// the wildcard value: '*' to indicate that any region should be considered a match.
// The possible event types are:
//   * press        the first/primary locator button went down over the given region
//   * release      the first/primary locator button went up over the given region
//   * release_none the first/primary locator button went up over an area with no region
//   * enter        the locator has moved into the given region
//   * exit         the locator has moved out of the given region
//   * move_inside  the locator has moved while inside the given region
//  The following event types can be used for additional matching behavior
//    * any         matches any event type which occurs "over" the given region
//                  (or over any region if "*" was coded for the region).
//    * nevermatch  matches no events (primarily used to patch up values loaded from 
//                  incorrectly formatted/typed json)
//===================================================================

export type EventType = 'press' | 'release' | 'release_none' | 'enter' | 'exit' | 
                        'move_inside' | 'any' | 'nevermatch';
const evtTypeStrings = ['press', 'release', 'release_none', 'enter', 'exit', 
                        'move_inside', 'any', 'nevermatch'];

export type EventSpec_json = {evtType : EventType, region: string};

//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

export class EventSpec {

    public constructor(evtTyp : EventType, regionName : string) {
        this._evtType = evtTyp;
        this._regionName = regionName;
        this._region = undefined; // will be bound once full FSM is provided
    }

    // Construct an EventSpec from an EventSpec_json object, checking all the parts 
    // (since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we think/hope it is).
    public static fromJson(evt : EventSpec_json) : EventSpec {

        const evtType : EventType = Check.limitedString<EventType>(
          evt.evtType, evtTypeStrings, "nevermatch", "EventSpec.fromJson{evtType:}");
        const region : string = Check.stringVal(evt.region, "EvtType.fromJson{region:}")
      
        return new EventSpec(evtType, region);
    }  

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------

    // The type of the event
    protected _evtType     : EventType;
    public get evtType() {return this._evtType;}
    
    // The name of the region associated with the event
    protected _regionName  : string;
    public get regionName() {return this._regionName;}

    // The actual region denoted by the region name.  If this is left undefined and
    // the name is "*" this designates an intent to match with any region.  This property
    // is bound to a particular region in bindRegion().
    protected _region : Region | undefined;
    public get region() {return this._region;}

    //-------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------- 
  
    // Attempt to find the Region object corresponding to our named region within
    // the given list of regions, and assign that to this._region.  If the region
    // name is "*" or the region is not found, _region is set to undefined.
    public bindRegion(regionList : readonly Region[]) : void {
       
        // look for the wildcard. if so, assign the region to undefined
        if (this._regionName === "*") {
            this._region = undefined;
            return;
        }
        
        // **** YOUR CODE HERE ****
        // here loop through region object list to see if the name of region matches the
        // name of regions in the list
        // if so, assign the region object as the current region
        for(let reg of regionList){
            if (this._regionName === reg.name){    
                this._region = reg;
                return;
            }
        }

        // we didn't match any region, that's ok for some forms that don't need a region
        if (this.evtType === 'nevermatch') return;
        if ((this.evtType === 'release_none' || this.evtType === 'any') && 
                                     this._regionName === "") {
            return;
        } 
        
        Err.emit(`Region '${this._regionName}'` + ' in event specification does not match any region.');
        

    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Method to perform a match against an actual event.  The event is represented 
    // by an event type (evtType) and an optional associated region (regn).  If 
    // our region is undefined and region name is "*", we will match to any region.
    public match(evtType : EventType, regn? : Region) : boolean {
          
        // **** YOUR CODE HERE ***
  

        //this.evttype === evettype, if false, then do reg checking -> event_match
        //first check evtType === "nevermatch" is false
        // any -> reg match
        //release none -> type match
        //defult -> reg + evttype
        //this.reg == regn || (this.regname =="*" && this.reg = undefined) -> true
        //conditional checker 

        //test evtType(test nevermatch), then regn.name(can be wildcard or has to match)
        
        //region checker to keep track of if region matches
        let reg_match = false;
        //event checker to keep track of if event matches
        let event_match = false;
        
        if(this._evtType === evtType){
            //turn the check to true if the event matches
            event_match = true;
        }
        if(this.region === regn  || (this.regionName === "*" && this.region === undefined)){
            //turn the check to true if the region matches, or if the region is undefined and the name is a wild card
            reg_match = true;
        }

        if(this.evtType){
            if(this.evtType === "nevermatch"){
                //return false if event is nevermatch
                return false;
            }else if(this.evtType === "any"){
                //return true if event is a wild card and regn matches
                return reg_match;

            }else if(this.evtType === "release_none"){
                //return true if event is release_none and matches
                return event_match;
            }else{
                //for the defult cases, if both event_match checker and reg_match checker return true, reutrn true;
                return event_match && reg_match;
            }
        
        }
        return false;
        

        // **** Remove this: just here to get it to compile... ****
        
    }
    
    //-------------------------------------------------------------------
    // Debugging Support
    //-------------------------------------------------------------------

    // Create a short human readable string representing this object for debugging
    public debugTag() : string {
        return `EventSpec(${this.evtType} ${this.regionName})`;
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Create a human readable string displaying this object for debugging purposes
    public debugString(indent : number = 0) : string {
        let result = "";
        const indentStr = '  ';  // two spaces per indent level

        // produce the indent
        for (let i = 0; i < indent; i++) result += indentStr;
      

        result += `${this.evtType} ${this.regionName}`;
        if (!this.region) result += " unbound";

        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    
    // Log a human readable display of this object to the console
    public dump() {
        console.log(this.debugString());
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
} // end class EventSpec 


//===================================================================
