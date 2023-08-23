import React, { useState, useEffect} from 'react';
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import SystemDamage from "./SystemDamage";
import RepairMatrix from "./RepairMatrix";
import { ENGINEER_SYSTEMS_INFO, ENGINEER_SYSTEMS_MAP } from "@/app/utils";

const NUM_BUTTONS = 5;
const ACTIVE_BUTTONS = 3;

export default function EngineerDashboard(props){
    const styles = {
        systemLabel: {
            fontSize : "100px"
        },
        containerRow: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            justifyContent: "center",
            flexDirection: "row",
            width: "100%", /* Set a fixed width for all the containers */
            margin: "0 auto", /* Center the containers on the page */
            marginLeft: "20px", /* Add some margin between each section */
            marginRight: "20px",
          },
          containerColumn: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            flexDirection: "Column",
            width: "100%", /* Set a fixed width for all the containers */
            margin: "0 auto", /* Center the containers on the page */
            marginBottom: "5px",  /* Add some margin between each section */
            marginLeft: "5px",
          },
          label: {
            width: "100px", /* Set a fixed width for the labels */
            marginRight: "10px", /* Add some spacing between the label and the blue bar */
            fontSize: "30px",
          },
          placeHolderBox:{
            height: "500px", 
            width: "80%",
            backgroundColor: theme.green,
            color: theme.black,
            border: "10px solid ${theme.blue}"
          },
          placeHolderBox:{
            height: "500px", 
            width: "80%",
            backgroundColor: theme.green,
            color: theme.black,
            border: "10px solid ${theme.blue}"
          },
          trianglePlaceHolderBox:{
            height:"200px",
            width: "200px",
          trianglePlaceHolderBox:{
            height:"200px",
            width: "200px",
            backgroundColor: theme.green,
            color: theme.black,
          }
        }
    };

    const { channel } = props;

    const {
      pendingNavigate,
      playerTeam,
      pendingSystemDamage,
      systemChargeLevels,
  } = useGameContext();

    const [buttonStates, setButtonStates] = useState(
        new Array(NUM_BUTTONS).fill(true) // Assuming you have 5 buttons, initialize all to true
      );

    const newButtonStates = [... buttonStates];
    
      // Function to handle button click
    const handleButtonClick = (index) => {
        // Count the number of active buttons
        const activeCount = NUM_BUTTONS - buttonStates.filter((state) => state).length;

        // If there are already three active buttons and the current button is not active,
        // return early to prevent activating more buttons.
        if (activeCount === ACTIVE_BUTTONS && buttonStates[index]) {
          return;
        }

        // const newButtonStates = [...buttonStates]; // Create a copy of the array
        newButtonStates[index] = !newButtonStates[index]; // Toggle the state of the clicked button
        setButtonStates(newButtonStates); // Update the state with the new array
    };
    

    // Create a state variable to control the width of the blue rectangle
    const [rectangleWidths, setRectangleWidths] = useState(
      new Array(NUM_BUTTONS).fill(100)
    );

    //function for the shrinking rectangle
    const startShrinking = (index) => {
      // Update the rectangle width gradually to create the shrinking animation
      const widths = [...rectangleWidths];
      let width = widths[index];
    
      const interval = setInterval(() => {
        // Shrink the rectangle by 10% each time the interval runs
        width -= 10;
    
        // !!!!! THIS CODE WILL BE GOOD FOR THE CONTINUTOUS VERSION !!!!!!!!!
        // if (width <= 0) {
        //   clearInterval(interval);
        //   console.log("Animation completed");            
        // }

        clearInterval(interval);
        console.log("Animation completed");
    
        // Update the width in the state array
        widths[index] = width;
        setRectangleWidths([...widths]);
      }, 1000); // Adjust the interval duration to control the smoothness of the animation
      console.log("startShrinking called");
    };

    //function for the growing rectangle
    const startGrowing = (index) => {
      // Update the rectangle width gradually to create the shrinking animation
      const widths = [...rectangleWidths];
      let width = widths[index];

      if (width == 100){
        return;
      }
    
      const interval = setInterval(() => {
        // Shrink the rectangle by 10% each time the interval runs
        width += 1;  // Good speed for actual game probably
        width += 9; // Added this because I am an impatient coder
    
        if (width >= 100) {
          clearInterval(interval);
          console.log("Animation completed");            
        }

        // Update the width in the state array
        widths[index] = width;
        setRectangleWidths([...widths]);
      }, 1000); // Adjust the interval duration to control the smoothness of the animation
      console.log("startGrowing called");
    };


    const handleActivateButtonClick = (index) => {
      const currBool = buttonStates[index]

      if(rectangleWidths[index] >= 10){
        handleButtonClick(index);
      }

      if (buttonStates[index] == true && newButtonStates[index] == false){
        startShrinking(index);
      }

  
    };
    
    return (
        <>

    <div style={styles.containerRow}>

       <RepairMatrix channel={channel} current_system={ENGINEER_SYSTEMS_MAP[pendingNavigate[playerTeam]]} />
         
        <div style = {styles.containerColumn}>
          <div style = {styles.containerColumn}> 
            {ENGINEER_SYSTEMS_INFO.map((system, index) => {
                return (
                    <SystemDamage key={index} system={system} channel={channel}/>
                );
            })}
          
          </div>
            <div style = {styles.containerRow}>
            
            { pendingNavigate[playerTeam] && !pendingSystemDamage[playerTeam] && (
                <div>
                    <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                    <h4 style={styles.pendingText}>Choose a system to damage</h4>
                </div>
            )}
            { pendingNavigate[playerTeam] && pendingSystemDamage[playerTeam] && (
                <div>
                    <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                    <h4 style={styles.pendingText}>Waiting for first mate...</h4>
                </div>
            )}
            <div style = {styles.trianglePlaceHolderBox}>
              Triangle stuff here
            </div>
            </div>
        </div>
   
    </div>
{/* 
    <div style={styles.container}>
        <h5 style={styles.label}>Sonar</h5>

        <div style={styles.rectangleBorder}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[0]}%`,
            }}
          ></div>
        </div>

        <button
          style={{
            ...styles.button,
            backgroundColor: theme.green,
            ...(buttonStates[0] ? styles.darkButton : {}),
            borderColor: theme.green,
            color: theme.green,
          }}
          onClick={() => handleActivateButtonClick(0)}
        >
          Activate
        </button>
        <button style={styles.button2} onClick={() => startGrowing(0)} >
          Repair
        </button>
      </div>

      <div style={styles.container}>
        <h5 style={{...styles.label, color: theme.blue}}>Comms</h5>
        <div style={{...styles.rectangleBorder, borderColor: theme.blue}}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[1]}%`,
              backgroundColor: theme.blue,
            }}
          ></div>
        </div>

  
        <button
          style={{
            ...styles.button,
            backgroundColor: theme.blue,
            ...(buttonStates[1] ? styles.darkButton : {}),
            borderColor: theme.blue,
            color: theme.blue,
          }}
          onClick={() => handleActivateButtonClick(1)}
        >
          Activate
        </button>
        <button style={styles.button2} onClick={() => startGrowing(1)} >
          Repair
        </button>
      </div>

      <div style={styles.container}>
        <h5 style={{...styles.label, color: theme.red}}>Torpedo</h5>
        <div style={{...styles.rectangleBorder, borderColor: theme.red}}>
          <div
            style={{
              ...styles.rectangle,
              backgroundColor: theme.red,
              width: `${rectangleWidths[2]}%`,
              backgroundColor: theme.red,
            }}
          ></div>
        </div>

        <button
          style={{
            ...styles.button,
            backgroundColor: theme.red,
            ...(buttonStates[2] ? styles.darkButton : {}),
            borderColor: theme.red,
            color: theme.red,
          }}
          onClick={() => handleActivateButtonClick(2)}
        >
          Activate
        </button>
        <button style={styles.button2} onClick={() => startGrowing(2)} >
          Repair
        </button>
      </div>

      <div style={styles.container}>
        <h5 style={{...styles.label, color: theme.orange}}>Mine</h5>
        <div style={{...styles.rectangleBorder, borderColor: theme.orange}}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[3]}%`,
              backgroundColor: theme.orange,
            }}
          ></div>
        </div>

      
        <button
          style={{
            ...styles.button,
            backgroundColor: theme.orange,
            ...(buttonStates[3] ? styles.darkButton : {}),
            borderColor: theme.orange,
            color: theme.orange,
          }}
          onClick={() => handleActivateButtonClick(3)}
        >
          Activate
        </button>
        <button style={styles.button2} onClick={() => startGrowing(3)} >
          Repair
        </button>
      </div>

      <div style={styles.container}>
        <h5 style={{...styles.label, color: theme.purple}}>Engine</h5>
        <div style={{...styles.rectangleBorder, borderColor:theme.purple}}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[4]}%`,
              backgroundColor: theme.purple,
            }}
          ></div>
        </div>


        <button
          style={{
            ...styles.button,
            backgroundColor: theme.purple,
            ...(buttonStates[4] ? styles.darkButton : {}),
            borderColor: theme.purple,
            color: theme.purple,
          }}
          onClick={() => handleActivateButtonClick(4)}
        >
          Activate
        </button>
        <button style={styles.button2} onClick={() => startGrowing(4)} >
          Repair
        </button>
      </div> */}
    </>
  );
}






