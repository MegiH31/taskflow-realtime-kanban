import { useEffect, useState } from "react"
import {getTasks, getBoardTasks, updateTask, deleteTask, createTask } from "./api/tasks"
import {getBoards, createBoard, deleteBoard, updateBoard} from "./api/boards"
import { FaTrash } from "react-icons/fa"


function App() {

  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [selectedBoard, setSelectedBoard] = useState(1)
  const [boards, setBoards] = useState([])
  const [newBoardName, setNewBoardName] = useState("")

  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newStatus, setNewStatus] = useState("todo")

  const [isRenamingBoard, setIsRenamingBoard] = useState(false)
  const [editedBoardName, setEditedBoardName] = useState("")

  console.log("RENDER:", tasks)

  useEffect(() => {

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/boards/${selectedBoard}?username=Megi`
    )

    socket.onopen = () => {
      console.log("WebSocket connected")
    }

   socket.onmessage = (event) => {

  console.log("RAW MESSAGE:", event.data)

  const message = JSON.parse(event.data)

  console.log("MESSAGE:", message)

  if (message.event === "user_joined") {
    console.log("USER JOINED")
    return
  }

  if (message.event === "user_left") {
    console.log("USER LEFT")
    return
  }

  if (message.event === "task_created") {

    console.log(
      "ADDING TASK TO STATE:",
      message.data
    )

    setTasks((prevTasks) => {

      const exists = prevTasks.some(
        (task) => task.id === message.data.id
      )

      if (exists) {
        return prevTasks
      }

      return [
        ...prevTasks,
        message.data
      ]
    })
  }

  if (
    message.event === "task_updated" ||
    message.event === "task_moved"
  ) {

    console.log(
      "UPDATING TASK:",
      message.data
    )

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === message.data.id
          ? message.data
          : task
      )
    )
  }

  if (message.event === "task_deleted") {

    console.log(
      "DELETING TASK:",
      message.data.id
    )

    setTasks((prevTasks) => {

      console.log(
        "BEFORE DELETE:",
        prevTasks
      )

      const updatedTasks =
        prevTasks.filter(
          (task) =>
            task.id !== message.data.id
        )

      console.log(
        "AFTER DELETE:",
        updatedTasks
      )

      return updatedTasks
    })
  }

      if (
        message.event === "task_updated" ||
        message.event === "task_moved"
      ) {

        console.log(
          "UPDATING TASK:",
          message.data
        )

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === message.data.id
              ? message.data
              : task
          )
        )
      }

      if (message.event === "task_deleted") {

        console.log(
          "DELETING TASK:",
          message.data.id
        )

        setTasks((prevTasks) =>
          prevTasks.filter(
            (task) =>
              task.id !== message.data.id
          )
        )
      }
    }

    socket.onclose = () => {
      console.log("WebSocket disconnected")
    }

    socket.onerror = (error) => {
      console.error(
        "WebSocket error:",
        error
      )
    }

    async function fetchTasks() {

      try {

        const data = await getBoardTasks(selectedBoard)

        setTasks(data)

        const boardData = await getBoards()

        setBoards(boardData)

      } catch (error) {

        console.error(
          "Error fetching tasks:",
          error
        )
      }
    }

    fetchTasks()

    return () => {
      console.log("Closing websocket")
      socket.close()
    }

  }, [selectedBoard])

const handleEdit = (task) => {
  console.log("Editing:", task)
  setEditingTask(task)
}

const handleSave = async () => {
  try {

    await updateTask(
  editingTask.id,
  {
    title: editingTask.title,
    description: editingTask.description,
    status: editingTask.status,
    board_id: editingTask.board_id
  }
)
    setEditingTask(null)

  } catch (error) {

    console.error(
      "Error updating task:",
      error
    )
  }
}

const handleDelete = async (taskId) => {

  console.log(
    "DELETE CLICKED:",
    taskId
  )

  try {

    await deleteTask(taskId)

  } catch (error) {

    console.error(
      "Error deleting task:",
      error
    )
  }
}


// Updates task status in database
const handleMoveTask = async (
  task,
  newStatus
) => {

  try {

    await updateTask(
      task.id,
      {
        title: task.title,
        description: task.description,
        status: newStatus,
        board_id: task.board_id
      }
    )

  } catch (error) {

    console.error(
      "Error moving task:",
      error
    )
  }
}

const handleCreateTask = async () => {

  try {

    await createTask({
      title: newTitle,
      description: newDescription,
      status: newStatus,
      board_id: selectedBoard
    })

    setNewTitle("")
    setNewDescription("")
    setNewStatus("todo")

  } catch (error) {

    console.error(
      "Error creating task:",
      error
    )
  }
}

const handleCreateBoard = async () => {

  if (!newBoardName.trim()) {
    return
  }

  try {

    const board = await createBoard({
      name: newBoardName
    })

    setBoards((prev) => [
      ...prev,
      board
    ])

    setNewBoardName("")

  } catch (error) {

    console.error(
      "Error creating board:",
      error
    )
  }
}

//Handle board deletion
const handleDeleteBoard = async () => {

  if (
    !window.confirm(
      "Delete this board and all its tasks?"
    )
  ) {
    return
  }

  try {

    await deleteBoard(selectedBoard)

    const updatedBoards =
      boards.filter(
        (board) =>
          board.id !== selectedBoard
      )

    setBoards(updatedBoards)

    if (updatedBoards.length > 0) {
      setSelectedBoard(
        updatedBoards[0].id
      )
    } else {
      setTasks([])
    }

  } catch (error) {

    console.error(
      "Error deleting board:",
      error
    )
  }
}

const todoTasks = tasks.filter(
  (task) => task.status === "todo"
)

const inProgressTasks = tasks.filter(
  (task) => task.status === "in_progress"
)

const doneTasks = tasks.filter(
  (task) => task.status === "done"
)


const handleStartRenameBoard = () => {
  const currentBoard = boards.find(
    (board) => board.id === selectedBoard
  )

  if (!currentBoard) return

  setEditedBoardName(currentBoard.name)
  setIsRenamingBoard(true)
}

const handleSaveBoardRename = async () => {
  if (!editedBoardName.trim()) return

  try {
    const currentBoard = boards.find(
      (board) => board.id === selectedBoard
    )

    const updatedBoard = await updateBoard(
      selectedBoard,
      {
        name: editedBoardName,
        description:
          currentBoard?.description || null
      }
    )

    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === selectedBoard
          ? updatedBoard
          : board
      )
    )

    setIsRenamingBoard(false)
    setEditedBoardName("")

  } catch (error) {
    console.error(
      "Error renaming board:",
      error
    )
  }
}

const handleCancelBoardRename = () => {
  setIsRenamingBoard(false)
  setEditedBoardName("")
}

  return (
    <div className="app">
     <div className="header">

  <div>
    <h1>TaskFlow</h1>

    <p className="subtitle">
      Real-time Kanban Project Management
    </p>
  </div>

 <div className="board-controls">

  {isRenamingBoard ? (
    <>
      <input
        type="text"
        value={editedBoardName}
        onChange={(e) =>
          setEditedBoardName(e.target.value)
        }
      />

      <button
        className="icon-btn save-board-btn"
        onClick={handleSaveBoardRename}
        title="Save board name"
      >
        💾
      </button>

      <button
        className="icon-btn cancel-board-btn"
        onClick={handleCancelBoardRename}
        title="Cancel rename"
      >
        ✖
      </button>
    </>
  ) : (
    <>
      <select
        value={selectedBoard}
        onChange={(e) =>
          setSelectedBoard(Number(e.target.value))
        }
      >
        {boards.map((board) => (
          <option
            key={board.id}
            value={board.id}
          >
            {board.name}
          </option>
        ))}
      </select>

      <button
        className="icon-btn rename-board-btn"
        onClick={handleStartRenameBoard}
        title="Rename board"
      >
        ✏️
      </button>

      <button
        className="icon-btn delete-board-btn"
        onClick={handleDeleteBoard}
        title="Delete board"
      >
        🗑️
      </button>
    </>
  )}

</div>

</div>
<div className="top-panels">
    <div className="panel">
      <h2>Create Task</h2>

       <div className="task-form">
   
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) =>
              setNewTitle(e.target.value)
            }
          />
   
          

          <input
            type="text"
            placeholder="Task description"
            value={newDescription}
            onChange={(e) =>
              setNewDescription(e.target.value)
            }
          />

        

          <select
            value={newStatus}
            onChange={(e) =>
              setNewStatus(e.target.value)
            }
          >
            <option value="todo">Todo</option>
            <option value="in_progress">
              In Progress
            </option>
            <option value="done">
              Done
            </option>
          </select>

    

          <button
            onClick={handleCreateTask}
          >
            Create Task
          </button>
          </div>
        </div>

      <div className="panel">
        <h2>Create Board</h2>

        <div className="task-form">
     
        <input
          type="text"
          placeholder="Board name"
          value={newBoardName}
          onChange={(e) =>
            setNewBoardName(e.target.value)
          }
        />

        
<button onClick={handleCreateBoard}>
  Create Board
</button>
</div>
</div>
</div>       

<div className="board">

<div className="column todo-column">
  <h2>Todo ({todoTasks.length})</h2>

  {todoTasks.map((task) => (
    <div
      key={task.id}
      className="task-card"
    >
      {editingTask?.id === task.id ? (
        <>
          <input
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                title: e.target.value
              })
            }
          />

          <textarea
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                description: e.target.value
              })
            }
          />

          <div className="task-actions">
            <button
              className="move-btn"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                setEditingTask(null)
              }
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>{task.title}</h3>

          <p>{task.description}</p>

          <div className="task-actions">
            <button
              className="edit-btn"
              onClick={() => handleEdit(task)}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                handleDelete(task.id)
              }
            >
              Delete
            </button>

            <button
              className="move-btn"
              onClick={() =>
                handleMoveTask(
                  task,
                  "in_progress"
                )
              }
            >
              Start
            </button>
          </div>
        </>
      )}
    </div>
  ))}
</div>

  {/* IN PROGRESS COLUMN */}
 <div className="column progress-column">
  <h2>In Progress ({inProgressTasks.length})</h2>

  {inProgressTasks.map((task) => (
    <div
      key={task.id}
      className="task-card"
    >
      {editingTask?.id === task.id ? (
        <>
          <input
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                title: e.target.value
              })
            }
          />

          <textarea
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                description: e.target.value
              })
            }
          />

          <div className="task-actions">
            <button
              className="move-btn"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                setEditingTask(null)
              }
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>{task.title}</h3>

          <p>{task.description}</p>

          <div className="task-actions">
            <button
              className="edit-btn"
              onClick={() => handleEdit(task)}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                handleDelete(task.id)
              }
            >
              Delete
            </button>

            <button
              className="move-btn"
              onClick={() =>
                handleMoveTask(task, "todo")
              }
            >
              Back
            </button>

            <button
              className="move-btn"
              onClick={() =>
                handleMoveTask(task, "done")
              }
            >
              Complete
            </button>
          </div>
        </>
      )}
    </div>
  ))}
</div>

  {/* DONE COLUMN */}
<div className="column done-column">
  <h2>Done ({doneTasks.length})</h2>

  {doneTasks.map((task) => (
    <div
      key={task.id}
      className="task-card"
    >
      {editingTask?.id === task.id ? (
        <>
          <input
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                title: e.target.value
              })
            }
          />

          <textarea
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({
                ...editingTask,
                description: e.target.value
              })
            }
          />

          <div className="task-actions">
            <button
              className="move-btn"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                setEditingTask(null)
              }
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>{task.title}</h3>

          <p>{task.description}</p>

          <div className="task-actions">
            <button
              className="edit-btn"
              onClick={() => handleEdit(task)}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                handleDelete(task.id)
              }
            >
              Delete
            </button>

            <button
              className="move-btn"
              onClick={() =>
                handleMoveTask(
                  task,
                  "in_progress"
                )
              }
            >
              Reopen
            </button>
          </div>
        </>
      )}
    </div>
  ))}
</div> {/* Done column */}
</div> {/* board */}
</div> /* app */
  )
}

export default App