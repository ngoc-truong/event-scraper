# Event Scraper

In this project I've built a web scraper which crawls events from my social media groups.

## Problem Statement

Since I am a passionate Lindy Hop dancer I want to be up to date on current events in my city. However, since there are several groups, it is impossible to keep track of where and when events happen.

This bot scrapes all events from all my personal subscribed groups.

## Challenges

- The bot should only scrape data from one div (if there are two or more with the same classes).
- The bot should click on a "load-more"-button until it disappears.
- Format dates with a lot of edge cases e.g. "Heute um 20:00 Uhr", "Samstag um 19:00 Uhr"
- Translate dates into ISO format since then I can "calculate" with dates.
- Mixing the puppeteer syntax with vanilla javascript syntax (e.g. functions like .contains() or .querySelector() were only available within the .evaluate() function of puppeteer).
