// This function lets the captain pick a starting point
// MESAGE: {row, column}
export function captainSetStartingSpot(context, message) {
    const {
        moveSub,
        getMessagePlayer,
        subLocations,
        setCurrentStage,
    } = context;


    let allDone = false;
    moveSub(getMessagePlayer(message).team, message.data.row, message.data.column);
    if(subLocations[getMessagePlayer(message).team === "blue" ? "red" : "blue"]){
      allDone = true;
    }

    if(allDone){
      setCurrentStage("countdown");
    }

}

// This is the one where the captain picks a direction to go, 
// This should trigger when the engineer and first mate can start their decisions
// MESSAGE: {direction}
export function captainStartSubNavigate(context, message) {

}

//engineer picks the systems to activate, which will damage it each turn
// MESSAGE: {system}
export function engineerChooseSystemDamage(context, message){

}

// first make choses something to activate
// MESSAGE: {system}
export function firstMateChooseSystemCharge(context, message){

}

//Captain can change his mind on a move he makes
// MESSAGE: {}
export function CaptainCancelSubNavigate(context, message){

}