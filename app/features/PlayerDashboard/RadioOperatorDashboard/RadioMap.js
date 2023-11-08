/** @jsxImportSource @emotion/react */
import { useGameContext } from "@/app/state/game_state";
import { indexToColumn, indexToRow } from "@/app/utils";
import theme from "@/app/styles/theme";
import targetImage from "../../../target.png";
import Image from "next/image";
import { useAblyContext } from "@/app/state/ably_state";
import {useState} from "react";

export default function RadioMap(props) {
  const { handleClick, clickedCell } = props
  const { networkState, playerTeam } = useGameContext();
  const { gameMap, probes } = networkState;

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
      "&:hover": {
        backgroundColor: theme.green,
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    water: {
      width: "25px",
      height: "26px",
      "&:hover": {
        backgroundColor: theme.green,
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    probe: {
      color: theme.white,
      borderRadius: "50%",
      display: "inline-block",
      width: "19px",
      height: "19px",
      justifyContent: "center", 
      alignItems: "center",
      fontWeight: "bold",
      lineHeight: "19px",
      textAlign: "center",
      background: "transparent", 
      border: "3px solid white", 
      fontSize: "18px",
      position: "absolute",
      zIndex: 0,
    },
    activeProbe: {
      color: theme.white,
      borderRadius: "50%",
      display: "inline-block",
      width: "20px",
      height: "20px",
      justifyContent: "center", 
      alignItems: "center",
      fontWeight: "bold",
      lineHeight: "19px",
      textAlign: "center",
      background: "transparent", 
      border: "3px solid red", 
      boxShadow: "0px 0px 4px 4px rgba(255,0,0,0.8)",
      fontSize: "18px",
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
            {row.map((cell, columnIndex) => {

              const probe = probes[playerTeam].find((note) => note[0] === rowIndex && note[1] === columnIndex)

              console.log("probe", probe)

              return (
                <td
                  key={columnIndex}
                  style={{
                    ...styles.cell,
                    ...getSectorStyle(rowIndex, columnIndex),
                    ...getIslandBorders(rowIndex, columnIndex),
                  }}
                >
                  <div
                    css={cell.type === "island" ? styles.island : styles.water}
                    onClick={() => handleClick(rowIndex, columnIndex)}
                  >
                    {(probe) && ( <span style={styles.probe}>{probe[2]}</span>
                    )}
                    {clickedCell && clickedCell.row === rowIndex && clickedCell.column === columnIndex && (
                      <span style={styles.targetCellStyle}>
                        <Image
                          src={targetImage}
                          alt="Target"
                          width={25}
                          height={25}
                        />
                      </span>
                    )}
                  </div>
                </td>
              )
        })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
