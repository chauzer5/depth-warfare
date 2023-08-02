import React, { useState } from "react";
import GameMap from "@/app/components/GameMap/GameMap";
import Sonar from "@/app/components/Sonar/SonarL1"

export default function CaptainDashboard() {
    const [circleColor, setCircleColor] = useState(
        new Array(false, true, false, true, false, true)
        )
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
        marginRight: "10px",
        transition: "background-color 0.2s ease",
      },
      offCircle:{
        backgroundColor: "#058800"
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
      },
      buttonContainer:{
        display: "flex",
        alignItems: "left",
        padding: "10px",
        marginLeft: "23%",
      },
      weaponButton:{
        width: "80px",
        height: "40px",
        baackgorundColor: "#0F0",
        borderRadius: "10%",
        backgroundColor: "#0F0",
        fontFamily: "VT323",
        fontSize: "20px",
        marginRight: "10px"
      },
      space:{
        padding: "10px",
      }
    };

    const handleButtonClick = (weaponIndex) => {
        console.log("weapon index: ", weaponIndex)
        const newCircleColor = [...circleColor]; // Create a copy of the array
        if (weaponIndex === 0) {
            newCircleColor[1] = false
            newCircleColor[3] = true
            newCircleColor[5] = true
            setCircleColor(newCircleColor); 
          } else if (weaponIndex === 1) {
            newCircleColor[1] = true
            newCircleColor[3] = false
            newCircleColor[5] = true
            setCircleColor(newCircleColor); 
        } else if (weaponIndex === 2) {
            newCircleColor[1] = true
            newCircleColor[3] = true
            newCircleColor[5] = false
            setCircleColor(newCircleColor);
        }
    }
  
    return (
      <>
      <div style={styles.buttonContainer}>
      <button style={styles.weaponButton} onClick={() => handleButtonClick(0)}>
            torpedo
        </button>
        <button style={styles.weaponButton} onClick={() => handleButtonClick(1)}>
            depth ch
        </button>
        <button style={styles.weaponButton} onClick={() => handleButtonClick(2)}>
            air str
        </button>
      </div>
      <div style={styles.container}>
        <div style={styles.container}>

            <div style={styles.LSContainer}>
            <div style={styles.rectangle}>
                <div style={styles.wordContainer}>
                <span style={styles.wordText}>torpedo</span>
                <div style={styles.circleContainer}>
                    <div style={{
                        ...styles.circle,
                        ...(circleColor[0] ? styles.offCircle: {})}} />
                    <div style={{
                        ...styles.circle,
                        ...(circleColor[1] ? styles.offCircle: {})}} /> {/* Second circle */}
                </div>
                </div>
                <div style={styles.wordContainer}>
                <span style={styles.wordText}>depth charger</span>
                <div style={styles.circleContainer}>
                    <div style={{
                        ...styles.circle,
                        ...(circleColor[2] ? styles.offCircle: {})}} />
                    <div style={{
                        ...styles.circle,
                        ...(circleColor[3] ? styles.offCircle: {})}} /> {/* Second circle */}
                </div>
                </div>
                <div style={styles.wordContainer}>
                <span style={styles.wordText}>air strike</span>
                <div style={styles.circleContainer}>
                    <div style={{
                        ...styles.circle,
                        ...(circleColor[4] ? styles.offCircle: {})}} />
                    <div style={{
                        ...styles.circle,
                        ...(circleColor[5] ? styles.offCircle: {})}} /> {/* Second circle */}
                </div>
                </div>
            </div>
            <button style={styles.launchButton}>
                LAUNCH
            </button>
            </div>
            
        </div>

        <GameMap></GameMap>
        <div style={styles.space}> 
        </div>
        <Sonar></Sonar>
        </div>
    
      </>
    );
  }
  