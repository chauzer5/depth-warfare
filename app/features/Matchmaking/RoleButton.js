export default function RoleButton(props) {
  const styles = {
    button: {
      width: "100%",
      height: "70px",
      backgroundColor: "black",
      border: `2px solid blue`,
      color: "blue",
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      marginBottom: "10px",
    },
  };

  return (
    <button style={styles.button}>
      {`Person`}
    </button>
  )
}