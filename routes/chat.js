import express from 'express';
import ChatController from '../controllers/ChatController';
//

const router = express.Router();

// socket.io('/chat/send-message?room_id&token, EVENT: message)S
// router.get('/im/messages', ChatController.GetMessages);
router.get('/im', ChatController.GetChats);
router.get('/im/admin', ChatController.GetChatsAdmin);

export default router;
