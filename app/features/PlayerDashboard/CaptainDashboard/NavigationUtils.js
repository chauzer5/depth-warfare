import { useGameContext } from "@/app/state/game_state";

export function isNavigationDisabled(props) {
    const { direction, channel, brokenEngine } = props;
    const { gameMap, subLocations, playerTeam , pendingNavigate } = useGameContext();
    
    if (pendingNavigate[playerTeam]){
        return true;
    }

    switch(direction){
        case "north":
            if(subLocations[playerTeam][0] === 0){
                return true;
            } else if(gameMap[subLocations[playerTeam][0] - 1][subLocations[playerTeam][1]].type === "island"){
                return true;
            } else if(gameMap[subLocations[playerTeam][0] - 1][subLocations[playerTeam][1]].visited[playerTeam]){
                return true;
            }
            break;
        case "south":
            if(subLocations[playerTeam][0] === process.env.MAP_DIMENSION - 1){
                return true;
            } else if(gameMap[subLocations[playerTeam][0] + 1][subLocations[playerTeam][1]].type === "island"){
                return true;
            } else if(gameMap[subLocations[playerTeam][0] + 1][subLocations[playerTeam][1]].visited[playerTeam]){
                return true;
            }
            break;
        case "west":
            if(subLocations[playerTeam][1] === 0){
                return true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] - 1].type === "island"){
                return true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] - 1].visited[playerTeam]){
                return true;
            }
            break;
        case "east":
            if(subLocations[playerTeam][1] === process.env.MAP_DIMENSION - 1){
                return true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] + 1].type === "island"){
                return true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] + 1].visited[playerTeam]){
                return true;
            }
            break;
        default:
            console.error(`Unrecognized direction: ${direction}`);
            return false;
    }

    return false;
}