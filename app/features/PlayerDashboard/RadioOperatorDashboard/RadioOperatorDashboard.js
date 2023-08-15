import GameMap from "@/app/components/GameMap/GameMap";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";

export default function RadioOperatorDashboard(){
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
        enemyMovementsSection: {
            paddingLeft: "30px",
            paddingRight: "30px",
        },
        header: {
            margin: 0,
            color: "white",
        },
    };

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <SectorsKey />
                <div>
                    <GameMap />
                    <button>Clear</button>
                </div>
                <div style={styles.enemyMovementsSection}>
                    <h3 style={styles.header}>Enemy Movements</h3>
                </div>
            </div>
        </div>
    );
}