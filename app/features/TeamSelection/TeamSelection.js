import TeamRoleButton from "./TeamRoleButton";
import { useGameContext } from "../../state/game_state";
import { useEffect } from "react";

export default function TeamSelection(props) {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "650px",
      height: "450px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    selectors: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
    },
    team: {
      width: "50%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  };

  const { presenceData, updateStatus, channel } = props;

  const {
    username,
    selfClientId,
    setCurrentStage,
    setPlayerTeam,
    setPlayerRole,
    setPlayerData,
    setHostClientId,
    resetMap,
    getEmptyRepairMatrix,
  } = useGameContext();

  useEffect(() => {
    if (
      presenceData.length === process.env.NUM_REQUIRED_PLAYERS &&
      !presenceData.find((player) => !player.data.team)
    ) {
      setPlayerTeam(
        presenceData.find((player) => player.clientId === selfClientId).data
          .team
      );
      setPlayerRole(
        presenceData.find((player) => player.clientId === selfClientId).data
          .role
      );

      const newPlayerData = presenceData.map((player) => {
        return {
          username: player.data.name,
          clientId: player.clientId,
          team: player.data.team,
          role: player.data.role,
        };
      });

      // Sort the newPlayerData array by clientId
      newPlayerData.sort((a, b) => a.clientId.localeCompare(b.clientId));

      // Get the first clientId in the sorted array. This is guarenteed to be the same for all players
      const hostClientId = newPlayerData[0].clientId;

      setHostClientId(hostClientId);
      setPlayerData(newPlayerData);
      setCurrentStage("starting-spot");
      
      if (selfClientId === hostClientId) {
        const newMap = resetMap()
        const newRepairMatrix = { blue: getEmptyRepairMatrix(), red: getEmptyRepairMatrix() }
        const networkState = { gameMap: newMap, repairMatrix: newRepairMatrix }
        channel.publish("sync-network-state", networkState);
    }
    }
  }, [presenceData]);

  const handleClick = (selectedTeam, selectedRole) => {
    const playerSelected = presenceData.find((player) => {
      return (
        player.data.team === selectedTeam && player.data.role === selectedRole
      );
    });

    if (!playerSelected) {
      updateStatus({ name: username, team: selectedTeam, role: selectedRole });
    } else if (playerSelected.clientId === selfClientId) {
      updateStatus({ name: username, team: null, role: null });
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <h3>Pick your team and role</h3>
        <div style={styles.selectors}>
          <div style={styles.team}>
            <TeamRoleButton
              id="blueCaptain"
              presenceData={presenceData}
              handleClick={handleClick}
              team="blue"
              role="captain"
            />
            <TeamRoleButton
              id="blueFirstMate"
              presenceData={presenceData}
              handleClick={handleClick}
              team="blue"
              role="first-mate"
            />
            <TeamRoleButton
              id="blueEngineer"
              presenceData={presenceData}
              handleClick={handleClick}
              team="blue"
              role="engineer"
            />
            <TeamRoleButton
              id="blueRadioOperator"
              presenceData={presenceData}
              handleClick={handleClick}
              team="blue"
              role="radio-operator"
            />
          </div>
          <div style={styles.team}>
            <TeamRoleButton
              id="redCaptain"
              presenceData={presenceData}
              handleClick={handleClick}
              team="red"
              role="captain"
            />
            <TeamRoleButton
              id="redFirstMate"
              presenceData={presenceData}
              handleClick={handleClick}
              team="red"
              role="first-mate"
            />
            <TeamRoleButton
              id="redEngineer"
              presenceData={presenceData}
              handleClick={handleClick}
              team="red"
              role="engineer"
            />
            <TeamRoleButton
              id="redRadioOperator"
              presenceData={presenceData}
              handleClick={handleClick}
              team="red"
              role="radio-operator"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
