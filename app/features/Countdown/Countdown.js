import Timer from "@/app/components/Timer/Timer";
import { useGameContext } from "@/app/state/game_state";

export default function Countdown() {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  const { setCurrentStage } = useGameContext();

  const handleFinish = () => {
    console.log('Timer finished');
    setCurrentStage("main");
  };
  // In Countdown component
  console.log('Countdown component is rendered');

  // In Countdown component
  console.log('GAME_COUNTDOWN_SECONDS:', process.env.GAME_COUNTDOWN_SECONDS);


  return (
    <div style={styles.main}>
      <Timer
        text={"Starting game in:"}
        seconds={process.env.GAME_COUNTDOWN_SECONDS}
        onFinish={handleFinish}
      />
    </div>
  );
}
