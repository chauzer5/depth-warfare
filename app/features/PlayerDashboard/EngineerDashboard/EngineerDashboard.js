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
            marginRight: "10px", /* Add some spacing between the label and the blue bar */
            fontSize: "25px",
          },
          rectangle: {
            flex: 1,
            height: "30px",
            backgroundColor: "#0F0",       /*This will need to change later, so that it is a constant*/
            borderRadius: "15px",
            // border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          rectangleBorder: {
            flex: 1,
            height: "30px",
            backgroundColor: "#000",       /*This will need to change later, so that it is a constant*/
            borderRadius: "18px",
            // border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          rectangleBorder: {
            flex: 1,
            height: "30px",
            backgroundColor: "#000",       /*This will need to change later, so that it is a constant*/
            borderRadius: "18px",
            border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          button2: {
            padding: "20px 10px",
            fontFamily: "'VT323', monospace",        /*This is also hard coded... potentially fix */
            fontSize: "20px",
            backgroundColor: "#C0C0C0",
            color: "#000",
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
            ...(buttonStates[0] ? styles.darkButton : {})
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
        <h5 style={styles.label}>Comms</h5>
        <div style={styles.rectangleBorder}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[1]}%`,
            }}
          ></div>
        </div>

  
        <button
          style={{
            ...styles.button,
            ...(buttonStates[1] ? styles.darkButton : {})
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
        <h5 style={styles.label}>Torpedo</h5>
        <div style={styles.rectangleBorder}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[2]}%`,
            }}
          ></div>
        </div>

        <button
          style={{
            ...styles.button,
            ...(buttonStates[2] ? styles.darkButton : {})
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
        <h5 style={styles.label}>Mine</h5>
        <div style={styles.rectangleBorder}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[3]}%`,
            }}
          ></div>
        </div>

      
        <button
          style={{
            ...styles.button,
            ...(buttonStates[3] ? styles.darkButton : {})
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
        <h5 style={styles.label}>Engine</h5>
        <div style={styles.rectangleBorder}>
          <div
            style={{
              ...styles.rectangle,
              width: `${rectangleWidths[4]}%`,
            }}
          ></div>
        </div>


        <button
          style={{
            ...styles.button,
            ...(buttonStates[4] ? styles.darkButton : {})
          }}
          onClick={() => handleActivateButtonClick(4)}
        >
          Activate
        </button>
        <button style={styles.button2} onClick={() => startGrowing(4)} >
          Repair
        </button>
      </div>
    </>
  );
}






