import fetch from 'node-fetch';

class PaymentsController {
    static Test = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {value} = req.body;
            const url = 'https://api.yookassa.ru/v3/payments';

            function generateRandomString(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let randomString = '';

                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    randomString += characters.charAt(randomIndex);
                }

                return randomString;
            }

            const authHeader = 'Basic ' + Buffer.from('244369:test_7NnPZ1y9-SJDn_kaPGbXe1He3EmNJP-RyUvKD_47y7w').toString('base64');
            const idempotenceKey = generateRandomString(7);
            const requestData = {
                amount: {
                    value: value,
                    currency: 'RUB'
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: 'https://www.example.com/return_url'
                },
                description: `Пользователь: ${user_id}`
            };

            fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Idempotence-Key': idempotenceKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
                .then(response => response.json())
                .then(data => {
                    res.status(200).json({
                        data: data.confirmation.confirmation_url
                    })
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getPromotion = async (req, res, next) => {
        try {

        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default PaymentsController;
