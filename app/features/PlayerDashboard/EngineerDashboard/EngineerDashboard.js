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
        container: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            flexDirection: "row",
            width: "100%", /* Set a fixed width for all the containers */
            margin: "0 auto", /* Center the containers on the page */
            marginBottom: "5px" /* Add some margin between each section */
          },
          label: {
            width: "100px", /* Set a fixed width for the labels */
            marginRight: "10px", /* Add some spacing between the label and the blue bar */
            fontSize: "30px",
          },
          rectangle: {
            flex: 1,
            height: "30px",
            backgroundColor: theme.green,      
            borderRadius: "15px",
            // border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          rectangleBorder: {
            flex: 1,
            height: "30px",
            backgroundColor: theme.black,      
            borderRadius: "18px",
            border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          button2: {
            padding: "20px 10px",
            fontFamily: "'VT323', monospace",        /*This is also hard coded... potentially fix */
            fontSize: "20px",
            backgroundColor: theme.black,
            borderColor: theme.white,
            color: theme.white,
            borderRadius: "10px",
            cursor: "pointer",
            marginLeft: "10px",
            marginRight: "10px",
            label: "Grey Button"
          },
          button: {
            padding: "20px 10px",
            fontFamily: "'VT323', monospace",        /*This is also hard coded... potentially fix */
            fontSize: "20px",
            backgroundColor: theme.green,
            color: theme.green,
            borderRadius: "10px",
            cursor: "pointer",
            marginLeft: "10px",
            marginRight: "10px",
            label: "Green Button"
          },
          darkButton: {
            backgroundColor: theme.black, /* Change to a darker shade */
            borderWidth: "3px",
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

    <div>
      { pendingNavigate[playerTeam] && !pendingSystemDamage[playerTeam] && (
              <div>
                  <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                  <h4 style={styles.pendingText}>Choose a system to charge</h4>
              </div>
          )}
          { pendingNavigate[playerTeam] && pendingSystemDamage[playerTeam] && (
              <div>
                  <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                  <h4 style={styles.pendingText}>Waiting for first mate...</h4>
              </div>
          )}
        
        {/* {ENGINEER_SYSTEMS_INFO.map((system, index) => {
            return (
                <SystemDamage key={index} system={system} channel={channel}/>
            );
        })} */}

        <RepairMatrix channel={channel} current_system={ENGINEER_SYSTEMS_MAP[pendingNavigate[playerTeam]]} />
    </div>
    </>
  );
}






