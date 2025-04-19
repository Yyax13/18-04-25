import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.PGSQL_HOST,
    port: process.env.PG_PORT,
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASS,
    database: process.env.PGSQL_DB,
    max: 10,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
    idleTimeoutMillis: 30000
});

async function testConnection() {
    let client;
    try {
        client = await pool.connect().then(console.log('Conexão bem sucedida'));
    } catch (err) {
        console.error('Conexão mal sucedida', err.stack || err);
    } finally {
        if (client) client.release();
    }
};

export default pool