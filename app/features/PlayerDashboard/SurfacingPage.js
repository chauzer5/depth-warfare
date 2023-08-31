import React, {useState, useEffect} from 'react';
import theme from "@/app/styles/theme";

const SurfacingPage = ({closeModal}) => {

    const [rectangleWidth, setRectangleWidth] = useState("0%");
    

    const styles = {
        rectangle: {
            height: "20px",
            backgroundColor: theme.green,      
            borderRadius: "15px",
            border: `4px solid ${theme.green}`,
            marginRight: "10px",
            width: rectangleWidth,
            transition: "width 30s ease",
          },
          rectangleBorder: {
            height: "28px",
            backgroundColor: theme.black,      
            borderRadius: "18px",
            border: `4px solid ${theme.green}`,
            marginRight: "10px",
          },

    };

    useEffect(() => {
        const delayTimeout = setTimeout(() => {
            setRectangleWidth("97%");
        }, 10);

        const closeTimeout = setTimeout(() => {
            closeModal(); // Close the modal after the rectangle is fully grown
        }, 30000); // Delayed closing after the rectangle is fully grown (100ms delay + 30s animation)

        return () => {
            clearTimeout(delayTimeout);
            clearTimeout(closeTimeout);
        };
    }, [closeModal]);

    return (
        <div>
            <h1> Surfacing ...</h1>
            <div style = {styles.rectangleBorder}>
                <div style = {styles.rectangle}></div>
            </div>
        </div>
    );
};

export default SurfacingPage;