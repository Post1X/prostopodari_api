import nominatim from 'nominatim-client';

const client = nominatim.createClient({
    useragent: 'prosto-podari',
    referer: 'http://localhost:3001/'
});


    export default async function getCord(address) {
        const client = nominatim.createClient({
            useragent: 'prosto-podari',
            referer: 'http://localhost:3001/'
        });
        const query = {
            q: address,
            addressdetails: 1
        };
        const resultLongitude = [];
        await client.search(query).then((result) => resultLongitude.push(result));
        return resultLongitude;
    }
