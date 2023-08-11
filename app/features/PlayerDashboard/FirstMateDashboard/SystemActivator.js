import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";

export default function SystemActivator(props){
    const { system, channel } = props;

    const styles = {
        main: {
            width: "150px",
            height: "150px",
            margin: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        circle: {
            width: "80px",
            height: "80px",
            border: `5px solid ${system.color}`,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "10px",
        },
        clickableCircle: {
            width: "80px",
            height: "80px",
            border: `5px solid ${system.color}`,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "10px",
            cursor: "pointer",
            boxShadow: "0px 0px 8px 8px rgba(255,255,255,0.5)",
        },
        readyText: {
            color: theme.white,
            fontSize: "24px",
        },
        circleText: {
            color: system.color,
            fontSize: "24px",
        },
    }

    const {
        systemChargeLevels,
        pendingNavigate,
        pendingSystemCharge,
        playerTeam,
    } = useGameContext();

    const clickable = pendingNavigate[playerTeam] &&
        !pendingSystemCharge[playerTeam] &&
        systemChargeLevels[playerTeam][system.name] < system.maxCharge;

    const handleClick = () => {
        channel.publish("first-mate-choose-system-charge", {system: system.name});
    };

    return (
        <div style={styles.main}>
            <div style={{height: "30px"}}>
                {systemChargeLevels[playerTeam][system.name] === system.maxCharge && <span style={styles.readyText}>Ready</span>}
            </div>
            <div style={clickable ? styles.clickableCircle : styles.circle} onClick={clickable ? handleClick : null}>
                <span style={styles.circleText}>{capitalizeFirstLetter(system.name)}</span>
            </div>
            <SystemChargeMeter systemName={system.name} showPendingCharge={pendingSystemCharge[playerTeam] === system.name}/>
        </div>
    );
}