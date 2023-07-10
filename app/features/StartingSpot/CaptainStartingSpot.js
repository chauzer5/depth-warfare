import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import TeamRoleDescription from "./TeamRoleDescription";
import Timer from "@/app/components/Timer/Timer";
import GameMap from "@/app/components/GameMap/GameMap";
import { useGameContext } from "@/app/context/game_state";

export default function CaptainStartingSpot (props) {
    const styles = {
        main: {
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            width: "800px",
            height: "700px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            whiteSpace: "pre-wrap",
        },
        header: {
            textAlign: "center",
            marginTop: "0px",
        },
        bottomSection: {
            flexGrow: 1,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",        
        },
    };

    const { channel } = props;
    const { playerTeam } = useGameContext();

    const handleClick = (cell, row, column) => {
        if(cell.type === "water"){
            if(cell.blueSub === true && playerTeam === "blue"){ return; }
            if(cell.redSub === true && playerTeam === "red"){ return; }

            channel.publish("set-starting-spot", {row: row, column: column});
        }
    };

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <TeamRoleDescription />
                <h3 style={styles.header}>{"Please choose a starting location\nfor your team's submarine:"}</h3>
                <div style={styles.bottomSection}>
                    <Timer />
                    <GameMap handleClick={handleClick}/>
                    <SectorsKey />
                </div>
            </div>
        </div>
    );
}