import { GameWrapper } from './context/game_state'

export const metadata = {
  title: 'Depth Warfare',
  description: 'A game of underwater conflict',
}

export default function RootLayout({ children }) {
  const styles = {
    body: {
      backgroundColor: "black",
      margin: 0,
      fontFamily: "'Stalinist One', cursive",
      fontSize: "26px",
      color: "#45FF04",
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Koulen&family=Stalinist+One&display=swap" rel="stylesheet"/>
      </head>
      <body style={styles.body}>
        <GameWrapper>
          {children}
        </GameWrapper>
      </body>
    </html>
  )
}
