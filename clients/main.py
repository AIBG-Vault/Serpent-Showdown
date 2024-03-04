import asyncio
import websockets

async def connect_to_websocket_server():
    uri = "ws://localhost:3000?id=12345678"  # Replace with your WebSocket server address

    async with websockets.connect(uri) as websocket:
        # Send a message to the server
        await websocket.send("Hello, WebSocket server!")

        # Receive a response from the server
        response = await websocket.recv()
        print(f"Received from server: {response}")

asyncio.run(connect_to_websocket_server())

