import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../state/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";
import { useEffect, useState } from "react";
import PlayerDashboard from "../PlayerDashboard/PlayerDashboard";
import { captainCancelSubNavigate, captainSetStartingSpot, captainStartSubNavigate, engineerChooseSystemDamage, firstMateChooseSystemCharge } from "../../state/message_handler";

export default function Game() {
  const {
    gameId,
    username,
    currentStage,
    resetMap,
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
    console.log("NEW MESSAGE RECEIVED");
    console.log(newMessage);

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
      case "engineer-choose-system-damage":
        engineerChooseSystemDamage(gameContext, newMessage);
        break;
      case "first-mate-choose-system-charge":
        firstMateChooseSystemCharge(gameContext, newMessage);
        break;
      default:
        console.log(`Unrecognized message type: ${newMessage?.name}}`);
    }

  }, [messagesList])

  return (
    <>
      {
        currentStage === "teams" ? <TeamSelection presenceData={presenceData} updateStatus={updateStatus} channel={channel}/> :
        currentStage === "starting-spot" ? <StartingSpot channel={channel} /> :
        currentStage === "countdown" ? <Countdown /> :
        currentStage === "main" ? <PlayerDashboard /> :
        null
      }
    </>
  );
}