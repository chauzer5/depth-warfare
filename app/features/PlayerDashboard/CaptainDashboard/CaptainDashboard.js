import GameMap from "@/app/components/GameMap/GameMap";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import MovementPendingCard from "./MovementPendingCard";
import theme from "@/app/styles/theme";
import { useGameContext } from "@/app/state/game_state";
import TriangleMoveButton from "./TriangleMoveButton";

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
        playerTeam,
        pendingNavigate,
    } = useGameContext();

    const { channel } = props;

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <SectorsKey />
                <GameMap />
                <div style={styles.controls}>
                    {pendingNavigate[playerTeam] && <MovementPendingCard channel={channel}/>}
                    <div style={styles.navButtons}>
                        <div style={styles.navRow}><span>North</span></div>
                        <div style={styles.navRow}><TriangleMoveButton direction="north" channel={channel}/></div>
                        <div style={styles.navRow}>
                            <span style={styles.directionText}>West</span>
                            <TriangleMoveButton direction="west" channel={channel}/>
                            <div style={{height: "100%", width: "50px"}} />
                            <TriangleMoveButton direction="east" channel={channel}/>
                            <span style={styles.directionText}>East</span>
                        </div>
                        <div style={styles.navRow}><TriangleMoveButton direction="south" channel={channel}/></div>
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