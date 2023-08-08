import { useGameContext } from "@/app/state/game_state";
import { SYSTEMS_INFO } from "@/app/utils";

export default function SystemChargeMeter(props){
    const {
        systemName,
        showAdditionalCharge,
    } = props;

    const selectedSystem = SYSTEMS_INFO.find((sys) => sys.name === systemName);

    const styles = {
        main: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
    };

    const charges = Array(selectedSystem.maxCharge).fill(0).map((_, i) => {
        const chargeStyle = {
            width: "18px",
            height: "8px",
            backgroundColor: "black",
            margin: "3px",
            border: `2px solid ${selectedSystem.color}`,
        };

        return <div key={i} style={chargeStyle}></div>;
    })

    return (
        <div style={styles.main}>
            {charges}
        </div>
    );
}