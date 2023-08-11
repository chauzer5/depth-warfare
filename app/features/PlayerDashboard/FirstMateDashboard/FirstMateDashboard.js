import { useGameContext } from "@/app/state/game_state";
import SystemActivator from "./SystemActivator";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import GameMap from "@/app/components/GameMap/GameMap";
import theme from "@/app/styles/theme";
import { SYSTEMS_INFO } from "@/app/utils";

export default function FirstMateDashboard(props){
    const styles = {
        main: {
            width: "100%",
            height: "100%",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        systemsRow: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        pendingText: {
            color: theme.white,
            margin: 0,
            textAlign: "center",
            fontSize: "24px",
            width: "150px",
        },
        bottomSection: {
            height: "600px",
            marginTop: "20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
        },
        controlsContainer: {
            width: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "20px",
        },
        systemButton: {
            width: "150px",
            height: "30px",
            margin: "10px",
            borderRadius: "5px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "black",
            color: "white",
            fontFamily: "VT323, monospace",
        },
        bigButton: {
            width: "150px",
            height: "150px",
            marginTop: "40px",
            borderRadius: "50%",
            fontSize: "30px",
            backgroundColor: "red",
            color: "black",
            fontFamily: "VT323, monospace",
        },
    };

    const { channel } = props;

    const {
        pendingNavigate,
        playerTeam,
        pendingSystemCharge,
        systemChargeLevels,
    } = useGameContext();

    return (
        <div style={styles.main}>
            <div style={styles.systemsRow}>
                {SYSTEMS_INFO.map((system, index) => {
                    return (
                        <SystemActivator key={index} system={system} channel={channel}/>
                    );
                })}
                { pendingNavigate[playerTeam] && !pendingSystemCharge[playerTeam] && (
                    <div>
                        <h6 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h6>
                        <h6 style={styles.pendingText}>Choose a system to charge</h6>
                    </div>
                )}
                { pendingNavigate[playerTeam] && pendingSystemCharge[playerTeam] && (
                    <div>
                        <h6 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h6>
                        <h6 style={styles.pendingText}>Waiting for engineer...</h6>
                    </div>
                )}
            </div>
            <div style={styles.bottomSection}>
                <SectorsKey />
                <GameMap handleClick={() => {}}/>
                <div style={styles.controlsContainer}>
                    <button style={{...styles.systemButton, border: `3px solid ${theme.red}`}}>Torpedo</button>
                    <button style={{...styles.systemButton, border: `3px solid ${theme.orange}`}}>Mine</button>
                    <button style={{...styles.systemButton, border: `3px solid ${theme.green}`}}>Scan</button>

                    <button style={styles.bigButton}>Launch Torpedo</button>
                </div>
            </div>
        </div>
    );
}