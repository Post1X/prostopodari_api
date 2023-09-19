import Sellers from '../schemas/SellersSchema';
import Chats from '../schemas/ChatsSchema';
import Messages from '../schemas/MessagesSchema';
import UserChats from '../schemas/UserChats';
import {uuid} from 'uuidv4';
import Buyers from '../schemas/BuyersSchema';

class ChatController {
    static async initSocket(socket) {
        try {
            console.log(socket.seller_id, 'seller')
            const seller = await Sellers.findOne({
                _id: socket.user_id
            });
            const sellerForAdmin = await Sellers.findOne({
                _id: socket.seller_id
            })
            if (seller) {
                socket.on('message', async (data) => {
                    const newMessages = new Messages({
                        room_id: socket.roomId,
                        name: seller.name,
                        role: 'seller',
                        text: data,
                        isRead: false
                    });
                    if (socket.roomId) {
                        const chats = await Chats.findOne({
                            chatID: socket.roomId
                        })
                        if (chats) {
                            await Chats.findOneAndUpdate({
                                chatID: socket.roomId,
                            }, {
                                lastMessage: data
                            })
                        }
                        if (!chats) {
                            const newChat = new Chats({
                                name: 'Администратор',
                                user_id: socket.user_id,
                                chatID: socket.roomId,
                                phone_number: 'Администатор',
                                newMessCount: 0,
                                lastMessage: data
                            })
                            await newChat.save();
                        }
                    }
                    await newMessages.save();
                });
            }
            if (!seller) {
                socket.on('message', async (data) => {
                    const newMessages = new Messages({
                        room_id: socket.roomId,
                        name: 'Администратор',
                        role: 'admin',
                        text: data,
                        isRead: false
                    });
                    console.log(socket.roomId, 'roomid')
                    if (socket.roomId) {
                        const chats = await Chats.findOne({
                            chatID: socket.roomId
                        })
                        if (chats) {
                            await Chats.findOneAndUpdate({
                                chatID: socket.roomId
                            }, {
                                lastMessage: data
                            })
                        }
                        if (!chats) {
                            const newChat = new Chats({
                                name: sellerForAdmin.name,
                                user_id: socket.seller_id,
                                chatID: socket.roomId,
                                phone_number: sellerForAdmin.phone_number,
                                newMessCount: 0,
                                lastMessage: data,
                                priority: 'admin'
                            })
                            await newChat.save();
                        }
                    }
                    await newMessages.save();
                })
            }
            socket.on('disconnect', () => {
                console.log('Клиент отключился от пространства /chat');
            });
        } catch (e) {
            console.error('Ошибка в обработчике событий сокета:', e);
            socket.emit('Ошибка:', e);
        }
    }

    //
    static async GetMessages(socket) {
        try {
            let chatMessages = [];
            console.log('dsadwad')
            if (socket.isSeller || socket.isAdmin) {
                chatMessages = await Messages.find({room_id: socket.roomId}).sort({date: 1});
                const sellerMessages = chatMessages.filter((message) => message.role === 'seller');
                const adminMessages = chatMessages.filter((message) => message.role === 'admin');
                const newMessSeller = sellerMessages.filter((message) => !message.isRead).length;
                const newMessAdmin = adminMessages.filter((message) => !message.isRead).length;
                socket.newMessSeller = newMessSeller;
                socket.newMessAdmin = newMessAdmin;
            }
            socket.emit('messages', {
                messages: chatMessages,
                newMessCount: socket.isSeller ? socket.newMessSeller : socket.newMessAdmin
            });
        } catch (e) {
            console.error('Ошибка в обработчике событий сокета:', e);
            socket.emit('Ошибка:', e);
        }
    }


    static GetChats = async (req, res, next) => {
        try {
            const {user_id} = req;
            if (!req.isSeller) {
                const chatsUsers = await UserChats.find({
                    user_id: user_id
                })
                res.status(200).json(chatsUsers)
            }
            if (req.isSeller) {
                const chatsSeller = await UserChats.find({
                    seller_id: user_id
                })
                res.status(200).json(chatsSeller)
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetChatsAdmin = async (req, res, next) => {
        try {
            const chats = await Chats.find({
                priority: 'admin'
            })
            res.status(200).json(chats)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static isCreated = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {seller_id} = req.query;
            const chat = await UserChats.findOne({
                buyer_id: user_id,
                seller_id: seller_id
            });
            const buyer = await Buyers.findOne({
                _id: user_id
            })
            console.log(buyer)
            const seller = await Sellers.findOne({
                _id: seller_id
            });
            if (chat) {
                res.status(200).json({
                    chatID: chat.chatID
                })
                console.log('bus')
            }
            ;
            if (!chat) {
                console.log('dreamybull')
                console.log(buyer)
                const newRoomId = uuid();
                const newChat = new UserChats({
                    name: seller ? seller.legal_name : 'Продавец',
                    user_id: user_id,
                    seller_id: seller_id,
                    chatID: newRoomId,
                    phone_number: buyer.phone_number,
                    newMessCount: 0,
                    lastMessage: 'Здравствуйте!'
                });
                const newMessages = new Messages({
                    room_id: newRoomId,
                    name: buyer.full_name ? buyer.full_name : `Покупатель`,
                    role: 'user',
                    text: 'Здравствуйте!',
                    isRead: false,
                    isImage: false
                });
                await newMessages.save();
                await newChat.save();
                res.status(200).json({
                    chatID: newRoomId
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default ChatController;

//
// name: seller.name,
//     user_id: socket.user_id,
//     chatID: socket.roomId,
//     phone_number: seller.phone_number,
//     newMessCount: 0,
//     lastMessage: data
