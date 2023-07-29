import React, { useState, useEffect} from 'react';

const NUM_BUTTONS = 5;
const ACTIVE_BUTTONS = 3;

export default function EngineerDashboard(){
    const styles = {
        systemLabel: {
            fontSize : "100px"
        },
        container: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            width: "90%", /* Set a fixed width for all the containers */
            margin: "0 auto", /* Center the containers on the page */
            marginBottom: "5px" /* Add some margin between each section */
          },
          label: {
            width: "100px", /* Set a fixed width for the labels */
            marginRight: "10px" /* Add some spacing between the label and the blue bar */
          },
          rectangle: {
            flex: 1,
            height: "30px",
            backgroundColor: "#0F0",       /*This will need to change later, so that it is a constant*/
            borderRadius: "15px",
            border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          button2: {
            padding: "20px 20px",
            fontFamily: "'VT323', monospace",        /*This is also hard coded... potentially fix */
            backgroundColor: "#C0C0C0",
            color: "#000",
            borderRadius: "10px",
            cursor: "pointer",
            marginLeft: "10px",
            marginRight: "10px",
            label: "Grey Button"
          },
          button: {
            padding: "20px 20px",
            fontFamily: "'VT323', monospace",        /*This is also hard coded... potentially fix */
            backgroundColor: "#0F0",
            color: "#000",
            borderRadius: "10px",
            cursor: "pointer",
            marginLeft: "10px",
            marginRight: "10px",
            label: "Green Button"
          },
          darkButton: {
            backgroundColor: "#058800" /* Change to a darker shade */
          }
    };

    const [buttonStates, setButtonStates] = useState(
        new Array(NUM_BUTTONS).fill(true) // Assuming you have 5 buttons, initialize all to false
      );
    
      // Function to handle button click
    const handleButtonClick = (index) => {
        // Count the number of active buttons
        const activeCount = NUM_BUTTONS - buttonStates.filter((state) => state).length;

        // If there are already three active buttons and the current button is not active,
        // return early to prevent activating more buttons.
        if (activeCount === ACTIVE_BUTTONS && buttonStates[index]) {
        return;
        }

        const newButtonStates = [...buttonStates]; // Create a copy of the array
        newButtonStates[index] = !newButtonStates[index]; // Toggle the state of the clicked button
        setButtonStates(newButtonStates); // Update the state with the new array
    };
    

    // Create a state variable to control the width of the blue rectangle
    const [rectangleWidth, setRectangleWidth] = useState(100);

    // Function to start the shrinking animation
    const startShrinking = () => {
        // Update the rectangle width gradually to create the shrinking animation
        let width = rectangleWidth;
        const interval = setInterval(() => {
          if (width <= 0.001) {
            clearInterval(interval);
            // Reset the rectangle width when the animation ends
            setRectangleWidth(100);
            console.log("Animation completed");
          } else {
            setRectangleWidth(width);
            width -= 1; // Change the decrement value to control the speed of the animation
          }
        }, 10); // Adjust the interval duration to control the smoothness of the animation
        console.log("startShrinking called");
      };
    
    // Function to reset the rectangle width when the component mounts or when the animation ends
    // useEffect(() => {
    //     setRectangleWidth(100);
    //     console.log("useEffect triggered");
    // }, [rectangleWidth]);
    
    return (
        <>

    <div style={styles.container}>
        <h5 style={styles.label}>Engineer</h5>

        <div
          style={{
            ...styles.rectangle,
            width: `${rectangleWidth}%`,
          }}
        ></div>
        <button style={styles.button} onClick={startShrinking}>
          Click Me
        </button>

        <button
          style={{
            ...styles.button,
            ...(buttonStates[0] ? styles.darkButton : {})
          }}
          onClick={() => handleButtonClick(0)}
        >
          Activate
        </button>
        <button style={styles.button2}>Repair</button>
      </div>

      <div style={styles.container}>
        <h5 style={styles.label}>Comms</h5>
        <div style={styles.rectangle}></div>
        <button
          style={{
            ...styles.button,
            ...(buttonStates[1] ? styles.darkButton : {})
          }}
          onClick={() => handleButtonClick(1)}
        >
          Activate
        </button>
        <button style={styles.button2}>Repair</button>
      </div>

      <div style={styles.container}>
        <h5 style={styles.label}>Engine</h5>
        <div style={styles.rectangle}></div>
        <button
          style={{
            ...styles.button,
            ...(buttonStates[2] ? styles.darkButton : {})
          }}
          onClick={() => handleButtonClick(2)}
        >
          Activate
        </button>
        <button style={styles.button2}>Repair</button>
      </div>

      <div style={styles.container}>
        <h5 style={styles.label}>Life Support</h5>
        <div style={styles.rectangle}></div>
        <button
          style={{
            ...styles.button,
            ...(buttonStates[3] ? styles.darkButton : {})
          }}
          onClick={() => handleButtonClick(3)}
        >
          Activate
        </button>
        <button style={styles.button2}>Repair</button>
      </div>

      <div style={styles.container}>
        <h5 style={styles.label}>Sonar</h5>
        <div style={styles.rectangle}></div>
        <button
          style={{
            ...styles.button,
            ...(buttonStates[4] ? styles.darkButton : {})
          }}
          onClick={() => handleButtonClick(4)}
        >
          Activate
        </button>
        <button style={styles.button2}>Repair</button>
      </div>
    </>
  );
}






