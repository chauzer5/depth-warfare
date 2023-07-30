import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import { capitalizeFirstLetter } from "@/app/utils";

export default function SystemActivator(props){
    const { system } = props;

    const styles = {
        main: {
            width: "180px",
            height: "200px",
            margin: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
        },
        circle: {
            width: "100px",
            height: "100px",
            border: `5px solid ${system.color}`,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        activateButton: {
            border: "none",
            backgroundColor: "black",
            color: "white",
            fontSize: "24px",
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
        },
        circleText: {
            color: system.color,
        }
    }

    return (
        <div style={styles.main}>
            <div style={{height: "30px"}}>
                <button style={styles.activateButton}>Activate</button>
            </div>
            <div style={styles.circle}><span style={styles.circleText}>{capitalizeFirstLetter(system.name)}</span></div>
            <SystemChargeMeter systemName={system.name} />
        </div>
    );
}