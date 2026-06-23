from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        # board_id -> list of websockets
        self.active_connections = defaultdict(list)

        # board_id -> list of usernames
        self.active_users = defaultdict(list)

    # user connects
    async def connect(
        self,
        board_id: str,
        websocket: WebSocket,
        username: str
    ):

        await websocket.accept()

        self.active_connections[board_id].append(
            websocket
        )

        print("CONNECTED TO BOARD:", board_id)
        print("TOTAL CONNECTIONS:", len(self.active_connections[board_id]))

        self.active_users[board_id].append(
            username
        )

    # user disconnects
    def disconnect(
        self,
        board_id: str,
        websocket: WebSocket,
        username: str
    ):

        if websocket in self.active_connections[board_id]:

            self.active_connections[board_id].remove(
                websocket
            )

        if username in self.active_users[board_id]:

            self.active_users[board_id].remove(
                username
            )

        # cleanup empty rooms
        if not self.active_connections[board_id]:

            del self.active_connections[board_id]
            del self.active_users[board_id]

    # send message to everyone in board
    async def broadcast_to_board(
        self,
        board_id: str,
        message: dict
    ):

        connections = self.active_connections.get(
            board_id,
            []
        )

        print("BROADCAST:", message)
        print("BOARD:", board_id)
        print("CONNECTIONS:", len(connections))

        disconnected = []

        for connection in connections:

            print("SENDING TO CONNECTION:", id(connection))

        try:

            await connection.send_json(message)

        

        except Exception as e:

            print("SEND ERROR:",e)

            disconnected.append(connection)

        # remove dead sockets
        for connection in disconnected:

            self.active_connections[board_id].remove(
                connection
            )

    # get online users
    def get_online_users(self, board_id: str):

        return self.active_users.get(
            board_id,
            []
        )


manager = ConnectionManager()