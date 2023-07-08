import TeamRoleDescription from "./TeamRoleDescription";

export default function WaitingStartingSpot () {
    const styles = {
        main: {
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "pre-wrap",
        },
        middle: {
            textAlign: "center",
        },
    };

    return (
        <div style={styles.main}>
            <TeamRoleDescription />
            <h3 style={styles.middle}>{`The captains are currently choosing\ntheir starting locations`}</h3>
            <h3>Hang tight.</h3>
        </div>
    );
}