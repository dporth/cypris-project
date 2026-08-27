# Run Instructions

## Prerequisites

- Node.js 22.12 or newer
- npm

## Start the application

From the project directory, install dependencies:

```bash
npm install
```

Then start the Angular development server:

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:4200
```

## Stop the application

Press:

```text
Ctrl+C
```

in the terminal running the Angular server.

## If dependencies need to be rebuilt

Delete `node_modules` and `package-lock.json`, then reinstall:

### Windows PowerShell

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm start
```
