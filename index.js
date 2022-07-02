"use strict";
require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");

// Selectors
const cookieButton = '[data-cookiebanner="accept_only_essential_button"]';
const emailInput = '[name="email"]';
const passwordInput = '[name="pass"]';
const loginButton = '[name="login"]';
const showMoreButton = '[aria-label="Mehr anzeigen"]';
const infoBoxSelector =
  ".j83agx80.cbu4d94t.obtkqiv7.sv5sfqaa .bi6gxh9e.aov4n071";
const descriptionSelector = ".p75sslyk";
const loadMoreSelector =
  '.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.o9v6fnle div[role="button"]';

// Groups and links
const facebook = "https://www.facebook.com";

// Event infos
let eventInfos = [];

if (fs.existsSync("lindy-events.json")) {
  const rawData = fs.readFileSync("lindy-events.json");
  eventInfos = JSON.parse(rawData);
}

const askForEventsPage = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
};

// Helper functions to format date
const toISODate = (date) => {
  date = date.toString().toUpperCase();
  let regEx = /^\d{4}-\d{2}-\d{2}$/;

  // Change here
  if (
    date.includes("HEUTE") ||
    date.includes("MORGEN") ||
    date.includes("ÜBERMORGEN") ||
    date.includes("MONTAG") ||
    date.includes("DIENSTAG") ||
    date.includes("MITTWOCH") ||
    date.includes("DONNERSTAG") ||
    date.includes("FREITAG") ||
    date.includes("SAMSTAG") ||
    date.includes("SONNTAG") ||
    date.match(regEx)
  ) {
    return date;
  } else {
    return formatYear(date) + formatMonth(date) + formatDay(date);
  }
};

const formatYear = (date) => {
  let currentYear = new Date().getFullYear().toString();
  let formattedDate = "";

  if (!date.includes(currentYear)) {
    formattedDate = formattedDate + currentYear + "-";
  } else {
    formattedDate = formattedDate + date.substring(date.length - 4) + "-";
  }
  return formattedDate;
};

const formatMonth = (date) => {
  date = date.toUpperCase();
  let formattedDate = "";

  if (date.includes("JAN")) {
    formattedDate = formattedDate + "01-";
  } else if (date.includes("FEB")) {
    formattedDate = formattedDate + "02-";
  } else if (date.includes("MÄR")) {
    formattedDate = formattedDate + "03-";
  } else if (date.includes("APR")) {
    formattedDate = formattedDate + "04-";
  } else if (date.includes("MAI")) {
    formattedDate = formattedDate + "05-";
  } else if (date.includes("JUN")) {
    formattedDate = formattedDate + "06-";
  } else if (date.includes("JUL")) {
    formattedDate = formattedDate + "07-";
  } else if (date.includes("AUG")) {
    formattedDate = formattedDate + "08-";
  } else if (date.includes("SEP")) {
    formattedDate = formattedDate + "09-";
  } else if (date.includes("OKT")) {
    formattedDate = formattedDate + "10-";
  } else if (date.includes("NOV")) {
    formattedDate = formattedDate + "11-";
  } else if (date.includes("DEZ")) {
    formattedDate = formattedDate + "12-";
  }

  return formattedDate;
};

const formatDay = (date) => {
  let day = date.substring(0, date.indexOf("."));

  if (day.length === 1) {
    return "0" + day;
  } else {
    return day;
  }
};

const howManyDaysBetween = (start, end) => {
  const weekdays = [
    "SONNTAG",
    "MONTAG",
    "DIENSTAG",
    "MITTWOCH",
    "DONNERSTAG",
    "FREITAG",
    "SAMSTAG",
  ];
  let howManyDays = 0;

  for (let i = start; i !== weekdays.indexOf(end); i++) {
    i = i % weekdays.length;
    howManyDays++;
  }
  return howManyDays;
};

/*** Puppeteer ***/

