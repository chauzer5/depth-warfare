import { useGameContext } from "@/app/context/game_state";

export default function SystemChargeMeter(props){
    const {
        systemName,
        showAdditionalCharge,
    } = props;

    const { SYSTEMS_INFO } = useGameContext();

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
            width: "25px",
            height: "10px",
            backgroundColor: "black",
            margin: "3px",
            border: `3px solid ${selectedSystem.color}`,
        };

        return <div key={i} style={chargeStyle}></div>;
    })

    return (
        <div style={styles.main}>
            {charges}
        </div>
    );
}