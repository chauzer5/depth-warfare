import { useEffect, useState } from "react";

export default function Timer(props) {
  const styles = {
    main: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "10px",
    },
    text: {
      margin: "10px",
      whiteSpace: "no-wrap",
    },
    seconds: {
      margin: 0,
    },
  };

  const { text, seconds, onFinish } = props;

  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          onFinish();
        }

        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.main}>
      <p style={styles.text}>{text}</p>
      <p style={styles.seconds}>{secondsLeft}</p>
    </div>
  );
}
