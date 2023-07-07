import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../context/game_state";
import TeamSelection from "./TeamSelection";

export default function Game() {
  const { gameId, username, currentStage } = useGameContext();

  const [channel] = useChannel(`dw-${gameId}`, (message) => {
    console.log(message);
  });

  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {name: username, team: null, role: null});

  return (
    <>
      {
        currentStage === "teams" ? <TeamSelection presenceData={presenceData} updateStatus={updateStatus}/> :
        null
      }
    </>
  );
}