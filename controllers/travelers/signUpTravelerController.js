import genResult from "../../results.js";
import pool from "../../db.js";
import bcrypt from 'bcrypt';
import 'dotenv/config';

async function hashPass(pass) {
    const saltRounds = parseInt(process.env.HASH_Salt);
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(pass, salt);

    return hash
};

async function signUpTraveler(tName, tPass /*TravelerName & TravelerPass*/, tMoney) {
    const result = genResult();

    try {
        const hashedPasswd = await hashPass(tPass);

        const {rows} = await pool.query(
            `INSERT INTO travelers (tName, tPass, TravelerMoney) 
             VALUES ($1, $2, $3) 
             RETURNING TravelerID, tName, TravelerMoney`, 
            [tName, hashedPasswd, tMoney]
        );
        
        result.status = 201;
        result.success = true;
        result.message = `Successfuly created traveler:
        ID: ${rows[0].travelerid},
        UserName: ${rows[0].tname}`;
        result.others = {
            TravelerID: rows[0].travelerid,
            tName: rows[0].tname
        };

        console.log(result.message);

    } catch (err) {
        result.status = 500;
        result.success = false;
        result.message = `
        Internal server error in signUpTravelerController.js (async func: signUpTraveler):
            Error message: ${err.message},
            Error: ${err}
        `;
        result.others = {
            error: err
        };

        console.error(result.message);

    } finally {
        return result
    };
};

async function signUpTravelerRoute(req, res){
    const {tn, tp, tm} = req.body

    const callSignUpTraveler = await signUpTraveler(tn, tp, tm);
    res.status(callSignUpTraveler.status).json(callSignUpTraveler);
};

export default signUpTravelerRoute;