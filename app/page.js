"use client";

import { useGameContext } from "./state/game_state";
import Lobby from "./features/Lobby/Lobby";
import Login from "./features/Login/Login";
import Game from "./features/Game/Game";
import { SnackbarProvider } from "notistack";

export default function App() {
  const { networkState } = useGameContext();
  const { currentStage } = networkState

  console.log("currentStage ?" , currentStage)

  return (
    <>
      {currentStage === "login" ? (
        <Login />
      ) : currentStage === "lobby" ? (
        <Lobby />
      ) : (
        <SnackbarProvider maxSnack={5}>
          <Game />
        </SnackbarProvider>
      )}
    </>
  );
}
