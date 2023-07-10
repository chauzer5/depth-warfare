import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../context/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";
import { useEffect, useState } from "react";
import { columnToIndex, rowToIndex } from "@/app/utils";

const MAP_DIMENSION = 15;

export default function Game() {
  const {
    gameId,
    username,
    currentStage,
    setCurrentStage,
    setGameMap,
    islandList,
    moveBlueSub,
    moveRedSub,
    getMessagePlayer,
    blueSubLocation,
    redSubLocation,
  } = useGameContext();

  const [messagesList, setMessagesList] = useState([]);
  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {name: username, team: null, role: null});
  const [channel] = useChannel(`dw-${gameId}`, (message) => {
    setMessagesList((prev) => [...prev, {...message}]);
  });

  const mapSetup = () => {
    let gameMap = Array(MAP_DIMENSION);
    for(let i = 0; i < MAP_DIMENSION; i++){
      gameMap[i] = Array(MAP_DIMENSION).fill({
        type: "water",
        blueVisited: false,
        redVisited: false,
        redSub: false,
        blueSub: false,
        redMine: false,
        blueMine: false,
      });
    }

    islandList.forEach((spot) => {
      gameMap[rowToIndex(spot[1])][columnToIndex(spot[0])] = { type: "island" };
    });

    setGameMap(gameMap);
  };

  useEffect(() => {
    mapSetup();
  }, []);

  useEffect(() => {
    console.log("PRESENCE DATA UPDATED");
    console.log(presenceData);
  }, [presenceData]);

  const setStartingSpot = (message) => {
    let allDone = false;
    if(getMessagePlayer(message).team === "blue"){
      moveBlueSub(message.data.row, message.data.column);
      if(redSubLocation){ allDone = true; }
    }
    else{
      moveRedSub(message.data.row, message.data.column);
      if(blueSubLocation){ allDone = true; };
    }

    if(allDone){
      setCurrentStage("countdown");
    }
  };



  useEffect(() => {
    const newMessage = messagesList[messagesList.length - 1];
    console.log(newMessage);

    switch(newMessage?.name){
      case "set-starting-spot":
        setStartingSpot(newMessage);
        break;
    }

  }, [messagesList])

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