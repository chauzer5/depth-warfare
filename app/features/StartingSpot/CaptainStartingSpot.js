import SectorsKey from "@/app/components/SectorsKey";
import StartingSpotMap from "./StartingSpotMap";
import TeamRoleDescription from "./TeamRoleDescription";
import Timer from "@/app/components/Timer";

export default function CaptainStartingSpot () {
    const styles = {
        main: {
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            backgroundColor: "grey",
            width: "900px",
            height: "800px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            whiteSpace: "pre-wrap",
        },
        header: {
            textAlign: "center",
            marginTop: "0px",
        },
        bottomSection: {
            flexGrow: 1,
            backgroundColor: "pink",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
        },
    };

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <TeamRoleDescription />
                <h3 style={styles.header}>{"Please choose a starting location\nfor your team's submarine:"}</h3>
                <div style={styles.bottomSection}>
                    <Timer />
                    <StartingSpotMap />
                    <SectorsKey />
                </div>
            </div>
        </div>
    );
}