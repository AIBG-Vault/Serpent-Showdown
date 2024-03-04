import asyncio
import websockets

async def connect_to_websocket_server():
    uri = "ws://localhost:3000?id=0987654321"  # Replace with your WebSocket server address

    async with websockets.connect(uri) as websocket:
        response = await websocket.recv()
        print(f"received from server {response}")

        while True:
            # Send a message to the server
            message_to_send = input("Enter message to send (or type 'quit' to exit): ")
            if message_to_send.lower() == 'quit':
                break
            await websocket.send(message_to_send)

            # Receive a response from the server
            response = await websocket.recv()
            print(f"Received from server: {response}")

asyncio.run(connect_to_websocket_server())

