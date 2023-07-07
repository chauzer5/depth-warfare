import { GameWrapper } from './context/game_state'

export const metadata = {
  title: 'Depth Warfare',
  description: 'An underwater game of combat',
};

export default function RootLayout({ children }) {
  const styles = {
    body: {
      backgroundColor: "black",
      margin: 0,
      fontFamily: "'VT323', monospace",
      fontSize: "26px",
      color: "#45FF04",
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Koulen&family=Stalinist+One&family=VT323&display=swap" rel="stylesheet"/>
      </head>
      <body style={styles.body}>
        <GameWrapper>
          {children}
        </GameWrapper>
      </body>
    </html>
  )
}
