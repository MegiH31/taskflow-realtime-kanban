import asyncio
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from backend.app.websockets.manager import manager

router = APIRouter()


@router.websocket("/ws/boards/{board_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    board_id: str
):

    username = websocket.query_params.get(
        "username",
        "Anonymous"
    )

    await manager.connect(
        board_id,
        websocket,
        username
    )

    # notify users someone joined
    await manager.broadcast_to_board(
        board_id,
        {
            "event": "user_joined",
            "data": {
                "username": username,
                "online_users": manager.get_online_users(board_id)
            }
        }
    )

    try:

        # keep websocket alive
        while True:
            await asyncio.sleep(1)

    except WebSocketDisconnect:

        manager.disconnect(
            board_id,
            websocket,
            username
        )

        # notify users someone left
        await manager.broadcast_to_board(
            board_id,
            {
                "event": "user_left",
                "data": {
                    "username": username,
                    "online_users": manager.get_online_users(board_id)
                }
            }
        )