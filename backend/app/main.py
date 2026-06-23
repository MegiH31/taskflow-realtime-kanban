from email.mime import message

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.db.database import engine, Base, SessionLocal
from backend.app.models.board import Board
from backend.app.models.user import User
from backend.app.models.task import Task
from backend.app.schemas.board import BoardCreate, BoardResponse
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.schemas.task import TaskCreate, TaskResponse
from backend.app.websockets.routes import router as websocket_router
from backend.app.websockets.manager import manager


Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket_router)

@app.get("/")
def root():
    return {"message": "API is running"}


@app.post("/users",  response_model=UserResponse) #Only return these fields to client
def create_user(user: UserCreate):

    db: Session = SessionLocal()

    new_user = User(
        username=user.username,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return new_user
   
@app.get("/users", response_model=list[UserResponse]) #Return a LIST of UserResponse objects 
def get_users():
    db = SessionLocal()

    users = db.query(User).all()

    db.close()

    return users

#TASK ENDPOINTS

# Creates a task in PostgreSQL. The client sends a JSON object with the task data, which is validated against the TaskCreate schema.
# The API then creates a new Task object, saves it to the database, 
# and returns the created task data to the client in the format defined by the TaskResponse schema.
@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate):

    db: Session = SessionLocal()

    try:
        new_task = Task(
            title=task.title,
            description=task.description,
            status=task.status,
            board_id=task.board_id
        )

        db.add(new_task)

        db.commit()

        db.refresh(new_task)

        # websocket broadcast
        await manager.broadcast_to_board(
            str(new_task.board_id),
            {
                "event": "task_created",
                "data": {
                    "id": new_task.id,
                    "title": new_task.title,
                    "description": new_task.description,
                    "status": new_task.status,
                    "board_id": new_task.board_id
                }
            }
        )

        return new_task

    finally:
        db.close()

# Reads all tasks from database. When the client sends a GET request to /tasks, 
# the API queries the database for all Task records,
# converts them to a list of TaskResponse objects, and returns that list to the client.
#  This allows the client to retrieve and display all existing tasks in the task board application.
# @app.get("/tasks", response_model=list[TaskResponse])
# async def get_tasks():    
#     db = SessionLocal()

#     tasks = db.query(Task).all()

#     db.close()

#     return tasks    

@app.get("/boards/{board_id}/tasks")
async def get_board_tasks(board_id: int):

    db = SessionLocal()

    tasks = (
        db.query(Task)
        .filter(Task.board_id == board_id)
        .all()
    )

    db.close()

    return tasks

# Updates a task in the database. The client sends a PUT request to /tasks/{task_id} with the updated task data in 
# the request body, which is validated against the TaskCreate schema. 
# The API then looks up the existing task by its ID, updates its fields with the new data, 
# saves the changes to the database, 
# and returns the updated task data to the client in the format defined by the TaskResponse schema. This allows the client to modify existing tasks in the task board application.
@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, updated_task: TaskCreate):
    db = SessionLocal()

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
       raise HTTPException(
        status_code=404,
        detail="Task not found"
    )
    
    # save old status
    old_status = task.status

    task.title = updated_task.title
    task.description = updated_task.description
    task.status = updated_task.status
    task.board_id = updated_task.board_id

    db.commit()
    db.refresh(task)

    # detect movement
    if old_status != task.status:
     event_type = "task_moved"
    else:
     event_type = "task_updated"

    await manager.broadcast_to_board(
    str(task.board_id),
    {
        "event": event_type,
        "data": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "board_id": task.board_id
        }
    }
)
    
    db.close()
    
    return task


# Deletes a task from the database. When the client sends a DELETE request to /tasks/{task_id},
# the API looks up the task by its ID, deletes it from the database, and returns a success message to the client.
# This allows the client to remove tasks from the task board application when they are no longer needed.
# If the task with the specified ID does not exist, 
# the API returns an error message indicating that the task was not found.
@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    db = SessionLocal()

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        return {"error": "Task not found"}
    
    #save values before deletion
    task_id_to_delete = task.id
    board_id = task.board_id

    db.delete(task)
    db.commit()

    await manager.broadcast_to_board(str(board_id),
        {
            "event": "task_deleted",
            "data": {
                "id": task_id_to_delete
            }
        }
    )
    db.close()

    return {"message": "Task deleted successfully"}


# Creates a new board in the database. 
# The client sends a POST request to /boards with the board data in the request body,
#  which is validated against the BoardCreate schema. The API then creates a new Board object, 
# saves it to the database, 
# and returns the created board data to the client in the format defined by the BoardResponse schema. 
# This allows the client to create new boards in the task board application.

@app.post("/boards", response_model=BoardResponse)
async def create_board(board: BoardCreate):

    db = SessionLocal()

    new_board = Board(
        name=board.name,
        description=board.description
    )

    db.add(new_board)
    db.commit()
    db.refresh(new_board)

    db.close()

    return new_board

#Get all boards from database.
@app.get("/boards", response_model=list[BoardResponse])
async def get_boards():

    db = SessionLocal()

    boards = db.query(Board).all()

    db.close()

    return boards

# get one board by id from database. The client sends a GET request to /boards/{board_id}
# with the ID of the board they want to retrieve.
@app.get("/boards/{board_id}", response_model=BoardResponse)
async def get_board(board_id: int):

    db = SessionLocal()

    board = (
        db.query(Board)
        .filter(Board.id == board_id)
        .first()
    )

    if not board:
        raise HTTPException(
            status_code=404,
            detail="Board not found"
        )

    db.close()

    return board

# Updates a board in the database. The client sends a PUT request to /boards/{board_id}
#  with the updated board data in the request body, which is validated against the BoardCreate schema.
#  The API then looks up the existing board by its ID,
#  updates its fields with the new data, saves the changes to the database, 
# and returns the updated board data to the client in the format defined by the BoardResponse schema. 
# This allows the client to modify existing boards in the task board application.

@app.put("/boards/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: int,
    updated_board: BoardCreate
):
    db = SessionLocal()

    board = (
        db.query(Board)
        .filter(Board.id == board_id)
        .first()
    )

    if not board:
        raise HTTPException(
            status_code=404,
            detail="Board not found"
        )

    board.name = updated_board.name
    board.description = updated_board.description

    db.commit()
    db.refresh(board)
    db.close()

    return board


# Deletes a board and all its associated tasks from the database. When the client sends a DELETE request 
# to /boards/{board_id}
@app.delete("/boards/{board_id}")
async def delete_board(board_id: int):

    db = SessionLocal()

    board = (
        db.query(Board)
        .filter(Board.id == board_id)
        .first()
    )

    if not board:
        raise HTTPException(
            status_code=404,
            detail="Board not found"
        )

    # delete all tasks belonging to board
    (
        db.query(Task)
        .filter(Task.board_id == board_id)
        .delete()
    )

    db.delete(board)
    db.commit()

    db.close()

    return {
        "message": "Board deleted successfully"
    }