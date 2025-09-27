# Task Manager: Full-Stack Setup

This repository provides a complete example of a full-stack Task Manager application using **React** for the frontend, **FastAPI** for the backend, and **PostgreSQL** with **SQLAlchemy ORM** for the database. It supports CRUD operations for tasks, including adding, viewing, updating (toggling completion), and deleting tasks.

## Prerequisites

- **Python 3.10+**: For the backend.
- **Node.js 18+ and npm**: For the frontend (assuming a standard React setup, e.g., via Create React App or Vite).
- **PostgreSQL**: Installed locally or via Docker.
- Basic knowledge of virtual environments, React, and FastAPI.

Clone the repository (or create the structure as described below) and navigate to the project root.

## Project Structure

Assume the following structure:
```
task-manager/
├── backend/          # FastAPI backend
│   ├── .env
│   ├── create_db.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
└── frontend/         # React frontend
    ├── src/
    │   ├── App.tsx
    │   ├── buttons/PrimaryButton.tsx  # Assuming existing components
    │   └── ...  # Other files like index.css, main.tsx
    ├── package.json
    └── ...  # Other React files
```

## Installation

### Backend Dependencies

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install required packages:
   ```bash
   pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv "pydantic[email]"
   ```

### Frontend Dependencies

Navigate to the `frontend/` directory:
```bash
cd frontend
npm install  # Installs React and any other dependencies from package.json
```

## Setup: Database (PostgreSQL with SQLAlchemy)

