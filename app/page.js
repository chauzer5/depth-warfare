"use client";

import { useGameContext } from "./state/game_state";
import Lobby from "./features/Lobby/Lobby";
import Login from "./features/Login/Login";
import Game from "./features/Game/Game";
import { SnackbarProvider } from "notistack";
import MainMenu from "./features/MainMenu/MainMenu";
import JoinMatch from "./features/Matchmaking/JoinMatch";
import MatchLobby from "./features/Matchmaking/MatchLobby";

export default function App() {
  const { networkState } = useGameContext();
  const { currentStage } = networkState

  return (
    <>
      {currentStage === "login" ? (
        <Login />
      ) :
      currentStage === "main-menu" ? (
        <MainMenu />
      ) :
      currentStage === "lobby" ? (
        <Lobby />
      ) :
      currentStage === "join-match" ? (
        <JoinMatch />
      ) :
      currentStage === "match-lobby" ? (
        <MatchLobby />
      ) :
      (
        <SnackbarProvider maxSnack={5}>
          <Game />
        </SnackbarProvider>
      )}
    </>
  );
}
