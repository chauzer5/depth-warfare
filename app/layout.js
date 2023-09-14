import { GameWrapper } from "./state/game_state";
import theme from "@/app/styles/theme";

export const metadata = {
  title: "Depth Warfare",
  description: "An underwater game of combat",
};

export default function RootLayout({ children }) {
  const styles = {
    body: {
      backgroundColor: theme.black,
      margin: 0,
      fontFamily: "'VT323', monospace",
      fontSize: "26px",
      color: theme.green,
      userSelect: "none",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Koulen&family=Stalinist+One&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={styles.body}>
        <GameWrapper>{children}</GameWrapper>
      </body>
    </html>
  );
}
