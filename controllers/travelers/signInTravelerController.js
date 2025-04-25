import genResult from "../../results.js";
import pool from "../../db.js";
import bcrypt from 'bcrypt';
import 'dotenv/config';
import {v4 as uuidv4} from 'uuid';

async function checkHashedPass(passwd, hash) {
    const result = genResult();

    try {
        const match = await bcrypt.compare(passwd, hash);

        result.success = match;
        result.others = {
            match: match
        };

    } catch (err) {
        result.success = false;
        result.message = `
        Internal server error in checkHashedPass():
        Error message: ${err.message},
        Error: ${err.stack}`;
        result.others = {
            error: err
        };

        console.error(result.message);

    } finally {
        return result;
    }
};

async function signIn(tName, tPass) {
    const result = genResult();

    try {
        const {rows: dataFromDB} = await pool.query(`
            SELECT tName, tPass FROM travelers WHERE tName = ($1)
        `, [tName]);
        
        if (dataFromDB.length === 0) {
            throw new Error('UserNotFound', {reason: 'User arent in database, check the credentials'});
            //console.log('Throw new error: UserNotFound') // Just 4 debug

        };

        const callCheckHashedPass = await checkHashedPass(tPass, dataFromDB[0].tpass);
        const matchMap = {
            true: {
                message: `User ${dataFromDB[0].tname} succesfuly signed In`,
                status: 200
            },
            false: {
                message: `signIn failed: check credentials`,
                status: 403
            }
        };
        
        result.status = parseInt(matchMap[callCheckHashedPass.success].status) ;
        result.success = callCheckHashedPass.success;
        result.message = matchMap[callCheckHashedPass.success].message;
        result.others = {
            signIn: callCheckHashedPass.success,
            user: dataFromDB[0].tname
        };

        console.log(result.message);

    } catch (err) {
        const errorStatusMap = {
            UserNotFound: {
                status: 404,
                message: `
                User Not Found in database, check if he signedUp;
                Error: ${err.message}`
            }
        };

        result.status = errorStatusMap[err.message].status || 500;
        result.success = false;
        result.message = errorStatusMap[err.message].message || `
        Internal server error in signInTravelerController, signIn func:
        Error: ${err}`;

        console.error(result.message);

    } finally {
        return result
    };
};

async function signInRouter(req, res) {
    const {tn, tp} = req.body;

    const callSignIn = await signIn(tn, tp);
    const {rows: user} = await pool.query(`
        SELECT TravelerID, AccessLevel FROM travelers WHERE tName = ($1)`
    , [tn]);

    if (callSignIn.success) {
        const sessionID = uuidv4();
        const sessionAccessLevel = user[0].accesslevel;
        const sessionUserID = user[0].travelerid;
        
        const cookie4set = {
            sessionID: sessionID,
            userID: sessionUserID,
            AccessLevel: sessionAccessLevel
        };
        req.session.cookie4set = cookie4set;
        req.session.cookie.expires = new Date(Date.now() + 259200000);
    };

    res.status(callSignIn.status).json(callSignIn);
};

export default signInRouter;