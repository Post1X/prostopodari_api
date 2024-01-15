import cron from 'node-cron';
import Promocodes from '../schemas/PromocodesSchema';
import Fcm from '../schemas/FcmSchema';
import admin from 'firebase-admin';

const asyncSearchFunction = async () => {
    try {
        const today = new Date(); // Получаем текущую дату
        const promocodes = await Promocodes.find();
        await Promise.all(promocodes.map(async (item) => {
            try {
                const promoDate = new Date(item.date);
                if (
                    promoDate.getDate() === today.getDate() &&
                    promoDate.getMonth() === today.getMonth() &&
                    item.priority !== 'admin'
                ) {
                    const userId = item.user_id;
                    const users = await Fcm.findOne({
                        user_id: userId
                    });
                    let token_array = [];
                    users.map((item) => {
                        token_array.push(item.token);
                    });
                    const message = {
                        notification: {
                            title: 'НЕ ЗАБУДЬТЕ 🎁🎁!',
                            body: `Поздравляем с "${item.event_name}"! Не забудьте использовать промокод ${item.text} со скидкой в ${item.percentage}%!`
                        },
                        tokens: token_array
                    };
                    await admin.messaging()
                        .sendMulticast(message)
                        .catch((error) => {
                            throw error;
                        });
                }
            } catch (e) {
                console.error(e);
            }
        }));
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        throw error;
    }
};

asyncSearchFunction()
    .then(result => {
        console.log('ok')
    })
    .catch(error => {
        console.error('Ошибка при поиске:', error);
    });

const setupCronTask = () => {
    const cronSchedule = '0 0 * * *';
    cron.schedule(cronSchedule, async () => {
        await asyncSearchFunction();
    });
};
export default setupCronTask;
