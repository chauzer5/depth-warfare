import React, { useState, useEffect } from 'react'; // Import useState
import Modal from 'react-modal'
import { Box } from "@mui/material";
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter, ENGINEER_SYSTEMS_INFO } from "@/app/utils";


export default function RepairMatrix(props){
    const { channel, current_system } = props;

    const { repairMatrix, playerTeam, pendingRepairMatrixBlock, pendingNavigate } = useGameContext();

    const MATRIX_SIZE = process.env.REPAIR_MATRIX_DIMENSION
    const MATRIX_CELL_SIZE = process.env.REPAIR_MATRIX_CELL_SIZE
    const tabSize = Math.round(MATRIX_CELL_SIZE * .4)

    // const [hoverColor, setHoverColor] = useState(null); // State to store the hover color

    const hoverColor = getColorByName(current_system)
    // useEffect(() => {
    //     // Update the hover color whenever the current_system changes
    //     hoverColor = getColorByName(current_system);
    // }, [current_system]);

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
    }

    function getColorByName(systemName) {
        const systemInfo = ENGINEER_SYSTEMS_INFO.find(system => system.name === systemName);
        return systemInfo ? systemInfo.color : null;
    }

    const setBackgroundColor = (row, column) => {
        const cellStyle = {};

        const cell = repairMatrix[playerTeam][row][column];
        const cellColor = getColorByName(cell.system)

        if (row === 0) {
            cellStyle.height = Math.round(MATRIX_CELL_SIZE * .4)
        }
    
        cellStyle.backgroundColor = cellColor;

        if ((cell.system === "empty" && cell.type === "inner") || (cell.system !== "empty")) {
            cellStyle.border = `2px solid ${theme.gray}`
        }

        return cellStyle;
    }

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
    }

    const isPendingCell = (row, column) => {
        if (pendingRepairMatrixBlock === null) {
            return false;
        }
    
        const playerTeamPendingBlock = pendingRepairMatrixBlock[playerTeam];
        
        if (playerTeamPendingBlock && playerTeamPendingBlock[0] === row && playerTeamPendingBlock[1] === column) {
            return true;
        }
        return false

    }
    
    const clickable = pendingNavigate[playerTeam] && !pendingRepairMatrixBlock[playerTeam] ;   // Can add other statements to see if it can be clickable

    const handleClick = (row, column) => {
        channel.publish("engineer-place-system-block", { row, column });
    };

    // Functions for game goes here
    return (
        <table style={styles.table}>
            <tbody>
                {repairMatrix[playerTeam].map((row, rowIndex) => (
                    <tr key={rowIndex} style={styles.row}>
                        {row.map((cell, columnIndex) => (
                            <td key={columnIndex} style={{
                                ...styles.cell,
                                ...setBackgroundColor(rowIndex, columnIndex),
                                ...setCellDims(rowIndex, columnIndex)
                            }}>
                                <Box
                                    sx={ cell.type === "outer"
                                    ? styles.outerCell
                                    : cell.system == "empty" && isPendingCell(rowIndex, columnIndex)
                                    ? styles.pendingBlockPlacement
                                    : cell.system == "empty" && clickable
                                    ? styles.innerCellWithHover
                                    : styles.innerCell }
                                    onClick={clickable && cell.system === "empty" && cell.type === "inner" ? () => handleClick(rowIndex, columnIndex) : null}
                                >
                                </Box>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
    };

