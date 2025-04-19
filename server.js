import 'dotenv/config'
import e from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PostgreSQLStore = connectPgSimple(session);

const app = e();
app.use(cors());
app.use(e.json());
app.use(e.static(path.join(__dirname, "public")));
app.use(session({
    store: new PostgreSQLStore({
        pool: pool,
        tableName: 'session-store_table',
        createTableIfMissing: true
    }),
    secret: [
        process.env.SESSION_Secret_1, 
        process.env.SESSION_Secret_2,
        process.env.SESSION_Secret_3, 
        process.env.SESSION_Secret_4, 
        process.env.SESSION_Secret_5
    ],
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.ENV_IsInProd,
        maxAge: 86400000, // 1h
        httpOnly: true
    }
}));

const PORT = process.env.PORT || 3001;

