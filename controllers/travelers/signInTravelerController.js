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
        result.success = false,
        result.message = `
        Internal server error in checkHashedPass():
        Error message: ${err.message},
        Error: ${err}`;
        result.others = {
            error: err
        };

        console.error(result.message);

    } finally {
        return result

    };
};

