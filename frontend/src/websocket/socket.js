const socket = new WebSocket(
    "ws://127.0.0.1:8000/ws/boards/1?username=Megi"
)

socket.onopen = () => {
    console.log("WebSocket connected")
}

socket.onerror = (error) => {
    console.log("WebSocket error:", error)
}

socket.onclose = () => {
    console.log("WebSocket disconnected")
}

export default socket