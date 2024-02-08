import Fcm from '../schemas/FcmSchema';
import admin from 'firebase-admin';
import Notifications from '../schemas/NotificationsSchema';

class FcmController {
    static generateTokenForUser = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {is_seller, token} = req.body;
            const newToken = new Fcm({
                token: token,
                user_id: user_id,
                is_seller: is_seller
            });
            await newToken.save().then(res.status(200).json({
                message: 'success'
            }));
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static sendMessage = async (req, res, next) => {
        try {
            const {title, body} = req.body;
            const users = await Fcm.find({
                is_seller: true
            });
            let token_array = [];
            users.map((item) => {
                token_array.push(item.token);
            });
            const message = {
                notification: {
                    title: title,
                    body: body
                },
                tokens: token_array
            };
            const newNotification = new Notifications({
                date: new Date(),
                role: 'seller',
                title: title,
                body: body
            })
            await newNotification.save();
            admin.messaging()
                .sendMulticast(message)
                .then(() => {
                    res.status(200).json({
                        message: 'ok'
                    });
                })
                .catch((error) => {
                    throw error;
                });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static sendMessageBuyer = async (req, res, next) => {
        try {
            const {title, body} = req.body;
            const users = await Fcm.find({
                is_seller: false
            });
            let token_array = [];
            users.map((item) => {
                token_array.push(item.token);
            });
            const message = {
                notification: {
                    title: title,
                    body: body
                },
                tokens: token_array
            };
            const newNotification = new Notifications({
                date: new Date(),
                role: 'buyer',
                title: title,
                body: body
            })
            await newNotification.save();
            admin.messaging()
                .sendMulticast(message)
                .then(() => {
                    res.status(200).json({
                        message: 'ok'
                    });
                })
                .catch((error) => {
                    throw error;
                });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getNotifications = async (req, res, next) => {
        try {
            const notifs = await Notifications.find({});
            return res.status(200).json(notifs);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default FcmController;
