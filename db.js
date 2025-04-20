import 'dotenv/config';
import { Pool } from 'pg';
import genResult from './results';

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
            CREATE IF NOT EXISTS TABLE planes (
                PID SERIAL UNIQUE PRIMARY KEY,
                YearMade varchar(255) NOT NULL,
                Model varchar(255) NOT NULL,
                Capacity INT NOT NULL,
                Status INT NOT NULL
        );`);
        console.log(`Table 'planes' successfuly created!`);

        await pool.query(`
            CREATE IF NOT EXISTS TABLE travels (
                TID SERIAL UNIQUE PRIMARY KEY,
                PID INT NOT NULL UNIQUE,
                TravelDate DATE NOT NULL,
                Travelers INT[] NOT NULL
        );`);
        console.log(`Table 'travels' succesfuly created!`)

        await pool.query(`
            CREATE IF NOT EXISTS TABLE finances (
                TransactionID SERIAL UNIQUE PRIMARY KEY,
                TotalMoney INT NOT NULL,
                TotalChanged INT NOT NULL,
                TransactionDate DATE NOT NULL
        );`);
        console.log(`Table 'finances' succesfuly created!`);

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