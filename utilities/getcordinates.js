import * as https from 'https';

export default async function getDistance(lat, lon, lat2, lon2) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'graphhopper.com',
            port: 443,
            path: '/api/1/matrix?point=44.948607,34.040436&point=55.723060,37.364715&type=json&profile=car&out_array=weights&out_array=times&out_array=distances&key=6a5a958f-d65c-4682-b444-be75e81f82cb',
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data); // Разрешаем обещание с полученными данными
            });
        });

        req.on('error', (error) => {
            reject(error); // Отклоняем обещание в случае ошибки
        });
        req.end();
    });
}

