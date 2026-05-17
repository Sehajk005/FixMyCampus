Tests runner

Usage:

Windows PowerShell (from repository root):

    .\tests\run-tests.ps1

What it does:

- Runs `npm test` in the `backend` folder
- Runs `npm test` in the `frontend` folder

Notes:

- The backend already uses Jest. Run `npm install` in `backend` if needed.
- Frontend testing is configured to use Vitest; install dev dependencies in `frontend` by running `npm install` in the `frontend` folder before running the runner.
