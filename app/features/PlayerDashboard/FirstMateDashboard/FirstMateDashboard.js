import { useGameContext } from "@/app/context/game_state";
import SystemActivator from "./SystemActivator";

export default function FirstMateDashboard(){
    const { SYSTEMS_INFO } = useGameContext();

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
            marginBottom: "20px",
        },
        movementPending: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px",
        },
        pendingText: {
            color: "white",
        }
    };

    return (
        <div style={styles.main}>
            <div style={styles.systemsRow}>
                {SYSTEMS_INFO.map((system, index) => {
                    return (
                        <SystemActivator key={index} system={system} />
                    );
                })}
            </div>
            <div style={styles.movementPending}>
                <span style={styles.pendingText}>MOVING: NORTH</span>
                <span style={styles.pendingText}>Choose a system to charge</span>
            </div>
        </div>
    );
}