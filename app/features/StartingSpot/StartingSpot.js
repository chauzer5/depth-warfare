import { useGameContext } from "@/app/context/game_state";
import CaptainStartingSpot from "./CaptainStartingSpot";
import WaitingStartingSpot from "./WaitingStartingSpot";

export default function StartingSpot (props) {
    const { playerRole } = useGameContext();
    const { channel } = props;

    return playerRole === "captain" 
    ? <CaptainStartingSpot channel={channel}/>
    : <WaitingStartingSpot />;
}