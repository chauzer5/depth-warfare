import React, { useState, useEffect } from 'react'; // Import useState
import Modal from 'react-modal'
import { Box } from "@mui/material";
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter, ENGINEER_SYSTEMS_INFO } from "@/app/utils";


export default function RepairMatrix(props){
    const { channel, current_system } = props;

    const { repairMatrix, playerTeam, setRepairMatrix, pendingRepairMatrixBlock, pendingNavigate } = useGameContext();

    const MATRIX_SIZE = process.env.REPAIR_MATRIX_DIMENSION
    const MATRIX_CELL_SIZE = process.env.REPAIR_MATRIX_CELL_SIZE
    const tabSize = Math.round(MATRIX_CELL_SIZE * .4)

    const [hoverColor, setHoverColor] = useState(null); // State to store the hover color

    useEffect(() => {
        // Update the hover color whenever the current_system changes
        const color = getColorByName(current_system);
        setHoverColor(color);
    }, [current_system]);

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
    
    const clickable = pendingNavigate[playerTeam] && !pendingRepairMatrixBlock[playerTeam] ;   // Can add other statements to see if it can be clickable

    const isCorner = (matrix, row, column) => {
        return (row === 0 && column === 0 
            || row === 0 && column === matrix.length - 1
            || row === matrix.length - 1 && column === 0
            || row === matrix.length - 1 && column === matrix.length - 1)
    }

    const pickNewOuterCells = (matrix) => {
        const emptyOuterCells = []; // Array to store coordinates of empty outer cells
    
        // Find empty outer cells and store their coordinates
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[0].length; col++) {
                const cell = matrix[row][col];
                if (cell.type === "outer" && cell.system === "empty" && !isCorner(matrix, row, col)) {
                    emptyOuterCells.push({ row, col });
                }
            }
        }
    
        // Check if there are at least two empty outer cells
        if (emptyOuterCells.length < 2) {
            console.log("Not enough empty outer cells to assign current_system.");
            return;
        }
    
        // Randomly select two empty outer cells
        const randomIndices = getRandomIndices(emptyOuterCells.length, 2);
        const selectedCells = randomIndices.map(index => emptyOuterCells[index]);

        return selectedCells
    };
    
    // Function to get random distinct indices
    const getRandomIndices = (max, count) => {
        const indices = Array.from({ length: max }, (_, index) => index);
        const randomIndices = [];
    
        while (randomIndices.length < count && indices.length > 0) {
            const randomIndex = Math.floor(Math.random() * indices.length);
            randomIndices.push(indices.splice(randomIndex, 1)[0]);
        }
    
        return randomIndices;
    };

    const handleClick = (row, column) => {
        // Create a copy of the repairMatrix
        const updatedMatrix = [...repairMatrix.map(row => [...row])];

        // Update the specific cell's system value with the current_system
        updatedMatrix[row][column] = {
            ...updatedMatrix[row][column],
            system: current_system,
        };

        setRepairMatrix(updatedMatrix);

        setHoverColor(null)

        const { isConnected, pathRowIndices, pathColumnIndices } = checkConnectedPath(updatedMatrix, current_system);

        console.log("path results")
        console.log(isConnected, pathRowIndices, pathColumnIndices)
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

            const selectedCells = pickNewOuterCells(updatedMatrix)

            for (const { row, col } of selectedCells) {
                updatedMatrix[row][col] = {
                    type: "outer",
                    system: current_system,
                };
            }

            // Update the state with the new matrix containing reset cells
            setRepairMatrix(updatedMatrix);
        }

        channel.publish("engineer-place-system-block", {system: current_system});
    };

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
                                ...setCellDims(rowIndex, columnIndex),
                            }}>
                                <Box
                                    sx={ cell.type === "outer"
                                    ? styles.outerCell
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

