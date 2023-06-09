import mongoose from "mongoose";

const url = process.env.DB_URL;

class databaseConnections {
    static connectToDatabase = async () => {
        try {
            await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
            console.log('Подключено к базе данных');
        } catch (error) {
            console.error('Ошибка подключения к базе данных:', error);
        }
    };

    static closeDatabaseConnection = async () => {
        try {
            await mongoose.disconnect();
            console.log('Соединение с базой данных закрыто');
        } catch (error) {
            console.error('Ошибка при закрытии соединения с базой данных:', error);
        }
    }
}

export default databaseConnections;
