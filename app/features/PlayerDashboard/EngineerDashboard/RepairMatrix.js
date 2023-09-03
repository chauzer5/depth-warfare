import React, { useState, useEffect } from 'react'; // Import useState
import Modal from 'react-modal'
import { Box } from "@mui/material";
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter, ENGINEER_SYSTEMS_INFO } from "@/app/utils";


export default function RepairMatrix(props){
    const { channel, current_system } = props;

    const { playerTeam, pendingNavigate, pendingSystemCharge, getEmptyRepairMatrix, checkConnectedRepairMatrixPath, pickNewOuterCells, engineerPending, engineerCompassMap } = useGameContext();

    // This creates an empty and random repair matrix
    const [repairMatrix, setRepairMatrix] = useState(getEmptyRepairMatrix());
    const [resolvedMatrix, setResolvedMatrix] = useState([]);
    const [pendingRepairMatrixBlock, setPendingRepairMatrixBlock] = useState(null);


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

        const cell = repairMatrix[row][column];
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
        if (pendingRepairMatrixBlock && pendingRepairMatrixBlock[0] === row && pendingRepairMatrixBlock[1] === column) {
            return true;
        }
        return false
    }
    
    
    const clickable = pendingNavigate[playerTeam] && !engineerPending[playerTeam] ;   // Can add other statements to see if it can be clickable

    const handleClick = (row, column) => {
        const updatedMatrix = [...repairMatrix.map(row => [...row])];
        const blockSystem = engineerCompassMap[playerTeam][pendingNavigate[playerTeam]];

        updatedMatrix[row][column] = {
            ...updatedMatrix[row][column],
            system: blockSystem,
        };

        if (!pendingSystemCharge[playerTeam]) {
            setPendingRepairMatrixBlock([ row, column ])
            console.log("pending block", [ row, column ], !pendingSystemCharge[playerTeam])
        }

        setRepairMatrix(updatedMatrix)

        const { isConnected, pathRowIndices, pathColumnIndices } = checkConnectedRepairMatrixPath(updatedMatrix, blockSystem);
        
        if (isConnected) {
            const tempMatrix = [...updatedMatrix.map(row => [...row])];
            // Reset the cells along the path to "empty"
            for (let i = 0; i < pathRowIndices.length; i++) {
                const pathRow = pathRowIndices[i];
                const pathCol = pathColumnIndices[i];

                tempMatrix[pathRow][pathCol] = {
                    ...tempMatrix[pathRow][pathCol],
                    system: "empty",
                };
            }

            // Choose new random nodes along the outside
            const selectedCells = pickNewOuterCells(tempMatrix)

            for (const { row, col } of selectedCells) {
                tempMatrix[row][col] = {
                    type: "outer",
                    system: blockSystem,
                };
            }

            setResolvedMatrix(tempMatrix)
        }

        const healSystem = isConnected
        
        channel.publish("engineer-place-system-block", { healSystem });
    };

    useEffect(() => {
        console.log("pendingBlock", pendingRepairMatrixBlock)
        if (!pendingNavigate[playerTeam]) {
            if (resolvedMatrix.length > 0) {
                setRepairMatrix(resolvedMatrix)
                setResolvedMatrix([])
            }
            // setPendingRepairMatrixBlock(null)
            console.log("entered repairMatrix useEffect")
        }
    }, [pendingNavigate[playerTeam]]);

    // Functions for game goes here
    return (
        <table style={styles.table}>
            <tbody>
                {repairMatrix.map((row, rowIndex) => (
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

