import React, { useState, useEffect } from 'react'; // Import useState
import Modal from 'react-modal'
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";

export default function RepairMatrix(props) {
    const { channel } = props;

    const styles = {
        text: {
            fontSize: "25px",
        },
        gridContainer: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gridTemplateRows: "auto 1fr auto",
            gridGap: "10px",
        },
        tab: {
            padding: "5px 10px",
            border: "1px solid black",
            textAlign: "center",
            cursor: "pointer",
        },
    };

    const colors = ['red', 'blue', 'green', 'yellow'];

    // Create a 4x4 grid with tabs and colors
    const [grid, setGrid] = useState([]);

    useEffect(() => {
        generateGrid();
    }, []);

    const generateGrid = () => {
        const newGrid = [];

        for (let row = 0; row < 4; row++) {
            const rowTabs = [];
            for (let col = 0; col < 4; col++) {
                rowTabs.push({
                    color: null,
                    isEmpty: true,
                });
            }
            newGrid.push(rowTabs);
        }

        // Randomly assign colors to tabs
        const availableTabs = [...Array(16).keys()]; // [0, 1, ..., 15]
        for (const color of colors) {
            for (let i = 0; i < 2; i++) {
                const randomIndex = Math.floor(Math.random() * availableTabs.length);
                const tabIndex = availableTabs.splice(randomIndex, 1)[0];
                const row = Math.floor(tabIndex / 4);
                const col = tabIndex % 4;
                newGrid[row][col] = {
                    color: color,
                    isEmpty: false,
                };
            }
        }

        setGrid(newGrid);
    };

    return (
        <div style={styles.text}>
            <div style={styles.gridContainer}>
                <div style={{ gridRow: "1", gridColumn: "2 / span 2", ...styles.tab }}>Top</div>
                <div style={{ gridRow: "4", gridColumn: "2 / span 2", ...styles.tab }}>Bottom</div>
                <div style={{ gridRow: "2 / span 2", gridColumn: "1", ...styles.tab }}>Left</div>
                <div style={{ gridRow: "2 / span 2", gridColumn: "4", ...styles.tab }}>Right</div>
                {grid.map((row, rowIndex) => {
                    return row.map((tab, colIndex) => {
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                style={{
                                    backgroundColor: tab.isEmpty ? "white" : tab.color,
                                    ...styles.tab,
                                }}
                            >
                                {tab.color}
                            </div>
                        );
                    });
                })}
            </div>
        </div>
    );
};

