from fastapi import WebSocket


class WSConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket_client: WebSocket):
        await websocket_client.accept()
        self.active_connections.append(websocket_client)

    async def disconnect(self, websocket_client: WebSocket):
        self.active_connections.remove(websocket_client)
