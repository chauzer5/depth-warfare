import { useState, useEffect } from "react";
import theme from "@/app/styles/theme";
import { useAblyContext } from "@/app/state/ably_state";

const SurfacingPage = ({ team }) => {
  const [rectangleWidth, setRectangleWidth] = useState({
    red: "0%",
    blue: "0%",
  });

  const styles = {
    rectangle: {
      height: "20px",
      backgroundColor: theme.green,
      borderRadius: "15px",
      border: `4px solid ${theme.green}`,
      marginRight: "10px",
      width: rectangleWidth[team],
      transition: `width ${process.env.TIME_FOR_SURFACING}s ease`,
    },
    rectangleBorder: {
      height: "28px",
      backgroundColor: theme.black,
      borderRadius: "18px",
      border: `4px solid ${theme.green}`,
      marginRight: "10px",
    },
  };

  const { channel } = useAblyContext();

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setRectangleWidth((prevWidths) => ({
        ...prevWidths,
        [team]: "97%",
      }));
    });

    const closeTimeout = setTimeout(() => {
      channel.publish("stop-surfacing", {}); // Close the modal after the rectangle is fully grown
    }, process.env.TIME_FOR_SURFACING * 1000);

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(closeTimeout);
    };
  }, []);

  return (
    <div>
      <h1> Surfacing ...</h1>
      <div style={styles.rectangleBorder}>
        <div style={styles.rectangle}></div>
      </div>
    </div>
  );
};

export default SurfacingPage;
