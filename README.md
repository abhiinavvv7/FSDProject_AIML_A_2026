# Faculty Feedback Automation

A simple React flow: students enter their name, roll number, branch, and semester, then rate each listed subject and faculty member.

Admins can edit, add, and remove subject and faculty assignments for each branch and semester. The initial assignments are sample data. Roster edits are saved in the current browser and shown in the student feedback flow. Students rate one faculty at a time; the complete response is saved to a local SQLite database when submitted.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

`npm run dev` starts the Vite app and its local feedback API. The API creates `server/data/feedback.sqlite` on first run; that database file is excluded from Git. Each submission stores the student name, roll number, branch, semester, subject and faculty names, ratings, optional comments, and submission time.

The default subject and faculty assignments are sample data. The admin login is a front-end demo and does not verify credentials. Roster edits are saved only in the current browser, and feedback data stays on the machine running the app.