1. Install PostgreSQL if not already installed (e.g., via Homebrew on macOS: `brew install postgresql`, or download from [postgresql.org](https://www.postgresql.org/download/)). Alternatively, use Docker:
   ```bash
   docker run --name taskdb -e POSTGRES_PASSWORD=password -e POSTGRES_DB=taskdb -p 5432:5432 -d postgres
   ```

2. Create a `.env` file in `backend/` for the database connection:
   ```dotenv
   DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432
   ```

3. Create `backend/models.py` (defines the Task model):
   ```python
   from sqlalchemy import Column, Integer, String, Boolean, DateTime
   from sqlalchemy.ext.declarative import declarative_base
   from sqlalchemy.sql import func

   Base = declarative_base()

   class Task(Base):
       __tablename__ = "tasks"

       id = Column(Integer, primary_key=True, index=True)
       name = Column(String, index=True)
       description = Column(String, nullable=True)
       deadline = Column(String, nullable=True)
       completed = Column(Boolean, default=False)
       created_at = Column(DateTime(timezone=True), server_default=func.now())
   ```

4. Create `backend/database.py` (configures the database engine and session):
   ```python
   from sqlalchemy import create_engine
   from sqlalchemy.orm import sessionmaker
   import os
   from dotenv import load_dotenv

   load_dotenv()

   SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

   engine = create_engine(f"{SQLALCHEMY_DATABASE_URL}/taskdb")
   SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

   def get_db():
       db = SessionLocal()
       try:
           yield db
       finally:
           db.close()
   ```

5. Create the database and tables:
   - Run: `createdb taskdb` (or use pgAdmin/psql: `CREATE DATABASE taskdb;`).
   - Create `backend/create_db.py`:
     ```python
     from database import engine
     from models import Base

     Base.metadata.create_all(bind=engine)
     print("Tables created!")
     ```
   - Run: `python create_db.py`

## Setup: Backend (FastAPI)

1. Create `backend/schemas.py` (Pydantic models for validation):
   ```python
   from pydantic import BaseModel
   from datetime import datetime
   from typing import Optional

   class TaskBase(BaseModel):
       name: str
       description: Optional[str] = None
       deadline: Optional[str] = None

   class TaskCreate(TaskBase):
       pass

   class TaskUpdate(BaseModel):
       name: Optional[str] = None
       description: Optional[str] = None
       deadline: Optional[str] = None
       completed: Optional[bool] = None

   class TaskResponse(TaskBase):
       id: int
       completed: bool
       created_at: datetime

       class Config:
           from_attributes = True  # For SQLAlchemy compatibility
   ```

2. Create `backend/crud.py` (CRUD operations):
   ```python
   from sqlalchemy.orm import Session
   from models import Task
   from schemas import TaskCreate, TaskUpdate

   def get_tasks(db: Session, skip: int = 0, limit: int = 100):
       return db.query(Task).offset(skip).limit(limit).all()

   def create_task(db: Session, task: TaskCreate):
       db_task = Task(**task.dict())
       db.add(db_task)
       db.commit()
       db.refresh(db_task)
       return db_task

   def get_task(db: Session, task_id: int):
       return db.query(Task).filter(Task.id == task_id).first()

   def update_task(db: Session, task_id: int, task_update: TaskUpdate):
       db_task = db.query(Task).filter(Task.id == task_id).first()
       if db_task:
           update_data = task_update.dict(exclude_unset=True)
           for field, value in update_data.items():
               setattr(db_task, field, value)
           db.commit()
           db.refresh(db_task)
       return db_task

   def delete_task(db: Session, task_id: int):
       db_task = db.query(Task).filter(Task.id == task_id).first()
       if db_task:
           db.delete(db_task)
           db.commit()
       return db_task
   ```

3. Create `backend/main.py` (API routes):
   ```python
   from fastapi import FastAPI, Depends, HTTPException
   from fastapi.middleware.cors import CORSMiddleware
   from sqlalchemy.orm import Session
   import uvicorn

   from database import get_db, engine
   from models import Base
   from schemas import TaskCreate, TaskUpdate, TaskResponse
   from crud import get_tasks, create_task, get_task, update_task, delete_task

   app = FastAPI(title="Task Manager API")

   # Enable CORS for frontend (adjust origins as needed)
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   # Auto-create tables on startup (optional; can be removed after initial run)
   Base.metadata.create_all(bind=engine)

   @app.get("/", response_model=list[TaskResponse])
   def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
       tasks = get_tasks(db, skip=skip, limit=limit)
       return tasks

   @app.post("/tasks/", response_model=TaskResponse)
   def create_new_task(task: TaskCreate, db: Session = Depends(get_db)):
       return create_task(db=db, task=task)

   @app.get("/tasks/{task_id}", response_model=TaskResponse)
   def read_task(task_id: int, db: Session = Depends(get_db)):
       db_task = get_task(db, task_id=task_id)
       if db_task is None:
           raise HTTPException(status_code=404, detail="Task not found")
       return db_task

   @app.put("/tasks/{task_id}", response_model=TaskResponse)
   def update_existing_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
       db_task = update_task(db, task_id=task_id, task_update=task_update)
       if db_task is None:
           raise HTTPException(status_code=404, detail="Task not found")
       return db_task

   @app.delete("/tasks/{task_id}")
   def delete_existing_task(task_id: int, db: Session = Depends(get_db)):
       db_task = delete_task(db, task_id=task_id)
       if db_task is None:
           raise HTTPException(status_code=404, detail="Task not found")
       return {"message": "Task deleted"}

   if __name__ == "__main__":
       uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

## Setup: Frontend (React)

1. Update `frontend/src/App.tsx` (integrates with the backend API):
   ```tsx
   import { useState, useEffect } from "react";
   import PrimaryButton from "./buttons/PrimaryButton";

   interface Task {
     id: number;
     name: string;
     description?: string;
     deadline?: string;
     completed: boolean;
     created_at?: string;
   }

   const App = () => {
     const [tasks, setTasks] = useState<Task[]>([]);
     const [newTask, setNewTask] = useState({ name: "", description: "", deadline: "" });
     const [loading, setLoading] = useState(true);
     const API_BASE = "http://localhost:8000";  // Adjust if needed

     // Fetch tasks on load
     useEffect(() => {
       fetchTasks();
     }, []);

     const fetchTasks = async () => {
       try {
         const response = await fetch(`${API_BASE}/`);
         const data = await response.json();
         setTasks(data);
       } catch (error) {
         console.error("Error fetching tasks:", error);
       } finally {
         setLoading(false);
       }
     };

     const addTask = async () => {
       if (!newTask.name.trim()) return;
       try {
         const response = await fetch(`${API_BASE}/tasks/`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(newTask),
         });
         if (response.ok) {
           setNewTask({ name: "", description: "", deadline: "" });
           fetchTasks();  // Refresh list
         }
       } catch (error) {
         console.error("Error adding task:", error);
       }
     };

     const toggleTask = async (id: number, currentCompleted: boolean) => {
       try {
         await fetch(`${API_BASE}/tasks/${id}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ completed: !currentCompleted }),
         });
         fetchTasks();  // Refresh
       } catch (error) {
         console.error("Error toggling task:", error);
       }
     };

     const deleteTask = async (id: number) => {
       try {
         await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
         fetchTasks();  // Refresh
       } catch (error) {
         console.error("Error deleting task:", error);
       }
     };

     if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

     return (
       <div className="flex flex-col justify-center items-center w-full h-[98%] bg-[var(--color-primary)]">
         <h1 className="text-6xl">Task Manager</h1>

         {/* Add Task Form */}
         <div className="flex flex-col items-center my-4 p-4 w-[40%] rounded-2xl bg-[var(--background)]">
           <input
             type="text"
             placeholder="Task Name"
             value={newTask.name}
             onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
             className="mb-2 p-2 border rounded w-full"
           />
           <input
             type="text"
             placeholder="Description (optional)"
             value={newTask.description}
             onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
             className="mb-2 p-2 border rounded w-full"
           />
           <input
             type="text"
             placeholder="Deadline (e.g., 8:00)"
             value={newTask.deadline}
             onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
             className="mb-2 p-2 border rounded w-full"
           />
           <PrimaryButton text="Add Task" onClick={addTask} disabled={!newTask.name.trim()} />
         </div>

         {/* Tasks Display */}
         <div className="flex flex-col items-center my-10 p-8 w-[40%] h-[500px] rounded-4xl shadow-[2px_2px_1px_rgba(0,0,0,0.4)] bg-[var(--background)] overflow-y-auto">
           <h2 className="text-2xl mb-4">Current Tasks:</h2>
           {tasks.map((task) => (
             <div key={task.id} className="flex justify-center items-center gap-2 bg-[var(--background)] w-[80%] h-14 mb-2 p-2 rounded">
               <input
                 type="checkbox"
                 checked={task.completed}
                 onChange={() => toggleTask(task.id, task.completed)}
                 className="w-5 h-5"
               />
               <div className="flex flex-col flex-1">
                 <p className="text-xl font-semibold">{task.name}</p>
                 {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                 {task.deadline && <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>}
               </div>
               <button
                 onClick={() => deleteTask(task.id)}
                 className="cursor-pointer w-6 h-6 text-md font-bold rounded-full bg-[var(--error)]"
               >
                 <img src="delete-icon.svg" alt="Delete" />  {/* Assume you have this icon */}
               </button>
             </div>
           ))}
           {tasks.length === 0 && <p className="text-gray-500">No tasks yet. Add one above!</p>}
         </div>
       </div>
     );
   };

   export default App;
   ```

   > **Note**: Refer to [React template](https://github.com/dreyyan/react-template) for React (Vite) setup

## Running the Application

1. **Start the Database**: Ensure PostgreSQL is running (or start the Docker container).

2. **Start the Backend** (from `backend/`):
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - Access Swagger docs at `http://localhost:8000/docs` for API testing.

3. **Start the Frontend** (from `frontend/`):
   ```bash
   npm start
   ```
   - Runs on `http://localhost:3000`.

## Testing

- **Load the Page**: Open `http://localhost:3000`. It should fetch and display tasks (empty initially).
- **Add a Task**: Fill the form and submit → POST to backend → List refreshes.
- **Toggle Completion**: Check/uncheck a task → PUT to backend → Updates in DB and UI.
- **Delete a Task**: Click delete → DELETE to backend → Removes from list and DB.
- **Seed Data**: Use Swagger (`/docs`) to manually POST tasks.
- **Debug**:
  - Browser console/network tab for frontend API calls.
  - Backend terminal logs for errors.

## Enhancements

- **Authentication**: Integrate JWT using `fastapi-users` for user-specific tasks.
- **Error Handling**: Add toast notifications (e.g., with `react-toastify`) in React.
- **Styling**: Extend with additional buttons (e.g., `SecondaryButton` for cancel actions).
- **Deployment**: 
  - Docker Compose for local dev (combine DB, backend, frontend).
  - Host frontend on Vercel/Netlify.
  - Host backend on Render, Heroku, or AWS with a managed PostgreSQL instance.