import { useGameContext } from "@/app/context/game_state";
import CaptainStartingSpot from "./CaptainStartingSpot";
import WaitingStartingSpot from "./WaitingStartingSpot";

export default function StartingSpot (props) {
    const { channel } = props;
    const { playerTeam, playerRole } = useGameContext();

    return (
        <>
            {
                playerRole === "captain" ? (
                    <CaptainStartingSpot />
                ) :
                (
                    <WaitingStartingSpot />
                )
            }
        </>
    );
}