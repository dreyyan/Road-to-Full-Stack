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
    allow_origins=["http://localhost:5173"], # specify PORT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    from database import engine
    from models import Base
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

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)