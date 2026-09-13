# Weekwise Scheduler

Weekwise is a local weekly staff scheduler for creating, reviewing, and printing clear team schedules.

## Live app

[Open Weekwise Scheduler](https://ullasp0707.github.io/scheduler/)

## Features

Two screens, in the order the job is done.

**Build the week**

- Add the people working each week
- Configure separate first- and second-shift times for every day
- Use flexible shift windows between the store hours of 10 AM and 11 PM
- See the handover window where both shifts are on the floor together
- Navigate between weeks without losing saved schedules

**Assign and print**

- Assign one or more team members to each shift from a dropdown in the grid
- Automatically calculate each person's weekly hours
- Read the whole week in a horizontal, print-friendly grid
- Download the sheet as a PNG, or print it: either way the controls drop away
  and the names stay

Schedule data stays private in the browser's local storage.

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
