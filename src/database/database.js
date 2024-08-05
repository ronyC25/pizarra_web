import mysql from "promise-mysql";
import config from "./../config";

let connection;

const handleDisconnect = async () => {
    try {
        connection = await mysql.createConnection({
            host: config.host,
            database: config.database,
            user: config.user,
            password: config.password,
            port: config.port // Incluye el puerto si es necesario
        });

        connection.on('error', async (err) => {
            console.error('Database error:', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
                console.log('Attempting to re-establish database connection...');
                await handleDisconnect();
            } else {
                throw err;
            }
        });

        console.log('Connected to the database.');
    } catch (err) {
        console.error('Error connecting to database:', err);
        setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    }
};

handleDisconnect();

const getConnection = () => {
    return connection;
};

module.exports = {
    getConnection
};
