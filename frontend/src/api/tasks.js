import axios from "axios"

const API_URL = "http://127.0.0.1:8000"

export const getTasks = async () => {
    const response = await axios.get(`${API_URL}/tasks`)
    return response.data // returns all tasks from PostgreSQL
}

export const updateTask = async (id, taskData) => {
    const response = await axios.put(
        `${API_URL}/tasks/${id}`,
        taskData
    )

    return response.data
}

export const getBoardTasks = async (boardId) => {
    const response = await axios.get(
        `${API_URL}/boards/${boardId}/tasks`
    )

    return response.data
}

export const deleteTask = async (id) => {
    const response = await axios.delete(
        `${API_URL}/tasks/${id}`
    )

    return response.data
}

export const createTask = async (taskData) => {
    const response = await axios.post(
        `${API_URL}/tasks`,
        taskData
    )

    return response.data
}
