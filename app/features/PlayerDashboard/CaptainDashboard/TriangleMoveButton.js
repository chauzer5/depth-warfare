import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";

export default function TriangleMoveButton(props){
    let { direction, channel, brokenEngine, disabled, enabledDirection } = props;
    const { gameMap, subLocations, playerTeam , pendingNavigate } = useGameContext();

    const w = '30';
    const h = '30';
    const color = theme.green;
    const disabledColor = theme.darkGreen;
    const brokenColor = theme.black;

    // let disabled = false;
    console.log(`engineStatus ${brokenEngine}, ${enabledDirection}`);


    if (brokenEngine){ 
        console.log(`d1: ${direction}, d2: ${enabledDirection}`);  
        if(direction === enabledDirection){
            disabled = false;
            brokenEngine = false;
            console.log(`I have entered the if statement: this is the direction: ${direction}`);
        }
    }

    if(pendingNavigate[playerTeam]){
        disabled = true;
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
            cursor={disabled || brokenEngine ? "not-allowed" : "pointer"}
            width={w}
            height={h}
            onClick={disabled || brokenEngine ? null : handleClick}
        >
            <polygon
                points={points[direction].join(' ')}
                fill={brokenEngine ? brokenColor : (disabled ? disabledColor : color)}
            />
        </svg>
    );

}