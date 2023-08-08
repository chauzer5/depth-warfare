export const SYSTEMS_INFO = [
    {
        name: "silence",
        color: theme.purple,
        maxCharge: 6,
    },
    {
        name: "scan",
        color: theme.green,
        maxCharge: 4,
    },
    {
        name: "torpedo",
        color: theme.red,
        maxCharge: 4,
    },
    {
        name: "mine",
        color: theme.orange,
        maxCharge: 3,
    }
];

export function rowToIndex(row){
    return row - 1;
}

export function indexToRow(index){
    return index + 1;
}

export function columnToIndex(col){
    return col.toLowerCase().charCodeAt(0) - 97;
}

export function indexToColumn (index){
    return String.fromCharCode(index + 97).toUpperCase();
}

export function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}
