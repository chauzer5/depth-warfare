export default function SystemChargeMeter(props){
    const {
        system,
        showAdditionalCharge,
    } = props;

    const SYSTEMS_INFO = [
        {
            name: "silence",
            color: "#9900FF",
            maxCharge: 6,
        },
        {
            name: "sonar",
            color: "#00FF00",
            maxCharge: 3,
        },
        {
            name: "drone",
            color: "#00FF00",
            maxCharge: 4,
        },
        {
            name: "torpedo",
            color: "#FF9900",
            maxCharge: 4,
        },
        {
            name: "mine",
            color: "#FF9900",
            maxCharge: 3,
        }
    ];

    const selectedSystem = SYSTEMS_INFO.find((sys) => sys.name === system);

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