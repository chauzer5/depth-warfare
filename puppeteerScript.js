const puppeteer = require("puppeteer");

const url = "http://localhost:3000/";
const numberOfTabs = 8;
const userNameArray = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
  "player7",
  "player8",
];
const idArray = [
  "blueCaptain",
  "blueFirstMate",
  "blueEngineer",
  "blueRadioOperator",
  "redCaptain",
  "redFirstMate",
  "redEngineer",
  "redRadioOperator",
];

async function openTabs() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const pages = await Promise.all(Array.from({ length: numberOfTabs }, async (_, index) => {
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector("input");
    await page.type("input", userNameArray[index]);
    await page.keyboard.press("Enter");

    await page.waitForSelector(`#joinMatch`);
    await page.click(`#joinMatch`);

    await page.waitForSelector("input");
    await page.type("input", "GAME");
    await page.keyboard.press("Enter");

    await page.waitForSelector(`#${idArray[index]}`);

    const role = await page.$(`#${idArray[index]}`);
    if (role) {
      await role.click();
    } else {
      console.error(`${idArray[index]} button not found.`);
    }

    return page;
  }));

  return { browser, pages };
}

// Call the openTabs function and then click "Begin Match" button after all promises are resolved
async function startGame() {
  const { browser, pages } = await openTabs();

  // Wait for all pages to complete their initial navigation
  await Promise.all(pages.map((page) => page.waitForSelector("#beginMatch")));

  // After all promises are resolved, click the "Begin Match" button
  const beginMatchButton = await pages[0].waitForSelector("#beginMatch"); 
  await pages[0].waitForFunction(
    (button) => !button.disabled,
    {},
    beginMatchButton
  );

  await beginMatchButton.click();
}

// Call the function to start the game
startGame();
