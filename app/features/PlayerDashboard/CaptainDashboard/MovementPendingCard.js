import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';

export default function MovementPendingCard(props){
    const styles = {
        main: {
            width: "100%",
            height: "100px",
            backgroundColor: "#00FF00",
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",           
        },
        header: {
            color: "black",
            fontSize: "20px",
            margin: "10px",
        },
        bottom: {
            width: "100%",
            height: "50px",
            display: "flex",
            flexDirection: "row",
        },
        left: {
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        right: {
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
        },
        direction: {
            color: "black",
            fontSize: "50px",
        },
        waitingOnPlayer: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: "5px",
        },
        otherPlayer: {
            color: "black",
            fontSize: "20px",
        },
        checkbox: {
            width: "20px",
            height: "20px",
            backgroundColor: "black",
            marginRight: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        closeButton: {
            position: "relative",
            bottom: "84px",
            left: "132px",
            color: "black",
        },
    };

    return (
        <div style={styles.main}>
            <p style={styles.header}>Movement pending...</p>
            <div style={styles.bottom}>
                <div style={styles.left}>
                    <span style={styles.direction}>N</span>
                </div>
                <div style={styles.right}>
                    <div style={styles.waitingOnPlayer}>
                        <div style={styles.checkbox}>
                            <CheckIcon sx={{ fontSize: "20px" }}/>
                        </div>
                        <span style={styles.otherPlayer}>First Mate</span>
                    </div>
                    <div style={styles.waitingOnPlayer}>
                        <div style={styles.checkbox}></div>
                        <span style={styles.otherPlayer}>Engineer</span>
                    </div>
                </div>
            </div>

            <CancelIcon sx={styles.closeButton}/>
        </div>
    );
}
