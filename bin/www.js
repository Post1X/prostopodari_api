import jwt from 'jsonwebtoken';
import {uuid} from 'uuidv4';
import Messages from '../schemas/MessagesSchema';
import Sellers from '../schemas/SellersSchema';
import Chats from '../schemas/ChatsSchema';
import Buyers from '../schemas/BuyersSchema';
import UserChats from '../schemas/UserChats';
import fs from 'fs';
import ss from 'socket.io-stream'
import * as path from 'path';

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
    maxHttpBufferSize: 20 * 1024 * 1024,
    cors: {
        origin: '*',
    }
})
app.set('io', io);
/**
 * Listen on provided port, on all network interfaces.
 */



const testSpace = io.of('/test');
const chatSpace = io.of('/chat/messages');
const userChatSpace = io.of('/chat/user')

userChatSpace.on('connection', async (socket) => {
    try {
        socket.roomId = socket.handshake.query.roomId;
        if (!socket.roomId) {
            socket.roomId = uuid();
        }
        socket.seller_id = socket.handshake.query.seller_id;
        socket.buyer_id = socket.handshake.query.buyer_id;
        socket.seller = await Sellers.findOne({_id: socket.seller_id});
        socket.buyer = await Buyers.findOne({_id: socket.buyer_id})
        const token = socket.handshake.query.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.result = decoded.isSeller ? 'seller' : 'user';
        await getMessagesAndSendToUsers(socket);
        socket.on('isRead', async (lastMessage) => {
            try {
                if (socket.result === 'seller') {
                    await Messages.updateMany(
                        {
                            _id: {$lte: lastMessage},
                            role: 'seller'
                        },
                        {$set: {isRead: true}}
                    );
                }
                if (socket.result === 'user') {
                    await Messages.updateMany(
                        {
                            _id: {$lte: lastMessage},
                            role: 'user'
                        },
                        {$set: {isRead: true}}
                    );
                }
            } catch (e) {
                console.error('Ошибка в обработчике событий сокета:', e);
                socket.disconnect(true);
            }
        })
        socket.on('send-img', async (image) => {
            try {
                // console.log(image)
                // if (typeof image === 'string') {
                //     console.log('image is string')
                // } else {
                //     console.error('Image is not a string:', image);
                // }
                const splitted = image.split(';base64,');
                const format = splitted[0].split('/')[1];
                const fileName = `./public/images/image${Date.now().toString()}.` + format;
                const baseName = fileName.replace('./public', '');
                fs.writeFileSync(`./public/images/image${Date.now().toString()}.` + format, splitted[1], {encoding: 'base64'});
                await sendImage(socket, baseName);
                await getMessagesAndSendToUsers(socket);
            } catch (e) {
                e.status = 401;
                console.error(e)
            }
        })
        socket.on('sendMessage', async (message) => {
            try {
                console.log('Received message:', message.text);
                await sendMessage(socket, message);
                await getMessagesAndSendToUsers(socket);
            } catch (err) {
                console.error('Ошибка в обработчике событий сокета:', err);
                socket.disconnect(true);
            }
        });
        socket.on('disconnect', () => {
            console.log('Клиент отключился от пространства /chat');
        });
    } catch (e) {
        console.error('Ошибка в обработчике событий сокета:', e);
        socket.emit('Ошибка:', e);
    }
})

async function getMessagesAndSendToUsers(socket) {
    try {
        console.log('Getting messages...');
        let chatMessages = [];
        if (socket.result === 'seller' || socket.result === 'user') {
            chatMessages = await Messages.find({room_id: socket.roomId}).sort({date: 1});
            const sellerMessages = chatMessages.filter((message) => message.role === 'seller');
            const userMessages = chatMessages.filter((message) => message.role === 'user');
            const newMessSeller = sellerMessages.filter((message) => !message.isRead).length;
            const newMessUser = userMessages.filter((message) => !message.isRead).length;
            socket.newMessSeller = newMessSeller;
            socket.newMessUser = newMessUser;
        }
        userChatSpace.emit('messages', {
            messages: chatMessages,
            newMessCount: socket.result === 'seller' ? socket.newMessSeller : socket.newMessUser
        });
        if (!socket.handshake.query.roomId) {
            const chat = await UserChats.findOne({
                seller_id: socket.seller_id,
                user_id: socket.buyer_id
            });
            const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : '';
            if (socket.result === 'user' && !chat) {
                const newChat = new UserChats({
                    name: socket.buyer.full_name ? socket.buyer.full_name : socket.buyer.phone_number,
                    user_id: socket.buyer_id,
                    seller_id: socket.seller_id,
                    chatID: socket.roomId,
                    phone_number: socket.buyer.phone_number,
                    newMessCount: 0,
                    lastMessage: lastMessage
                });
                await newChat.save();
                socket.join(socket.roomId);
            }
        }
    } catch (e) {
        console.error('Ошибка в обработчике событий сокета:', e);
        socket.emit('Ошибка:', e);
    }
}

