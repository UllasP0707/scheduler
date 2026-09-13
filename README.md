# Weekwise Scheduler

Weekwise is a local weekly staff scheduler for creating, reviewing, and printing clear team schedules.

## Live app

[Open Weekwise Scheduler](https://ullasp0707.github.io/scheduler/)

## Features

- Add the people working each week
- Configure separate first- and second-shift times for every day
- Use flexible shift windows between the store hours of 10 AM and 11 PM
- Assign one or more team members to each shift
- Automatically calculate each person's weekly hours
- Review the week in a horizontal, print-friendly table
- Navigate between weeks without losing saved schedules
- Keep all schedule data private in the browser's local storage

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local address shown in the terminal. Press `Control+C` in the terminal to stop the app.

To start it again later:

```bash
cd /path/to/scheduler
npm run dev
```

## Verify the app

```bash
npm test
```

## Important storage note

Schedules are saved only in the browser on the device where they are created. Opening the app in another browser or on another computer starts with a separate schedule.
