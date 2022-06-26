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
  await page.type(emailInput, process.env.EMAIL, { delay: 10 });
  await page.type(passwordInput, process.env.PASS, { delay: 10 });

  await page.click(loginButton);
  await page.waitForNavigation();

  await page.goto(groupLink, { waitUntil: "networkidle2" });

  // Click on "show more"-button, but only in the first container (does not work yet, clicks on all "show more"-buttons)
  // for (let i = 0; i < 5; i++) {
  //   await page.waitForTimeout(3000);
  //   await page.waitForSelector(showMoreButton);
  //   await page.click(showMoreButton).catch(() => {});
  // }

  // await page.waitForTimeout(3000);

  // Fetch links
  const links = await page.evaluate(() => {
    return [
      ...document.querySelectorAll(
        ".a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5 a"
      ),
    ].map((link) => link.href);
  });

  //await console.log(links);

  // Open all links in new tab
  const pages = [];
  const eventInfos = [];

  for (let i = 0; i < links.length; i++) {
    pages[i] = await browser.newPage();
    await pages[i].goto(links[i]);

    let infos = await pages[i].evaluate(() => {
      return [
        ...document.querySelectorAll(
          ".j83agx80.cbu4d94t.obtkqiv7.sv5sfqaa .bi6gxh9e.aov4n071"
        ),
      ].map((info) => info.innerText);
    });

    await eventInfos.push(infos);
  }

  await console.log(eventInfos);

  // // Fetch all event nodes on this page

  // const dateAndName = await page.evaluate(() => {
  //   const nodes = [
  //     ...document.getElementsByClassName("j83agx80 cbu4d94t mysgfdmx hddg9phg"),
  //   ];
  //   return nodes.map((node) => {
  //     return {
  //       date: node.children[0].innerText,
  //       name: node.children[1].innerText,
  //     };
  //   });
  // });

  // await console.log(dateAndName);

  // const dateAndName = await nodes.map((node) => {
  //   return {
  //     date: node.children[0].innerText,
  //     name: node.children[1].innerText,
  //   };
  // });

  // await console.log(dateAndName);
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
// const isButtonVisible = async (page, cssSelector) => {
//   let visible = true;
//   await page
//     .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
//     .catch(() => {
//       visible = false;
//     });
//   return visible;
// };

//a8c37x1j ni8dbmo4 stjgntxs l9j0dhe7 ltmttdrg g0qnabr5
//s9t1a10h n851cfcs j83agx80 bp9cbjyn
