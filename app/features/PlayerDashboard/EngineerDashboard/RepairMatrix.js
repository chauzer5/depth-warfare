import { useState, useEffect } from "react"; // Import useState
import { Box } from "@mui/material";
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { ENGINEER_SYSTEMS_INFO } from "@/app/utils";

export default function RepairMatrix(props) {
  const { channel, clearRepairMatrix } = props;

  const {
    playerTeam,
    pendingNavigate,
    subLocations,
    getEmptyRepairMatrix,
    checkConnectedRepairMatrixPath,
    pickNewOuterCells,
    engineerPendingBlock,
    engineerCompassMap,
  } = useGameContext();

  // This creates an empty and random repair matrix
  const [repairMatrix, setRepairMatrix] = useState(getEmptyRepairMatrix());
  const [resolvedMatrix, setResolvedMatrix] = useState([]);
  const blockSystem =
    engineerCompassMap[playerTeam][pendingNavigate[playerTeam]];

  const MATRIX_SIZE = process.env.REPAIR_MATRIX_DIMENSION;
  const MATRIX_CELL_SIZE = process.env.REPAIR_MATRIX_CELL_SIZE;
  const tabSize = Math.round(MATRIX_CELL_SIZE * 0.4);
  const hoverColor = getColorByName(blockSystem);

  const styles = {
    table: {
      borderCollapse: "collapse",
      maxHeight: `${(MATRIX_SIZE + 2) * 25}px`,
    },
    cell: {
      border: "none",
      borderCollapse: "collapse",
      padding: 0,
    },
    innerCellWithHover: {
      width: `${MATRIX_CELL_SIZE}px`,
      height: `${MATRIX_CELL_SIZE}px`,
      "&:hover": {
        backgroundColor: hoverColor,
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    innerCell: {
      width: `${MATRIX_CELL_SIZE}px`,
      height: `${MATRIX_CELL_SIZE}px`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    pendingBlockPlacement: {
      width: `${MATRIX_CELL_SIZE}px`,
      height: `${MATRIX_CELL_SIZE}px`,
      backgroundColor: hoverColor,
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
    outerCell: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  function getColorByName(systemName) {
    const systemInfo = ENGINEER_SYSTEMS_INFO.find(
      (system) => system.name === systemName
    );
    return systemInfo ? systemInfo.color : null;
  }

  const setBackgroundColor = (row, column) => {
    const cellStyle = {};

    const cell = repairMatrix[row][column];
    const cellColor = getColorByName(cell.system);

    if (row === 0) {
      cellStyle.height = Math.round(MATRIX_CELL_SIZE * 0.4);
    }

    cellStyle.backgroundColor = cellColor;

    if (
      (cell.system === "empty" && cell.type === "inner") ||
      cell.system !== "empty"
    ) {
      cellStyle.border = `2px solid ${theme.gray}`;
    }

    return cellStyle;
  };

  const setCellDims = (row, column) => {
    const cellStyle = {};

    if (row === 0 || row == MATRIX_SIZE + 1) {
      cellStyle.height = `${tabSize}px`;
    } else {
      cellStyle.height = `${MATRIX_CELL_SIZE}px`;
    }

    if (column === 0 || column == MATRIX_SIZE + 1) {
      cellStyle.width = `${tabSize}px`;
    } else {
      cellStyle.width = `${MATRIX_CELL_SIZE}px`;
    }

    return cellStyle;
  };

  const isPendingCell = (row, column) => {
    if (
      engineerPendingBlock[playerTeam] &&
      engineerPendingBlock[playerTeam].row === row &&
      engineerPendingBlock[playerTeam].column === column
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (clearRepairMatrix) {
      const updatedMatrix = repairMatrix.map((row) =>
        row.map((cell) => ({
          ...cell,
          system: cell.type === "inner" ? "empty" : cell.system,
        }))
      );
      // Update the state with the repaired matrix
      setRepairMatrix(updatedMatrix);
    }
  }, [clearRepairMatrix]);

  const clickable =
    pendingNavigate[playerTeam] && !engineerPendingBlock[playerTeam]; // Can add other statements to see if it can be clickable

  const handleClick = (row, column) => {
    const updatedMatrix = [...repairMatrix.map((row) => [...row])];

    updatedMatrix[row][column] = {
      ...updatedMatrix[row][column],
      system: blockSystem,
    };

    const { isConnected, pathRowIndices, pathColumnIndices } =
      checkConnectedRepairMatrixPath(updatedMatrix, blockSystem);

    if (isConnected) {
      // Reset the cells along the path to "empty"
      for (let i = 0; i < pathRowIndices.length; i++) {
        const pathRow = pathRowIndices[i];
        const pathCol = pathColumnIndices[i];

        updatedMatrix[pathRow][pathCol] = {
          ...updatedMatrix[pathRow][pathCol],
          system: "empty",
        };
      }

      // Choose new random nodes along the outside
      const selectedCells = pickNewOuterCells(updatedMatrix);

      for (const { row, col } of selectedCells) {
        updatedMatrix[row][col] = {
          type: "outer",
          system: blockSystem,
        };
      }
    }

    setResolvedMatrix(updatedMatrix);

    const healSystem = isConnected;
    const clickedCell = { row, column };

    channel.publish("engineer-place-system-block", { clickedCell, healSystem });
  };

  useEffect(() => {
    if (resolvedMatrix.length > 0) {
      setRepairMatrix(resolvedMatrix);
      setResolvedMatrix([]);
    }
  }, [subLocations[playerTeam]]);

  // Functions for game goes here
  return (
    <table style={styles.table}>
      <tbody>
        {repairMatrix.map((row, rowIndex) => (
          <tr key={rowIndex} style={styles.row}>
            {row.map((cell, columnIndex) => (
              <td
                key={columnIndex}
                style={{
                  ...styles.cell,
                  ...setBackgroundColor(rowIndex, columnIndex),
                  ...setCellDims(rowIndex, columnIndex),
                }}
              >
                <Box
                  sx={
                    cell.type === "outer"
                      ? styles.outerCell
                      : cell.system == "empty" &&
                        isPendingCell(rowIndex, columnIndex)
                      ? styles.pendingBlockPlacement
                      : cell.system == "empty" && clickable
                      ? styles.innerCellWithHover
                      : styles.innerCell
                  }
                  onClick={
                    clickable &&
                    cell.system === "empty" &&
                    cell.type === "inner"
                      ? () => handleClick(rowIndex, columnIndex)
                      : null
                  }
                ></Box>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
