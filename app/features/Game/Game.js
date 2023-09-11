import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../state/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";
import { useEffect, useState } from "react";
import PlayerDashboard from "../PlayerDashboard/PlayerDashboard";
import { captainCancelSubNavigate, 
        captainSetStartingSpot,
        captainSilence, 
        captainStartSubNavigate,
        firstMateScan,
        engineerPlaceSystemBlock, 
        captainSurface,
        firstMateChooseSystemCharge, 
        engineerClearSystems, firstMateFireTorpedo,
        firstMateDropMine, firstMateDetonateMine
       } from "../../state/message_handler";
import GameEnd from "../GameEnd/GameEnd";

export default function Game() {
  const {
    gameId,
    username,
    currentStage,
    resetMap,
    getEmptyRepairMatrix,
    setRepairMatrix,
  } = useGameContext();

  const gameContext = useGameContext();

  const [messagesList, setMessagesList] = useState([]);
  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {name: username, team: null, role: null});
  const [channel] = useChannel(`dw-${gameId}`, (message) => {
    setMessagesList((prev) => [...prev, {...message}]);
  });

  useEffect(() => {
    resetMap();
  }, []);

  useEffect(() => {
    const newMessage = messagesList[messagesList.length - 1];

    console.log("Message:", newMessage)

    switch(newMessage?.name){
      case "captain-set-starting-spot":
        captainSetStartingSpot(gameContext, newMessage);
        break;
      case "captain-start-sub-navigate":
        captainStartSubNavigate(gameContext, newMessage);
        break;
      case "captain-cancel-sub-navigate":
        captainCancelSubNavigate(gameContext, newMessage);
        break;
      case "engineer-place-system-block":
        engineerPlaceSystemBlock(gameContext, newMessage);
        break;
      case "engineer-clear-systems":
        engineerClearSystems(gameContext, newMessage);
        break;
      case "first-mate-choose-system-charge":
        firstMateChooseSystemCharge(gameContext, newMessage);
        break;
      case "captain-silence":
        captainSilence(gameContext, newMessage);
        break;
      case "captain-surface":
        captainSurface(gameContext, newMessage);
        break;
      case "first-mate-fire-torpedo":
        firstMateFireTorpedo(gameContext, newMessage);
        break;
      case "first-mate-drop-mine":
        firstMateDropMine(gameContext, newMessage);
        break;
      case "first-mate-detonate-mine":
        firstMateDetonateMine(gameContext, newMessage);
        break;
      case "first-mate-scan":
        firstMateScan(gameContext, newMessage);
        break;
      default:
        console.err(`Unrecognized message type: ${newMessage?.name}}`);
    }

  }, [messagesList])

  return (
    <>
      {
        currentStage === "teams" ? <TeamSelection presenceData={presenceData} updateStatus={updateStatus} channel={channel}/> :
        currentStage === "starting-spot" ? <StartingSpot channel={channel} /> :
        currentStage === "countdown" ? <Countdown /> :
        currentStage === "main" ? <PlayerDashboard channel={channel}/> :
        currentStage === "game-end" ? <GameEnd /> :
        null
      }
    </>
  );
}