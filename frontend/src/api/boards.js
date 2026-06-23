import axios from "axios"

const API_URL = "http://127.0.0.1:8000"

export const getBoards = async () => {
  const response = await axios.get(
    `${API_URL}/boards`
  )

  return response.data
}

export const createBoard = async (
  boardData
) => {
  const response = await axios.post(
    `${API_URL}/boards`,
    boardData
  )

  return response.data
}

export const deleteBoard = async (id) => {
  const response = await axios.delete(
    `${API_URL}/boards/${id}`
  )

  return response.data
}

export const updateBoard = async (
  id,
  boardData
) => {
  const response = await axios.put(
    `${API_URL}/boards/${id}`,
    boardData
  )

  return response.data
}