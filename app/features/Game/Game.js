import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../context/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";

export default function Game() {
  const { gameId, username, currentStage } = useGameContext();

  const [channel] = useChannel(`dw-${gameId}`, (message) => {
    console.log(message);
  });

  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {name: username, team: null, role: null});

  return (
    <>
      {
        currentStage === "teams" ? <TeamSelection presenceData={presenceData} updateStatus={updateStatus} channel={channel}/> :
        currentStage === "starting-spot" ? <StartingSpot channel={channel} /> :
        currentStage === "countdown" ? <Countdown /> :
        null
      }
    </>
  );
}