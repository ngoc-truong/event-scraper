require("dotenv").config();
const puppeteer = require("puppeteer");

// Selectors
const cookieButton = '[data-cookiebanner="accept_only_essential_button"]';
const emailInput = '[name="email"]';
const passwordInput = '[name="pass"]';
const loginButton = '[name="login"]';
const showMoreButton = '[aria-label="Mehr anzeigen"]';

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
  await page.type(emailInput, process.env.EMAIL, { delay: 120 });
  await page.type(passwordInput, process.env.PASS, { delay: 120 });
  await page.click(loginButton);
  await page.waitForTimeout(2000);

  // Click load more button as long as possible
  await page.goto(groupLink, { waitUntil: "networkidle2" });

  // let loadMoreVisible = await isButtonVisible(page, showMoreButton);

  for (let i = 0; i < 5; i++) {
    await page.waitForSelector(showMoreButton);
    await page.click(showMoreButton).catch(() => {});
    await console.log(`Das ist das ${i}. Mal jetze.`);
  }

  // while (loadMoreVisible) {
  //   await page.click(showMoreButton).catch(() => {});
  //   loadMoreVisible = await isButtonVisible(page, showMoreButton);
  // }

  await page.waitForTimeout(5000);
  await browser.close();
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
