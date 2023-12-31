/** @jsxImportSource @emotion/react */
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { ENGINEER_SYSTEMS_INFO } from "@/app/utils";
import { useAblyContext } from "@/app/state/ably_state";

export default function RepairMatrix() {
  const { playerTeam, networkState } = useGameContext();

  const {
    pendingNavigate,
    engineerPendingBlock,
    engineerCompassMap,
    repairMatrix,
  } = networkState;

  const { channel } = useAblyContext();

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
      (system) => system.name === systemName,
    );
    return systemInfo ? systemInfo.color : null;
  }

  const setBackgroundColor = (row, column) => {
    const cellStyle = {};

    const cell = repairMatrix[playerTeam][row][column];
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

  const clickable =
    pendingNavigate[playerTeam] && !engineerPendingBlock[playerTeam]; // Can add other statements to see if it can be clickable

  const handleClick = (row, column) => {
    const clickedCell = { row, column };
    channel.publish("engineer-place-system-block", { clickedCell });
  };

  // Functions for game goes here
  return (
    <table style={styles.table}>
      <tbody>
        {repairMatrix[playerTeam].map((row, rowIndex) => (
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
                <div
                  css={
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
                ></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
