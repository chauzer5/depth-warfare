import GameMap from "@/app/components/GameMap/GameMap";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import MovementPendingCard from "./MovementPendingCard";
import theme from "@/app/styles/theme";
import { useGameContext } from "@/app/state/game_state";

export default function CaptainDashboard(props){
    const styles = {
        main: {
            width: "100%",
            height: "100%",
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
        },
        controls: {
            width: "300px",
            height: "450px",
            marginLeft: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
        },
        navButtons: {
            width: "100%",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        navRow: {
            width: "100%",
            height: "40px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "nowrap",
        },
        directionText: {
            margin: "10px",
        },
        silenceControls: {
            width: "100%",
            height: "50px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        surfaceButton: {
            backgroundColor: theme.black,
            border: "none",
            color: theme.white,
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
            fontSize: "24px",
        },
        silenceButton: {
            backgroundColor: theme.black,
            border: "none",
            color: theme.gray,
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
            fontSize: "24px",
        },
    };

    const {
        gameMap,
        subLocations,
        playerTeam,
        pendingNavigate,
    } = useGameContext();

    const { channel } = props;

    // Triangle that points in a given direction
    const TriangleMoveButton = ({ direction }) => {
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
        }
      
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
        )
    }

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <SectorsKey />
                <GameMap handleClick={() => {}}/>
                <div style={styles.controls}>
                    {pendingNavigate[playerTeam] && <MovementPendingCard channel={channel}/>}
                    <div style={styles.navButtons}>
                        <div style={styles.navRow}><span>North</span></div>
                        <div style={styles.navRow}><TriangleMoveButton direction="north" /></div>
                        <div style={styles.navRow}>
                            <span style={styles.directionText}>West</span>
                            <TriangleMoveButton direction="west" />
                            <div style={{height: "100%", width: "50px"}} />
                            <TriangleMoveButton direction="east" />
                            <span style={styles.directionText}>East</span>
                        </div>
                        <div style={styles.navRow}><TriangleMoveButton direction="south" /></div>
                        <div style={styles.navRow}><span>South</span></div>
                    </div>
                    <div style={styles.silenceControls}>
                        <button style={styles.silenceButton}>Activate Silence</button>
                        <SystemChargeMeter systemName="silence"/>
                    </div>
                    <button style={styles.surfaceButton}>Surface</button>
                </div>
            </div>
        </div>
    );
}