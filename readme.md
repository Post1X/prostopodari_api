## Route:
### localhost:3001/chat/messages

Request for connecting to the server via WebSocket:
`````//  Route for the request
const root = 'http://localhost:3001/chat/messages';
`````
#### // Request for connecting to the server
`````
const socket = io(root, {
    query: {
        token: '<your_token>', // Replace with your token
        seller_id: '<seller_id>', // Replace with your seller ID
        room_id: '<room_id>', // Replace with your room ID
    },
});
`````
## Request for sending a message to the server:
#### // Request for sending a message (this is my generated function to show you how it works.)
`````
function sendMessage() {
const message = messageInput.value;
socket.emit('sendMessage', { text: message });
messageInput.value = '';
}
`````
## Request for receiving messages from the server (upon connection and when receiving new messages):
###  Request for connecting to the server
`````
socket.on('connect', () => {
console.log('Connected to server.');
socket.emit('getMessage');
});
`````
### Request for receiving messages from the server
````
socket.on('messages', ({ messages, newMessCount }) => {
            ...your code...
});
````

# !!!!!!IMPORTANT!!!!!!
## For each request, it is essential to include the following three main query parameters:
# seller_id - For creating a new chat if there is no room_id. Even if it does, you should send it for proper work.
# room_id - The identifier of the room.
# token - The JWT token generated during login and saved in your local state.
