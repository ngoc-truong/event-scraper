require("dotenv").config();
const puppeteer = require("puppeteer");

// Selectors
const cookieButton = '[data-cookiebanner="accept_only_essential_button"]';
const emailInput = '[name="email"]';
const passwordInput = '[name="pass"]';
const loginButton = '[name="login"]';
const showMoreButton = '[aria-label="Mehr anzeigen"]';
const containers = "dati1w0a ihqw7lf3 hv4rvrfc discj3wi";
const detailPageLink = ".r4lidvzm";
// Groups
const groupLink = "https://www.facebook.com/groups/296668743081/events";

// Puppeteer
(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  // Login
  await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
  await page.waitForSelector(cookieButton);
  await page.click(cookieButton);
  await page.waitForSelector(emailInput);
  await page.waitForSelector(passwordInput);
  await page.waitForSelector(loginButton);
  await page.type(emailInput, process.env.EMAIL, { delay: 10 });
  await page.type(passwordInput, process.env.PASS, { delay: 10 });

  await page.click(loginButton);
  await page.waitForNavigation();

  await page.goto(groupLink, { waitUntil: "networkidle2" });

  // Click on "show more"-button, but only in the first container (does not work yet, clicks on all "show more"-buttons)
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(3000);
    await page.waitForSelector(showMoreButton);
    await page.click(showMoreButton).catch(() => {});
  }

  // Fetch all event nodes on this page

  // await page.click(detailPageLink);

  // let loadMoreVisible = await isButtonVisible(page, showMoreButton);

  // while (loadMoreVisible) {
  //   await page.click(showMoreButton).catch(() => {});
  //   loadMoreVisible = await isButtonVisible(page, showMoreButton);
  // }

  // await page.waitForTimeout(5000);
  // await browser.close();
})();

// Helper functions
const isButtonVisible = async (page, cssSelector) => {
  let visible = true;
  await page
    .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
    .catch(() => {
      visible = false;
    });
  return visible;
};

// let nodes = [
//   ...document.getElementsByClassName("j83agx80 cbu4d94t mysgfdmx hddg9phg"),
// ];

// let dateAndName = nodes.map((node) => {
//   return { date: node.children[0].innerText, name: node.children[1].innerText };
// });

// nodes.map((node) => {
//   console.log(node.children[0].innerText, node.children[1].innerText);
// });
