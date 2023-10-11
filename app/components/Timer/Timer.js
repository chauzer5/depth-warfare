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
    // Creating a new instance of the Worker
    const worker = new Worker(`/timerWorker.js`);

    // Sending a message to the worker to start the timer with the specified seconds
    worker.postMessage({
      command: "start",
      seconds: seconds,
    });

    // Setting up a message handler to receive messages from the worker
    worker.onmessage = (e) => {
      // Updating the secondsLeft state with the received seconds from the worker
      if (e.data.secondsLeft !== undefined) {
        setSecondsLeft(e.data.secondsLeft);
      }

      // Calling the onFinish callback when the timer finishes
      if (e.data.finished) {
        onFinish();
      }
    };

    // Cleaning up the worker when the component is unmounted or when it's no longer needed
    return () => {
      worker.postMessage({ command: "stop" });
      worker.terminate();
    };
  }, [seconds, onFinish]);

  return (
    <div style={styles.main}>
      <p style={styles.text}>{text}</p>
      <p style={styles.seconds}>{secondsLeft}</p>
    </div>
  );
}
