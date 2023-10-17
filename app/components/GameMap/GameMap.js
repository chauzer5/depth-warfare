/** @jsxImportSource @emotion/react */
import { useGameContext } from "../../state/game_state";
import { indexToColumn, indexToRow } from "../../utils";
import theme from "@/app/styles/theme";
import { useEffect, useState } from "react";
import targetImage from "../../target.png";
import Image from "next/image";
import { useAblyContext } from "@/app/state/ably_state";

export default function GameMap(props) {
  const {
    handleClick,
    silence,
    toggledSystem,
    clickedCell,
    torpedoCells,
    dropMineCells,
  } = props;
  const {
    networkState,
    playerTeam,
    getValidSilenceCells,
    getFirstMateSystem,
  } = useGameContext();

  const { gameMap, pendingNavigate, subLocations, minesList } = networkState
  console.log("gameMap is", gameMap)
  const { channel } = useAblyContext();

  const MAP_DIMENSION = process.env.MAP_DIMENSION;
  const SECTOR_DIMENSION = process.env.SECTOR_DIMENSION;

  const styles = {
    table: {
      borderCollapse: "collapse",
      maxHeight: `${(MAP_DIMENSION + 1) * 25}px`,
    },
    cell: {
      border: `2px solid ${theme.green}`,
      borderCollapse: "collapse",
      width: "25px",
      padding: 0,
    },
    columnHeader: {
      width: "25px",
    },
    island: {
      width: "25px",
      height: "25px",
      backgroundColor: theme.darkGreen,
    },
    water: {
      width: "25px",
      height: "26px",
      "&:hover": {
        backgroundColor: handleClick ? theme.green : theme.black,
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    blueSub: {
      width: "25px",
      height: "26px",
      backgroundColor: theme.blue,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    redSub: {
      width: "25px",
      height: "26px",
      backgroundColor: theme.red,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    pendingMoveCell: {
      width: "25px",
      height: "26px",
      backgroundColor: theme.white,
      animation: "blink 1s infinite",
      "@keyframes blink": {
        "0%": { opacity: 1 },
        "49.99%": { opacity: 1 },
        "50%": { opacity: 0 },
        "99.99%": { opacity: 0 },
        "100%": { opacity: 1 },
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    inRangeCell: {
      width: "25px",
      height: "26px",
      backgroundColor: theme.gray,
      "&:hover": {
        backgroundColor: theme.green,
      },
    },
    visitedCell: {
      color: theme.white,
      fontSize: "24px",
    },
    mineCell: {
      color: getFirstMateSystem("mine").color,
      fontSize: "24px",
      position: "absolute",
      zIndex: 0,
    },
    targetCellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      zIndex: 1,
      pointerEvents: "none",
    },
  };

  const getSectorStyle = (row, column) => {
    const sectorStyle = {};

    if (column % SECTOR_DIMENSION === 0) {
      sectorStyle.borderLeft = `5px solid ${theme.green}`;
    }
    if (column === MAP_DIMENSION - 1) {
      sectorStyle.borderRight = `5px solid ${theme.green}`;
    }
    if (row % SECTOR_DIMENSION === 0) {
      sectorStyle.borderTop = `5px solid ${theme.green}`;
    }
    if (row === MAP_DIMENSION - 1) {
      sectorStyle.borderBottom = `5px solid ${theme.green}`;
    }

    return sectorStyle;
  };

  const getIslandBorders = (row, column) => {
    const islandStyle = {};

    const cell = gameMap[row][column];
    if (cell.type != "island") {
      return islandStyle;
    }

    islandStyle.border = "none";
    islandStyle.backgroundColor = theme.darkGreen;

    return islandStyle;
  };

  const [silenceCells, setSilenceCells] = useState([]);

  useEffect(() => {
    if (silence) {
      const newSilenceCells = getValidSilenceCells(
        playerTeam,
        subLocations,
        gameMap,
      );
      setSilenceCells(newSilenceCells);
    }
  }, [silence]);

  const handleSilence = (row, column) => {
    channel?.publish("captain-silence", { row, column });
  };

  if (typeof gameMap === "undefined" || gameMap === null) {
    return <div></div>;
  } else {
    return (
      <table style={styles.table}>
        <tbody>
          <tr style={styles.row}>
            <td></td>
            {Array(MAP_DIMENSION)
              .fill(0)
              .map((col, index) => (
                <th style={styles.columnHeader} key={index}>
                  {indexToColumn(index)}
                </th>
              ))}
          </tr>

          {gameMap.map((row, rowIndex) => (
            <tr key={rowIndex} style={styles.row}>
              <th>{indexToRow(rowIndex)}</th>
              {row.map((cell, columnIndex) => (
                <td
                  key={columnIndex}
                  style={{
                    ...styles.cell,
                    ...getSectorStyle(rowIndex, columnIndex),
                    ...getIslandBorders(rowIndex, columnIndex),
                  }}
                >
                  <div
                    css={
                      cell.type === "island"
                        ? styles.island
                        : cell.subPresent[playerTeam] && playerTeam === "blue"
                        ? styles.blueSub
                        : cell.subPresent[playerTeam] && playerTeam === "red"
                        ? styles.redSub
                        : !toggledSystem &&
                          pendingNavigate[playerTeam] === "north" &&
                          rowIndex === subLocations[playerTeam][0] - 1 &&
                          columnIndex === subLocations[playerTeam][1]
                        ? styles.pendingMoveCell
                        : !toggledSystem &&
                          pendingNavigate[playerTeam] === "south" &&
                          rowIndex === subLocations[playerTeam][0] + 1 &&
                          columnIndex === subLocations[playerTeam][1]
                        ? styles.pendingMoveCell
                        : !toggledSystem &&
                          pendingNavigate[playerTeam] === "west" &&
                          rowIndex === subLocations[playerTeam][0] &&
                          columnIndex === subLocations[playerTeam][1] - 1
                        ? styles.pendingMoveCell
                        : !toggledSystem &&
                          pendingNavigate[playerTeam] === "east" &&
                          rowIndex === subLocations[playerTeam][0] &&
                          columnIndex === subLocations[playerTeam][1] + 1
                        ? styles.pendingMoveCell
                        : toggledSystem === "torpedo" &&
                          torpedoCells.find(
                            (cell) =>
                              cell[0] === rowIndex && cell[1] === columnIndex,
                          )
                        ? styles.inRangeCell
                        : toggledSystem === "mine" &&
                          dropMineCells.find(
                            (cell) =>
                              cell[0] === rowIndex && cell[1] === columnIndex,
                          )
                        ? styles.inRangeCell
                        : styles.water
                    }
                    onClick={
                      handleClick
                        ? () => handleClick(cell, rowIndex, columnIndex)
                        : null
                    }
                  >
                    {toggledSystem &&
                      clickedCell &&
                      clickedCell.row === rowIndex &&
                      clickedCell.column === columnIndex && (
                        <div style={styles.targetCellStyle}>
                          <Image
                            src={targetImage}
                            alt="Target"
                            width={25}
                            height={25}
                          />
                        </div>
                      )}
                    {!toggledSystem &&
                      cell.visited &&
                      cell.visited[playerTeam] && (
                        <span style={styles.visitedCell}>X</span>
                      )}

                    {toggledSystem === "mine" &&
                      minesList[playerTeam].find(
                        (cell) =>
                          cell[0] === rowIndex && cell[1] === columnIndex,
                      ) && <span style={styles.mineCell}>M</span>}

                    {silence &&
                      silenceCells.find(
                        (cell) =>
                          cell[0] === rowIndex && cell[1] === columnIndex,
                      ) && (
                        <div
                          css={{
                            minWidth: "25px",
                            minHeight: "25px",
                            backgroundColor: theme.purple,
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#4D0081",
                            },
                          }}
                          onClick={() => {
                            handleSilence(rowIndex, columnIndex);
                          }}
                        />
                      )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
