import theme from "@/app/styles/theme";

export default function SectorsKey() {
  const styles = {
    table: {
      borderCollapse: "collapse",
      margin: "25px",
      maxHeight: "80px",
    },
    caption: {
      color: "white",
    },
    row: {
      height: "20px",
    },
    cell: {
      border: `2px solid ${theme.green}`,
      textAlign: "center",
      color: "white",
      width: "26px",
    },
  };

  return (
    <table style={styles.table}>
      <caption style={styles.caption}>Sectors</caption>
      <tbody>
        <tr style={styles.row}>
          <td style={styles.cell}>1</td>
          <td style={styles.cell}>2</td>
          <td style={styles.cell}>3</td>
        </tr>
        <tr style={styles.row}>
          <td style={styles.cell}>4</td>
          <td style={styles.cell}>5</td>
          <td style={styles.cell}>6</td>
        </tr>
        <tr style={styles.row}>
          <td style={styles.cell}>7</td>
          <td style={styles.cell}>8</td>
          <td style={styles.cell}>9</td>
        </tr>
      </tbody>
    </table>
  );
}
