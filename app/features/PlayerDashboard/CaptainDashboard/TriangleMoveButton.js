import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";

export default function TriangleMoveButton(props){
    const { direction, channel } = props;
    const { gameMap, subLocations, playerTeam , pendingNavigate } = useGameContext();

    const w = '30';
    const h = '30';
    const color = theme.green;
    const disabledColor = theme.darkGreen;

    let disabled = false;

    if(pendingNavigate[playerTeam]){
        disabled = true;
    }

    switch(direction){
        case "north":
            if(subLocations[playerTeam][0] === 0){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0] - 1][subLocations[playerTeam][1]].type === "island"){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0] - 1][subLocations[playerTeam][1]].visited[playerTeam]){
                disabled = true;
            }
            break;
        case "south":
            if(subLocations[playerTeam][0] === process.env.MAP_DIMENSION - 1){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0] + 1][subLocations[playerTeam][1]].type === "island"){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0] + 1][subLocations[playerTeam][1]].visited[playerTeam]){
                disabled = true;
            }
            break;
        case "west":
            if(subLocations[playerTeam][1] === 0){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] - 1].type === "island"){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] - 1].visited[playerTeam]){
                disabled = true;
            }
            break;
        case "east":
            if(subLocations[playerTeam][1] === process.env.MAP_DIMENSION - 1){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] + 1].type === "island"){
                disabled = true;
            } else if(gameMap[subLocations[playerTeam][0]][subLocations[playerTeam][1] + 1].visited[playerTeam]){
                disabled = true;
            }
            break;
        default:
            console.log(`Unrecognized direction: ${direction}`);
    }


    const handleClick = () => {
        channel.publish("captain-start-sub-navigate", {direction});
    };

    const points = {
        north: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
        east: [`0,0`, `0,${h}`, `${w},${h / 2}`],
        south: [`0,0`, `${w},0`, `${w / 2},${h}`],
        west: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
    };
    
    return (
        <svg
            cursor={disabled ? "not-allowed" : "pointer"}
            width={w}
            height={h}
            onClick={disabled ? null : handleClick}
        >
            <polygon
                points={points[direction].join(' ')}
                fill={disabled ? disabledColor : color}
            />
        </svg>
    );

}