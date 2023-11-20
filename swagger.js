const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Autoportal',
        description: 'DOC for Autoportal',
    },
    host: '194.58.121.218:3001',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Bearer <token>'
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
