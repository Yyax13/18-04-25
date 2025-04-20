import e from "express";
import signUpTravelerRoute from "../../controllers/travelers/signUpTravelerController.js";

const r = e.Router();

r.post('/api/signUp', signUpTravelerRoute);

export default r;