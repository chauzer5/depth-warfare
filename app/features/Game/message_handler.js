export function setStartingSpot(context, message) {
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
};