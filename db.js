const mysql2 = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql2.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'corrida_db',
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conexão ao banco de dados estabelecida com sucesso!');
        connection.release();
    }
});

module.exports = pool.promise();
