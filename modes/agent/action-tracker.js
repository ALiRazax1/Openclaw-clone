import { isMutationType } from "./constant.js";

export class ActionTracker{
    #actions = [] 
    log(entry){
        const action = {
            id: entry.id ?? `action_${this.#actions.length}`,
    
    timestamp: entry.timestamp ?? new Date(),
    
    type: entry.type,
    path: entry.path,
    details: { ...entry.details }, // Shallow copies the details object
    status: entry.status,
    userApproved: entry.userApproved,
        }
        this.#actions.push(action)
        return action
    }

    getActions(){
        return Object.freeze([...this.#actions]);
    }
    getPendingMutations(){
        return this.#actions.filter(
            (a)=> isMutationType(a.type) && a.status === "pending"
        )
    }

    updateStatus(id, userApproved){
        const a = this.#actions.find((x)=> x.id === id);
        if (!a) return;
        a.status = status;
        if(userApproved !== undefined){a.userApproved = userApproved}
    }
    

}