(async () => {
  const eventsPage = await askForEventsPage(
    "\nHello fellow dancer! \n\nGreat to have you here <3.\nPlease enter an events' page of a facebook group! \n\nIt looks something like this: 'https://www.facebook.com/groups/296668743081/events'! \n"
  );

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Login
  await page.goto(facebook, { waitUntil: "networkidle2" });
  const context = await browser.defaultBrowserContext();
  await context.overridePermissions(facebook, ["notifications"]);

  await page.waitForSelector(cookieButton);
  await page.click(cookieButton);
  await page.waitForSelector(emailInput);
  await page.waitForSelector(passwordInput);
  await page.waitForSelector(loginButton);
  await page.type(emailInput, process.env.EMAIL, { delay: 10 });
  await page.type(passwordInput, process.env.PASS, { delay: 10 });
  await page.click(loginButton);
  await page.waitForNavigation();
  await page.goto(eventsPage, { waitUntil: "networkidle2" }); // What if user enters wrong address?

  // Click on "show more"-button, but only in the "future events"-container
  const showMoreButtonExists = async () => {
    let itExists = await page.evaluate(async () => {
      const firstContainer =
        ".q6o897ci.d2edcug0.sej5wr8e.jei6r52m.o8rfisnq .j83agx80.l9j0dhe7.k4urcfbm:nth-child(1)";
      const showMoreSelector = '[aria-label="Mehr anzeigen"]';

      const futureEvents = await document.querySelector(firstContainer);

      return futureEvents.contains(document.querySelector(showMoreSelector));
    });
    return itExists;
  };

  while (await showMoreButtonExists()) {
    await page.waitForTimeout(2000);
    await page.waitForSelector(showMoreButton);
    await page.click(showMoreButton).catch(() => {});
  }

  await page.waitForTimeout(2000);

  // Fetch links from future events only
  const links = await page.evaluate(() => {
    const linkSelector =
      ".a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5 a";
    const futureEvents = document.querySelector(
      ".q6o897ci.d2edcug0.sej5wr8e.jei6r52m.o8rfisnq .j83agx80.l9j0dhe7.k4urcfbm:nth-child(1)"
    );

    return [...futureEvents.querySelectorAll(linkSelector)].map(
      (link) => link.href
    );
  });

  // Open all links in new tab
  const pages = [];

  for (let i = 0; i < links.length; i++) {
    pages[i] = await browser.newPage();
    await pages[i].goto(links[i]);
    await pages[i].waitForSelector(infoBoxSelector);
    await pages[i].waitForSelector(descriptionSelector);
    if ((await pages[i].$(loadMoreSelector)) !== null) {
      await pages[i].waitForTimeout(2000);
      await pages[i].click(loadMoreSelector);
    }

    let infos = await pages[i].evaluate(async () => {
      // Format Date -> Refactor to make it global
      const formatDate = (myString) => {
        myString = myString.toString();
        const data = {};

        // "16. SEPT. UM 12:00 – 18. SEPT. UM 22:00"
        if (myString.includes("–")) {
          data.day = null;
          data.startDate = myString.substring(0, myString.indexOf("UM")).trim();
          data.startTime = myString
            .substring(myString.indexOf("UM") + 2, myString.indexOf("–"))
            .trim();
          let pos1 = myString.indexOf("UM");
          let pos2 = myString.indexOf("UM", pos1 + 2);
          data.endDate = myString
            .substring(myString.indexOf("–") + 1, pos2)
            .trim();
          data.endTime = myString.substring(pos2 + 2).trim();
        } // "MONTAG, 20. JUNI 2022 UM 19:00"
        else if (myString.includes("UM")) {
          data.day = myString.substring(0, myString.indexOf(","));
          data.startDate = myString
            .substring(myString.indexOf(",") + 1, myString.indexOf("UM"))
            .trim();
          data.startTime = myString
            .substring(myString.indexOf("UM") + 2)
            .trim();
          data.endDate = myString
            .substring(myString.indexOf(",") + 1, myString.indexOf("UM"))
            .trim();
          data.endTime = null;
        } // "SONNTAG, 19. JUNI 2022 VON 13:00 BIS 15:00"
        else {
          data.day = myString.substring(0, myString.indexOf(","));
          data.startDate = myString
            .substring(myString.indexOf(",") + 1, myString.indexOf("VON"))
            .trim();
          data.startTime = myString
            .substring(myString.indexOf("VON") + 3, myString.indexOf("BIS"))
            .trim();
          data.endDate = myString
            .substring(myString.indexOf(",") + 1, myString.indexOf("VON"))
            .trim();
          data.endTime = myString.substring(myString.indexOf("BIS") + 3).trim();
        }

        return data;
      };

      // Selectors
      const infoBoxSelector = ".j83agx80.cbu4d94t.obtkqiv7.sv5sfqaa";
      const descriptionSelector = ".p75sslyk span";

      // Get all infos
      const nodesInfo = await [...document.querySelectorAll(infoBoxSelector)];

      let infoObject = {};
      const formattedDate = formatDate(nodesInfo[0].children[0].innerText);

      infoObject.id = crypto.randomUUID();
      infoObject.originalDateString = nodesInfo[0].children[0].innerText;
      infoObject.day = formattedDate.day;
      infoObject.startDate = formattedDate.startDate;
      infoObject.startTime = formattedDate.startTime;
      infoObject.endDate = formattedDate.endDate;
      infoObject.endTime = formattedDate.endTime;
      infoObject.title = nodesInfo[0].children[1].innerText;
      infoObject.location = nodesInfo[0].children[2].innerText;
      infoObject.description =
        document.querySelector(descriptionSelector).innerText;
      infoObject.scrapingDate = new Date().toISOString().split("T")[0];
      infoObject.scrapingDay = new Date().getDay();

      return infoObject;
    });

    await eventInfos.push(infos);
  }

  // Change format of date to ISO date
  eventInfos = await eventInfos.map((event) => {
    return {
      ...event,
      startDate: toISODate(event.startDate),
      endDate: toISODate(event.endDate),
    };
  });

  // Edge case: Change format of weekdays (e.g. "HEUTE") to ISO date
  eventInfos = await eventInfos.map((event) => {
    const weekdaysStrings = [
      "SONNTAG",
      "MONTAG",
      "DIENSTAG",
      "MITTWOCH",
      "DONNERSTAG",
      "FREITAG",
      "SAMSTAG",
    ];

    if (event.startDate === "HEUTE") {
      return {
        ...event,
        startDate: event.scrapingDate,
        endDate: event.scrapingDate,
      };
    } else if (event.startDate === "MORGEN") {
      let scrapingDate = new Date(event.scrapingDate);
      let tomorrow = new Date(scrapingDate.setDate(scrapingDate.getDate() + 1));
      return {
        ...event,
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: tomorrow.toISOString().split("T")[0],
      };
    } else if (weekdaysStrings.includes(event.startDate)) {
      let howManyDays = howManyDaysBetween(event.scrapingDay, event.startDate);
      let scrapingDate = new Date(event.scrapingDate);
      let targetDate = new Date(
        scrapingDate.setDate(scrapingDate.getDate() + howManyDays)
      );
      return {
        ...event,
        startDate: targetDate.toISOString().split("T")[0],
        endDate: targetDate.toISOString().split("T")[0],
      };
    } else {
      return event;
    }
  });

  // Filter out duplicates
  eventInfos = await eventInfos.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.startDate === value.startDate &&
          t.startTime === value.startTime &&
          t.title === value.title
      )
  );

  // Create a json file
  let data = await JSON.stringify(eventInfos, null, 2);
  await fs.writeFileSync("lindy-events.json", data);

  await browser.close();
  await console.log("Jupiehhhh, finished! Have fun dancing!");
})();
