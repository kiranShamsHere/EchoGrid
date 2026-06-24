# EchoGrid

Real-time messaging app built with WebSockets, FastAPI, and React.

## Stack
- **Backend** — FastAPI, Python, WebSockets
- **Frontend** — React, TypeScript, Vite

## Running locally

### Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev

## Features
- Real-time messaging via WebSockets
- Room-based conversations
- Live online user count