import { Box } from "@mui/material";
import { useGameContext } from "@/app/state/game_state";
import { indexToColumn, indexToRow } from "@/app/utils";
import theme from "@/app/styles/theme";
import { useAblyContext } from "@/app/state/ably_state";

export default function RadioMap() {
  const { gameMap, radioMapNotes, playerTeam } = useGameContext();
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
    note: {
      color: theme.white,
      fontSize: "24px",
    },
    latestNote: {
      color: theme.red,
      fontSize: "24px",
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

  const handleClick = (row, column) => {
    channel.publish("radio-operator-add-remove-note", { row, column });
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
            {row.map((cell, columnIndex) => (
              <td
                key={columnIndex}
                style={{
                  ...styles.cell,
                  ...getSectorStyle(rowIndex, columnIndex),
                  ...getIslandBorders(rowIndex, columnIndex),
                }}
              >
                <Box
                  sx={cell.type === "island" ? styles.island : styles.water}
                  onClick={() => handleClick(rowIndex, columnIndex)}
                >
                  {radioMapNotes[playerTeam].find(
                    (note) => note[0] === rowIndex && note[1] === columnIndex,
                  ) && (
                    <span
                      style={
                        rowIndex ===
                          radioMapNotes[playerTeam][
                            radioMapNotes[playerTeam].length - 1
                          ][0] &&
                        columnIndex ===
                          radioMapNotes[playerTeam][
                            radioMapNotes[playerTeam].length - 1
                          ][1]
                          ? styles.latestNote
                          : styles.note
                      }
                    >
                      X
                    </span>
                  )}
                </Box>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
