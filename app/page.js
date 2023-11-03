"use client";

import { useGameContext } from "./state/game_state";
import Login from "./features/Login/Login";
import Game from "./features/Game/Game";
import { SnackbarProvider } from "notistack";
import MainMenu from "./features/MainMenu/MainMenu";
import JoinMatch from "./features/Matchmaking/JoinMatch";
import MatchLobby from "./features/Matchmaking/MatchLobby";

export default function App() {
  const { networkState } = useGameContext();
  const { currentStage } = networkState;

  return (
    <>
      {currentStage === "login" ? (
        <Login />
      ) : currentStage === "main-menu" ? (
        <MainMenu />
      ) : currentStage === "join-match" ? (
        <JoinMatch />
      ) : currentStage === "match-lobby" ? (
        <MatchLobby />
      ) : currentStage === "in-progress-lobby" ? (
        <MatchLobby inProgressGame />
      ) : (
        <SnackbarProvider maxSnack={5}>
          <Game />
        </SnackbarProvider>
      )}
    </>
  );
}
