import {fileURLToPath} from 'url';
//
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
import headersValidation from "./middlewares/headers";
import databaseConnections from "./services/database";
import router from "./routes"
import bodyParser from "express";
import admin from 'firebase-admin';
import serviceAccount from "./prosto-podari-7de3c-firebase-adminsdk-9fxsh-78ef29c14e.json";
databaseConnections.connectToDatabase().then(r => console.log('ok'));
const app = express();

app.use(headersValidation);
app.use(logger('dev'));
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(router);
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'prosto-podari-7de3c'
    });
    console.log('Firebase Admin SDK initialized successfully!');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
}
app.set('view engine', 'jade');
process.once('SIGUSR2', async () => {
    await databaseConnections.closeDatabaseConnection();
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', async () => {
    await databaseConnections.closeDatabaseConnection();
    process.exit();
});

app.use(function (req, res, next) {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: "error",
        message: err.message,
        errors: err.errors,
    });
});

module.exports = app;
