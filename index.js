require("dotenv").config();
const puppeteer = require("puppeteer");

// Selectors
const cookieButton = '[data-cookiebanner="accept_only_essential_button"]';
const emailInput = '[name="email"]';
const passwordInput = '[name="pass"]';
const loginButton = '[name="login"]';

// Puppeteer
(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });

  const page = await browser.newPage();
  await page.goto("https://www.facebook.com", { waitUntil: "networkidle2" });
  await page.waitForSelector(cookieButton);
  await page.click(cookieButton);
  await page.waitForSelector(emailInput);
  await page.waitForSelector(passwordInput);
  await page.waitForSelector(loginButton);
  await page.type(emailInput, process.env.EMAIL);
  await page.type(passwordInput, process.env.PASS);
  await page.click(loginButton);
  await page.waitForTimeout(5000);

  await browser.close();
})();
