const puppeteer = require('puppeteer');


const url = 'http://localhost:3000/';
const numberOfTabs = 8;
const userNameArray = ["player1", "player2", "player3", "player4", "player5", "player6" , "player7", "player8" ];
const idArray = ["blueCaptain", "blueFirstMate", "blueEngineer", "blueRadioOperator", "redCaptain", "redFirstMate", "redEngineer", "redRadioOperator"];


async function openTabs(){
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null, // Let each page have its own viewport
    });

    const promises = Array.from({ length: numberOfTabs }, async (_, index) => {
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector("input");
        await page.type("input", userNameArray[index]);
        await page.keyboard.press("Enter");
        await page.waitForSelector(`#${idArray[index]}`);
        const role = await page.$(`#${idArray[index]}`);
        if (role) {
            await role.click();
        } else {
            console.error(`${idArray[index]} button not found.`);
        }
        // await page.waitForSelector("blueCaptain");
        // await page.click("blueCaptain");
        console.log(`Opened tab ${index + 1}`);

      });

      await Promise.all(promises);
      
      // Let's wait for 10 minutes (adjust as needed) before closing the browser
    // setTimeout(async () => {
    //     await browser.close();
    //     console.log('Browser closed');
    // }, 600000); // 10 minutes in milliseconds
}


openTabs();

