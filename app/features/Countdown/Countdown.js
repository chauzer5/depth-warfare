import Timer from "@/app/components/Timer/Timer";
import { useGameContext } from "@/app/state/game_state";

export default function Countdown () {
    const styles = {
        main: {
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }
    }

    const SECONDS_COUNTDOWN = 3;

    const { setCurrentStage } = useGameContext();

    const handleFinish = () => {
        setCurrentStage("main");
    };

    return (
        <div style={styles.main}>
            <Timer
                text={"Starting game in:"}
                seconds={SECONDS_COUNTDOWN}
                onFinish={handleFinish}
            />
        </div>
    );
}