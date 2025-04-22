import e from "express";
import signInRouter from "../../controllers/travelers/signInTravelerController.js";

const r = e.Router();

r.post('/api/signIn', signInRouter);

export default r