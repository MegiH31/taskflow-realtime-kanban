# TaskFlow – Real-Time Kanban Board

TaskFlow is a full-stack real-time Kanban task management application built with **FastAPI**, **React**, **PostgreSQL**, and **WebSockets**.

It allows users to create and manage boards, organize tasks across workflow stages, and see task updates live in real time. The project was built to practice full-stack development, database integration, and real-time collaboration features beyond basic CRUD applications.

## Highlights

- Real-time task updates with **WebSockets**
- Board management: create, rename, delete, and switch boards
- Task management: create, edit, delete, and move tasks between workflow stages
- Multi-board Kanban workflow with board-specific task filtering
- Full-stack architecture using **FastAPI + React + PostgreSQL**

## Features

### Boards

* Create boards
* Rename boards
* Delete boards
* Switch between boards

### Tasks

* Create tasks
* Edit tasks
* Delete tasks
* Move tasks between **Todo**, **In Progress**, and **Done**
* Filter tasks by board

### Real-Time Collaboration

* Live task updates using **WebSockets**
* Real-time task creation, updates, moves, and deletion
* Online users indicator per board

## Current Status

Implemented:
- Board CRUD (create, rename, delete, fetch)
- Task CRUD
- Task movement between statuses
- Board-specific task filtering
- Real-time task updates with WebSockets
- Online users indicator

Planned next:
- Drag & drop task movement
- Task priority and due dates
- Authentication and user-specific boards
- 
## Tech Stack

### Backend

* **FastAPI**
* **SQLAlchemy**
* **PostgreSQL**
* **WebSockets**
* **Pydantic**

### Frontend

* **React**
* **Vite**
* **Axios**
* **CSS**

## Project Structure

```bash
taskflow-realtime-kanban/
│
├── backend/
│   └── app/
│       ├── db/
│       ├── models/
│       ├── schemas/
│       ├── websockets/
│       └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## How It Works

* The **FastAPI backend** exposes REST endpoints for boards, tasks, and users.
* Task and board data is stored in **PostgreSQL**.
* A **WebSocket connection** is opened per board to broadcast task updates and user presence in real time.
* The **React frontend** consumes the REST API and listens for WebSocket events to update the UI instantly.

## Current Task Workflow

Each task belongs to a board and can move between three statuses:

* **Todo**
* **In Progress**
* **Done**

## API Highlights

### Board Endpoints

* `GET /boards`
* `POST /boards`
* `GET /boards/{board_id}`
* `PUT /boards/{board_id}`
* `DELETE /boards/{board_id}`

### Task Endpoints

* `POST /tasks`
* `PUT /tasks/{task_id}`
* `DELETE /tasks/{task_id}`
* `GET /boards/{board_id}/tasks`

### WebSocket Endpoint

* `ws://127.0.0.1:8000/ws/boards/{board_id}?username=YOUR_NAME`

## Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/MEGIH31/taskflow-realtime-kanban.git
cd taskflow-realtime-kanban
```

## 2. Backend setup

Create and activate a virtual environment, then install dependencies.

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic
```

Start the backend server from the project root:

```bash
python -m uvicorn backend.app.main:app --reload
```

## 3. Frontend setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend will usually run on:

```bash
http://localhost:5173
```

## Environment / Database Notes

This project uses **PostgreSQL**.
Before running the app, make sure:

* PostgreSQL is installed
* the database exists
* your database connection settings in the backend are correct

## Planned Improvements

The following features are planned next:

* Drag & drop task movement
* Task due dates
* Task priority levels
* Authentication / login system
* User-specific boards
* Improved UI/UX polish

## Why I Built This

I built TaskFlow to strengthen my full-stack development skills by combining:

* backend API development with FastAPI
* relational database design with PostgreSQL
* frontend state management in React
* real-time collaboration with WebSockets

The goal was to move beyond simple CRUD projects and build a more realistic collaborative application.

## Screenshots / Demo

Screenshots or a demo GIF/video will be added soon.

## Author

**Megi Hyka**
GitHub: https://github.com/MEGIH31