async function sendImage(socket, message) {
    userChatSpace.to(socket.roomId).emit('newMessage', {
        message: message,
        isImage: true
    });
    if (socket.result === 'seller') {
        const newMessages = new Messages({
            room_id: socket.roomId,
            name: socket.seller.legal_name,
            role: socket.result,
            text: message,
            isRead: false,
            isImage: true
        });
        if (socket.roomId) {
            const chats = await UserChats.findOne({chatID: socket.roomId});
            if (chats) {
                await UserChats.findOneAndUpdate({chatID: socket.roomId}, {lastMessage: message.text});
            }
        }
        await newMessages.save();
    }
    if (socket.result === 'user') {
        const newMessages = new Messages({
            room_id: socket.roomId,
            name: socket.buyer.full_name ? socket.buyer.full_name : `Покупатель`,
            role: socket.result,
            text: message,
            isRead: false,
            isImage: true
        });
        if (socket.roomId) {
            const chats = await UserChats.findOne({chatID: socket.roomId});
            if (chats) {
                await UserChats.findOneAndUpdate({chatID: socket.roomId}, {lastMessage: message.text});
            }
        }
        await newMessages.save();
    }
}

async function sendMessage(socket, message) {
    userChatSpace.to(socket.roomId).emit('newMessage', message);
    if (socket.result === 'seller') {
        console.log(socket.seller_id)
        const seller = await Sellers.findOne({
            _id: socket.seller_id
        })
        console.log(seller)
        const newMessages = new Messages({
            room_id: socket.roomId,
            name: seller.legal_name,
            role: socket.result,
            text: message.text,
            isRead: false,
        });
        if (socket.roomId) {
            const chats = await UserChats.findOne({chatID: socket.roomId});
            if (chats) {
                await UserChats.findOneAndUpdate({chatID: socket.roomId}, {lastMessage: message.text});
            }
        }
        await newMessages.save();
    }
    if (socket.result === 'user') {
        const newMessages = new Messages({
            room_id: socket.roomId,
            name: socket.buyer.full_name ? socket.buyer.full_name : `Покупатель`,
            role: socket.result,
            text: message.text,
            isRead: false
        });
        if (socket.roomId) {
            const chats = await UserChats.findOne({chatID: socket.roomId});
            if (chats) {
                await UserChats.findOneAndUpdate({chatID: socket.roomId}, {lastMessage: message.text});
            }
        }
        await newMessages.save();
    }
}


chatSpace.on('connection', async (socket) => {
    try {
        socket.roomId = socket.handshake.query.roomId;
        if (!socket.roomId) {
            socket.roomId = uuid();
        }
        const seller_id = socket.handshake.query.seller_id;
        const token = socket.handshake.query.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sellerForTest = await Sellers.findOne({
            _id: seller_id
        })
        if (socket.roomId) {
            socket.join(socket.roomId);
        }
        const result = decoded ? (decoded.isSeller ? 'seller' : (decoded.isAdmin ? 'admin' : 'user')) : 'user';
        console.log(`Пользователь ${decoded.user_id} с ролью ${result} подключился к чату под номером ${roomId}`);
        socket.phone_number = sellerForTest.phone_number;
        socket.seller_id = seller_id;
        socket.name = sellerForTest.name;
        socket.result = result;
        socket.user_id = decoded.user_id;
        socket.isSeller = decoded.isSeller || false;
        socket.isAdmin = decoded.isAdmin || false;
        await getMessagesAndSendToClient(socket);
        socket.on('isRead', async (lastMessage) => {
            try {
                console.log(lastMessage)
                if (socket.result === 'seller') {
                    await Messages.updateMany(
                        {
                            _id: {$lte: lastMessage},
                            role: 'admin'
                        },
                        {$set: {isRead: true}}
                    );
                }
                if (socket.result === 'admin') {
                    await Messages.updateMany(
                        {
                            _id: {$lte: lastMessage},
                            role: 'seller'
                        },
                        {$set: {isRead: true}}
                    );
                }
            } catch (e) {
                console.error('Ошибка в обработчике событий сокета:', e);
                socket.emit('Ошибка:', e);
            }
        })
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
            chatMessages = await Messages.find({room_id: socket.roomId}).sort({date: 1});
            const sellerMessages = chatMessages.filter((message) => message.role === 'seller');
            const adminMessages = chatMessages.filter((message) => message.role === 'admin');
            const newMessSeller = sellerMessages.filter((message) => !message.isRead).length;
            const newMessAdmin = adminMessages.filter((message) => !message.isRead).length;
            socket.newMessSeller = newMessSeller;
            socket.newMessAdmin = newMessAdmin;
        }
        chatSpace.emit('messages', {
            messages: chatMessages,
            newMessCount: socket.isSeller ? socket.newMessSeller : socket.newMessAdmin
        });
        if (!socket.handshake.query.roomId) {
            const name = socket.name;
            const user_id = socket.seller_id;
            const phone_number = socket.phone_number;
            const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : '';
            const newChat = new Chats({
                name,
                user_id,
                chatID: socket.roomId,
                phone_number,
                newMessCount: 0,
                lastMessage,
                priority: 'admin'
            });
            socket.join(newRoomId);
            await newChat.save();
        }
    } catch (e) {
        console.error('Ошибка в обработчике событий сокета:', e);
        socket.emit('Ошибка:', e);
    }
}

async function processSendMessage(socket, message) {
    chatSpace.to(socket.roomId).emit('newMessage', message);
    const newMessages = new Messages({
        room_id: socket.roomId,
        name: socket.name,
        role: socket.result,
        text: message.text,
        isRead: false
    });
    if (socket.roomId) {
        const chats = await Chats.findOne({chatID: socket.roomId});
        if (chats) {
            await Chats.findOneAndUpdate({chatID: socket.roomId}, {lastMessage: message.text});
        }
    }
    await newMessages.save();
}

testSpace.on('connection', (socket) => {
    ss(socket).on('profile-image', (stream, data) => {
        let filename = path.basename(data.name);
        stream.pipe(fs.createWriteStream(filename));
    })
})

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
