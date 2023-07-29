import GameMap from "@/app/components/GameMap/GameMap";

export default function CaptainDashboard() {
    const styles = {
      container: {
        display: "flex",
        justifyContent: "space-between",
        justifyContent: "center", // Center the content horizontally
        alignItems: "center", // Center the content vertically
        padding: "40px",
      },
      LSContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      rectangle: {
        height: "100px", // Adjust the height as per your requirement
        width: "300px", // Adjust the width as per your requirement
        backgroundColor: "#000",
        borderRadius: "15px",
        border: "4px solid #0F0",
        padding: "20px", // Add some padding for better spacing
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      },
      wordContainer: {
        display: "flex",
        justifyContent: "space-between", // Push circles to the right end
        alignItems: "center",
      },
      wordText: {
        marginRight: "10px",
      },
      circleContainer: {
        display: "flex",
        alignItems: "center",
        padding: "10px"
      },
      circle: {
        width: "15px",
        height: "15px",
        borderRadius: "50%",
        backgroundColor: "#0F0",
        marginRight: "10px"
      },
      launchButton: {
        width: "200px",
        height: "200px",
        backgroundColor: "#F00",
        borderRadius: "50%",
        margin: "40px 10px 10px 10px",
        fontSize: "40px",
        fontWeight: "bold",
        fontFamily: "'Exo', 'VT323'"
      }
    };
  
    return (
      <>
      <div style={styles.container}>
        <div style={styles.container}>

            <div style={styles.LSContainer}>
            <div style={styles.rectangle}>
                <div style={styles.wordContainer}>
                <span style={styles.wordText}>torpedo</span>
                <div style={styles.circleContainer}>
                    <div style={styles.circle} />
                    <div style={styles.circle} /> {/* Second circle */}
                </div>
                </div>
                <div style={styles.wordContainer}>
                <span style={styles.wordText}>depth charger</span>
                <div style={styles.circleContainer}>
                    <div style={styles.circle} />
                    <div style={styles.circle} /> {/* Second circle */}
                </div>
                </div>
                <div style={styles.wordContainer}>
                <span style={styles.wordText}>air strike</span>
                <div style={styles.circleContainer}>
                    <div style={styles.circle} />
                    <div style={styles.circle} /> {/* Second circle */}
                </div>
                </div>
            </div>
            <button style={styles.launchButton}>
                LAUNCH
            </button>
            </div>
            
        </div>

        <GameMap></GameMap>
        </div>
      </>
    );
  }
  