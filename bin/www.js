import jwt from 'jsonwebtoken';
import ChatController from '../controllers/ChatController';
import {uuid} from 'uuidv4';
import Messages from '../schemas/MessagesSchema';
import Sellers from '../schemas/SellersSchema';
import Chats from '../schemas/ChatsSchema';

const app = require('../app');
const debug = require('debug')('server:server');
const http = require('http');
const socketIO = require('socket.io');

/**
 *
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
    }
});
app.set('io', io);

/**
 * Listen on provided port, on all network interfaces.
 */



const chatSpace = io.of('/chat/messages');

chatSpace.on('connection', async (socket) => {
    try {
        const roomId = socket.handshake.query.roomId;
        const seller_id = socket.handshake.query.seller_id;
        const token = socket.handshake.query.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sellerForTest = await Sellers.findOne({
            _id: seller_id
        })
        const result = decoded ? (decoded.isSeller ? 'seller' : (decoded.isAdmin ? 'admin' : 'user')) : 'user';
        console.log(`Пользователь ${decoded.user_id} с ролью ${result} подключился к чату под номером ${roomId}`);
        socket.phone_number = sellerForTest.phone_number;
        socket.seller_id = seller_id;
        socket.name = sellerForTest.name;
        socket.result = result;
        socket.roomId = roomId;
        socket.user_id = decoded.user_id;
        socket.isSeller = decoded.isSeller || false;
        socket.isAdmin = decoded.isAdmin || false;
        await getMessagesAndSendToClient(socket);
        socket.on('sendMessage', async (message) => {
            try {
                console.log('Received message:', message.text);
                await processSendMessage(socket, message);
                await getMessagesAndSendToClient(socket);
            } catch (err) {
                console.error('Ошибка в обработчике событий сокета:', err);
                socket.disconnect(true);
            }
        });

        socket.on('disconnect', () => {
            console.log('Клиент отключился от пространства /chat');
        });
    } catch (err) {
        console.error('Ошибка в обработчике событий сокета:', err);
        socket.disconnect(true);
    }
});

async function getMessagesAndSendToClient(socket) {
    try {
        let chatMessages = [];
        console.log('Getting messages...');
        if (socket.isSeller || socket.isAdmin) {
            chatMessages = await Messages.find({ room_id: socket.roomId }).sort({ date: 1 });
            const sellerMessages = chatMessages.filter((message) => message.role === 'seller');
            const adminMessages = chatMessages.filter((message) => message.role === 'admin');
            const newMessSeller = sellerMessages.filter((message) => !message.isRead).length;
            const newMessAdmin = adminMessages.filter((message) => !message.isRead).length;
            socket.newMessSeller = newMessSeller;
            socket.newMessAdmin = newMessAdmin;
        }
        // Отправляем список сообщений клиенту
        socket.emit('messages', {
            messages: chatMessages,
            newMessCount: socket.isSeller ? socket.newMessSeller : socket.newMessAdmin
        });

        if (!socket.roomId) {
            // Если roomId не передан, создаем новый roomId и чат
            const newRoomId = uuid();
            socket.roomId = newRoomId;

            const name = socket.name;
            const user_id = socket.seller_id;
            const phone_number = socket.phone_number;
            const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : '';
            const newChat = new Chats({
                name,
                user_id,
                chatID: newRoomId,
                phone_number,
                newMessCount: 0,
                lastMessage,
                priority: 'admin'
            });
            await newChat.save();
        }
    } catch (e) {
        console.error('Ошибка в обработчике событий сокета:', e);
        socket.emit('Ошибка:', e);
    }
}

async function processSendMessage(socket, message) {
    const newMessages = new Messages({
        room_id: socket.roomId,
        name: socket.name,
        role: socket.result,
        text: message.text,
        isRead: false
    });
    if (socket.roomId) {
        const chats = await Chats.findOne({ chatID: socket.roomId });
        if (chats) {
            await Chats.findOneAndUpdate({ chatID: socket.roomId }, { lastMessage: message.text });
        }
    }
    await newMessages.save();
}


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    console.log(`Порт сервера: ${process.env.PORT}`);
}
