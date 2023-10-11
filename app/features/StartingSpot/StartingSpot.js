import { useGameContext } from "@/app/state/game_state";
import CaptainStartingSpot from "./CaptainStartingSpot";
import WaitingStartingSpot from "./WaitingStartingSpot";

export default function StartingSpot() {
  const { playerRole } = useGameContext();

  return playerRole === "captain" ? (
    <CaptainStartingSpot />
  ) : (
    <WaitingStartingSpot />
  );
}
