# SPORTS BETTING PROJECT

A full-stack sports betting prjoect that calculates the expected value and identifies +EV betting across different bookmakers.

## How it works:
1. Fetches live odds through The Odds API
2. Removes bookmakers with unreliable data
3. Filters out outliers to prevent poor results
4. Calculates the fair probability from the given data
5. Computes the expected value from the fair probability
6. Shows the positive expected value bets on a React frontend

## Tech Stack:
- Frontend - React, Vite
- Backend - Node.js, Express, TypeScript
- Data/API - The Odds API

## How to run locally:

### Backend
```
cd backend
npm install
cp .env.example .env
npm run dev
```


### Frontend
```
cd frontend
npm install
npm run dev
```

## Environment Variables
Copy .env.example to .env and put the keys in

### Backend Variables
```
ODDS_API_KEY=*put your own key here*
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
PORT=4000
```

### Frontend Variables
```
VITE_API_BASE=http://localhost:4000/api
```
