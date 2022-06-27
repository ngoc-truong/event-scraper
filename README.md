# Event Scraper

In this project I've built an web scraper which scrapes events from my social media groups.

## Problem Statement

Since I am a passionate Lindy Hop dancer I want to be up to date on current events in my city. However, since there are several groups, it is impossible to keep track of where and when events happen.

This bot scrapes all events from all my personal subscribed groups.

## Challenges

There were two div containers with future events and past events. Both of those containers have the same classes and within those containers there is a "load more"-button.

The biggest challenge was to scrape only future events. The bot should click the "load more"-button as long as it is still visible in the "future events"-container. However, since the "past events"-container is structurally identical, it was difficult to target the correct button. In addition there was the puppeteer syntax and vanilla javascript functions like ".querySelector" were only allowed within the .evaluate() function of puppeteer.
