import 'dotenv/config';
const { Pool } = pg
import pg from 'pg';
import genResult from './results.js';

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
        client = await pool.connect().then(console.log('Successfuly connected!'));
    } catch (err) {
        console.error('Error during connection with DB ', err.stack || err);
    } finally {
        if (client) client.release();
    }
};

async function createTables() {
    const result = genResult;

    try {
        /* Plane status:
            0: Non-operating,
            1: Active,
            2: In maintenance
        */
        await pool.query(`
            CREATE TABLE IF NOT EXISTS planes (
                PID SERIAL UNIQUE PRIMARY KEY,
                YearMade varchar(255) NOT NULL,
                Model varchar(255) NOT NULL,
                Capacity INT NOT NULL,
                Status INT NOT NULL,
                CostOnBuy INT NOT NULL
            );
        `);
        console.log(`Table 'planes' successfuly created!`);

        /* TravelCost explanation:
            Every new travel, ll have a cost:
            14% of plane cost (on buy)
        */
        await pool.query(`
            CREATE TABLE IF NOT EXISTS travels (
                TID SERIAL UNIQUE PRIMARY KEY,
                PID INT NOT NULL UNIQUE,
                TravelDateTime TIMESTAMP NOT NULL,
                Travelers INT[],
                TravelCost FLOAT NOT NULL
        );`);
        console.log(`Table 'travels' successfuly created!`)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS finances (
                TransactionID SERIAL UNIQUE PRIMARY KEY,
                TotalMoney INT NOT NULL,
                TotalChanged INT NOT NULL,
                TransactionDate TIMESTAMP NOT NULL
            );
        `);
        console.log(`Table 'finances' successfuly created!`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS travelers (
                TravelerID SERIAL UNIQUE PRIMARY KEY,
                tName varchar(255) UNIQUE NOT NULL,
                tPass varchar(255) NOT NULL,
                TravelerMoney FLOAT NOT NULL,
                Travels INT[],
                AcessLevel INT DEFAULT 1
            );
        `);
        console.log(`Table 'travelers' successfuly created!`)

    } catch (err) {
        result.message = `Error during table creation:
        ${err.message}
        Complete error: ${err}`;

        console.error(result.message);

    };
};

testConnection();
createTables();

export default pool;