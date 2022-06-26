# Event Scraper

In this project I built an event scraper which will scrape events from my social media groups.

## Problem Statement

Since I am a passionate Lindy Hop dancer I want to be up to date on current events in my city. However, since there are several groups, it is impossible to keep track on where and when events happen.

This bot scrapes all events from all of my personal subscribed groups.

## Challenges

Understanding the library puppeteer and async/await functionality was quite the challenge especially since most bugs were due to loading/waitForX-issues.
In addition it was difficult to structure the project in a clean way because puppeteer does not allow global functions within some of their in-built functions (e.g. evaluate()).

In addition, getting data from the DOM was quite challenging since the website which was scraped had a lot of interactive elements ("load more"-button).
