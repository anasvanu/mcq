# MCQ Platform (React + Express + SQLite)

This project now runs as a full web app with:
- React frontend (Vite)
- Express backend API
- SQLite database persistence

## Run locally

1. Install dependencies:
   - `npm install`
2. Start frontend + backend:
   - `npm run dev`
3. Open:
   - `http://localhost:5173`

## Database

- Database file: `data/mcq.db`
- API routes:
  - `GET /api/health`
  - `GET /api/state`
  - `PUT /api/state`

## Production build

1. Build frontend:
   - `npm run build`
2. Start production server:
   - `npm start`

## Push to GitHub

If this folder is not a git repo yet:

1. `git init`
2. `git add .`
3. `git commit -m "Initial MCQ app with Express and SQLite"`
4. Create an empty repo on GitHub
5. `git remote add origin <your-repo-url>`
6. `git branch -M main`
7. `git push -u origin main`

## Deploy options

### Render (simple)

1. Connect your GitHub repo in Render.
2. Create a **Web Service**.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add persistent disk mounted at `/opt/render/project/src/data` to keep SQLite data.

### Railway

1. Connect your GitHub repo.
2. Set start command `npm start`.
3. Ensure persistent volume is used for the `data` folder.
