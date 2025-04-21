import genResult from "../../results";
import pool from "../../db";
import bcrypt from 'bcrypt';
import 'dotenv/config';

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
                message: `User ${dataFromDB[0].tName} succesfuly signed In`,
                status: 200
            },
            false: {
                message: `signIn failed: check credentials`,
                status: 403
            }
        };
        
        result.status = matchMap[callCheckHashedPass].status;
        result.success = callCheckHashedPass;
        result.message = matchMap[callCheckHashedPass].message;
        result.others = {
            signIn: callCheckHashedPass,
            user: dataFromDB[0].tName
        };

        console.log(result.message);

    } catch (err) {
        const errorStatusMap = {
            UserNotFound: {
                status: 404,
                message: `
                User Not Found in database, check if he signedUp;
                Error: ${err.message}`
            },
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
    res.status(callSignIn.status).json(callSignIn);
};

export default signInRouter;