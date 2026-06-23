from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):

        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: str):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: str):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)

            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast(self, message: str, chat_id: str):
        for connection in self.active_connections.get(chat_id, []):
            await connection.send_text(message)

manager = ConnectionManager()