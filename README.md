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

1. Open [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
2. Connect repo: `https://github.com/anasvanu/mcq.git`.
3. Render reads `render.yaml` automatically.
4. Create service and deploy.
5. Open the generated Render URL once deploy completes.

### Railway

1. Open [Railway Dashboard](https://railway.app/dashboard).
2. **New Project** → **Deploy from GitHub repo** (`anasvanu/mcq`).
3. Railway reads `railway.json` and starts with `npm start`.
4. Add a persistent volume and mount it to `/app/data`.
5. Deploy and open the generated Railway domain.
