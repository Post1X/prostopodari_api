import * as https from 'https';

// eslint-disable-next-line func-style,no-unused-vars,no-empty-function
export default async function makeCall(phoneNumber, code) {
    try {
        console.log(code)
        const postData = JSON.stringify({
            'recipient': phoneNumber,
            'type': 'flashcall',
            'payload': {
                'sender': 'ВКайфе',
                'text': code
            }
        });
        const options = {
            hostname: 'online.sigmasms.ru',
            port: 443,
            path: '/api/sendings',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '1e5de1c0ae54c33d35f7ea0b81f0a16111c1d79e6c9b2d45c76493d82e092198'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(data);
            });
        });
        req.on('error', (error) => {
            console.error(error);
        });
        req.write(postData);
        req.end();
        return 'ok';
    } catch (error) {
        console.error(error);
        return 'error';
    }
}
