import GameMap from "@/app/components/GameMap/GameMap";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import MovementPendingCard from "./MovementPendingCard";

export default function CaptainDashboard(){
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
            backgroundColor: "black",
            border: "none",
            color: "white",
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
            fontSize: "24px",
        },
        silenceButton: {
            backgroundColor: "black",
            border: "none",
            color: "#555555",
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
            fontSize: "24px",
        },
    }

    // Triangle that points in a given direction
    const Triangle = ({ w = '30', h = '30', direction = 'right', color = '#00FF00' }) => {
        const points = {
          top: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
          right: [`0,0`, `0,${h}`, `${w},${h / 2}`],
          bottom: [`0,0`, `${w},0`, `${w / 2},${h}`],
          left: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
        }
      
        return (
          <svg width={w} height={h}>
            <polygon points={points[direction].join(' ')} fill={color} />
          </svg>
        )
      }

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <SectorsKey />
                <GameMap handleClick={() => {}}/>
                <div style={styles.controls}>
                    <MovementPendingCard />
                    <div style={styles.navButtons}>
                        <div style={styles.navRow}><span>North</span></div>
                        <div style={styles.navRow}><Triangle direction="top" /></div>
                        <div style={styles.navRow}>
                            <span style={styles.directionText}>West</span>
                            <Triangle direction="left" />
                            <div style={{height: "100%", width: "50px"}} />
                            <Triangle direction="right" />
                            <span style={styles.directionText}>East</span>
                        </div>
                        <div style={styles.navRow}><Triangle direction="bottom" /></div>
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